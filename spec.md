# Specification

## Summary
**Goal:** Fix the Admin menu item in the UserDropdown so it reliably appears for authenticated admin users.

**Planned changes:**
- Audit and fix the backend admin check endpoint/method to ensure it correctly identifies admin callers
- Fix the `useIsCallerAdmin()` hook to use the authenticated actor (not the anonymous actor) when querying the backend
- Fix React Query cache key and stale/refetch behavior so the admin status updates immediately after login
- Fix the conditional rendering logic in UserDropdown to correctly gate the Admin link on the hook's return value

**User-visible outcome:** After logging in with an admin Internet Identity, the "Admin" menu item appears in the UserDropdown immediately without requiring a page refresh. Non-admin and unauthenticated users do not see the Admin menu item.
