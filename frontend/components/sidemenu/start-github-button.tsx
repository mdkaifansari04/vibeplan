import { GithubStarsButton } from "../cui-buton/github-stars/github-stars";

export const dynamic = "force-static";

export default async function StarCuicuiGithubButton() {
  const apiGithub = "https://api.github.com/repos/damien-schneider/cuicui";

  const githubRepoData = await fetch(apiGithub).then((res) => res.json());
  const numberOfStars = githubRepoData.stargazers_count;

  return (
    <GithubStarsButton className="inline-flex w-full h-fit" href={""} title="Star Cuicui on GitHub" starNumber={numberOfStars ?? 0}>
      Star Cuicui on GitHub
    </GithubStarsButton>
  );
}
