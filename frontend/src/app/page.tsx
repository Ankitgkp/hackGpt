import { ChatContainer } from "@/components/chat/ChatContainer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col text-foreground">
      <ChatContainer />
    </main>
  );
}
