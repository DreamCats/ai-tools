export interface Theme {
  primary: string;
  secondary: string;
  background: string;
}

export interface UIState {
  theme: Theme;
  isLoading: boolean;
} 