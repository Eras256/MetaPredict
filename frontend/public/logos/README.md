# Logos Directory

This directory contains logo files for the MetaPredict project.

## Supported Formats
- SVG (recommended for scalability)
- PNG (with transparent background)
- WebP (for optimized web delivery)

## File Naming Convention
- `logo.svg` - Main logo (SVG format)
- `logo.png` - Main logo (PNG format)
- `logo-dark.svg` - Dark theme variant
- `logo-light.svg` - Light theme variant
- `favicon.ico` - Favicon for browsers
- `icon-*.png` - Various icon sizes (if needed)

## Usage in Code
```tsx
// Example: Using the logo in a Next.js component
import Image from 'next/image';

<Image 
  src="/logos/logo.svg" 
  alt="MetaPredict Logo" 
  width={200} 
  height={50}
/>
```

