import { redirect } from "next/navigation";

import { ChatShell } from "./chat-shell";
import { auth } from "nvn/server/auth";

export default async function ChatIndexPage() {
  const session = await auth();

  const isGuest = !session?.user;

  return <ChatShell initialChatId={null} isGuest={isGuest} />;
}

