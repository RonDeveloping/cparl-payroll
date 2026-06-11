// app/employees/page.tsx
import Link from "next/link";

export default function EmployeesPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
        <p className="mt-3 text-slate-600">
          Employee list and profiles are still being connected. You can create a
          new employee now.
        </p>
        <div className="mt-6">
          <Link
            href="/employees/new/edit"
            className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Create New Employee
          </Link>
        </div>
      </section>
    </main>
  );
}
