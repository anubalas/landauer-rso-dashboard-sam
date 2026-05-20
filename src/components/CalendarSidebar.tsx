import { useState } from 'react';
import { Task } from '../types';
import { buildCalendarDays, getTasksForDate } from '../utils/calendarUtils';
import CalendarHeader from './CalendarHeader';
import CalendarDayCell from './CalendarDayCell';
import SelectedDateTaskList from './SelectedDateTaskList';

interface Props {
  tasks: Task[];
  selectedDate: string | null;
  onDateSelect: (date: string) => void;
  onMonthChange: () => void;
}

const DOW_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export default function CalendarSidebar({ tasks, selectedDate, onDateSelect, onMonthChange }: Props) {
  const [displayMonth, setDisplayMonth] = useState(() => new Date());

  const handlePrevMonth = () => {
    setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    onMonthChange();
  };

  const handleNextMonth = () => {
    setDisplayMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    onMonthChange();
  };

  const days = buildCalendarDays(displayMonth.getFullYear(), displayMonth.getMonth(), tasks);

  return (
    <div className="w-72 bg-white border border-gray-200 rounded-xl p-3.5 sticky top-4 shadow-sm">
      <CalendarHeader
        displayMonth={displayMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
      />

      {/* Day-of-week labels */}
      <div className="grid grid-cols-7 mb-1">
        {DOW_LABELS.map(d => (
          <span key={d} className="text-center text-[10px] font-medium text-gray-400 uppercase">
            {d}
          </span>
        ))}
      </div>

      {/* Day grid */}
      <div className="grid grid-cols-7">
        {days.map(day => (
          <CalendarDayCell
            key={day.date}
            day={day}
            isSelected={day.date === selectedDate}
            onClick={() => {
              if (!day.isCurrentMonth) return;
              onDateSelect(day.date === selectedDate ? '' : day.date);
            }}
          />
        ))}
      </div>

      {selectedDate && (
        <SelectedDateTaskList
          date={selectedDate}
          tasks={getTasksForDate(tasks, selectedDate)}
        />
      )}
    </div>
  );
}
