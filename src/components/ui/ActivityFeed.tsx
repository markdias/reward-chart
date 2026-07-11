import React from 'react';
import { ActivityCard, ActivityCardProps } from './ActivityCard';

interface ActivityFeedProps {
  activities: (ActivityCardProps & { id: string })[];
  emptyMessage?: string;
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ 
  activities, 
  emptyMessage = "No recent activity.", 
  className = "space-y-2" 
}) => {
  if (activities.length === 0) {
    return (
      <div className="col-span-full p-8 text-center text-stone-400 border-2 border-dashed border-stone-200 rounded-3xl">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={className}>
      {activities.map((activity) => (
        <ActivityCard 
          key={activity.id}
          {...activity}
        />
      ))}
    </div>
  );
};
