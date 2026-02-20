import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  FileArchive
} from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc, collection, onSnapshot, query, serverTimestamp, addDoc, updateDoc, getDocs, where } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyArYfL-wE_F0OF3QNl5_jh_B7ZXr7Ev5fg",
  authDomain: "creatte-sponser-app.firebaseapp.com",
  projectId: "creatte-sponser-app",
  storageBucket: "creatte-sponser-app.firebasestorage.app",
  messagingSenderId: "753873131194",
  appId: "1:753873131194:web:e8e73547f530509c7e1483",
  measurementId: "G-2XXBZJDCXE"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'clayette-edu-system';

const COURSE_BASES = [
  { id: 'premium', label: '月4回コース', price: 12000 },
  { id: 'standard', label: '月3回コース', price: 10000 },
  { id: 'basic', label: '月2回コース', price: 8000 },
  { id: 'entry', label: '月1回コース', price: 5000 },
];

// --- ユーティリティ: ID・パスワード生成 ---
const generateCredentials = () => {
  const chars = "abcdefghjkmnpqrstuvwxyz23456789";
  const gen = (len) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return { id: gen(6), pw: gen(8) };
};

const App = () => {
  // --- Auth & Role State ---
  const [currentUser, setCurrentUser] = useState(null);
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // --- UI State ---
  const [activeTab, setActiveTab] = useState('students');
  const [saveMessage, setSaveMessage] = useState('');

  // --- Data State ---
  const [students, setStudents] = useState([]);
  const [learningRecords, setLearningRecords] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // --- Student Form State ---
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '', school: '', age: '', courseId: 'premium', remarks: '', nextClassDate: '',
    studentLoginId: '', studentPassword: '', parentLoginId: '', parentPassword: ''
  });
  const [generatedCreds, setGeneratedCreds] = useState(null);

  // --- 学習記録 & お知らせフォーム ---
  const [newLearningRecord, setNewLearningRecord] = useState({ title: '', content: '', imageUrl: '' });
  const [adminComment, setAdminComment] = useState({});
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', type: 'info' });

  // --- .sb3 アップロード ---
  const [sb3Files, setSb3Files] = useState([]);
  const [isUploadingSb3, setIsUploadingSb3] = useState(false);
  const sb3InputRef = useRef(null);

  // --- 教材データ状態 ---
  const [materials, setMaterials] = useState([]);
  const [materialForm, setMaterialForm] = useState({ title: '', url: '', tags: '' });
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  // --- Firebase 認証 & リアルタイムリスナー ---
  // --- Resizer Logic ---
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const newRatio = (e.clientX / window.innerWidth) * 100;
      setSplitRatio(Math.min(90, Math.max(10, newRatio))); // Limit between 10% and 90%
    };
    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

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

  useEffect(() => {
    if (!currentUser) return;

    // Firestoreの全データを同期
    const unsubStudents = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'students'), (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubAnnounce = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'announcements'), (snap) => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
    });
    const unsubLearning = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'learning_records'), (snap) => {
      setLearningRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubMaterials = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'materials'), (snap) => {
      setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
    });

    // .sb3ファイルのリスナー (ログインした生徒のファイルのみ)
    if (currentUser.role === 'student' && currentUser.studentId) {
      const unsubSb3 = onSnapshot(
        collection(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId, 'sb3_files'),
        (snap) => {
          setSb3Files(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.uploadedAt?.toMillis() - a.uploadedAt?.toMillis()));
        }
      );
      return () => {
        unsubStudents(); unsubAnnounce();
        unsubLearning(); unsubMaterials();
        unsubSb3();
      };
    }

    return () => {
      unsubStudents(); unsubAnnounce();
      unsubLearning(); unsubMaterials();
    };
  }, [currentUser]);

  // --- .sb3 アップロード ---
  const uploadSb3File = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.name.endsWith('.sb3')) {
      setSaveMessage('エラー: .sb3ファイルを選択してください');
      setTimeout(() => setSaveMessage(''), 3000);
      return;
    }
    setIsUploadingSb3(true);
    try {
      const dateStr = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
      const storageRef = ref(storage, `artifacts/${appId}/sb3/${currentUser.studentId}/${dateStr}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(storageRef);
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId, 'sb3_files'), {
        fileName: file.name,
        storagePath: storageRef.fullPath,
        downloadUrl,
        uploadDate: dateStr,
        uploadedAt: serverTimestamp(),
      });
      setSaveMessage('アップロード完了!');
    } catch (err) {
      console.error(err);
      setSaveMessage(`エラー: ${err.message}`);
    } finally {
      setIsUploadingSb3(false);
      if (sb3InputRef.current) sb3InputRef.current.value = '';
      setTimeout(() => setSaveMessage(''), 4000);
    }
  };

  const deleteSb3File = async (file) => {
    if (!window.confirm(`「${file.fileName}」を削除しますか？`)) return;
    try {
      await deleteObject(ref(storage, file.storagePath));
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId, 'sb3_files', file.id));
      setSaveMessage('削除しました');
    } catch (err) {
      setSaveMessage('削除エラー');
    }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  // --- 各種ハンドラー ---

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (loginId === 'admin' && password === 'admin123') {
      setCurrentUser({ role: 'admin', name: 'システム管理者' });
      setActiveTab('students');
      return;
    }
    const querySnapshot = await getDocs(collection(db, 'artifacts', appId, 'public', 'data', 'students'));
    let found = null;
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.studentLoginId === loginId && data.studentPassword === password) {
        found = { role: 'student', name: data.name, studentId: docSnap.id, nextClassDate: data.nextClassDate };
      } else if (data.parentLoginId === loginId && data.parentPassword === password) {
        found = { role: 'parent', name: `${data.name}の保護者`, childId: docSnap.id, childName: data.name, nextClassDate: data.nextClassDate };
      }
    });
    if (found) { setCurrentUser(found); setActiveTab('mypage'); }
    else { setAuthError('IDまたはパスワードが正しくありません'); }
  };

  const handleLogout = () => { setCurrentUser(null); setLoginId(''); setPassword(''); };

  const fillCredentials = () => {
    const s = generateCredentials();
    const p = generateCredentials();
    setStudentForm(prev => ({
      ...prev, studentLoginId: s.id, studentPassword: s.pw, parentLoginId: p.id, parentPassword: p.pw
    }));
  };

  const saveStudent = async (e) => {
    e.preventDefault();
    try {
      const sId = studentForm.studentLoginId || generateCredentials().id;
      const sPw = studentForm.studentPassword || generateCredentials().pw;
      const pId = studentForm.parentLoginId || generateCredentials().id;
      const pPw = studentForm.parentPassword || generateCredentials().pw;
      const data = { ...studentForm, studentLoginId: sId, studentPassword: sPw, parentLoginId: pId, parentPassword: pPw, updatedAt: serverTimestamp() };
      if (editingStudent) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', editingStudent.id), data);
        setSaveMessage('更新完了');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), { ...data, createdAt: serverTimestamp() });
        setGeneratedCreds({ student: { id: sId, pw: sPw }, parent: { id: pId, pw: pPw }, name: studentForm.name });
        setSaveMessage('登録完了');
      }
      setStudentForm({ name: '', school: '', age: '', courseId: 'premium', remarks: '', nextClassDate: '', studentLoginId: '', studentPassword: '', parentLoginId: '', parentPassword: '' });
      setEditingStudent(null);
    } catch (e) { console.error(e); setSaveMessage(`保存エラー: ${e.message}`); }
    setTimeout(() => setSaveMessage(''), 5000);
  };

  const deleteSponsor = async (id) => {
    if (!window.confirm('この企業を削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'sponsors', id));
      setSaveMessage('削除しました');
    } catch (e) { setSaveMessage('失敗'); }
  };

  const saveMaterial = async (e) => {
    e.preventDefault();
    try {
      const tagsArray = materialForm.tags.split(',').map(t => t.trim()).filter(t => t);
      const data = { ...materialForm, tags: tagsArray, updatedAt: serverTimestamp() };
      if (editingMaterial) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'materials', editingMaterial.id), data);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'materials'), { ...data, createdAt: serverTimestamp() });
      }
      setMaterialForm({ title: '', url: '', tags: '' });
      setEditingMaterial(null);
      setSaveMessage('教材保存完了');
    } catch (e) { setSaveMessage('エラー'); }
  };

  const submitLearningRecord = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'learning_records'), {
        ...newLearningRecord, studentId: currentUser.studentId, studentName: currentUser.name, date: new Date().toISOString(), createdAt: serverTimestamp(), comment: ''
      });
      setNewLearningRecord({ title: '', content: '', imageUrl: '' });
      setSaveMessage('記録しました');
    } catch (e) { setSaveMessage('失敗'); }
  };

  const submitAdminComment = async (recordId) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'learning_records', recordId), {
        comment: adminComment[recordId], commentedAt: serverTimestamp()
      });
      setSaveMessage('送信しました');
    } catch (e) { setSaveMessage('失敗'); }
  };

  const postAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'announcements'), {
        ...announcementForm,
        createdAt: serverTimestamp()
      });
      setAnnouncementForm({ title: '', content: '', type: 'info' });
      setSaveMessage('お知らせを公開しました');
    } catch (e) {
      setSaveMessage('投稿に失敗しました');
    }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleMaterialClick = (e, material) => {
    if (material.tags.some(t => t.toLowerCase() === 'scratch')) {
      e.preventDefault();
      setActiveWorkspace(material);
    }
  };

  // --- ログイン画面 ---
  if (!currentUser || !currentUser.role) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6 text-left">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-orange-100 animate-in zoom-in-95 duration-500 text-left">
          <div className="text-center space-y-2 text-slate-900">
            <div className="bg-orange-600 w-16 h-16 rounded-3xl flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-200"><Calculator size={32} /></div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Clayette Portal</h1>
            <p className="text-slate-400 text-[10px] font-bold tracking-[0.3em] uppercase text-center">Educational Management System</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <div className="space-y-4 text-left">
              <div className="text-left"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block text-left">Login ID</label><input type="text" value={loginId} onChange={e => setLoginId(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none text-left" /></div>
              <div className="text-left"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block text-left">Password</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none text-left" /></div>
            </div>
            {authError && <p className="text-rose-500 text-[10px] font-bold text-center bg-rose-50 py-2 rounded-xl border border-rose-100">{authError}</p>}
            <button type="submit" className="w-full bg-orange-600 text-white font-black py-4 rounded-2xl shadow-xl hover:bg-orange-700 transition-all active:scale-95 text-base">ログイン</button>
          </form>
        </div>
      </div>
    );
  }



  if (activeWorkspace) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col text-left">
        <div className="h-14 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 shrink-0 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-black tracking-widest">WORKSTATION</div>
            <h3 className="text-white font-bold text-lg truncate max-w-xl">{activeWorkspace.title}</h3>
          </div>
          <button onClick={() => setActiveWorkspace(null)} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest">
            <X size={16} /> Close Workspace
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden relative select-none">
          <div className="bg-white relative" style={{ width: `${splitRatio}%` }}>
            <iframe
              src={activeWorkspace.url}
              title="Materials"
              className={`w-full h-full ${isDragging ? 'pointer-events-none' : ''}`}
              frameBorder="0"
              allowFullScreen
            />
          </div>

          {/* Resizer Handle */}
          <div
            className="w-4 bg-slate-800 hover:bg-orange-500 cursor-col-resize flex items-center justify-center shrink-0 transition-colors z-50"
            onMouseDown={() => setIsDragging(true)}
          >
            <div className="w-1 h-8 bg-slate-600 rounded-full" />
          </div>

          <div className="bg-[#E9F1FC] relative flex-1">
            <iframe
              src="/scratch/editor.html"
              title="Scratch GUI"
              className={`w-full h-full ${isDragging ? 'pointer-events-none' : ''}`}
              frameBorder="0"
              allow="geolocation; microphone; camera; midi"
            />
          </div>

          {/* Overlay to catch events during drag */}
          {isDragging && <div className="absolute inset-0 z-[100] cursor-col-resize" />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 text-left overflow-x-hidden flex flex-col">
      {/* ナビゲーション */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-40 px-4 shrink-0 shadow-sm text-left">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 text-left">
          <div className="flex items-center gap-3 text-left">
            <div className="bg-orange-600 p-2 rounded-xl text-white shadow-lg"><Calculator size={18} /></div>
            <span className="font-black tracking-tighter text-slate-800 hidden sm:inline uppercase text-left">Clayette System</span>
          </div>
          <div className="flex items-center gap-4 text-left">
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-left">
              {currentUser.role === 'admin' ? (
                <>
                  <button onClick={() => setActiveTab('students')} className={`px-2 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${activeTab === 'students' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>生徒管理</button>
                  <button onClick={() => setActiveTab('materials')} className={`px-2 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${activeTab === 'materials' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>教材管理</button>
                  <button onClick={() => setActiveTab('notices')} className={`px-2 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${activeTab === 'notices' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>お知らせ</button>
                </>
              ) : (
                <>
                  <button onClick={() => setActiveTab('mypage')} className={`px-2 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all bg-white text-orange-600 shadow-sm`}>マイページ</button>
                  <button onClick={() => setActiveTab('materials')} className={`px-2 md:px-4 py-1.5 rounded-lg text-[10px] md:text-xs font-bold transition-all ${activeTab === 'materials' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}>教材一覧</button>
                </>
              )}
            </div>
            <button onClick={handleLogout} className="text-slate-400 hover:text-rose-600 transition-colors ml-2 text-left"><LogOut size={20} /></button>
          </div>
        </div>
      </nav>

      {/* メインエリア */}
      <main className="flex-grow max-w-6xl w-full mx-auto p-4 md:p-8 space-y-8 text-left text-slate-900 overflow-y-auto">
        {saveMessage && <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce text-left"><CheckCircle2 size={18} className="text-emerald-400" /><span className="text-sm font-bold">{saveMessage}</span></div>}

        {/* 生徒管理 */}
        {currentUser.role === 'admin' && activeTab === 'students' && (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-left">
            <header className="text-left"><h2 className="text-2xl font-black tracking-tight text-left">受講生・保護者管理</h2></header>
            {generatedCreds && (
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl space-y-4 border-2 border-orange-500 animate-in zoom-in-95 duration-300 text-left">
                <div className="flex items-center gap-3 text-orange-400 font-bold text-left"><Key size={20} /> <span className="text-left">アカウントを発行しました: {generatedCreds.name}様</span></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left font-mono">
                  <div className="bg-white/10 p-4 rounded-2xl text-left"><p className="text-[10px] font-bold text-orange-300 mb-2 uppercase text-left">受講生用</p><p className="text-sm text-left tracking-widest">ID: {generatedCreds.student.id} / PW: {generatedCreds.student.pw}</p></div>
                  <div className="bg-white/10 p-4 rounded-2xl text-left"><p className="text-[10px] font-bold text-orange-300 mb-2 uppercase text-left">保護者用</p><p className="text-sm text-left tracking-widest">ID: {generatedCreds.parent.id} / PW: {generatedCreds.parent.pw}</p></div>
                </div>
                <button onClick={() => setGeneratedCreds(null)} className="w-full bg-orange-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-orange-700 transition-colors">内容を確認して閉じる</button>
              </div>
            )}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start text-left text-slate-900">
              <div className="xl:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm text-left">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-left">{editingStudent ? '生徒編集' : '生徒登録'}</h3>
                <form onSubmit={saveStudent} className="space-y-5 text-left">
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase ml-1 block mb-1 text-left">氏名</label><input type="text" required value={studentForm.name} onChange={e => setStudentForm({ ...studentForm, name: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-left" /></div>
                  <div className="grid grid-cols-2 gap-4 text-left">
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 text-left">学校</label><input type="text" value={studentForm.school} onChange={e => setStudentForm({ ...studentForm, school: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-left" /></div>
                    <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 text-left">年齢</label><input type="number" value={studentForm.age} onChange={e => setStudentForm({ ...studentForm, age: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-left" /></div>
                  </div>
                  <div><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 text-left">次回の授業日</label><input type="date" value={studentForm.nextClassDate} onChange={e => setStudentForm({ ...studentForm, nextClassDate: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-left" /></div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-4 text-left">
                    <div className="flex justify-between items-center text-left"><span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Credentials</span><button type="button" onClick={fillCredentials} className="text-[9px] bg-slate-200 px-2 py-1 rounded font-black text-slate-500 uppercase tracking-widest hover:bg-slate-300">Auto</button></div>
                    <div className="grid grid-cols-1 gap-2 text-left"><input type="text" placeholder="生徒ID" value={studentForm.studentLoginId} onChange={e => setStudentForm({ ...studentForm, studentLoginId: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-left" /><input type="text" placeholder="生徒PW" value={studentForm.studentPassword} onChange={e => setStudentForm({ ...studentForm, studentPassword: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-left" /><input type="text" placeholder="保護者ID" value={studentForm.parentLoginId} onChange={e => setStudentForm({ ...studentForm, parentLoginId: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-left" /><input type="text" placeholder="保護者PW" value={studentForm.parentPassword} onChange={e => setStudentForm({ ...studentForm, parentPassword: e.target.value })} className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-left" /></div>
                  </div>
                  <div className="text-left"><label className="text-[10px] font-bold text-slate-400 uppercase block mb-1 text-left">プラン</label><select value={studentForm.courseId} onChange={e => setStudentForm({ ...studentForm, courseId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-left outline-none appearance-none">{COURSE_BASES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}</select></div>
                  <button type="submit" className="w-full bg-orange-600 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-700 transition-all flex items-center justify-center gap-2 active:scale-95 text-sm uppercase tracking-widest">{editingStudent ? 'UPDATE' : 'ID発行と登録'}</button>
                </form>
              </div>
              <div className="xl:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                {students.map(s => (
                  <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-sm relative group hover:border-orange-300 transition-all text-left">
                    <div className="absolute top-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all text-left"><button onClick={() => { setEditingStudent(s); setStudentForm(s); window.scrollTo(0, 0); }} className="p-2 bg-slate-50 text-slate-400 hover:text-orange-600 rounded-lg"><Edit2 size={14} /></button><button onClick={async () => { if (window.confirm('削除？')) { await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', s.id)); } }} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg"><Trash2 size={14} /></button></div>
                    <div className="text-left"><h4 className="font-black text-xl text-slate-800 text-left">{s.name}</h4><p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left">{s.school || '学校未登録'} | {s.age || '?'}歳</p></div>
                    <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-tighter text-left"><span>生徒ID: {s.studentLoginId}</span><span>保護者ID: {s.parentLoginId}</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* お知らせ/教材管理 */}
        {currentUser.role === 'admin' && activeTab === 'materials' && (
          <div className="space-y-8 animate-in fade-in duration-500 text-left">
            <header className="text-left"><h2 className="text-2xl font-black tracking-tight text-slate-800 text-left">教材・リソース管理</h2></header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start text-left">
              <div className="md:col-span-1 bg-white rounded-3xl border border-slate-200 p-6 h-fit sticky top-24 shadow-sm text-left">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-left">新規追加</h3>
                <form onSubmit={saveMaterial} className="space-y-4 text-left">
                  <input type="text" placeholder="タイトル" value={materialForm.title} onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-orange-500" />
                  <input type="url" placeholder="URL" value={materialForm.url} onChange={e => setMaterialForm({ ...materialForm, url: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-orange-500" />
                  <input type="text" placeholder="タグ (コンマ区切り)" value={materialForm.tags} onChange={e => setMaterialForm({ ...materialForm, tags: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-orange-500" />
                  <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all uppercase tracking-widest text-sm">SAVE</button>
                </form>
              </div>
              <div className="md:col-span-2 space-y-4 text-left">
                {materials.map(m => (
                  <div key={m.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex justify-between items-start group shadow-sm text-left hover:border-orange-200 transition-all"><div className="text-left"><h4 className="font-black text-slate-800 text-lg text-left">{m.title}</h4><div className="flex flex-wrap gap-2 mt-2 text-left">{m.tags.map(t => (<span key={t} className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter text-left">{t}</span>))}</div><a href={m.url} target="_blank" className="text-orange-600 text-xs font-black flex items-center gap-1 mt-4 hover:underline text-left uppercase">Open <LinkIcon size={12} /></a></div><div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all text-left"><button onClick={() => { setEditingMaterial(m); setMaterialForm({ ...m, tags: m.tags.join(',') }); }} className="p-2 bg-slate-50 text-slate-400 hover:text-orange-600 transition-colors"><Edit2 size={14} /></button><button onClick={() => deleteMaterial(m.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button></div></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* お知らせ管理 */}
        {currentUser.role === 'admin' && activeTab === 'notices' && (
          <div className="space-y-8 animate-in fade-in duration-500 text-left">
            <header className="text-left font-black text-2xl text-left text-slate-800">全体連絡管理</header>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="md:col-span-1 bg-white p-6 rounded-3xl border border-slate-200 h-fit shadow-sm text-left"><h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 text-left">新規投稿</h3><form onSubmit={postAnnouncement} className="space-y-4 text-left"><input type="text" required placeholder="タイトル" value={announcementForm.title} onChange={e => setAnnouncementForm({ ...announcementForm, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-orange-500" /><textarea required placeholder="本文" value={announcementForm.content} onChange={e => setAnnouncementForm({ ...announcementForm, content: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm h-32 resize-none text-left focus:ring-2 focus:ring-orange-500 outline-none" /><select value={announcementForm.type} onChange={e => setAnnouncementForm({ ...announcementForm, type: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none appearance-none text-left"><option value="info">通常のお知らせ</option><option value="emergency">緊急・重要連絡</option></select><button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all uppercase tracking-[0.2em] text-sm">POST</button></form></div>
              <div className="md:col-span-2 space-y-4 text-left">{announcements.map(notice => (<div key={notice.id} className="bg-white p-6 rounded-[2rem] border border-slate-200 flex justify-between items-start group shadow-sm text-left transition-all hover:border-orange-200"><div><div className="flex items-center gap-3 mb-2 text-left"><span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest text-left ${notice.type === 'emergency' ? 'bg-rose-100 text-rose-600' : 'bg-orange-100 text-orange-600'}`}>{notice.type}</span><span className="text-[10px] font-bold text-slate-400 text-left">{notice.createdAt?.toDate().toLocaleDateString()}</span></div><h4 className="font-black text-lg text-left text-slate-800">{notice.title}</h4><p className="text-sm text-slate-500 mt-2 leading-relaxed text-left">{notice.content}</p></div><button onClick={async () => await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'announcements', notice.id))} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shrink-0 text-left"><Trash2 size={18} /></button></div>))}</div>
            </div>
          </div>
        )}

        {/* 受講生・保護者向け: マイページ */}
        {(currentUser.role === 'student' || currentUser.role === 'parent') && activeTab === 'mypage' && (
          <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 text-left text-slate-900">
            <header className="flex flex-col md:flex-row justify-between items-start gap-6 text-left">
              <div className="text-left">
                <h2 className="text-3xl font-black tracking-tight text-left text-slate-800">{currentUser.name}様 <span className="text-orange-600 font-light ml-2 uppercase">My Portal</span></h2>
                <p className="text-slate-400 text-sm font-medium mt-1 text-left">今日学んだことや作品を記録して成長をポートフォリオに残しましょう。</p>
              </div>
              <div className="shrink-0">
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xl flex flex-col justify-center"><p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5 tracking-widest"><Clock size={12} className="text-orange-500" /> Next Lesson</p><p className="text-xl font-black text-slate-800 whitespace-nowrap">{currentUser.nextClassDate || '未設定'}</p></div>
              </div>
            </header>

            {/* 学習記録フォーム（生徒のみ・大型・中央） */}
            {currentUser.role === 'student' && (
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-8 md:p-12">
                <div className="flex items-center gap-3 mb-8">
                  <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-lg"><BookOpen size={22} /></div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800">学習を記録する</h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">今日学んだことや感想を書いて保存しましょう</p>
                  </div>
                </div>
                <form onSubmit={submitLearningRecord} className="space-y-6">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">タイトル</label>
                    <input type="text" value={newLearningRecord.title} onChange={e => setNewLearningRecord({ ...newLearningRecord, title: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-base font-bold outline-none focus:ring-2 focus:ring-orange-500 transition-all" placeholder="例: Scratchでアニメーションを作った！" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">今日学んだこと・感想</label>
                    <textarea value={newLearningRecord.content} onChange={e => setNewLearningRecord({ ...newLearningRecord, content: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm font-medium h-48 resize-none focus:ring-2 focus:ring-orange-500 outline-none transition-all leading-relaxed" placeholder="今日はどんなことを学びましたか？難しかったこと、面白かったことを書いてみましょう。" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">成果物の画像URL（任意）</label>
                    <input type="text" placeholder="https://..." value={newLearningRecord.imageUrl} onChange={e => setNewLearningRecord({ ...newLearningRecord, imageUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                  </div>
                  <button type="submit" className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl shadow-xl hover:bg-orange-700 transition-all flex items-center justify-center gap-3 active:scale-95 text-base uppercase tracking-widest">
                    <Save size={20} /> 記録を保存する
                  </button>
                </form>
              </div>
            )}

            {/* .sb3 ファイル管理（生徒のみ） */}
            {currentUser.role === 'student' && (
              <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-8 md:p-10 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-800 p-3 rounded-2xl text-white shadow-lg"><FileArchive size={22} /></div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800">Scratchファイル管理</h3>
                      <p className="text-xs text-slate-400 font-medium mt-0.5">.sb3 ファイルを日ごとにアップロードして管理できます</p>
                    </div>
                  </div>
                  <div>
                    <input ref={sb3InputRef} type="file" accept=".sb3" onChange={uploadSb3File} className="hidden" id="sb3-upload" />
                    <label htmlFor="sb3-upload" className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm cursor-pointer transition-all shadow-md active:scale-95 uppercase tracking-wider ${isUploadingSb3 ? 'bg-slate-200 text-slate-400 pointer-events-none' : 'bg-slate-900 text-white hover:bg-orange-600'}`}>
                      {isUploadingSb3 ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
                      {isUploadingSb3 ? 'アップロード中...' : '.sb3をアップロード'}
                    </label>
                  </div>
                </div>
                {sb3Files.length === 0 ? (
                  <div className="border border-dashed border-slate-200 rounded-2xl py-16 text-center text-slate-400 text-xs font-bold uppercase tracking-widest">アップロード済みのファイルはありません</div>
                ) : (
                  <div className="space-y-3">
                    {sb3Files.map(file => (
                      <div key={file.id} className="flex items-center justify-between bg-slate-50 rounded-2xl px-5 py-4 border border-slate-100 group hover:border-orange-200 transition-all">
                        <div className="flex items-center gap-4 overflow-hidden">
                          <div className="bg-orange-100 text-orange-600 p-2.5 rounded-xl shrink-0"><FileArchive size={18} /></div>
                          <div className="overflow-hidden">
                            <p className="font-black text-slate-800 text-sm truncate">{file.fileName}</p>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest uppercase">{file.uploadDate}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <a href={file.downloadUrl} download={file.fileName} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-orange-600 rounded-xl transition-colors" title="ダウンロード"><Download size={16} /></a>
                          <button onClick={() => deleteSb3File(file)} className="p-2.5 bg-white border border-slate-200 text-slate-400 hover:text-rose-500 rounded-xl transition-colors" title="削除"><Trash2 size={16} /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 成長の軌跡 */}
            <div className="space-y-6">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><ImageIcon size={22} className="text-orange-500" /> 成長の軌跡</h3>
              <div className="grid grid-cols-1 gap-6">
                {learningRecords.length === 0
                  ? <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">記録が見つかりません</div>
                  : learningRecords.sort((a, b) => b.date.localeCompare(a.date)).map(record => (
                    <div key={record.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all group">
                      {record.imageUrl && (
                        <div className="md:w-72 h-56 md:h-auto bg-slate-100 flex-shrink-0 overflow-hidden"><img src={record.imageUrl} alt="成果物" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=400'; }} /></div>
                      )}
                      <div className="p-8 flex-1 space-y-5">
                        <div><p className="text-[10px] font-black text-orange-600 uppercase tracking-[0.2em] mb-1">{new Date(record.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}</p><h4 className="text-2xl font-black text-slate-800 tracking-tight">{record.title}</h4></div>
                        <p className="text-sm text-slate-500 leading-relaxed font-medium whitespace-pre-wrap">{record.content}</p>
                        {record.comment && <div className="mt-4 bg-orange-50/70 border border-orange-100 p-5 rounded-2xl"><div className="flex items-center gap-2 text-orange-600 font-black text-[10px] uppercase tracking-widest mb-2"><MessageSquare size={12} /> Feedback</div><p className="text-sm text-slate-700 font-bold italic leading-relaxed">"{record.comment}"</p></div>}
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>
        )}

        {/* 教材一覧 (受講生・保護者用) */}
        {(currentUser.role === 'student' || currentUser.role === 'parent') && activeTab === 'materials' && (
          <div className="space-y-8 text-left animate-in fade-in duration-500">
            <header className="text-left"><h2 className="text-2xl font-black text-slate-800 tracking-tight text-left">教材・リソースライブラリ</h2></header>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {materials.map(m => (
                <div
                  key={m.id}
                  onClick={(e) => {
                    const isScratch = m.tags.some(t => t.toLowerCase() === 'scratch');
                    if (isScratch) {
                      handleMaterialClick(e, m);
                    } else {
                      window.open(m.url, '_blank');
                    }
                  }}
                  className="bg-white p-6 rounded-[2rem] border border-slate-200 flex items-center group shadow-sm hover:shadow-md hover:border-orange-300 transition-all text-left cursor-pointer active:scale-95"
                >
                  <div className="text-left w-full">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-black text-slate-800 text-lg group-hover:text-orange-600 transition-colors">{m.title}</h4>
                      <LinkIcon size={16} className="text-slate-300 group-hover:text-orange-500 transition-colors" />
                    </div>
                    <div className="flex flex-wrap gap-2 text-left">
                      {m.tags.map(t => (<span key={t} className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase text-left tracking-widest">{t}</span>))}
                    </div>
                  </div>
                </div>
              ))}
              {materials.length === 0 && <div className="md:col-span-2 py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">現在、公開されている教材はありません</div>}
            </div>
          </div>
        )}
      </main>

      <footer className="shrink-0 mt-auto py-10 border-t border-slate-200 text-center text-slate-300 text-[10px] font-black tracking-[0.5em] uppercase text-center bg-white/50">
        Clayette Educational Management Platform
      </footer>

      <style>{`
        @media print { .print\\:hidden { display: none !important; } .print\\:bg-white { background: white !important; } .print\\:p-10 { padding: 2.5rem !important; } body { overflow: visible !important; } .rounded-[2rem], .rounded-[2.5rem] { border-radius: 1.5rem !important; } }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 22px; height: 22px; background: white; cursor: pointer; border-radius: 50%; border: 4px solid #ea580c; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); }
        .animate-bounce-slow { animation: bounce 3s infinite ease-in-out; }
        .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .line-clamp-3 { display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }
        @keyframes bounce { 0%, 100% { transform: translateY(-5%) translateX(-50%); animation-timing-function: cubic-bezier(0.8, 0, 1, 1); } 50% { transform: translateY(0) translateX(-50%); animation-timing-function: cubic-bezier(0, 0, 0.2, 1); } }
      `}</style>
    </div>
  );
};

export default App;