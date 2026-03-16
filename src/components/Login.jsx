import React from 'react';
import { Calculator } from 'lucide-react';

export default function Login({ loginId, setLoginId, password, setPassword, handleLogin, authError }) {
  return (
    <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6 text-left">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-orange-100 animate-in zoom-in-95 duration-500 text-left">
        <div className="text-center space-y-2 text-slate-900">
          <div className="bg-orange-600 w-16 h-16 rounded-3xl flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-200">
            <Calculator size={32} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter uppercase">クリエットアプリ</h1>
          <p className="text-slate-400 text-[10px] font-bold tracking-[0.3em] uppercase text-center">いっしょにたのしいプログラミングをまなぼう！</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-6 text-left">
          <div className="space-y-4 text-left">
            <div className="text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block text-left">ログイン ID</label>
              <input
                type="text"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none text-left"
              />
            </div>
            <div className="text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block text-left">パスワード</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none text-left"
              />
            </div>
          </div>
          {authError && <p className="text-rose-500 text-[10px] font-bold text-center bg-rose-50 py-2 rounded-xl border border-rose-100">{authError}</p>}
          <button type="submit" className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-orange-700 transition-all active:scale-95 text-base">ログイン</button>
        </form>
      </div>
    </div>
  );
}
