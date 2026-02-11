# Specification

## Summary
**Goal:** Publish the latest build so it is accessible to end users, and enforce the emergency ownership reset code (73024141) in both backend and admin UI.

**Planned changes:**
- Rebuild and deploy the current version to resolve the prior “draft app expired” publish issue.
- Backend: set the emergency ownership reset authorization code to exactly `73024141`, and trap with an invalid/unauthorized reset code error for any other value.
- Frontend (admin UI): add/confirm an Emergency Ownership Reset flow that requires a non-empty code, calls `emergencyResetOwnership(code)`, and shows clear English success/error messages (including a specific invalid-code message).

**User-visible outcome:** The app is published and loads successfully; admins can enter an emergency reset code to reset ownership—wrong codes show a clear error, and `73024141` successfully resets ownership to a claimable state.
