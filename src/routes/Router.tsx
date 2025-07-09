// routes/Router.tsx
import React from 'react';
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

// Importar componentes
import { CustomHeader, MediaHeader, SearchHeader, HomeHeader, ProfileHeader } from '~/components/headers/CustomHeader';
import { NetflixTabBar } from '~/components/headers/NetflixTabBar';
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
          return <CustomHeader navigation={navigation} title="" />;
      }
    };

    return (
      <View style={styles.screenContainer}>
        {renderHeader()}
        <Component navigation={navigation} route={route} />
      </View>
    );
  };
};

// Media Screen wrapper with custom header
const MediaScreenWithHeader: React.FC<any> = ({ navigation, route }) => {
  const { media } = route.params;
  
  return (
    <View style={styles.mediaScreenContainer}>
      <MediaHeader navigation={navigation} />
      <MediaScreen media={media} onBack={() => navigation.goBack()} />
    </View>
  );
};

// Main Tab Navigator
const MainTabNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      tabBar={(props) => <NetflixTabBar {...props} />}
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