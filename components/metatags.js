import Head from 'next/head';

export default function Metatags({
    title = 'The Full Next.js + Firebase Course',
    description = 'An amazing blogging website',
    image = 'https://fireship.io/courses/react-next-firebase/img/featured.png',
}) {
  return (
    <Head>
        <title>{title}</title>
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:image" content={image} />
    </Head>
  );
}