import { useState } from 'react';
import { Task, ComplianceRule } from '../types';
import { buildCalendarDays, toISODateString } from '../utils/calendarUtils';
import ComplianceEnginePage from '../pages/ComplianceEnginePage';

interface Props {
  isOpen: boolean;
  criticalTasks: Task[];
  onClose: () => void;
  onAddTasks: (tasks: Task[]) => void;
}

const CATEGORY_PILLS = [
  { label: 'Critical',           count: 4,  color: 'text-red-500'    },
  { label: 'Compliance',         count: 97, color: 'text-green-500'  },
  { label: 'EPE Due',            count: 3,  color: 'text-red-500'    },
  { label: 'Missing Docs',       count: 6,  color: 'text-red-500'    },
  { label: 'Overdue',            count: 2,  color: 'text-red-500'    },
  { label: 'Pending',            count: 15, color: 'text-orange-400' },
  { label: 'Pending Reports',    count: 6,  color: 'text-blue-500'   },
  { label: 'Pregnancy Declared', count: 2,  color: 'text-yellow-500' },
  { label: 'Unassigned',         count: 6,  color: 'text-blue-500'   },
];

const ASSIGNEES = [
  'All',
  'Dr. Sarah Johnson',
  'Dr. Lisa Park',
  'Maria Rodriguez',
  'Dr. John Smith',
  'Unassigned',
];

const STATUSES = ['All', 'Overdue', 'Due Today', 'Upcoming', 'Pending'];

const DOW = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function formatDueDate(isoDate: string): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  return `${m}/${d}/${y}`;
}

