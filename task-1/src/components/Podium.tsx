import { Star28Filled } from '@fluentui/react-icons';
import type { RankedEmployee } from '../hooks/useLeaderboard';

interface PodiumColumnProps {
  employee: RankedEmployee;
  rank: 1 | 2 | 3;
}

function PodiumColumn({ employee, rank }: PodiumColumnProps) {
  const avatarSize = rank === 1 ? 112 : 80;
  const badgeSize = rank === 1 ? 40 : 32;

  return (
    <div className={`podiumColumn podiumRank${rank}`}>
      <div className="podiumUser">
        <div className="podiumAvatarContainer">
          <div
            className="podiumAvatar"
            style={{
              width: avatarSize,
              height: avatarSize,
              backgroundImage: `url(${employee.avatarUrl})`,
            }}
          />
          <div className="podiumRankBadge" style={{ width: badgeSize, height: badgeSize }}>
            {rank}
          </div>
        </div>
        <p className="podiumName">{employee.name}</p>
        <p className="podiumRole">{employee.role} · {employee.department}</p>
        <div className="podiumScore">
          <Star28Filled />
          {employee.filteredScore}
        </div>
      </div>
      <div className="podiumBlock">
        <span className="podiumRankNumber">{rank}</span>
      </div>
    </div>
  );
}

interface PodiumProps {
  top3: RankedEmployee[];
}

export default function Podium({ top3 }: PodiumProps) {
  if (top3.length === 0) return null;

  const byRank = (r: number) => top3.find((e) => e.rank === r);
  const rank1 = byRank(1);
  const rank2 = byRank(2);
  const rank3 = byRank(3);

  return (
    <div className="podium">
      {rank2 && <PodiumColumn employee={rank2} rank={2} />}
      {rank1 && <PodiumColumn employee={rank1} rank={1} />}
      {rank3 && <PodiumColumn employee={rank3} rank={3} />}
    </div>
  );
}
