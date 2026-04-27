# Plan: Company Leaderboard Clone

## TL;DR
Replicate the Vention EDU leaderboard as a React static app with all real data replaced by fake data, deployed to GitHub Pages. The app features a top-3 podium, searchable ranked list with expandable activity details, and filters by year/quarter/category.

## Architecture

**Tech Stack**: React (Vite) → static build → GitHub Pages  
**Data**: Procedurally generated ~300 fake employees with activities at build time, embedded as JSON  
**Avatars**: DiceBear Avatars API (initials-style or similar, no real photos)

## UI Components (from original HTML analysis)

1. **Header** — Title "Leaderboard", subtitle "Top performers based on contributions and activity"
2. **FilterBar** — 3 dropdowns + search:
   - Year: All Years, 2024, 2025
   - Quarter: All Quarters, Q1, Q2, Q3, Q4
   - Category: All Categories, Education, Public Speaking, University Partnership
   - Search: text input "Search employee..."
3. **Podium** — Top 3 in 2nd|1st|3rd layout:
   - Circular avatars (1st: 112px, 2nd/3rd: 80px), rank badge overlay (1st: 40px, 2nd/3rd: 32px)
   - Name, role (with dept code), score with star icon
   - Gold/silver/bronze colored podium blocks
4. **LeaderboardList** — Ranked rows:
   - Rank, avatar, name, role+dept, category stat icons (Education/Presentation/etc) with counts, TOTAL score, expand button
5. **Expanded Row Detail** — "RECENT ACTIVITY" table:
   - Columns: Activity | Category (badge) | Date (DD-Mon-YYYY) | Points (+N)
   - Activities prefixed with [EDU], [REG], etc.

## Filter Logic
- Year/Quarter filters scope activities to that time period and recalculate scores
- Category filter scopes to that category's activities
- Search filters by employee name (case-insensitive substring match)
- Filters combine (AND logic), re-ranking by filtered score
- Persons with 0 score after filtering are hidden

## Steps

### Phase 1: Project Setup
1. Initialize Vite + React project in `task-1/` with minimal dependencies
2. Set up project structure:
   ```
   task-1/
   ├── src/
   │   ├── App.jsx / App.css
   │   ├── components/
   │   │   ├── Header.jsx
   │   │   ├── FilterBar.jsx
   │   │   ├── Podium.jsx
   │   │   ├── PodiumColumn.jsx
   │   │   ├── LeaderboardList.jsx
   │   │   ├── LeaderboardRow.jsx
   │   │   └── ActivityTable.jsx
   │   ├── data/
   │   │   └── generateData.js  (generates fake data at build time or embedded)
   │   ├── hooks/
   │   │   └── useLeaderboard.js (filtering/sorting/scoring logic)
   │   └── main.jsx
   ├── index.html
   ├── package.json
   ├── vite.config.js
   └── report.md
   ```

### Phase 2: Fake Data Generation (*parallel with Phase 3*)
3. Create `generateData.js` script that produces ~300 fake employees:
   - Names: pool of ~100 first names + ~100 last names, combined randomly (no real names)
   - Roles: pool of realistic generic titles (Software Engineer, Senior QA Engineer, Group Manager, HR Specialist, etc.) — NOT original titles
   - Department codes: randomly generated in format XX.U#.D#.G#.T# (e.g., EN.U2.D3.G1)
   - Each employee gets 1-20 activities spanning 2024-2025
   - Activities: fake titles like "[EDU] Introduction to Testing Best Practices", "[REG] Tech Meetup: Cloud Architecture", etc.
   - Categories: Education, Public Speaking, University Partnership — distributed realistically
   - Points per activity: 8, 16, 32, 64 (varying by category/type)
   - Dates: random but chronologically ordered, spanning 2024-01-01 to 2025-12-31
   - Avatar URLs: DiceBear API `https://api.dicebear.com/7.x/initials/svg?seed={name}`
4. Output as a static JSON array, imported directly into the app

### Phase 3: Core UI Components (*parallel with Phase 2*)
5. **Header component** — styled header with title and subtitle
6. **FilterBar component** — 3 `<select>` dropdowns + search `<input>`, styled to match original (Fluent UI-style dropdowns with ChevronDown icons)
7. **Podium component** — 3-column flex layout, center column (rank 1) taller, with avatar, rank badge, name, role, score
8. **LeaderboardRow component** — row with rank, avatar, name/role, category stat icons with counts, total score, expand/collapse toggle
9. **ActivityTable component** — expandable table showing recent activity with Activity/Category/Date/Points columns
10. **LeaderboardList component** — container rendering all rows

### Phase 4: Logic & Interactivity
11. **useLeaderboard hook** — central filtering/sorting logic:
    - Input: raw data + filter state (year, quarter, category, search)
    - Filters activities per employee by selected year/quarter/category
    - Recalculates total score from filtered activities
    - Filters out employees with 0 filtered score
    - Sorts by score descending, assigns ranks
    - Returns ranked list for podium (top 3) and list (all)
