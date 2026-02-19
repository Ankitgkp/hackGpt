export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: Date
}

export interface Session {
  id: string
  title: string
  createdAt: Date
  updatedAt: Date
}
