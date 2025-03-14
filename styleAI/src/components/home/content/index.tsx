'use client';

import Image from 'next/image';
import styles from './index.module.scss';
import { useRouter } from 'next/navigation';

export function Hero() {
  const router = useRouter();

  const handleStartClick = () => {
    router.push('/personalized-recommendation/step1');
  };

  return (
    <main className={styles.hero} style={{ paddingTop: '5rem' }}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1>
            Generate your outfits
            <br />
            Using <span className={styles.highlight}>STYLE-AI</span>
          </h1>
          <button className={styles.startButton} onClick={handleStartClick}>
            Start
          </button>
        </div>
        <div className={styles.imageGrid}></div>
      </div>
    </main>
  );
}
