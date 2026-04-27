import { useState } from 'react';
import './App.css';
import { employees } from './data/generateData';
import { useLeaderboard, type Filters } from './hooks/useLeaderboard';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import Podium from './components/Podium';
import LeaderboardList from './components/LeaderboardList';

const defaultFilters: Filters = {
  year: 'all',
  quarter: 'all',
  category: 'all',
  search: '',
};

function App() {
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const ranked = useLeaderboard(employees, filters);
  const top3 = ranked.filter((e) => e.rank <= 3);

  return (
    <div className="leaderboard">
      <Header />
      <FilterBar filters={filters} onChange={setFilters} />
      <Podium top3={top3} />
      <LeaderboardList employees={ranked} />
    </div>
  );
}

export default App;
