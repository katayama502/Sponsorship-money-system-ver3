import { db, storage } from '../firebase';
import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch, 
  serverTimestamp,
  getDoc,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { generateCredentials } from '../utils/authUtils';

export default function useAdminActions({ 
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
  setEditingMaterial, 
  editingMaterial,
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
}) {

  const saveStudent = async (e) => {
    e.preventDefault();
    const { name, studentLoginId, studentPassword, parentLoginId, parentPassword } = studentForm;
    if (!name || (!studentForm.id && (!studentLoginId || !studentPassword || !parentLoginId || !parentPassword))) {
      alert('必須項目を入力してください');
      return;
    }

    try {
      if (studentForm.id) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentForm.id), {
          ...studentForm, updatedAt: serverTimestamp()
        });
        setSaveMessage('受講生情報を更新しました');
      } else {
        const creds = generateCredentials(name);
        const finalForm = {
          ...studentForm,
          studentLoginId: studentLoginId || creds.student.id,
          studentPassword: studentPassword || creds.student.pw,
          parentLoginId: parentLoginId || creds.parent.id,
          parentPassword: parentPassword || creds.parent.pw,
          xp: 0, points: 0, inventory: [], equipped: { weapon: null, armor: null, accessory: null },
          createdAt: serverTimestamp()
        };
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), finalForm);
        setGeneratedCreds({
          name,
          student: { id: finalForm.studentLoginId, pw: finalForm.studentPassword },
          parent: { id: finalForm.parentLoginId, pw: finalForm.parentPassword }
        });
        setSaveMessage('受講生を登録しました');
      }
      setStudentForm({ name: '', school: '', age: '', remarks: '', nextClassDate: '', studentLoginId: '', studentPassword: '', parentLoginId: '', parentPassword: '', inventory: [], equipped: { weapon: null, armor: null, accessory: null }});
      setEditingStudent(null);
    } catch (err) { setSaveMessage('エラーが発生しました'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const createTestAccount = async () => {
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'students'), {
        name: 'ガチャテスト君', school: 'テスト校', age: 10, studentLoginId: 'test', studentPassword: '777', parentLoginId: 'ptest', parentPassword: '777',
        xp: 5000, points: 10000, inventory: [], equipped: { weapon: null, armor: null, accessory: null }, createdAt: serverTimestamp()
      });
      setSaveMessage('テスト用アカウント(10000pt)を作成しました');
    } catch (err) { setSaveMessage('作成失敗'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const deleteStudentCascade = async (studentId) => {
    if (!window.confirm('この受講生を削除しますか？学習記録やメッセージもすべて削除されます。')) return;
    try {
      const batch = writeBatch(db);
      batch.delete(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId));
      
      // Messages to/from student
      const qMsgs = query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), where('studentId', '==', studentId));
      const snapMsgs = await getDocs(qMsgs);
      snapMsgs.forEach(d => batch.delete(d.ref));
      
      // Learning records
      const qRecs = query(collection(db, 'artifacts', appId, 'public', 'data', 'learning_records'), where('studentId', '==', studentId));
      const snapRecs = await getDocs(qRecs);
      snapRecs.forEach(d => batch.delete(d.ref));

      await batch.commit();
      setSaveMessage('受講生を削除しました');
    } catch (err) { setSaveMessage('削除に失敗しました'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const uploadMaterialFile = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (type === 'doc') setIsUploadingMaterialUpload(true);
    else setIsUploadingMaterialThumbnail(true);

    try {
      const storageRef = ref(storage, `artifacts/${appId}/materials/${type}/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      setMaterialForm(prev => ({ ...prev, [type === 'doc' ? 'url' : 'thumbnailUrl']: url }));
      setSaveMessage('アップロード完了！');
    } catch (err) { setSaveMessage('アップロード失敗'); }
    finally {
      if (type === 'doc') setIsUploadingMaterialUpload(false);
      else setIsUploadingMaterialThumbnail(false);
      setTimeout(() => setSaveMessage(''), 3000);
    }
  };

  const saveMaterial = async (e) => {
    e.preventDefault();
    try {
      if (editingMaterial) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'materials', editingMaterial.id), {
          ...materialForm, updatedAt: serverTimestamp()
        });
        setSaveMessage('教材情報を更新しました');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'materials'), {
          ...materialForm, createdAt: serverTimestamp()
        });
        setSaveMessage('教材を登録しました');
      }
      setMaterialForm({ title: '', url: '', category: 'scratch', thumbnailUrl: '', downloadUrl: '', isPublished: true });
      setEditingMaterial(null);
    } catch (err) { setSaveMessage('保存失敗'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const deleteMaterial = async (id) => {
    if (!window.confirm('この教材を削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'materials', id));
      setSaveMessage('削除しました');
    } catch (err) { setSaveMessage('削除失敗'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const postAnnouncement = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'announcements'), {
        ...announcementForm, createdAt: serverTimestamp()
      });
      setAnnouncementForm({ title: '', content: '', type: 'info' });
      setSaveMessage('お知らせを投稿しました');
    } catch (err) { setSaveMessage('投稿失敗'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const saveReflectionItem = async (e) => {
    e.preventDefault();
    try {
      if (editingReflectionItem) {
        await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'reflection_template', editingReflectionItem), {
          ...reflectionItemForm, updatedAt: serverTimestamp()
        });
        setSaveMessage('項目を更新しました');
      } else {
        await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'reflection_template'), {
          ...reflectionItemForm, order: Date.now(), createdAt: serverTimestamp()
        });
        setSaveMessage('項目を追加しました');
      }
      setReflectionItemForm({ title: '', type: 'textarea', category: 'goal' });
      setEditingReflectionItem(null);
    } catch (err) { setSaveMessage('失敗'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const deleteReflectionItem = async (id) => {
    if (!window.confirm('この項目を削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'reflection_template', id));
      setSaveMessage('削除しました');
    } catch (err) { setSaveMessage('失敗'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const submitAdminComment = async (recordId) => {
    const text = adminComment[recordId];
    if (!text) return;
    try {
      const recordRef = doc(db, 'artifacts', appId, 'public', 'data', 'learning_records', recordId);
      const snap = await getDoc(recordRef);
      const data = snap.data();
      
      const batch = writeBatch(db);
      batch.update(recordRef, { comment: text, commentAt: serverTimestamp(), commentPointed: true });
      
      // Also give student 1 point and 30XP
      if (data.studentId) {
        const sRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', data.studentId);
        const sSnap = await getDoc(sRef);
        const sData = sSnap.exists() ? sSnap.data() : {};
        batch.update(sRef, {
          points: (sData.points || 0) + 1,
          xp: (sData.xp || 0) + 30
        });
      }
      
      await batch.commit();
      setAdminComment(prev => {
        const next = { ...prev };
        delete next[recordId];
        return next;
      });
      setSaveMessage('コメントとポイント(+1pt/30XP)を送信しました');
    } catch (err) { setSaveMessage('失敗'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const approveCompletion = async (requestId, studentId, materialId) => {
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'completion_requests', requestId), {
        status: 'approved', approvedAt: serverTimestamp()
      });
      const sRef = doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId);
      const sSnap = await getDoc(sRef);
      if (sSnap.exists()) {
        const sData = sSnap.data();
        const completed = sData.completedMaterials || [];
        if (!completed.includes(materialId)) {
          await updateDoc(sRef, {
            completedMaterials: [...completed, materialId],
            xp: (sData.xp || 0) + 50
          });
          await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), {
            text: `🎉 カリキュラム完了が承認されました！+50XP獲得！`,
            senderId: 'admin', senderRole: 'admin', senderName: '講師・サポーター',
            receiverId: studentId, studentId, isRead: false, createdAt: serverTimestamp(),
          });
        }
      }
      setSaveMessage('承認しました (+50XP)');
    } catch (err) { setSaveMessage('失敗'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  const rejectCompletion = async (requestId) => {
    if (!window.confirm('差し戻しますか？')) return;
    try {
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'completion_requests', requestId), {
        status: 'rejected', rejectedAt: serverTimestamp()
      });
      setSaveMessage('差し戻しました');
    } catch (err) { setSaveMessage('失敗'); }
    setTimeout(() => setSaveMessage(''), 3000);
  };

  return {
    saveStudent,
    createTestAccount,
    deleteStudentCascade,
    uploadMaterialFile,
    saveMaterial,
    deleteMaterial,
    postAnnouncement,
    saveReflectionItem,
    deleteReflectionItem,
    submitAdminComment,
    approveCompletion,
    rejectCompletion
  };
}
