import React from 'react';
import { 
  PlusCircle, 
  Wallet, 
  CreditCard, 
  HandCoins, 
  History 
} from 'lucide-react';
import DashboardCard from './DashboardCard';
import MiniHistory from './MiniHistory';

const ActionGrid = ({ onAction, miniHistory }) => {
  const actions = [
    {
      id: 'collection',
      title: 'Collect Susu',
      description: 'Record daily savings deposits from existing clients.',
      icon: Wallet,
      color: 'bg-violet-50 text-violet-600'
    },
    {
      id: 'register',
      title: 'Register New Account',
      description: 'Onboard new clients and enroll their biometric data.',
      icon: PlusCircle,
      color: 'bg-blue-50 text-blue-600'
    },
    {
      id: 'repayment',
      title: 'Make Repayment',
      description: 'Process loan repayments and update balances.',
      icon: CreditCard,
      color: 'bg-emerald-50 text-emerald-600'
    },
    {
      id: 'loan',
      title: 'Grant Loans',
      description: 'Initiate new loan applications for qualified clients.',
      icon: HandCoins,
      color: 'bg-amber-50 text-amber-600'
    },
    {
      id: 'history',
      title: 'History',
      description: 'View your recent transaction activities and records.',
      icon: History,
      color: 'bg-slate-50 text-slate-600',
      hasPreview: true
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {actions.map((action) => (
        <DashboardCard
          key={action.id}
          title={action.title}
          description={action.description}
          icon={action.icon}
          onClick={() => onAction(action.id)}
        >
          {action.hasPreview && miniHistory && (
            <div className="mt-2">
              <MiniHistory items={miniHistory} />
            </div>
          )}
        </DashboardCard>
      ))}
    </div>
  );
};

export default ActionGrid;
