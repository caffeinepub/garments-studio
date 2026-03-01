# Specification

## Summary
**Goal:** Replace the current logo in Header and Footer with a transparent version of the uploaded "logo black.png" image.

**Planned changes:**
- Save the edited transparent logo as `dhimayu-logo-black.dim_400x400.png` in the assets folder
- Update `Header.tsx` to use `dhimayu-logo-black.dim_400x400.png` instead of the previous logo
- Update `Footer.tsx` to use `dhimayu-logo-black.dim_400x400.png` instead of the previous logo
- Remove any background box, card, or `bg-*` Tailwind class applied behind the logo element in both components

**User-visible outcome:** The header and footer display the new yin-yang Dhimayu logo with no background box, blending seamlessly with their backgrounds, with the yin-yang shape, both dots, and "Dhi"/"MayU" text clearly visible.
