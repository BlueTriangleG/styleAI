import Image from "next/image";
import styles from "./index.module.scss";

export function Hero() {
  return (
    <main className={styles.hero} style={{ paddingTop: "5rem" }}>
      <div className={styles.container}>
        <div className={styles.content}>
          <h1>
            Generate your outfits
            <br />
            Using <span className={styles.highlight}>STYLE-AI</span>
          </h1>
          <button className={styles.startButton}>
            Start
          </button>
        </div>
        <div className={styles.imageGrid}>

        </div>
      </div>
    </main>
  );
}