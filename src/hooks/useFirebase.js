import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  limit,
  doc,
  orderBy
} from 'firebase/firestore';
import { db, appId } from '../firebase';

export default function useFirebase(currentUser, activeStudentDetail) {
  const [data, setData] = useState({
    students: [],
    learningRecords: [],
    announcements: [],
    materials: [],
    reflectionTemplate: [],
    completionRequests: [],
    messages: [],
    sb3Files: [],
    loading: true
  });

  const [storageUsage, setStorageUsage] = useState({ isWarning: false, usedBytes: 0 });

  // Main data subscriptions (re-run when user role changes)
  useEffect(() => {
    if (!currentUser) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const unsubscribers = [];
    const isStudentOrParent = currentUser.role === 'student' || currentUser.role === 'parent';
    const isStudent = currentUser.role === 'student';
    const isAdmin = currentUser.role === 'admin';
    const studentIdCtx = isStudentOrParent
      ? (currentUser.role === 'student' ? currentUser.studentId : currentUser.childId)
      : null;

    let resolvedCount = 0;
    const TOTAL_SUBSCRIPTIONS = isStudent ? 8 : isAdmin ? 7 : 7;
    const onResolved = () => {
      resolvedCount++;
      if (resolvedCount >= TOTAL_SUBSCRIPTIONS) {
        setData(prev => ({ ...prev, loading: false }));
      }
    };

    const errHandler = (err) => {
      console.error('[useFirebase] onSnapshot error:', err.message);
      onResolved(); // unblock loading even on error
    };

    // 1. Students
    if (isStudentOrParent) {
      const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentIdCtx), (docSnap) => {
        setData(prev => ({
          ...prev,
          students: docSnap.exists() ? [{ id: docSnap.id, ...docSnap.data() }] : []
        }));
        onResolved();
      }, errHandler);
      unsubscribers.push(unsub);
    } else if (isAdmin) {
      const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'students'), (snap) => {
        setData(prev => ({ ...prev, students: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
        onResolved();
      }, errHandler);
      unsubscribers.push(unsub);
    }

    // 2. Announcements
    const unsubAnnounce = onSnapshot(
      query(collection(db, 'artifacts', appId, 'public', 'data', 'announcements'), orderBy('createdAt', 'desc'), limit(50)),
      (snap) => {
        setData(prev => ({ ...prev, announcements: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
        onResolved();
      }, errHandler
    );
    unsubscribers.push(unsubAnnounce);

    // 3. Learning Records
    const learningQuery = isStudentOrParent
      ? query(collection(db, 'artifacts', appId, 'public', 'data', 'learning_records'), where('studentId', '==', studentIdCtx), orderBy('createdAt', 'desc'), limit(100))
      : query(collection(db, 'artifacts', appId, 'public', 'data', 'learning_records'), orderBy('createdAt', 'desc'), limit(200));
    const unsubLearning = onSnapshot(learningQuery, (snap) => {
      setData(prev => ({ ...prev, learningRecords: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      onResolved();
    }, errHandler);
    unsubscribers.push(unsubLearning);

    // 4. Materials
    const unsubMaterials = onSnapshot(
      query(collection(db, 'artifacts', appId, 'public', 'data', 'materials'), orderBy('createdAt', 'desc')),
      (snap) => {
        setData(prev => ({ ...prev, materials: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
        onResolved();
      }, errHandler
    );
    unsubscribers.push(unsubMaterials);

    // 5. Reflection Template
    const unsubReflections = onSnapshot(
      query(collection(db, 'artifacts', appId, 'public', 'data', 'reflection_template'), orderBy('order', 'asc')),
      (snap) => {
        setData(prev => ({ ...prev, reflectionTemplate: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
        onResolved();
      }, errHandler
    );
    unsubscribers.push(unsubReflections);

    // 6. Completion Requests
    const completionQuery = isStudentOrParent
      ? query(collection(db, 'artifacts', appId, 'public', 'data', 'completion_requests'), where('studentId', '==', studentIdCtx))
      : collection(db, 'artifacts', appId, 'public', 'data', 'completion_requests');
    const unsubCompletion = onSnapshot(completionQuery, (snap) => {
      setData(prev => ({ ...prev, completionRequests: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      onResolved();
    }, errHandler);
    unsubscribers.push(unsubCompletion);

    // 7. Messages
    const msgsQuery = isStudentOrParent
      ? query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), where('studentId', '==', studentIdCtx), orderBy('createdAt', 'asc'), limit(100))
      : query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), orderBy('createdAt', 'asc'), limit(200));
    const unsubMessages = onSnapshot(msgsQuery, (snap) => {
      setData(prev => ({
        ...prev,
        messages: snap.docs.map(d => ({ id: d.id, ...d.data() })),
        loading: false
      }));
      onResolved();
    }, errHandler);
    unsubscribers.push(unsubMessages);

    // 8. Student's own sb3 files
    if (isStudent) {
      const unsub = onSnapshot(
        collection(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId, 'sb3_files'),
        (snap) => {
          setData(prev => ({ ...prev, sb3Files: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
          onResolved();
        }, errHandler
      );
      unsubscribers.push(unsub);
    }

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [currentUser]);

  // Admin sb3Files subscription — updates when selected student changes
  useEffect(() => {
    if (!currentUser || currentUser.role !== 'admin') return;
    if (!activeStudentDetail) {
      setData(prev => ({ ...prev, sb3Files: [] }));
      return;
    }
    const unsub = onSnapshot(
      collection(db, 'artifacts', appId, 'public', 'data', 'students', activeStudentDetail, 'sb3_files'),
      (snap) => {
        setData(prev => ({
          ...prev,
          sb3Files: snap.docs.map(d => ({ id: d.id, studentId: activeStudentDetail, ...d.data() }))
        }));
      }
    );
    return () => unsub();
  }, [activeStudentDetail, currentUser]);

  return {
    ...data,
    storageUsage,
    setStorageUsage
  };
}
