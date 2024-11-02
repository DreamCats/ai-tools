import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ChatSession, Message } from '../domain/chat';
import { ThemeMode } from '../domain/theme/types';

interface ChatStore {
  sessions: ChatSession[];
  currentSessionId: string | null;
  addSession: (session: ChatSession) => void;
  deleteSession: (sessionId: string) => void;
  renameSession: (sessionId: string, title: string) => void;
  setCurrentSession: (sessionId: string) => void;
  addMessage: (sessionId: string, message: Message) => void;
  deleteMessage: (sessionId: string, messageId: string) => void;
  themeMode: ThemeMode;
  toggleTheme: () => void;
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set) => ({
      sessions: [],
      currentSessionId: null,
      addSession: (session) => 
        set((state) => ({ sessions: [...state.sessions, session] })),
      deleteSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter(s => s.id !== sessionId),
          currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId
        })),
      renameSession: (sessionId, title) =>
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { ...session, title, updatedAt: Date.now() }
              : session
          )
        })),
      setCurrentSession: (sessionId) => 
        set({ currentSessionId: sessionId }),
      addMessage: (sessionId, message) =>
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? { 
                  ...session, 
                  messages: [...session.messages, message],
                  updatedAt: Date.now()
                }
              : session
          )
        })),
      deleteMessage: (sessionId, messageId) =>
        set((state) => ({
          sessions: state.sessions.map(session =>
            session.id === sessionId
              ? {
                  ...session,
                  messages: session.messages.filter(msg => msg.id !== messageId),
                  updatedAt: Date.now()
                }
              : session
          )
        })),
      themeMode: 'light',
      toggleTheme: () =>
        set((state) => ({
          themeMode: state.themeMode === 'light' ? 'dark' : 'light',
        })),
      isLoading: false,
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        sessions: state.sessions,
        currentSessionId: state.currentSessionId,
        themeMode: state.themeMode,
      }),
    }
  )
); 