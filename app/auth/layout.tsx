export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* You could put a logo here that shows on all auth pages */}
        <div className="flex justify-center mb-8">
          <div className="h-12 w-12 bg-blue-600 rounded-lg" />
        </div>
        {children}
      </div>
    </div>
  );
}
