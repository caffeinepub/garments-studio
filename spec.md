# Specification

## Summary
**Goal:** Fix the Admin panel being permanently stuck on the "Verifying admin access" loading state after Internet Identity authentication.

**Planned changes:**
- Add an `enabled` guard to the admin role check query in `useQueries.ts` so it only runs once the actor and identity are fully initialized
- Set a defined `staleTime` and `retry` policy on the admin role check query to prevent indefinite retrying
- Ensure the admin role check query always resolves to a boolean or throws a catchable error, never staying in `isLoading: true` indefinitely
- Update `Admin.tsx` to correctly read the settled query result and render either the admin dashboard or an "Access Denied" message based on the outcome

**User-visible outcome:** After logging in with an admin account, the Admin page fully loads and displays the admin dashboard. Non-admins see a clear "Access Denied" message. The page never hangs on "Verifying admin access" again.
