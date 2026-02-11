# Card Styling Guide - Kebele Zero

This document provides comprehensive styling guidelines for replicating the retro card design system used throughout the Kebele Zero application.

## Overview

The design system uses a **retro/brutalist aesthetic** with:
- Bold borders (2px-4px)
- Hard shadows (no blur)
- Vibrant gradients
- Comic-style typography
- High contrast colors

---

## Base Card Structure

### Standard Card
```jsx
<div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
  {/* Content */}
</div>
```

**Key Properties:**
- `bg-white` - White background
- `border-4 border-black` - 4px solid black border
- `shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]` - Hard shadow (no blur)

### Compact Card
```jsx
<div className="bg-gray-50 border-2 border-black">
  {/* Content */}
</div>
```

---

## Card Header (Gradient Bar)

### Full-width Header
```jsx
<div className="flex items-center justify-center px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600">
  {/* Header content */}
</div>
```

### Gradient Color Combinations
| Gradient | From | To |
|----------|------|-----|
| Emerald | `from-emerald-600` | `to-teal-600` |
| Sky/Blue | `from-sky-500` | `to-blue-500` |
| Teal/Emerald | `from-teal-500` | `to-emerald-500` |
| Amber/Yellow | `from-amber-600` | `to-yellow-600` |
| Purple/Pink | `from-purple-600` | `to-pink-600` |
| Orange/Red | `from-orange-500` | `to-red-500` |
| Pink/Rose | `from-pink-600` | `to-rose-600` |
| Blue/Indigo | `from-blue-600` | `to-indigo-600` |

### Header Icon Container
```jsx
<div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center">
  <Icon className="w-5 h-5 text-black" />
</div>
```

---

## Typography

### Primary Font (Comic Sans MS)
All headings and body text should use Comic Sans MS for consistency:
```css
font-family: 'Comic Sans MS', cursive, sans-serif;
text-transform: uppercase;
letter-spacing: 0.05em;
```

### Heading Styles
```jsx
// Page/hero titles
<h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight uppercase tracking-tight" />

// Section headers
<h2 className="text-xl font-black uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }} />

// Card titles
<h3 className="font-black text-gray-800 text-lg uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }} />

// Card subtitles/roles
<h4 className="font-bold text-emerald-600 text-base uppercase tracking-wide" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }} />
```

### Body Text Styles
```jsx
// Regular body text
<p className="font-medium text-gray-700 text-base leading-relaxed" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }} />

// Secondary/descriptive text
<p className="font-medium text-gray-600 text-sm opacity-90" style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }} />

// Labels and captions
<span className="text-sm font-bold text-gray-800 uppercase tracking-wide" />
```

### Label/Tag Styles
```jsx
<span className="text-sm font-black text-white uppercase tracking-wide" />
<span className="text-xs font-black text-white uppercase tracking-wide" />
```

> **Important:** Text shadow (drop-shadow, retro-title, retro-text classes) has been removed. All text should be clean without shadows for better readability.

---

## Buttons

### Retro Button (Primary)
```jsx
<button className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2">
  <Icon className="w-4 h-4 inline mr-1" />
  <span>LABEL</span>
</button>
```

**CSS Classes:**
```css
.retro-btn {
  @apply bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] 
         hover:bg-gray-100 active:translate-x-[1px] active:translate-y-[1px] 
         active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all;
}
```

### Button Variants
| Variant | Classes |
|---------|---------|
| Emerald | `bg-emerald-500 border-emerald-600` |
| Red | `bg-red-500 border-red-600` |
| Mustard | `bg-mustard border-charcoal` |
| Sky-blue | `bg-sky-blue` |

### Icon Button (Social Media)
```jsx
<a 
  href={url} 
  className="w-10 h-10 rounded-lg flex items-center justify-center border-2 border-black transition-transform hover:scale-110 bg-[#1877F2]"
>
  <Facebook className="w-5 h-5 text-white" />
</a>
```

---

## Input Fields

### Standard Input
```jsx
<input 
  type="text"
  className="retro-input w-full"
  placeholder="Placeholder text"
/>
```

**CSS Classes:**
```css
.retro-input {
  @apply w-full px-4 py-3 bg-gray-50 border-2 border-gray-300 
         focus:border-emerald-500 focus:outline-none transition-all font-medium
         placeholder-gray-400;
}
```

### Textarea
```jsx
<textarea 
  rows={4}
  className="retro-input w-full resize-none"
/>
```

