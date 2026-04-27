# Design Reference — Extracted from Original Leaderboard

## Computed Colors (from getComputedStyle)

| Element | Property | Value |
|---------|----------|-------|
| Page background | background-color | rgb(248, 250, 252) |
| Header h2 | color | rgb(15, 23, 42) |
| Subtitle | color | rgb(100, 116, 139) |
| Filter bar | background-color | rgb(255, 255, 255) |
| Podium rank 1 block top | background-color | rgb(253, 224, 71) |
| Podium rank 2 block top | background-color | rgb(203, 213, 225) |
| Podium rank 3 block top | background-color | rgb(203, 213, 225) |
| Podium name | color | rgb(15, 23, 42) |
| Podium role | color | rgb(100, 116, 139) |
| Score value | color | rgb(14, 165, 233) |
| Rank number | color | rgb(148, 163, 184) |
| Row name | color | rgb(15, 23, 42) |
| Row role | color | rgb(100, 116, 139) |
| TOTAL label | color | rgb(148, 163, 184) |
| Podium score | color | rgb(14, 165, 233) |
| Category badge bg | background-color | rgb(226, 232, 240) |
| Category badge text | color | rgb(71, 85, 105) |
| Activity points | color | rgb(14, 165, 233) |
| Activity date | color | rgb(100, 116, 139) |

## Filter Options

**Years**: All Years, 2025
**Quarters**: All Quarters, Q1, Q2, Q3, Q4
**Categories**: All Categories, Education, Public Speaking, University Partnership
**Search**: text input "Search employee..."

## CSS Rules (cleaned)

