import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { SlotSettings, PricingRules, BlockedSlot, Booking, EarningsReport, UserProfile } from '../backend';

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
        // Use backendResetAndClaimOwnership for initial claim when ownership is claimable
        await actor.backendResetAndClaimOwnership();
      } catch (error: any) {
        // Extract clean error message from backend trap
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('Ownership has already been claimed')) {
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
    },
  });
}

export function useResetAndClaimOwnership() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        await actor.backendResetAndClaimOwnership();
      } catch (error: any) {
        // Extract clean error message from backend trap
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('Unauthorized')) {
          throw new Error('You must be an admin to reset and claim ownership');
        }
        throw new Error('Failed to reset and claim ownership. Please try again.');
      }
    },
    onSuccess: () => {
      // Invalidate admin status and ownership claimable to reflect new ownership
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['ownershipClaimable'] });
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
        // Extract clean error message from backend trap
        const errorMessage = error.message || String(error);
        if (errorMessage.includes('Invalid emergency reset code')) {
          throw new Error('Invalid reset code. Please check and try again.');
        } else if (errorMessage.includes('Unauthorized')) {
          throw new Error('Invalid reset code');
        }
        throw new Error('Failed to reset ownership. Please try again.');
      }
    },
    onSuccess: () => {
      // Invalidate both admin status and ownership claimable queries
      queryClient.invalidateQueries({ queryKey: ['isCallerAdmin'] });
      queryClient.invalidateQueries({ queryKey: ['ownershipClaimable'] });
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
