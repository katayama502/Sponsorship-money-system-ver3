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
  Menu,
  Loader2,
  Swords,
  ShieldPlus,
  ClipboardList
} from 'lucide-react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db, appId } from '../../firebase';
import TypingGame from '../TypingGame';
import GachaSystem from '../GachaSystem';
import { GACHA_ITEMS } from '../../data/items';
import { getLevelCharacter, getXpInfo, getLevelFromXp, XP_CUMULATIVE } from '../../utils/xpUtils';
import { getYoutubeEmbedUrl } from '../../utils/materialUtils';

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
  const [isSubmittingComplete, setIsSubmittingComplete] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showOnlyUncommented, setShowOnlyUncommented] = useState(false);
  const [materialSearch, setMaterialSearch] = useState('');
  const [recordSubmitConfirm, setRecordSubmitConfirm] = useState(false);
  const prevLevelRef = useRef(null);
  const msgEndRef = useRef(null);

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

  // Auto-scroll messages (on new message count or tab switch to mypage)
  useEffect(() => {
    if (activeTab === 'mypage' && msgEndRef.current) {
      msgEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length, activeTab]);

  const isStudent = currentUser.role === 'student';
  const isParent = currentUser.role === 'parent';
  const studentIdCtx = isStudent ? currentUser.studentId : currentUser.childId;

  // Shared derived data
  const studentData = students.find(s => s.id === studentIdCtx);
  const studentXp = studentData?.xp || 0;
  const charInfo = getLevelCharacter(studentXp);
  const { level, xpInLevel, xpToNext, progressPct } = getXpInfo(studentXp);
  const isMaxLevel = level >= 20;
  const points = studentData?.points || 0;
  const customStats = studentData?.customStats || { hp: 0, atk: 0, def: 0 };
  const inventory = studentData?.inventory || [];
  const equipped = studentData?.equipped || { weapon: null, armor: null, accessory: null };
  const unreadCount = announcements.filter(a => !readAnnouncementIds.includes(a.id)).length;
  const studentMessages = messages.filter(m => m.studentId === studentIdCtx);

  // Nav tab definitions
  const tabs = [
    { id: 'mypage', label: 'マイページ', color: 'orange', badge: unreadCount },
    { id: 'materials', label: 'きょうざい', color: 'sky' },
    ...(isStudent ? [
      { id: 'record', label: '📝 きろく', color: 'emerald' },
      { id: 'enhance', label: '⭐ 強化', color: 'amber' },
      { id: 'game', label: '🎮 ゲーム', color: 'violet' },
    ] : []),
    { id: 'growth', label: '📚 せいちょう', color: 'teal' },
  ];

  const colorMap = {
    orange: { active: 'bg-orange-500 text-white shadow-md scale-105', hover: '' },
    sky: { active: 'bg-sky-500 text-white shadow-md scale-105', hover: '' },
    emerald: { active: 'bg-emerald-500 text-white shadow-md scale-105', hover: '' },
    amber: { active: 'bg-amber-500 text-white shadow-md scale-105', hover: '' },
    violet: { active: 'bg-violet-500 text-white shadow-md scale-105', hover: '' },
    teal: { active: 'bg-teal-500 text-white shadow-md scale-105', hover: '' },
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans selection:bg-orange-100 selection:text-orange-900">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 print:hidden">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 shrink-0">
            <button
              aria-label="メニューをひらく"
              className="md:hidden p-2 -ml-1 text-slate-500 hover:bg-slate-100 rounded-xl transition-all"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={22} />
            </button>
            <div className="flex items-center gap-2 group cursor-default">
              <div className="bg-orange-500 p-2 rounded-xl text-white shadow-md shadow-orange-500/30 transform group-hover:rotate-6 transition-transform duration-300">
                <Calculator size={18} strokeWidth={2.5} />
              </div>
              <span className="font-black text-xl tracking-tighter text-slate-800 hidden sm:block">
                クリエット<span className="text-orange-500">!</span>
              </span>
            </div>
          </div>

          {/* Desktop nav */}
          <nav aria-label="メインナビゲーション" className="hidden md:flex gap-1 bg-slate-100/60 p-1 rounded-2xl overflow-x-auto flex-nowrap flex-1 justify-center">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (tab.id === 'mypage') {
                    const allIds = announcements.map(a => a.id);
                    setReadAnnouncementIds(allIds);
                    localStorage.setItem('readAnnouncements', JSON.stringify(allIds));
                  }
                }}
                aria-current={activeTab === tab.id ? 'page' : undefined}
                className={`relative px-3 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap shrink-0 ${
                  activeTab === tab.id ? colorMap[tab.color].active : 'text-slate-500 hover:bg-white'
                }`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-2 shrink-0">
            {/* Compact XP display */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-1.5">
              <img
                src={charInfo.imageUrl}
                alt="キャラ"
                className="w-6 h-6 object-contain"
                onError={e => { e.target.style.display = 'none'; }}
              />
              <span className={`text-xs font-black ${charInfo.color}`}>Lv.{level}</span>
              {isStudent && points > 0 && (
                <span className="text-xs font-black text-amber-600">🌟{points}pt</span>
              )}
            </div>
            <button aria-label="ログアウトする" onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors bg-slate-100 p-2 rounded-full">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Sidebar */}
      <aside
        aria-label="モバイルナビゲーション"
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100">
          <span className="font-black text-lg tracking-tight text-slate-800 flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-xl text-white shadow-sm"><Calculator size={18} /></div>
            クリエット！
          </span>
          <button aria-label="メニューをとじる" className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={18} />
          </button>
        </div>
        <nav aria-label="モバイルメインナビゲーション" className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setIsMobileMenuOpen(false);
                if (tab.id === 'mypage') {
                  const allIds = announcements.map(a => a.id);
                  setReadAnnouncementIds(allIds);
                  localStorage.setItem('readAnnouncements', JSON.stringify(allIds));
                }
              }}
              aria-current={activeTab === tab.id ? 'page' : undefined}
              className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${
                activeTab === tab.id ? colorMap[tab.color].active : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              {tab.badge > 0 && (
                <span className="ml-auto bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{tab.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-slate-100">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black hover:bg-slate-50 text-rose-500 rounded-xl transition-all">
            <LogOut size={18} /> ログアウト
          </button>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-black/30 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <main className="flex-grow max-w-6xl w-full mx-auto p-3 md:p-5 text-left text-slate-900">
        {/* Level-up overlay */}
        {showLevelUp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowLevelUp(false)}>
            <div className="bg-white rounded-3xl p-10 text-center shadow-2xl animate-bounce">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-3xl font-black text-orange-500">レベルアップ！</h2>
              <p className="text-slate-600 font-bold mt-2">タップでとじる</p>
            </div>
          </div>
        )}

        {saveMessage && (
          <div role="alert" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-left">
            <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
            <span className="text-sm font-bold">{saveMessage}</span>
          </div>
        )}

        {/* ======== MYPAGE ======== */}
        {activeTab === 'mypage' && (
          <div className="animate-in fade-in duration-300 space-y-4">
            {/* Header row */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-xl font-black text-slate-800">
                  {currentUser.name}さん <span className="text-orange-500">のページ</span>
                </h2>
                {isParent && currentUser.allChildren && currentUser.allChildren.length > 1 && (
                  <select
                    value={currentUser.childId}
                    onChange={(e) => {
                      const child = currentUser.allChildren.find(c => c.id === e.target.value);
                      if (child) setCurrentUser({ ...currentUser, childId: child.id, childName: child.name, name: `${child.name}の保護者`, nextClassDate: child.nextClassDate });
                    }}
                    className="mt-1 bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    {currentUser.allChildren.map(c => <option key={c.id} value={c.id}>{c.name} の記録</option>)}
                  </select>
                )}
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 flex items-center gap-2 shadow-sm">
                <Clock size={14} className="text-orange-500 shrink-0" />
                <div>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">つぎのじゅぎょう</p>
                  <p className="text-sm font-black text-slate-800">{currentUser.nextClassDate || '未設定'}</p>
                </div>
              </div>
            </div>

            {/* Main 2-column grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Left column: character + stats */}
              <div className="md:col-span-2 space-y-3">
                {/* Compact character card */}
                <div className={`rounded-2xl border shadow-md overflow-hidden ${charInfo.bg} ${charInfo.border} p-4`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/60 rounded-2xl w-20 h-20 flex items-center justify-center shrink-0 shadow-sm">
                      <img
                        src={charInfo.imageUrl}
                        alt="キャラクター"
                        className="w-full h-full object-contain p-2"
                        onError={e => { e.target.style.display = 'none'; e.target.parentElement.innerHTML = '<span class="text-3xl">🐣</span>'; }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className={`text-lg font-black tabular-nums px-2 py-0.5 rounded-lg bg-white/60 ${charInfo.color}`}>Lv.{level}</span>
                        <span className={`text-base font-black flex items-center gap-1 ${charInfo.color}`}>
                          {isMaxLevel ? <Crown size={16} className="text-amber-500" /> : <Sparkles size={14} />}
                          {charInfo.name}
                        </span>
                      </div>
                      <div className="w-full bg-white/50 rounded-full h-3 border border-white/40 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-400 to-indigo-500 transition-all duration-1000"
                          style={{ width: `${isMaxLevel ? 100 : progressPct}%` }}
                        />
                      </div>
                      <p className="text-[10px] font-bold text-slate-600 mt-1">
                        {isMaxLevel ? '🏆 さいこうレベル！' : `⚡ ${xpInLevel} / ${xpToNext} XP`}
                      </p>
                    </div>
                  </div>
                  {isStudent && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <div className="bg-white/60 rounded-xl px-3 py-1.5 flex items-center gap-1.5">
                        <span className="text-sm">🌟</span>
                        <span className="text-sm font-black text-amber-700">{points}ポイント</span>
                      </div>
                      <div className="bg-white/60 rounded-xl px-3 py-1.5 flex items-center gap-2 text-[10px] font-bold text-slate-600">
                        ❤️+{customStats.hp} ⚡+{customStats.atk} 🛡️+{customStats.def}
                      </div>
                    </div>
                  )}
                </div>

                {/* Next action hint (student only) */}
                {isStudent && (() => {
                  const hasPending = completionRequests.some(r => r.studentId === studentIdCtx && r.status === 'pending');
                  const hasUnread = unreadCount > 0;
                  let bg = 'bg-emerald-50 border-emerald-200';
                  let icon = '🌟';
                  let text = 'きょうもクリエットで楽しく学ぼう！';
                  if (hasPending) { bg = 'bg-amber-50 border-amber-200'; icon = '⏳'; text = '先生がかくにんちゅうだよ！'; }
                  else if (hasUnread) { bg = 'bg-sky-50 border-sky-200'; icon = '📢'; text = '新しいお知らせをチェックしよう！'; }
                  return (
                    <div className={`rounded-2xl border p-3 flex items-center gap-3 ${bg}`}>
                      <span className="text-2xl shrink-0">{icon}</span>
                      <div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">つぎにやること</p>
                        <p className="text-xs font-black text-slate-800">{text}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* Parent progress summary */}
                {isParent && (() => {
                  if (!studentData) return null;
                  const completedCount = studentData.completedMaterials?.length || 0;
                  const totalMat = materials.length || 1;
                  const pct = Math.min(100, Math.floor((completedCount / totalMat) * 100));
                  const recCount = learningRecords.filter(r => r.studentId === studentIdCtx).length;
                  const uncommentedCount = learningRecords.filter(r => r.studentId === studentIdCtx && !r.parentComment).length;
                  return (
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                      <p className="text-xs font-black text-slate-500 uppercase tracking-widest">📊 {studentData.name}さんのせいちょう</p>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: 'レベル', value: `Lv.${level}`, icon: '⭐', color: 'text-violet-700', bg: 'bg-violet-50' },
                          { label: '合計XP', value: `${studentXp.toLocaleString()} XP`, icon: '⚡', color: 'text-indigo-700', bg: 'bg-indigo-50' },
                          { label: 'クリア教材', value: `${completedCount} / ${totalMat}`, icon: '🎯', color: 'text-emerald-700', bg: 'bg-emerald-50' },
                          { label: 'きろく数', value: `${recCount}件`, icon: '📝', color: 'text-sky-700', bg: 'bg-sky-50' },
                        ].map(({ label, value, icon, color, bg }) => (
                          <div key={label} className={`${bg} rounded-xl p-3 text-center border border-white`}>
                            <div className="text-lg mb-0.5">{icon}</div>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
                            <p className={`text-sm font-black ${color}`}>{value}</p>
                          </div>
                        ))}
                      </div>
                      {/* Curriculum progress bar */}
                      <div>
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                          <span>カリキュラム進捗</span>
                          <span>{pct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                      {/* Unread comment alert */}
                      {uncommentedCount > 0 && (
                        <button
                          onClick={() => setActiveTab('growth')}
                          className="w-full flex items-center gap-2 bg-sky-50 border border-sky-200 rounded-xl px-3 py-2 text-xs font-black text-sky-700 hover:bg-sky-100 transition-colors"
                        >
                          <span className="text-base">💙</span>
                          応援メッセージを送ろう！（{uncommentedCount}件未コメント）
                          <span className="ml-auto">→</span>
                        </button>
                      )}
                    </div>
                  );
                })()}

                {/* Next recommended material */}
                {(() => {
                  const completedIds = studentData?.completedMaterials || [];
                  const next = materials.find(m => m.isPublished !== false && !completedIds.includes(m.id));
                  if (!next) return null;
                  return (
                    <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-4 text-white shadow-md flex items-center gap-3">
                      <Trophy size={24} className="shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-80">つぎのチャレンジ</p>
                        <p className="text-sm font-black truncate">{next.title}</p>
                      </div>
                      <button
                        onClick={() => setActiveTab('materials')}
                        className="shrink-0 bg-white text-orange-600 font-black text-xs px-3 py-2 rounded-xl hover:scale-105 transition-transform"
                      >みる→</button>
                    </div>
                  );
                })()}

                {/* Quick-action buttons */}
                {isStudent && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveTab('record')}
                      className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3 text-center hover:bg-emerald-100 transition-colors"
                    >
                      <ClipboardList size={20} className="text-emerald-600 mx-auto mb-1" />
                      <p className="text-xs font-black text-emerald-700">きろくする</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('enhance')}
                      className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center hover:bg-amber-100 transition-colors"
                    >
                      <ShieldPlus size={20} className="text-amber-600 mx-auto mb-1" />
                      <p className="text-xs font-black text-amber-700">キャラ強化</p>
                    </button>
                  </div>
                )}
                {isParent && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setActiveTab('growth')}
                      className="bg-teal-50 border border-teal-200 rounded-2xl p-3 text-center hover:bg-teal-100 transition-colors"
                    >
                      <BookOpen size={20} className="text-teal-600 mx-auto mb-1" />
                      <p className="text-xs font-black text-teal-700">きろくを見る</p>
                    </button>
                    <button
                      onClick={() => setActiveTab('materials')}
                      className="bg-sky-50 border border-sky-200 rounded-2xl p-3 text-center hover:bg-sky-100 transition-colors"
                    >
                      <Trophy size={20} className="text-sky-600 mx-auto mb-1" />
                      <p className="text-xs font-black text-sky-700">教材を確認</p>
                    </button>
                  </div>
                )}
              </div>

              {/* Right column: announcements + messages */}
              <div className="md:col-span-3 space-y-3">
                {/* Announcements */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 mb-3">
                    📢 お知らせ
                    {unreadCount > 0 && <span className="bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{unreadCount}件未読</span>}
                  </h3>
                  {announcements.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4 font-medium">お知らせはまだありません</p>
                  ) : (
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {announcements.map(a => {
                        const isUnread = !readAnnouncementIds.includes(a.id);
                        return (
                          <div key={a.id} className={`rounded-xl px-4 py-3 border flex items-start gap-2 ${isUnread ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-100'} ${a.type === 'emergency' ? 'border-rose-300 bg-rose-50' : ''}`}>
                            {isUnread && <span className="shrink-0 w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5" />}
                            <div className="flex-1 min-w-0">
                              {a.type === 'emergency' && <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-0.5">🚨 緊急連絡</p>}
                              {a.title && <p className={`text-xs font-black ${isUnread ? 'text-slate-800' : 'text-slate-600'}`}>{a.title}</p>}
                              {a.content && <p className={`text-[11px] mt-0.5 leading-relaxed line-clamp-2 ${isUnread ? 'text-slate-700' : 'text-slate-400'}`}>{a.content}</p>}
                              {a.createdAt && (
                                <p className="text-[9px] font-bold text-slate-400 mt-1">
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

                {/* Messages chat */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col" style={{ height: '320px' }}>
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-2 shrink-0">
                    <MessageSquare size={16} className="text-orange-500" />
                    <h3 className="text-sm font-black text-slate-800">先生とのメッセージ</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
                    {studentMessages.length === 0 ? (
                      <div className="flex items-center justify-center h-full text-xs text-slate-400 font-bold">メッセージはまだありません</div>
                    ) : (
                      studentMessages.map(msg => {
                        const isMe = msg.senderId === studentIdCtx;
                        return (
                          <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${isMe ? 'bg-orange-500 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                              <p className="text-[9px] font-black tracking-widest uppercase mb-0.5 opacity-80">{msg.senderName}</p>
                              <p className="text-xs font-medium whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                              <p className="text-[9px] text-right mt-1 opacity-60 font-bold">
                                {msg.createdAt ? new Date(msg.createdAt.toMillis()).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }) : '送信中...'}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                    <div ref={msgEndRef} />
                  </div>
                  <form onSubmit={(e) => sendMessage(e, 'admin', studentIdCtx)} className="flex gap-2 shrink-0 p-3 pt-2 border-t border-slate-100">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="メッセージを入力..."
                      className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-medium outline-none focus:ring-2 focus:ring-orange-500"
                    />
                    <button
                      type="submit"
                      disabled={isSendingMessage || !newMessage.trim()}
                      className={`px-4 rounded-xl font-black text-xs tracking-widest uppercase transition-colors ${(isSendingMessage || !newMessage.trim()) ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-orange-600'}`}
                    >送信</button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======== RECORD TAB (student only) ======== */}
        {isStudent && activeTab === 'record' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <header>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <ClipboardList size={22} className="text-emerald-600" /> べんきょうをきろくしよう
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">きょうのもくひょうやふりかえりをかいてほぞんしよう</p>
            </header>

            {/* Record type tabs */}
            <div className="flex bg-slate-100 p-1 rounded-2xl w-fit">
              <button
                type="button"
                onClick={() => setNewLearningRecord({ ...newLearningRecord, recordType: 'goal', content: newLearningRecord.goalContent || {} })}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${newLearningRecord.recordType === 'goal' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                🎯 もくひょうシート（まえ）
              </button>
              <button
                type="button"
                onClick={() => setNewLearningRecord({ ...newLearningRecord, recordType: 'reflection', goalContent: newLearningRecord.content, content: newLearningRecord.reflectionContent || {} })}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all ${newLearningRecord.recordType === 'reflection' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                📝 ふりかえりシート（あと）
              </button>
            </div>

            <form onSubmit={(e) => { submitLearningRecord(e); setRecordSubmitConfirm(false); }} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 md:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">じゅぎょうの日</label>
                  <input
                    type="date"
                    value={newLearningRecord.lessonDate || ''}
                    onChange={e => setNewLearningRecord({ ...newLearningRecord, lessonDate: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">
                    タイトル（{newLearningRecord.recordType === 'goal' ? 'もくひょう' : 'ふりかえり'}）
                  </label>
                  <input
                    type="text"
                    value={newLearningRecord.title}
                    onChange={e => setNewLearningRecord({ ...newLearningRecord, title: e.target.value })}
                    placeholder={newLearningRecord.recordType === 'goal' ? 'きょうのもくひょうは？' : 'きょうやったことは？'}
                    className={`w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 transition-all ${newLearningRecord.recordType === 'goal' ? 'border-emerald-100 focus:ring-emerald-500' : 'border-orange-100 focus:ring-orange-500'}`}
                    required
                  />
                </div>
              </div>

              {/* Template fields */}
              {(reflectionTemplate || [])
                .filter(item => (item.category || 'goal') === (newLearningRecord.recordType || 'goal'))
                .map(item => (
                  <div key={item.id}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">{item.title}</label>
                    <textarea
                      value={(newLearningRecord.content || {})[item.id] || ''}
                      onChange={e => setNewLearningRecord({
                        ...newLearningRecord,
                        content: { ...(newLearningRecord.content || {}), [item.id]: e.target.value }
                      })}
                      placeholder={`${item.title}をかいてみよう！`}
                      rows={3}
                      className={`w-full bg-slate-50 border rounded-xl px-4 py-3 text-sm font-medium outline-none resize-none focus:ring-2 transition-all ${newLearningRecord.recordType === 'goal' ? 'border-emerald-100 focus:ring-emerald-500' : 'border-orange-100 focus:ring-orange-500'}`}
                    />
                  </div>
                ))
              }

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">つくったものの画像URL（なくてもOK）</label>
                  <input type="url" placeholder="https://..." value={newLearningRecord.imageUrl} onChange={e => setNewLearningRecord({ ...newLearningRecord, imageUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-1.5">さくひんのリンク（なくてもOK）</label>
                  <input type="url" placeholder="https://..." value={newLearningRecord.linkUrl} onChange={e => setNewLearningRecord({ ...newLearningRecord, linkUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                </div>
              </div>

              {!recordSubmitConfirm ? (
                <button
                  type="button"
                  onClick={() => setRecordSubmitConfirm(true)}
                  disabled={!newLearningRecord.title?.trim()}
                  className={`w-full text-white font-black py-4 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-3 active:scale-95 text-sm uppercase tracking-widest ${!newLearningRecord.title?.trim() ? 'opacity-50 cursor-not-allowed bg-slate-400' : newLearningRecord.recordType === 'goal' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}
                >
                  <Save size={18} /> {newLearningRecord.recordType === 'goal' ? 'もくひょうをほぞんする' : 'ふりかえりをほぞんする'}
                </button>
              ) : (
                <div className={`rounded-2xl border-2 p-4 space-y-3 animate-in zoom-in-95 duration-200 ${newLearningRecord.recordType === 'goal' ? 'bg-emerald-50 border-emerald-300' : 'bg-orange-50 border-orange-300'}`}>
                  <p className="text-sm font-black text-slate-700 text-center">この内容でほぞんする？</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setRecordSubmitConfirm(false)} className="py-3 rounded-xl font-black text-sm bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">もどる</button>
                    <button type="submit" className={`py-3 rounded-xl font-black text-sm text-white transition-colors ${newLearningRecord.recordType === 'goal' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}>ほぞんする！</button>
                  </div>
                </div>
              )}
            </form>

            {/* SB3 file manager */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-800 p-2.5 rounded-xl text-white shadow-sm"><FileArchive size={18} /></div>
                  <div>
                    <h3 className="text-base font-black text-slate-800">Scratchファイルをかんりする</h3>
                    <p className="text-[10px] text-slate-400 font-medium">.sb3ファイルをひにちごとにアップロードできるよ</p>
                  </div>
                </div>
                <div>
                  <input ref={sb3InputRef} type="file" accept=".sb3" onChange={uploadSb3File} className="hidden" id="sb3-upload" />
                  <label htmlFor="sb3-upload" className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-xs cursor-pointer transition-all shadow-sm active:scale-95 uppercase tracking-wider ${isUploadingSb3 ? 'bg-slate-200 text-slate-400 pointer-events-none' : 'bg-slate-900 text-white hover:bg-orange-600'}`}>
                    {isUploadingSb3 ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                    {isUploadingSb3 ? 'アップロードちゅう...' : '.sb3をアップロード'}
                  </label>
                </div>
              </div>
              {sb3Files.length === 0 ? (
                <div className="border border-dashed border-slate-200 rounded-xl py-10 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">まだファイルはないよ</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {sb3Files.map(file => (
                    <div key={file.id} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 hover:border-orange-200 transition-all">
                      <div className="flex items-center gap-3 overflow-hidden">
                        <div className="bg-orange-100 text-orange-600 p-2 rounded-lg shrink-0"><FileArchive size={16} /></div>
                        <div className="overflow-hidden">
                          <p className="font-black text-slate-800 text-xs truncate">{file.fileName}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase">{file.uploadDate}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <a href={file.downloadUrl} download={file.fileName} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-orange-600 rounded-lg transition-colors"><Download size={14} /></a>
                        <button onClick={() => deleteSb3File(file)} className="p-2 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======== ENHANCE TAB (student only) ======== */}
        {isStudent && activeTab === 'enhance' && (
          <div className="space-y-5 animate-in fade-in duration-300">
            <header>
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <ShieldPlus size={22} className="text-amber-500" /> キャラクターを強化しよう
              </h2>
              <p className="text-xs text-slate-400 font-medium mt-0.5">先生からコメントをもらってポイントをゲット！キャラを強くしよう！</p>
            </header>

            {/* Stats enhancement */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h3 className="text-sm font-black text-slate-800">⭐ ステータス振り分け</h3>
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                  <span className="text-lg">🌟</span>
                  <div>
                    <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">もってるポイント</p>
                    <p className="text-xl font-black text-amber-600 leading-none">{points}</p>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'hp', label: 'HP', icon: '❤️', color: 'from-rose-400 to-pink-500', desc: 'たいりょく' },
                  { key: 'atk', label: 'ATK', icon: '⚡', color: 'from-orange-400 to-amber-500', desc: 'こうげき' },
                  { key: 'def', label: 'DEF', icon: '🛡️', color: 'from-sky-400 to-blue-500', desc: 'ぼうぎょ' },
                ].map(({ key, label, icon, color, desc }) => (
                  <div key={key} className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white text-center shadow-md`}>
                    <div className="text-2xl mb-0.5">{icon}</div>
                    <p className="font-black text-lg">{label}</p>
                    <p className="text-[10px] opacity-80 font-medium mb-1">{desc}</p>
                    <p className="text-2xl font-black mb-2">+{customStats[key] || 0}</p>
                    <button
                      onClick={async () => {
                        if (points <= 0) return;
                        const studentRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId);
                        await updateDoc(studentRef, { points: points - 1, [`customStats.${key}`]: (customStats[key] || 0) + 1 });
                        setSaveMessage(`⭐ ${label} +1！`);
                        setTimeout(() => setSaveMessage(''), 2000);
                      }}
                      disabled={points <= 0}
                      className={`w-full py-2 rounded-xl text-xs font-black transition-all active:scale-95 ${points > 0 ? 'bg-white/30 hover:bg-white/50 text-white' : 'bg-white/10 text-white/40 cursor-not-allowed'}`}
                    >
                      {points > 0 ? '+1 つかう' : 'ポイントなし'}
                    </button>
                  </div>
                ))}
              </div>
              {points > 0 && <p className="text-center text-xs text-slate-500 font-bold mt-3">🌟 {points}ポイントあるよ！ゲームをゆうりにするためにつかおう！</p>}
            </div>

            {/* Gacha */}
            <GachaSystem
              points={points}
              onRoll={async (pulledItem) => {
                const studentRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId);
                await updateDoc(studentRef, { points: points - 10, inventory: [...inventory, pulledItem.id] });
              }}
            />

            {/* Equipment + Inventory */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2 mb-4">🛡️ そうびともちもの</h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                {['weapon', 'armor', 'accessory'].map(type => {
                  const eqId = equipped[type];
                  const eqItem = GACHA_ITEMS.find(i => i.id === eqId);
                  return (
                    <div key={type} className="bg-slate-50 rounded-xl p-3 border border-slate-200 relative group">
                      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">{type === 'weapon' ? '⚔️ ぶき' : type === 'armor' ? '🛡️ よろい' : '💍 アクセサリー'}</p>
                      {eqItem ? (
                        <div className="space-y-1">
                          <p className={`font-black text-sm ${eqItem.rarity === 'SS' ? 'text-fuchsia-600' : eqItem.rarity === 'S' ? 'text-rose-600' : 'text-slate-800'}`}>
                            {eqItem.name} <span className="text-[9px] bg-white px-1.5 py-0.5 rounded-full border shadow-sm">{eqItem.rarity}</span>
                          </p>
                          <div className="flex gap-2 text-[10px] font-bold text-slate-500">
                            {eqItem.stats.hp !== 0 && <span>HP{eqItem.stats.hp > 0 ? '+' : ''}{eqItem.stats.hp}</span>}
                            {eqItem.stats.atk !== 0 && <span>ATK{eqItem.stats.atk > 0 ? '+' : ''}{eqItem.stats.atk}</span>}
                            {eqItem.stats.def !== 0 && <span>DEF{eqItem.stats.def > 0 ? '+' : ''}{eqItem.stats.def}</span>}
                          </div>
                          <button
                            onClick={async () => {
                              if (!window.confirm('そうびをはずしますか？')) return;
                              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId), { equipped: { ...equipped, [type]: null } });
                            }}
                            className="mt-1 text-[10px] text-rose-500 font-bold hover:underline"
                          >はずす</button>
                        </div>
                      ) : (
                        <div className="text-slate-400 font-medium text-xs py-3 text-center border-2 border-dashed border-slate-200 rounded-lg">なにもなし</div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-xs font-black text-slate-600 mb-3">もちもの ({inventory.length}個)</h4>
                {inventory.length === 0 ? (
                  <p className="text-xs font-bold text-slate-400 text-center py-4">まだそうびがないよ！ガチャをまわしてゲットしよう！</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                    {Object.values(inventory.reduce((acc, id) => {
                      if (!acc[id]) acc[id] = { id, count: 0 };
                      acc[id].count++;
                      return acc;
                    }, {})).map((group, idx) => {
                      const item = GACHA_ITEMS.find(i => i.id === group.id);
                      if (!item) return null;
                      const isEq = Object.values(equipped).includes(group.id);
                      return (
                        <div key={`${group.id}-${idx}`} className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${isEq ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-orange-200'}`}>
                          <div>
                            <p className="font-black text-xs text-slate-800">
                              {item.name} <span className="text-[9px] px-1 rounded bg-slate-100 border text-slate-500">{item.rarity}</span>
                              {group.count > 1 && <span className="ml-1 text-[10px] font-bold text-fuchsia-500">x{group.count}</span>}
                            </p>
                            <div className="flex gap-1.5 text-[9px] font-bold text-slate-400 mt-0.5">
                              <span>{item.type === 'weapon' ? '⚔️' : item.type === 'armor' ? '🛡️' : '💍'}</span>
                              {item.stats.hp !== 0 && <span>HP{item.stats.hp > 0 ? '+' : ''}{item.stats.hp}</span>}
                              {item.stats.atk !== 0 && <span>ATK{item.stats.atk > 0 ? '+' : ''}{item.stats.atk}</span>}
                              {item.stats.def !== 0 && <span>DEF{item.stats.def > 0 ? '+' : ''}{item.stats.def}</span>}
                            </div>
                          </div>
                          {!isEq ? (
                            <button
                              onClick={async () => {
                                await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId), { equipped: { ...equipped, [item.type]: group.id } });
                              }}
                              className="shrink-0 bg-slate-900 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1.5 rounded-lg hover:bg-orange-500 transition-colors"
                            >そうびする</button>
                          ) : (
                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-100 px-2 py-1 rounded-md shrink-0">そうびちゅう</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ======== GAME TAB (student only) ======== */}
        {isStudent && activeTab === 'game' && (() => {
          const completedCount = studentData?.completedMaterials?.length || 0;
          return (
            <div className="space-y-4 animate-in fade-in duration-300">
              <header>
                <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
                  <Swords size={22} className="text-violet-600" /> タイピングバトル
                </h2>
                <p className="text-xs text-slate-500 font-medium mt-0.5">XPをためてキャラクターをレベルアップさせよう！</p>
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

        {/* ======== GROWTH TAB ======== */}
        {activeTab === 'growth' && (() => {
          const allRecords = learningRecords
            .filter(r => r.studentId === studentIdCtx)
            .sort((a, b) => {
              const da = a.lessonDate || (a.createdAt?.seconds ? new Date(a.createdAt.seconds * 1000).toISOString().slice(0, 10) : '');
              const db2 = b.lessonDate || (b.createdAt?.seconds ? new Date(b.createdAt.seconds * 1000).toISOString().slice(0, 10) : '');
              return db2.localeCompare(da);
            });

          const uncommentedByParent = allRecords.filter(r => !r.parentComment);
          const myRecords = (isParent && showOnlyUncommented) ? uncommentedByParent : allRecords;

          const grouped = {};
          myRecords.forEach(r => {
            const key = r.lessonDate || (r.createdAt?.seconds ? new Date(r.createdAt.seconds * 1000).toISOString().slice(0, 10) : '日付なし');
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(r);
          });
          const groupedEntries = Object.entries(grouped);
          const completedCount = studentData?.completedMaterials?.length || 0;
          const totalMat = materials.length || 1;
          const progressPct2 = Math.min(100, Math.floor((completedCount / totalMat) * 100));

          return (
            <div className="space-y-5 animate-in fade-in duration-300">
              <header className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-xl font-black text-slate-800">📚 成長の軌跡</h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    {isParent ? `${studentData?.name || 'お子さん'}の学びの記録` : 'これまでの学びの記録をふり返ろう！'}
                  </p>
                </div>
                {/* Parent filter toggle */}
                {isParent && allRecords.length > 0 && (
                  <div className="flex bg-slate-100 p-1 rounded-xl shrink-0">
                    <button
                      onClick={() => setShowOnlyUncommented(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${!showOnlyUncommented ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >すべて ({allRecords.length})</button>
                    <button
                      onClick={() => setShowOnlyUncommented(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${showOnlyUncommented ? 'bg-sky-500 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      💙 未コメント
                      {uncommentedByParent.length > 0 && (
                        <span className={`text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center ${showOnlyUncommented ? 'bg-white/30 text-white' : 'bg-sky-500 text-white'}`}>
                          {uncommentedByParent.length}
                        </span>
                      )}
                    </button>
                  </div>
                )}
              </header>

              {/* Stats grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'じゅぎょうの回数', value: `${Object.keys(allRecords.reduce((acc, r) => { const k = r.lessonDate || '?'; acc[k] = 1; return acc; }, {})).length}回`, icon: '📅', color: 'from-teal-400 to-emerald-500' },
                  { label: 'きろく数', value: `${allRecords.length}件`, icon: '📝', color: 'from-sky-400 to-blue-500' },
                  { label: isParent ? '応援コメント' : 'もらったポイント', value: isParent ? `${allRecords.filter(r => r.parentComment).length}件` : `${allRecords.filter(r => r.commentPointed).length}pt`, icon: isParent ? '💙' : '🌟', color: 'from-amber-400 to-orange-500' },
                  { label: 'カリキュラムのすすみ', value: `${progressPct2}%`, icon: '🎯', color: 'from-violet-400 to-purple-500' },
                ].map(({ label, value, icon, color }) => (
                  <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-4 text-white shadow-md`}>
                    <div className="text-2xl mb-1">{icon}</div>
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-80">{label}</p>
                    <p className="text-xl font-black">{value}</p>
                  </div>
                ))}
              </div>

              {/* Parent: prompt to comment if there are uncommented records */}
              {isParent && uncommentedByParent.length > 0 && !showOnlyUncommented && (
                <button
                  onClick={() => setShowOnlyUncommented(true)}
                  className="w-full flex items-center gap-3 bg-sky-50 border border-sky-200 rounded-2xl px-4 py-3 text-sm font-black text-sky-700 hover:bg-sky-100 transition-colors"
                >
                  <span className="text-xl">💙</span>
                  <div className="text-left">
                    <p className="font-black text-sky-700">応援メッセージを送ろう！</p>
                    <p className="text-xs text-sky-500 font-medium">まだコメントしていない記録が {uncommentedByParent.length}件 あります</p>
                  </div>
                  <span className="ml-auto text-sky-400">→</span>
                </button>
              )}

              {isStudent && (customStats.hp > 0 || customStats.atk > 0 || customStats.def > 0) && (
                <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center gap-4 flex-wrap shadow-sm">
                  <p className="text-xs font-black text-slate-700">⚔️ キャラクターボーナス</p>
                  <span className="text-xs font-bold text-rose-500">❤️ HP+{customStats.hp}</span>
                  <span className="text-xs font-bold text-amber-500">⚡ ATK+{customStats.atk}</span>
                  <span className="text-xs font-bold text-sky-500">🛡️ DEF+{customStats.def}</span>
                </div>
              )}

              {myRecords.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <div className="text-5xl mb-4">{showOnlyUncommented ? '✅' : '📭'}</div>
                  <p className="font-bold">{showOnlyUncommented ? 'すべての記録にコメント済みです！' : 'まだ記録がありません'}</p>
                  <p className="text-xs mt-1">{showOnlyUncommented ? 'ありがとうございます💙' : '授業のあとに目標や振り返りを投稿してみよう！'}</p>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 via-sky-300 to-violet-300 rounded-full" />
                  <div className="space-y-8 pl-14">
                    {groupedEntries.map(([date, records]) => (
                      <div key={date} className="relative">
                        <div className="absolute -left-14 top-0 flex flex-col items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md text-white font-black text-[9px] text-center leading-tight border-4 border-white">
                            {date === '日付なし' ? '??' : (
                              <><span className="block">{date.slice(5, 7)}月</span><span className="text-xs block leading-none">{date.slice(8, 10)}</span></>
                            )}
                          </div>
                        </div>
                        <p className="text-[10px] font-black text-teal-600 uppercase tracking-widest mb-2">{date} — {records.length}件のきろく</p>
                        <div className="space-y-3">
                          {records.map(record => {
                            const needsParentComment = isParent && !record.parentComment;
                            return (
                              <div key={record.id} className={`rounded-2xl border p-4 shadow-sm transition-all ${needsParentComment ? 'ring-2 ring-sky-200' : ''} ${record.recordType === 'goal' ? 'bg-emerald-50 border-emerald-100' : 'bg-orange-50 border-orange-100'}`}>
                                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${record.recordType === 'goal' ? 'bg-emerald-500 text-white' : 'bg-orange-500 text-white'}`}>
                                    {record.recordType === 'goal' ? '🎯 もくひょう' : '📝 ふりかえり'}
                                  </span>
                                  {record.commentPointed && <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">🌟 +1pt</span>}
                                  {needsParentComment && (
                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-sky-100 text-sky-600 border border-sky-200">💙 未コメント</span>
                                  )}
                                </div>
                                <h4 className="font-black text-slate-800 text-sm mb-1.5">{record.title}</h4>
                                {typeof record.content === 'object' && record.content !== null
                                  ? Object.values(record.content).filter(Boolean).map((v, i) => (
                                    <p key={i} className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap mb-1">{String(v)}</p>
                                  ))
                                  : <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{record.content}</p>
                                }

                                {record.comment && (
                                  <div className={`mt-3 p-3 rounded-xl border text-xs ${record.recordType === 'goal' ? 'bg-white border-emerald-200' : 'bg-white border-orange-200'}`}>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-1">💬 先生のコメント</p>
                                    <p className="font-bold text-slate-700 italic">"{record.comment}"</p>
                                  </div>
                                )}

                                {(isParent || (isStudent && record.parentComment)) && (
                                  <div className={`mt-2 p-3 rounded-xl border text-xs ${needsParentComment ? 'border-sky-300 bg-sky-50' : 'border-sky-200 bg-white'}`}>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-sky-500 mb-1">💙 おうちのひとのメッセージ</p>
                                    {record.parentComment && <p className="font-bold text-slate-700 italic mb-2">"{record.parentComment}"</p>}
                                    {isParent && (
                                      <div className="flex gap-2">
                                        <input
                                          type="text"
                                          placeholder={needsParentComment ? '応援メッセージを送ろう！' : 'メッセージを変更する'}
                                          value={parentComment[record.id] || ''}
                                          onChange={e => setParentComment({ ...parentComment, [record.id]: e.target.value })}
                                          className="flex-1 bg-white border border-sky-200 rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2 focus:ring-sky-400"
                                        />
                                        <button
                                          onClick={async () => {
                                            if (!parentComment[record.id]?.trim()) return;
                                            try {
                                              await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'learning_records', record.id), { parentComment: parentComment[record.id].trim() });
                                              setSaveMessage('応援メッセージを送りました 💙');
                                              setParentComment(prev => { const n = { ...prev }; delete n[record.id]; return n; });
                                              setTimeout(() => setSaveMessage(''), 3000);
                                            } catch (e) { setSaveMessage('送信失敗'); }
                                          }}
                                          disabled={!parentComment[record.id]?.trim()}
                                          className={`shrink-0 font-bold px-3 py-2 rounded-lg text-xs transition-colors ${parentComment[record.id]?.trim() ? 'bg-sky-500 text-white hover:bg-sky-600' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                                        >送信</button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    <div className="relative">
                      <div className="absolute -left-14 top-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center shadow-md text-white text-xl border-4 border-white">🌱</div>
                      </div>
                      <div className="py-3">
                        <p className="text-sm font-black text-violet-500">{isParent ? 'ありがとうございます💙' : 'これからも頑張ろう！'}</p>
                        <p className="text-xs text-slate-400 font-medium">{isParent ? 'お子さんの成長を一緒に見守りましょう！' : 'きろくをつづけて、もっともっとせいちょうしていこう！'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ======== MATERIALS TAB ======== */}
        {activeTab === 'materials' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-xl font-black text-slate-800">きょうざいをみよう</h2>
              <div className="relative max-w-xs w-full">
                <input
                  type="text"
                  placeholder="タイトルでさがす..."
                  value={materialSearch}
                  onChange={e => setMaterialSearch(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-9 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
                />
                <BookOpen size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                {materialSearch && <button onClick={() => setMaterialSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X size={14} /></button>}
              </div>
            </header>

            {/* Parent: completion progress banner */}
            {isParent && (() => {
              const completedIds = studentData?.completedMaterials || [];
              const total = materials.filter(m => m.isPublished !== false).length;
              const done = completedIds.length;
              const pct = total > 0 ? Math.min(100, Math.floor((done / total) * 100)) : 0;
              return (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Trophy size={16} className="text-amber-500 shrink-0" />
                      <span className="text-sm font-black text-slate-800">カリキュラム達成率</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
                      <span>クリア: <span className="text-emerald-600 font-black">{done}</span> 教材</span>
                      <span>残り: <span className="text-slate-800 font-black">{total - done}</span> 教材</span>
                      <span className="text-lg font-black text-amber-600">{pct}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all duration-700 relative"
                      style={{ width: `${pct}%` }}
                    >
                      {pct > 10 && <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.15)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.15)_50%,rgba(255,255,255,0.15)_75%,transparent_75%,transparent)] bg-[length:0.75rem_0.75rem]" />}
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="space-y-10">
              {materialSearch ? (
                // Search results view
                <div className="space-y-4">
                  {(() => {
                    const results = materials.filter(m => m.isPublished !== false && m.title?.toLowerCase().includes(materialSearch.toLowerCase()));
                    if (results.length === 0) return <div className="text-center py-16 text-slate-400 font-bold">「{materialSearch}」に一致する教材は見つかりませんでした</div>;
                    return (
                      <>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{results.length}件のけっか</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {results.map(m => {
                            const isYoutube = !!getYoutubeEmbedUrl(m.url);
                            const isScratch = m.category === 'scratch' || (m.tags && m.tags.some(t => t.toLowerCase() === 'scratch'));
                            const isCompleted = studentData?.completedMaterials?.includes(m.id) || false;
                            return (
                              <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                                <div className="p-4 flex-1 flex flex-col gap-3">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${isYoutube ? 'bg-red-100 text-red-600' : isScratch ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                                      {isYoutube ? 'YouTube' : isScratch ? 'Scratch' : m.category || 'Web'}
                                    </span>
                                    {isCompleted && <CheckCircle2 size={14} className="text-emerald-500" />}
                                  </div>
                                  <h4 className="font-black text-slate-800 text-sm flex-1 cursor-pointer hover:text-orange-600 transition-colors line-clamp-3 leading-snug" onClick={(e) => handleMaterialOpen(e, m)}>
                                    {m.title}
                                  </h4>
                                  <button onClick={(e) => handleMaterialOpen(e, m)} className="w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black border border-slate-200 text-slate-500 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all">
                                    <PlayCircle size={14} /> ひらく
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </>
                    );
                  })()}
                </div>
              ) : null}
              {!materialSearch && [...MATERIAL_CATEGORIES, { id: 'other', label: 'その他' }].map(category => {
                const categoryMaterials = category.id === 'other'
                  ? materials.filter(m => m.isPublished !== false && !MATERIAL_CATEGORIES.some(c => c.id === m.category))
                  : materials.filter(m => m.isPublished !== false && m.category === category.id);
                if (categoryMaterials.length === 0) return null;
                return (
                  <div key={category.id} className="space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-black text-slate-800">{category.label}</h3>
                      <span className="bg-slate-200 text-slate-600 text-xs font-black px-2.5 py-1 rounded-full">{categoryMaterials.length}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {categoryMaterials.map(m => {
                        const isYoutube = !!getYoutubeEmbedUrl(m.url);
                        const isScratch = m.category === 'scratch' || (m.tags && m.tags.some(t => t.toLowerCase() === 'scratch'));
                        const isCompleted = studentData?.completedMaterials?.includes(m.id) || false;
                        return (
                          <div key={m.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                            <div className="p-4 flex-1 flex flex-col gap-3">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${isYoutube ? 'bg-red-100 text-red-600' : isScratch ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-600'}`}>
                                  {isYoutube ? 'YouTube' : isScratch ? 'Scratch' : 'Web'}
                                </span>
                                {isCompleted && <CheckCircle2 size={14} className="text-emerald-500" />}
                              </div>
                              <h4 className="font-black text-slate-800 text-sm flex-1 cursor-pointer hover:text-orange-600 transition-colors line-clamp-3 leading-snug" onClick={(e) => handleMaterialOpen(e, m)}>
                                {m.title}
                              </h4>
                              <button
                                onClick={(e) => handleMaterialOpen(e, m)}
                                className="w-full py-2 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black border border-slate-200 text-slate-500 hover:bg-orange-50 hover:border-orange-300 hover:text-orange-600 transition-all"
                              >
                                <PlayCircle size={14} /> ひらく
                              </button>
                              {isStudent && (() => {
                                const studentReqs = completionRequests.filter(r => r.studentId === currentUser.studentId && r.materialId === m.id);
                                const hasPending = studentReqs.some(r => r.status === 'pending');
                                const hasRejected = studentReqs.some(r => r.status === 'rejected') && !hasPending && !isCompleted;
                                let btn = { bg: 'bg-slate-100 text-slate-500 hover:bg-orange-600 hover:text-white border border-slate-200', icon: <Star size={16} />, text: 'クリアしたよ！', disabled: false };
                                if (isCompleted) btn = { bg: 'bg-emerald-100 text-emerald-600 border border-emerald-200 cursor-default', icon: <CheckCircle2 size={16} />, text: 'クリア！', disabled: true };
                                else if (hasPending) btn = { bg: 'bg-amber-100 text-amber-600 border border-amber-200 cursor-default', icon: <Clock size={16} />, text: 'かくにんちゅう', disabled: true };
                                else if (hasRejected) btn = { bg: 'bg-rose-100 text-rose-600 border border-rose-200 hover:bg-rose-500 hover:text-white', icon: <Menu size={16} />, text: 'もういちどやろう', disabled: false };
                                return (
                                  <>
                                    {hasRejected && <p className="text-[9px] text-rose-500 font-bold mb-1 text-center animate-pulse">差し戻されたよ！もういちどやってみよう！</p>}
                                    <button
                                      onClick={async (e) => {
                                        if (btn.disabled || isSubmittingComplete) return;
                                        setIsSubmittingComplete(true);
                                        try { await toggleMaterialComplete(e, m.id); } finally { setIsSubmittingComplete(false); }
                                      }}
                                      disabled={btn.disabled || isSubmittingComplete}
                                      className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-all ${btn.bg} ${isSubmittingComplete ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                      {btn.icon}{isSubmittingComplete ? 'おくりちゅう...' : btn.text}
                                    </button>
                                  </>
                                );
                              })()}
                              {isParent && (
                                <div className={`w-full py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 text-xs font-black border ${isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                                  {isCompleted ? <CheckCircle2 size={16} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
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

      <footer className="shrink-0 mt-8 py-5 text-center text-slate-400 text-xs font-bold tracking-widest bg-white border-t border-slate-100 mx-3 rounded-t-2xl">
        クリエット プログラミング
      </footer>
    </div>
  );
}
