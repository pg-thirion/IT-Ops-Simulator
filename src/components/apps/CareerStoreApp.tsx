import React from 'react';
import {
  ShoppingBag,
  Cpu,
  Monitor,
  Coffee,
  Check,
  Zap,
  Terminal,
} from 'lucide-react';
import { CareerStats, StoreItem } from '../../types/game';
import { sound } from '../../utils/audio';

interface CareerStoreAppProps {
  career: CareerStats;
  storeItems: StoreItem[];
  onPurchaseItem: (item: StoreItem) => void;
}

export const CareerStoreApp: React.FC<CareerStoreAppProps> = ({
  career,
  storeItems,
  onPurchaseItem,
}) => {
  const getRankBadge = (lvl: number) => {
    if (lvl >= 5) return 'IT Operations Director';
    if (lvl >= 4) return 'Senior Infrastructure Architect';
    if (lvl >= 3) return 'Network Systems Engineer';
    if (lvl >= 2) return 'Junior Systems Administrator';
    return 'Helpdesk Support Specialist';
  };

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'monitor':
        return <Monitor className="text-sky-400" size={24} />;
      case 'coffee':
        return <Coffee className="text-amber-400" size={24} />;
      case 'cpu':
        return <Cpu className="text-emerald-400" size={24} />;
      case 'terminal':
        return <Terminal className="text-purple-400" size={24} />;
      default:
        return <Zap className="text-rose-400" size={24} />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#12151c] text-slate-100 select-none overflow-y-auto p-5">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Career Profile Card */}
        <div className="bg-gradient-to-r from-[#191e2b] via-[#202738] to-[#191e2b] border border-slate-700/60 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-center justify-between gap-5">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-2xl text-white shadow-lg shadow-blue-500/20">
              L{career.level}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-100">{career.playerName}</h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold uppercase tracking-wider">
                  Level {career.level}
                </span>
              </div>
              <p className="text-xs text-sky-300 font-semibold mt-0.5">{getRankBadge(career.level)}</p>

              {/* XP Bar */}
              <div className="mt-2 flex items-center space-x-3 text-xs">
                <div className="w-48 bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-700">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (career.xp / career.xpForNextLevel) * 100)}%` }}
                  />
                </div>
                <span className="font-mono text-[11px] text-slate-400">
                  {career.xp} / {career.xpForNextLevel} XP
                </span>
              </div>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center space-x-4">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center min-w-[100px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Cash Balance</div>
              <div className="text-lg font-mono font-extrabold text-emerald-400">
                R{career.cash.toLocaleString()}
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 text-center min-w-[100px]">
              <div className="text-[10px] uppercase font-bold text-slate-400">Tickets Resolved</div>
              <div className="text-lg font-mono font-extrabold text-sky-400">
                {career.ticketsResolved}
              </div>
            </div>
          </div>
        </div>

        {/* Tech & Equipment Store */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShoppingBag size={18} className="text-rose-400" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                IT Gear &amp; Tool Upgrades Store
              </h3>
            </div>
            <span className="text-xs text-slate-400">Spend earned budget on diagnostic equipment</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {storeItems.map((item) => {
              const canAfford = career.cash >= item.price;

              return (
                <div
                  key={item.id}
                  className={`bg-[#171a23] border rounded-xl p-4 flex flex-col justify-between transition-all ${
                    item.purchased
                      ? 'border-emerald-600/40 bg-emerald-950/15'
                      : 'border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                      {getItemIcon(item.icon)}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-100">{item.name}</h4>
                        <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-semibold">
                          {item.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {item.description}
                      </p>
                      <div className="text-[11px] text-sky-400 font-semibold mt-2">
                        Effect: {item.effect}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-xs font-mono font-bold text-emerald-400">
                      R{item.price.toLocaleString()}
                    </div>

                    {item.purchased ? (
                      <span className="px-3 py-1 bg-emerald-950/60 text-emerald-400 border border-emerald-700/40 rounded-lg text-xs font-bold flex items-center space-x-1">
                        <Check size={12} />
                        <span>Purchased</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            sound.playSuccess();
                            onPurchaseItem(item);
                          } else {
                            sound.playError();
                          }
                        }}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          canAfford
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        {canAfford ? 'Purchase' : 'Insufficient Funds'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
