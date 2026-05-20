import { Task, Severity } from '../types';
import { formatDisplayDate } from '../utils/calendarUtils';
import SeverityBadge from './SeverityBadge';
import AssigneeAvatar from './AssigneeAvatar';

interface Props {
  task: Task;
}

const borderMap: Record<Severity, string> = {
  Critical: 'border-l-red-600',
  High: 'border-l-amber-600',
  Medium: 'border-l-blue-600',
  Low: 'border-l-green-600',
};

export default function TaskCard({ task }: Props) {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 ${borderMap[task.severity]} py-3 px-3.5 hover:shadow-md transition-shadow duration-150 min-h-[64px]`}
    >
      {/* Title row */}
      <div className="flex items-start justify-between gap-2">
        <span className="flex-1 min-w-0 text-[13.5px] font-semibold text-gray-900 leading-tight line-clamp-2">
          {task.title}
        </span>
        <SeverityBadge severity={task.severity} size="sm" />
      </div>

      {/* Meta row */}
      <div className="flex items-center flex-wrap gap-x-1 gap-y-1 mt-1.5">
        <span className="rounded-full bg-gray-100 text-gray-600 text-[11px] px-2 py-0.5 font-medium">
          {task.category}
        </span>
        <span className="text-[11px] text-gray-500 ml-2">
          Due: {formatDisplayDate(task.dueDate)}
        </span>
        {task.status === 'Overdue' && (
          <span className="text-[10px] font-bold uppercase text-red-600 ml-1">
            Overdue
          </span>
        )}
        {task.status === 'Due Today' && (
          <span className="text-[10px] font-bold uppercase text-orange-500 ml-1">
            Due Today
          </span>
        )}
        <div className="ml-auto flex items-center gap-1 flex-shrink-0">
          <AssigneeAvatar assignee={task.assignee} size="sm" />
          <span className="text-[11px] text-gray-500">{task.assignee.name}</span>
        </div>
      </div>
    </div>
  );
}
