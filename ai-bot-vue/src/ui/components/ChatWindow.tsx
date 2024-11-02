import React, { useEffect, useRef, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { ChatSession } from '../../domain/chat';
import { Theme } from '../../domain/theme/types';
import { ExportButton } from './ExportButton';
import { MarkdownRenderer } from './MarkdownRenderer';

const ChatContainer = styled(GlassCard)<{ theme: Theme; isMobile?: boolean }>`
  width: 80%;
  max-width: 800px;
  height: 70vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.3s ease;

  @media (max-width: 768px) {
    width: 100%;
    height: calc(100vh - 20px);
    border-radius: 0;
  }
`;

const MessageList = styled.div<{ theme: Theme }>`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 768px) {
    padding: 10px;
  }
`;

const MessageBubble = styled(motion.div)<{ isUser: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  flex-direction: ${props => props.isUser ? 'row-reverse' : 'row'};
  margin: 16px 0;
  padding: 0 12px;
`;

const Avatar = styled(motion.div)<{ isUser: boolean; theme: Theme }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.isUser ? '#4CAF50' : '#2196F3'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 20px;
  flex-shrink: 0;
`;

const BubbleContent = styled.div<{ isUser: boolean; theme: Theme }>`
  background: ${({ isUser, theme }) => 
    isUser ? theme.colors.userBubble : theme.colors.botBubble};
  padding: 12px 16px;
  border-radius: 12px;
  max-width: 70%;
  position: relative;
  box-shadow: ${({ theme }) => theme.shadows.small};
  border: 1px solid ${({ isUser, theme }) => 
    isUser ? theme.colors.userBubbleBorder : theme.colors.botBubbleBorder};
  color: ${({ theme }) => theme.colors.text};
  transition: all 0.3s ease;

  &::before {
    content: '';
    position: absolute;
    top: 12px;
    ${props => props.isUser ? 'right: -8px' : 'left: -8px'};
    width: 0;
    height: 0;
    border-top: 8px solid transparent;
    border-bottom: 8px solid transparent;
    ${({ isUser, theme }) => isUser
      ? `border-left: 8px solid ${theme.colors.userBubble};`
      : `border-right: 8px solid ${theme.colors.botBubble};`}
  }

  @media (max-width: 768px) {
    max-width: 85%;
  }
`;

const InputArea = styled.div<{ theme: Theme }>`
  padding: 20px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  transition: all 0.3s ease;
`;

const Input = styled.textarea<{ theme: Theme }>`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.inputBorder};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  resize: none;
  font-size: 14px;
  transition: all 0.3s ease;
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 3px ${({ theme }) => `${theme.colors.primary}33`};
    transform: translateY(-1px);
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const MessageTime = styled.div<{ theme: Theme }>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
`;

const MessageContent = styled(motion.div)`
  word-break: break-word;
  transform-origin: left center;
  position: relative;
  padding-right: 40px;
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const SendButton = styled(motion.button)<{ theme: Theme }>`
  position: absolute;
  right: 12px;
  bottom: 12px;
  padding: 8px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  transition: background 0.3s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.secondary};
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.textSecondary};
    cursor: not-allowed;
  }

  i {
    font-size: 20px;
  }
`;

const TypingIndicator = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  margin: 8px 0;
`;

const TypingDot = styled(motion.div)`
  width: 6px;
  height: 6px;
  background: #4CAF50;
  border-radius: 50%;
`;

const ActionIcon = styled(motion.button)<{ theme: Theme }>`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  opacity: 0.6;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    opacity: 1;
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => `${theme.colors.primary}10`};
    border-radius: 4px;
  }

  &:active {
    transform: scale(0.95);
  }

  i {
    font-size: 16px;
  }
`;

const ActionContainer = styled.div<{ theme: Theme }>`
  position: absolute;
  right: 0;
  top: 0;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s;
  padding: 4px;
  border-radius: 4px;
  background: ${({ theme }) => `${theme.colors.surface}80`};
  backdrop-filter: blur(4px);

  ${MessageContent}:hover & {
    opacity: 1;
  }
`;

// 添加复制成功的动画组件
const CopyFeedback = styled(motion.div)<{ theme: Theme }>`
  position: absolute;
  right: -20px;
  top: -20px;
  background: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  pointer-events: none;
  white-space: nowrap;
`;

