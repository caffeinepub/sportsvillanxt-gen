# Specification

## Summary
**Goal:** Set the backend emergency ownership reset authorization code to `73024141`.

**Planned changes:**
- Update the constant in `backend/main.mo` used by `emergencyResetOwnership` to require the reset code `73024141`.
- Ensure `emergencyResetOwnership("73024141")` resets ownership state (sets `currentOwner` to `null` and `ownershipClaimable` to `true`) and any other code traps with `Unauthorized: Invalid emergency reset code`.

**User-visible outcome:** Users can successfully trigger an emergency ownership reset only when providing the reset code `73024141`; all other codes continue to be rejected.
