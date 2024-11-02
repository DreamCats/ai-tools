import React from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Theme } from '../../domain/theme/types';

const ToggleButton = styled(motion.button)<{ theme: Theme }>`
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text};
  cursor: pointer;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: white;
  }
`;

interface ThemeToggleProps {
  theme: Theme;
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <ToggleButton
      theme={theme}
      onClick={onToggle}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
    >
      <i className="material-icons">
        {theme.mode === 'light' ? 'dark_mode' : 'light_mode'}
      </i>
    </ToggleButton>
  );
}; 