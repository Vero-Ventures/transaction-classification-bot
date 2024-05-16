import prisma from '@/lib/db';

const fetcher = async () => {
  'use server';
  return prisma.user.findMany();
};

export default async function Users() {
  const data = await fetcher();
  return (
    <div className="flex flex-col items-center justify-center py-2">
      <h1 className="text-2xl font-bold mb-5">Database Users</h1>
      <div className="overflow-x-auto">
        <div className="align-middle inline-block min-w-full shadow overflow-hidden sm:rounded-lg border-b border-gray-200">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {data.map(user => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    {user.id}
                  </td>
                  <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                    {user.email}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
