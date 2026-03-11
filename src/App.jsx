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
  FileArchive,
  Trophy,
  PlayCircle,
  Crown,
  Star,
  Sparkles,
  Menu
} from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, deleteDoc, collection, onSnapshot, query, serverTimestamp, addDoc, updateDoc, getDocs, where, limit } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import TypingGame from './components/TypingGame.jsx';

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

const MATERIAL_CATEGORIES = [
  { id: 'scratch', label: 'Scratch' },
  { id: 'Canva', label: 'Canva' },
  { id: 'robot', label: 'Robot' }
];

const getLevelCharacter = (percentage) => {
  if (percentage >= 100) return { imageUrl: "/characters/lv5.png", name: "プログラミングマスター", color: "text-amber-500", bg: "bg-amber-100", border: "border-amber-400" };
  if (percentage >= 75) return { imageUrl: "/characters/lv4.png", name: "つよつよプログラマー", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-400" };
  if (percentage >= 50) return { imageUrl: "/characters/lv3.png", name: "ゆうかんなチャレンジャー", color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-400" };
  if (percentage >= 25) return { imageUrl: "/characters/lv2.png", name: "げんきなチャレンジャー", color: "text-sky-500", bg: "bg-sky-100", border: "border-sky-400" };
  return { imageUrl: "/characters/lv1.png", name: "はじまりのルーキー", color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-300" };
};

const getMaterialThumbnail = (category) => {
  switch(category) {
    case 'scratch': return "https://images.unsplash.com/photo-1550439062-609e1531270e?auto=format&fit=crop&q=80&w=400";
    case 'Canva': return "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?auto=format&fit=crop&q=80&w=400";
    case 'robot': return "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=400";
    default: return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400";
  }
};

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // --- Data State ---
  const [students, setStudents] = useState([]);
  const [learningRecords, setLearningRecords] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // --- Student Form State ---
  const [editingStudent, setEditingStudent] = useState(null);
  const [activeStudentDetail, setActiveStudentDetail] = useState(null);
  const [studentForm, setStudentForm] = useState({
    name: '', school: '', age: '', courseId: 'premium', remarks: '', nextClassDate: '',
    studentLoginId: '', studentPassword: '', parentLoginId: '', parentPassword: ''
  });
  const [generatedCreds, setGeneratedCreds] = useState(null);

  // --- 学習記録 & お知らせフォーム ---
  const [newLearningRecord, setNewLearningRecord] = useState({ title: '', content: {}, imageUrl: '', fileUrl: '', linkUrl: '', lessonDate: new Date().toISOString().slice(0, 10) });
  const [adminComment, setAdminComment] = useState({});
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', type: 'info' });
  const [reflectionTemplate, setReflectionTemplate] = useState([]);
  const [reflectionItemForm, setReflectionItemForm] = useState({ title: '', type: 'textarea', category: 'goal' });
  const [editingReflectionItem, setEditingReflectionItem] = useState(null);
  const [parentComment, setParentComment] = useState({});

  // --- .sb3 アップロード ---
  const [sb3Files, setSb3Files] = useState([]);
  const [isUploadingSb3, setIsUploadingSb3] = useState(false);
  const sb3InputRef = useRef(null);

  // --- 教材データ状態 ---
  const [materials, setMaterials] = useState([]);
  const [materialForm, setMaterialForm] = useState({ title: '', url: '', category: 'scratch', thumbnailUrl: '', isPublished: true });
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [activeWorkspace, setActiveWorkspace] = useState(null);
  const [splitRatio, setSplitRatio] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const [completionRequests, setCompletionRequests] = useState([]);

  // --- メッセージ機能状態 ---
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  // --- 管理者・生徒検索 & 通知 ---
  const [studentSearchQuery, setStudentSearchQuery] = useState('');
  // Record which announcements have been read (by ID) in localStorage
  const [readAnnouncementIds, setReadAnnouncementIds] = useState(() => {
    try { return JSON.parse(localStorage.getItem('readAnnouncements') || '[]'); } catch { return []; }
  });

  // --- YouTube モーダル ---
  const [youtubeModal, setYoutubeModal] = useState(null); // { title, embedUrl }

  // YouTube URLからビデオIDを抽出するヘルパー
  const getYoutubeEmbedUrl = (url) => {
    try {
      const u = new URL(url);
      let videoId = null;
      if (u.hostname === 'youtu.be') {
        videoId = u.pathname.slice(1).split('?')[0];
      } else if (u.hostname.includes('youtube.com')) {
        if (u.pathname === '/watch') {
          videoId = u.searchParams.get('v');
        } else if (u.pathname.startsWith('/embed/')) {
          videoId = u.pathname.split('/embed/')[1].split('?')[0];
        } else if (u.pathname.startsWith('/shorts/')) {
          videoId = u.pathname.split('/shorts/')[1].split('?')[0];
        }
      }
      if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
    } catch { }
    return null;
  };

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
    const unsubLearning = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'learning_records'), limit(50)), (snap) => {
      setLearningRecords(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubMaterials = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'materials'), (snap) => {
      setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()));
    });
    const unsubReflections = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'reflection_template'), (snap) => {
      setReflectionTemplate(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0)));
    });
    const unsubCompletionRequests = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'completion_requests'), (snap) => {
      setCompletionRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)));
    });
    const unsubMessages = onSnapshot(query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), limit(50)), (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0)));
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
        unsubLearning(); unsubMaterials(); unsubReflections(); unsubCompletionRequests(); unsubMessages();
        unsubSb3();
      };
    }

    return () => {
      unsubStudents(); unsubAnnounce();
      unsubLearning(); unsubMaterials(); unsubReflections(); unsubCompletionRequests(); unsubMessages();
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
        role: 'parent', 
        name: `${firstChild.name}の保護者`, 
        childId: firstChild.id, 
        childName: firstChild.name, 
        nextClassDate: firstChild.nextClassDate,
        allChildren: parentChildren
      };
    }

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
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const deleteStudentCascade = async (studentId) => {
    if (!window.confirm('この生徒と、紐づくすべてのデータ（提出シート、ファイル、承認リクエスト）を削除しますか？\nこの操作は取り消せません。')) return;
    try {
      // 1. Delete associated learning records
      const recordsToDelete = learningRecords.filter(r => r.studentId === studentId);
      for (const r of recordsToDelete) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'learning_records', r.id));
      }
      
      // 2. Delete associated sb3 files (from db and storage)
      const filesToDelete = sb3Files.filter(f => f.studentId === studentId);
      for (const f of filesToDelete) {
        if (f.storagePath) {
          try {
            await deleteObject(ref(storage, f.storagePath));
          } catch (storageErr) {
            console.error("Storage delete failed for path:", f.storagePath, storageErr);
          }
        }
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId, 'sb3_files', f.id));
      }
      
      // 3. Delete associated completion requests
      const requestsToDelete = completionRequests.filter(req => req.studentId === studentId);
      for (const req of requestsToDelete) {
        await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'completion_requests', req.id));
      }

      // 4. Finally delete the student record itself
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId));
      setSaveMessage('生徒データを一括削除しました');
    } catch (e) {
      console.error("Delete cascade failed: ", e);
      setSaveMessage('削除中にエラーが発生しました');
    }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const saveMaterial = async (e) => {
    e.preventDefault();
    try {
      const data = { ...materialForm, updatedAt: serverTimestamp() };
      if (editingMaterial) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'materials', editingMaterial.id), data);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'materials'), { ...data, createdAt: serverTimestamp() });
      }
      setMaterialForm({ title: '', url: '', category: 'scratch', thumbnailUrl: '', isPublished: true });
      setEditingMaterial(null);
      setSaveMessage('教材保存完了');
    } catch (e) { setSaveMessage('エラー'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const submitLearningRecord = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'learning_records'), {
        ...newLearningRecord, studentId: currentUser.studentId, studentName: currentUser.name, date: new Date().toISOString(), createdAt: serverTimestamp(), comment: ''
      });
      setNewLearningRecord({ title: '', content: {}, imageUrl: '', fileUrl: '', linkUrl: '', lessonDate: new Date().toISOString().slice(0, 10) });
      setSaveMessage('記録しました');
    } catch (e) { setSaveMessage('失敗'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const sendMessage = async (e, receiverId, studentIdCtx) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
        text: newMessage,
        senderId: currentUser.role === 'admin' ? 'admin' : currentUser.studentId || currentUser.childId,
        senderRole: currentUser.role,
        senderName: currentUser.name || (currentUser.role === 'admin' ? '講師・サポーター' : '生徒/保護者'),
        receiverId: receiverId, // If admin sending, it's studentId. If student/parent sending, it's 'admin'.
        studentId: studentIdCtx, // The context student ID for this chat
        isRead: false,
        createdAt: serverTimestamp(),
      });
      setNewMessage('');
    } catch (err) {
      console.error(err);
      setSaveMessage('メッセージ送信エラー');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    const markMessagesAsRead = async () => {
      let unreadMsgs = [];
      if (currentUser.role === 'admin' && activeStudentDetail) {
        unreadMsgs = messages.filter(m => m.studentId === activeStudentDetail.id && m.receiverId === 'admin' && !m.isRead);
      } else if ((currentUser.role === 'student' || currentUser.role === 'parent') && activeTab === 'mypage') {
        const studentIdCtx = currentUser.role === 'student' ? currentUser.studentId : currentUser.childId;
        unreadMsgs = messages.filter(m => m.studentId === studentIdCtx && m.receiverId === studentIdCtx && !m.isRead);
      }

      for (const msg of unreadMsgs) {
        try {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'messages', msg.id), { isRead: true });
        } catch (e) {
          console.error("Failed to mark read", e);
        }
      }
    };
    markMessagesAsRead();
  }, [messages, activeTab, activeStudentDetail, currentUser]);

  const saveReflectionItem = async (e) => {
    e.preventDefault();
    try {
      const dataToSave = { ...reflectionItemForm, category: reflectionItemForm.category || 'goal' };
      if (editingReflectionItem) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'reflection_template', editingReflectionItem), {
          ...dataToSave, updatedAt: serverTimestamp()
        });
        setSaveMessage('項目を更新しました');
        setEditingReflectionItem(null);
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reflection_template'), {
          ...dataToSave, createdAt: serverTimestamp()
        });
        setSaveMessage('項目を追加しました');
      }
      setReflectionItemForm({ title: '', type: 'textarea', category: 'goal' });
    } catch (e) { setSaveMessage('エラー'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const deleteReflectionItem = async (id) => {
    if (!window.confirm('削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'reflection_template', id));
      if (editingReflectionItem === id) {
        setEditingReflectionItem(null);
        setReflectionItemForm({ title: '', type: 'textarea', category: 'goal' });
      }
      setSaveMessage('削除しました');
    } catch (e) { }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const submitAdminComment = async (recordId) => {
    const record = learningRecords.find(r => r.id === recordId);
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'learning_records', recordId), {
        comment: adminComment[recordId], commentedAt: serverTimestamp()
      });
      // 生徒にコメント通知メッセージを自動送信
      if (record?.studentId) {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
          text: `📝 「${record.title}」に先生からコメントが届きました。マイページで確認してね！`,
          senderId: 'admin',
          senderRole: 'admin',
          senderName: '講師・サポーター (自動通知)',
          receiverId: record.studentId,
          studentId: record.studentId,
          isRead: false,
          createdAt: serverTimestamp(),
        });
      }
      setSaveMessage('送信しました');
    } catch (e) { setSaveMessage('失敗'); }
    setTimeout(() => setSaveMessage(''), 3000);
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
    const isScratch = material.category === 'scratch' || (material.tags && material.tags.some(t => t.toLowerCase() === 'scratch'));
    if (isScratch) {
      e.preventDefault();
      setActiveWorkspace(material);
    }
  };

  const handleMaterialOpen = (e, m) => {
    e.preventDefault();
    const isScratch = m.category === 'scratch' || (m.tags && m.tags.some(t => t.toLowerCase() === 'scratch'));
    if (isScratch) {
      setActiveWorkspace(m);
      return;
    }
    const embedUrl = getYoutubeEmbedUrl(m.url);
    if (embedUrl) {
      setYoutubeModal({ title: m.title, embedUrl });
      return;
    }
    window.open(m.url, '_blank');
  };

  const toggleMaterialComplete = async (e, materialId) => {
    e.stopPropagation();
    if (!currentUser || currentUser.role !== 'student') return;
    
    // Check if a request already exists
    const existingReq = completionRequests.find(r => r.studentId === currentUser.studentId && r.materialId === materialId && r.status === 'pending');
    if (existingReq) return; // Already requested
    
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'completion_requests'), {
        studentId: currentUser.studentId,
        studentName: currentUser.name,
        materialId: materialId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setSaveMessage('先生に完了の報告をしました！');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMessage('エラーが発生しました');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const approveCompletion = async (requestId, studentId, materialId) => {
    try {
      // 1. Update the request status
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'completion_requests', requestId), {
        status: 'approved',
        approvedAt: serverTimestamp()
      });

      // 2. Update the student's completed materials
      const studentData = students.find(s => s.id === studentId);
      if (studentData) {
        const currentCompleted = studentData.completedMaterials || [];
        if (!currentCompleted.includes(materialId)) {
          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId), {
            completedMaterials: [...currentCompleted, materialId]
          });
        }
      }
      setSaveMessage('完了を承認しました');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setSaveMessage('承認に失敗しました');
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const rejectCompletion = async (requestId) => {
     if(!window.confirm('この完了報告を差し戻しますか？')) return;
     try {
       await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'completion_requests', requestId), {
         status: 'rejected',
         rejectedAt: serverTimestamp()
       });
       setSaveMessage('差し戻ししました');
       setTimeout(() => setSaveMessage(''), 3000);
     } catch (err) {
       console.error(err);
       setSaveMessage('差し戻しに失敗しました');
       setTimeout(() => setSaveMessage(''), 3000);
     }
  };

  // --- ログイン画面 ---
  if (!currentUser || !currentUser.role) {
    return (
      <div className="min-h-screen bg-orange-50 flex items-center justify-center p-6 text-left">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl p-10 space-y-8 border border-orange-100 animate-in zoom-in-95 duration-500 text-left">
          <div className="text-center space-y-2 text-slate-900">
            <div className="bg-orange-600 w-16 h-16 rounded-3xl flex items-center justify-center text-white mx-auto shadow-lg shadow-orange-200"><Calculator size={32} /></div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">クリエットアプリ</h1>
            <p className="text-slate-400 text-[10px] font-bold tracking-[0.3em] uppercase text-center">一緒に楽しいプログラミングを学びましょう</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6 text-left">
            <div className="space-y-4 text-left">
              <div className="text-left"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block text-left">ログイン ID</label><input type="text" value={loginId} onChange={e => setLoginId(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none text-left" /></div>
              <div className="text-left"><label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 block text-left">パスワード</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-orange-500 outline-none text-left" /></div>
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
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen">

      {/* --- Admin Layout --- */}
      {currentUser.role === 'admin' && (
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
              <button onClick={() => { setActiveTab('students'); setActiveStudentDetail(null); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'students' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800'}`}>
                <span className="flex items-center gap-3"><Users size={18} /> 受講生一覧</span>
                {(() => {
                  const unreadCount = students.filter(s => {
                    const studentMsgs = messages.filter(m => m.studentId === s.id);
                    if (studentMsgs.length === 0) return false;
                    return studentMsgs[studentMsgs.length - 1].senderId !== 'admin';
                  }).length;
                  return unreadCount > 0 ? <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span> : null;
                })()}
              </button>
              <button onClick={() => { setActiveTab('records'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'records' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800'}`}>
                <span className="flex items-center gap-3"><FileText size={18} /> 提出シート確認</span>
                {(() => {
                  const unreadCount = learningRecords.filter(r => !r.comment).length;
                  return unreadCount > 0 ? <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount}</span> : null;
                })()}
              </button>
              <button onClick={() => { setActiveTab('materials'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'materials' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800'}`}>
                <span className="flex items-center gap-3"><BookOpen size={18} /> 教材リソース</span>
              </button>
              <button onClick={() => { setActiveTab('approvals'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeTab === 'approvals' ? 'bg-orange-600 text-white' : 'hover:bg-slate-800'}`}>
                <span className="flex items-center gap-3"><CheckCircle2 size={18} /> カリキュラム承認</span>
                {(() => {
                  const pendingCount = completionRequests.filter(r => r.status === 'pending').length;
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
              {saveMessage && <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce text-left"><CheckCircle2 size={18} className="text-emerald-400" /><span className="text-sm font-bold">{saveMessage}</span></div>}

              {/* カリキュラム承認 */}
              {currentUser.role === 'admin' && activeTab === 'approvals' && (
                <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500 text-left">
                  <header className="flex justify-between items-center text-left">
                    <h2 className="text-2xl font-black tracking-tight text-left">カリキュラム承認待ち一覧</h2>
                  </header>

                  <div className="space-y-4">
                    {completionRequests.filter(req => req.status === 'pending').map(req => {
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

                    {completionRequests.filter(req => req.status === 'pending').length === 0 && (
                      <div className="py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                        <CheckCircle2 size={48} className="mx-auto text-slate-300 mb-4" />
                        <p className="text-slate-500 font-bold">現在、承認待ちのカリキュラムはありません。</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 生徒管理 */}
              {currentUser.role === 'admin' && activeTab === 'students' && !activeStudentDetail && (
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {students.filter(s => !studentSearchQuery || s.name?.includes(studentSearchQuery) || s.school?.includes(studentSearchQuery)).map(s => {
                        const studentMsgs = messages.filter(m => m.studentId === s.id);
                        const hasUnread = studentMsgs.length > 0 && studentMsgs[studentMsgs.length - 1].senderId !== 'admin';

                        return (
                          <div key={s.id} className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col justify-between shadow-sm relative group hover:border-orange-300 transition-all text-left">
                            <div className="absolute top-0 right-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-all text-left">
                              <button onClick={() => { setEditingStudent(s); setStudentForm(s); window.scrollTo(0, 0); }} className="p-2 bg-slate-50 text-slate-400 hover:text-orange-600 rounded-lg"><Edit2 size={14} /></button>
                              <button onClick={() => deleteStudentCascade(s.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 rounded-lg"><Trash2 size={14} /></button>
                            </div>
                            <div className="text-left flex items-start justify-between">
                              <div>
                                <h4 className="font-black text-xl text-slate-800 text-left">{s.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left mt-1">{s.school || '学校未登録'} | {s.age || '?'}歳</p>
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
              {currentUser.role === 'admin' && activeTab === 'students' && activeStudentDetail && (() => {
                const s = students.find(s => s.id === activeStudentDetail);
                if (!s) return null;
                const completedCount = s.completedMaterials?.length || 0;
                const totalMaterials = materials.length > 0 ? materials.length : 1;
                const progressPercentage = Math.min(100, Math.floor((completedCount / totalMaterials) * 100));
                const studentRecords = learningRecords.filter(r => r.studentId === s.id).sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis());
                const studentFiles = sb3Files.filter(f => f.studentId === s.id);

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
                        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                          <h3 className="text-sm font-black text-slate-800 mb-4 border-b border-slate-100 pb-2">学習進捗</h3>
                          <div className="flex items-center justify-between mb-2">
                             <span className="text-xs font-bold text-slate-500">完了カリキュラム</span>
                             <span className="text-sm font-black text-orange-600">{completedCount} / {materials.length}</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-3 mb-4 overflow-hidden"><div className="bg-orange-500 h-3 rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div></div>
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
                              {messages.filter(m => m.studentId === s.id).map(msg => {
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
                              {messages.filter(m => m.studentId === s.id).length === 0 && <p className="text-center text-slate-400 text-xs mt-10">メッセージはまだありません</p>}
                           </div>
                           <form onSubmit={(e) => sendMessage(e, s.id, s.id)} className="flex gap-2 shrink-0">
                              <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="メッセージを入力..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500" />
                              <button type="submit" className="bg-slate-900 text-white px-4 rounded-xl font-bold text-sm tracking-wider uppercase hover:bg-orange-600 transition-colors">送信</button>
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
                                      <p className="text-[10px] font-black text-orange-600 mb-2 flex items-center gap-1"><MessageSquare size={12}/> 講師コメント</p>
                                      {record.comment ? <p className="text-sm font-bold text-slate-700 italic">"{record.comment}"</p> : 
                                        <div className="flex gap-2">
                                          <input type="text" placeholder="コメントを入力..." value={adminComment[record.id] || ''} onChange={e => setAdminComment({...adminComment, [record.id]: e.target.value})} className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-orange-500" />
                                          <button onClick={() => submitAdminComment(record.id)} className="bg-slate-900 text-white px-3 py-2 rounded-lg text-xs font-bold">送信</button>
                                        </div>
                                      }
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
                        <input type="url" placeholder="サムネイル画像URL (任意)" value={materialForm.thumbnailUrl || ''} onChange={e => setMaterialForm({ ...materialForm, thumbnailUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-orange-500" />
                        <select value={materialForm.category} onChange={e => setMaterialForm({ ...materialForm, category: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold text-left outline-none focus:ring-2 focus:ring-orange-500 appearance-none">
                          {MATERIAL_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                        </select>
                        <div className="flex items-center gap-2 px-2 pb-2">
                          <input type="checkbox" id="isPublished" checked={materialForm.isPublished} onChange={e => setMaterialForm({ ...materialForm, isPublished: e.target.checked })} className="w-4 h-4 text-orange-600 rounded bg-slate-100 border-slate-300 focus:ring-orange-500" />
                          <label htmlFor="isPublished" className="text-xs font-bold text-slate-600">生徒に公開する</label>
                        </div>
                        <button type="submit" className="w-full bg-slate-900 text-white font-black py-4 rounded-xl shadow-lg hover:bg-orange-600 transition-all uppercase tracking-widest text-sm">{editingMaterial ? 'UPDATE' : 'SAVE'}</button>
                        {editingMaterial && (
                           <button type="button" onClick={() => { setEditingMaterial(null); setMaterialForm({ title: '', url: '', category: 'scratch', thumbnailUrl: '', isPublished: true }); }} className="w-full bg-slate-200 text-slate-600 font-black py-3 rounded-xl shadow-sm hover:bg-slate-300 transition-all uppercase tracking-widest text-xs mt-2">CANCEL</button>
                        )}
                      </form>
                    </div>
                    <div className="md:col-span-2 space-y-4 text-left">
                      {materials.map(m => (
                        <div key={m.id} className={`bg-white p-6 rounded-3xl border ${m.isPublished === false ? 'border-dashed border-slate-300 opacity-60' : 'border-slate-200'} flex justify-between items-start group shadow-sm text-left hover:border-orange-200 transition-all`}>
                          <div className="flex gap-4">
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                               {m.isPublished === false && <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center"><span className="text-[9px] font-black text-white bg-slate-900 px-2 py-0.5 rounded-full uppercase tracking-widest">非公開</span></div>}
                               <img src={m.thumbnailUrl || getMaterialThumbnail(m.category)} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="text-left"><h4 className="font-black text-slate-800 text-lg text-left">{m.title}</h4><div className="flex flex-wrap gap-2 mt-2 text-left"><span className="bg-slate-100 text-slate-500 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter text-left">{MATERIAL_CATEGORIES.find(c => c.id === m.category)?.label || m.category || (m.tags && m.tags[0])}</span></div><a href={m.url} target="_blank" className="text-orange-600 text-xs font-black flex items-center gap-1 mt-4 hover:underline text-left uppercase">Open <LinkIcon size={12} /></a></div>
                          </div>
                          <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all text-left">
                            <button onClick={() => { setEditingMaterial(m); setMaterialForm({ ...m, category: m.category || 'scratch', isPublished: m.isPublished !== false }); window.scrollTo(0,0); }} className="p-2 bg-slate-50 text-slate-400 hover:text-orange-600 transition-colors"><Edit2 size={14} /></button>
                            <button onClick={() => deleteMaterial(m.id)} className="p-2 bg-slate-50 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14} /></button>
                          </div>
                        </div>
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

              {/* 振り返り項目管理 */}
              {currentUser.role === 'admin' && activeTab === 'reflections' && (
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
                            {reflectionTemplate.filter(i => (i.category || 'goal') === category).map((item, idx) => (
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
                            {reflectionTemplate.filter(i => (i.category || 'goal') === category).length === 0 && <p className="text-slate-400 text-xs font-bold py-4 pl-2">項目がまだありません</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 先生の確認・コメント一覧（管理者側） */}
              {currentUser.role === 'admin' && activeTab === 'records' && (
                <div className="space-y-8 animate-in fade-in duration-500 text-left">
                  <header className="flex justify-between items-end">
                    <div>
                      <h2 className="text-2xl font-black tracking-tight text-left text-slate-800">生徒の提出シート一覧</h2>
                    </div>
                  </header>

                  <div className="space-y-6">
                    {learningRecords.length === 0 ? (
                      <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">提出記録はありません</div>
                    ) : (
                      learningRecords.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()).map(record => (
                        <div key={record.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm text-left p-6 md:p-8">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="flex-1 space-y-4">
                              <div className="flex items-center gap-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black tracking-widest uppercase ${record.recordType === 'goal' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                                  {record.recordType === 'goal' ? '目標シート' : '振り返りシート'}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">{new Date(record.date).toLocaleDateString()}</span>
                              </div>
                              <h4 className="text-xl font-black text-slate-800">{record.title} <span className="text-sm font-medium text-slate-400 ml-2">by {record.studentName}</span></h4>

                              {/* 回答の表示ロジックは生徒側と同じ */}
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
                                    <a href={record.linkUrl} target="_blank" className="text-xs font-bold text-orange-600 hover:underline">作品リンク</a>
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="md:w-80 shrink-0 bg-[#FFF5F0] rounded-2xl p-5 border border-orange-100 flex flex-col justify-between">
                              <div>
                                <h5 className="text-[10px] font-black text-orange-600 uppercase tracking-widest mb-3 flex items-center gap-1.5"><MessageSquare size={12} /> 講師コメント</h5>
                                {record.comment ? (
                                  <p className="text-sm font-bold text-slate-700 leading-relaxed italic mb-4">"{record.comment}"</p>
                                ) : null}
                              </div>
                              <div className="mt-auto">
                                <textarea
                                  placeholder="コメントを入力..."
                                  value={adminComment[record.id] || ''}
                                  onChange={e => setAdminComment({ ...adminComment, [record.id]: e.target.value })}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium h-20 resize-none outline-none focus:ring-2 focus:ring-orange-500 mb-2"
                                />
                                <button
                                  onClick={() => submitAdminComment(record.id)}
                                  className="w-full bg-slate-900 text-white text-[10px] font-black py-2.5 rounded-xl transition-all hover:bg-orange-600 active:scale-95 uppercase tracking-widest"
                                >
                                  送信する
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {/* --- Student / Parent Layout --- */}
      {(currentUser.role === 'student' || currentUser.role === 'parent') && (
        <div className="flex flex-col min-h-screen bg-[#FFFDF8] w-full relative">
          {/* Mobile Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 bg-slate-900/50 z-40 md:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* ポップで親しみやすいヘッダー */}
          <nav className="bg-white border-b-4 border-orange-400 sticky top-0 z-40 px-4 shrink-0 shadow-sm transition-all duration-300">
            <div className="max-w-4xl mx-auto flex items-center justify-between h-20">
              <div className="flex items-center gap-3">
                <button 
                  className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu size={24} />
                </button>
                <div className="bg-orange-500 p-2.5 rounded-2xl text-white shadow-md transform -rotate-3 hidden sm:block"><Calculator size={24} /></div>
                <span className="font-black text-xl tracking-tight text-slate-800">クリエット！</span>
              </div>
              <div className="hidden md:flex items-center gap-3">
                <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-2xl">
                  <button
                    onClick={() => {
                      setActiveTab('mypage');
                      const allIds = announcements.map(a => a.id);
                      setReadAnnouncementIds(allIds);
                      localStorage.setItem('readAnnouncements', JSON.stringify(allIds));
                    }}
                    className={`relative px-4 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'mypage' ? 'bg-orange-500 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-white'}`}
                  >
                    マイページ
                    {announcements.filter(a => !readAnnouncementIds.includes(a.id)).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                        {announcements.filter(a => !readAnnouncementIds.includes(a.id)).length}
                      </span>
                    )}
                  </button>
                  <button onClick={() => setActiveTab('materials')} className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'materials' ? 'bg-sky-500 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-white'}`}>きょうざいを見る</button>
                  {currentUser.role === 'student' && (
                    <button onClick={() => setActiveTab('game')} className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${activeTab === 'game' ? 'bg-violet-500 text-white shadow-md scale-105' : 'text-slate-500 hover:bg-white'}`}>🎮 ゲームで遊ぶ</button>
                  )}
                </div>
                <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors ml-2 bg-slate-100 p-2.5 rounded-full"><LogOut size={20} /></button>
              </div>
            </div>
          </nav>

          {/* Mobile Menu Sidebar */}
          <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 shadow-xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100">
               <span className="font-black text-xl tracking-tight text-slate-800 flex items-center gap-2"><div className="bg-orange-500 p-2 rounded-xl text-white shadow-sm transform -rotate-3"><Calculator size={20} /></div>クリエット！</span>
              <button className="text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl" onClick={() => setIsMobileMenuOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
               <button onClick={() => { setActiveTab('mypage'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'mypage' ? 'bg-orange-100 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}>マイページ</button>
               <button onClick={() => { setActiveTab('materials'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'materials' ? 'bg-sky-100 text-sky-600' : 'text-slate-500 hover:bg-slate-50'}`}>きょうざいを見る</button>
               {currentUser.role === 'student' && (
                 <button onClick={() => { setActiveTab('game'); setIsMobileMenuOpen(false); }} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black transition-all ${activeTab === 'game' ? 'bg-violet-100 text-violet-600' : 'text-slate-500 hover:bg-slate-50'}`}>🎮 ゲームで遊ぶ</button>
               )}
            </div>
            <div className="p-4 border-t border-slate-100">
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-black hover:bg-slate-50 text-rose-500 rounded-xl transition-all"><LogOut size={18} /> ログアウト</button>
            </div>
          </aside>

          <main className="flex-grow max-w-4xl w-full mx-auto p-4 md:p-6 space-y-8 text-left text-slate-900">
            {saveMessage && <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-bounce text-left"><CheckCircle2 size={18} className="text-emerald-400" /><span className="text-sm font-bold">{saveMessage}</span></div>}

            {/* 受講生・保護者向け: マイページ */}
            {(currentUser.role === 'student' || currentUser.role === 'parent') && activeTab === 'mypage' && (
              <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500 text-left text-slate-900">
                <header className="flex flex-col md:flex-row justify-between items-start gap-6 text-left">
                  <div className="text-left">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                      <h2 className="text-3xl font-black tracking-tight text-left text-slate-800">{currentUser.name}様 <span className="text-orange-600 font-light ml-2 uppercase">My Portal</span></h2>
                      {currentUser.role === 'parent' && currentUser.allChildren && currentUser.allChildren.length > 1 && (
                        <select 
                          value={currentUser.childId} 
                          onChange={(e) => {
                             const selectedChild = currentUser.allChildren.find(c => c.id === e.target.value);
                             if(selectedChild) {
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
                    <p className="text-slate-400 text-sm font-medium mt-1 text-left">今日学んだことや作品を記録して成長をポートフォリオに残しましょう。</p>
                  </div>
                  <div className="shrink-0">
                    <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xl flex flex-col justify-center"><p className="text-[10px] font-black text-slate-400 uppercase mb-1 flex items-center gap-1.5 tracking-widest"><Clock size={12} className="text-orange-500" /> Next Lesson</p><p className="text-xl font-black text-slate-800 whitespace-nowrap">{currentUser.nextClassDate || '未設定'}</p></div>
                  </div>
                </header>

                {/* --- 新機能: キャラクターと進捗バー --- */}
                {(() => {
                  const loggedInStudent = currentUser.role === 'student' ? students.find(s => s.id === currentUser.studentId) : students.find(s => s.id === currentUser.childId);
                  const completedCount = loggedInStudent?.completedMaterials?.length || 0;
                  const totalMaterials = materials.length > 0 ? materials.length : 1;
                  const progressPercentage = Math.min(100, Math.floor((completedCount / totalMaterials) * 100));
                  const charInfo = getLevelCharacter(progressPercentage);

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
                          <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1">現在のクラス</p>
                          <h3 className={`text-2xl font-black flex items-center justify-center md:justify-start gap-2 ${charInfo.color}`}>
                            {progressPercentage >= 100 ? <Crown size={24} className="text-amber-500"/> : <Sparkles size={20}/>}
                            {charInfo.name}
                          </h3>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                            <span>カリキュラム進捗</span>
                            <span>{completedCount} / {materials.length} 完了 ({progressPercentage}%)</span>
                          </div>
                          <div className="w-full bg-white/50 rounded-full h-4 border border-white/40 overflow-hidden shadow-inner">
                            <div 
                              className="h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r from-orange-400 to-orange-500 relative"
                              style={{ width: `${progressPercentage}%` }}
                            >
                              <div className="absolute top-0 right-0 bottom-0 left-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem] opacity-50"></div>
                            </div>
                          </div>
                          <p className={`text-[10px] font-black tracking-wider text-right ${progressPercentage >= 100 ? 'text-amber-600' : 'text-slate-400'}`}>
                            {progressPercentage >= 100 ? 'コンプリート！すごい！' : 'カリキュラムを完了してレベルアップしよう！'}
                          </p>
                        </div>
                      </div>
                    </div>
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
                      <div className="flex-1">
                        <p className="text-xs font-black uppercase tracking-widest opacity-80 mb-1">✨ 次に挑戦しよう！</p>
                        <h3 className="text-xl font-black leading-tight">{nextMaterial.title}</h3>
                        <p className="text-sm opacity-80 font-medium mt-1">{nextMaterial.category} カリキュラム</p>
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

                {currentUser.role === 'student' && (
                  <div className="bg-white rounded-[2rem] border border-slate-200 shadow-lg p-8 md:p-12">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-600 p-3 rounded-2xl text-white shadow-lg"><BookOpen size={22} /></div>
                        <div>
                          <h3 className="text-xl font-black text-slate-800">学習を記録する</h3>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">今日の目標や振り返りを書いて保存しましょう</p>
                        </div>
                      </div>

                      {/* シート切り替え */}
                      <div className="flex bg-slate-100 p-1.5 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => setNewLearningRecord({ ...newLearningRecord, recordType: 'goal', content: newLearningRecord.goalContent || {} })}
                          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${newLearningRecord.recordType === 'goal' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          目標シート (前)
                        </button>
                        <button
                          type="button"
                          onClick={() => setNewLearningRecord({ ...newLearningRecord, recordType: 'reflection', goalContent: newLearningRecord.content, content: newLearningRecord.reflectionContent || {} })}
                          className={`px-6 py-2.5 rounded-xl text-xs font-black transition-all ${newLearningRecord.recordType === 'reflection' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                          振り返りシート (後)
                        </button>
                      </div>
                    </div>

                    <form onSubmit={submitLearningRecord} className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">授業日 (いつの授業？)</label>
                        <input
                          type="date"
                          value={newLearningRecord.lessonDate || ''}
                          onChange={e => setNewLearningRecord({ ...newLearningRecord, lessonDate: e.target.value })}
                          className={`w-full bg-slate-50 border rounded-2xl px-5 py-3 text-sm font-bold outline-none transition-all ${newLearningRecord.recordType === 'goal' ? 'border-emerald-100 focus:ring-emerald-500' : 'border-slate-200 focus:ring-orange-500'}`}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">タイトル ({newLearningRecord.recordType === 'goal' ? '目標のタイトル' : '振り返りのタイトル'})</label>
                        <input type="text" value={newLearningRecord.title} onChange={e => setNewLearningRecord({ ...newLearningRecord, title: e.target.value })} className={`w-full bg-slate-50 border rounded-2xl px-5 py-4 text-base font-bold outline-none transition-all ${newLearningRecord.recordType === 'goal' ? 'border-emerald-100 focus:ring-emerald-500' : 'border-slate-200 focus:ring-orange-500'}`} placeholder={newLearningRecord.recordType === 'goal' ? "例: 今日はScratchでゲームを完成させる！" : "例: Scratchでアニメーションを作った！"} required />
                      </div>
                      {reflectionTemplate.filter(i => i.category === newLearningRecord.recordType).length > 0 ? (
                        reflectionTemplate.filter(i => i.category === newLearningRecord.recordType).map(item => (
                          <div key={item.id}>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{item.title}</label>
                            <textarea value={newLearningRecord.content[item.id] || ''} onChange={e => setNewLearningRecord({ ...newLearningRecord, content: { ...newLearningRecord.content, [item.id]: e.target.value } })} className={`w-full bg-slate-50 border rounded-2xl px-5 py-4 text-sm font-medium h-24 resize-none outline-none transition-all leading-relaxed ${newLearningRecord.recordType === 'goal' ? 'border-emerald-100 focus:ring-emerald-500' : 'border-slate-200 focus:ring-orange-500'}`} placeholder={`${item.title}を入力してください`} required />
                          </div>
                        ))
                      ) : (
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">{newLearningRecord.recordType === 'goal' ? '今日の目標・やりたいこと' : '今日学んだこと・感想'}</label>
                          <textarea value={newLearningRecord.content['default'] || ''} onChange={e => setNewLearningRecord({ ...newLearningRecord, content: { ...newLearningRecord.content, default: e.target.value } })} className={`w-full bg-slate-50 border rounded-2xl px-5 py-4 text-sm font-medium h-48 resize-none outline-none transition-all leading-relaxed ${newLearningRecord.recordType === 'goal' ? 'border-emerald-100 focus:ring-emerald-500' : 'border-slate-200 focus:ring-orange-500'}`} placeholder={newLearningRecord.recordType === 'goal' ? "今日はどんなことを学びたいですか？" : "今日はどんなことを学びましたか？難しかったこと、面白かったことを書いてみましょう。"} required />
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">成果物の画像URL（任意）</label>
                          <input type="url" placeholder="https://..." value={newLearningRecord.imageUrl} onChange={e => setNewLearningRecord({ ...newLearningRecord, imageUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">作品リンク (Canva等・任意)</label>
                          <input type="url" placeholder="https://..." value={newLearningRecord.linkUrl} onChange={e => setNewLearningRecord({ ...newLearningRecord, linkUrl: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-orange-500 transition-all" />
                        </div>
                      </div>
                      <button type="submit" className={`w-full text-white font-black py-5 rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 text-base uppercase tracking-widest ${newLearningRecord.recordType === 'goal' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-orange-600 hover:bg-orange-700'}`}>
                        <Save size={20} /> {newLearningRecord.recordType === 'goal' ? '目標を保存する' : '振り返りを保存する'}
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

                {/* メッセージ機能 (受講生・保護者用) */}
                {(() => {
                   const studentIdContext = currentUser.role === 'student' ? currentUser.studentId : currentUser.childId;
                   const studentMessages = messages.filter(m => m.studentId === studentIdContext);
                   return (
                     <div className="space-y-6">
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
                                    <p className="text-[9px] text-right mt-2 opacity-70 font-bold">{msg.createdAt ? new Date(msg.createdAt.toMillis()).toLocaleString([], {month:'2-digit', day:'2-digit', hour:'2-digit', minute:'2-digit'}) : '送信中...'}</p>
                                  </div>
                                </div>
                              );
                            })}
                            {studentMessages.length === 0 && <p className="text-center text-slate-400 font-bold text-xs uppercase tracking-widest mt-20">メッセージはまだありません</p>}
                         </div>
                         <form onSubmit={(e) => sendMessage(e, 'admin', studentIdContext)} className="flex gap-3 shrink-0 pt-4 border-t border-slate-100">
                            <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="メッセージを入力..." className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500" />
                            <button type="submit" className="bg-slate-900 text-white px-6 rounded-xl font-black text-sm tracking-widest uppercase hover:bg-orange-600 transition-colors shadow-md">送信</button>
                         </form>
                       </div>
                     </div>
                   );
                })()}

                {/* 成長の軌跡 */}
                <div className="space-y-6">
                  <h3 className="text-xl font-black text-slate-800 flex items-center gap-3"><ImageIcon size={22} className="text-orange-500" /> 成長の軌跡</h3>
                  <div className="grid grid-cols-1 gap-6">
                    {learningRecords.length === 0
                      ? <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 text-center text-slate-400 font-bold text-xs uppercase tracking-widest">記録が見つかりません</div>
                      : learningRecords.sort((a, b) => b.createdAt?.toMillis() - a.createdAt?.toMillis()).map(record => (
                        <div key={record.id} className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden flex flex-col md:flex-row shadow-sm hover:shadow-md transition-all group">
                          {record.imageUrl && (
                            <div className="md:w-72 h-56 md:h-auto bg-slate-100 flex-shrink-0 overflow-hidden"><img src={record.imageUrl} alt="成果物" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&q=80&w=400'; }} /></div>
                          )}
                          <div className="p-8 flex-1 space-y-5">
                            <div>
                              <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-1 ${record.recordType === 'goal' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                {new Date(record.date).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' })}  |  {record.recordType === 'goal' ? '目標シート' : '振り返りシート'}
                              </p>
                              <h4 className="text-2xl font-black text-slate-800 tracking-tight">{record.title}</h4>
                            </div>

                            {/* 記録内容の表示 */}
                            {typeof record.content === 'object' ? (
                              reflectionTemplate.filter(i => i.category === record.recordType).length > 0 ? (
                                reflectionTemplate.filter(i => i.category === record.recordType).map(item => record.content[item.id] && (
                                  <div key={item.id} className="mt-4">
                                    <h5 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">{item.title}</h5>
                                    <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap bg-slate-50 p-4 rounded-xl">{record.content[item.id]}</p>
                                  </div>
                                ))
                              ) : (
                                <div className="mt-4">
                                  <p className="text-sm text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">{record.content['default'] || Object.values(record.content)[0]}</p>
                                </div>
                              )
                            ) : (
                              <p className="text-sm text-slate-500 leading-relaxed font-medium whitespace-pre-wrap">{record.content}</p>
                            )}

                            {/* リンク・ファイルの表示 */}
                            {record.linkUrl && (
                              <div className="mt-4 flex items-center gap-2">
                                <LinkIcon size={16} className={record.recordType === 'goal' ? 'text-emerald-500' : 'text-orange-500'} />
                                <a href={record.linkUrl} target="_blank" className={`text-sm font-bold hover:underline ${record.recordType === 'goal' ? 'text-emerald-600' : 'text-orange-600'}`}>作品リンクを見る</a>
                              </div>
                            )}

                            {record.comment && <div className={`mt-4 border p-5 rounded-2xl ${record.recordType === 'goal' ? 'bg-emerald-50/70 border-emerald-100' : 'bg-orange-50/70 border-orange-100'}`}><div className={`flex items-center gap-2 font-black text-[10px] uppercase tracking-widest mb-2 ${record.recordType === 'goal' ? 'text-emerald-600' : 'text-orange-600'}`}><MessageSquare size={12} /> 講師コメント</div><p className="text-sm text-slate-700 font-bold italic leading-relaxed">"{record.comment}"</p></div>}

                            {/* 保護者コメントセクション */}
                            {(currentUser.role === 'parent' || (currentUser.role === 'student' && record.parentComment)) && (
                              <div className="mt-4 bg-sky-50 border border-sky-100 rounded-2xl p-4">
                                <div className="flex items-center gap-2 font-black text-[10px] uppercase tracking-widest mb-2 text-sky-600"><MessageSquare size={12} /> 保護者コメント</div>
                                {record.parentComment && <p className="text-sm text-slate-700 font-bold italic mb-3">"{record.parentComment}"</p>}
                                {currentUser.role === 'parent' && (
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      placeholder="応援メッセージを送ろう！"
                                      value={parentComment[record.id] || ''}
                                      onChange={e => setParentComment({ ...parentComment, [record.id]: e.target.value })}
                                      className="flex-1 bg-white border border-sky-200 rounded-xl px-3 py-2 text-sm font-medium outline-none focus:ring-2 focus:ring-sky-400"
                                    />
                                    <button
                                      onClick={async () => {
                                        try {
                                          await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'learning_records', record.id), { parentComment: parentComment[record.id] || '' });
                                          setSaveMessage('保護者コメントを送信しました');
                                          setTimeout(() => setSaveMessage(''), 3000);
                                        } catch(e) { setSaveMessage('送信失敗'); }
                                      }}
                                      className="bg-sky-500 text-white font-bold px-4 py-2 rounded-xl text-xs hover:bg-sky-600 transition-colors"
                                    >送信</button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    }
                  </div>
                </div>
              </div>
            )}

            {/* タイピングゲーム (生徒のみ) */}
            {currentUser.role === 'student' && activeTab === 'game' && (() => {
              const studentData = students.find(s => s.id === currentUser.studentId);
              const completedCount = studentData?.completedMaterials?.length || 0;
              return (
                <div className="space-y-6 animate-in fade-in duration-500">
                  <header>
                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">🎮 タイピングバトル</h2>
                    <p className="text-sm text-slate-500 font-medium mt-1">カリキュラムをこなしてキャラクターを強くしよう！</p>
                  </header>
                  <TypingGame
                    studentId={currentUser.studentId}
                    completedCount={completedCount}
                    totalMaterials={materials.length || 1}
                  />
                </div>
              );
            })()}

            {/* 教材一覧 (受講生・保護者用) */}
            {(currentUser.role === 'student' || currentUser.role === 'parent') && activeTab === 'materials' && (
              <div className="space-y-8 text-left animate-in fade-in duration-500">
                <header className="text-left"><h2 className="text-2xl font-black text-slate-800 tracking-tight text-left">教材・リソースライブラリ</h2></header>
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
                                    className="font-black text-slate-800 text-lg mb-4 flex-1 cursor-pointer hover:text-orange-600 transition-colors line-clamp-2"
                                    onClick={(e) => handleMaterialOpen(e, m)}
                                  >
                                    {m.title}
                                  </h4>
                                  
                                  {currentUser.role === 'student' && (() => {
                                    // Get all requests for this material by this student
                                    const studentReqs = completionRequests.filter(r => r.studentId === currentUser.studentId && r.materialId === m.id);
                                    // Find latest pending or rejected
                                    const hasPending = studentReqs.some(r => r.status === 'pending');
                                    const hasRejected = studentReqs.some(r => r.status === 'rejected') && !hasPending && !isCompleted;
                                    
                                    let buttonState = {
                                      bg: 'bg-slate-100 text-slate-500 hover:bg-orange-600 hover:text-white border border-slate-200 hover:border-transparent hover:shadow-lg',
                                      icon: <Star size={18} />,
                                      text: 'カリキュラムを完了',
                                      disabled: false
                                    };
                                    
                                    if (isCompleted) {
                                      buttonState = {
                                        bg: 'bg-emerald-100 text-emerald-600 border border-emerald-200 shadow-inner cursor-default',
                                        icon: <CheckCircle2 size={18} />,
                                        text: '完了！クリア',
                                        disabled: true
                                      };
                                    } else if (hasPending) {
                                      buttonState = {
                                        bg: 'bg-amber-100 text-amber-600 border border-amber-200 shadow-inner cursor-default',
                                        icon: <Clock size={18} />,
                                        text: '承認待ち',
                                        disabled: true
                                      };
                                    } else if (hasRejected) {
                                       buttonState = {
                                         bg: 'bg-rose-100 text-rose-600 border border-rose-200 hover:bg-rose-500 hover:text-white hover:border-transparent shadow-sm',
                                         icon: <Menu size={18} />, // or another icon like AlertCircle
                                         text: '再挑戦して提出!',
                                         disabled: false
                                       };
                                    }

                                    return (
                                      <>
                                        {hasRejected && <p className="text-[10px] text-rose-500 font-bold mb-1 text-center animate-pulse">先生から差し戻しがありました確認してね</p>}
                                        <button
                                          onClick={(e) => { if (!buttonState.disabled) toggleMaterialComplete(e, m.id) }}
                                          disabled={buttonState.disabled}
                                          className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest transition-all duration-300 ${buttonState.bg}`}
                                        >
                                          {buttonState.icon}
                                          {buttonState.text}
                                        </button>
                                      </>
                                    );
                                  })()}
                                  {currentUser.role === 'parent' && (
                                    <div className={`w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2 text-sm font-black uppercase tracking-widest border ${
                                      isCompleted ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-slate-50 text-slate-400 border-slate-200'
                                    }`}>
                                      {isCompleted ? <CheckCircle2 size={18} /> : <div className="w-2 h-2 rounded-full bg-slate-300" />}
                                      {isCompleted ? '学習完了済' : '未完了'}
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
                  
                  {materials.filter(m => m.isPublished !== false).length === 0 && (
                    <div className="py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                      現在、公開されている教材はありません
                    </div>
                  )}
                </div>
              </div>
            )}
          </main>

          <footer className="shrink-0 mt-12 py-8 text-center text-slate-400 text-xs font-bold tracking-widest bg-white rounded-t-3xl border-t-4 border-slate-100 mx-4">
            クリエット プログラミング
          </footer>
        </div>
      )}

      {/* YouTube 動画モーダル */}
      {youtubeModal && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setYoutubeModal(null)}
        >
          <div
            className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl w-full max-w-4xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">YouTube</span>
                <h3 className="text-white font-bold text-base truncate max-w-lg">{youtubeModal.title}</h3>
              </div>
              <button
                onClick={() => setYoutubeModal(null)}
                className="flex items-center gap-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-colors"
              >
                <X size={14} /> 閉じる
              </button>
            </div>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={youtubeModal.embedUrl}
                title={youtubeModal.title}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}

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