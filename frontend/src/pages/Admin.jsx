import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout.jsx";
import { Loading, ErrorState } from "../components/StateViews.jsx";
import api, { getErrorMessage } from "../services/api.js";

const Admin = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.get("/admin/statistics"), api.get("/admin/users")])
      .then(([s, u]) => {
        setStats(s.data);
        setUsers(u.data.users);
      })
      .catch((err) => setError(getErrorMessage(err)));
  }, []);

  if (error) return <DashboardLayout><ErrorState message={error} /></DashboardLayout>;
  if (!stats || !users) return <DashboardLayout><Loading /></DashboardLayout>;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-semibold mb-6">Admin</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          ["Total Users", stats.totalUsers],
          ["Total Documents", stats.totalDocuments],
          ["Total Summaries", stats.totalSummaries],
          ["Total Conversations", stats.totalConversations],
        ].map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-2xl font-semibold mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-5">
        <h2 className="font-semibold mb-4 text-sm">Registered Users</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="pb-2">Name</th>
                <th className="pb-2">Email</th>
                <th className="pb-2">Role</th>
                <th className="pb-2">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u._id}>
                  <td className="py-2">{u.name}</td>
                  <td className="py-2 text-slate-500">{u.email}</td>
                  <td className="py-2 capitalize">{u.role.replace("_", " ")}</td>
                  <td className="py-2 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Admin;
