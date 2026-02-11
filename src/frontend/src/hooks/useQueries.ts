import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SlotSettings, PricingRules, BlockedSlot, Booking, EarningsReport, UserProfile } from '../backend';
import { Principal } from '@dfinity/principal';

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

// Authorization Queries
export function useIsCallerAdmin() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isCallerAdmin'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Ownership Queries
export function useIsOwnershipClaimable() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['ownershipClaimable'],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isOwnershipClaimable();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useClaimOwnership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        // Use claimNewOwnership for initial claim when ownership is claimable
        await actor.claimNewOwnership();
      } catch (error: any) {
        // Extract clean error message from backend trap
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('Ownership cannot currently be claimed')) {
          throw new Error('Ownership has already been claimed by another user');
        } else if (errorMessage.includes('Unauthorized')) {
          throw new Error('Ownership has already been claimed');
        }
        throw new Error('Failed to claim ownership. Please try again.');
      }
    },
    onSuccess: () => {
      // Invalidate admin status and ownership claimable to reflect new ownership
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['ownershipClaimable'] });
      queryClient.invalidateQueries({ queryKey: ['owners'] });
    },
  });
}

export function useResetAndClaimOwnership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resetCode: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        // First, reset ownership with the code
        await actor.emergencyResetOwnership(resetCode);
        // Then claim the now-available ownership
        await actor.claimNewOwnership();
      } catch (error: any) {
        // Extract clean error message from backend trap
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('Invalid emergency reset code') || errorMessage.includes('Unauthorized')) {
          throw new Error('Invalid reset code. Please check and try again.');
        }
        throw new Error('Failed to reset and claim ownership. Please try again.');
      }
    },
    onSuccess: () => {
      // Invalidate admin status and ownership claimable to reflect new ownership
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['ownershipClaimable'] });
      queryClient.invalidateQueries({ queryKey: ['owners'] });
    },
  });
}

export function useEmergencyResetOwnership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (resetCode: string) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.emergencyResetOwnership(resetCode);
      } catch (error: any) {
        // Normalize backend trap errors to consistent English messages
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('Invalid emergency reset code') || errorMessage.includes('Unauthorized')) {
          throw new Error('Invalid reset code. Please check and try again.');
        }
        throw new Error('Failed to reset ownership. Please try again.');
      }
    },
    onSuccess: () => {
      // Invalidate both admin status and ownership claimable queries
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['ownershipClaimable'] });
      queryClient.invalidateQueries({ queryKey: ['owners'] });
    },
  });
}

// Owner Management Queries
export function useGetOwners() {
  const { actor, isFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['owners'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getOwners();
      } catch (error: any) {
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('Only admins can view the list of owners');
        }
        throw new Error('Failed to fetch owners');
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAddOwner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newOwner: Principal) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.addOwner(newOwner);
      } catch (error: any) {
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('Maximum of 2 owners allowed')) {
          throw new Error('Cannot add owner: Maximum of 2 owners allowed');
        } else if (errorMessage.includes('already an owner')) {
          throw new Error('This principal is already an owner');
        } else if (errorMessage.includes('Unauthorized')) {
          throw new Error('Only existing owners can add new owners');
        }
        throw new Error('Failed to add owner. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
    },
  });
}

export function useRemoveOwner() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (owner: Principal) => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.removeOwner(owner);
      } catch (error: any) {
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('Cannot remove yourself as the last remaining owner')) {
          throw new Error('Cannot remove the last remaining owner');
        } else if (errorMessage.includes('not an owner')) {
          throw new Error('This principal is not an owner');
        } else if (errorMessage.includes('Unauthorized')) {
          throw new Error('Only admins can remove owners');
        }
        throw new Error('Failed to remove owner. Please try again.');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owners'] });
    },
  });
}

// Slot Settings Queries
export function useGetSlotSettings() {
  const { actor, isFetching } = useActor();

  return useQuery<SlotSettings>({
    queryKey: ['slotSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getSlotSettings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdateSlotSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: SlotSettings) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateSlotSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['slotSettings'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

// Pricing Rules Queries
export function useGetPricingRules() {
  const { actor, isFetching } = useActor();

  return useQuery<PricingRules>({
    queryKey: ['pricingRules'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPricingRules();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useUpdatePricingRules() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (rules: PricingRules) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updatePricingRules(rules);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricingRules'] });
    },
  });
}

// Blocked Slots Queries
export function useGetBlockedSlots() {
  const { actor, isFetching } = useActor();

  return useQuery<BlockedSlot[]>({
    queryKey: ['blockedSlots'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBlockedSlots();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useBlockSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (slot: BlockedSlot) => {
      if (!actor) throw new Error('Actor not available');
      return actor.blockSlot(slot);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedSlots'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

export function useUnblockSlot() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, startHour }: { date: bigint; startHour: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unblockSlot(date, startHour);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blockedSlots'] });
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
  });
}

// Availability Queries
export function useCheckAvailability(date: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ['availability', date?.toString() ?? 'none'],
    queryFn: async () => {
      if (!actor || !date) throw new Error('Actor or date not available');
      return actor.checkAvailability(date);
    },
    enabled: !!actor && !isFetching && date !== null,
  });
}

// Booking Queries
export function useCreateBooking() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      timeSlot,
      customerName,
      phoneNumber,
      sport,
    }: {
      timeSlot: { date: bigint; startHour: bigint; duration: bigint };
      customerName: string;
      phoneNumber: string;
      sport: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.book(timeSlot, customerName, phoneNumber, sport);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['availability'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
    },
  });
}

export function useGetBooking(id: string) {
  const { actor, isFetching } = useActor();

  return useQuery<Booking>({
    queryKey: ['booking', id],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getBooking(id);
    },
    enabled: !!actor && !isFetching && !!id,
  });
}

export function useGetMyBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['myBookings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMyBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetAllBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['allBookings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

// Earnings Queries
export function useGetDailyEarnings(date: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<EarningsReport>({
    queryKey: ['dailyEarnings', date.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDailyEarnings(date);
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetWeeklyEarnings(startDate: bigint, endDate: bigint) {
  const { actor, isFetching } = useActor();

  return useQuery<EarningsReport>({
    queryKey: ['weeklyEarnings', startDate.toString(), endDate.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWeeklyEarnings(startDate, endDate);
    },
    enabled: !!actor && !isFetching,
  });
}