```css
/* === MAIN CONTAINER === */
.leaderboard {
  background: rgb(248, 250, 252);
  color: rgb(15, 23, 42);
  font-family: "Segoe UI", -apple-system, BlinkMacSystemFont, Roboto, Oxygen, Ubuntu, Cantarell, "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif;
  min-height: 100vh;
  padding: 24px;
}

/* === HEADER === */
.header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin: 0px auto 32px;
  max-width: 1200px;
}
.header .headerContent { flex: 1; }
.header .headerContent h2 {
  color: rgb(15, 23, 42);
  font-size: 30px;
  font-weight: 700;
  margin: 0 0 8px;
}
.header .headerContent p {
  color: rgb(100, 116, 139);
  font-size: 14px;
  margin: 0;
}

/* === FILTER BAR === */
.filterBar {
  align-items: center;
  background: rgb(255, 255, 255);
  border: 1px solid rgb(226, 232, 240);
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: space-between;
  margin: 0px auto 24px;
  max-width: 1200px;
  padding: 20px 24px;
}
.filterBar .filters { display: flex; flex-wrap: wrap; gap: 12px; }
.filterBar .search { flex: 1; min-width: 250px; }

/* === PODIUM === */
.podium {
  align-items: flex-end;
  display: flex;
  gap: 24px;
  justify-content: center;
  margin: 0px auto 64px;
  max-width: 900px;
  padding: 32px 8px;
}
.podiumColumn {
  align-items: center;
  display: flex;
  flex-direction: column;
  max-width: 280px;
  position: relative;
  width: 100%;
}
.podiumColumn.podiumRank1 { margin-top: -32px; order: 2; }
.podiumColumn.podiumRank2 { order: 1; }
.podiumColumn.podiumRank3 { order: 3; }

.podiumUser {
  align-items: center;
  display: flex;
  flex-direction: column;
  margin-bottom: 16px;
  position: relative;
  z-index: 10;
}
.podiumAvatarContainer { margin-bottom: 12px; position: relative; }
.podiumAvatar {
  align-items: center;
  background-position: center;
  background-size: cover;
  border-radius: 50%;
  box-shadow: rgba(0, 0, 0, 0.15) 0px 4px 12px;
  color: rgb(255, 255, 255);
  display: flex;
  font-weight: 700;
  justify-content: center;
}
/* Rank 1 avatar: 112px, gold border */
.podiumRank1 .podiumAvatar {
  background-color: rgb(134, 239, 172);
  border: 4px solid rgb(251, 191, 36);
  color: rgb(22, 101, 52);
}
/* Rank 2 avatar: 80px, white border */
.podiumRank2 .podiumAvatar {
  background-color: rgb(203, 213, 225);
  border: 4px solid rgb(255, 255, 255);
  color: rgb(30, 41, 59);
}
/* Rank 3 avatar: 80px, white border */
.podiumRank3 .podiumAvatar {
  background-color: rgb(94, 234, 212);
  border: 4px solid rgb(255, 255, 255);
  color: rgb(19, 78, 74);
}

/* Rank badges */
.podiumRankBadge {
  align-items: center;
  border: 4px solid rgb(255, 255, 255);
  border-radius: 50%;
  bottom: -8px;
  color: rgb(255, 255, 255);
  display: flex;
  font-weight: 700;
  justify-content: center;
  position: absolute;
  right: -4px;
}
.podiumRank1 .podiumRankBadge { background: rgb(234, 179, 8); font-size: 18px; }
.podiumRank2 .podiumRankBadge { background: rgb(148, 163, 184); font-size: 14px; }
.podiumRank3 .podiumRankBadge { background: rgb(146, 64, 14); font-size: 14px; }

/* Podium text */
.podiumName { color: rgb(15, 23, 42); font-size: 20px; font-weight: 700; margin: 0 0 4px; text-align: center; }
.podiumRank1 .podiumName { font-size: 24px; }
.podiumRole { color: rgb(100, 116, 139); font-size: 14px; font-weight: 500; margin: 0 0 8px; }

/* Podium score pill */
.podiumScore {
  align-items: center;
  background: rgb(255, 255, 255);
  border: 1px solid rgb(226, 232, 240);
  border-radius: 20px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 2px;
  display: flex;
  font-size: 18px;
  font-weight: 700;
  gap: 6px;
  padding: 6px 16px;
}
.podiumRank1 .podiumScore {
  background: rgb(254, 249, 195);
  border-color: rgb(253, 224, 71);
  color: rgb(202, 138, 4);
  font-size: 20px;
  padding: 8px 20px;
}
.podiumRank2 .podiumScore, .podiumRank3 .podiumScore { color: rgb(14, 165, 233); }

/* Podium blocks */
.podiumBlock {
  align-items: flex-start;
  background: linear-gradient(rgb(226, 232, 240), rgb(203, 213, 225));
  border-radius: 12px 12px 0 0;
  border-top: 2px solid rgb(203, 213, 225);
  box-shadow: rgba(0, 0, 0, 0.06) 0px 2px 4px inset;
  display: flex;
  justify-content: center;
  overflow: hidden;
  padding-top: 16px;
  position: relative;
  width: 100%;
}
.podiumRank1 .podiumBlock {
  background: linear-gradient(rgb(254, 243, 199), rgb(253, 230, 138));
  border-top-color: rgb(253, 224, 71);
  height: 160px;
}
.podiumRank2 .podiumBlock { height: 128px; }
.podiumRank3 .podiumBlock { height: 96px; }

.podiumRankNumber {
  color: rgba(148, 163, 184, 0.2);
  font-size: 96px;
  font-weight: 900;
  user-select: none;
}
.podiumRank1 .podiumRankNumber { color: rgba(234, 179, 8, 0.2); font-size: 112px; }
.podiumRank3 .podiumRankNumber { top: -16px; position: relative; }

/* === LIST === */
.list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin: 0 auto;
  max-width: 1200px;
}
.userRowContainer {
  background: rgb(255, 255, 255);
  border: 1px solid rgb(226, 232, 240);
  border-radius: 12px;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 1px 3px;
  overflow: hidden;
}
.userRowContainer:hover { box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px; }
.userRowContainer.expanded { border-color: rgb(14, 165, 233); }

.row { padding: 20px 24px; }
.rowMain { align-items: center; display: flex; gap: 16px; justify-content: space-between; }
.rowLeft { align-items: center; display: flex; flex: 1; gap: 24px; }
.rank { color: rgb(148, 163, 184); font-size: 24px; font-weight: 700; min-width: 32px; text-align: center; }
.avatar {
  align-items: center;
  background-color: rgb(251, 191, 36);
  background-position: center;
  background-size: cover;
  border-radius: 50%;
  color: rgb(255, 255, 255);
  display: flex;
  flex-shrink: 0;
  font-size: 20px;
  font-weight: 700;
  height: 56px;
  justify-content: center;
  width: 56px;
}
.info { display: flex; flex: 1; flex-direction: column; gap: 4px; }
.name { color: rgb(15, 23, 42); font-size: 18px; font-weight: 700; margin: 0; }
.role { color: rgb(100, 116, 139); font-size: 14px; }

.rowRight { align-items: center; display: flex; gap: 24px; }
.categoryStats { align-items: center; display: flex; gap: 24px; }
.categoryStat { align-items: center; display: flex; flex-direction: column; gap: 4px; }
.categoryStatIcon { color: rgb(14, 165, 233); font-size: 20px; }
.categoryStatCount { color: rgb(71, 85, 105); font-size: 12px; font-weight: 600; }

.totalSection {
  align-items: flex-end;
  border-left: 1px solid rgb(226, 232, 240);
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 24px;
}
.totalLabel { color: rgb(148, 163, 184); font-size: 10px; font-weight: 600; letter-spacing: 0.05em; }
.score { align-items: center; color: rgb(14, 165, 233); display: flex; font-size: 24px; font-weight: 700; gap: 6px; }

.expandButton {
  align-items: center;
  background: rgb(241, 245, 249);
  border: none;
  border-radius: 50%;
  color: rgb(14, 165, 233);
  cursor: pointer;
  display: flex;
  justify-content: center;
  padding: 8px;
}
.expandButton:hover { background: rgb(226, 232, 240); }
.userRowContainer.expanded .expandButton { background: rgb(224, 242, 254); }

/* === EXPANDED DETAILS === */
.details { background: rgb(248, 250, 252); border-top: 1px solid rgb(226, 232, 240); padding: 24px; }
.detailsTitle {
  color: rgb(100, 116, 139);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin: 0 0 16px;
  text-transform: uppercase;
}

.activityTable { border-collapse: collapse; width: 100%; }
.activityTable thead tr { border-bottom: 2px solid rgb(226, 232, 240); }
.activityTable thead th {
  color: rgb(100, 116, 139);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.05em;
  padding: 12px 8px;
  text-align: left;
  text-transform: uppercase;
}
.activityTable thead th:last-child { text-align: right; }
.activityTable tbody tr:hover { background: rgb(241, 245, 249); }
.activityTable tbody td { border-bottom: 1px solid rgb(226, 232, 240); font-size: 14px; padding: 16px 8px; }
.activityTable tbody tr:last-child td { border-bottom: none; }

.activityName { color: rgb(30, 41, 59); font-weight: 600; }
.categoryBadge { border-radius: 12px; display: inline-flex; font-size: 12px; font-weight: 600; padding: 4px 12px; }
.categoryBadge.categoryDefault { background: rgb(226, 232, 240); color: rgb(71, 85, 105); }
.categoryBadge.categoryTraining { background: rgb(219, 234, 254); color: rgb(30, 64, 175); }
.categoryBadge.categoryContribution { background: rgb(243, 232, 255); color: rgb(107, 33, 168); }
.categoryBadge.categoryCommunity { background: rgb(220, 252, 231); color: rgb(22, 101, 52); }

.activityDate { color: rgb(100, 116, 139); }
.activityPoints { color: rgb(14, 165, 233); font-weight: 700; text-align: right; }
```

## Key Dimensions
- Podium avatar rank 1: 112x112px, rank 2/3: 80x80px
- Podium rank badge 1: 40x40px, rank 2/3: 32x32px
- List avatar: 56x56px
- Podium block heights: rank 1 = 160px, rank 2 = 128px, rank 3 = 96px
- Max content width: 1200px
- Max podium width: 900px
- Border radius: 12px (cards, filter bar, podium blocks top), 50% (avatars, badges, expand button)

## Icon Names (Fluent UI)
- FavoriteStarFill — star icon next to scores
- ChevronDown — expand button and dropdown carets
- Presentation — Public Speaking category stat icon
- Education — Education category stat icon
- Search — search box icon
