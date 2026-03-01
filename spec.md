# Specification

## Summary
**Goal:** Add a product management Admin Panel to the Dhimayu Studio app, allowing manual adding, editing, and deleting of products via a dedicated UI page backed by new CRUD functions.

**Planned changes:**
- Add `addProduct`, `updateProduct`, and `deleteProduct` public methods to the backend actor in `main.mo`, each supporting fields: id, name, category, description, price, availableSizes, stockQuantity, and imageFilename
- Add a `/admin` route in the frontend rendering an Admin Panel page
- Admin Panel lists all products in a table/card view showing name, category, price, stock, and sizes
- Include an "Add Product" form/modal with fields for name, category (dropdown: Female Dresses, Male Shirts, Male T-Shirts, Kids Apparel), description, price, available sizes, stock quantity, and image filename
- Include per-product "Edit" action that pre-fills the form with existing product data
- Include per-product "Delete" action with a confirmation prompt
- All mutations call the corresponding backend functions via React Query and invalidate the products query on success
- Form validates that required fields (name, category, price, stock) are not empty before submission
- Add an "Admin" navigation link in the Header (desktop and mobile) styled consistently with existing nav links
- Apply the existing warm neutral colour palette and typography (Cormorant Garamond / Jost) throughout the admin page

**User-visible outcome:** A user can navigate to `/admin` via a header link, view all products, and add, edit, or delete products through a form interface; changes are immediately reflected in the product list.
