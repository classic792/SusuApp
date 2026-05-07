import React from 'react';

const DashboardCard = ({ icon: Icon, title, description, onClick, children }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-violet-200 transition-all cursor-pointer group flex flex-col h-full"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-xl bg-violet-50 text-violet-600 group-hover:bg-violet-600 group-hover:text-white transition-colors">
          {Icon && <Icon size={24} />}
        </div>
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-1 group-hover:text-violet-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-4">
        {description}
      </p>
      
      {children && (
        <div className="mt-auto pt-4 border-t border-slate-50">
          {children}
        </div>
      )}
      
      {!children && (
        <div className="mt-auto flex items-center text-xs font-bold text-violet-600 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
          Open Action →
        </div>
      )}
    </div>
  );
};

export default DashboardCard;
