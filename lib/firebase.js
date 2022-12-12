// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from 'firebase/auth';
import { GoogleAuthProvider } from 'firebase/auth';
import { collection, getDocs, getFirestore, query, where, Timestamp, serverTimestamp as sts, increment as inc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCe3N7vH0YTOp89Q6b71w661v5WzyLoLoI",
  authDomain: "nextfire-a51d0.firebaseapp.com",
  projectId: "nextfire-a51d0",
  storageBucket: "nextfire-a51d0.appspot.com",
  messagingSenderId: "794766862569",
  appId: "1:794766862569:web:b1b1be2feeeb164650e878"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleAuthProvider = new GoogleAuthProvider();

export const firestore = getFirestore(app);
export const storage = getStorage(app);

export const fromMillis = Timestamp.fromMillis;
export const serverTimestamp = sts;

export const increment = inc;

/**`
 * Gets a users/{uid} document with username
 * @param  {string} username
 */
 export async function getUserWithUsername(username) {
  const usersRef = collection(firestore, 'users')
  const q = query(usersRef, where('username', '==', username)) //usersRef.where('username', '==', username).limit(1);
  const userDoc = (await getDocs(q)).docs[0];
  return userDoc;
}

/**`
 * Converts a firestore document to JSON
 * @param  {DocumentSnapshot} doc
 */
export function postToJSON(doc) {
  const data = doc.data();
  return {
    ...data,
    createdAt: data.createdAt.toMillis(),
    updatedAt: data.updatedAt.toMillis(),
  };
}