import { Task, Severity } from '../types';
import { parseISODate } from '../utils/calendarUtils';

interface Props {
  date: string;
  tasks: Task[];
}

const dotColors: Record<Severity, string> = {
  Critical: '#dc2626',
  High: '#d97706',
  Medium: '#2563eb',
  Low: '#16a34a',
};

export default function SelectedDateTaskList({ date, tasks }: Props) {
  const d = parseISODate(date);
  const label = d.toLocaleString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="mt-3 pt-3 border-t border-gray-200">
      <p className="text-[12px] font-semibold text-gray-600 mb-2">Tasks — {label}</p>
      {tasks.length === 0 ? (
        <p className="text-[12px] text-gray-400 italic">No tasks due.</p>
      ) : (
        <div>
          {tasks.map((task, i) => (
            <div
              key={task.id}
              className={`flex items-center gap-2 py-1.5 ${i < tasks.length - 1 ? 'border-b border-gray-100' : ''}`}
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: dotColors[task.severity] }}
              />
              <span className="text-[12px] text-gray-800 truncate">{task.title}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
