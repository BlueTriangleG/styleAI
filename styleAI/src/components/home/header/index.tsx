import Link from "next/link";
import styles from "./index.module.scss";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>Style-AI</div>
        <nav className={styles["nav-links"]}>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/login">Login</Link>
          <Link href="/settings">Setting</Link>
        </nav>
      </div>
    </header>
  );
}