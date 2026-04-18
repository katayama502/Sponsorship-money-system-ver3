import React, { useState } from 'react';
import {
  Users,
  FileText,
  BookOpen,
  CheckCircle2,
  Settings2,
  Megaphone,
  LogOut,
  Menu,
  Calculator,
  X,
  AlertTriangle,
  Loader2,
  Upload,
  Image as ImageIcon,
  Edit2,
  Trash2,
  Sparkles,
  Download,
  Link as LinkIcon,
  MessageSquare,
  Key,
  FileArchive,
  Check
} from 'lucide-react';

import { generateCredentials } from '../../utils/authUtils';

export default function AdminLayout({
  activeTab,
  setActiveTab,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  handleLogout,
  saveMessage,
  storageUsage,
  setStorageUsage,
  students,
  materials,
  announcements,
  learningRecords,
  completionRequests,
  messages,
  activeStudentDetail,
  setActiveStudentDetail,
  studentSearchQuery,
  setStudentSearchQuery,
  generatedCreds,
  setGeneratedCreds,
  studentForm,
  setStudentForm,
  editingStudent,
  setEditingStudent,
  saveStudent,
  createTestAccount,
  deleteStudentCascade,
  deleteAnnouncement,
  materialForm,
  setMaterialForm,
  isUploadingMaterialUpload,
  isUploadingMaterialThumbnail,
  uploadMaterialFile,
  saveMaterial,
  editingMaterial,
  setEditingMaterial,
  deleteMaterial,
  announcementForm,
  setAnnouncementForm,
  postAnnouncement,
  reflectionItemForm,
  setReflectionItemForm,
  saveReflectionItem,
  editingReflectionItem,
  setEditingReflectionItem,
  deleteReflectionItem,
  reflectionTemplate,
  adminComment,
  setAdminComment,
  submitAdminComment,
  approveCompletion,
  rejectCompletion,
  newMessage,
  setNewMessage,
  sendMessage,
  isSendingMessage,
  sb3Files
}) {
  const [copiedField, setCopiedField] = useState(null);
  const [materialCategoryFilter, setMaterialCategoryFilter] = useState('all');
  const [materialSearchQuery, setMaterialSearchQuery] = useState('');
  const [recordFilter, setRecordFilter] = useState('uncommented');
  const [recordStudentFilter, setRecordStudentFilter] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);

  const copyToClipboard = (text, fieldKey) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  return (
    <div className="flex h-screen overflow-hidden relative">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out shrink-0 md:static md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 bg-slate-950 border-b border-slate-800">
          <span className="font-black tracking-widest text-white uppercase flex items-center"><Calculator size={18} className="text-orange-500 mr-2" /> Clayette Admin</span>
          <button 
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-6 space-y-2 px-4">
          <button onClick={() => { setActiveTab('dashboard'); setActiveStudentDetail(null); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'dashboard' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800'}`}>
            <span className="flex items-center gap-3"><Calculator size={18} /> ダッシュボード</span>
          </button>
          <button onClick={() => { setActiveTab('students'); setActiveStudentDetail(null); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800'}`}>
            <span className="flex items-center gap-3"><Users size={18} /> 受講生一覧</span>
            {(() => {
              const unreadCount = (students || []).filter(s => {
                const studentMsgs = (messages || []).filter(m => m.studentId === s.id);
                if (studentMsgs.length === 0) return false;
                return studentMsgs[studentMsgs.length - 1].senderId !== 'admin';
              }).length;
              return unreadCount > 0 ? <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span> : null;
            })()}
          </button>
          <button onClick={() => { setActiveTab('records'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'records' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800'}`}>
            <span className="flex items-center gap-3"><FileText size={18} /> 提出シート確認</span>
            {(() => {
              const unreadCount = (learningRecords || []).filter(r => !r.comment).length;
              return unreadCount > 0 ? <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span> : null;
            })()}
          </button>
          <button onClick={() => { setActiveTab('materials'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'materials' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800'}`}>
            <span className="flex items-center gap-3"><BookOpen size={18} /> 教材リソース</span>
          </button>
          <button onClick={() => { setActiveTab('approvals'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'approvals' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800'}`}>
            <span className="flex items-center gap-3"><CheckCircle2 size={18} /> カリキュラム承認</span>
            {(() => {
              const pendingCount = (completionRequests || []).filter(r => r.status === 'pending').length;
              return pendingCount > 0 ? <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{pendingCount}</span> : null;
            })()}
          </button>
          <button onClick={() => { setActiveTab('reflections'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'reflections' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800'}`}>
            <span className="flex items-center gap-3"><Settings2 size={18} /> 記録フォーマット</span>
          </button>
          <button onClick={() => { setActiveTab('notices'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'notices' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800'}`}>
            <span className="flex items-center gap-3"><Megaphone size={18} /> 全体お知らせ</span>
          </button>
        </div>
        <div className="p-4 border-t border-slate-800">
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold hover:bg-slate-800 text-rose-400 rounded-xl transition-all"><LogOut size={18} /> ログアウト</button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-lg font-black text-slate-800 uppercase tracking-widest hidden sm:block">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-black text-xs">AD</div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {saveMessage && <div role="alert" className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce text-left"><CheckCircle2 size={18} className="text-emerald-400" /><span className="text-sm font-bold">{saveMessage}</span></div>}

          {/* 容量アラートポップアップ */}
          {storageUsage.isWarning && (
            <div role="alert" className="mb-6 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-2xl shadow-sm animate-in slide-in-from-top-4 duration-500 relative flex items-start gap-3">
               <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={20} />
               <div>
                 <h3 className="text-sm font-black text-rose-800">【警告】ストレージ容量が上限に近づいています</h3>
                 <p className="text-xs text-rose-600 mt-1">
                    Firebase Storage の無料枠（5GB）の上限に達する可能性があります（現在約 {Math.round(storageUsage.usedBytes / 1024 / 1024 / 1024)}GB）。
                    不要なファイルを削除するか、プランのアップグレードを検討してください。
                 </p>
               </div>
               <button onClick={() => setStorageUsage(prev => ({ ...prev, isWarning: false }))} className="absolute top-4 right-4 text-rose-400 hover:text-rose-600">
                 <X size={16} />
               </button>
            </div>
          )}

          {/* ダッシュボード */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500 text-left">
              <header>
                <h2 className="text-2xl font-black tracking-tight text-slate-800">ダッシュボード</h2>
                <p className="text-sm text-slate-400 mt-1">システム全体の状況</p>
              </header>

              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <button onClick={() => { setActiveTab('students'); setActiveStudentDetail(null); }} className="text-left bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-orange-300 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-orange-200 transition-colors">
                    <Users size={20} className="text-orange-500" />
                  </div>
                  <p className="text-3xl font-black text-slate-800">{(students || []).length}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">登録生徒数</p>
                </button>

                <button onClick={() => setActiveTab('approvals')} className="text-left bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-rose-300 hover:shadow-md transition-all group relative">
                  {(completionRequests || []).filter(r => r.status === 'pending').length > 0 && (
                    <span className="absolute top-3 right-3 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">要対応</span>
                  )}
                  <div className="w-10 h-10 bg-rose-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-rose-200 transition-colors">
                    <CheckCircle2 size={20} className="text-rose-500" />
                  </div>
                  <p className="text-3xl font-black text-slate-800">{(completionRequests || []).filter(r => r.status === 'pending').length}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">承認待ち</p>
                </button>

                <button onClick={() => setActiveTab('records')} className="text-left bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-amber-300 hover:shadow-md transition-all group relative">
                  {(learningRecords || []).filter(r => !r.comment).length > 0 && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">要対応</span>
                  )}
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-amber-200 transition-colors">
                    <FileText size={20} className="text-amber-500" />
                  </div>
                  <p className="text-3xl font-black text-slate-800">{(learningRecords || []).filter(r => !r.comment).length}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">未コメント</p>
                </button>

                <button onClick={() => setActiveTab('students')} className="text-left bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mb-3 group-hover:bg-slate-200 transition-colors">
                    <MessageSquare size={20} className="text-slate-500" />
                  </div>
                  <p className="text-3xl font-black text-slate-800">{(students || []).filter(s => { const m = (messages || []).filter(msg => msg.studentId === s.id); return m.length > 0 && m[m.length - 1].senderId !== 'admin'; }).length}</p>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">新着メッセージ</p>
                </button>
              </div>

              {/* Two-column panels */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 未コメント提出シート */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><FileText size={16} className="text-amber-500" /> 未コメントの提出シート</h3>
                    <button onClick={() => setActiveTab('records')} className="text-xs font-bold text-orange-500 hover:underline">すべて見る →</button>
                  </div>
                  <div className="space-y-2">
                    {(learningRecords || []).filter(r => !r.comment).slice(0, 5).map(record => (
                      <div key={record.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="min-w-0 mr-2">
                          <p className="text-xs font-black text-slate-700">{record.studentName}</p>
                          <p className="text-[10px] text-slate-400 truncate">{record.title}</p>
                        </div>
                        <span className={`shrink-0 text-[9px] font-black px-2 py-0.5 rounded-full ${record.recordType === 'goal' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                          {record.recordType === 'goal' ? '目標' : '振り返り'}
                        </span>
                      </div>
                    ))}
                    {(learningRecords || []).filter(r => !r.comment).length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs font-bold">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-300" />
                        未コメントの提出はありません
                      </div>
                    )}
                  </div>
                </div>

                {/* 承認待ちカリキュラム */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><CheckCircle2 size={16} className="text-rose-500" /> 承認待ちカリキュラム</h3>
                    <button onClick={() => setActiveTab('approvals')} className="text-xs font-bold text-orange-500 hover:underline">すべて見る →</button>
                  </div>
                  <div className="space-y-2">
                    {(completionRequests || []).filter(r => r.status === 'pending').slice(0, 5).map(req => {
                      const material = (materials || []).find(m => m.id === req.materialId);
                      return (
                        <div key={req.id} className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-100">
                          <div className="min-w-0 mr-2">
                            <p className="text-xs font-black text-slate-700">{req.studentName}</p>
                            <p className="text-[10px] text-slate-400 truncate">{material ? material.title : '不明な教材'}</p>
                          </div>
                          <span className="shrink-0 text-[9px] font-black bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">承認待ち</span>
                        </div>
                      );
                    })}
                    {(completionRequests || []).filter(r => r.status === 'pending').length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs font-bold">
                        <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-300" />
                        承認待ちはありません
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 本日の授業 */}
              {(() => {
                const today = new Date().toISOString().slice(0, 10);
                const todayStudents = (students || []).filter(s => s.nextClassDate === today);
                if (todayStudents.length === 0) return null;
                return (
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl p-6 text-white shadow-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-black flex items-center gap-2">📅 本日の授業（{todayStudents.length}名）</h3>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {todayStudents.map(s => (
                        <button
                          key={s.id}
                          onClick={() => { setActiveTab('students'); setActiveStudentDetail(s.id); }}
                          className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition-colors"
                        >
                          <div className="w-7 h-7 bg-white/30 rounded-lg flex items-center justify-center font-black text-sm">{s.name?.[0] || '?'}</div>
                          <span className="font-black text-sm">{s.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* 生徒一覧クイックアクセス */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-2"><Users size={16} className="text-orange-500" /> 受講生</h3>
                  <button onClick={() => { setActiveTab('students'); setActiveStudentDetail(null); }} className="text-xs font-bold text-orange-500 hover:underline">管理画面へ →</button>
                </div>
                {(students || []).length === 0 ? (
                  <p className="text-center text-slate-400 text-xs font-bold py-6">まだ生徒が登録されていません</p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                    {(students || []).map(s => {
                      const studentMsgs = (messages || []).filter(m => m.studentId === s.id);
                      const hasUnread = studentMsgs.length > 0 && studentMsgs[studentMsgs.length - 1].senderId !== 'admin';
                      return (
                        <button
                          key={s.id}
                          onClick={() => { setActiveTab('students'); setActiveStudentDetail(s.id); }}
                          className="relative p-3 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-300 hover:bg-orange-50 transition-all text-left"
                        >
                          {hasUnread && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-rose-500 rounded-full"></span>}
                          <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center mb-2 text-orange-600 font-black text-sm">{s.name?.[0] || '?'}</div>
                          <p className="text-xs font-black text-slate-800 truncate">{s.name}</p>
                          <p className="text-[9px] text-slate-400 truncate">{s.school || '学校未登録'}</p>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* カリキュラム承認 */}
          {activeTab === 'approvals' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-left">
              <header className="flex justify-between items-center text-left">
                <h2 className="text-2xl font-black tracking-tight text-left">カリキュラム承認待ち一覧</h2>
              </header>

              <div className="space-y-4">
                {(completionRequests || []).filter(req => req.status === 'pending').map(req => {
                  const material = materials.find(m => m.id === req.materialId);
                  return (
                    <div key={req.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-xs font-bold">{req.studentName}</span>
                          <span className="text-slate-400 text-xs">{req.createdAt?.toDate().toLocaleString('ja-JP')}</span>
                        </div>
                        <h3 className="font-bold text-lg text-slate-800">
                          教材: {material ? material.title : '不明な教材'}
                        </h3>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto mt-4 md:mt-0">
                        <button
                          onClick={() => rejectCompletion(req.id)}
                          className="shrink-0 bg-slate-100 hover:bg-rose-100 text-slate-600 hover:text-rose-600 px-6 py-3 rounded-xl font-bold transition-colors text-sm"
                        >
                          差し戻し
                        </button>
                        <button
                          onClick={() => approveCompletion(req.id, req.studentId, req.materialId)}
                          className="shrink-0 bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-md text-sm"
                        >
                          <CheckCircle2 size={18} /> 承認する
                        </button>
                      </div>
                    </div>
                  );
                })}

                {(completionRequests || []).filter(req => req.status === 'pending').length === 0 && (
                  <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                    <CheckCircle2 size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500 font-bold">現在、承認待ちのカリキュラムはありません。</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 生徒管理 */}
          {activeTab === 'students' && !activeStudentDetail && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-left">
              <header className="text-left flex flex-col md:flex-row md:items-center justify-between gap-4">
                <h2 className="text-2xl font-black tracking-tight text-left">受講生・保護者管理</h2>
                <button onClick={createTestAccount} className="bg-amber-100 hover:bg-amber-200 text-amber-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 border border-amber-300 shadow-sm transition-all"><Sparkles size={14}/> ガチャテスト用アカウント作成 (10000pt)</button>
              </header>

              {generatedCreds && (
                <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl space-y-4 border-2 border-orange-500 animate-in zoom-in-95 duration-300 text-left">
                  <div className="flex items-center gap-3 text-orange-400 font-bold text-left"><Key size={20} /> <span className="text-left">アカウントを発行しました: {generatedCreds.name}様</span></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-mono">
                    <div className="bg-white/10 p-4 rounded-2xl text-left">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-bold text-orange-300 uppercase text-left">受講生用</p>
                        <button
                          aria-label="受講生のIDとパスワードをコピー"
                          onClick={() => copyToClipboard(`ID: ${generatedCreds.student.id} / PW: ${generatedCreds.student.pw}`, 'student-creds')}
                          className="text-[9px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded font-black text-orange-200 uppercase tracking-widest flex items-center gap-1 transition-colors"
                        >
                          {copiedField === 'student-creds' ? <><Check size={10} className="text-emerald-400" /> コピー済</> : 'コピー'}
                        </button>
                      </div>
                      <p className="text-sm text-left tracking-widest">ID: {generatedCreds.student.id} / PW: {generatedCreds.student.pw}</p>
                    </div>
                    <div className="bg-white/10 p-4 rounded-2xl text-left">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-bold text-orange-300 uppercase text-left">保護者用</p>
                        <button
                          aria-label="保護者のIDとパスワードをコピー"
                          onClick={() => copyToClipboard(`ID: ${generatedCreds.parent.id} / PW: ${generatedCreds.parent.pw}`, 'parent-creds')}
                          className="text-[9px] bg-white/20 hover:bg-white/30 px-2 py-1 rounded font-black text-orange-200 uppercase tracking-widest flex items-center gap-1 transition-colors"
                        >
                          {copiedField === 'parent-creds' ? <><Check size={10} className="text-emerald-400" /> コピー済</> : 'コピー'}
                        </button>
                      </div>
                      <p className="text-sm text-left tracking-widest">ID: {generatedCreds.parent.id} / PW: {generatedCreds.parent.pw}</p>
                    </div>
                  </div>
                  <button onClick={() => setGeneratedCreds(null)} className="w-full bg-orange-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-colors">内容を確認して閉じる</button>
                </div>
              )}
              <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start text-left text-slate-900">
                <div className="xl:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-left">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-left">{editingStudent ? '生徒編集' : '生徒登録'}</h3>
                  <form onSubmit={saveStudent} className="space-y-5 text-left">
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block mb-1 text-left">氏名</label><input type="text" required aria-required="true" aria-label="氏名" value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-left" /></div>
                    <div className="grid grid-cols-2 gap-4 text-left">
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 text-left">学校</label><input type="text" value={studentForm.school} onChange={e => setStudentForm({ ...studentForm, school: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-left" /></div>
                      <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 text-left">年齢</label><input type="number" value={studentForm.age} onChange={e => setStudentForm({ ...studentForm, age: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-left" /></div>
                    </div>
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 text-left">次回の授業日</label><input type="date" value={studentForm.nextClassDate} onChange={e => setStudentForm({ ...studentForm, nextClassDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-left" /></div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 text-left">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ログイン情報</span>
                        <button type="button" onClick={() => {
                          const c = generateCredentials(studentForm.name);
                          setStudentForm(prev => ({ ...prev, studentLoginId: c.student.id, studentPassword: c.student.pw, parentLoginId: c.parent.id, parentPassword: c.parent.pw }));
                        }} className="text-[9px] bg-slate-200 px-2 py-1 rounded font-black text-slate-500 uppercase tracking-widest hover:bg-slate-300">Auto</button>
                      </div>

                      {/* Student credentials */}
                      <div className="space-y-1">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">生徒アカウント</p>
                        <input type="text" placeholder="生徒ID" value={studentForm.studentLoginId} onChange={e => setStudentForm({ ...studentForm, studentLoginId: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold" />
                        <input type="text" placeholder="生徒PW" value={studentForm.studentPassword} onChange={e => setStudentForm({ ...studentForm, studentPassword: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold" />
                      </div>

                      {/* Parent credentials — sibling link */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">保護者アカウント</p>
                          {students.length > 0 && (
                            <select
                              className="text-[9px] bg-white border border-slate-200 rounded px-2 py-1 font-bold text-slate-500 outline-none"
                              value=""
                              onChange={e => {
                                const sibling = students.find(s => s.id === e.target.value);
                                if (sibling) setStudentForm(prev => ({ ...prev, parentLoginId: sibling.parentLoginId, parentPassword: sibling.parentPassword }));
                              }}
                            >
                              <option value="">兄弟姉妹と紐付け…</option>
                              {students.map(s => (
                                <option key={s.id} value={s.id}>{s.name} の保護者を使用</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <input type="text" placeholder="保護者ID" value={studentForm.parentLoginId} onChange={e => setStudentForm({ ...studentForm, parentLoginId: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold" />
                        <input type="text" placeholder="保護者PW" value={studentForm.parentPassword} onChange={e => setStudentForm({ ...studentForm, parentPassword: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold" />
                        <p className="text-[9px] text-slate-400 leading-relaxed pt-0.5">💡 同じ保護者ID/PWを複数の生徒に設定すると、1つのアカウントで兄弟姉妹を一括管理できます。</p>
                      </div>
                    </div>
                    <button type="submit" className="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm uppercase tracking-widest">{editingStudent ? 'UPDATE' : 'ID発行と登録'}</button>
                  </form>
                </div>
                <div className="xl:col-span-3 space-y-4 text-left">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="生徒名、学校名で絞り込み..."
                      value={studentSearchQuery}
                      onChange={e => setStudentSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
                    />
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><Users size={16} /></span>
                    {studentSearchQuery && <button onClick={() => setStudentSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X size={14} /></button>}
                  </div>
                  {(students || []).filter(s => !studentSearchQuery || s.name?.includes(studentSearchQuery) || s.school?.includes(studentSearchQuery)).length === 0 && (
                    <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                      <Users size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-bold">まだ生徒がいません。「受講生を登録する」ボタンで追加しましょう！</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(students || []).filter(s => !studentSearchQuery || s.name?.includes(studentSearchQuery) || s.school?.includes(studentSearchQuery)).map(s => {
                    const studentMsgs = (messages || []).filter(m => m.studentId === s.id);
                    const hasUnread = studentMsgs.length > 0 && studentMsgs[studentMsgs.length - 1].senderId !== 'admin';
                    const lastLoginDisplay = s.lastLoginAt
                      ? '最終ログイン: ' + s.lastLoginAt.toDate().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
                      : '未ログイン';

                    return (
                      <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-sm relative group hover:border-orange-300 transition-all text-left">
                        <div className="absolute top-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all text-left">
                          <button aria-label={`${s.name}を編集`} onClick={() => { setEditingStudent(s); setStudentForm(s); window.scrollTo(0, 0); }} className="p-2 bg-slate-50 text-slate-400 hover:text-orange-600 rounded-lg"><Edit2 size={14} /></button>
                          <button aria-label={`${s.name}を削除`} onClick={() => deleteStudentCascade(s.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg"><Trash2 size={14} /></button>
                        </div>
                        <div className="text-left flex items-start justify-between">
                          <div>
                            <h4 className="font-black text-xl text-slate-800 text-left">{s.name}</h4>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left mt-1">{s.school || '学校未登録'} | {s.age || '?'}歳</p>
                            <p className="text-[10px] font-bold text-slate-300 text-left mt-0.5">{lastLoginDisplay}</p>
                          </div>
                          {hasUnread && <div className="bg-rose-100 text-rose-600 text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-widest flex items-center gap-1 shadow-sm mt-1 animate-pulse"><MessageSquare size={10} /> 新着</div>}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex flex-col gap-3">
                          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-left"><span>生徒ID: {s.studentLoginId}</span><span>保護者ID: {s.parentLoginId}</span></div>
                          <button onClick={() => setActiveStudentDetail(s.id)} className={`w-full font-bold py-2 rounded-xl text-xs transition-colors ${hasUnread ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-orange-100 hover:text-orange-600'}`}>生徒カルテを見る</button>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 生徒個別カルテ (Admin) */}
          {activeTab === 'students' && activeStudentDetail && (() => {
            const s = students.find(s => s.id === activeStudentDetail);
            if (!s) return null;
            const completedCount = s.completedMaterials?.length || 0;
            const totalMaterials = materials.length > 0 ? materials.length : 1;
            const progressPercentage = Math.min(100, Math.floor((completedCount / totalMaterials) * 100));
            const studentRecords = (learningRecords || []).filter(r => r.studentId === s.id).sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
            const studentFiles = (sb3Files || []).filter(f => f.studentId === s.id);

            return (
              <div className="space-y-8 animate-in slide-in-from-right-4 duration-500 text-left">
                <header className="flex items-center gap-4 border-b border-slate-200 pb-4">
                  <button onClick={() => setActiveStudentDetail(null)} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-colors">
                     <span className="font-bold text-sm px-2">← 戻る</span>
                  </button>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight text-slate-800 text-left">{s.name}様のカルテ</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">{s.school || '学校未登録'} | {s.age || '?'}歳</p>
                  </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-black text-slate-800 border-b border-slate-100 pb-2">学習進捗</h3>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-violet-50 rounded-xl p-2.5">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">レベル</p>
                          <p className="text-xl font-black text-violet-600">Lv.{Math.floor(Math.sqrt((s.xp || 0) / 100)) + 1 > 20 ? 20 : Math.floor(Math.sqrt((s.xp || 0) / 100)) + 1}</p>
                        </div>
                        <div className="bg-indigo-50 rounded-xl p-2.5">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">合計XP</p>
                          <p className="text-xl font-black text-indigo-600">{(s.xp || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-2.5">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ポイント</p>
                          <p className="text-xl font-black text-amber-600">{s.points || 0}</p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl p-2.5">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">きろく数</p>
                          <p className="text-xl font-black text-emerald-600">{studentRecords.length}</p>
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-500">完了カリキュラム</span>
                          <span className="text-sm font-black text-orange-600">{completedCount} / {materials.length}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden"><div className="bg-orange-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div></div>
                      </div>
                      {s.nextClassDate && (
                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-100 rounded-xl px-3 py-2">
                          <span className="text-base">📅</span>
                          <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">次回授業</p>
                            <p className="text-sm font-black text-slate-800">{s.nextClassDate}</p>
                          </div>
                        </div>
                      )}
                      {s.remarks && (
                        <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
                          <p className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1">備考</p>
                          <p className="text-xs font-medium text-slate-700 whitespace-pre-wrap">{s.remarks}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm overflow-hidden">
                       <h3 className="text-sm font-black text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2"><FileArchive size={16} className="text-slate-400"/> sb3ファイル ({studentFiles.length})</h3>
                       <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                         {studentFiles.length === 0 ? <p className="text-xs text-slate-400">ファイルなし</p> : 
                           studentFiles.map(f => (
                             <div key={f.id} className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
                                <div className="overflow-hidden">
                                   <p className="text-xs font-bold text-slate-700 truncate">{f.fileName}</p>
                                   <p className="text-[9px] text-slate-400">{f.uploadDate}</p>
                                </div>
                                <a href={f.downloadUrl} download={f.fileName} className="p-2 bg-white shadow-sm border border-slate-200 rounded-lg text-slate-400 hover:text-orange-600"><Download size={14} /></a>
                             </div>
                           ))
                         }
                       </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col h-[500px]">
                       <h3 className="text-sm font-black text-slate-800 mb-4 border-b border-slate-100 pb-2 flex items-center gap-2"><MessageSquare size={16} className="text-orange-500"/> メッセージ</h3>
                       <div className="flex-1 overflow-y-auto space-y-4 pr-2 mb-4">
                          {(messages || []).filter(m => m.studentId === s.id).map(msg => {
                            const isAdmin = msg.senderId === 'admin';
                            return (
                              <div key={msg.id} className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${isAdmin ? 'bg-orange-500 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-800 rounded-tl-sm'}`}>
                                  <p className="text-xs font-bold mb-1 opacity-80">{msg.senderName}</p>
                                  <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                                  <p className="text-[9px] text-right mt-1 opacity-70">{msg.createdAt ? new Date(msg.createdAt.toMillis()).toLocaleString() : '送信中...'}</p>
                                </div>
                              </div>
                            );
                          })}
                          {(messages || []).filter(m => m.studentId === s.id).length === 0 && <p className="text-center text-slate-400 text-xs mt-10">メッセージはまだありません</p>}
                       </div>
                       <form onSubmit={(e) => sendMessage(e, s.id, s.id)} className="flex gap-2 shrink-0">
                          <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="メッセージを入力..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500" />
                          <button type="submit" disabled={isSendingMessage} className="bg-slate-900 text-white px-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-orange-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{isSendingMessage ? <Loader2 size={16} className="animate-spin" /> : '送信'}</button>
                       </form>
                    </div>

                    <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mt-8"><ImageIcon size={20} className="text-orange-500" /> 提出シートの記録</h3>
                    <div className="space-y-4">
                       {studentRecords.length === 0 ? (
                         <div className="bg-white p-12 text-center rounded-3xl border border-dashed border-slate-200 text-slate-400 font-bold text-sm">記録がありません</div>
                       ) : (
                         studentRecords.map(record => (
                            <div key={record.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col gap-4">
                               <div className="flex justify-between items-start">
                                 <div>
                                   <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${record.recordType === 'goal' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                     {record.recordType === 'goal' ? '目標シート' : '振り返りシート'}
                                   </span>
                                   <p className="text-[10px] font-bold text-slate-400 mt-2">{new Date(record.date).toLocaleDateString()}</p>
                                   <h4 className="text-lg font-black text-slate-800 mt-1">{record.title}</h4>
                                 </div>
                               </div>
                               <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm whitespace-pre-wrap text-slate-600 font-medium">
                                  {typeof record.content === 'object' ? Object.keys(record.content).map(k => record.content[k] ? <div key={k} className="mb-2"><span className="text-[10px] text-slate-400 uppercase block">{reflectionTemplate.find(t=>t.id===k)?.title || k}</span>{record.content[k]}</div> : null) : record.content}
                               </div>
                               {record.linkUrl && <a href={record.linkUrl} target="_blank" className="text-xs font-bold text-orange-600 flex items-center gap-1"><LinkIcon size={12}/> 作品リンク</a>}
                               <div className="bg-[#FFF5F0] p-4 rounded-xl border border-orange-100">
                                  <div className="flex items-center justify-between mb-2">
                                    <p className="text-[10px] font-black text-orange-600 flex items-center gap-1"><MessageSquare size={12}/> 講師コメント</p>
                                    {record.comment && editingCommentId !== record.id && (
                                      <button onClick={() => { setEditingCommentId(record.id); setAdminComment(prev => ({ ...prev, [record.id]: record.comment })); }} className="text-[9px] font-black text-orange-400 hover:text-orange-600 uppercase tracking-widest">編集</button>
                                    )}
                                  </div>
                                  {record.comment && editingCommentId !== record.id ? (
                                    <p className="text-sm font-bold text-slate-700 italic">"{record.comment}"</p>
                                  ) : (
                                    <div className="space-y-2">
                                      <input type="text" placeholder="コメントを入力..." value={adminComment[record.id] || ''} onChange={e => setAdminComment({...adminComment, [record.id]: e.target.value})} onKeyDown={e => { if (e.key === 'Enter' && adminComment[record.id]?.trim()) { submitAdminComment(record.id); setEditingCommentId(null); } }} className="w-full text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-orange-500" />
                                      <div className="flex gap-2">
                                        {editingCommentId === record.id && <button onClick={() => setEditingCommentId(null)} className="flex-1 bg-slate-100 text-slate-500 text-xs font-bold py-2 rounded-lg">キャンセル</button>}
                                        <button onClick={() => { submitAdminComment(record.id); setEditingCommentId(null); }} disabled={!adminComment[record.id]?.trim()} className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${adminComment[record.id]?.trim() ? 'bg-slate-900 text-white hover:bg-orange-600' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>{record.comment ? '更新' : '送信'}</button>
                                      </div>
                                    </div>
                                  )}
                               </div>
                            </div>
                         ))
                       )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* 教材管理 */}
          {activeTab === 'materials' && (
            <div className="space-y-8 animate-in fade-in duration-500 text-left">
              <header className="text-left"><h2 className="text-2xl font-black tracking-tight text-slate-800 text-left">教材・リソース管理</h2></header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-left">
                <div className="md:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 h-fit sticky top-24 shadow-sm text-left">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-left">新規追加</h3>
                  <form onSubmit={saveMaterial} className="space-y-4 text-left">
                    <input type="text" placeholder="タイトル" value={materialForm.title} onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-orange-500" />
                    
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left block">教材URL / PDFアップロード</label>
                      <div className="flex gap-2">
                        <input type="url" placeholder="URL" value={materialForm.url} onChange={e => setMaterialForm({ ...materialForm, url: e.target.value })} className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-orange-500" />
                        <label className={`shrink-0 cursor-pointer flex items-center justify-center p-2.5 rounded-xl border border-slate-200 transition-colors ${isUploadingMaterialUpload ? 'bg-slate-100 text-slate-400 pointer-events-none' : 'bg-white hover:bg-slate-50 text-slate-600 hover:text-orange-600'}`} title="PDF等ファイルのアップロード">
                           {isUploadingMaterialUpload ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                           <input type="file" className="hidden" onChange={(e) => uploadMaterialFile(e, 'doc')} />
                        </label>
                      </div>
                      <p className="text-[9px] text-slate-400">※URLを直接入力するか、アップロードボタンからファイルを選択してください。</p>
                    </div>

                    <div className="space-y-1">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left block">ダウンロード素材URL</label>
                       <input type="url" placeholder="ダウンロード素材ファイルのURL (任意)" value={materialForm.downloadUrl || ''} onChange={e => setMaterialForm({ ...materialForm, downloadUrl: e.target.value })} className="w-full bg-slate-50 border border-amber-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-amber-400" />
                    </div>

                    <select value={materialForm.category} onChange={e => setMaterialForm({ ...materialForm, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-orange-500 appearance-none">
                      <option value="scratch">Scratch</option>
                      <option value="Canva">Canva</option>
                      <option value="robot">Robot</option>
                    </select>
                    <div className="flex items-center gap-2 px-2 pb-2">
                      <input type="checkbox" id="isPublished" checked={materialForm.isPublished} onChange={e => setMaterialForm({ ...materialForm, isPublished: e.target.checked })} className="w-4 h-4 text-orange-600 rounded bg-slate-100 border-slate-300 focus:ring-orange-500" />
                      <label htmlFor="isPublished" className="text-xs font-bold text-slate-600">生徒に公開する</label>
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all uppercase tracking-widest text-sm">{editingMaterial ? 'UPDATE' : 'SAVE'}</button>
                    {editingMaterial && (
                       <button type="button" onClick={() => { setEditingMaterial(null); setMaterialForm({ title: '', url: '', category: 'scratch', thumbnailUrl: '', downloadUrl: '', isPublished: true }); }} className="w-full bg-slate-200 text-slate-600 font-black py-3 rounded-xl shadow-sm hover:bg-slate-300 transition-all uppercase tracking-widest text-xs mt-2">CANCEL</button>
                    )}
                  </form>
                </div>
                <div className="md:col-span-2 space-y-4 text-left">
                  {(() => {
                    const categories = ['all', ...Array.from(new Set((materials || []).map(m => m.category).filter(Boolean)))];
                    const searchFiltered = materialSearchQuery ? (materials || []).filter(m => m.title?.toLowerCase().includes(materialSearchQuery.toLowerCase())) : (materials || []);
                    const filtered = materialCategoryFilter === 'all' ? searchFiltered : searchFiltered.filter(m => m.category === materialCategoryFilter);
                    return (
                      <>
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="タイトルで検索..."
                            value={materialSearchQuery}
                            onChange={e => setMaterialSearchQuery(e.target.value)}
                            className="w-full bg-white border border-slate-200 rounded-2xl pl-10 pr-5 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
                          />
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"><BookOpen size={16} /></span>
                          {materialSearchQuery && <button onClick={() => setMaterialSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"><X size={14} /></button>}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {categories.map(cat => {
                            const count = cat === 'all' ? (materials || []).length : (materials || []).filter(m => m.category === cat).length;
                            return (
                              <button
                                key={cat}
                                onClick={() => setMaterialCategoryFilter(cat)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border ${materialCategoryFilter === cat ? 'bg-orange-500 text-white border-orange-500' : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-600'}`}
                              >
                                {cat === 'all' ? 'すべて' : cat} ({count}件)
                              </button>
                            );
                          })}
                        </div>
                        {filtered.length === 0 && (
                          <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                            <p className="text-slate-500 font-bold">まだ教材がありません</p>
                          </div>
                        )}
                        {filtered.map(m => (
                          <div key={m.id} className={`bg-white px-5 py-4 rounded-2xl border ${m.isPublished === false ? 'border-dashed border-slate-300 opacity-60' : 'border-slate-200'} flex justify-between items-center group shadow-sm text-left hover:border-orange-200 transition-all`}>
                            <div className="flex items-center gap-4 min-w-0">
                              <div className="shrink-0 flex flex-col gap-1.5">
                                <span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter">{m.category}</span>
                                {m.isPublished === false && <span className="bg-slate-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">非公開</span>}
                                {m.downloadUrl && <span className="bg-amber-100 text-amber-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter flex items-center gap-1"><Download size={9} /> DL</span>}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-black text-slate-800 text-base break-all">{m.title}</h4>
                                <a href={m.url} target="_blank" rel="noreferrer" className="text-orange-600 text-xs font-black flex items-center gap-1 mt-1 hover:underline uppercase truncate max-w-xs">Open <LinkIcon size={11} /></a>
                              </div>
                            </div>
                            <div className="flex gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                              <button aria-label={`${m.title}を編集`} onClick={() => { setEditingMaterial(m); setMaterialForm({ ...m, category: m.category || 'scratch', thumbnailUrl: m.thumbnailUrl || '', downloadUrl: m.downloadUrl || '', isPublished: m.isPublished !== false }); window.scrollTo(0,0); }} className="p-2 bg-slate-50 text-slate-400 hover:text-orange-600 transition-colors rounded-lg"><Edit2 size={14} /></button>
                              <button aria-label={`${m.title}を削除`} onClick={() => deleteMaterial(m.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 transition-colors rounded-lg"><Trash2 size={14} /></button>
                            </div>
                          </div>
                        ))}
                      </>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* お知らせ管理 */}
          {activeTab === 'notices' && (
            <div className="space-y-8 animate-in fade-in duration-500 text-left">
              <header className="text-left font-black text-2xl text-left text-slate-800">全体連絡管理</header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 h-fit shadow-sm text-left">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-left">新規投稿</h3>
                  <form onSubmit={postAnnouncement} className="space-y-4 text-left">
                    <input type="text" required aria-required="true" aria-label="タイトル" placeholder="タイトル" value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-orange-500" />
                    <textarea required aria-required="true" aria-label="本文" placeholder="本文" value={announcementForm.content} onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm h-32 resize-none text-left focus:ring-2 focus:ring-orange-500 outline-none" />
                    <select value={announcementForm.type} onChange={e => setAnnouncementForm({ ...announcementForm, type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none appearance-none text-left"><option value="info">通常のお知らせ</option><option value="emergency">緊急・重要連絡</option></select>
                    <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all uppercase tracking-[0.2em] text-sm">POST</button>
                  </form>
                </div>
                <div className="md:col-span-2 space-y-4 text-left">
                  {(announcements || []).length === 0 && (
                    <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                      <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
                      <p className="text-slate-500 font-bold">まだお知らせはありません</p>
                    </div>
                  )}
                  {(announcements || []).map(notice => (
                    <div key={notice.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex justify-between items-start group shadow-sm text-left transition-all hover:border-orange-200">
                      <div>
                        <div className="flex items-center gap-3 mb-2 text-left">
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest text-left ${notice.type === 'emergency' ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'}`}>{notice.type}</span>
                          <span className="text-[10px] font-bold text-slate-400 text-left">{notice.createdAt?.toDate().toLocaleString('ja-JP', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <h4 className="font-black text-lg text-left text-slate-800">{notice.title}</h4>
                        <p className="text-sm text-slate-500 mt-2 leading-relaxed text-left">{notice.content}</p>
                      </div>
                      <button aria-label={`「${notice.title}」を削除`} onClick={() => deleteAnnouncement(notice.id)} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shrink-0 text-left"><Trash2 size={18} /></button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 記録フォーマット項目設定 */}
          {activeTab === 'reflections' && (
            <div className="space-y-8 animate-in fade-in duration-500 text-left">
              <header className="text-left font-black text-2xl text-left text-slate-800">記録フォーマット項目設定</header>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
                <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 h-fit shadow-sm text-left">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-left">{editingReflectionItem ? '項目を編集' : '新規項目追加'}</h3>
                  <form onSubmit={saveReflectionItem} className="space-y-4 text-left">
                    <select value={reflectionItemForm.category || 'goal'} onChange={e => setReflectionItemForm({ ...reflectionItemForm, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-orange-500 appearance-none">
                      <option value="goal">目標シート (授業前)</option>
                      <option value="reflection">振り返りシート (授業後)</option>
                    </select>
                    <input type="text" required placeholder="項目名 (例: 今日の目標)" value={reflectionItemForm.title} onChange={e => setReflectionItemForm({ ...reflectionItemForm, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-orange-500" />
                    <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all uppercase tracking-[0.2em] text-sm">{editingReflectionItem ? '更新' : '追加'}</button>
                    {editingReflectionItem && (
                      <button type="button" onClick={() => { setEditingReflectionItem(null); setReflectionItemForm({ title: '', type: 'textarea', category: 'goal' }); }} className="w-full bg-slate-200 text-slate-600 font-black py-4 rounded-xl shadow-sm hover:bg-slate-300 transition-all uppercase tracking-[0.2em] text-sm mt-2">キャンセル</button>
                    )}
                  </form>
                </div>
                <div className="md:col-span-2 space-y-4 text-left">
                  {['goal', 'reflection'].map(category => (
                    <div key={category} className="mb-6 border-b border-slate-100 pb-4">
                      <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-4">{category === 'goal' ? '目標シート (授業前)' : '振り返りシート (授業後)'}</h3>
                      <div className="space-y-3">
                        {(reflectionTemplate || []).filter(i => (i.category || 'goal') === category).map((item, idx) => (
                          <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-between items-center shadow-sm text-left group">
                            <div className="flex gap-4 items-center">
                              <span className="text-xl font-black text-slate-200">{idx + 1}</span>
                              <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                            </div>
                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                              <button onClick={() => { setEditingReflectionItem(item.id); setReflectionItemForm({ title: item.title, type: item.type || 'textarea', category: item.category || 'goal' }); window.scrollTo(0,0); }} className="p-2 bg-slate-50 text-slate-400 hover:text-orange-600 transition-colors rounded-lg"><Edit2 size={16} /></button>
                              <button onClick={() => deleteReflectionItem(item.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 transition-colors rounded-lg"><Trash2 size={16} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 提出シート確認 (Admin) */}
          {activeTab === 'records' && (
            <div className="space-y-6 animate-in fade-in duration-500 text-left">
              <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <h2 className="text-2xl font-black tracking-tight text-left text-slate-800">生徒の提出シート一覧</h2>
                <div className="flex flex-wrap gap-2">
                  <div className="flex bg-slate-100 p-1 rounded-xl">
                    <button onClick={() => setRecordFilter('uncommented')} className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${recordFilter === 'uncommented' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>
                      未コメントのみ {recordFilter === 'uncommented' && `(${(learningRecords || []).filter(r => !r.comment && (!recordStudentFilter || r.studentId === recordStudentFilter)).length})`}
                    </button>
                    <button onClick={() => setRecordFilter('all')} className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${recordFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}>全て表示</button>
                  </div>
                  <select value={recordStudentFilter} onChange={e => setRecordStudentFilter(e.target.value)} className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold outline-none focus:ring-2 focus:ring-orange-400 text-slate-600 appearance-none">
                    <option value="">全生徒</option>
                    {(students || []).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </header>

              <div className="space-y-6">
                {(() => {
                  let records = (learningRecords || []);
                  if (recordFilter === 'uncommented') records = records.filter(r => !r.comment);
                  if (recordStudentFilter) records = records.filter(r => r.studentId === recordStudentFilter);
                  records = records.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
                  if (records.length === 0) return (
                    <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">
                      {recordFilter === 'uncommented' ? '未確認の提出記録はありません' : '提出記録がありません'}
                    </div>
                  );
                  return records.map(record => {
                    const isCommented = !!record.comment;
                    const isEditing = editingCommentId === record.id;
                    return (
                    <div key={record.id} className={`bg-white rounded-[2rem] border overflow-hidden shadow-sm text-left p-6 md:p-8 ${isCommented ? 'border-emerald-200' : 'border-slate-200'}`}>
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-3 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${record.recordType === 'goal' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                              {record.recordType === 'goal' ? '目標シート' : '振り返りシート'}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400">{new Date(record.date || record.lessonDate || '').toLocaleDateString()}</span>
                            {isCommented && <span className="text-[9px] font-black bg-emerald-100 text-emerald-600 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 size={10} /> コメント済み</span>}
                          </div>
                          <h4 className="text-xl font-black text-slate-800">{record.title} <span className="text-sm font-medium text-slate-400 ml-2">by {record.studentName}</span></h4>

                          <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                            {typeof record.content === 'object' ? (
                              Object.keys(record.content).map(key => {
                                const templateItem = reflectionTemplate.find(t => t.id === key);
                                return record.content[key] ? (
                                  <div key={key}>
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{templateItem ? templateItem.title : key}</h5>
                                    <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap">{record.content[key]}</p>
                                  </div>
                                ) : null;
                              })
                            ) : (
                              <p className="text-sm text-slate-700 font-medium whitespace-pre-wrap">{record.content}</p>
                            )}
                            {record.linkUrl && (
                              <div className="mt-4 flex items-center gap-2 pt-3 border-t border-slate-200">
                                <LinkIcon size={14} className="text-orange-500" />
                                <a href={record.linkUrl} target="_blank" rel="noreferrer" className="text-xs font-bold text-orange-600 hover:underline">作品リンク</a>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="md:w-80 shrink-0 bg-[#FFF5F0] rounded-2xl p-5 border border-orange-100 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <h5 className="text-[10px] font-black text-orange-600 uppercase tracking-widest flex items-center gap-1.5"><MessageSquare size={12} /> 講師コメント</h5>
                              {isCommented && !isEditing && (
                                <button onClick={() => { setEditingCommentId(record.id); setAdminComment(prev => ({ ...prev, [record.id]: record.comment })); }} className="text-[9px] font-black text-orange-400 hover:text-orange-600 uppercase tracking-widest">編集</button>
                              )}
                            </div>
                            {isCommented && !isEditing && (
                              <p className="text-sm font-bold text-slate-700 leading-relaxed italic mb-4">"{record.comment}"</p>
                            )}
                          </div>
                          <div className="mt-auto">
                            {(!isCommented || isEditing) && (
                              <>
                                <textarea
                                  placeholder="コメントを入力... (Ctrl+Enter で送信)"
                                  value={adminComment[record.id] || ''}
                                  onChange={e => setAdminComment({ ...adminComment, [record.id]: e.target.value })}
                                  onKeyDown={e => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && adminComment[record.id]?.trim()) { submitAdminComment(record.id); setEditingCommentId(null); } }}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium h-24 resize-none outline-none focus:ring-2 focus:ring-orange-500 mb-2"
                                />
                                <div className="flex gap-2">
                                  {isEditing && <button onClick={() => setEditingCommentId(null)} className="flex-1 bg-slate-100 text-slate-600 text-[10px] font-black py-2.5 rounded-xl hover:bg-slate-200 transition-colors">キャンセル</button>}
                                  <button
                                    onClick={() => { submitAdminComment(record.id); setEditingCommentId(null); }}
                                    disabled={!adminComment[record.id]?.trim()}
                                    className={`flex-1 text-[10px] font-black py-2.5 rounded-xl transition-all uppercase tracking-widest ${adminComment[record.id]?.trim() ? 'bg-slate-900 text-white hover:bg-orange-600 active:scale-95' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                                  >
                                    {isCommented ? '更新する' : '送信する'}
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
