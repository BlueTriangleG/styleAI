"use client";

import Link from "next/link";
import styles from "./index.module.scss";
import { UserButton, SignInButton, SignUpButton, SignedIn, SignedOut } from "@clerk/nextjs";

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>Style-AI</div>
        <nav className={styles["nav-links"]}>
          <Link href="/dashboard">Dashboard</Link>
          
          <SignedIn>
            {/* Only shown when user is signed in */}
            <Link href="/settings">Settings</Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          
          <SignedOut>
            {/* Only shown when user is signed out */}
            <SignInButton mode="modal">
              <button className={styles.authButton}>Sign In</button>
            </SignInButton>
            
            <SignUpButton mode="modal">
              <button className={styles.authButton}>Sign Up</button>
            </SignUpButton>
          </SignedOut>
        </nav>
      </div>
    </header>
  );
}