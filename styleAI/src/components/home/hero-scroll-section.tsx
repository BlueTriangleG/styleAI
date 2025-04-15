'use client';

import React from 'react';
import { ContainerScroll } from '@/components/ui/container-scroll-animation';
import Image from 'next/image';

export function HeroScrollSection() {
  return (
    <ContainerScroll titleComponent={<></>}>
      <Image
        src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1770&auto=format&fit=crop"
        alt="hero"
        height={720}
        width={1400}
        className="mx-auto rounded-2xl object-cover h-full object-left-top"
        draggable={false}
      />
    </ContainerScroll>
  );
}
