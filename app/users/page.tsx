import Counter from "./counter";
import prisma from "../../lib/prisma";

export default async function UsersPage() {
  const users = await safe(prisma.user.findMany({ orderBy: { id: "desc" } }));

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td className="border p-2">{user.id}</td>
                <td className="border p-2">{user.name}</td>
                <td className="border p-2">{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Counter />
    </div>
  );
}

function safe<T>(p: Promise<T>) {
  return p.catch((e) => {
    console.error("Prisma Error:", e);
    throw new Error("Database error");
  });
}
