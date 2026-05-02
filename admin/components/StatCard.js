import { FaArrowUp, FaArrowDown } from 'react-icons/fa';

export default function StatCard({ icon: Icon, title, value, change, changeType }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          {Icon && <Icon className="text-primary text-xl" />}
        </div>
        {change !== undefined && (
          <span className={`flex items-center gap-1 text-sm font-semibold ${
            changeType === 'up' ? 'text-green-500' : 'text-red-500'
          }`}>
            {changeType === 'up' ? <FaArrowUp /> : <FaArrowDown />}
            {change}%
          </span>
        )}
      </div>
      <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-800">{value}</p>
    </div>
  );
}