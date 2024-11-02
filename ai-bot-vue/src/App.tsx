import React, { useState, useEffect } from 'react';
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
import { AnimatePresence } from 'framer-motion';
import { motion } from 'framer-motion';

const AppContainer = styled.div<{ theme: Theme }>`
  min-height: 100vh;
  display: flex;
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;
  position: relative;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const MobileOverlay = styled(motion.div)<{ theme: Theme }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 90;
  backdrop-filter: blur(4px);

  @media (max-width: 768px) {
    display: block;
  }
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
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSessionListVisible, setIsSessionListVisible] = useState(true);
  
  const theme = themeMode === 'light' ? lightTheme : darkTheme;
  const currentSession = sessions.find(s => s.id === currentSessionId);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      // 在移动端时总是显示主内容
      if (window.innerWidth <= 768) {
        setIsSessionListVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // 初始化时调用一次
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <AnimatePresence>
          {isSessionListVisible && (
            <MobileOverlay
              theme={theme}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSessionListVisible(false)}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          <SessionList
            theme={theme}
            sessions={sessions}
            currentSessionId={currentSessionId}
            onSelectSession={(id) => {
              setCurrentSession(id);
              if (isMobile) {
                setIsSessionListVisible(false);
              }
            }}
            onNewSession={() => {
              handleNewSession();
              if (isMobile) {
                setIsSessionListVisible(false);
              }
            }}
            onDeleteSession={deleteSession}
            onRenameSession={renameSession}
            isMobile={isMobile}
            isVisible={isSessionListVisible}
            onToggleVisibility={() => setIsSessionListVisible(!isSessionListVisible)}
          />
        </AnimatePresence>
        <MainContent>
          {currentSession ? (
            <ChatWindow
              theme={theme}
              session={currentSession}
              onSendMessage={handleSendMessage}
              isLoading={isLoading}
              isMobile={isMobile}
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