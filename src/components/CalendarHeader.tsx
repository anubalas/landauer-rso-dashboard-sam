interface Props {
  displayMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarHeader({ displayMonth, onPrevMonth, onNextMonth }: Props) {
  const label = displayMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex items-center justify-between mb-2">
      <button
        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer"
        onClick={onPrevMonth}
        aria-label="Previous month"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
      </button>

      <span className="text-[14px] font-bold text-gray-800">{label}</span>

      <button
        className="w-6 h-6 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 cursor-pointer"
        onClick={onNextMonth}
        aria-label="Next month"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
      </button>
    </div>
  );
}
