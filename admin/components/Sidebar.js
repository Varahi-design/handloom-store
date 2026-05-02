import Link from 'next/link';
import { useRouter } from 'next/router';
import { FaTachometerAlt, FaBox, FaShoppingCart, FaUsers, FaTags, FaPercent, FaShare } from 'react-icons/fa';

const menu = [
  { path: '/dashboard', icon: FaTachometerAlt, label: 'Dashboard' },
  { path: '/products', icon: FaBox, label: 'Products' },
  { path: '/orders', icon: FaShoppingCart, label: 'Orders' },
  { path: '/customers', icon: FaUsers, label: 'Customers' },
  { path: '/discounts', icon: FaPercent, label: 'Discounts' },
  { path: '/referral', icon: FaShare, label: 'Referral' },
];

export default function Sidebar() {
  const router = useRouter();
  return (
    <div className="w-64 bg-primary text-white flex flex-col">
      <div className="p-4 text-2xl font-bold border-b border-white/20">Handloom</div>
      <nav className="flex-1 py-4">
        {menu.map(item => (
          <Link key={item.path} href={item.path}
            className={`flex items-center gap-3 px-4 py-3 hover:bg-white/10 ${router.pathname === item.path ? 'bg-white/20' : ''}`}>
            <item.icon /> {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}