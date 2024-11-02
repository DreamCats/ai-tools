import React, { useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme } from '../../domain/theme/types';
import { ChatSession } from '../../domain/chat';
import { ExportUtils } from '../../utils/ExportUtils';

const ExportContainer = styled(motion.div)<{ theme: Theme }>`
  position: relative;
  display: inline-block;
`;

const ExportIcon = styled(motion.button)<{ theme: Theme }>`
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}10`};
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const ExportMenu = styled(motion.div)<{ theme: Theme }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 8px 0;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  min-width: 150px;
  z-index: 1000;
`;

const MenuItem = styled(motion.button)<{ theme: Theme }>`
  width: 100%;
  padding: 8px 16px;
  border: none;
  background: none;
  color: ${({ theme }) => theme.colors.text};
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;

  &:hover {
    background: ${({ theme }) => `${theme.colors.primary}10`};
    color: ${({ theme }) => theme.colors.primary};
  }

  i {
    font-size: 18px;
  }
`;

interface ExportButtonProps {
  theme: Theme;
  session: ChatSession;
}

export const ExportButton: React.FC<ExportButtonProps> = ({
  theme,
  session
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = async (format: 'md' | 'json' | 'txt') => {
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
    const filename = `${session.title}-${timestamp}`;

    switch (format) {
      case 'md':
        ExportUtils.exportToMarkdown(session, `${filename}.md`);
        break;
      case 'json':
        ExportUtils.exportToJSON(session, `${filename}.json`);
        break;
      case 'txt':
        ExportUtils.exportToTXT(session, `${filename}.txt`);
        break;
    }
    setIsOpen(false);
  };

  return (
    <ExportContainer theme={theme}>
      <ExportIcon
        theme={theme}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <i className="material-icons">save_alt</i>
      </ExportIcon>
      <AnimatePresence>
        {isOpen && (
          <ExportMenu
            theme={theme}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <MenuItem theme={theme} onClick={() => handleExport('md')}>
              <i className="material-icons">description</i>
              导出为 Markdown
            </MenuItem>
            <MenuItem theme={theme} onClick={() => handleExport('json')}>
              <i className="material-icons">code</i>
              导出为 JSON
            </MenuItem>
            <MenuItem theme={theme} onClick={() => handleExport('txt')}>
              <i className="material-icons">text_snippet</i>
              导出为文本
            </MenuItem>
          </ExportMenu>
        )}
      </AnimatePresence>
    </ExportContainer>
  );
}; 