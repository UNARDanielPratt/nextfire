import { useState } from "react";

import PostFeed from "../components/postfeed";
import { firestore, postToJSON, fromMillis } from "../lib/firebase";
import { collection, collectionGroup, getDocs, limit, orderBy, query, startAfter, where } from "firebase/firestore";
import Loader from "../components/loader";

const LIMIT = 1;

export async function getServerSideProps(context) {
  const postsCollectionRef = collection(firestore, 'posts');
  const postQuery = query(postsCollectionRef, where('published', '==', true), orderBy('createdAt', 'desc'), limit(LIMIT));

  const posts = await (await getDocs(postQuery)).docs.map((postToJSON));

  return {
    props: { posts }, // will be passed to the page component as props
  };
}

export default function Home(props) {
  const [posts, setPosts] = useState(props.posts);
  const [loading, setLoading] = useState(false);

  const [postsEnd, setPostsEnd] = useState(false);

  const getMorePosts = async () => {
    setLoading(true);
    const last = posts[posts.length - 1];

    const cursor = last == undefined ? 0 : typeof last.createdAt === 'number' ? fromMillis(last.createdAt) : last.createdAt;

    const query = collectionGroup(firestore, 'posts', where('published', '==', true), orderBy('createdAt', 'desc'), startAfter(cursor), limit(LIMIT));

    const newPosts = await (await getDocs(query)).docs.map((doc) => doc.data());

    setPosts(posts.concat(newPosts));
    setLoading(false);

    if (newPosts.length < LIMIT) {
      setPostsEnd(true);
    }
  };  

  return (
    <main>
      <PostFeed posts={posts} />

      {!loading && !postsEnd && <button onClick={getMorePosts}>Load more</button>}
      
      <Loader show={loading} />

      {postsEnd && 'You have reached the end!'}
    </main>
  )
}
