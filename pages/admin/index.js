import styles from '../../styles/Admin.module.css';

import { collection, doc, query, orderBy, setDoc } from 'firebase/firestore';
import AuthCheck from '../../components/authcheck';
import { PostItem } from '../../components/postfeed';
import { auth, firestore, serverTimestamp } from '../../lib/firebase';

import { UserContext } from '../../lib/context';
import { useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { useCollection } from 'react-firebase-hooks/firestore';
import kebabCase from 'lodash.kebabcase';
import { toast } from 'react-hot-toast';

export default function AdminPostsPage(props) {
  return (
    <main>
      <AuthCheck>
        <PostList />
        <CreateNewPost />
      </AuthCheck>
    </main>
  );
}

function PostList() {
    const ref = collection(firestore, 'users', auth.currentUser.uid, 'posts');
    const postQuery = query(ref, orderBy('createdAt'));

    const [querySnapshot] = useCollection(postQuery);

    const posts = querySnapshot?.docs.map((doc) => doc.data());
    
    return (
        <>
            <h1>Manage your posts</h1>
            {/* <PostFeed posts={posts} admin /> */}
            {posts && posts.map((post) => <PostItem post={post} key={post.slug} admin={true} />)}
        </>
    )
}

function CreateNewPost() {
    const router = useRouter();
    const { username } = useContext(UserContext);
    const [title, setTitle] = useState('');

    const slug = encodeURI(kebabCase(title));
    const isValid = title.length > 3 && title.length < 100;

    const createPost = async (e) => {
        e.preventDefault();
        const uid = auth.currentUser.uid;
        const ref = doc(firestore, 'users', uid, 'posts', slug);

        const data = {
            title,
            slug,
            uid,
            username,
            published: false,
            content: '# hello world!',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            heartCount: 0,
        };

        await setDoc(ref, data);

        toast.success('Post created!');
        router.push(`/admin/${slug}`);
    }

    return (
        <form onSubmit={createPost}>
            <input
                value={title}
                onChange={(e)=> setTitle(e.target.value)}
                placeholder="My Awesome Article!"
                className={styles.input}
            />

            <p>
                <strong>Slug:</strong> {slug}
            </p>

        </form>
    )
}