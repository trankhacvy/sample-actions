import { UserGrid } from "@/components/user-grid";

export default async function Home() {
  return (
    <main className="container mx-auto px-4 py-10 md:px-6">
      <UserGrid />
    </main>
  );
}
