import { ChangelogTimeline } from "./ChangelogTimeline";

async function getVersions() {
  const res = await fetch(
    "https://registry.npmjs.org/@mailzeno/client",
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return Object.keys(data.versions).sort((a, b) =>
    a > b ? -1 : 1
  );
}

export default async function ChangelogWrapper() {
  const versions = await getVersions();
  return <ChangelogTimeline versions={versions} />;
}