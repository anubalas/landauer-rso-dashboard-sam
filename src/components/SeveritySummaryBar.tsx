import { Severity, Task } from '../types';

interface Props {
  tasks: Task[];
  activeFilter: Severity | null;
  onFilterChange: (s: Severity | null) => void;
}

interface PillConfig {
  severity: Severity;
  inactive: string;
  active: string;
}

const PILLS: PillConfig[] = [
  {
    severity: 'Critical',
    inactive: 'bg-red-100 text-[#b91c1c] border border-red-200',
    active: 'bg-red-600 text-white border-transparent',
  },
  {
    severity: 'High',
    inactive: 'bg-yellow-100 text-[#92400e] border border-yellow-200',
    active: 'bg-amber-600 text-white border-transparent',
  },
  {
    severity: 'Medium',
    inactive: 'bg-blue-100 text-[#1e40af] border border-blue-200',
    active: 'bg-blue-600 text-white border-transparent',
  },
  {
    severity: 'Low',
    inactive: 'bg-green-100 text-[#166534] border border-green-200',
    active: 'bg-green-600 text-white border-transparent',
  },
];

export default function SeveritySummaryBar({ tasks, activeFilter, onFilterChange }: Props) {
  const counts: Record<Severity, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  tasks.forEach(t => counts[t.severity]++);

  return (
    <div className="h-[44px] bg-white border-b border-gray-200 px-6 flex items-center gap-3 flex-shrink-0">
      <span className="text-gray-500 text-[12px] font-medium uppercase tracking-wide">
        Tasks:
      </span>
      {PILLS.map(({ severity, inactive, active }) => {
        const isActive = activeFilter === severity;
        return (
          <button
            key={severity}
            className={`rounded-full px-3 py-1 text-[12px] font-semibold cursor-pointer transition-colors ${isActive ? active : inactive}`}
            onClick={() => onFilterChange(isActive ? null : severity)}
          >
            {severity}{' '}
            <span className="font-bold">({counts[severity]})</span>
          </button>
        );
      })}
    </div>
  );
}
