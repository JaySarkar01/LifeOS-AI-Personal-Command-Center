import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";

export async function getSessionUserId(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return session.user.id;
    }
    return null;
  } catch (err) {
    console.error("Error retrieving session user ID:", err);
    return null;
  }
}
