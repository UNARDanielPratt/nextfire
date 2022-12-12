import { signInWithPopup } from "firebase/auth";
import { useCallback, useContext, useEffect, useState } from "react";
import { debounce } from "lodash.debounce"

import { auth, firestore, googleAuthProvider } from "../lib/firebase";
import { UserContext } from "../lib/context";
import { async } from "@firebase/util";
import { doc, getDoc, writeBatch } from "firebase/firestore";

export default function Enter(props) {

    const { user, username } = useContext(UserContext);

    // 1. user signed out <SignInButton />
    // 2. user signed in, but missing username <UsernameForm />
    // 3. user signed in, has username <SignOutButton />
    return (
        <main>
            { user ? 
                !username ? <UsernameForm /> : <SignOutButton /> 
                : 
                <SignInButton />
            }
        </main>
    );
}

// Sign in with google button
function SignInButton() {
    const signInWithGoogle = async () => {
        await signInWithPopup(auth, googleAuthProvider);
    };

    return (
        <button className="btn-google" onClick={signInWithGoogle}>
            <img src={'/google.png'} /> Sign in with Google
        </button>
    );
}

// Sign out button
function SignOutButton() {
    return <button onClick={() => auth.signOut()}>Sign Out</button>
}

// enable username creation
function UsernameForm() {
    const [formValue, setFormValue] = useState('');
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(false);

    const { user, username } = useContext(UserContext);

    useEffect(() => {
        checkUsername(formValue);
    }, [formValue]);

    const onChange = (e) => {
        // Force form value typed in form to match correct format
        const val = e.target.value.toLowerCase();
        const re = /^(?=[a-zA-Z0-9._]{3,15}$)(?!.*[_.]{2})[^_.].*[^_.]$/;
    
        // Only set form value if length is < 3 OR it passes regex
        if (val.length < 3) {
          setFormValue(val);
          setLoading(false);
          setIsValid(false);
        }
    
        if (re.test(val)) {
          setFormValue(val);
          setLoading(true);
          setIsValid(false);
        }
    };

    const checkUsername = async(username) => {
        if (username.length >= 3) {
            const docRef = doc(firestore, 'usernames', username);
            const docSnap = await getDoc(docRef);
            setIsValid(!docSnap.exists());
            setLoading(false);
        }
    }

    const onSubmit = async (e) => {
        e.preventDefault();

        // create reference for both documents
        const userDocRef = doc(firestore, 'users', user.uid);
        const usernameDocRef = doc(firestore, 'usernames', formValue);

        const batch = writeBatch(firestore);
        batch.set(userDocRef, { username: formValue, photoURL: user.photoURL, displayName: user.displayName });
        batch.set(usernameDocRef, { uid: user.uid });

        await batch.commit();
    }

    return (
        !username && (
          <section>
            <h3>Choose Username</h3>
            <form onSubmit={onSubmit}>
              <input name="username" placeholder="myname" value={formValue} onChange={onChange} />
              <UsernameMessage username={formValue} isValid={isValid} loading={loading} />
              <button type="submit" className="btn-green" disabled={!isValid}>
                Choose
              </button>
    
              {/* <h3>Debug State</h3>
              <div>
                Username: {formValue}
                <br />
                Loading: {loading.toString()}
                <br />
                Username Valid: {isValid.toString()}
              </div> */}
            </form>
          </section>
        )
    );
}

function UsernameMessage({ username, isValid, loading }) {
    if (loading) {
      return <p>Checking...</p>;
    } else if (isValid) {
      return <p className="text-success">{username} is available!</p>;
    } else if (username && !isValid) {
      return <p className="text-danger">That username is taken!</p>;
    } else {
      return <p></p>;
    }
  }