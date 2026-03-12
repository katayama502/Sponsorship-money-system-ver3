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

export default function useFirebase(currentUser) {
  const [data, setData] = useState({
    students: [],
    learningRecords: [],
    announcements: [],
    materials: [],
    reflectionTemplate: [],
    completionRequests: [],
    messages: [],
    sb3Files: [],
    storageUsage: 0,
    loading: true
  });

  const [storageUsage, setStorageUsage] = useState(0);

  useEffect(() => {
    if (!currentUser) {
      setData(prev => ({ ...prev, loading: false }));
      return;
    }

    const unsubscribers = [];
    const isStudentOrParent = currentUser.role === 'student' || currentUser.role === 'parent';
    const isStudent = currentUser.role === 'student';
    const studentIdCtx = isStudentOrParent 
      ? (currentUser.role === 'student' ? currentUser.studentId : currentUser.childId) 
      : null;

    // --- Subscriptions ---
    
    // 8. SB3 Files (Student specific)
    if (isStudent) {
      const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'students', currentUser.studentId, 'sb3_files'), (snap) => {
        setData(prev => ({ ...prev, sb3Files: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      });
      unsubscribers.push(unsub);
    }

    // 1. Students
    if (isStudentOrParent) {
      const unsub = onSnapshot(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentIdCtx), (docSnap) => {
        setData(prev => ({ 
          ...prev, 
          students: docSnap.exists() ? [{ id: docSnap.id, ...docSnap.data() }] : [] 
        }));
      });
      unsubscribers.push(unsub);
    } else if (currentUser.role === 'admin') {
      const unsub = onSnapshot(collection(db, 'artifacts', appId, 'public', 'data', 'students'), (snap) => {
        setData(prev => ({ ...prev, students: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      });
      unsubscribers.push(unsub);
    }

    // 2. Announcements (Everyone needs this)
    const unsubAnnounce = onSnapshot(
      query(collection(db, 'artifacts', appId, 'public', 'data', 'announcements'), orderBy('createdAt', 'desc'), limit(50)), 
      (snap) => {
        setData(prev => ({ ...prev, announcements: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      }
    );
    unsubscribers.push(unsubAnnounce);

    // 3. Learning Records
    const learningQuery = isStudentOrParent
      ? query(collection(db, 'artifacts', appId, 'public', 'data', 'learning_records'), where('studentId', '==', studentIdCtx), limit(50))
      : query(collection(db, 'artifacts', appId, 'public', 'data', 'learning_records'), limit(100)); // Admin sees more
    const unsubLearning = onSnapshot(learningQuery, (snap) => {
      setData(prev => ({ ...prev, learningRecords: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
    });
    unsubscribers.push(unsubLearning);

    // 4. Materials
    const unsubMaterials = onSnapshot(
      query(collection(db, 'artifacts', appId, 'public', 'data', 'materials'), orderBy('createdAt', 'desc')), 
      (snap) => {
        setData(prev => ({ ...prev, materials: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      }
    );
    unsubscribers.push(unsubMaterials);

    // 5. Reflection Template
    const unsubReflections = onSnapshot(
      query(collection(db, 'artifacts', appId, 'public', 'data', 'reflection_template'), orderBy('createdAt', 'asc')), 
      (snap) => {
        setData(prev => ({ ...prev, reflectionTemplate: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
      }
    );
    unsubscribers.push(unsubReflections);

    // 6. Completion Requests
    const completionQuery = isStudentOrParent
      ? query(collection(db, 'artifacts', appId, 'public', 'data', 'completion_requests'), where('studentId', '==', studentIdCtx))
      : collection(db, 'artifacts', appId, 'public', 'data', 'completion_requests');
    const unsubCompletion = onSnapshot(completionQuery, (snap) => {
      setData(prev => ({ ...prev, completionRequests: snap.docs.map(d => ({ id: d.id, ...d.data() })) }));
    });
    unsubscribers.push(unsubCompletion);

    // 7. Messages
    const msgsQuery = isStudentOrParent
      ? query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), where('studentId', '==', studentIdCtx), limit(50))
      : query(collection(db, 'artifacts', appId, 'public', 'data', 'messages'), limit(100));
    const unsubMessages = onSnapshot(msgsQuery, (snap) => {
      setData(prev => ({ 
        ...prev, 
        messages: snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => (a.createdAt?.toMillis() || 0) - (b.createdAt?.toMillis() || 0)),
        loading: false
      }));
    });
    unsubscribers.push(unsubMessages);

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [currentUser]);

  return {
    ...data,
    storageUsage,
    setStorageUsage
  };
}
