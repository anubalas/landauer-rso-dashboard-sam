import { CalendarDay, Task } from '../types';

export function parseISODate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(isoDate: string): string {
  const date = parseISODate(isoDate);
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function getTasksForDate(tasks: Task[], date: string): Task[] {
  return tasks.filter(t => t.dueDate === date);
}

export function buildCalendarDays(
  year: number,
  month: number,
  tasks: Task[]
): CalendarDay[] {
  const todayStr = toISODateString(new Date());
  const firstDay = new Date(year, month, 1);
  const startPadding = firstDay.getDay();
  const days: CalendarDay[] = [];

  for (let i = 0; i < 42; i++) {
    const current = new Date(year, month, 1 - startPadding + i);
    const dateStr = toISODateString(current);
    const isCurrentMonth = current.getMonth() === month;
    const dayTasks = getTasksForDate(tasks, dateStr);

    days.push({
      date: dateStr,
      dayNumber: current.getDate(),
      isCurrentMonth,
      isToday: dateStr === todayStr,
      taskCount: dayTasks.length,
      hasCritical: dayTasks.some(t => t.severity === 'Critical'),
    });
  }

  return days;
}
