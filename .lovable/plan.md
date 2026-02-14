

# Header Logo & Sidebar Fixes

## 1. Revert Header Logo to Logo+Name (`src/components/layout/Header.tsx`)
- Change the import back to `ancientika_logo_and_name_horizontal_2.png` (the horizontal logo with brand name)
- Apply a CSS filter to tint it brown: `sepia brightness-[0.7] hue-rotate-[350deg]` -- this converts the existing logo to a warm mocha brown tone without needing a separate asset
- Note: If the original horizontal logo is already dark/black, a simpler approach using `brightness-0` + `sepia` + tuned values will achieve the brown color

## 2. Revert Hamburger Icon Size (`src/components/layout/Header.tsx`)
- Change icon back from `h-4 w-4` to `h-5 w-5`
- Change button padding back from `p-1.5` to `p-2`

## 3. Make Sidebar Popup More Subtle (`src/components/layout/Header.tsx`)
- Reduce the Sheet width from `w-72` (288px) to `w-56` (224px) so it takes up less screen real estate on mobile
- This keeps the menu functional but less intrusive

## Technical Details

### `src/components/layout/Header.tsx`
- Line 5: `import horizontalLogo from "@/assets/ancientika_logo_and_name_horizontal_2.png"`
- Line 29-30: Revert to `p-2` and `h-5 w-5`
- Line 33: Change `w-72` to `w-56`
- Line 67: Add brown tint filter to img: `className="h-8 sepia brightness-[0.7]"`

