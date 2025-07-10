// routes/Router.tsx
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet } from 'react-native';

// Importar suas telas
import SplashScreen from '~/screens/auth/SplashScreen';
import LoginScreen from '~/screens/auth/LoginScreen';
import RegisterScreen from '~/screens/auth/RegisterScreen';
import { HomeScreen } from '~/screens/HomeScreen';
import { MediaScreen } from '~/screens/MediaScreen';
import { MyListScreen } from '~/screens/MyListScreen';
import UserProfileScreen from '~/screens/UserProfileScreen';
import SearchScreen from '~/screens/SearchScreen';

// Importar componentes de Header
import { HomeHeader } from '~/routes/headers/HomeHeader';
import { SearchHeader } from '~/routes/headers/SearchHeader';
import { MediaHeader } from '~/routes/headers/MediaHeader';
import { ProfileHeader } from '~/routes/headers/ProfileHeader';
import { CustomHeader } from '~/routes/headers/CustomHeader';
import { TabBar } from '~/routes/headers/TabBar';

import theme from '~/theme/theme';

// Tipos para navegação
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  MainTabs: undefined;
  MediaDetail: { 
    media: any; // MovieCompleteDTO | SerieCompleteDTO | AnimeCompleteDTO
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

// Screen wrapper with specific headers
const ScreenWithSpecificHeader: React.FC<{
  component: React.ComponentType<any>;
  headerType: 'home' | 'search' | 'profile' | 'default';
}> = ({ component: Component, headerType }) => {
  return ({ navigation, route }: any) => {
    const renderHeader = () => {
      switch (headerType) {
        case 'home':
          return <HomeHeader navigation={navigation} />;
        case 'search':
          return <SearchHeader navigation={navigation} />;
        case 'profile':
          return <ProfileHeader navigation={navigation} />;
        default:
          return <CustomHeader navigation={navigation} title="Minha Lista" />;
      }
    };

    return (
      <SafeAreaView style={styles.screenContainer} edges={['top']}>
        {renderHeader()}
        <Component navigation={navigation} route={route} />
      </SafeAreaView>
    );
  };
};


// Media Screen wrapper with custom header
const MediaScreenWithHeader: React.FC<any> = ({ navigation, route }) => {
  const { media } = route.params;

  return (
    <SafeAreaView style={styles.mediaScreenContainer} edges={['top']}>
      <MediaHeader navigation={navigation} />
      <MediaScreen media={media} onBack={() => navigation.goBack()} />
    </SafeAreaView>
  );
};


// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <TabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={ScreenWithSpecificHeader({ 
          component: HomeScreen, 
          headerType: 'home'
        })} 
        options={{
          tabBarLabel: 'Início',
        }}
      />
      
      <Tab.Screen 
        name="Search" 
        component={ScreenWithSpecificHeader({ 
          component: SearchScreen, 
          headerType: 'search'
        })} 
        options={{
          tabBarLabel: 'Buscar',
        }}
      />
      
      <Tab.Screen 
        name="MyList" 
        component={ScreenWithSpecificHeader({ 
          component: MyListScreen, 
          headerType: 'default'
        })} 
        options={{
          tabBarLabel: 'Minha Lista',
        }}
      />
      
      <Tab.Screen 
        name="Profile" 
        component={ScreenWithSpecificHeader({ 
          component: UserProfileScreen, 
          headerType: 'profile'
        })} 
        options={{
          tabBarLabel: 'Perfil',
        }}
      />
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
        }}
      >
        {/* Splash Screen */}
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen}
          options={{ 
            gestureEnabled: false,
          }}
        />

        {/* Public Routes */}
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

        {/* Main App Routes - Bottom Tabs */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabNavigator}
          options={{
            gestureEnabled: false,
          }}
        />

        {/* Media Detail Routes */}
        <Stack.Screen 
          name="MediaDetail"
          component={MediaScreenWithHeader}
          options={{
            presentation: 'modal',
            headerShown: false,
            gestureEnabled: true,
            animation: 'slide_from_bottom',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  mediaScreenContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});

export default Router;