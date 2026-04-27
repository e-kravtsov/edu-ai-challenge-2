import { useMemo } from 'react';
import type { Employee, Activity, Category } from '../data/generateData';

export interface Filters {
  year: string;
  quarter: string;
  category: string;
  search: string;
}

export interface RankedEmployee extends Employee {
  rank: number;
  filteredScore: number;
  filteredActivities: Activity[];
  categoryCounts: Record<Category, number>;
}

export function useLeaderboard(allEmployees: Employee[], filters: Filters): RankedEmployee[] {
  return useMemo(() => {
    const { year, quarter, category, search } = filters;
    const searchLower = search.toLowerCase().trim();

    // First pass: rank everyone by year/quarter/category (ignoring search)
    const ranked: RankedEmployee[] = [];

    for (const emp of allEmployees) {
      const filteredActivities = emp.activities.filter((a) => {
        if (year !== 'all' && a.year !== Number(year)) return false;
        if (quarter !== 'all' && a.quarter !== Number(quarter)) return false;
        if (category !== 'all' && a.category !== category) return false;
        return true;
      });

      const filteredScore = filteredActivities.reduce((s, a) => s + a.points, 0);
      if (filteredScore === 0) continue;

      const categoryCounts: Record<Category, number> = {
        'Education': 0,
        'Public Speaking': 0,
        'University Partnership': 0,
      };
      for (const a of filteredActivities) {
        categoryCounts[a.category]++;
      }

      ranked.push({
        ...emp,
        rank: 0,
        filteredScore,
        filteredActivities,
        categoryCounts,
      });
    }

    // Sort and assign ranks before applying search filter
    ranked.sort((a, b) => b.filteredScore - a.filteredScore || a.name.localeCompare(b.name));
    for (let i = 0; i < ranked.length; i++) {
      ranked[i].rank = i + 1;
    }

    // Second pass: filter by search (ranks stay the same)
    if (searchLower) {
      return ranked.filter((e) => e.name.toLowerCase().includes(searchLower));
    }

    return ranked;
  }, [allEmployees, filters]);
}
