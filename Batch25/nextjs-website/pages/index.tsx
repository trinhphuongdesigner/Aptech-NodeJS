import Head from 'next/head';
import Image from 'next/image';
import styles from '../styles/Home.module.css';

import cityPicture from '../assets/images/city.jpeg';
import { Button } from '@nextui-org/react';

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main>
        <Image src={cityPicture} alt='Picture of the author' width={300} height={200} />
        <Button>Test</Button>
      </main>
    </div>
  );
}