"use client";

import Image from "next/image";

export default function CPARLogo() {
  return (
    <Image
      className="dark:invert"
      src="/logo.png"
      alt="CPAL"
      width={88}
      height={88}
      priority
    />
  );
}

export function FileLogoMark() {
  return (
    <Image
      className="dark:invert"
      src="/file.svg"
      alt="Globe logomark"
      width={16}
      height={16}
    />
  );
}

export function GlobeLogoMark() {
  return (
    <Image
      className="dark:invert"
      src="/globe.svg"
      alt="Globe logomark"
      width={16}
      height={16}
    />
  );
}
