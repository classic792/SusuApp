import React from 'react';

const MiniHistory = ({ items }) => {
  if (!items || items.length === 0) {
    return <p className="text-xs text-slate-400 italic">No recent transactions</p>;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => (
        <div key={index} className="flex items-center justify-between text-xs">
          <div className="flex flex-col">
            <span className="font-semibold text-slate-700">{item.type}</span>
            <span className="text-slate-400">{item.date}</span>
          </div>
          <span className={`font-bold ${item.amount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString('en-GH', { style: 'currency', currency: 'GHS' })}
          </span>
        </div>
      ))}
    </div>
  );
};

export default MiniHistory;
