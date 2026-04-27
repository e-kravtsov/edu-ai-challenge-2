import { useState } from 'react';
import {
  Star28Filled,
  ChevronDown20Regular,
  ChevronUp20Regular,
  HatGraduationFilled,
  Mic20Filled,
  PeopleCommunityFilled,
} from '@fluentui/react-icons';
import type { RankedEmployee } from '../hooks/useLeaderboard';
import ActivityTable from './ActivityTable';

interface LeaderboardRowProps {
  employee: RankedEmployee;
}

export default function LeaderboardRow({ employee }: LeaderboardRowProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`userRowContainer${expanded ? ' expanded' : ''}`}>
      <div className="row">
        <div className="rowMain">
          <div className="rowLeft">
            <span className="rank">{employee.rank}</span>
            <div
              className="avatar"
              style={{ backgroundImage: `url(${employee.avatarUrl})` }}
            />
            <div className="info">
              <p className="name">{employee.name}</p>
              <span className="role">{employee.role} · {employee.department}</span>
            </div>
          </div>
          <div className="rowRight">
            <div className="categoryStats">
              <div className="categoryStat">
                <HatGraduationFilled className="categoryStatIcon" />
                <span className="categoryStatCount">{employee.categoryCounts['Education']}</span>
              </div>
              <div className="categoryStat">
                <Mic20Filled className="categoryStatIcon" />
                <span className="categoryStatCount">{employee.categoryCounts['Public Speaking']}</span>
              </div>
              <div className="categoryStat">
                <PeopleCommunityFilled className="categoryStatIcon" />
                <span className="categoryStatCount">{employee.categoryCounts['University Partnership']}</span>
              </div>
            </div>
            <div className="totalSection">
              <span className="totalLabel">TOTAL</span>
              <div className="score">
                <Star28Filled />
                {employee.filteredScore}
              </div>
            </div>
            <button
              className="expandButton"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? 'Collapse details' : 'Expand details'}
            >
              {expanded ? <ChevronUp20Regular /> : <ChevronDown20Regular />}
            </button>
          </div>
        </div>
      </div>
      {expanded && <ActivityTable activities={employee.filteredActivities} />}
    </div>
  );
}
