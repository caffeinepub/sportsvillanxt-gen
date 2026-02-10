# Specification

## Summary
**Goal:** Add an Emergency Ownership Reset action in the Admin Dashboard settings and ensure admin-only backend access is revoked after a reset until ownership is claimed again.

**Planned changes:**
- Add an "Emergency Ownership Reset" section/card to Admin Dashboard > Settings with an "Emergency Reset Code" input and a "Reset Ownership" button.
- Wire the button to the existing React Query mutation that calls the backend emergency reset API; show an English success message on success and an English error message on failure.
- Update backend admin authorization logic so that when `currentOwner` is null (post-reset), historical/legacy admin roles do not grant admin-only access.
- Ensure the existing claim-new-ownership flow still works after reset and re-establishes the caller as the sole admin owner.

**User-visible outcome:** Admins can trigger an emergency ownership reset from the Settings tab using a reset code; after a reset, prior admins lose admin access until someone claims ownership again.
