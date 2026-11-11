import StudioShell from "@/components/studio/StudioShell";
import { loadStudio } from "@/lib/server-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await loadStudio();
  return <StudioShell data={data} />;
}
