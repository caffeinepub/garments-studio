# Specification

## Summary
**Goal:** Display all prices across the frontend using Indian Rupees (₹) instead of any other currency symbol.

**Planned changes:**
- Update the `formatPrice` (or equivalent) utility in `frontend/src/lib/utils.ts` to use the `₹` symbol with Indian number formatting (`en-IN` locale / `INR` currency)
- This change cascades to all components that use the price formatter: ProductCard, Product Detail page, Cart page, Checkout page, and Admin Panel

**User-visible outcome:** Every price shown in the app (product listings, product detail, cart, checkout, admin panel) will display in Indian Rupees (e.g. ₹1,499) with no `$` or other currency symbols visible anywhere.
