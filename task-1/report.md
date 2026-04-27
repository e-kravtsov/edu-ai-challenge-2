# Leaderboard Clone — Report

## Approach

The goal was to replicate the Vention EDU SharePoint leaderboard as a standalone static app with all real employee data replaced by fake data, deployed to GitHub Pages.

## Tech Stack

- **React 19 + TypeScript** — scaffolded with Vite for fast dev/build
- **@fluentui/react-icons** — tree-shakeable Fluent UI icons matching the original's icon set (graduation cap, microphone, people community, star, chevrons, search)
- **Vite** — configured with `base: '/edu-ai-challenge-2/leaderboard/'` for GitHub Pages deployment
- **CSS** — single `App.css` file, no component library; styles measured from the original using Playwright browser automation

## Data Replacement

All original employee data was replaced with procedurally generated fake data:

- **Names**: 100 male + 100 female first names and 100 last names, combined with a seeded PRNG (`mulberry32`, seed 42) for reproducibility
- **Avatars**: Real-looking photos from `randomuser.me/api/portraits`, gender-matched to names (no initials or placeholder circles)
- **Roles & Departments**: Pool of 30 generic job titles and randomly generated department codes (e.g., `EN.U2.D3.G1`)
- **Activities**: Category-specific templates with `[EDU]`, `[REG]`, `[UNI]` prefixes; points weighted by category (8, 16, 32, 64); dates spanning 2024–2025
- **300 employees** generated at import time, sorted by total score

No real names, titles, department codes, or activity descriptions from the original appear in the codebase.

## Visual Matching Process

1. Navigated to the original SharePoint page using Playwright MCP browser automation
2. Extracted computed styles (colors, dimensions, padding, fonts) directly from DOM elements at multiple viewport widths
3. Took screenshots at 480px, 768px, 1280px, and 1920px for side-by-side comparison
4. Measured podium block heights, avatar sizes, filter bar layout, and row structure
5. Identified responsive breakpoints: 768px (mobile/desktop layout switch), 639px (side panel for filter dropdowns)

## Key Features

- **Filter persistence during search**: Ranks are assigned based on year/quarter/category first, then search filters visibility without changing positions
- **Responsive layout**: Podium stacks vertically on mobile, filter bar becomes column, list rows reorganize
- **Side panel filters**: At ≤639px, dropdowns are replaced with button triggers that open a slide-in panel (matching original SharePoint behavior)
- **Expandable rows**: Each leaderboard row expands to show a "Recent Activity" table with category badges, dates, and point values

## AI Tools Usage

GitHub Copilot (Claude) was used throughout as a coding assistant for:
- Planning the component architecture and data generation strategy
- Writing all source code (components, hooks, data generator, CSS)
- Browser automation via Playwright MCP to inspect the original page's DOM and computed styles
- Iterative visual comparison and CSS refinement based on screenshots
