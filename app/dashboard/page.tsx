import { redirect } from "next/navigation";
import { signOutAction } from "@/app/actions/auth";
import { getCurrentUser } from "@/lib/insforge/server";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const name = user.profile?.name || user.email.split("@")[0];

  return (
    <main className="dashboard-shell">
      <header className="dashboard-header">
        <a className="dashboard-brand" href="/dashboard">Agent Social Media</a>
        <form action={signOutAction}>
          <button className="dashboard-signout" type="submit">Sign out</button>
        </form>
      </header>
      <section className="dashboard-content">
        <p className="auth-eyebrow">Your workspace</p>
        <h1>Welcome, {name}</h1>
        <p>You’re signed in as {user.email}.</p>
      </section>
    </main>
  );
}
