import { Assignee } from '../types';

interface Props {
  assignee: Assignee;
  size?: 'sm' | 'md';
}

const PALETTE = ['#6366f1', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed'];

export default function AssigneeAvatar({ assignee, size = 'sm' }: Props) {
  const index = parseInt(assignee.id.replace(/\D/g, ''), 10) % PALETTE.length;
  const bg = PALETTE[index] ?? PALETTE[0];
  const sizeClass = size === 'sm' ? 'w-5 h-5 text-[9px]' : 'w-7 h-7 text-[11px]';

  return (
    <span
      className={`${sizeClass} rounded-full flex items-center justify-center text-white font-bold tracking-tight flex-shrink-0`}
      style={{ backgroundColor: bg }}
      title={assignee.name}
    >
      {assignee.initials}
    </span>
  );
}
