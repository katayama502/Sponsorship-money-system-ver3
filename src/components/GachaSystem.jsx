import React, { useState } from 'react';
import { PackageOpen, Sparkles, Coins } from 'lucide-react';
import { rollGacha, RARITY_RATES } from '../data/items';

export default function GachaSystem({ points, onRoll }) {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleRoll = async () => {
    if (points < 10) {
      setError('ポイントが足りません！');
      setTimeout(() => setError(''), 3000);
      return;
    }
    
    setIsRolling(true);
    setResult(null);
    setError('');

    // Simulate animation delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const pulledItem = rollGacha();
    await onRoll(pulledItem); // Deduct points and save to inventory
    
    setResult(pulledItem);
    setIsRolling(false);
  };

  const currentRarityStyle = RARITY_RATES.find(r => r.rarity === result?.rarity);

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm">
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start text-left">
        
        {/* Left: Gacha actions */}
        <div className="flex-1 space-y-6 w-full text-center md:text-left">
          <header>
            <h3 className="text-2xl font-black text-slate-800 flex items-center justify-center md:justify-start gap-3">
              <PackageOpen className="text-fuchsia-500" size={28} />
              装備ガチャ
            </h3>
            <p className="text-sm text-slate-500 font-medium mt-2">10ポイントでガチャを回して強力な装備をゲットしよう！</p>
          </header>

          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex flex-col items-center">
            <div className="text-center mb-6">
              <p className="text-xs font-black tracking-widest text-slate-400 uppercase mb-1">現在の保有ポイント</p>
              <div className="text-4xl font-black text-amber-500 flex items-center justify-center gap-2">
                <Coins size={32} />
                {points} <span className="text-lg text-slate-400">pt</span>
              </div>
            </div>

            <button
              onClick={handleRoll}
              disabled={isRolling || points < 10}
              className={`w-full max-w-sm py-4 rounded-xl flex items-center justify-center gap-2 text-lg font-black tracking-widest transition-all ${
                isRolling ? 'bg-slate-200 text-slate-400 cursor-not-allowed' :
                points < 10 ? 'bg-slate-100 text-slate-300 cursor-not-allowed' :
                'bg-fuchsia-500 text-white hover:bg-fuchsia-600 shadow-lg hover:shadow-xl hover:-translate-y-1'
              }`}
            >
              <Sparkles size={24} className={isRolling ? 'animate-spin' : 'animate-pulse'} />
              {isRolling ? 'ガチャを回しています...' : '1回 10pt で回す'}
            </button>
            {error && <p className="text-rose-500 font-bold text-sm mt-3 animate-bounce">{error}</p>}
          </div>

          {/* Probability Table */}
          <div className="bg-white border rounded-xl overflow-hidden text-xs">
            <div className="bg-slate-50 p-3 border-b font-black text-slate-600 text-center">排出確率</div>
            <div className="grid grid-cols-5 divide-x">
              {RARITY_RATES.map(r => (
                <div key={r.rarity} className="p-3 text-center flex flex-col gap-1 items-center">
                  <span className={`font-black ${r.color}`}>{r.rarity}</span>
                  <span className="text-slate-500 font-medium">{r.chance}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Result Display */}
        <div className="flex-1 w-full bg-slate-900 rounded-[2rem] p-8 min-h-[300px] flex flex-col items-center justify-center relative overflow-hidden text-center">
          {/* Decorative background stars */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-700 via-slate-900 to-black"></div>
          
          {isRolling ? (
            <div className="relative z-10 flex flex-col items-center gap-4 animate-bounce">
              <PackageOpen size={64} className="text-fuchsia-400" />
              <p className="text-fuchsia-300 font-black tracking-widest animate-pulse">OPENING...</p>
            </div>
          ) : result ? (
            <div className={`relative z-10 w-full animate-in zoom-in duration-500 delay-150`}>
              <div className={`absolute -inset-4 bg-gradient-to-r from-transparent via-${currentRarityStyle.color.split('-')[1]}-500 to-transparent opacity-20 blur-xl animate-pulse`}></div>
              <div className="relative bg-slate-800/80 backdrop-blur-md border border-slate-700 p-6 rounded-3xl w-full">
                <div className={`inline-block px-4 py-1 rounded-full text-xs font-black tracking-widest uppercase mb-4 shadow-lg ${currentRarityStyle.bg} ${currentRarityStyle.color} border ${currentRarityStyle.border}`}>
                  {result.rarity} RARE
                </div>
                <h4 className="text-3xl font-black text-white mb-2 tracking-tight drop-shadow-md">{result.name}</h4>
                <p className="text-[10px] font-bold text-slate-400 mb-6 uppercase tracking-widest">
                  {result.type === 'weapon' ? '⚔️ 武器' : result.type === 'armor' ? '🛡️ 防具' : '💍 装飾品'}
                </p>
                
                <div className="grid grid-cols-3 gap-2 mb-6">
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-emerald-900/50">
                    <p className="text-[9px] text-emerald-500 font-black uppercase mb-1">HP</p>
                    <p className="text-lg font-black text-emerald-400">{result.stats.hp > 0 ? `+${result.stats.hp}` : result.stats.hp}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-orange-900/50">
                    <p className="text-[9px] text-orange-500 font-black uppercase mb-1">ATK</p>
                    <p className="text-lg font-black text-orange-400">{result.stats.atk > 0 ? `+${result.stats.atk}` : result.stats.atk}</p>
                  </div>
                  <div className="bg-slate-900/50 rounded-lg p-3 border border-sky-900/50">
                    <p className="text-[9px] text-sky-500 font-black uppercase mb-1">DEF</p>
                    <p className="text-lg font-black text-sky-400">{result.stats.def > 0 ? `+${result.stats.def}` : result.stats.def}</p>
                  </div>
                </div>

                <p className="text-sm text-slate-300 font-medium italic">"{result.desc}"</p>
              </div>
            </div>
          ) : (
            <div className="relative z-10 text-slate-500 flex flex-col items-center gap-3">
              <PackageOpen size={48} className="opacity-30" />
              <p className="text-sm font-black tracking-widest">ガチャを回して結果を見よう</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
