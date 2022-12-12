import { collection, collectionGroup, doc, getDoc, getDocs } from "firebase/firestore";
import Link from "next/link";
import { useDocumentData } from "react-firebase-hooks/firestore";
import AuthCheck from "../../components/AuthCheck";
import HeartButton from "../../components/heartbutton";
import PostContent from "../../components/postcontent";
import { firestore, getUserWithUsername, postToJSON } from "../../lib/firebase";
import styles from '../../styles/Admin.module.css';

export async function getStaticProps({ params }) {
    const { username, slug } = params;
    const userDoc = await getUserWithUsername(username);

    let post = {
        content: "Hello!",
        createdAt: 3,
        heartCount: 0,
        published: true,
        slug: 'my-first-post',
        title: 'My First Post',
        uid: 'CX5mAaD5f5d7yFstPx0Rje0jCqA3',
        updatedAt: 3,
        username: 'fabrilis',
    };
    let path;

    if (userDoc) {
        const postsRef = collection(userDoc.ref, 'posts');
        const postRef = doc(postsRef, slug);
        post = postToJSON(await getDoc(postRef));

        path = postRef.path;
    }

    return {
        props: { post, path },
        revalidate: 300000,
    };
}

export async function getStaticPaths() {
    const snapshot = await getDocs(collectionGroup(firestore, 'posts'));

    const paths = snapshot.docs.map((doc) => {
        const { slug, username } = doc.data();
        return {
          params: { username, slug },
        };
      });
    
      return {
        paths,
        fallback: 'blocking',
      };
}

export default function Post(props) {

    const postRef = doc(firestore, props.path);
    const [realtimePost] = useDocumentData(postRef);

    const post = realtimePost || props.post;

    return (
        <main className={styles.container}>

            <section>
                <PostContent post={post} />
            </section>
    
            <aside className="card">
                <p>
                    <strong>{post.heartCount || 0} 🤍</strong>
                </p>
                
                <AuthCheck fallback={
                    <Link href='/enter'>
                        <button>💗 Sign Up</button>
                    </Link>
                }>
                    <HeartButton postRef={postRef} />
                </AuthCheck>
            </aside>
      </main>
    );
}