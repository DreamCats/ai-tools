import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Theme } from '../../domain/theme/types';

export const GlassCard = styled(motion.div)<{ theme: Theme }>`
  background: ${({ theme }) => theme.colors.surface};
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: ${({ theme }) => theme.shadows.medium};
  border: 1px solid ${({ theme }) => theme.colors.border};
  transition: all 0.3s ease;
`; 