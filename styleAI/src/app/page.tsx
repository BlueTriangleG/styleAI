import Image from "next/image";
import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/content";

export default function Home() {
  return (
    <div className="h-screen overflow-hidden">
      <Header />
      <Hero />
    </div>
  );
}
