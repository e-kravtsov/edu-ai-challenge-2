import type { Activity } from '../data/generateData';

interface ActivityTableProps {
  activities: Activity[];
}

function getCategoryBadgeClass(category: string): string {
  switch (category) {
    case 'Education': return 'categoryBadge categoryTraining';
    case 'Public Speaking': return 'categoryBadge categoryDefault';
    case 'University Partnership': return 'categoryBadge categoryCommunity';
    default: return 'categoryBadge categoryDefault';
  }
}

export default function ActivityTable({ activities }: ActivityTableProps) {
  return (
    <div className="details">
      <h4 className="detailsTitle">RECENT ACTIVITY</h4>
      <div className="tableWrapper">
        <table className="activityTable">
          <thead>
            <tr>
              <th>Activity</th>
              <th>Category</th>
              <th>Date</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.id}>
                <td className="activityName">{a.title}</td>
                <td>
                  <span className={getCategoryBadgeClass(a.category)}>
                    {a.category}
                  </span>
                </td>
                <td className="activityDate">{a.dateFormatted}</td>
                <td className="activityPoints">+{a.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
