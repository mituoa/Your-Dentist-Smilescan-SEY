export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full min-w-0 max-w-full overflow-x-hidden">{children}</div>
  );
}
