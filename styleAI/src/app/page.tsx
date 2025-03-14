import Image from "next/image";
import { Header } from "@/components/home/header";
import { Hero } from "@/components/home/content";
import Homepage from "@/components/Homepage";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#E6F4EA]">
      {/* <Header />
      <Hero /> */}
      <Homepage />
    </div>
  );
}
