import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Building2,
  Coins,
  TrendingDown,
  Settings2,
  Calculator,
  Info,
  ChevronRight,
  CheckCircle2,
  ArrowDownCircle,
  Layers,
  FileText,
  Printer,
  X,
  Save,
  RotateCcw,
  ShieldCheck,
  UserPlus,
  History,
  Calendar,
  Trash2,
  Edit2,
  GraduationCap,
  Plus,
  Loader2,
  LogIn,
  LogOut,
  BookOpen,
  Image as ImageIcon,
  Key,
  Copy,
  Eye,
  MessageSquare,
  Bell,
  Clock,
  AlertTriangle,
  Megaphone,
  ChevronDown,
  Tag,
  Link as LinkIcon,
  ShieldAlert,
  Mail,
  Building,
  Upload,
  Download,
  FileArchive,
  Trophy,
  PlayCircle,
  Crown,
  Star,
  Sparkles,
  Menu
} from 'lucide-react';

// Firebase imports
import { auth, db, storage, appId } from './firebase';
import { 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  getDocs, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  serverTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';

// Components
import AdminLayout from './components/Admin/AdminLayout';
import StudentLayout from './components/Student/StudentLayout';
import Login from './components/Login';
import Workspace from './components/Workspace';
import PreviewModal from './components/PreviewModal';

// Hooks & Utils
import useFirebase from './hooks/useFirebase';
import useAdminActions from './hooks/useAdminActions';
import { generateCredentials } from './utils/authUtils';
import { getYoutubeEmbedUrl } from './utils/materialUtils';

const MATERIAL_CATEGORIES = [
  { id: 'scratch', label: 'Scratch' },
  { id: 'Canva', label: 'Canva' },
  { id: 'robot', label: 'Robot' }
];

// Simple client-side login rate limiter (resets on page reload — server-side rules enforce real limits)
const loginAttempts = { count: 0, lockedUntil: 0 };
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_MS = 60_000; // 1 minute

// Max SB3 file size: 50 MB
const MAX_SB3_BYTES = 50 * 1024 * 1024;

const App = () => {
  // --- Auth & Role State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // --- UI State ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [saveMessage, setSaveMessage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [previewModal, setPreviewModal] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // --- must be declared before useFirebase ---
  const [activeStudentDetail, setActiveStudentDetail] = useState(null);

  // --- Data States (Managed by hook for performance) ---
  const {
    students,
    learningRecords,
    announcements,
    materials,
    reflectionTemplate,
    completionRequests,
    messages,
    sb3Files,
    storageUsage,
    setStorageUsage,
    loading
  } = useFirebase(currentUser, activeStudentDetail);


  // --- Form States ---
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '', school: '', age: '', remarks: '', nextClassDate: '',
    studentLoginId: '', studentPassword: '', parentLoginId: '', parentPassword: '',
    inventory: [], equipped: { weapon: null, armor: null, accessory: null }
  });
  const [generatedCreds, setGeneratedCreds] = useState(null);
  const [newLearningRecord, setNewLearningRecord] = useState({ title: '', content: {}, imageUrl: '', fileUrl: '', linkUrl: '', lessonDate: new Date().toISOString().slice(0, 10), recordType: 'goal' });
  const [adminComment, setAdminComment] = useState({});
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', type: 'info' });
  const [reflectionItemForm, setReflectionItemForm] = useState({ title: '', type: 'textarea', category: 'goal' });
  const [editingReflectionItem, setEditingReflectionItem] = useState(null);
  const [parentComment, setParentComment] = useState({});
  const [materialForm, setMaterialForm] = useState({ title: '', url: '', category: 'scratch', thumbnailUrl: '', isPublished: true });
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  
  const [isUploadingSb3, setIsUploadingSb3] = useState(false);
  const [isUploadingMaterialUpload, setIsUploadingMaterialUpload] = useState(false);
  const [isUploadingMaterialThumbnail, setIsUploadingMaterialThumbnail] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const sb3InputRef = useRef(null);

  // --- Admin Actions Hook ---
  const adminActions = useAdminActions({
    appId,
    setSaveMessage,
    setGeneratedCreds,
    setEditingStudent,
    studentForm,
    setStudentForm,
    students,
    materials,
    materialForm,
    setMaterialForm,
    editingMaterial,
    setEditingMaterial,
    announcementForm,
    setAnnouncementForm,
    reflectionItemForm,
    setReflectionItemForm,
    editingReflectionItem,
    setEditingReflectionItem,
    adminComment,
    setAdminComment,
    setIsUploadingMaterialUpload,
    setIsUploadingMaterialThumbnail
  });


  // --- Search ---
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  const [readAnnouncementIds, setReadAnnouncementIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('readAnnouncements') || '[]'); } catch { return []; }
  });

  // --- Auth logic ---
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, setCurrentUser);
    return () => unsubscribeAuth();
  }, []);

  // --- Marks messages as read ---
  useEffect(() => {
    if (!currentUser) return;
    const markMessagesAsRead = async () => {
      let unreadMsgs = [];
      if (currentUser.role === 'admin' && activeStudentDetail) {
        unreadMsgs = messages.filter(m => m.studentId === activeStudentDetail && m.receiverId === 'admin' && !m.isRead);
      } else if ((currentUser.role === 'student' || currentUser.role === 'parent') && activeTab === 'mypage') {
        const studentIdCtx = currentUser.role === 'student' ? currentUser.studentId : currentUser.childId;
        unreadMsgs = messages.filter(m => m.studentId === studentIdCtx && m.receiverId === studentIdCtx && !m.isRead);
      }

      if (unreadMsgs.length > 0) {
        const batch = writeBatch(db);
        unreadMsgs.forEach(msg => {
          batch.update(doc(db, 'artifacts', appId, 'public', 'data', 'messages', msg.id), { isRead: true });
        });
        try { await batch.commit(); } catch (e) { console.error("Failed to mark messages read", e); }
      }
    };
    markMessagesAsRead();
  }, [messages, activeTab, activeStudentDetail, currentUser]);

  // --- Resizer Logic ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newRatio = (e.clientX / window.innerWidth) * 100;
      setSplitRatio(Math.min(90, Math.max(10, newRatio)));
    };
    const handleMouseUp = () => setIsDragging(false);
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // --- Handlers ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');

    // Rate limiting
    const now = Date.now();
    if (now < loginAttempts.lockedUntil) {
      const secs = Math.ceil((loginAttempts.lockedUntil - now) / 1000);
      setAuthError(`ログイン試行が多すぎます。${secs}秒後に再試行してください`);
      return;
    }

    setIsLoggingIn(true);
    try {
      if (loginId === 'admin' && password === 'admin123') {
        loginAttempts.count = 0;
        setCurrentUser({ role: 'admin', name: 'システム管理者' });
        setActiveTab('dashboard');
        return;
      }
      const querySnapshot = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'students'));
      let found = null;
      let parentChildren = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        if (data.studentLoginId === loginId && data.studentPassword === password) {
          found = { role: 'student', name: data.name, studentId: docSnap.id, nextClassDate: data.nextClassDate };
        } else if (data.parentLoginId === loginId && data.parentPassword === password) {
          parentChildren.push({ id: docSnap.id, ...data });
        }
      });

      if (parentChildren.length > 0) {
        const firstChild = parentChildren[0];
        found = {
          role: 'parent', name: `${firstChild.name}の保護者`, childId: firstChild.id,
          childName: firstChild.name, nextClassDate: firstChild.nextClassDate, allChildren: parentChildren
        };
      }
      if (found) {
        loginAttempts.count = 0;
        setCurrentUser(found);
        setActiveTab('mypage');
        if (found.studentId || found.childId) {
          const sid = found.studentId || found.childId;
          try { await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', sid), { lastLoginAt: serverTimestamp() }); } catch (_) {}
        }
      } else {
        loginAttempts.count += 1;
        if (loginAttempts.count >= MAX_LOGIN_ATTEMPTS) {
          loginAttempts.lockedUntil = Date.now() + LOCKOUT_MS;
          loginAttempts.count = 0;
          setAuthError('ログイン試行が多すぎます。1分後に再試行してください');
        } else {
          setAuthError('IDまたはパスワードが正しくありません');
        }
      }
    } catch (err) {
      setAuthError('ログイン中にエラーが発生しました。再試行してください');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginId('');
    setPassword('');
    setActiveTab('dashboard');
    setEditingStudent(null);
    setStudentForm({ name: '', school: '', age: '', remarks: '', nextClassDate: '', studentLoginId: '', studentPassword: '', parentLoginId: '', parentPassword: '', inventory: [], equipped: { weapon: null, armor: null, accessory: null } });
    setGeneratedCreds(null);
    setAdminComment({});
    setNewMessage('');
    setSaveMessage('');
    setActiveStudentDetail(null);
  };

  const submitLearningRecord = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'learning_records'), {
        ...newLearningRecord, studentId: currentUser.studentId, studentName: currentUser.name, date: new Date().toISOString(), createdAt: serverTimestamp(), comment: ''
      });
      setNewLearningRecord({ title: '', content: {}, imageUrl: '', fileUrl: '', linkUrl: '', lessonDate: new Date().toISOString().slice(0, 10), recordType: 'goal' });
      setSaveMessage('記録しました');
    } catch (e) { setSaveMessage('失敗'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const sendMessage = async (e, receiverId, studentIdCtx) => {
    e.preventDefault();
    if (!newMessage.trim() || isSendingMessage) return;
    setIsSendingMessage(true);
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
        text: newMessage,
        senderId: currentUser.role === 'admin' ? 'admin' : (currentUser.studentId || currentUser.childId),
        senderRole: currentUser.role,
        senderName: currentUser.name || (currentUser.role === 'admin' ? '講師・サポーター' : '生徒/保護者'),
        receiverId: receiverId,
        studentId: studentIdCtx,
        isRead: false,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
      setSaveMessage('メッセージを送りました！');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) { setSaveMessage('メッセージ送信エラー'); setTimeout(() => setSaveMessage(''), 3000); }
    finally { setIsSendingMessage(false); }
  };

  const uploadSb3File = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith('.sb3')) {
      setSaveMessage('エラー: .sb3ファイルを選択してください');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    if (file.size > MAX_SB3_BYTES) {
      setSaveMessage(`エラー: ファイルサイズは${Math.round(MAX_SB3_BYTES / 1024 / 1024)}MB以下にしてください`);
      setTimeout(() => setSaveMessage(''), 4000);
      if (sb3InputRef.current) sb3InputRef.current.value = '';
      return;
    }
    setIsUploadingSb3(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10);
      const storageRef = ref(storage, `artifacts/${appId}/sb3/${currentUser.studentId}/${dateStr}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId, 'sb3_files'), {
        fileName: file.name, storagePath: storageRef.fullPath, downloadUrl, uploadDate: dateStr, uploadedAt: serverTimestamp(),
      });
      setSaveMessage('アップロード完了!');
    } catch (err) { setSaveMessage(`エラー: ${err.message}`); }
    finally { setIsUploadingSb3(false); if (sb3InputRef.current) sb3InputRef.current.value = ''; setTimeout(() => setSaveMessage(''), 4000); }
  };

  const deleteSb3File = async (file) => {
    if (!window.confirm(`「${file.fileName}」を削除しますか？`)) return;
    try {
      if (file.storagePath) await deleteObject(ref(storage, file.storagePath));
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId, 'sb3_files', file.id));
      setSaveMessage('削除しました');
    } catch (err) { setSaveMessage('削除エラー'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const toggleMaterialComplete = async (e, materialId) => {
    e.stopPropagation();
    if (!currentUser || currentUser.role !== 'student') return;
    const existingReq = completionRequests.find(r => r.studentId === currentUser.studentId && r.materialId === materialId && r.status === 'pending');
    if (existingReq) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'completion_requests'), {
        studentId: currentUser.studentId, studentName: currentUser.name, materialId, status: 'pending', createdAt: serverTimestamp()
      });
      setSaveMessage('先生に完了の報告をしました！');
    } catch (err) { setSaveMessage('エラーが発生しました'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleMaterialOpen = (e, m) => {
    e.preventDefault();
    const isScratch = m.category === 'scratch' || (m.tags && m.tags.some(t => t.toLowerCase() === 'scratch'));
    if (isScratch) { setActiveWorkspace(m); return; }
    const embedUrl = getYoutubeEmbedUrl(m.url);
    if (embedUrl) { setPreviewModal({ title: m.title, embedUrl, type: 'youtube' }); return; }
    window.open(m.url, '_blank', 'noopener,noreferrer');
  };

  // --- Rendering Conditional Logic ---
  if (!currentUser || !currentUser.role) {
    return <Login loginId={loginId} setLoginId={setLoginId} password={password} setPassword={setPassword} handleLogin={handleLogin} authError={authError} isLoggingIn={isLoggingIn} />;
  }

  // Show loading spinner while Firestore data loads
  if (loading) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-slate-500 font-bold text-sm">データを読み込んでいるよ...</p>
        </div>
      </div>
    );
  }

  if (activeWorkspace) {
    return <Workspace activeWorkspace={activeWorkspace} setActiveWorkspace={setActiveWorkspace} splitRatio={splitRatio} setSplitRatio={setSplitRatio} isDragging={isDragging} setIsDragging={setIsDragging} />;
  }

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">
      {currentUser.role === 'admin' ? (
        <AdminLayout
          {...adminActions}
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleLogout={handleLogout}
          saveMessage={saveMessage}
          setSaveMessage={setSaveMessage}
          students={students}
          learningRecords={learningRecords}
          announcements={announcements}
          materials={materials}
          reflectionTemplate={reflectionTemplate}
          completionRequests={completionRequests}
          messages={messages}
          sb3Files={sb3Files}
          storageUsage={storageUsage}
          setStorageUsage={setStorageUsage}
          editingStudent={editingStudent}
          setEditingStudent={setEditingStudent}
          activeStudentDetail={activeStudentDetail}
          setActiveStudentDetail={setActiveStudentDetail}
          studentForm={studentForm}
          setStudentForm={setStudentForm}
          generatedCreds={generatedCreds}
          setGeneratedCreds={setGeneratedCreds}
          newLearningRecord={newLearningRecord}
          setNewLearningRecord={setNewLearningRecord}
          adminComment={adminComment}
          setAdminComment={setAdminComment}
          announcementForm={announcementForm}
          setAnnouncementForm={setAnnouncementForm}
          reflectionItemForm={reflectionItemForm}
          setReflectionItemForm={setReflectionItemForm}
          editingReflectionItem={editingReflectionItem}
          setEditingReflectionItem={setEditingReflectionItem}
          materialForm={materialForm}
          setMaterialForm={setMaterialForm}
          editingMaterial={editingMaterial}
          setEditingMaterial={setEditingMaterial}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          isSendingMessage={isSendingMessage}
          studentSearchQuery={studentSearchQuery}
          setStudentSearchQuery={setStudentSearchQuery}
          MATERIAL_CATEGORIES={MATERIAL_CATEGORIES}
          isUploadingMaterialUpload={isUploadingMaterialUpload}
          isUploadingMaterialThumbnail={isUploadingMaterialThumbnail}
        />
      ) : (
        <StudentLayout
          currentUser={currentUser}
          setCurrentUser={setCurrentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
          handleLogout={handleLogout}
          saveMessage={saveMessage}
          setSaveMessage={setSaveMessage}
          announcements={announcements}
          readAnnouncementIds={readAnnouncementIds}
          setReadAnnouncementIds={setReadAnnouncementIds}
          students={students}
          materials={materials}
          learningRecords={learningRecords}
          newLearningRecord={newLearningRecord}
          setNewLearningRecord={setNewLearningRecord}
          submitLearningRecord={submitLearningRecord}
          sb3Files={sb3Files}
          uploadSb3File={uploadSb3File}
          deleteSb3File={deleteSb3File}
          sb3InputRef={sb3InputRef}
          isUploadingSb3={isUploadingSb3}
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          sendMessage={sendMessage}
          isSendingMessage={isSendingMessage}
          parentComment={parentComment}
          setParentComment={setParentComment}
          handleMaterialOpen={handleMaterialOpen}
          toggleMaterialComplete={toggleMaterialComplete}
          completionRequests={completionRequests}
          MATERIAL_CATEGORIES={MATERIAL_CATEGORIES}
          reflectionTemplate={reflectionTemplate}
        />
      )}
      <PreviewModal previewModal={previewModal} setPreviewModal={setPreviewModal} />
      
      <style>{`
        @media print { .print\\:hidden { display: none !important; } .print\\:bg-white { background: white !important; } .print\\:p-10 { padding: 2.5rem !important; } body { overflow: visible !important; } .rounded-[2rem], .rounded-[2.5rem] { border-radius: 1.5rem !important; } }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; background: white; cursor: pointer; border-radius: 50%; border: 4px solid #ea580c; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .animate-bounce-slow { animation: bounce-custom 3s infinite ease-in-out; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        @keyframes bounce-custom { 0%, 100% { transform: translateY(-5%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }
      `}</style>
    </div>
  );
};

export default App;