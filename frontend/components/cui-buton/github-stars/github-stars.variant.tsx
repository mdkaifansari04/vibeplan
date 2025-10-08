"use client";

import { useEffect, useState } from "react";
import { GithubStarsButton } from "./github-stars";

export default function PreviewGithubStars() {
  const [stars, setStars] = useState(0);

  useEffect(() => {
    setTimeout(() => {
      setStars(1024);
    }, 1000);
  }, []);

  return (
    <GithubStarsButton href="https://github.com/damien-schneider/cuicui" starNumber={stars}>
      Star Cuicui on GitHub
    </GithubStarsButton>
  );
}
