import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/insforge/server";

export default async function Home() {
  const user = await getCurrentUser();
  redirect(user ? "/dashboard" : "/signin");
}
