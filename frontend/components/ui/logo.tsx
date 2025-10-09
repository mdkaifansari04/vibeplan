import Link from "next/link";
import React from "react";

function Logo() {
  return (
    <Link href="/" aria-label="home" className="flex gap-2 items-center">
      <p className="font-semibold text-xl tracking-tighter">
        Vibe<span className="text-[#ea6d74]">plan</span>
      </p>
    </Link>
  );
}

export default Logo;
