import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, icon, actions, className = '' }) => {
  return (
    <div className={`flex items-start justify-between ${className}`}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">{title}</h2>
          {subtitle && <p className="text-slate-500 mt-1 text-sm md:text-base">{subtitle}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-2">{actions}</div>
      )}
    </div>
  );
};

export default SectionHeader;


