export type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

export type TaskCategory =
  | 'Equipment'
  | 'Regulation'
  | 'Inventory'
  | 'Training'
  | 'Inspection'
  | 'Reporting';

export type TaskStatus = 'Overdue' | 'Due Today' | 'Upcoming';

export interface Assignee {
  id: string;
  name: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  severity: Severity;
  category: TaskCategory;
  status: TaskStatus;
  dueDate: string;
  assignee: Assignee;
}

export interface CalendarDay {
  date: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  taskCount: number;
  hasCritical: boolean;
}

export interface DashboardState {
  selectedDate: string | null;
  isActionCenterOpen: boolean;
  activeSeverityFilter: Severity | null;
}

export type ComplianceStatus = 'COMPLIANT' | 'NON_COMPLIANT' | 'NEEDS_REVIEW';

export interface ComplianceRule {
  id: string;
  name: string;
  description: string;
  category: string;
  regulation: string;
  status: ComplianceStatus;
}
