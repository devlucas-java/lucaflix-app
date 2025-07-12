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
  Search: undefined;
  MyList: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Loading Component
const LoadingScreen: React.FC = () => {
  return (
    <View style={{
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background
    }}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={{ color: theme.colors.text, marginTop: 16 }}>
        Carregando...
      </Text>
    </View>
  );
};

// Main Tab Navigator otimizado
const MainTabNavigator: React.FC = () => {
  // Memorizar o componente TabBar para evitar re-criação
  const renderTabBar = useCallback((props: any) => {
    return (
      <TabBar
        currentRoute={props.state.routes[props.state.index].name}
        onTabPress={(routeName) => {
          const event = props.navigation.emit({
            type: 'tabPress',
            target: routeName,
            canPreventDefault: true,
          });
          
          if (!event.defaultPrevented) {
            props.navigation.navigate(routeName as never);
          }
        }}
      />
    );
  }, []);

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
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="MyList" component={MyListScreen} />
      <Tab.Screen name="Profile" component={UserProfileScreen} />
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

  // Mostrar loading enquanto não inicializado ou carregando
  if (!isInitialized || isLoading) {
    return <LoadingScreen />;
  }

  return (
    <Stack.Navigator
      // Definir tela inicial baseada no estado de autenticação
      screenOptions={{
        headerShown: false,
        navigationBarColor: theme.colors.background,
        statusBarBackgroundColor: theme.colors.background,
        statusBarStyle: 'light',
        animation: 'fade',
      }}
    >
      {isAuthenticated ? (
        // Telas autenticadas
        <>
          <Stack.Screen
            name="MainTabs"
            component={MainTabNavigator}
            options={{ 
              gestureEnabled: false,
              // Resetar a pilha quando autenticado
              animationTypeForReplace: 'pop'
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
        </>
      ) : (
        // Telas não autenticadas
        <>
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{
              presentation: 'card',
              gestureEnabled: false,
              // Resetar a pilha quando não autenticado
              animationTypeForReplace: 'pop'
            }}
          />
          
          <Stack.Screen
            name="Register"
            component={RegisterScreen}
            options={{
              presentation: 'card',
              gestureEnabled: false,
            }}
          />
          
          <Stack.Screen
            name="Splash"
            component={SplashScreen}
            options={{ 
              gestureEnabled: false,
              // Splash pode ser acessado mas não deve ser a tela inicial
              headerShown: false,
            }}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

// Hook para usar o contexto de autenticação nas telas
export const useAuth = () => {
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