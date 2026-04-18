export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-surface-page flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="font-serif text-4xl font-light tracking-tight text-text-primary">
            SmileScan
          </h1>
        </div>
        {children}
      </div>
    </div>
  );
}
