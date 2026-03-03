# Assets Directory

Static assets bundled by Vite. Import these in TypeScript/TSX files using the `@/assets/...` alias.

```
src/assets/
│
├── images/
│   ├── backgrounds/     # Full-page or section background images (hero, error pages, etc.)
│   │                    # Format: WebP preferred, PNG fallback. Naming: snake_case.webp
│   │
│   └── species/         # Species thumbnail images (fallbacks / placeholders if CDN is down)
│                        # Format: WebP preferred. Naming: {species-slug}.webp
│
├── icons/               # App-specific SVG icons not available in MUI icons
│                        # Import as React components: import { ReactComponent as FishIcon } from '@/assets/icons/fish.svg'
│
└── fonts/               # Custom web fonts (.woff2 preferred) if self-hosting
                         # Register in src/index.css via @font-face
```

## Usage Examples

### Image import (Vite handles hashing/optimisation automatically)
```ts
import heroBg from '@/assets/images/backgrounds/hero_bg.webp';
// <Box component="img" src={heroBg} />
// or as CSS: backgroundImage: `url(${heroBg})`
```

### SVG icon as a React component (requires vite-plugin-svgr)
```tsx
import FishIcon from '@/assets/icons/fish.svg?react';
// <FishIcon width={24} height={24} />
```

## Rules

- ❌ Do NOT store user-uploaded content here — that goes to Cloudinary / external CDN
- ❌ Do NOT put feature-specific placeholders in a shared subfolder — keep them in `features/{name}/assets/` if they are only used in one feature
- ✅ WebP is the preferred format for photos (≤ 200 KB per image)
- ✅ All SVG icons must be cleaned (no inline styles, no hardcoded fill colours)
