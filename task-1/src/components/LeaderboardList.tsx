import type { RankedEmployee } from '../hooks/useLeaderboard';
import LeaderboardRow from './LeaderboardRow';

interface LeaderboardListProps {
  employees: RankedEmployee[];
}

export default function LeaderboardList({ employees }: LeaderboardListProps) {
  return (
    <div className="list">
      {employees.map((emp) => (
        <LeaderboardRow key={emp.id} employee={emp} />
      ))}
    </div>
  );
}
