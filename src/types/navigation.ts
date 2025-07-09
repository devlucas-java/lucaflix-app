// types/navigation.ts
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  MediaDetail: { 
    mediaId: string; 
    mediaType: 'movie' | 'series' | 'anime';
    title?: string;
  };
  AdminDashboard: undefined;
};

export type TabParamList = {
  Home: undefined;
  Movies: undefined;
  Series: undefined;
  Animes: undefined;
  Search: { query?: string };
  MyList: undefined;
  Profile: undefined;
};

// Hooks de navegação tipados
import { NavigationProp, RouteProp } from '@react-navigation/native';

export type RootStackNavigationProp = NavigationProp<RootStackParamList>;
export type TabNavigationProp = NavigationProp<TabParamList>;

export type MediaDetailRouteProp = RouteProp<RootStackParamList, 'MediaDetail'>;
export type SearchRouteProp = RouteProp<TabParamList, 'Search'>;

// Tipos para temas
export interface Theme {
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    error: string;
    success: string;
    warning: string;
    accent: string;
  };
}

// Tipos para autenticação
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user?: {
    id: string;
    email: string;
    name: string;
    isAdmin?: boolean;
  };
}