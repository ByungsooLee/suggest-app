import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { TechoClient } from "./techo-client";

export default async function TechoPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  return <TechoClient />;
}
