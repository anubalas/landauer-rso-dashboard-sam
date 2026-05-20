import { useState } from 'react';
import { Severity, Task } from '../types';
import { MOCK_TASKS } from '../data/mockTasks';
import Header from '../components/Header';
import { useAuth } from '../auth/AuthContext';
import TaskListPanel from '../components/TaskListPanel';
import CalendarSidebar from '../components/CalendarSidebar';
import ActionCenterPanel from '../components/ActionCenterPanel';

export default function DashboardPage() {
  const { signOut } = useAuth();
  const [extraTasks, setExtraTasks]             = useState<Task[]>([]);
  const [selectedDate, setSelectedDate]         = useState<string | null>(null);
  const [isActionCenterOpen, setIsActionCenterOpen] = useState(false);
  const [activeSeverityFilter, setActiveSeverityFilter] = useState<Severity | null>(null);

  const allTasks = [...MOCK_TASKS, ...extraTasks];

  const handleDateSelect = (date: string) => {
    setSelectedDate(date === '' || date === selectedDate ? null : date);
  };

  const handleMonthChange = () => {
    setSelectedDate(null);
  };

  const handleAddTasks = (tasks: Task[]) => {
    setExtraTasks(prev => [...prev, ...tasks]);
  };

  return (
    <div className="flex flex-col h-full">
      <Header
        onActionCenterClick={() => setIsActionCenterOpen(true)}
        onLogout={signOut}
      />

      <div className="flex flex-1 overflow-hidden">
        <TaskListPanel
          tasks={allTasks}
          activeSeverityFilter={activeSeverityFilter}
          onFilterChange={setActiveSeverityFilter}
        />
        <div className="pt-4 pr-4 flex-shrink-0">
          <CalendarSidebar
            tasks={allTasks}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onMonthChange={handleMonthChange}
          />
        </div>
      </div>

      <ActionCenterPanel
        isOpen={isActionCenterOpen}
        criticalTasks={allTasks.filter(t => t.severity === 'Critical')}
        onClose={() => setIsActionCenterOpen(false)}
        onAddTasks={handleAddTasks}
      />
    </div>
  );
}
