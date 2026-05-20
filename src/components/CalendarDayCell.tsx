import { CalendarDay } from '../types';

interface Props {
  day: CalendarDay;
  isSelected: boolean;
  onClick: () => void;
}

export default function CalendarDayCell({ day, isSelected, onClick }: Props) {
  const numberClasses = (() => {
    const base = 'text-[12px] w-7 h-7 rounded-full flex items-center justify-center';
    if (!day.isCurrentMonth) return `${base} text-gray-300 cursor-default`;
    if (isSelected) return `${base} bg-orange-500 text-white font-bold cursor-pointer`;
    if (day.isToday) return `${base} bg-[#1a2744] text-white font-bold cursor-pointer`;
    return `${base} text-gray-700 hover:bg-gray-100 cursor-pointer`;
  })();

  return (
    <div
      className="w-8 h-8 flex items-center justify-center relative"
      onClick={day.isCurrentMonth ? onClick : undefined}
    >
      <span className={numberClasses}>{day.dayNumber}</span>
      {day.taskCount > 0 && day.isCurrentMonth && (
        <span
          className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full ${day.hasCritical ? 'bg-red-500' : 'bg-slate-400'}`}
        />
      )}
    </div>
  );
}
