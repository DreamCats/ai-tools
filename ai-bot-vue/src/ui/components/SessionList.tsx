import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { ChatSession } from '../../domain/chat';
import { Theme } from '../../domain/theme/types';

const SessionContainer = styled(motion.div)<{ theme: Theme }>`
  width: 250px;
  background: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(10px);
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  padding: 20px;
  height: 100%;
  transition: all 0.3s ease;
`;

const SessionItem = styled(motion.div)<{ active: boolean; theme: Theme }>`
  padding: 12px;
  margin: 8px 0;
  border-radius: 8px;
  cursor: pointer;
  background: ${({ active, theme }) => 
    active ? `${theme.colors.primary}15` : 'transparent'};
  color: ${({ theme }) => theme.colors.text};
  
  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}10`};
  }
`;

const NewSessionButton = styled(motion.button)<{ theme: Theme }>`
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => `${theme.colors.primary}33`};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}10`};
    border-color: ${({ theme }) => theme.colors.primary};
  }
`;

const SessionItemContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SessionActions = styled.div<{ theme: Theme }>`
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s;
  
  ${SessionItem}:hover & {
    opacity: 1;
  }
`;

const ActionButton = styled.button<{ theme: Theme }>`
  background: none;
  border: none;
  padding: 4px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: 4px;
  
  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}10`};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const EditInput = styled.input<{ theme: Theme }>`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => `${theme.colors.primary}33`};
  background: ${({ theme }) => theme.colors.inputBackground};
  color: ${({ theme }) => theme.colors.text};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => `${theme.colors.primary}33`};
  }
`;

const SessionInfo = styled.div<{ theme: Theme }>`
  div {
    color: ${({ theme }) => theme.colors.text};
  }
  
  small {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

const containerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2
    }
  }
};

interface SessionListProps {
  theme: Theme;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewSession: () => void;
  onDeleteSession: (sessionId: string) => void;
  onRenameSession: (sessionId: string, title: string) => void;
}

export const SessionList: React.FC<SessionListProps> = ({
  theme,
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onRenameSession
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (session: ChatSession) => {
    setEditingId(session.id);
    setEditTitle(session.title);
  };

  const handleFinishEdit = () => {
    if (editingId && editTitle.trim()) {
      onRenameSession(editingId, editTitle.trim());
    }
    setEditingId(null);
  };

  return (
    <SessionContainer
      theme={theme}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <NewSessionButton
        theme={theme}
        onClick={onNewSession}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <i className="material-icons" style={{ marginRight: '8px' }}>add</i>
        新建会话
      </NewSessionButton>
      
      <AnimatePresence mode="popLayout">
        {sessions.map(session => (
          <SessionItem
            key={session.id}
            theme={theme}
            active={session.id === currentSessionId}
            onClick={() => onSelectSession(session.id)}
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            layout
          >
            <SessionItemContent>
              {editingId === session.id ? (
                <EditInput
                  theme={theme}
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onBlur={handleFinishEdit}
                  onKeyPress={(e) => e.key === 'Enter' && handleFinishEdit()}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                />
              ) : (
                <>
                  <SessionInfo theme={theme}>
                    <div>{session.title}</div>
                    <small>
                      {new Date(session.updatedAt).toLocaleString()}
                    </small>
                  </SessionInfo>
                  <SessionActions theme={theme} onClick={(e) => e.stopPropagation()}>
                    <ActionButton 
                      theme={theme}
                      onClick={() => handleStartEdit(session)}
                    >
                      <i className="material-icons">edit</i>
                    </ActionButton>
                    <ActionButton 
                      theme={theme}
                      onClick={() => onDeleteSession(session.id)}
                    >
                      <i className="material-icons">delete</i>
                    </ActionButton>
                  </SessionActions>
                </>
              )}
            </SessionItemContent>
          </SessionItem>
        ))}
      </AnimatePresence>
    </SessionContainer>
  );
}; 