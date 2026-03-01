# Specification

## Summary
**Goal:** Fix product image upload so that images are correctly saved to the backend and displayed across the app.

**Planned changes:**
- Add an `image` field (Text) to the backend Product type and update addProduct, updateProduct, and getProduct functions to handle it, with safe defaults for existing products
- Fix the Admin page product form to include the base64-encoded image string in the payload sent to addProduct and updateProduct backend calls
- Ensure the edit dialog pre-populates the image preview when a product already has a saved image
- Update ProductCard, ProductDetail, and Catalog components to display the stored product image when available, falling back to a placeholder when none is present

**User-visible outcome:** Admins can upload a product image, save it without errors, and see the image persist in the product list, product detail page, and edit dialog. Products without images continue to show a placeholder.
