# Specification

## Summary
**Goal:** Enable dual-owner admin access by supporting up to two admin owner Principals, with backend authorization and UI management.

**Planned changes:**
- Update backend ownership storage from a single owner to a list/set of 0–2 owner Principals, and authorize all admin-protected backend methods for either owner.
- Add backend methods to list current owners, add a second owner (owners-only; enforce max of 2; reject duplicates), and remove an owner (owners-only; prevent removing the last remaining owner unless using emergency reset).
- Update claim and emergency reset flows so claim sets the first owner when claimable, and emergencyResetOwnership clears all owners and returns the system to a claimable state (keeping the existing emergency reset code check).
- Add an Admin Dashboard > Settings section to view current owners, add a second owner Principal, and remove an owner, with clear English success/error messaging and existing admin-only route protection.
- Update admin login / access-restriction UI copy to remove single-owner wording and any hardcoded owner email, replacing with generic dual-owner-appropriate English text.

**User-visible outcome:** Admin owners can manage up to two admin owner accounts (view/add/remove) from the Admin Dashboard, and either configured owner can access all admin-only functionality; non-owners remain blocked with clear errors and updated access-restriction messaging.
