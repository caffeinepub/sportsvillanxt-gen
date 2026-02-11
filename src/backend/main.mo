import Array "mo:core/Array";
import Int "mo:core/Int";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Time "mo:core/Time";

import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  var ownershipClaimable : Bool = true;
  var currentOwner : ?Principal = null;

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    phoneNumber : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  func isCurrentOwner(caller : Principal) : Bool {
    switch (currentOwner) {
      case (?owner) { Principal.equal(caller, owner) };
      case (null) { false };
    };
  };

  func isValidAdmin(caller : Principal) : Bool {
    switch (currentOwner) {
      case (?owner) { Principal.equal(caller, owner) };
      case (null) { false };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not isValidAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public type SlotSettings = {
    openingTime : Int;
    closingTime : Int;
    slotDuration : Int;
  };

  var slotSettings : SlotSettings = {
    openingTime = 6;
    closingTime = 22;
    slotDuration = 60;
  };

  public shared ({ caller }) func updateSlotSettings(settings : SlotSettings) : async () {
    if (not isValidAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update slot settings");
    };
    slotSettings := settings;
  };

  public query func getSlotSettings() : async SlotSettings {
    slotSettings;
  };

  public type PricingRules = {
    weekdayMorningRate : Int;
    weekdayFloodlightRate : Int;
    weekendMorningRate : Int;
    weekendFloodlightRate : Int;
    floodlightStartHour : Int;
  };

  var pricingRules : PricingRules = {
    weekdayMorningRate = 300;
    weekdayFloodlightRate = 400;
    weekendMorningRate = 400;
    weekendFloodlightRate = 500;
    floodlightStartHour = 18;
  };

  public shared ({ caller }) func updatePricingRules(rules : PricingRules) : async () {
    if (not isValidAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can update pricing rules");
    };
    pricingRules := rules;
  };

  public query func getPricingRules() : async PricingRules {
    pricingRules;
  };

  public type BlockedSlot = {
    date : Int;
    startHour : Int;
    reason : Text;
  };

  let blockedSlots = Map.empty<Text, BlockedSlot>();

  func makeBlockedSlotKey(date : Int, startHour : Int) : Text {
    date.toText() # "-" # startHour.toText();
  };

  public shared ({ caller }) func blockSlot(slot : BlockedSlot) : async () {
    if (not isValidAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can block slots");
    };
    let key = makeBlockedSlotKey(slot.date, slot.startHour);
    blockedSlots.add(key, slot);
  };

  public shared ({ caller }) func unblockSlot(date : Int, startHour : Int) : async () {
    if (not isValidAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can unblock slots");
    };
    let key = makeBlockedSlotKey(date, startHour);
    blockedSlots.remove(key);
  };

  public query func getBlockedSlots() : async [BlockedSlot] {
    blockedSlots.values().toArray();
  };

  func isSlotBlocked(date : Int, startHour : Int) : Bool {
    let key = makeBlockedSlotKey(date, startHour);
    switch (blockedSlots.get(key)) {
      case (?_) { true };
      case (null) { false };
    };
  };

  public type TimeSlot = {
    date : Int;
    startHour : Int;
    duration : Int;
  };

  public type Booking = {
    id : Text;
    timeSlot : TimeSlot;
    price : Int;
    customerName : Text;
    phoneNumber : Text;
    sport : Text;
    bookedBy : Principal;
    timestamp : Int;
  };

  module Booking {
    public func compare(b1 : Booking, b2 : Booking) : Order.Order {
      Text.compare(b1.id, b2.id);
    };
  };

  let bookings = Map.empty<Text, Booking>();
  var bookingCounter : Nat = 0;

  func isValidTimeSlot(timeSlot : TimeSlot) : Bool {
    timeSlot.duration > 0 and timeSlot.startHour >= 0 and timeSlot.startHour < 24;
  };

  func isWeekend(date : Int) : Bool {
    false;
  };

  func calculatePrice(timeSlot : TimeSlot) : Int {
    let isWeekendDay = isWeekend(timeSlot.date);
    let isFloodlight = timeSlot.startHour >= pricingRules.floodlightStartHour;

    let rate = if (isWeekendDay) {
      if (isFloodlight) {
        pricingRules.weekendFloodlightRate;
      } else {
        pricingRules.weekendMorningRate;
      };
    } else {
      if (isFloodlight) {
        pricingRules.weekdayFloodlightRate;
      } else {
        pricingRules.weekdayMorningRate;
      };
    };

    let hours = timeSlot.duration / 60;
    rate * hours;
  };

  func isSlotAvailable(timeSlot : TimeSlot) : Bool {
    if (isSlotBlocked(timeSlot.date, timeSlot.startHour)) {
      return false;
    };

    for (booking in bookings.values()) {
      if (booking.timeSlot.date == timeSlot.date and booking.timeSlot.startHour == timeSlot.startHour) {
        return false;
      };
    };

    true;
  };

  public query func checkAvailability(date : Int) : async [Int] {
    var available : [Int] = [];
    var hour = slotSettings.openingTime;

    while (hour < slotSettings.closingTime) {
      let testSlot : TimeSlot = {
        date = date;
        startHour = hour;
        duration = slotSettings.slotDuration;
      };

      if (isSlotAvailable(testSlot)) {
        available := available.concat([hour]);
      };

      hour += 1;
    };

    available;
  };

  public shared ({ caller }) func book(
    timeSlot : TimeSlot,
    customerName : Text,
    phoneNumber : Text,
    sport : Text,
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can make bookings");
    };

    if (not isValidTimeSlot(timeSlot)) {
      Runtime.trap("Invalid timeslot");
    };

    if (not isSlotAvailable(timeSlot)) {
      Runtime.trap("Slot is not available");
    };

    if (sport != "Football" and sport != "Cricket") {
      Runtime.trap("Invalid sport. Must be Football or Cricket");
    };

    let price = calculatePrice(timeSlot);

    bookingCounter += 1;
    let bookingId = "BK" # bookingCounter.toText();

    let booking : Booking = {
      id = bookingId;
      timeSlot;
      price;
      customerName;
      phoneNumber;
      sport;
      bookedBy = caller;
      timestamp = Time.now();
    };

    bookings.add(bookingId, booking);
    bookingId;
  };

  public query ({ caller }) func getBooking(id : Text) : async Booking {
    switch (bookings.get(id)) {
      case (?booking) {
        if (booking.bookedBy != caller and not isValidAdmin(caller)) {
          Runtime.trap("Unauthorized: Can only view your own bookings");
        };
        booking;
      };
      case (null) { Runtime.trap("Booking not found") };
    };
  };

  public query ({ caller }) func getMyBookings() : async [Booking] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can view bookings");
    };

    let allBookings = bookings.values().toArray();
    allBookings.filter<Booking>(func(b : Booking) : Bool { b.bookedBy == caller });
  };

  public shared ({ caller }) func getAllBookings() : async [Booking] {
    if (not isValidAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view all bookings");
    };

    bookings.values().toArray().sort();
  };

  public shared ({ caller }) func getBookingsCount() : async Nat {
    if (not isValidAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view booking statistics");
    };

    bookings.size();
  };

  public type EarningsReport = {
    totalRevenue : Nat;
    bookingCount : Nat;
    startDate : Int;
    endDate : Int;
  };

  public shared ({ caller }) func getDailyEarnings(date : Int) : async EarningsReport {
    if (not isValidAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view earnings");
    };

    var totalRevenue : Int = 0;
    var count = 0;

    for (booking in bookings.values()) {
      if (isSameDay(booking.timeSlot.date, date)) {
        totalRevenue += booking.price;
        count += 1;
      };
    };

    {
      totalRevenue = totalRevenue.toNat();
      bookingCount = count;
      startDate = date;
      endDate = date;
    };
  };

  public shared ({ caller }) func getWeeklyEarnings(startDate : Int, endDate : Int) : async EarningsReport {
    if (not isValidAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can view earnings");
    };

    var totalRevenue : Int = 0;
    var count = 0;

    for (booking in bookings.values()) {
      if (booking.timeSlot.date >= startDate and booking.timeSlot.date <= endDate) {
        totalRevenue += booking.price;
        count += 1;
      };
    };

    {
      totalRevenue = totalRevenue.toNat();
      bookingCount = count;
      startDate;
      endDate;
    };
  };

  func isSameDay(date1 : Int, date2 : Int) : Bool {
    date1 == date2;
  };

  let EMERGENCY_RESET_CODE : Text = "73024141";

  public query func isOwnershipClaimable() : async Bool {
    ownershipClaimable;
  };

  public shared ({ caller }) func claimNewOwnership() : async () {
    if (not ownershipClaimable) {
      Runtime.trap("Unauthorized: Ownership cannot currently be claimed");
    };

    currentOwner := ?caller;
    ownershipClaimable := false;

    AccessControl.assignRole(accessControlState, caller, caller, #admin);
  };

  public shared ({ caller }) func emergencyResetOwnership(authorizationKey : Text) : async () {
    if (authorizationKey != EMERGENCY_RESET_CODE) {
      Runtime.trap("Unauthorized: Invalid emergency reset code");
    };

    currentOwner := null;
    ownershipClaimable := true;
  };

  public shared ({ caller }) func clearExplicitRoles() : async () {
    if (not isValidAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can clear explicit roles");
    };
  };

  public shared ({ caller }) func postMigrationClearExplicitRoles() : async () {
    if (not isValidAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can perform post-migration role clearing");
    };
  };
};
