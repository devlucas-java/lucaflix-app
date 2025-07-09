// routes/Router.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
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
import { CustomHeader, MediaHeader } from '~/components/headers/CustomHeader';
import { CustomDrawerContent } from '~/components/headers/CustomDrawerContent';
import theme from '~/theme/theme';

// Tipos para navegação
export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  MainDrawer: undefined;
  MediaDetail: { 
    media: any; // MovieCompleteDTO | SerieCompleteDTO | AnimeCompleteDTO
  };
  AdminDashboard: undefined;
};

export type DrawerParamList = {
  Home: undefined;
  Movies: undefined;
  Series: undefined;
  Animes: undefined;
  Search: undefined;
  MyList: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// Screen wrapper with header - CORRIGIDO
const ScreenWithHeader: React.FC<{ 
  component: React.ComponentType<any>; 
  title: string; 
}> = ({ component: Component, title }) => {
  return ({ navigation, route }: any) => (
    <View style={styles.screenContainer}>
      <CustomHeader navigation={navigation} title={title} />
      <Component navigation={navigation} route={route} />
    </View>
  );
};

// Media Screen wrapper with custom header - CORRIGIDO
const MediaScreenWithHeader: React.FC<any> = ({ navigation, route }) => {
  const { media } = route.params;
  
  return (
    <View style={styles.mediaScreenContainer}>
      <MediaHeader navigation={navigation} />
      <MediaScreen media={media} onBack={() => navigation.goBack()} />
    </View>
  );
};

// Main Drawer Navigator - CORRIGIDO
const MainDrawer: React.FC = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Home"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: theme.colors.surface,
          width: 280,
        },
        drawerType: 'slide',
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <Drawer.Screen 
        name="Home" 
        component={ScreenWithHeader({ 
          component: HomeScreen, 
          title: "Início" 
        })} 
      />
      
      <Drawer.Screen 
        name="Search" 
        component={ScreenWithHeader({ 
          component: SearchScreen, 
          title: "Buscar" 
        })} 
      />
      
      <Drawer.Screen 
        name="MyList" 
        component={ScreenWithHeader({ 
          component: MyListScreen, 
          title: "Minha Lista" 
        })} 
      />
      
      <Drawer.Screen 
        name="Profile" 
        component={ScreenWithHeader({ 
          component: UserProfileScreen, 
          title: "Perfil" 
        })} 
      />
    </Drawer.Navigator>
  );
};

// Router principal - CORRIGIDO
const Router: React.FC = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainDrawer"
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

        {/* Main App Routes - Drawer */}
        <Stack.Screen 
          name="MainDrawer" 
          component={MainDrawer}
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