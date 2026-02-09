# Specification

## Summary
**Goal:** Prevent ownership reset races by adding an atomic backend reset-and-claim operation and exposing it as a one-step action on the Admin Login page.

**Planned changes:**
- Backend: Add a new single update-call API that validates an emergency reset code, resets ownership to claimable, immediately claims ownership for the current caller, and returns success.
- Backend: Ensure invalid reset codes trap with a clear English error message and that successful reset-and-claim updates ownership/admin state so isOwnershipClaimable() becomes false and admin checks recognize the caller.
- Frontend: Update `/admin-login` to show a primary “Reset and Claim Ownership” action for authenticated non-admin users that uses the entered reset code.
- Frontend: On success, show an English success message, navigate to `returnTo` (if present) or `/admin`, and invalidate/refetch relevant React Query admin/ownership caches; on failure, show an English error message.

**User-visible outcome:** An authenticated non-admin user can enter the emergency reset code and, in one click, reliably reset and claim admin ownership without another user claiming it first, then be redirected to the Admin Dashboard.
