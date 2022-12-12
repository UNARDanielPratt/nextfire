import { firestore, getUserWithUsername, postToJSON } from "../../lib/firebase";
import UserProfile from "../../components/userprofile"
import PostFeed from "../../components/postfeed"
import { getDocs, orderBy, where, limit, query as fsquery, collection } from "firebase/firestore";

export async function getServerSideProps({ query }) {
    const { username } = query;
  
    const userDoc = await getUserWithUsername(username);

    if (!userDoc) {
      return {
        notFound: true,
      };
    }
  
    // JSON serializable data
    let user = null;
    let posts = null;
  
    if (userDoc) {
      user = userDoc.data();
      const postsCollection = collection(userDoc.ref, 'posts');
      const postsQuery = fsquery(postsCollection, where('published', '==', true), orderBy('createdAt', 'desc'), limit(5))
      posts = await (await getDocs(postsQuery)).docs.map(postToJSON);
    }
  
    return {
      props: { user, posts }, // will be passed to the page component as props
    };
  }

export default function UserProfilePage({ user, posts }) {
    return (
        <main>
            <UserProfile user={user} />
            <PostFeed posts={posts} />
        </main>
    )
}