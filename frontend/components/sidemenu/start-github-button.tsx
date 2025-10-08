import { GithubStarsButton } from "../cui-buton/github-stars/github-stars";

export const dynamic = "force-static";

export default async function StarCuicuiGithubButton() {
  const apiGithub = "https://api.github.com/repos/mdkaifansari04/vibeplan";
  try {
    const githubRepoData = await fetch(apiGithub, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    }).then((res) => res.json());
    const numberOfStars = githubRepoData.stargazers_count ?? 0;

    return (
      <GithubStarsButton className="inline-flex w-full h-fit" href={"https://github.com/mdkaifansari04/vibeplan"} title="Star Vibeplan on GitHub" starNumber={numberOfStars}>
        View Code on GitHub
      </GithubStarsButton>
    );
  } catch (error) {
    // Fallback if API call fails
    return (
      <GithubStarsButton className="inline-flex w-full h-fit" href={"https://github.com/mdkaifansari04/vibeplan"} title="Star Vibeplan on GitHub" starNumber={0}>
        View Code on GitHub
      </GithubStarsButton>
    );
  }
}
