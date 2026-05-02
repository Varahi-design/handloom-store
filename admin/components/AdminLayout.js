import Sidebar from './Sidebar';
import { useAdmin } from '../context/AdminContext';

export default function AdminLayout({ children }) {
  const { admin, logout } = useAdmin();
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-auto bg-gray-50">
        <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span>{admin?.email}</span>
            <button onClick={logout} className="text-red-600">Logout</button>
          </div>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}