12. Wire up filter state in App, pass to hook, render Podium + List from result
### Phase 5: Styling (from screenshot analysis)
14. CSS matching original design:
    - **Page background**: very light gray (~#F5F6FA)
    - **Header**: "Leaderboard" bold black, subtitle in muted gray text
    - **Filter bar**: light gray background strip; "All Years" dropdown has white/transparent bg with dark text + simple border; "All Quarters" and "All Categories" have blue/teal filled background (#2F80ED-ish) with white text; search input with search icon, white bg
    - **Podium section**: white background area
      - 1st place: larger avatar (112px) with **gold/orange ring border**, orange rank badge "1" at bottom-right overlay; name in black bold, role in **blue** text, score "★ 536" in **blue** with star
      - 2nd place: smaller avatar (80px), **blue/teal rank badge** "2", same text style
      - 3rd place: smaller avatar (80px), **orange/bronze rank badge** "3"
      - Podium blocks: 1st = **golden/yellow** (#F2C94C), 2nd & 3rd = **light gray** (#E0E0E0); large rank numbers in lighter shade on blocks
    - **List rows**: white bg cards, rank # on left, circular avatar, bold name + gray role below, category stat icons (presentation monitor icon for Public Speaking, graduation cap for Education) with count below, "TOTAL" label small gray above, **blue star + score**, chevron-down toggle on far right
    - **Expanded row**: "RECENT ACTIVITY" header, table with Activity | Category (colored badge pill) | Date | Points (+N green/blue)
    - Category badges in expanded rows with colored pill backgrounds

### Phase 6: Deployment & Documentation
15. Configure `vite.config.js` with `base: '/edu-ai-challenge-2/leaderboard/'` for GitHub Pages
16. Add GitHub Actions workflow `.github/workflows/deploy.yml` for automated deployment on push
17. Write `report.md` describing:
    - Approach and tools used (React, Vite, DiceBear for avatars)
    - How data replacement was handled (procedural generation, no real data)
    - AI tools usage (compliant with responsible AI policy)

## Relevant Files
- `task-1/src/data/generateData.js` — fake data generation with name pools, role pools, activity templates
- `task-1/src/hooks/useLeaderboard.js` — filtering, scoring, and ranking logic
- `task-1/src/components/Podium.jsx` — top 3 podium display
- `task-1/src/components/LeaderboardRow.jsx` — individual ranked row with expand/collapse
- `task-1/src/components/FilterBar.jsx` — year/quarter/category dropdowns + search
- `task-1/src/components/ActivityTable.jsx` — expanded activity details table
- `task-1/src/App.jsx` — main layout wiring filters → hook → components
- `task-1/src/App.css` — all styles (single CSS file to keep it simple)
- `task-1/vite.config.js` — Vite config with GitHub Pages base path
- `.github/workflows/deploy.yml` — GitHub Pages deployment workflow
- `task-1/report.md` — write-up document

## Verification
1. Visual comparison: side-by-side with original SharePoint page — podium layout, row layout, expanded details should match structurally
2. Filter testing: select each Year/Quarter/Category and verify scores recalculate, list re-ranks, and 0-score entries disappear
3. Search testing: type partial names, verify filtering works
4. Expand/collapse: click chevron on rows, verify activity table appears/disappears
6. Data verification: confirm NO real names, titles, department codes, or activity descriptions from original
7. Build test: `npm run build` succeeds, `dist/` serves correctly with correct base path
8. Deployment: push to GitHub, verify GitHub Pages URL loads correctly

## Decisions
- **Tech stack**: React + Vite (user's choice), no component library (keep lightweight, CSS-only styling)
- **Avatars**: DiceBear initials API — free, no-auth, generates unique SVG avatars from names
- **Data replacement**: Fully procedural generation — no real data enters the codebase at any point
- **Icons**: Use SVG icons or a lightweight icon set (e.g., Fluent UI Icons as individual SVGs or Lucide React) for Presentation/Education/ChevronDown/Star/Search — avoiding full Fluent UI library to keep bundle small
- **Scope**: Exact UI replication only — no extra features, no dark mode, no responsive mobile layout beyond basic scaling
- **~300 entries**: Generated once, embedded as static JSON import (not generated at runtime)

## Further Considerations
1. **Icon library**: Use `@fluentui/react-icons` (tree-shakeable, only import needed icons) vs inline SVGs vs emoji. Recommendation: `@fluentui/react-icons` since the original uses Fluent UI icons — closest visual match.
2. **GitHub repo structure**: The repo is `edu-ai-challenge-2`, and the app should be served at `/edu-ai-challenge-2/leaderboard/`. Vite base should be `'/edu-ai-challenge-2/leaderboard/'`. The GitHub Actions workflow should deploy the `task-1/dist` output to a `leaderboard/` subfolder within `gh-pages`.
