import { ChatContainer } from "@/components/chat/ChatContainer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-background text-foreground">
      <ChatContainer />
    </main>
  );
}
