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
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
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
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
    },
  });
}

// Availability Queries
export function useCheckAvailability(date: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<bigint[]>({
    queryKey: ['availability', date?.toString()],
    queryFn: async () => {
      if (!actor || !date) return [];
      return actor.checkAvailability(date);
    },
    enabled: !!actor && !isFetching && date !== null,
    refetchInterval: 30000, // Refetch every 30 seconds
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
      queryClient.invalidateQueries({ queryKey: ['allBookings'] });
      queryClient.invalidateQueries({ queryKey: ['myBookings'] });
      queryClient.invalidateQueries({ queryKey: ['earnings'] });
    },
  });
}

export function useGetBooking(bookingId: string | null) {
  const { actor, isFetching } = useActor();

  return useQuery<Booking>({
    queryKey: ['booking', bookingId],
    queryFn: async () => {
      if (!actor || !bookingId) throw new Error('Booking ID required');
      return actor.getBooking(bookingId);
    },
    enabled: !!actor && !isFetching && !!bookingId,
    retry: false,
  });
}

export function useGetMyBookings() {
  const { actor, isFetching } = useActor();

  return useQuery<Booking[]>({
    queryKey: ['myBookings'],
    queryFn: async () => {
      if (!actor) return [];
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
      if (!actor) return [];
      return actor.getAllBookings();
    },
    enabled: !!actor && !isFetching,
  });
}

// Earnings Queries
export function useGetDailyEarnings(date: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<EarningsReport>({
    queryKey: ['earnings', 'daily', date?.toString()],
    queryFn: async () => {
      if (!actor || !date) throw new Error('Date required');
      return actor.getDailyEarnings(date);
    },
    enabled: !!actor && !isFetching && date !== null,
  });
}

export function useGetWeeklyEarnings(startDate: bigint | null, endDate: bigint | null) {
  const { actor, isFetching } = useActor();

  return useQuery<EarningsReport>({
    queryKey: ['earnings', 'weekly', startDate?.toString(), endDate?.toString()],
    queryFn: async () => {
      if (!actor || !startDate || !endDate) throw new Error('Date range required');
      return actor.getWeeklyEarnings(startDate, endDate);
    },
    enabled: !!actor && !isFetching && startDate !== null && endDate !== null,
  });
}
