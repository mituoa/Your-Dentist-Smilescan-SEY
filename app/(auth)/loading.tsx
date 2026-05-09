/** Minimal route transition — no heavy assets (instant paint on mobile). */
export default function AuthLoading() {
  return (
    <div className="flex min-h-[100dvh] w-full max-w-full min-w-0 items-center justify-center bg-[#FAFAFA] px-4">
      <p className="text-center text-[13px] font-medium text-gray-500">
        <span className="text-gray-900">Your Dentist</span>
        <span className="block mt-1 text-[12px] font-normal text-gray-500">Wird geladen…</span>
      </p>
    </div>
  );
}
