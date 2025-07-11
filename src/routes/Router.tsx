// routes/Router.tsx
import React, { useCallback } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

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

// Router principal
const Router: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          navigationBarColor: theme.colors.background,
          statusBarBackgroundColor: theme.colors.background,
          statusBarStyle: 'light',
          animation: 'fade', // Animação mais leve
        }}
      >
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{ gestureEnabled: false }}
        />
        
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            presentation: 'card',
            gestureEnabled: false,
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
          name="MainTabs"
          component={MainTabNavigator}
          options={{ gestureEnabled: false }}
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
            gestureEnabled: false, // Desabilitar gesture para voltar
            orientation: 'landscape', // Forçar orientação paisagem
            statusBarHidden: true,
            animation: 'fade',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default Router;