import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import authService from '~/service/authService';
import theme from '~/theme/theme';

interface CustomDrawerContentProps {
  navigation: any;
  state: any;
}

export const CustomDrawerContent: React.FC<CustomDrawerContentProps> = ({ 
  navigation, 
  state 
}) => {
  const handleLogout = async () => {
    Alert.alert(
      "Sair",
      "Deseja realmente sair da sua conta?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          style: "destructive",
          onPress: async () => {
            try {
              await authService.logout();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout failed:', error);
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    { name: 'Home', label: 'Início', icon: 'home' },
    { name: 'Movies', label: 'Filmes', icon: 'movie' },
    { name: 'Series', label: 'Séries', icon: 'tv' },
    { name: 'Animes', label: 'Animes', icon: 'animation' },
    { name: 'Search', label: 'Buscar', icon: 'search' },
    { name: 'MyList', label: 'Minha Lista', icon: 'bookmark' },
    { name: 'Profile', label: 'Perfil', icon: 'person' },
  ];

  return (
    <View style={styles.drawerContainer}>
      <StatusBar 
        barStyle="light-content" 
        backgroundColor={theme.colors.surface} 
      />
      
      {/* Header do Drawer */}
      <View style={styles.drawerHeader}>
        <Image 
          source={require('../../../assets/icon.png')} 
          style={styles.drawerLogo}
          resizeMode="contain"
        />
        <Text style={styles.drawerHeaderText}>Netflix Clone</Text>
      </View>

      {/* Menu Items */}
      <View style={styles.drawerContent}>
        {menuItems.map((item) => {
          const isActive = state.routeNames[state.index] === item.name;
          
          return (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.drawerItem,
                isActive && styles.drawerItemActive
              ]}
              onPress={() => navigation.navigate(item.name)}
            >
              <Icon 
                name={item.icon} 
                size={24} 
                color={isActive ? theme.colors.primary : theme.colors.text.secondary} 
              />
              <Text style={[
                styles.drawerItemText,
                isActive && styles.drawerItemTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer do Drawer */}
      <View style={styles.drawerFooter}>
        <TouchableOpacity 
          style={styles.drawerItem}
          onPress={handleLogout}
        >
          <Icon name="logout" size={24} color={theme.colors.error} />
          <Text style={[styles.drawerItemText, { color: theme.colors.error }]}>
            Sair
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: theme.colors.surface,
  },
  drawerHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.accent,
    alignItems: 'center',
  },
  drawerLogo: {
    width: 50,
    height: 50,
  },
  drawerHeaderText: {
    color: theme.colors.text.primary,
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
  },
  drawerContent: {
    flex: 1,
    paddingTop: 20,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginHorizontal: 10,
    borderRadius: 8,
  },
  drawerItemActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  drawerItemText: {
    color: theme.colors.text.secondary,
    fontSize: 16,
    marginLeft: 16,
    fontWeight: '500',
  },
  drawerItemTextActive: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  drawerFooter: {
    paddingBottom: 30,
    borderTopWidth: 1,
    borderTopColor: theme.colors.accent,
    paddingTop: 20,
  },
});