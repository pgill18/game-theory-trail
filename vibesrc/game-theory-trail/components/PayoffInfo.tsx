import React from 'react';
import { Info } from 'lucide-react';

export const PayoffInfo: React.FC = () => {
  return (
    <div className="mt-8 bg-white/5 rounded-lg p-6 border border-white/20 max-w-2xl mx-auto">
      <div className="flex items-start gap-3">
        <Info className="text-emerald-400 mt-1 flex-shrink-0" size={20} />
        <div>
          <h3 className="text-white font-bold mb-2">Payoff Matrix</h3>
          <div className="text-emerald-200 text-sm space-y-1">
            <p>🤝🤝 Both Cooperate: 3 points each</p>
            <p>🤝⚔️ You Cooperate, Opponent Defects: 0 points (they get 5)</p>
            <p>⚔️🤝 You Defect, Opponent Cooperates: 5 points (they get 0)</p>
            <p>⚔️⚔️ Both Defect: 1 point each</p>
          </div>
        </div>
      </div>
    </div>
  );
};
