import { useState } from 'react';
import { Search24Regular, ChevronDown20Regular, Dismiss24Regular } from '@fluentui/react-icons';
import type { Filters } from '../hooks/useLeaderboard';

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
}

interface FilterOption {
  value: string;
  label: string;
}

const yearOptions: FilterOption[] = [
  { value: 'all', label: 'All Years' },
  { value: '2024', label: '2024' },
  { value: '2025', label: '2025' },
];

const quarterOptions: FilterOption[] = [
  { value: 'all', label: 'All Quarters' },
  { value: '1', label: 'Q1' },
  { value: '2', label: 'Q2' },
  { value: '3', label: 'Q3' },
  { value: '4', label: 'Q4' },
];

const categoryOptions: FilterOption[] = [
  { value: 'all', label: 'All Categories' },
  { value: 'Education', label: 'Education' },
  { value: 'Public Speaking', label: 'Public Speaking' },
  { value: 'University Partnership', label: 'University Partnership' },
];

type PanelKey = 'year' | 'quarter' | 'category' | null;

const labels: Record<string, string> = {
  year: 'Year',
  quarter: 'Quarter',
  category: 'Category',
};

function getOptions(key: PanelKey): FilterOption[] {
  if (key === 'year') return yearOptions;
  if (key === 'quarter') return quarterOptions;
  if (key === 'category') return categoryOptions;
  return [];
}

function getDisplayLabel(key: 'year' | 'quarter' | 'category', value: string): string {
  const opt = getOptions(key).find((o) => o.value === value);
  return opt?.label ?? value;
}

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const [openPanel, setOpenPanel] = useState<PanelKey>(null);

  const set = (key: keyof Filters, value: string) =>
    onChange({ ...filters, [key]: value });

  const handlePanelSelect = (value: string) => {
    if (openPanel) {
      set(openPanel, value);
      setOpenPanel(null);
    }
  };

  const options = getOptions(openPanel);
  const currentValue = openPanel ? filters[openPanel] : '';

  return (
    <>
      <div className="filterBar">
        <div className="filters">
          {/* Native selects for desktop */}
          <div className="selectWrapper desktopOnly">
            <select value={filters.year} onChange={(e) => set('year', e.target.value)}>
              {yearOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown20Regular className="selectIcon" />
          </div>
          <div className="selectWrapper desktopOnly">
            <select value={filters.quarter} onChange={(e) => set('quarter', e.target.value)}>
              {quarterOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown20Regular className="selectIcon" />
          </div>
          <div className="selectWrapper desktopOnly">
            <select value={filters.category} onChange={(e) => set('category', e.target.value)}>
              {categoryOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <ChevronDown20Regular className="selectIcon" />
          </div>

          {/* Button triggers for mobile panel */}
          <button className="filterButton mobileOnly" onClick={() => setOpenPanel('year')}>
            {getDisplayLabel('year', filters.year)}
            <ChevronDown20Regular className="selectIcon" />
          </button>
          <button className="filterButton mobileOnly" onClick={() => setOpenPanel('quarter')}>
            {getDisplayLabel('quarter', filters.quarter)}
            <ChevronDown20Regular className="selectIcon" />
          </button>
          <button className="filterButton mobileOnly" onClick={() => setOpenPanel('category')}>
            {getDisplayLabel('category', filters.category)}
            <ChevronDown20Regular className="selectIcon" />
          </button>
        </div>
        <div className="search">
          <Search24Regular className="searchIcon" />
          <input
            type="text"
            placeholder="Search employee..."
            value={filters.search}
            onChange={(e) => set('search', e.target.value)}
          />
        </div>
      </div>

      {/* Side panel overlay */}
      {openPanel && (
        <>
          <div className="panelOverlay" onClick={() => setOpenPanel(null)} />
          <div className="filterPanel">
            <div className="filterPanelHeader">
              <button className="filterPanelClose" onClick={() => setOpenPanel(null)}>
                <Dismiss24Regular />
              </button>
            </div>
            <div className="filterPanelOptions">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  className={`filterPanelOption${opt.value === currentValue ? ' filterPanelOptionActive' : ''}`}
                  onClick={() => handlePanelSelect(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
}
