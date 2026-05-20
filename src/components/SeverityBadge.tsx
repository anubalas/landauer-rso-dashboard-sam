import { Severity } from '../types';

interface Props {
  severity: Severity;
  size?: 'sm' | 'md';
}

const colorMap: Record<Severity, string> = {
  Critical: 'bg-red-100 text-red-700',
  High: 'bg-yellow-100 text-yellow-700',
  Medium: 'bg-blue-100 text-blue-700',
  Low: 'bg-green-100 text-green-700',
};

export default function SeverityBadge({ severity, size = 'md' }: Props) {
  const padding = size === 'sm' ? 'px-2 py-0.5' : 'px-2.5 py-1';
  return (
    <span
      className={`rounded-full ${padding} text-[11px] font-semibold flex-shrink-0 ${colorMap[severity]}`}
    >
      {severity}
    </span>
  );
}
