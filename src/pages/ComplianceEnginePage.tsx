import { ComplianceRule, ComplianceStatus, Task, Assignee, TaskCategory, Severity } from '../types';

const STATUS_CONFIG: Record<ComplianceStatus, { label: string; bg: string; text: string }> = {
  COMPLIANT:     { label: 'Compliant',     bg: 'bg-green-100', text: 'text-green-700'  },
  NON_COMPLIANT: { label: 'Non-Compliant', bg: 'bg-red-100',   text: 'text-red-700'    },
  NEEDS_REVIEW:  { label: 'Needs Review',  bg: 'bg-amber-100', text: 'text-amber-700'  },
};

function computeSummary(rules: ComplianceRule[]) {
  const compliant    = rules.filter(r => r.status === 'COMPLIANT').length;
  const needsReview  = rules.filter(r => r.status === 'NEEDS_REVIEW').length;
  const nonCompliant = rules.filter(r => r.status === 'NON_COMPLIANT').length;
  const total = rules.length;
  const overallPct = total ? Math.round((compliant / total) * 100) : 0;
  return { total, compliant, needsReview, nonCompliant, overallPct };
}

function buildTasksFromViolations(rules: ComplianceRule[]): Task[] {
  const assignee: Assignee = { id: 'unassigned', name: 'Unassigned', initials: 'UN' };
  const due = new Date();
  due.setDate(due.getDate() + 7);
  const dueDate = due.toISOString().split('T')[0];

  return rules
    .filter(r => r.status !== 'COMPLIANT')
    .map(r => ({
      id: `compliance-${r.id}`,
      title: r.name,
      description: r.description,
      severity: (r.status === 'NON_COMPLIANT' ? 'Critical' : 'High') as Severity,
      category: 'Regulation' as TaskCategory,
      status: 'Upcoming' as const,
      dueDate,
      assignee,
    }));
}

interface Props {
  rules: ComplianceRule[];
  onBack: () => void;
  onCreateActionItems: (tasks: Task[]) => void;
}

export default function ComplianceEnginePage({ rules, onBack, onCreateActionItems }: Props) {
  const summary = computeSummary(rules);
  const violatedCount = rules.filter(r => r.status !== 'COMPLIANT').length;

  const pctColor =
    summary.overallPct >= 80 ? 'text-green-600' :
    summary.overallPct >= 60 ? 'text-amber-500' :
    'text-red-600';

  const handleCreate = () => {
    onCreateActionItems(buildTasksFromViolations(rules));
  };

  return (
    <div className="fixed inset-0 z-[60] bg-[#f3f4f6] overflow-y-auto">

      {/* Header */}
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
            onClick={onBack}
          >
            Close
          </button>
        </div>
      </header>

      {/* Body */}
      <div className="px-8 py-6">

        {/* Breadcrumb + Create Action Items */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-md bg-white text-[13px] font-medium text-gray-700 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={onBack}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back
            </button>
            <span className="text-gray-400 text-[14px]">Dashboard /</span>
            <span className="text-gray-400 text-[14px]">Action Center /</span>
            <span className="text-[#1a2744] font-bold text-[14px]">Compliance Engine</span>
          </div>

          <button
            onClick={handleCreate}
            disabled={violatedCount === 0}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-[13px] px-5 py-2 rounded-md border-0 cursor-pointer transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Create Action Items ({violatedCount})
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4 mb-7">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2">Overall Compliance</p>
            <p className={`text-[42px] font-black leading-none mb-1 ${pctColor}`}>{summary.overallPct}%</p>
            <p className="text-[12px] text-gray-400">{summary.total} rules reviewed</p>
          </div>

          <div className="bg-white rounded-xl border border-green-200 p-5">
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2">Compliant Rules</p>
            <p className="text-[42px] font-black leading-none mb-1 text-green-600">{summary.compliant}</p>
            <p className="text-[12px] text-gray-400">rules passing</p>
          </div>

          <div className="bg-white rounded-xl border border-amber-200 p-5">
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2">Needs Review</p>
            <p className="text-[42px] font-black leading-none mb-1 text-amber-500">{summary.needsReview}</p>
            <p className="text-[12px] text-gray-400">rules pending</p>
          </div>

          <div className="bg-white rounded-xl border border-red-200 p-5">
            <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2">Non-Compliant</p>
            <p className="text-[42px] font-black leading-none mb-1 text-red-600">{summary.nonCompliant}</p>
            <p className="text-[12px] text-gray-400">rules failing</p>
          </div>
        </div>

        {/* Rule Cards */}
        {rules.length === 0 ? (
          <p className="text-center py-16 text-gray-400 text-[13px]">No compliance rules returned.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {rules.map(rule => {
              const cfg = STATUS_CONFIG[rule.status];
              return (
                <div key={rule.id} className="bg-white rounded-xl border border-gray-200 p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <h3 className="font-semibold text-[14px] text-gray-800 flex-1">{rule.name}</h3>
                    <span className={`flex-shrink-0 ${cfg.bg} ${cfg.text} text-[11px] font-bold px-2.5 py-1 rounded-full`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-600 mb-4 leading-relaxed">{rule.description}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-indigo-50 text-indigo-600 text-[11px] font-medium px-2.5 py-0.5 rounded-full">
                      {rule.category}
                    </span>
                    <span className="text-gray-400 text-[12px]">{rule.regulation}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
