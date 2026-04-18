import React, { useState } from 'react';
import { Calculator, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function Login({ loginId, setLoginId, password, setPassword, handleLogin, authError, isLoggingIn }) {
  const [showPw, setShowPw] = useState(false);

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

        <form onSubmit={handleLogin} className="space-y-6 text-left" autoComplete="on">
          <div className="space-y-4 text-left">
            <div className="text-left">
              <label htmlFor="login-id" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block text-left">
                ログイン ID
              </label>
              <input
                id="login-id"
                type="text"
                value={loginId}
                onChange={e => setLoginId(e.target.value)}
                required
                autoComplete="username"
                disabled={isLoggingIn}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none text-left disabled:opacity-60"
              />
            </div>
            <div className="text-left">
              <label htmlFor="login-pw" className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block text-left">
                パスワード
              </label>
              <div className="relative">
                <input
                  id="login-pw"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  disabled={isLoggingIn}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 pr-12 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none text-left disabled:opacity-60"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  aria-label={showPw ? 'パスワードを非表示にする' : 'パスワードを表示する'}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          {authError && (
            <p role="alert" className="text-rose-500 text-[10px] font-bold text-center bg-rose-50 py-2 px-4 rounded-xl border border-rose-100">
              {authError}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoggingIn || !loginId || !password}
            className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-orange-700 transition-all active:scale-95 text-base flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {isLoggingIn ? (
              <><Loader2 size={20} className="animate-spin" /> ログイン中...</>
            ) : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
}
