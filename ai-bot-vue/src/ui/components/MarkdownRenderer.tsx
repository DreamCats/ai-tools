import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';
import styled from '@emotion/styled';
import { Theme } from '../../domain/theme/types';

const MarkdownContainer = styled.div<{ theme: Theme }>`
  font-size: 14px;
  line-height: 1.6;
  
  p {
    margin: 0.5em 0;
  }

  code {
    background: ${({ theme }) => `${theme.colors.primary}15`};
    padding: 0.2em 0.4em;
    border-radius: 3px;
    font-family: monospace;
    font-size: 0.9em;
  }

  pre {
    margin: 1em 0;
    border-radius: 6px;
    background: none !important;
    
    code {
      background: none;
      padding: 0;
    }
  }

  blockquote {
    margin: 1em 0;
    padding-left: 1em;
    border-left: 4px solid ${({ theme }) => theme.colors.border};
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  ul, ol {
    margin: 0.5em 0;
    padding-left: 1.5em;
  }

  table {
    border-collapse: collapse;
    margin: 1em 0;
    
    th, td {
      border: 1px solid ${({ theme }) => theme.colors.border};
      padding: 0.5em;
    }
  }
`;

interface MarkdownRendererProps {
  content: string;
  theme: Theme;
}

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, theme }) => {
  return (
    <MarkdownContainer theme={theme}>
      <ReactMarkdown
        components={{
          code: ({ node, inline, className, children, ...props }: CodeProps) => {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={tomorrow}
                language={match[1]}
                PreTag="div"
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {content}
      </ReactMarkdown>
    </MarkdownContainer>
  );
}; 