export default function ActionCenterPanel({ isOpen, criticalTasks, onClose, onAddTasks }: Props) {
  const [searchQuery, setSearchQuery]           = useState('');
  const [activePill, setActivePill]             = useState<string | null>(null);
  const [assigneesOpen, setAssigneesOpen]       = useState(false);
  const [selectedAssignee, setSelectedAssignee] = useState('All');
  const [statusesOpen, setStatusesOpen]         = useState(false);
  const [selectedStatus, setSelectedStatus]     = useState('Overdue');
  const [calMonth, setCalMonth]                 = useState(() => new Date());
  const [selectedCalDate, setSelectedCalDate]   = useState<string | null>(null);

  const [reviewLoading, setReviewLoading]       = useState(false);
  const [reviewError, setReviewError]           = useState<string | null>(null);
  const [complianceData, setComplianceData]     = useState<ComplianceRule[] | null>(null);
  const [showCompliance, setShowCompliance]     = useState(false);

  const todayStr = toISODateString(new Date());
  const calDays  = buildCalendarDays(calMonth.getFullYear(), calMonth.getMonth(), criticalTasks);
  const monthLabel = calMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  const filteredTasks = criticalTasks.filter(t =>
    !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleReviewRules = async () => {
    setReviewLoading(true);
    setReviewError(null);
    try {
      const res = await fetch(import.meta.env.VITE_COMPLIANCE_DYNAMODB_URL);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      const rules: ComplianceRule[] = Array.isArray(json) ? json : (json.rules ?? []);
      setComplianceData(rules);
      setShowCompliance(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load compliance rules';
      setReviewError(msg);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleCreateActionItems = (tasks: Task[]) => {
    onAddTasks(tasks);
    setShowCompliance(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-[#f3f4f6] overflow-y-auto"
        onClick={() => {
          if (assigneesOpen) setAssigneesOpen(false);
          if (statusesOpen) setStatusesOpen(false);
        }}
      >

        {/* ── HEADER ─────────────────────────────────────────────────── */}
        <header className="bg-white border-b border-gray-200 px-8 h-[60px] flex items-center gap-4 sticky top-0 z-10">
          <span className="font-black text-[#1a2744] text-[22px] tracking-wider select-none">
            LANDAUER<sup className="text-[12px] font-bold">®</sup>
          </span>

          <div className="ml-auto flex items-center gap-3">
            <button className="text-gray-500 hover:text-gray-800 p-1 bg-transparent border-0 cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold text-[13px] px-4 py-1.5 rounded-md border-0 cursor-pointer transition-colors">
              Action Center
            </button>
            <button
              className="bg-white hover:bg-gray-50 text-gray-800 font-medium text-[13px] px-4 py-1.5 rounded-md border border-gray-300 cursor-pointer transition-colors"
              onClick={onClose}
            >
              Logout
            </button>
          </div>
        </header>

        {/* ── PAGE BODY ──────────────────────────────────────────────── */}
        <div className="px-8 py-6">

          {/* Breadcrumb */}
          <div className="flex items-center gap-3 mb-6">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={onClose}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
            <span className="text-gray-400 text-[14px]">Dashboard /</span>
            <span className="text-[#1a2744] font-bold text-[14px]">Action Center</span>
          </div>

          {/* Alert Banner */}
          <div className="flex items-center gap-4 bg-[#fefce8] border border-yellow-200 rounded-lg px-5 py-3.5 mb-7">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-yellow-500 flex-shrink-0">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
            </svg>
            <div className="flex-1">
              <p className="text-[13px] text-gray-800">
                <span className="font-semibold">Compliance Review Required:</span>{' '}
                2 compliance rules need your attention. Click "Review Rules" to validate your compliance status.
              </p>
              {reviewError && (
                <p className="text-[12px] text-red-600 mt-1">{reviewError}</p>
              )}
            </div>
            <button
              onClick={handleReviewRules}
              disabled={reviewLoading}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-70 text-white font-semibold text-[13px] px-4 py-2 rounded-md flex-shrink-0 border-0 cursor-pointer transition-colors"
            >
              {reviewLoading ? (
                <svg className="w-4 h-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
                </svg>
              )}
              {reviewLoading ? 'Loading…' : 'Review Rules'}
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2 mb-7">
            {CATEGORY_PILLS.map(pill => {
              const isActive = activePill === pill.label;
              return (
                <button
                  key={pill.label}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-full border text-[13px] font-medium cursor-pointer transition-colors ${
                    isActive
                      ? 'border-[#1a2744] bg-[#1a2744] text-white'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                  onClick={() => setActivePill(isActive ? null : pill.label)}
                >
                  {pill.label}
                  <span className={`font-bold ${isActive ? 'text-white' : pill.color}`}>
                    {pill.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* ── TWO-COLUMN AREA ─────────────────────────────────────── */}
          <div className="flex gap-5 items-start">

            {/* LEFT: Filters + Task List */}
            <div className="flex-1 min-w-0">

              {/* Filter Row */}
              <div className="flex items-center gap-2 mb-5 flex-wrap">

                {/* Search */}
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-full text-[13px] bg-white w-52 focus:outline-none focus:border-gray-400"
                  />
                </div>

                {['Due Date', 'Priorities', 'Categories'].map(label => (
                  <button
                    key={label}
                    className="flex items-center gap-1.5 px-4 py-2 border border-gray-300 rounded-full text-[13px] font-medium text-gray-700 bg-white hover:border-gray-400 cursor-pointer"
                  >
                    {label}
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                ))}

                {/* Assignees */}
                <div className="relative mt-4" onClick={e => e.stopPropagation()}>
                  <span className="absolute -top-4 left-3 text-[11px] text-gray-500 leading-none">Assignees</span>
                  <button
                    className={`flex items-center justify-between gap-2 px-4 py-2 rounded-full text-[13px] bg-white cursor-pointer w-36 transition-colors ${
                      assigneesOpen ? 'border-2 border-[#1a2744]' : 'border-2 border-gray-300 hover:border-gray-400'
                    }`}
                    onClick={() => setAssigneesOpen(o => !o)}
                  >
                    <span className="text-gray-400 text-[12px] truncate">
                      {selectedAssignee !== 'All' ? selectedAssignee : ''}
                    </span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 flex-shrink-0 text-gray-600 transition-transform ${assigneesOpen ? 'rotate-180' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  {assigneesOpen && (
                    <div className="absolute top-[calc(100%+4px)] left-0 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                      {ASSIGNEES.map(name => (
                        <button
                          key={name}
                          className="w-full text-left px-4 py-2.5 text-[13px] text-gray-700 hover:bg-gray-50 cursor-pointer border-0 bg-transparent block"
                          onClick={() => { setSelectedAssignee(name); setAssigneesOpen(false); }}
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Statuses */}
                <div className="relative mt-4" onClick={e => e.stopPropagation()}>
                  {(selectedStatus !== 'All' || statusesOpen) && (
                    <span className="absolute -top-4 left-3 text-[11px] text-gray-500 leading-none">Statuses</span>
                  )}
                  <button
                    className={`flex items-center justify-between gap-2 px-4 py-2 rounded-full text-[13px] bg-white cursor-pointer transition-colors ${
                      selectedStatus !== 'All' || statusesOpen
                        ? 'border-2 border-[#1a2744] font-medium text-gray-800 w-36'
                        : 'border border-gray-300 hover:border-gray-400 font-medium text-gray-700 w-28'
                    }`}
                    onClick={() => setStatusesOpen(o => !o)}
                  >
                    <span className="truncate">{selectedStatus !== 'All' ? selectedStatus : 'Statuses'}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={`w-3 h-3 flex-shrink-0 text-gray-600 transition-transform ${statusesOpen ? 'rotate-180' : ''}`}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
                    </svg>
                  </button>
                  {statusesOpen && (
                    <div className="absolute top-[calc(100%+4px)] left-0 w-40 bg-white border border-gray-200 rounded-xl shadow-lg z-20 overflow-hidden">
                      {STATUSES.map(s => (
                        <button
                          key={s}
                          className={`w-full text-left px-4 py-2.5 text-[13px] cursor-pointer border-0 block transition-colors ${
                            selectedStatus === s ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-50 bg-transparent'
                          }`}
                          onClick={() => { setSelectedStatus(s); setStatusesOpen(false); }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Task Management Panel */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-200">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  <span className="font-bold text-[14px] text-gray-800">Task Management</span>
                  <span className="text-[12px] text-gray-400 font-normal">{criticalTasks.length} tasks</span>
                  <button
                    className="text-[12px] text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-0 ml-1"
                    onClick={() => { setSearchQuery(''); setActivePill(null); setSelectedAssignee('All'); setSelectedStatus('Overdue'); }}
                  >
                    Clear Filters
                  </button>
                  <button className="ml-auto flex items-center gap-1.5 text-[13px] font-medium text-gray-600 hover:text-gray-900 cursor-pointer bg-transparent border-0">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Add Task
                  </button>
                </div>

                {filteredTasks.length === 0 ? (
                  <p className="px-5 py-6 text-[13px] text-gray-400 italic">No tasks match your search.</p>
                ) : (
                  filteredTasks.map(task => (
                    <div
                      key={task.id}
                      className="border-l-4 border-l-red-500 border-b border-gray-100 last:border-b-0 px-5 py-4 bg-red-50 hover:bg-red-100/60 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                          <span className="font-semibold text-[14px] text-gray-800">{task.title}</span>
                          <span className="bg-red-100 text-red-600 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex-shrink-0">
                            Critical
                          </span>
                        </div>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
                        </svg>
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[12px] text-gray-600">
                          Due: <span className="font-semibold">{formatDueDate(task.dueDate)}</span>
                        </span>
                        <span className="text-[12px] text-gray-500">Assignee: {task.assignee.name}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">{task.category.toLowerCase()}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* RIGHT: Calendar Sidebar */}
            <div className="w-72 flex-shrink-0">
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200">
                  <div className="flex items-center gap-1.5">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
                    </svg>
                    <span className="font-semibold text-[14px] text-gray-700">Task Calendar</span>
                  </div>
                  <button
                    className="text-[12px] font-medium text-gray-600 border border-gray-300 px-3 py-1 rounded-md hover:bg-gray-50 cursor-pointer"
                    onClick={() => { setCalMonth(new Date()); setSelectedCalDate(todayStr); }}
                  >
                    Today
                  </button>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <button
                    className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <span className="font-bold text-[14px] text-gray-800">{monthLabel}</span>
                  <button
                    className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer"
                    onClick={() => setCalMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </div>

                <div className="grid grid-cols-7 mb-1">
                  {DOW.map(d => (
                    <span key={d} className="text-center text-[10px] font-medium text-gray-400 uppercase">{d}</span>
                  ))}
                </div>

                <div className="grid grid-cols-7">
                  {calDays.map(day => {
                    const isToday    = day.date === todayStr;
                    const isSelected = day.date === selectedCalDate && !isToday;
                    return (
                      <div
                        key={day.date}
                        className="w-8 h-8 flex items-center justify-center relative"
                        onClick={() => {
                          if (!day.isCurrentMonth) return;
                          setSelectedCalDate(day.date === selectedCalDate ? null : day.date);
                        }}
                      >
                        <span className={[
                          'text-[12px] w-7 h-7 rounded-full flex items-center justify-center',
                          !day.isCurrentMonth
                            ? 'text-gray-300'
                            : isToday
                              ? 'border-2 border-orange-400 text-orange-500 font-bold cursor-pointer'
                              : isSelected
                                ? 'bg-orange-500 text-white font-bold cursor-pointer'
                                : 'text-gray-700 hover:bg-gray-100 cursor-pointer',
                        ].join(' ')}>
                          {day.dayNumber}
                        </span>
                        {day.taskCount > 0 && day.isCurrentMonth && !isToday && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-400" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Compliance Engine overlay */}
      {showCompliance && complianceData && (
        <ComplianceEnginePage
          rules={complianceData}
          onBack={() => setShowCompliance(false)}
          onCreateActionItems={handleCreateActionItems}
        />
      )}
    </>
  );
}
