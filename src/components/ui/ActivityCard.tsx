import React from 'react';
import { Typography } from './Typography';
import { CoinBadge } from '../CoinBadge';
import { CheckCircle2, Trophy, AlertTriangle, Globe, Gift, Clock } from 'lucide-react';
import { CATEGORY_ICON_MAP } from '../../utils/categories';

export type ActivityType = 'task' | 'reward' | 'penalty' | 'charity' | 'gifting' | 'other';
export type ActivityStatus = 'completed' | 'pending' | 'delivered' | 'approved' | 'rejected';

export interface ActivityCardProps {
  title: string;
  subtitle?: string;
  date?: Date;
  points: number;
  type: ActivityType;
  status?: ActivityStatus;
  category?: string;
  actions?: React.ReactNode;
  iconOverride?: React.ReactNode;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  subtitle,
  date,
  points,
  type,
  status,
  category,
  actions,
  iconOverride
}) => {
  let iconWrapperClass = "bg-stone-50 text-stone-500";
  let IconElement: React.ReactNode = <CheckCircle2 className="w-5 h-5" />;
  let isStrikeThrough = false;
  let isNegative = false;

  // Determine Icon and Background based on type & status
  if (iconOverride) {
    IconElement = iconOverride;
  } else if (type === 'task') {
    if (status === 'completed' || status === 'approved') {
      iconWrapperClass = "bg-emerald-50 text-emerald-500";
      IconElement = <CheckCircle2 className="w-5 h-5" />;
      isStrikeThrough = true; // Option C combo
    } else {
      // Pending or other
      iconWrapperClass = "bg-amber-50 text-amber-500";
      IconElement = <Clock className="w-5 h-5" />;
      
      if (category && CATEGORY_ICON_MAP[category as keyof typeof CATEGORY_ICON_MAP]) {
        const cat = CATEGORY_ICON_MAP[category as keyof typeof CATEGORY_ICON_MAP];
        iconWrapperClass = `${cat.bg} ${cat.iconColor} bg-opacity-30`;
        IconElement = <cat.Icon className="w-5 h-5" />;
      }
    }
  } else if (type === 'reward') {
    iconWrapperClass = "bg-purple-50 text-purple-500";
    IconElement = <Trophy className="w-5 h-5" />;
    isNegative = true;
  } else if (type === 'penalty') {
    iconWrapperClass = "bg-rose-50 text-rose-500";
    IconElement = <AlertTriangle className="w-5 h-5" />;
    isNegative = true;
  } else if (type === 'charity') {
    iconWrapperClass = "bg-emerald-50 text-emerald-500";
    IconElement = <Globe className="w-5 h-5" />;
    isNegative = true;
  } else if (type === 'gifting') {
    iconWrapperClass = "bg-pink-50 text-pink-500";
    IconElement = <Gift className="w-5 h-5" />;
    isNegative = true;
  } else if (type === 'other') {
    iconWrapperClass = "bg-stone-50 text-stone-500";
    IconElement = <CheckCircle2 className="w-5 h-5" />;
  }

  // Adjust points logic if they passed a positive number but it's a spend
  const displayPoints = isNegative && points > 0 ? -points : points;

  return (
    <div className="bg-white border dashboard-card border-stone-100 rounded-2xl p-3 sm:p-4 flex flex-row justify-between items-center gap-3 sm:gap-4 transition-all hover:border-stone-200">
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconWrapperClass}`}>
          {IconElement}
        </div>
        <div className="flex-1 min-w-0">
          <Typography 
            variant="body" 
            className={`font-bold text-stone-900 text-sm truncate ${isStrikeThrough ? 'line-through opacity-70' : ''}`}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body" className="text-xs text-stone-500 mt-0.5 truncate">
              {subtitle}
            </Typography>
          )}
          {date && (
            <Typography variant="body" className="text-[10px] sm:text-xs text-stone-400 mt-0.5">
              {date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </Typography>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <div className="font-black text-sm flex items-center justify-center">
          <CoinBadge points={displayPoints} size="sm" disabled={!isStrikeThrough && type === 'task' && status !== 'completed' && status !== 'approved'} />
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
