# Specification

## Summary
**Goal:** Fix the Male Shirts category card so it displays the correct product photo instead of the logo.

**Planned changes:**
- Save the uploaded photo of the man in the blue printed shirt as a static asset (`frontend/public/assets/generated/male-shirts-cover.jpg`)
- Update the Male Shirts category image mapping in `frontend/src/lib/utils.ts` to reference the new photo path

**User-visible outcome:** The Male Shirts category card on the homepage displays the photo of the man in the blue printed shirt instead of the logo. All other category covers remain unchanged.
