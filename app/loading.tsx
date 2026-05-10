/** Global route transition — clinical workspace canvas (no warm paper flash). */
export default function RootLoading() {
  return (
    <div
      className="flex min-h-[100dvh] w-full max-w-full min-w-0 flex-col items-center justify-center gap-3 px-4"
      style={{ background: "#F7F9FC" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="256"
        height="256"
        viewBox="0 0 256 256"
        fill="none"
        className="h-11 w-11"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="root-loading-logo" x1="50" y1="42" x2="210" y2="214" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#E0F2FE" />
          </linearGradient>
        </defs>
        <rect x="42" y="42" width="172" height="172" rx="48" fill="url(#root-loading-logo)" />
        <rect
          x="42.75"
          y="42.75"
          width="170.5"
          height="170.5"
          rx="47.25"
          stroke="#0284C7"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
        <path
          d="M92 90C103 81.333 115 77 128 77C141 77 153 81.333 164 90"
          stroke="#0284C7"
          strokeOpacity="0.34"
          strokeWidth="9"
          strokeLinecap="round"
        />
        <path
          d="M99 103L128 131L157 103"
          stroke="#0284C7"
          strokeWidth="11"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M128 130V157" stroke="#0284C7" strokeWidth="11" strokeLinecap="round" />
        <path
          d="M96 171C106.333 181 117 186 128 186C139 186 149.667 181 160 171"
          stroke="#0284C7"
          strokeWidth="10"
          strokeLinecap="round"
        />
      </svg>
      <p className="text-center text-[15px] font-medium tracking-tight text-gray-900">
        <span className="font-light italic">Your</span> Dentist
      </p>
      <svg
        className="h-5 w-5 shrink-0 animate-spin text-[#0284C7]/50"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" fill="none" />
        <path
          className="opacity-70"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  );
}