// 添加打字机效果组件
const TypewriterText: React.FC<{ content: string; theme: Theme }> = ({ content, theme }) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showMarkdown, setShowMarkdown] = useState(false);
  const [showCopyFeedback, setShowCopyFeedback] = useState(false);

  useEffect(() => {
    if (currentIndex < content.length && !isPaused) {
      const timer = setTimeout(() => {
        setDisplayedContent(prev => prev + content[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, 20);

      return () => clearTimeout(timer);
    } else if (currentIndex >= content.length && !isComplete) {
      setIsComplete(true);
      setTimeout(() => {
        setShowMarkdown(true);
      }, 300);
    }
  }, [content, currentIndex, isPaused, isComplete]);

  // 当内容改变时重置状态
  useEffect(() => {
    setDisplayedContent('');
    setCurrentIndex(0);
    setIsComplete(false);
    setIsPaused(false);
  }, [content]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setShowCopyFeedback(true);
      setTimeout(() => setShowCopyFeedback(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handlePauseResume = () => {
    setIsPaused(!isPaused);
  };

  const handleComplete = () => {
    setDisplayedContent(content);
    setCurrentIndex(content.length);
    setIsComplete(true);
  };

  return (
    <div style={{ position: 'relative' }}>
      <div style={{ position: 'relative', minHeight: '24px' }}>
        <AnimatePresence mode="wait">
          {showMarkdown ? (
            <motion.div
              key="markdown"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              <MarkdownRenderer content={displayedContent} theme={theme} />
            </motion.div>
          ) : (
            <motion.div
              key="plaintext"
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {displayedContent}
              {!isComplete && (
                <motion.span
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  style={{ marginLeft: '2px' }}
                >
                  |
                </motion.span>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <ActionContainer theme={theme}>
        <ActionIcon 
          theme={theme} 
          onClick={handleCopy} 
          title="复制内容"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <i className="material-icons">
            {showCopyFeedback ? 'check' : 'content_copy'}
          </i>
          <AnimatePresence>
            {showCopyFeedback && (
              <CopyFeedback
                theme={theme}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                已复制
              </CopyFeedback>
            )}
          </AnimatePresence>
        </ActionIcon>
        {!isComplete && (
          <>
            <ActionIcon 
              theme={theme} 
              onClick={handlePauseResume} 
              title={isPaused ? "继续" : "暂停"}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className="material-icons">
                {isPaused ? 'play_arrow' : 'pause'}
              </i>
            </ActionIcon>
            <ActionIcon 
              theme={theme} 
              onClick={handleComplete} 
              title="显示完整内容"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <i className="material-icons">skip_next</i>
            </ActionIcon>
          </>
        )}
      </ActionContainer>
    </div>
  );
};

interface ChatWindowProps {
  theme: Theme;
  session: ChatSession;
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  isMobile?: boolean;
}

const messageVariants = {
  initial: (isUser: boolean) => ({
    opacity: 0,
    x: isUser ? 20 : -20,
    y: 0,
    scale: 0.95
  }),
  animate: {
    opacity: 1,
    x: 0,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.8
    }
  },
  exit: (isUser: boolean) => ({
    opacity: 0,
    x: isUser ? 20 : -20,
    scale: 0.95,
    transition: {
      duration: 0.15,
      ease: "easeOut"
    }
  })
};

const contentVariants = {
  initial: { opacity: 0.5, y: 5 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  }
};

export const ChatWindow: React.FC<ChatWindowProps> = ({ 
  theme,
  session,
  onSendMessage,
  isLoading,
  isMobile = false
}) => {
  const [input, setInput] = React.useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      await onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <ChatContainer theme={theme} isMobile={isMobile}>
      <div style={{ 
        padding: '10px 20px',
        borderBottom: `1px solid ${theme.colors.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>{session.title}</div>
        <ExportButton 
          theme={theme}
          session={session}
        />
      </div>
      <MessageList 
        theme={theme} 
        ref={chatContainerRef}
        data-export-container
      >
        <AnimatePresence mode="popLayout">
          {session.messages.map((message) => (
            <MessageBubble
              key={message.id}
              isUser={message.role === 'user'}
              custom={message.role === 'user'}
              variants={messageVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              layout
              layoutId={message.id}
            >
              <Avatar 
                isUser={message.role === 'user'}
                theme={theme}
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 20
                }}
              >
                <i className="material-icons">
                  {message.role === 'user' ? 'person' : 'smart_toy'}
                </i>
              </Avatar>
              <BubbleContent isUser={message.role === 'user'} theme={theme}>
                <MessageContent
                  variants={contentVariants}
                  initial="initial"
                  animate="animate"
                  key={`${message.id}-${message.content.length}`}
                >
                  {message.role === 'assistant' ? (
                    <TypewriterText content={message.content} theme={theme} />
                  ) : (
                    message.content
                  )}
                </MessageContent>
                <MessageTime theme={theme}>
                  {new Date(message.timestamp).toLocaleTimeString()}
                </MessageTime>
              </BubbleContent>
            </MessageBubble>
          ))}
          {isLoading && (
            <TypingIndicator
              theme={theme}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut"
              }}
            >
              {[0, 1, 2].map((i) => (
                <TypingDot
                  key={i}
                  theme={theme}
                  animate={{
                    y: ["0%", "-50%", "0%"],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.15,
                  }}
                />
              ))}
            </TypingIndicator>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </MessageList>
      <InputArea theme={theme}>
        <form onSubmit={handleSubmit}>
          <InputContainer>
            <Input
              ref={inputRef}
              theme={theme}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="输入消息... (Shift + Enter 换行, Enter 发送)"
              rows={3}
            />
            <SendButton
              theme={theme}
              type="submit"
              disabled={!input.trim() || isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <i className="material-icons">send</i>
            </SendButton>
          </InputContainer>
        </form>
      </InputArea>
    </ChatContainer>
  );
}; 