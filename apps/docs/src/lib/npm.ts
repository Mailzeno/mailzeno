export async function getPackageVersions(pkg: string) {
  const res = await fetch(`https://registry.npmjs.org/${pkg}`, {
    next: { revalidate: 3600 }, // cache 1 hour
  });

  if (!res.ok) {
    throw new Error("Failed to fetch npm data");
  }

  const data = await res.json();

  const versions = Object.keys(data.versions);

  // Latest first
  return versions.sort((a, b) => (a > b ? -1 : 1));
}