---

## Shadows

### Card Shadow (4px)
```css
shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
```

### Button Shadow (2px)
```css
shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
```

### Small Shadow
```css
shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
```

### Image Shadow
```css
shadow-2xl
```

### Floating Animation
```css
.retro-floating {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
}
```

---

## Colors

### Primary Colors
| Color | Hex | Usage |
|-------|-----|-------|
| Black | `#000000` | Borders, text |
| White | `#FFFFFF` | Backgrounds |
| Emerald | `#10B981` | Success, primary actions |
| Sky Blue | `#0EA5E9` | Links, accents |
| Mustard | `#F59E0B` | Highlights, warnings |
| Charcoal | `#1F2937` | Text (secondary) |

### Gradient Combinations
```css
/* Emerald Gradient */
bg-gradient-to-r from-emerald-600 to-teal-600

/* Sky/Blue Gradient */
bg-gradient-to-r from-sky-500 to-blue-500

/* Teal/Emerald Gradient */
bg-gradient-to-r from-teal-500 to-emerald-500

/* Amber/Yellow Gradient */
bg-gradient-to-r from-amber-600 to-yellow-600

/* Purple/Pink Gradient */
bg-gradient-to-r from-purple-600 to-pink-600

/* Orange/Red Gradient */
bg-gradient-to-r from-orange-500 to-red-500
```

---

## Social Media Buttons

### Social Icon Component
```jsx
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Github, Globe2, ExternalLink } from 'lucide-react';

const getSocialIcon = (platform) => {
  switch (platform.toLowerCase()) {
    case 'facebook': return <Facebook className="w-5 h-5 text-white" />;
    case 'twitter': return <Twitter className="w-5 h-5 text-white" />;
    case 'instagram': return <Instagram className="w-5 h-5 text-white" />;
    case 'youtube': return <Youtube className="w-5 h-5 text-white" />;
    case 'linkedin': return <Linkedin className="w-5 h-5 text-white" />;
    case 'github': return <Github className="w-5 h-5 text-white" />;
    case 'website': return <Globe2 className="w-5 h-5 text-white" />;
    default: return <ExternalLink className="w-5 h-5 text-white" />;
  }
};

const getSocialIconColor = (platform) => {
  switch (platform.toLowerCase()) {
    case 'facebook': return 'bg-[#1877F2] hover:bg-[#166FE5]';
    case 'twitter': return 'bg-[#1DA1F2] hover:bg-[#1A91DA]';
    case 'instagram': return 'bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-90';
    case 'youtube': return 'bg-[#FF0000] hover:bg-[#CC0000]';
    case 'linkedin': return 'bg-[#0A66C2] hover:bg-[#004182]';
    case 'github': return 'bg-[#333333] hover:bg-[#24292F]';
    case 'website': return 'bg-emerald-500 hover:bg-emerald-600';
    default: return 'bg-gray-500 hover:bg-gray-600';
  }
};

// Usage
<a 
  href={url} 
  className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 border-black transition-transform hover:scale-110 ${getSocialIconColor(platform)}`}
>
  {getSocialIcon(platform)}
</a>
```

### Social Platform Colors
| Platform | Background Color | Hover Color |
|----------|-----------------|-------------|
| Facebook | `#1877F2` | `#166FE5` |
| Twitter/X | `#1DA1F2` | `#1A91DA` |
| Instagram | `gradient` | `opacity-90` |
| YouTube | `#FF0000` | `#CC0000` |
| LinkedIn | `#0A66C2` | `#004182` |
| GitHub | `#333333` | `#24292F` |
| Website | `emerald-500` | `emerald-600` |

---

## Icons

### Icon Sizes
| Size | Class | Pixels |
|------|-------|--------|
| Small | `w-4 h-4` | 16px |
| Medium | `w-5 h-5` | 20px |
| Large | `w-6 h-6` | 24px |
| XL | `w-10 h-10` | 40px |

### Icon Usage
```jsx
import { IconName } from 'lucide-react';

<IconName className="w-5 h-5 text-white" />
<IconName className="w-4 h-4 text-charcoal retro-icon" />
```

---

## Image Styling

### Hero Image with Border
```jsx
<img 
  src={url}
  alt={alt}
  className="w-full max-w-md h-64 object-cover rounded-lg border-4 border-white shadow-2xl retro-floating"
/>
```

