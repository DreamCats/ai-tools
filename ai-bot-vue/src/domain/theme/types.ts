export type ThemeMode = 'light' | 'dark';

export interface Theme {
  mode: ThemeMode;
  colors: {
    background: string;
    surface: string;
    primary: string;
    secondary: string;
    text: string;
    textSecondary: string;
    border: string;
    userBubble: string;
    userBubbleBorder: string;
    botBubble: string;
    botBubbleBorder: string;
    inputBackground: string;
    inputBorder: string;
  };
  shadows: {
    small: string;
    medium: string;
    large: string;
  };
}

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e9f2 100%)',
    surface: 'rgba(255, 255, 255, 0.7)',
    primary: '#4CAF50',
    secondary: '#2196F3',
    text: '#2c3e50',
    textSecondary: '#64748b',
    border: 'rgba(0, 0, 0, 0.1)',
    userBubble: '#E8F5E9',
    userBubbleBorder: '#C8E6C9',
    botBubble: '#ffffff',
    botBubbleBorder: 'rgba(0, 0, 0, 0.1)',
    inputBackground: 'rgba(255, 255, 255, 0.9)',
    inputBorder: 'rgba(76, 175, 80, 0.2)',
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.05)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.05)',
    large: '0 10px 15px rgba(0, 0, 0, 0.1)',
  },
};

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background: 'linear-gradient(135deg, #1a1c2c 0%, #222b45 100%)',
    surface: 'rgba(30, 34, 47, 0.7)',
    primary: '#81C784',
    secondary: '#64B5F6',
    text: '#e2e8f0',
    textSecondary: '#94a3b8',
    border: 'rgba(255, 255, 255, 0.1)',
    userBubble: '#2E7D32',
    userBubbleBorder: '#1B5E20',
    botBubble: '#1e222f',
    botBubbleBorder: 'rgba(255, 255, 255, 0.1)',
    inputBackground: 'rgba(30, 34, 47, 0.9)',
    inputBorder: 'rgba(129, 199, 132, 0.2)',
  },
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.2)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.2)',
    large: '0 10px 15px rgba(0, 0, 0, 0.3)',
  },
};