export interface Message {
  id: string
  content: string
  type: 'user' | 'assistant'
  timestamp: number
  files?: Array<{
    type: 'image' | 'file'
    url: string
    name: string
  }>
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: number
  updatedAt: number
} 