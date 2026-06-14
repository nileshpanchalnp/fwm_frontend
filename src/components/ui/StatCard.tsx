import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  sub: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  decorBg: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon, iconBg, iconColor, decorBg }) => (
  <div className="bg-white rounded-2xl p-6 flex items-start justify-between shadow-sm border border-gray-100 overflow-hidden relative">
    <div className="relative z-10">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${iconBg}`}>
        <span className={iconColor}>{icon}</span>
      </div>
      <p className="text-sm text-gray-500 font-medium mb-1">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1">{sub}</p>
    </div>
    <div className={`absolute -right-6 -top-6 w-28 h-28 rounded-full opacity-40 ${decorBg}`} />
  </div>
);

export default StatCard;