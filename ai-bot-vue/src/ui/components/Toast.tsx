import React from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme } from '../../domain/theme/types';

const ToastContainer = styled(motion.div)<{ theme: Theme; type?: 'error' | 'success' }>`
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: ${({ theme, type }) => 
    type === 'error' ? '#ef4444' : theme.colors.primary};
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  z-index: 1000;
`;

interface ToastProps {
  message: string;
  type?: 'error' | 'success';
  theme: Theme;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, theme, onClose }) => {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {message && (
        <ToastContainer
          theme={theme}
          type={type}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
        >
          {message}
        </ToastContainer>
      )}
    </AnimatePresence>
  );
}; 