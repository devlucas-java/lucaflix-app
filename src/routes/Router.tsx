// routes/Router.tsx
import React, { useCallback, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, ActivityIndicator } from 'react-native';

// Importar o AuthProvider
import { AuthProvider, useAuthContext } from './AuthProvider';

// Importar suas telas
import SplashScreen from '~/screens/auth/SplashScreen';
import LoginScreen from '~/screens/auth/LoginScreen';
import RegisterScreen from '~/screens/auth/RegisterScreen';
import { HomeScreen } from '~/screens/HomeScreen';
import { MoviesScreen } from '~/screens/MoviesScreen'; // Renomeado para MoviesScreen
import { SeriesScreen } from '~/screens/SeriesScreen'; // Nova tela de séries
import { MediaScreen } from '~/screens/MediaScreen';
import { MyListScreen } from '~/screens/MyListScreen';
import UserProfileScreen from '~/screens/UserProfileScreen';
import SearchScreen from '~/screens/SearchScreen';
import { PlayerScreen } from '~/screens/PlayerScreen';

// Importar o TabBar customizado
import { TabBar } from './headers/TabBar';

import theme from '~/theme/theme';
import type { MediaComplete } from '~/types/mediaTypes';

// Tipos para navegação
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  MediaScreen: {
    media: MediaComplete;
    onBack?: () => void;
  };
  PlayerScreen: {
    media: MediaComplete;
    embedUrl: string;
    episode?: {
      id: number;
      numeroEpisodio: number;
      title: string;
      sinopse: string;
      duracaoMinutos: number;
    };
  };
  AdminDashboard: undefined;
};

export type TabParamList = {
  Home: undefined;
  Movies: undefined; // Nova rota para filmes
  Series: undefined; // Nova rota para séries
  Search: undefined;
  MyList: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Loading Component
const LoadingScreen: React.FC = () => {
  return (
    <View className='bg-background'>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text className='text-primary'>
        Carregando...
      </Text>
    </View>
  );
};

// Componente que verifica autenticação antes de navegar para o perfil
const ProfileScreenWrapper: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  
  if (!isAuthenticated) {
    return <LoginScreen />;
  }
  
  return <UserProfileScreen />;
};

// Componente que verifica autenticação antes de navegar para MyList
const MyListScreenWrapper: React.FC = () => {
  const { isAuthenticated } = useAuthContext();
  
  if (!isAuthenticated) {
    return <LoginScreen />;
  }
  
  return <MyListScreen />;
};

// Main Tab Navigator - Agora com Movies e Series
const MainTabNavigator: React.FC = () => {
  const { isAuthenticated } = useAuthContext();

  // Memorizar o componente TabBar para evitar re-criação
  const renderTabBar = useCallback((props: any) => {
    return (
      <TabBar
        currentRoute={props.state.routes[props.state.index].name}
        onTabPress={(routeName: string) => {
          // Verificar se precisa de autenticação
          if ((routeName === 'Profile' || routeName === 'MyList') && !isAuthenticated) {
            // Se não estiver autenticado, navegar para login
            props.navigation.navigate('Login');
            return;
          }
          
          const event = props.navigation.emit({
            type: 'tabPress',
            target: routeName,
            canPreventDefault: true,
          });
          
          if (!event.defaultPrevented) {
            props.navigation.navigate(routeName as never);
          }
        }}
        isAuthenticated={isAuthenticated}
      />
    );
  }, [isAuthenticated]);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        lazy: true, // Carregamento lazy das tabs
        unmountOnBlur: false, // Manter as tabs em memória
      }}
      tabBar={renderTabBar}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Movies" component={MoviesScreen} />
      <Tab.Screen name="Series" component={SeriesScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen 
        name="MyList" 
        component={MyListScreenWrapper}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreenWrapper}
      />
    </Tab.Navigator>
  );
};

// Stack Navigator interno (dentro do AuthProvider)
const AppStackNavigator: React.FC = () => {
  const { isAuthenticated, isLoading, isInitialized } = useAuthContext();

  // Log para debug
  useEffect(() => {
    if (theme.development) {
      console.log('🎯 AppStackNavigator - Estado atual:', {
        isAuthenticated,
        isLoading,
        isInitialized
      });
    }
  }, [isAuthenticated, isLoading, isInitialized]);

  // Mostrar loading enquanto não inicializado
  if (!isInitialized) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{
        headerShown: false,
        navigationBarColor: theme.colors.background,
        statusBarBackgroundColor: theme.colors.background,
        statusBarStyle: 'light',
        animation: 'fade',
      }}
    >
      {/* Telas principais - sempre disponíveis */}
      <Stack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ 
          gestureEnabled: false,
        }}
      />
      
      <Stack.Screen
        name="MediaScreen"
        component={MediaScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_bottom',
        }}
      />

      <Stack.Screen 
        name="PlayerScreen" 
        component={PlayerScreen}
        options={{
          presentation: 'fullScreenModal',
          headerShown: false,
          gestureEnabled: false,
          orientation: 'landscape',
          statusBarHidden: true,
          animation: 'fade',
        }}
      />

      {/* Telas de autenticação */}
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          presentation: 'modal',
          headerShown: false,
          gestureEnabled: true,
          animation: 'slide_from_bottom',
        }}
      />
      
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{ 
          gestureEnabled: false,
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};

// Hook para usar o contexto de autenticação nas telas
export const useAuth = (): ReturnType<typeof useAuthContext> => {
  return useAuthContext();
};

// Router principal com AuthProvider
const Router: React.FC = () => {
  return (
    <NavigationContainer>
      <AuthProvider>
        <AppStackNavigator />
      </AuthProvider>
    </NavigationContainer>
  );
};

export default Router;