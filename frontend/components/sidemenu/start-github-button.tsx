import { GithubStarsButton } from "../cui-buton/github-stars/github-stars";

export const dynamic = "force-static";

export default function StarCuicuiGithubButton() {
  return (
    <GithubStarsButton className="inline-flex w-full h-fit" href={"https://github.com/mdkaifansari04/vibeplan"} title="Star Vibeplan on GitHub" starNumber={0}>
      View Code on GitHub
    </GithubStarsButton>
  );
}
