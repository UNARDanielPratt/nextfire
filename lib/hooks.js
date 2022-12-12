import { auth, firestore } from '../lib/firebase'
import { useEffect, useState } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { doc, getDoc } from 'firebase/firestore';

// Custom hook to read  auth record and user profile doc
export function useUserData() {
  const [user] = useAuthState(auth);
  const [username, setUsername] = useState(null);

  useEffect(() => {
    if (user) {
      const fetchUserData = async () => {
        const ref = doc(firestore, 'users', user.uid) //firestore.collection('users').doc(user.uid);
        const docSnap = await getDoc(ref);
        if (docSnap.exists()) {
          setUsername(docSnap.data()?.username);
        }
      }

      fetchUserData()
      .catch(console.error);
    } else {
      setUsername(null);
    }

  }, [user]);

  return { user, username };
}