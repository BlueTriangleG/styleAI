import Link from 'next/link';
import styles from './index.module.scss';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>Style-AI</div>
        <nav className={styles['nav-links']}>
          <Link href="/login" className={styles.loginButton}>
            Login
          </Link>
        </nav>
      </div>
    </header>
  );
}
