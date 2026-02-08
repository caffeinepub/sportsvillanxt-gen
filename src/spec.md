# Specification

## Summary
**Goal:** Build the SportsVilla NXT GEN turf management web app with two experiences (Admin dashboard + Customer booking), owner-only Admin access via Internet Identity, slot/pricing configuration, booking/blocked-slot management, and a dark sporty UI theme with neon green accents.

**Planned changes:**
- Create two primary sections (Admin Dashboard and Customer Booking) with clear navigation and routes between them.
- Add Internet Identity authentication and owner allowlist access control; block non-owners from Admin pages and enforce owner-only Admin operations in the backend.
- Implement Admin slot settings (opening time, closing time, slot duration) persisted in the Motoko backend and used to generate daily slots.
- Implement Admin pricing rules (weekday vs weekend; morning vs night/floodlight split) with backend price computation for any date/time slot.
- Build an Admin booking calendar/day schedule showing slot statuses (Available / Booked / Blocked) and updating after changes without full reload.
- Add Admin manual blocking of one or multiple contiguous slots with optional note/reason; ensure blocked slots are unavailable to customers.
- Implement Customer availability check by date, sourced from backend (reflecting bookings + blocked slots + slot settings).
- Implement Customer booking flow: select slot, enter Name/Phone/Sport (Football/Cricket), see computed price, submit booking; backend validates availability to prevent double-booking.
- Add a payment placeholder step (UPI/Gateway “coming soon”) that does not call real payment APIs and allows proceeding to confirmation.
- Generate and display a digital receipt/confirmation with a unique booking ID and booking details; allow revisiting receipt by booking ID (or direct route if available).
- Implement Admin earnings tracker showing daily and weekly revenue totals based on persisted bookings, with basic date/week filtering.
- Apply a coherent modern sporty theme (dark mode + neon green accents) across Admin and Customer UIs; include generated brand assets (logo in header/navbar, favicon) and a subtle background pattern as static frontend assets.

**User-visible outcome:** Users can switch between a Customer booking interface (check availability, book a slot, view price, see payment placeholder, receive a receipt with booking ID) and an owner-only Admin dashboard (configure slots/pricing, view calendar statuses, block slots, and track earnings) in a consistent dark sporty UI.
