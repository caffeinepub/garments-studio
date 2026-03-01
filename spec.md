# Specification

## Summary
**Goal:** Allow the currently authenticated user to claim admin privileges when no admin exists yet, and expose a backend function to grant admin roles.

**Planned changes:**
- Add a `claimInitialAdmin` (or `grantAdmin`) backend function in `backend/main.mo` that promotes the caller to admin if no admin exists, or restricts the call to an existing admin/canister controller otherwise.
- Add an `isCallerAdmin` backend query that returns whether the caller has admin rights.
- On the frontend Admin page, show a "Claim Admin Access" button when no admin exists and the user is authenticated, instead of the access-denied screen.
- On successful claim, refresh the admin status query so the full admin dashboard becomes visible.
- Keep the existing access-denied screen (without the claim button) when an admin already exists and the caller is not that admin.

**User-visible outcome:** An authenticated user who visits the Admin page when no admin has been assigned can click "Claim Admin Access" to immediately gain admin privileges and access the full admin dashboard.
