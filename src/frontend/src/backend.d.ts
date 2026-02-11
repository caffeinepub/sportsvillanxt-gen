import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface TimeSlot {
    duration: bigint;
    date: bigint;
    startHour: bigint;
}
export interface PricingRules {
    weekdayFloodlightRate: bigint;
    floodlightStartHour: bigint;
    weekendFloodlightRate: bigint;
    weekendMorningRate: bigint;
    weekdayMorningRate: bigint;
}
export interface SlotSettings {
    openingTime: bigint;
    closingTime: bigint;
    slotDuration: bigint;
}
export interface EarningsReport {
    endDate: bigint;
    totalRevenue: bigint;
    bookingCount: bigint;
    startDate: bigint;
}
export interface Booking {
    id: string;
    customerName: string;
    bookedBy: Principal;
    sport: string;
    timestamp: bigint;
    phoneNumber: string;
    price: bigint;
    timeSlot: TimeSlot;
}
export interface BlockedSlot {
    date: bigint;
    reason: string;
    startHour: bigint;
}
export interface UserProfile {
    name: string;
    phoneNumber: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addOwner(newOwner: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    blockSlot(slot: BlockedSlot): Promise<void>;
    book(timeSlot: TimeSlot, customerName: string, phoneNumber: string, sport: string): Promise<string>;
    checkAvailability(date: bigint): Promise<Array<bigint>>;
    claimNewOwnership(): Promise<void>;
    clearExplicitRoles(): Promise<void>;
    emergencyResetOwnership(authorizationKey: string): Promise<void>;
    getAllBookings(): Promise<Array<Booking>>;
    getBlockedSlots(): Promise<Array<BlockedSlot>>;
    getBooking(id: string): Promise<Booking>;
    getBookingsCount(): Promise<bigint>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getDailyEarnings(date: bigint): Promise<EarningsReport>;
    getMyBookings(): Promise<Array<Booking>>;
    getOwners(): Promise<Array<Principal>>;
    getPricingRules(): Promise<PricingRules>;
    getSlotSettings(): Promise<SlotSettings>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeeklyEarnings(startDate: bigint, endDate: bigint): Promise<EarningsReport>;
    isCallerAdmin(): Promise<boolean>;
    isOwner(): Promise<boolean>;
    isOwnershipClaimable(): Promise<boolean>;
    postMigrationClearExplicitRoles(): Promise<void>;
    removeOwner(owner: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    unblockSlot(date: bigint, startHour: bigint): Promise<void>;
    updatePricingRules(rules: PricingRules): Promise<void>;
    updateSlotSettings(settings: SlotSettings): Promise<void>;
}