### Team Member Avatar
```jsx
<img 
  src={image_url || fallback}
  alt={name}
  className="w-12 h-12 rounded-full object-cover border-2 border-black"
/>
```

### Image Caption Badge
```jsx
<div className="absolute -bottom-4 -right-4 bg-mustard text-charcoal px-4 py-2 rounded-lg border-2 border-charcoal retro-title text-sm font-bold">
  Caption
</div>
```

---

## Spacing

### Section Spacing
| Spacing | Class | Usage |
|---------|-------|-------|
| Small | `gap-4` | Related items |
| Medium | `gap-6` | Cards in grid |
| Large | `gap-8` | Major sections |
| XL | `gap-10` | Hero sections |
| 2XL | `gap-12` | Page sections |

### Padding
| Padding | Class | Usage |
|---------|-------|-------|
| Compact | `p-4` | Small cards |
| Standard | `p-6` | Medium cards |
| Large | `p-8` | Hero sections |
| Section | `py-8` | Vertical padding |

---

## Layout Patterns

### Two Column Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-12">
  {/* Left content */}
  {/* Right content */}
</div>
```

### Four Column Grid
```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
  {/* Cards */}
</div>
```

### Centered Content
```jsx
<div className="flex items-center justify-center">
  {/* Content */}
</div>
```

### Flex Row with Space Between
```jsx
<div className="flex items-center justify-between">
  {/* Left */}
  {/* Right */}
</div>
```

### Flex Row with Gap
```jsx
<div className="flex items-center space-x-3">
  {/* Items */}
</div>
```

---

## Loading States

### Spinner
```jsx
<div className="flex items-center justify-center p-8">
  <div className="w-10 h-10 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin"></div>
</div>
```

---

## Responsive Design

### Breakpoints
| Breakpoint | Prefix | Min Width |
|------------|--------|-----------|
| Mobile | `sm:` | 640px |
| Tablet | `md:` | 768px |
| Desktop | `lg:` | 1024px |
| XL | `xl:` | 1280px |
| 2XL | `2xl:` | 1536px |

### Responsive Typography
```jsx
<h1 className="text-3xl md:text-4xl lg:text-5xl" />
<p className="text-lg md:text-xl" />
```

---

## Hover Effects

### Button Hover
```css
.retro-hover:hover {
  @apply bg-gray-100;
}
```

### Link Hover
```css
.hover:text-primary {
  @apply text-emerald-500;
}
```

### Scale Effect
```css
transform: scale(1.05);
transition: transform 0.2s ease;
```

---

## Copy-Paste Templates

### Complete Card Template
```jsx
<div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
  <div className="flex items-center justify-center px-4 py-3 border-b-4 border-black bg-gradient-to-r from-emerald-600 to-teal-600">
    <div className="flex items-center space-x-3">
      <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center border-2 border-black">
        <span className="text-black font-bold text-xs retro-title">K</span>
      </div>
      <span className="text-sm font-black text-white uppercase tracking-wide" 
            style={{ fontFamily: "'Comic Sans MS', cursive, sans-serif" }}>
        HEADER TITLE
      </span>
    </div>
  </div>
  <div className="p-6">
    {/* Content */}
  </div>
</div>
```

### Button Template
```jsx
<button 
  onClick={handleClick}
  className="retro-btn px-3 py-2 font-medium text-xs flex items-center space-x-2 retro-hover"
>
  <IconName className="w-4 h-4 inline mr-1" />
  <span>LABEL</span>
</button>
```

### Input Template
```jsx
<div className="space-y-2">
  <label className="block text-sm font-bold text-gray-800 uppercase tracking-wide">
    Label
  </label>
  <input
    type="text"
    className="retro-input w-full"
    value={value}
    onChange={(e) => setValue(e.target.value)}
    placeholder="Placeholder"
  />
</div>
```

---

## Tailwind Configuration

### Custom Colors (tailwind.config.js)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        'charcoal': '#1F2937',
        'mustard': '#F59E0B',
        'sky-blue': '#0EA5E9',
      },
      fontFamily: {
        'retro': ['Comic Sans MS', 'cursive', 'sans-serif'],
      },
      boxShadow: {
        'retro': '4px 4px 0px 0px rgba(0,0,0,1)',
      },
    },
  },
}
```

---

## File References

- Main styles: `src/style/main.css`
- Tailwind config: `tailwind.config.js`
- About page: `src/pages/AboutKebele.tsx`
- Modal component: `src/components/Modal.tsx`
