import React, { useState, useEffect, useRef } from 'react';
import {
  LogOut,
  Calculator,
  X,
  Clock,
  Sparkles,
  Crown,
  BookOpen,
  Save,
  FileArchive,
  Upload,
  Download,
  Trash2,
  MessageSquare,
  Trophy,
  PlayCircle,
  Link as LinkIcon,
  Star,
  CheckCircle2,
  Menu
} from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';
import { db, appId } from '../../firebase';
import TypingGame from '../TypingGame';
import GachaSystem from '../GachaSystem';
import { GACHA_ITEMS } from '../../data/items';
import { getLevelCharacter, getXpInfo, getLevelFromXp, XP_CUMULATIVE } from '../../utils/xpUtils';
import { getMaterialThumbnail, getYoutubeEmbedUrl } from '../../utils/materialUtils';

export default function StudentLayout({
  currentUser,
  setCurrentUser,
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleLogout,
  saveMessage,
  setSaveMessage,
  announcements,
  readAnnouncementIds,
  setReadAnnouncementIds,
  students,
  materials,
  learningRecords,
  newLearningRecord,
  setNewLearningRecord,
  submitLearningRecord,
  sb3Files,
  uploadSb3File,
  deleteSb3File,
  sb3InputRef,
  isUploadingSb3,
  messages,
  newMessage,
  setNewMessage,
  sendMessage,
  parentComment,
  setParentComment,
  handleMaterialOpen,
  toggleMaterialComplete,
  completionRequests,
  MATERIAL_CATEGORIES,
  isSendingMessage,
  reflectionTemplate
}) {
  // --- Local state ---
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const prevLevelRef = useRef(null);

  // Level-up detection
  useEffect(() => {
    const loggedInStudent = currentUser.role === 'student'
      ? students.find(s => s.id === currentUser.studentId)
      : students.find(s => s.id === currentUser.childId);
    const studentXp = loggedInStudent?.xp || 0;
    const level = getLevelFromXp(studentXp);
    if (prevLevelRef.current !== null && level > prevLevelRef.current) {
      setShowLevelUp(true);
      const timer = setTimeout(() => setShowLevelUp(false), 4000);
      return () => clearTimeout(timer);
    }
    prevLevelRef.current = level;
  }, [students, currentUser]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              aria-label="メニューをひらく"
              className="md:hidden p-2.5 -ml-2 text-slate-500 hover:bg-slate-100 rounded-2xl transition-all active:scale-90"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <div className="flex items-center gap-3 group cursor-default">
              <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-lg shadow-orange-500/30 transform group-hover:rotate-6 transition-transform duration-300">
                <Calculator size={22} strokeWidth={2.5} />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-800 uppercase flex items-center gap-1">
                クリエット<span className="text-orange-500">!</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <nav aria-label="メインナビゲーション" className="hidden md:flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl overflow-x-auto flex-nowrap">
              <button
                onClick={() => {
                  setActiveTab('mypage');
                  const allIds = announcements.map(a => a.id);
                  setReadAnnouncementIds(allIds);
                  localStorage.setItem('readAnnouncements', JSON.stringify(allIds));
                }}
                aria-current={activeTab === 'mypage' ? 'page' : undefined}
                className={`relative px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'mypage' ? 'bg-orange-500 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-white'}`}
              >
                マイページ
                {announcements.filter(a => !readAnnouncementIds.includes(a.id)).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {announcements.filter(a => !readAnnouncementIds.includes(a.id)).length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('materials')}
                aria-current={activeTab === 'materials' ? 'page' : undefined}
                className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'materials' ? 'bg-sky-500 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-white'}`}
              >きょうざいを見る</button>
              {currentUser.role === 'student' && (
                <button
                  onClick={() => setActiveTab('game')}
                  aria-current={activeTab === 'game' ? 'page' : undefined}
                  className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'game' ? 'bg-violet-500 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-white'}`}
                >🎮 ゲームで遊ぶ</button>
              )}
              <button
                onClick={() => setActiveTab('growth')}
                aria-current={activeTab === 'growth' ? 'page' : undefined}
                className={`px-4 py-2 rounded-xl text-sm font-black transition-all whitespace-nowrap ${activeTab === 'growth' ? 'bg-teal-500 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-white'}`}
              >📚 成長の軌跡</button>
            </nav>
            <button aria-label="ログアウトする" onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors ml-2 bg-slate-100 p-2.5 rounded-full"><LogOut size={20} /></button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Sidebar */}
      <aside aria-label="モバイルナビゲーション" className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
          <span className="font-black text-xl tracking-tight text-slate-800 flex items-center gap-2"><div className="bg-orange-500 p-2 rounded-xl text-white shadow-sm transform -rotate-3"><Calculator size={20} /></div>クリエット！</span>
          <button aria-label="メニューをとじる" className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={20} />
          </button>
        </div>
        <nav aria-label="モバイルメインナビゲーション" className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          <button onClick={() => { setActiveTab('mypage'); setIsMobileMenuOpen(false); }} aria-current={activeTab === 'mypage' ? 'page' : undefined} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'mypage' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>マイページ</button>
          <button onClick={() => { setActiveTab('materials'); setIsMobileMenuOpen(false); }} aria-current={activeTab === 'materials' ? 'page' : undefined} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'materials' ? 'bg-sky-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>きょうざいを見る</button>
          {currentUser.role === 'student' && (
            <button onClick={() => { setActiveTab('game'); setIsMobileMenuOpen(false); }} aria-current={activeTab === 'game' ? 'page' : undefined} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'game' ? 'bg-violet-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>🎮 ゲームで遊ぶ</button>
          )}
          <button onClick={() => { setActiveTab('growth'); setIsMobileMenuOpen(false); }} aria-current={activeTab === 'growth' ? 'page' : undefined} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'growth' ? 'bg-teal-500 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50'}`}>📚 成長の軌跡</button>
        </nav>
        <div className="p-4 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black hover:bg-slate-50 text-rose-500 rounded-xl transition-all"><LogOut size={18} /> ログアウト</button>
        </div>
      </aside>

      <main className="flex-grow max-w-4xl w-full mx-auto p-4 md:p-6 space-y-8 text-left text-slate-900">
        {/* Level-up celebration overlay */}
        {showLevelUp && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in duration-300"
            onClick={() => setShowLevelUp(false)}
          >
            <div className="bg-white rounded-3xl p-10 text-center shadow-2xl animate-in zoom-in duration-500">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-black text-orange-500">レベルアップ！</h2>
              <p className="text-slate-600 font-bold mt-2">クリックでとじる</p>
            </div>
          </div>
        )}

        {saveMessage && <div role="alert" className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce text-left"><CheckCircle2 size={18} className="text-emerald-400" /><span className="text-sm font-bold">{saveMessage}</span></div>}

        {/* 受講生・保護者向け: マイページ */}
        {(currentUser.role === 'student' || currentUser.role === 'parent') && activeTab === 'mypage' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 text-left text-slate-900">
            <header className="flex flex-col md:flex-row justify-between items-start gap-6 text-left">
              <div className="text-left">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <h2 className="text-3xl font-black tracking-tight text-left text-slate-800">{currentUser.name}さん <span className="text-orange-500 font-bold ml-2">のページ</span></h2>
                  {currentUser.role === 'parent' && currentUser.allChildren && currentUser.allChildren.length > 1 && (
                    <select
                      value={currentUser.childId}
                      onChange={(e) => {
                        const selectedChild = currentUser.allChildren.find(c => c.id === e.target.value);
                        if (selectedChild) {
                          setCurrentUser({
                            ...currentUser,
                            childId: selectedChild.id,
                            childName: selectedChild.name,
                            name: `${selectedChild.name}の保護者`,
                            nextClassDate: selectedChild.nextClassDate
                          });
                        }
                      }}
                      className="bg-orange-100 text-orange-700 font-bold px-4 py-2 rounded-xl text-sm border-2 border-transparent hover:border-orange-200 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-sm appearance-none"
                    >
                      {currentUser.allChildren.map(child => (
                        <option key={child.id} value={child.id}>{child.name} の記録を見る</option>
                      ))}
                    </select>
                  )}
                </div>
                <p className="text-slate-400 text-sm font-medium mt-1 text-left">きょうやったことや、つくったものをきろくして、せいちょうをのこそう！</p>
              </div>
              <div className="shrink-0">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xl flex flex-col justify-center"><p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5 tracking-widest"><Clock size={12} className="text-orange-500" /> つぎのじゅぎょう</p><p className="text-xl font-black text-slate-800 whitespace-nowrap">{currentUser.nextClassDate || 'まだ設定されていないよ'}</p></div>
              </div>
            </header>

            {/* つぎにやること (Next action hint) */}
            {currentUser.role === 'student' && (() => {
              const studentIdHint = currentUser.studentId;
              const hasPending = completionRequests.some(r => r.studentId === studentIdHint && r.status === 'pending');
              const hasUnreadAnnouncements = announcements.some(a => !readAnnouncementIds.includes(a.id));
              let hintBg = 'bg-emerald-50 border-emerald-200';
              let hintIcon = '🌟';
              let hintText = 'きょうもがんばろう！今日もクリエットで楽しく学ぼうね！';
              if (hasPending) {
                hintBg = 'bg-amber-50 border-amber-200';
                hintIcon = '⏳';
                hintText = '先生がかくにんちゅうだよ！もうすぐ結果がわかるよ！';
              } else if (hasUnreadAnnouncements) {
                hintBg = 'bg-sky-50 border-sky-200';
                hintIcon = '📢';
                hintText = 'あたらしいお知らせがあるよ！チェックしてみよう！';
              }
              return (
                <div className={`rounded-2xl border p-5 flex items-center gap-4 ${hintBg}`}>
                  <span className="text-3xl">{hintIcon}</span>
                  <div>
                    <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-0.5">つぎにやること</p>
                    <p className="font-black text-slate-800">{hintText}</p>
                  </div>
                </div>
              );
            })()}

            {/* Parent progress summary */}
            {currentUser.role === 'parent' && (() => {
              const childData = students.find(s => s.id === currentUser.childId);
              if (!childData) return null;
              const childXp = childData.xp || 0;
              const { level } = getXpInfo(childXp);
              const completedCount = childData.completedMaterials?.length || 0;
              const recentRecords = learningRecords
                .filter(r => r.studentId === currentUser.childId)
                .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0))
                .slice(0, 3);
              return (
                <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-6 md:p-8">
                  <h3 className="text-lg font-black text-slate-800 mb-4 flex items-center gap-2">📊 {childData.name}さんのせいちょう</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'レベル', value: `Lv.${level}`, icon: '⭐' },
                      { label: '合計XP', value: `${childXp.toLocaleString()} XP`, icon: '⚡' },
                      { label: 'クリア数', value: `${completedCount}教材`, icon: '🎯' },
                      { label: 'きろく数', value: `${learningRecords.filter(r => r.studentId === currentUser.childId).length}件`, icon: '📝' },
                    ].map(({ label, value, icon }) => (
                      <div key={label} className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                        <div className="text-2xl mb-1">{icon}</div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                        <p className="text-lg font-black text-slate-800">{value}</p>
                      </div>
                    ))}
                  </div>
                  {recentRecords.length > 0 && (
                    <div>
                      <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">さいきんのきろく</p>
                      <div className="space-y-2">
                        {recentRecords.map(r => (
                          <div key={r.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 border border-slate-100">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${r.recordType === 'goal' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                              {r.recordType === 'goal' ? '🎯 もくひょう' : '📝 ふりかえり'}
                            </span>
                            <p className="text-sm font-bold text-slate-700 truncate">{r.title}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* --- キャラクターとXPステータスバー --- */}
            {(() => {
              const loggedInStudent = currentUser.role === 'student' ? students.find(s => s.id === currentUser.studentId) : students.find(s => s.id === currentUser.childId);
              const studentXp = loggedInStudent?.xp || 0;
              const charInfo = getLevelCharacter(studentXp);
              const { level, xpInLevel, xpToNext, progressPct } = getXpInfo(studentXp);
              const isMaxLevel = level >= 20;
              const nextEvolution = level < 5 ? 5 : level < 10 ? 10 : level < 15 ? 15 : level < 20 ? 20 : null;

              return (
                <div className={`rounded-[2rem] border shadow-lg overflow-hidden flex flex-col md:flex-row items-center p-8 gap-8 transition-all ${charInfo.bg} ${charInfo.border}`}>
                  <div className="shrink-0 animate-bounce-slow bg-white/60 rounded-[2.5rem] shadow-sm transform hover:scale-105 transition-transform duration-300 flex items-center justify-center w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 relative overflow-hidden">
                    <img
                      src={charInfo.imageUrl}
                      alt="レベルアップキャラクター"
                      className="absolute inset-0 w-full h-full object-contain p-4 md:p-6 drop-shadow-xl"
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<div class="w-full h-full flex flex-col items-center justify-center text-slate-400 text-center font-bold text-4xl">🐣<br/><span class="text-[10px]">Not Found</span></div>'; }}
                    />
                  </div>
                  <div className="flex-1 w-full space-y-4 text-center md:text-left">
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">いまのレベル</p>
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <span className={`text-3xl font-black tabular-nums px-3 py-1 rounded-xl shadow-sm bg-white/60 ${charInfo.color}`}>Lv.{level}</span>
                        <h3 className={`text-2xl font-black flex items-center gap-2 ${charInfo.color}`}>
                          {isMaxLevel ? <Crown size={24} className="text-amber-500" /> : <Sparkles size={20} />}
                          {charInfo.name}
                        </h3>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                        <span>⚡ けいけんち (XP)</span>
                        {isMaxLevel
                          ? <span className="text-amber-600 font-black">🏆 さいこうレベルにとうたつ！</span>
                          : <span>{xpInLevel} / {xpToNext} XP</span>
                        }
                      </div>
                      <div className="w-full bg-white/50 rounded-full h-5 border border-white/40 overflow-hidden shadow-inner">
                        <div
                          className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-violet-400 to-indigo-500 relative"
                          style={{ width: `${isMaxLevel ? 100 : progressPct}%` }}
                        >
                          <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-50"></div>
                        </div>
                      </div>
                      <div className="flex justify-between text-[10px] font-black text-slate-400">
                        <span>Lv.{level}</span>
                        {!isMaxLevel && <span>Lv.{level + 1}</span>}
                      </div>
                    </div>
                    {!isMaxLevel && nextEvolution && (
                      <p className="text-[11px] font-bold text-slate-500 bg-white/40 rounded-xl px-3 py-2">
                        ✨ Lv.{nextEvolution}でしんか！あと <span className="font-black text-indigo-600">{(XP_CUMULATIVE[nextEvolution - 2] - studentXp).toLocaleString()} XP</span> ためよう！
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-[10px]">
                      <span className="bg-white/50 px-2 py-1 rounded-lg font-bold text-slate-500">📝 ふりかえりをほめられたら +30XP</span>
                      <span className="bg-white/50 px-2 py-1 rounded-lg font-bold text-slate-500">🎯 カリキュラムをクリア +50XP</span>
                      <span className="bg-white/50 px-2 py-1 rounded-lg font-bold text-slate-500">🎮 ゲームクリア +20XP</span>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ★ ステータス振り分けパネル（生徒のみ） */}
            {currentUser.role === 'student' && (() => {
              const studentData = students.find(s => s.id === currentUser.studentId);
              const points = studentData?.points || 0;
              const customStats = studentData?.customStats || { hp: 0, atk: 0, def: 0 };
              const inventory = studentData?.inventory || [];
              const equipped = studentData?.equipped || { weapon: null, armor: null, accessory: null };

              const spendPoint = async (stat) => {
                if (points <= 0) return;
                const studentRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId);
                await updateDoc(studentRef, {
                  points: points - 1,
                  [`customStats.${stat}`]: (customStats[stat] || 0) + 1,
                });
                setSaveMessage(`⭐ ${stat.toUpperCase()} +1！`);
                setTimeout(() => setSaveMessage(''), 2000);
              };

              return (
                <>
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-6 md:p-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="text-left">
                        <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">⭐ キャラクター強化</h3>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">先生からコメントをもらったときにポイントがもらえるよ！</p>
                      </div>
                      <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3">
                        <span className="text-2xl">🌟</span>
                        <div className="text-left">
                          <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">もってるポイント</p>
                          <p className="text-3xl font-black text-amber-600 leading-none">{points}</p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { key: 'hp', label: 'HP', icon: '❤️', color: 'from-rose-400 to-pink-500', desc: 'たいりょくアップ' },
                        { key: 'atk', label: 'ATK', icon: '⚡', color: 'from-orange-400 to-amber-500', desc: 'こうげきりょくアップ' },
                        { key: 'def', label: 'DEF', icon: '🛡️', color: 'from-sky-400 to-blue-500', desc: 'ぼうぎょりょくアップ' },
                      ].map(({ key, label, icon, color, desc }) => (
                        <div key={key} className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white text-center shadow-lg`}>
                          <div className="text-3xl mb-1">{icon}</div>
                          <p className="font-black text-xl">{label}</p>
                          <p className="text-xs opacity-80 font-medium mb-2">{desc}</p>
                          <p className="text-3xl font-black mb-3">+{customStats[key] || 0}</p>
                          <button
                            onClick={() => spendPoint(key)}
                            disabled={points <= 0}
                            className={`w-full py-2 rounded-xl text-sm font-black transition-all active:scale-95 ${points > 0
                                ? 'bg-white/30 hover:bg-white/50 text-white shadow-md'
                                : 'bg-white/10 text-white/40 cursor-not-allowed'
                              }`}
                          >
                            {points > 0 ? '+1 つかう' : 'ポイントがないよ'}
                          </button>
                        </div>
                      ))}
                    </div>

                    {points > 0 && (
                      <p className="text-center text-xs text-slate-500 font-bold mt-4">
                        🌟 {points}ポイントあるよ！ゲームをゆうりにするためにつかおう！
                      </p>
                    )}
                  </div>

                  {/* ★ Gacha System & Equipment Setup ★ */}
                  <div className="mt-8 space-y-8" data-gacha-section>
                    <GachaSystem
                      points={points}
                      onRoll={async (pulledItem) => {
                        const studentRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId);
                        await updateDoc(studentRef, {
                          points: points - 10,
                          inventory: [...inventory, pulledItem.id]
                        });
                      }}
                    />

                    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-6 md:p-8">
                      <h3 className="text-xl font-black text-slate-800 flex items-center gap-2 mb-6">🛡️ いまつけているそうびともちもの</h3>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        {['weapon', 'armor', 'accessory'].map(type => {
                          const eqId = equipped[type];
                          const eqItem = GACHA_ITEMS.find(i => i.id === eqId);
                          return (
                            <div key={type} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 relative overflow-hidden group">
                              <div className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 text-left">{type === 'weapon' ? '⚔️ ぶき' : type === 'armor' ? '🛡️ よろい' : '💍 アクセサリー'}</div>
                              {eqItem ? (
                                <div className="space-y-2 text-left">
                                  <h4 className={`font-black text-lg ${eqItem.rarity === 'SS' ? 'text-fuchsia-600' : eqItem.rarity === 'S' ? 'text-rose-600' : 'text-slate-800'}`}>
                                    {eqItem.name} <span className="text-[10px] bg-white px-2 py-0.5 rounded-full border shadow-sm">{eqItem.rarity}</span>
                                  </h4>
                                  <div className="flex gap-2 text-xs font-bold text-slate-500">
                                    {eqItem.stats.hp !== 0 && <span>HP {eqItem.stats.hp > 0 ? '+' : ''}{eqItem.stats.hp}</span>}
                                    {eqItem.stats.atk !== 0 && <span>ATK {eqItem.stats.atk > 0 ? '+' : ''}{eqItem.stats.atk}</span>}
                                    {eqItem.stats.def !== 0 && <span>DEF {eqItem.stats.def > 0 ? '+' : ''}{eqItem.stats.def}</span>}
                                  </div>
                                  <button
                                    aria-label={`${type === 'weapon' ? 'ぶき' : type === 'armor' ? 'よろい' : 'アクセサリー'}をはずす`}
                                    onClick={async () => {
                                      if (!window.confirm('そうびをはずしますか？')) return;
                                      const newEquipped = { ...equipped, [type]: null };
                                      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId), { equipped: newEquipped });
                                    }}
                                    className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 p-2 bg-rose-100 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all"
                                  >はずす</button>
                                </div>
                              ) : (
                                <div className="text-slate-400 font-medium text-sm py-4 text-center border-2 border-dashed border-slate-200 rounded-xl">なにもつけてないよ</div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                      <div className="border-t border-slate-100 pt-6">
                        <h4 className="text-sm font-black text-slate-600 mb-4 text-left">もちもの</h4>
                        {inventory.length === 0 ? (
                          <div className="text-center py-8">
                            <p className="text-sm font-black text-slate-500 mb-3">まだそうびがないよ！ガチャをまわしてそうびをゲットしよう！✨</p>
                            <button
                              onClick={() => {
                                const gachaEl = document.querySelector('[data-gacha-section]');
                                if (gachaEl) gachaEl.scrollIntoView({ behavior: 'smooth' });
                              }}
                              className="bg-orange-500 text-white font-black text-sm px-5 py-2.5 rounded-xl shadow-md hover:bg-orange-600 transition-colors active:scale-95"
                            >ガチャをまわす ✨</button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                            {Object.values(inventory.reduce((acc, itemId) => {
                              if (!acc[itemId]) acc[itemId] = { id: itemId, count: 0 };
                              acc[itemId].count++;
                              return acc;
                            }, {})).map((group, idx) => {
                              const itemId = group.id;
                              const item = GACHA_ITEMS.find(i => i.id === itemId);
                              if (!item) return null;
                              const isEquipped = Object.values(equipped).includes(itemId);
                              return (
                                <div key={`${itemId}-${idx}`} className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${isEquipped ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-sm hover:border-orange-200'}`}>
                                  <div className="text-left">
                                    <p className="font-black text-sm text-slate-800">
                                      {item.name} <span className="text-[9px] px-1.5 rounded bg-slate-100 border text-slate-500">{item.rarity}</span>
                                      {group.count > 1 && <span className="ml-2 text-xs font-bold text-fuchsia-500">x{group.count}</span>}
                                    </p>
                                    <div className="flex gap-2 text-[10px] font-bold text-slate-400 mt-1">
                                      <span>{item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : '💍'}</span>
                                      {item.stats.hp !== 0 && <span>HP{item.stats.hp > 0 ? '+' : ''}{item.stats.hp}</span>}
                                      {item.stats.atk !== 0 && <span>ATK{item.stats.atk > 0 ? '+' : ''}{item.stats.atk}</span>}
                                      {item.stats.def !== 0 && <span>DEF{item.stats.def > 0 ? '+' : ''}{item.stats.def}</span>}
                                    </div>
                                  </div>
                                  {!isEquipped && (
                                    <button
                                      onClick={async () => {
                                        const newEquipped = { ...equipped, [item.type]: itemId };
                                        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId), { equipped: newEquipped });
                                      }}
                                      className="shrink-0 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-lg hover:bg-orange-500 transition-colors"
                                    >そうびする</button>
                                  )}
                                  {isEquipped && <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md shrink-0">そうびちゅう</span>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* 次のおすすめ教材（生徒・保護者共通） */}
            {(() => {
              const studentIdCtx = currentUser.role === 'student' ? currentUser.studentId : currentUser.childId;
              const studentData = students.find(s => s.id === studentIdCtx);
              const completedIds = studentData?.completedMaterials || [];
              const nextMaterial = materials.find(m => m.isPublished !== false && !completedIds.includes(m.id));
              if (!nextMaterial) return null;
              return (
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-[2rem] p-6 md:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-6">
                  <div className="bg-white/20 rounded-2xl p-4 shrink-0">
                    <Trophy size={32} className="text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">✨ つぎはこれにチャレンジしよう！</p>
                    <h3 className="text-xl font-black leading-tight">{nextMaterial.title}</h3>
                    <p className="text-sm opacity-80 font-medium mt-1">{nextMaterial.category} コース</p>
                  </div>
                  <button
                    onClick={() => setActiveTab('materials')}
                    className="shrink-0 bg-white text-orange-600 font-black text-sm px-6 py-3 rounded-xl shadow-md hover:scale-105 transition-transform active:scale-95"
                  >
                    きょうざいを見る→
                  </button>
                </div>
              );
            })()}

            {/* お知らせセクション */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-6 md:p-8">
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4">📢 お知らせ</h3>
              {announcements.length === 0 ? (
                <p role="alert" className="text-sm text-slate-400 text-center py-6 font-medium">まだお知らせはありません</p>
              ) : (
                <div className="space-y-3">
                  {announcements.map(a => {
                    const isUnread = !readAnnouncementIds.includes(a.id);
                    return (
                      <div key={a.id} className={`rounded-2xl px-5 py-4 border flex items-start gap-3 ${isUnread ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'}`}>
                        {isUnread && <span className="shrink-0 w-2 h-2 rounded-full bg-orange-500 mt-1.5" />}
                        <div className="flex-1">
                          <p className={`text-sm font-bold ${isUnread ? 'text-slate-800' : 'text-slate-500'}`}>{a.content || a.title || a.message || JSON.stringify(a)}</p>
                          {a.createdAt && (
                            <p className="text-[10px] font-bold text-slate-400 mt-1">
                              {new Date(a.createdAt.seconds ? a.createdAt.seconds * 1000 : a.createdAt).toLocaleDateString('ja-JP')}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {currentUser.role === 'student' && (
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-8 md:p-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-lg"><BookOpen size={22} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">べんきょうをきろくしよう</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">きょうのもくひょうやふりかえりをかいてほぞんしよう</p>
                    </div>
                  </div>

                  <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setNewLearningRecord({ ...newLearningRecord, recordType: 'goal', content: newLearningRecord.goalContent || {} })}
                      className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${newLearningRecord.recordType === 'goal' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      もくひょうシート（まえ）
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewLearningRecord({ ...newLearningRecord, recordType: 'reflection', goalContent: newLearningRecord.content, content: newLearningRecord.reflectionContent || {} })}
                      className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${newLearningRecord.recordType === 'reflection' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      ふりかえりシート（あと）
                    </button>
                  </div>
                </div>

                <form onSubmit={submitLearningRecord} className="space-y-6 text-left">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">じゅぎょうの日（いつのじゅぎょう？）</label>
                    <input
                      type="date"
                      value={newLearningRecord.lessonDate || ''}
                      onChange={e => setNewLearningRecord({ ...newLearningRecord, lessonDate: e.target.value })}
                      className={`w-full bg-slate-50 border rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all ${newLearningRecord.recordType === 'goal' ? 'border-emerald-100 focus:ring-emerald-500' : 'border-slate-200 focus:ring-orange-500'}`}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">タイトル（{newLearningRecord.recordType === 'goal' ? 'もくひょうのタイトル' : 'ふりかえりのタイトル'}）</label>
                    <input type="text" value={newLearningRecord.title} onChange={e => setNewLearningRecord({ ...newLearningRecord, title: e.target.value })} className={`w-full bg-slate-50 border rounded-2xl px-5 py-4 text-base font-bold outline-none transition-all ${newLearningRecord.recordType === 'goal' ? 'border-emerald-100 focus:ring-2 focus:ring-emerald-500' : 'border-slate-200 focus:ring-2 focus:ring-orange-500'}`} placeholder={newLearningRecord.recordType === 'goal' ? "れい: きょうはScratchでゲームをかんせいさせる！" : "れい: Scratchでアニメーションをつくった！"} required />
                  </div>

                  {/* テンプレートフィールド (管理者が設定した質問項目) */}
                  {(reflectionTemplate || [])
                    .filter(item => (item.category || 'goal') === (newLearningRecord.recordType || 'goal'))
                    .map(item => (
                      <div key={item.id}>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{item.title}</label>
                        <textarea
                          value={(newLearningRecord.content || {})[item.id] || ''}
                          onChange={e => setNewLearningRecord({
                            ...newLearningRecord,
                            content: { ...(newLearningRecord.content || {}), [item.id]: e.target.value }
                          })}
                          placeholder={`${item.title}をかいてみよう！`}
                          rows={3}
                          className={`w-full bg-slate-50 border rounded-2xl px-5 py-3 text-sm font-medium outline-none resize-none transition-all ${newLearningRecord.recordType === 'goal' ? 'border-emerald-100 focus:ring-2 focus:ring-emerald-500' : 'border-slate-200 focus:ring-2 focus:ring-orange-500'}`}
                        />
                      </div>
                    ))
                  }

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">つくったものの画像URL（なくてもOK）</label>
                      <input type="url" placeholder="https://..." value={newLearningRecord.imageUrl} onChange={e => setNewLearningRecord({ ...newLearningRecord, imageUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                    </div>
                    <div>
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">さくひんのリンク（Canvaなど・なくてもOK）</label>
                      <input type="url" placeholder="https://..." value={newLearningRecord.linkUrl} onChange={e => setNewLearningRecord({ ...newLearningRecord, linkUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                    </div>
                  </div>
                  <button type="submit" className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 text-base uppercase tracking-widest ${newLearningRecord.recordType === 'goal' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                    <Save size={20} /> {newLearningRecord.recordType === 'goal' ? 'もくひょうをほぞんする' : 'ふりかえりをほぞんする'}
                  </button>
                </form>
              </div>
            )}

            {/* .sb3 ファイル管理（生徒のみ） */}
            {currentUser.role === 'student' && (
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-8 md:p-10 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3 text-left">
                    <div className="bg-slate-800 p-3 rounded-2xl text-white shadow-lg"><FileArchive size={22} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Scratchファイルをかんりする</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">.sb3ファイルをひにちごとにアップロードできるよ</p>
                    </div>
                  </div>
                  <div>
                    <input ref={sb3InputRef} type="file" accept=".sb3" onChange={uploadSb3File} className="hidden" id="sb3-upload" />
                    <label htmlFor="sb3-upload" className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm cursor-pointer transition-all shadow-md active:scale-95 uppercase tracking-wider ${isUploadingSb3 ? 'bg-slate-200 text-slate-400 pointer-events-none' : 'bg-slate-900 text-white hover:bg-orange-600'}`}>
                      {isUploadingSb3 ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                      {isUploadingSb3 ? 'アップロードちゅう...' : '.sb3ファイルをアップロードする'}
                    </label>
                  </div>
                </div>
                {sb3Files.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl py-16 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">まだアップロードしたファイルはないよ</div>
                ) : (
                  <div className="space-y-3">
                    {sb3Files.map(file => (
                      <div key={file.id} className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100 group hover:border-orange-200 transition-all">
                        <div className="flex items-center gap-4 overflow-hidden text-left">
                          <div className="bg-orange-100 text-orange-600 p-2.5 rounded-xl shrink-0"><FileArchive size={18} /></div>
                          <div className="overflow-hidden">
                            <p className="font-black text-slate-800 text-sm truncate">{file.fileName}</p>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{file.uploadDate}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a href={file.downloadUrl} download={file.fileName} aria-label={`${file.fileName}をダウンロード`} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-orange-600 rounded-xl transition-colors" title="ダウンロード"><Download size={16} /></a>
                          <button onClick={() => deleteSb3File(file)} aria-label={`${file.fileName}をさくじょ`} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-xl transition-colors" title="削除"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* メッセージ機能 (受講生・保護者用) */}
            {(() => {
              const studentIdContext = currentUser.role === 'student' ? currentUser.studentId : currentUser.childId;
              const studentMessages = messages.filter(m => m.studentId === studentIdContext);
              return (
                <div className="space-y-6 text-left">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><MessageSquare size={22} className="text-orange-500" /> 先生からのメッセージ</h3>
                  <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm flex flex-col h-[400px]">
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                      {studentMessages.map(msg => {
                        const isMe = msg.senderId === (currentUser.role === 'student' ? currentUser.studentId : currentUser.childId);
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-5 py-3 ${isMe ? 'bg-orange-500 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                              <p className="text-[10px] font-black tracking-widest uppercase mb-1 opacity-80">{msg.senderName}</p>
                              <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                              <p className="text-[9px] text-right mt-2 opacity-70 font-bold">{msg.createdAt ? new Date(msg.createdAt.toMillis()).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '送信中...'}</p>
                            </div>
                          </div>
                        );
                      })}
                      {studentMessages.length === 0 && <p className="text-center text-slate-400 font-bold text-xs uppercase tracking-widest mt-20">メッセージはまだありません</p>}
                    </div>
                    <form onSubmit={(e) => sendMessage(e, 'admin', studentIdContext)} className="flex gap-3 shrink-0 pt-4 border-t border-slate-100">
                      <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="メッセージを入力..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500" />
                      <button
                        type="submit"
                        aria-label="メッセージを送信する"
                        disabled={isSendingMessage}
                        className={`px-6 rounded-xl font-black text-sm tracking-widest uppercase shadow-md transition-colors ${isSendingMessage ? 'bg-slate-300 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-orange-600'}`}
                      >送信</button>
                    </form>
                  </div>
                </div>
              );
            })()}

          </div>
        )}

        {/* タイピングゲーム (生徒のみ) */}
        {currentUser.role === 'student' && activeTab === 'game' && (() => {
          const studentData = students.find(s => s.id === currentUser.studentId);
          const completedCount = studentData?.completedMaterials?.length || 0;
          const studentXp = studentData?.xp || 0;
          return (
            <div className="space-y-6 animate-in fade-in duration-500 text-left">
              <header>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">🎮 タイピングバトル</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">XPをためてキャラクターをレベルアップさせよう！</p>
              </header>
              <TypingGame
                studentId={currentUser.studentId}
                studentXp={studentXp}
                completedCount={completedCount}
                totalMaterials={materials.length || 1}
                customStats={studentData?.customStats || { hp: 0, atk: 0, def: 0 }}
                equipped={studentData?.equipped || { weapon: null, armor: null, accessory: null }}
                onGameClear={async () => {
                  try {
                    const studentRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId);
                    const snap = await getDoc(studentRef);
                    const currentXp = snap.exists() ? (snap.data().xp || 0) : 0;
                    await updateDoc(studentRef, { xp: currentXp + 20 });
                  } catch (e) { console.error('XP update failed', e); }
                }}
              />
            </div>
          );
        })()}

        {/* 成長の軌跡タブ */}
        {(currentUser.role === 'student' || currentUser.role === 'parent') && activeTab === 'growth' && (() => {
          const studentIdCtx = currentUser.role === 'student' ? currentUser.studentId : currentUser.childId;
          const studentData = students.find(s => s.id === studentIdCtx);
          const myRecords = learningRecords
            .filter(r => r.studentId === studentIdCtx)
            .sort((a, b) => {
              const da = a.lessonDate || (a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000).toISOString().slice(0, 10) : '');
              const db2 = b.lessonDate || (b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000).toISOString().slice(0, 10) : '');
              return db2.localeCompare(da);
            });

          const grouped = {};
          myRecords.forEach(r => {
            const key = r.lessonDate || (r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toISOString().slice(0, 10) : '日付なし');
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(r);
          });
          const groupedEntries = Object.entries(grouped);

          const pointsEarned = myRecords.filter(r => r.commentPointed).length;
          const completedCount = studentData?.completedMaterials?.length || 0;
          const totalMat = materials.length || 1;
          const progressPercentage = Math.min(100, Math.floor((completedCount / totalMat) * 100));
          const customStats = studentData?.customStats || { hp: 0, atk: 0, def: 0 };

          return (
            <div className="space-y-8 animate-in fade-in duration-500 text-left">
              <header>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">📚 成長の軌跡</h2>
                <p className="text-sm text-slate-500 font-medium mt-1">これまでの学びの記録をふり返ろう！</p>
              </header>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'じゅぎょうの回数', value: `${groupedEntries.length}回`, icon: '📅', color: 'from-teal-400 to-emerald-500' },
                  { label: 'きろく数', value: `${myRecords.length}件`, icon: '📝', color: 'from-sky-400 to-blue-500' },
                  { label: 'もらったポイント', value: `${pointsEarned}pt`, icon: '🌟', color: 'from-amber-400 to-orange-500' },
                  { label: 'カリキュラムのすすみ', value: `${progressPercentage}%`, icon: '🎯', color: 'from-violet-400 to-purple-500' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-5 text-white shadow-lg`}>
                    <div className="text-3xl mb-2">{icon}</div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-80">{label}</p>
                    <p className="text-2xl font-black">{value}</p>
                  </div>
                ))}
              </div>

              {(customStats.hp > 0 || customStats.atk > 0 || customStats.def > 0) && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 flex items-center gap-6 flex-wrap shadow-sm">
                  <p className="text-sm font-black text-slate-700">⚔️ キャラクターボーナス</p>
                  <span className="text-sm font-bold text-rose-500">❤️ HP+{customStats.hp}</span>
                  <span className="text-sm font-bold text-amber-500">⚡ ATK+{customStats.atk}</span>
                  <span className="text-sm font-bold text-sky-500">🛡️ DEF+{customStats.def}</span>
                </div>
              )}

              {groupedEntries.length === 0 ? (
                <div className="text-center py-20 text-slate-400">
                  <div className="text-5xl mb-4">📭</div>
                  <p className="font-bold">まだ記録がありません</p>
                  <p className="text-sm mt-1">授業のあとに目標や振り返りを投稿してみよう！</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 via-sky-300 to-violet-300 rounded-full" />
                  <div className="space-y-10 pl-16">
                    {groupedEntries.map(([date, records], gi) => (
                      <div key={date} className="relative">
                        <div className="absolute -left-16 top-0 flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-lg text-white font-black text-xs text-center leading-tight border-4 border-white">
                            {date === '日付なし' ? '??' : (
                              <>
                                <span className="text-[8px] block">{date.slice(5, 7)}月</span>
                                <span className="text-sm block leading-none">{date.slice(8, 10)}</span>
                              </>
                            )}
                          </div>
                          <div className="w-0.5 flex-1 bg-transparent" />
                        </div>

                        <p className="text-xs font-black text-teal-600 uppercase tracking-widest mb-3">
                          {date} のじゅぎょう — {records.length}件のきろく
                        </p>

                        <div className="space-y-4">
                          {records.map(record => (
                            <div key={record.id} className={`rounded-2xl border p-5 shadow-sm ${record.recordType === 'goal' ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
                              <div className="flex items-center gap-2 mb-2">
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${record.recordType === 'goal' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                                  {record.recordType === 'goal' ? '🎯 もくひょう' : '📝 ふりかえり'}
                                </span>
                                {record.commentPointed && (
                                  <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">🌟 +1pt</span>
                                )}
                              </div>
                              <h4 className="font-black text-slate-800 text-sm mb-2">{record.title}</h4>
                              {typeof record.content === 'object' && record.content !== null ? (
                                Object.values(record.content).filter(Boolean).map((v, i) => (
                                  <p key={i} className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap mb-1">{String(v)}</p>
                                ))
                              ) : (
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{record.content}</p>
                              )}

                              {record.comment && (
                                <div className={`mt-4 p-3 rounded-xl border text-sm ${record.recordType === 'goal' ? 'bg-white border-emerald-200' : 'bg-white border-orange-200'}`}>
                                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">💬 先生のコメント</p>
                                  <p className="font-bold text-slate-700 italic">"{record.comment}"</p>
                                </div>
                              )}

                              {(currentUser.role === 'parent' || (currentUser.role === 'student' && record.parentComment)) && (
                                <div className="mt-3 p-3 rounded-xl border border-sky-200 bg-white text-sm">
                                  <p className="text-[9px] font-black uppercase tracking-widest text-sky-500 mb-1">💙 おうちのひとのメッセージ</p>
                                  {record.parentComment && <p className="font-bold text-slate-700 italic mb-2">"{record.parentComment}"</p>}
                                  {currentUser.role === 'parent' && (
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        placeholder="応援メッセージを送ろう！"
                                        value={parentComment[record.id] || ''}
                                        onChange={e => setParentComment({ ...parentComment, [record.id]: e.target.value })}
                                        className="flex-1 bg-slate-50 border border-sky-200 rounded-xl px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-sky-400"
                                      />
                                      <button
                                        onClick={async () => {
                                          try {
                                            await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'learning_records', record.id), { parentComment: parentComment[record.id] || '' });
                                            setSaveMessage('保護者コメントを送信しました');
                                            setTimeout(() => setSaveMessage(''), 3000);
                                          } catch (e) { setSaveMessage('送信失敗'); }
                                        }}
                                        className="bg-sky-500 text-white font-bold px-3 py-2 rounded-xl text-xs hover:bg-sky-600 transition-colors"
                                      >送信</button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <div className="relative">
                      <div className="absolute -left-16 top-0">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-lg text-white text-xl border-4 border-white">🌱</div>
                      </div>
                      <div className="ml-0 py-4">
                        <p className="text-sm font-black text-violet-500">これからも頑張ろう！</p>
                        <p className="text-xs text-slate-400 font-medium">きろくをつづけて、もっともっとせいちょうしていこう！</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* 教材一覧 (受講生・保護者用) */}
        {(currentUser.role === 'student' || currentUser.role === 'parent') && activeTab === 'materials' && (
          <div className="space-y-8 text-left animate-in fade-in duration-500">
            <header className="text-left"><h2 className="text-2xl font-black text-slate-800 tracking-tight text-left">きょうざいをみよう</h2></header>
            <div className="space-y-12">
              {[...MATERIAL_CATEGORIES, { id: 'other', label: 'その他' }].map(category => {
                const categoryMaterials = category.id === 'other'
                  ? materials.filter(m => m.isPublished !== false && !MATERIAL_CATEGORIES.some(c => c.id === m.category))
                  : materials.filter(m => m.isPublished !== false && m.category === category.id);

                if (categoryMaterials.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-6">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight">{category.label}</h3>
                      <span className="bg-slate-200 text-slate-600 text-xs font-black px-3 py-1 rounded-full">{categoryMaterials.length}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryMaterials.map(m => {
                        const isYoutube = !!getYoutubeEmbedUrl(m.url);
                        const isScratch = m.category === 'scratch' || (m.tags && m.tags.some(t => t.toLowerCase() === 'scratch'));
                        const loggedInStudent = currentUser.role === 'student' ? students.find(s => s.id === currentUser.studentId) : students.find(s => s.id === currentUser.childId);
                        const isCompleted = loggedInStudent?.completedMaterials?.includes(m.id) || false;

                        return (
                          <div
                            key={m.id}
                            className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden group shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                          >
                            <div className="relative h-40 overflow-hidden cursor-pointer bg-slate-100" onClick={(e) => handleMaterialOpen(e, m)}>
                              <img
                                src={m.thumbnailUrl || getMaterialThumbnail(m.category)}
                                alt={m.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                {isYoutube ? <PlayCircle size={48} className="text-white drop-shadow-lg" /> : <LinkIcon size={40} className="text-white drop-shadow-lg" />}
                              </div>
                              <div className="absolute top-3 left-3">
                                <span className={`text-[10px] shadow-sm font-black px-3 py-1 rounded-full uppercase tracking-widest ${isYoutube ? 'bg-red-500 text-white' : isScratch ? 'bg-orange-500 text-white' : 'bg-slate-800 text-white'}`}>
                                  {isYoutube ? 'YouTube' : isScratch ? 'Scratch' : 'Web'}
                                </span>
                              </div>
                            </div>
                            <div className="p-5 flex-1 flex flex-col">
                              <h4
                                className="font-black text-slate-800 text-lg mb-4 flex-1 cursor-pointer hover:text-orange-600 transition-colors line-clamp-2 text-left"
                                onClick={(e) => handleMaterialOpen(e, m)}
                              >
                                {m.title}
                              </h4>

                              {currentUser.role === 'student' && (() => {
                                const studentReqs = completionRequests.filter(r => r.studentId === currentUser.studentId && r.materialId === m.id);
                                const hasPending = studentReqs.some(r => r.status === 'pending');
                                const hasRejected = studentReqs.some(r => r.status === 'rejected') && !hasPending && !isCompleted;

                                let buttonState = {
                                  bg: 'bg-slate-100 text-slate-500 hover:bg-orange-600 hover:text-white border border-slate-200 hover:border-transparent hover:shadow-lg',
                                  icon: <Star size={18} />,
                                  text: 'カリキュラムをクリアしたよ！',
                                  disabled: false
                                };

                                if (isCompleted) {
                                  buttonState = {
                                    bg: 'bg-emerald-100 text-emerald-600 border border-emerald-200 shadow-inner cursor-default',
                                    icon: <CheckCircle2 size={18} />,
                                    text: 'クリア！',
                                    disabled: true
                                  };
                                } else if (hasPending) {
                                  buttonState = {
                                    bg: 'bg-amber-100 text-amber-600 border border-amber-200 shadow-inner cursor-default',
                                    icon: <Clock size={18} />,
                                    text: 'せんせいがかくにんちゅう',
                                    disabled: true
                                  };
                                } else if (hasRejected) {
                                  buttonState = {
                                    bg: 'bg-rose-100 text-rose-600 border border-rose-200 hover:bg-rose-500 hover:text-white hover:border-transparent shadow-sm',
                                    icon: <Menu size={18} />,
                                    text: 'もういちどやってみよう！',
                                    disabled: false
                                  };
                                }

                                return (
                                  <>
                                    {hasRejected && <p className="text-[10px] text-rose-500 font-bold mb-1 text-center animate-pulse">せんせいからおくりかえされたよ。もういちどやってみよう！</p>}
                                    <button
                                      onClick={async (e) => {
                                        if (buttonState.disabled || isSubmittingComplete) return;
                                        setIsSubmittingComplete(true);
                                        try {
                                          await toggleMaterialComplete(e, m.id);
                                        } finally {
                                          setIsSubmittingComplete(false);
                                        }
                                      }}
                                      disabled={buttonState.disabled || isSubmittingComplete}
                                      aria-label={buttonState.text}
                                      className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-all duration-300 ${buttonState.bg} ${isSubmittingComplete ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                      {buttonState.icon}
                                      {isSubmittingComplete ? 'おくりちゅう...' : buttonState.text}
                                    </button>
                                  </>
                                );
                              })()}
                              {currentUser.role === 'parent' && (
                                <div className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest border ${isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                                  }`}>
                                  {isCompleted ? <CheckCircle2 size={18} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                  {isCompleted ? 'かんりょうしたよ！' : 'まだだよ'}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <footer className="shrink-0 mt-12 py-8 text-center text-slate-400 text-xs font-bold tracking-widest bg-white rounded-t-3xl border-t-4 border-slate-100 mx-4">
        クリエット プログラミング
      </footer>
    </div>
  );
}
