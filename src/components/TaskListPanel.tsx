import { Severity, Task } from '../types';
import SeveritySummaryBar from './SeveritySummaryBar';
import TaskCard from './TaskCard';

interface Props {
  tasks: Task[];
  activeSeverityFilter: Severity | null;
  onFilterChange: (s: Severity | null) => void;
}

export default function TaskListPanel({ tasks, activeSeverityFilter, onFilterChange }: Props) {
  const filtered = activeSeverityFilter
    ? tasks.filter(t => t.severity === activeSeverityFilter)
    : tasks;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-w-0">
      <SeveritySummaryBar
        tasks={tasks}
        activeFilter={activeSeverityFilter}
        onFilterChange={onFilterChange}
      />
      <div
        className="overflow-y-auto pt-4 pb-6 flex flex-col gap-2 pr-1"
        style={{ maxHeight: 'calc(100vh - 92px)' }}
      >
        {filtered.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}
