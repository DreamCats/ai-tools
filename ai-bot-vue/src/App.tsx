import React, { useState } from 'react';
import styled from '@emotion/styled';
import { ThemeProvider } from '@emotion/react';
import { ChatWindow } from './ui/components/ChatWindow';
import { SessionList } from './ui/components/SessionList';
import { ThemeToggle } from './ui/components/ThemeToggle';
import { useChatStore } from './application/store';
import { v4 as uuidv4 } from 'uuid';
import { Message, ChatSession } from './domain/chat';
import { Theme, lightTheme, darkTheme } from './domain/theme/types';
import { ChatService } from './domain/chat/ChatService';
import { Toast } from './ui/components/Toast';

const AppContainer = styled.div<{ theme: Theme }>`
  min-height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
`;

const App: React.FC = () => {
  const { 
    sessions, 
    currentSessionId, 
    themeMode,
    toggleTheme,
    isLoading,
    setLoading,
    addSession, 
    deleteSession,
    renameSession,
    setCurrentSession, 
    addMessage,
    deleteMessage
  } = useChatStore();
  
  const [error, setError] = useState<string | null>(null);
  
  const theme = themeMode === 'light' ? lightTheme : darkTheme;
  const currentSession = sessions.find(s => s.id === currentSessionId);

  const handleNewSession = () => {
    const newSession: ChatSession = {
      id: uuidv4(),
      title: `新会话 ${sessions.length + 1}`,
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    addSession(newSession);
    setCurrentSession(newSession.id);
  };

  const handleSendMessage = async (content: string) => {
    if (!currentSessionId) return;
    
    setLoading(true);
    setError(null);
    
    const userMessage: Message = {
      id: uuidv4(),
      content,
      role: 'user',
      timestamp: Date.now()
    };
    addMessage(currentSessionId, userMessage);

    try {
      const currentMessages = sessions.find(s => s.id === currentSessionId)?.messages || [];
      
      // 创建缓冲区
      let buffer = '';
      const bufferDelay = 300; // 300ms 的缓冲延迟
      let bufferTimeout: NodeJS.Timeout | null = null;
      let aiMessageId: string | null = null;

      const createMessage = () => {
        if (!aiMessageId && buffer.trim()) {
          aiMessageId = uuidv4();
          const aiMessage: Message = {
            id: aiMessageId,
            content: buffer,
            role: 'assistant',
            timestamp: Date.now()
          };
          addMessage(currentSessionId, aiMessage);
        }
      };

      const updateMessage = () => {
        if (aiMessageId) {
          const updatedMessage: Message = {
            id: aiMessageId,
            content: buffer,
            role: 'assistant',
            timestamp: Date.now()
          };
          deleteMessage(currentSessionId, aiMessageId);
          addMessage(currentSessionId, updatedMessage);
        }
      };

      await ChatService.sendMessage(
        [...currentMessages, userMessage],
        (chunk) => {
          buffer += chunk;

          // 清除之前的定时器
          if (bufferTimeout) {
            clearTimeout(bufferTimeout);
          }

          // 如果消息还没创建，设置延迟创建
          if (!aiMessageId) {
            bufferTimeout = setTimeout(() => {
              createMessage();
            }, bufferDelay);
          } else {
            // 如果消息已存在，设置延迟更新
            bufferTimeout = setTimeout(() => {
              updateMessage();
            }, 50); // 更新的延迟可以短一些
          }
        }
      );

      // 确保最后一次更新被应用
      if (bufferTimeout) {
        clearTimeout(bufferTimeout);
      }
      if (!aiMessageId) {
        createMessage();
      } else {
        updateMessage();
      }

    } catch (error) {
      console.error('Chat error:', error);
      setError(error instanceof Error ? error.message : '发送消息失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer theme={theme}>
        <SessionList
          theme={theme}
          sessions={sessions}
          currentSessionId={currentSessionId}
          onSelectSession={setCurrentSession}
          onNewSession={handleNewSession}
          onDeleteSession={deleteSession}
          onRenameSession={renameSession}
        />
        <MainContent>
          {currentSession ? (
            <ChatWindow
              theme={theme}
              session={currentSession}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
            />
          ) : (
            <div>请选择或创建一个会话</div>
          )}
        </MainContent>
        <ThemeToggle theme={theme} onToggle={toggleTheme} />
        {error && (
          <Toast
            message={error}
            type="error"
            theme={theme}
            onClose={() => setError(null)}
          />
        )}
      </AppContainer>
    </ThemeProvider>
  );
};

export default App; 