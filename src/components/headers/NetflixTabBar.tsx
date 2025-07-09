// components/headers/NetflixTabBar.tsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import theme from '~/theme/theme';

interface NetflixTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

const { width: screenWidth } = Dimensions.get('window');

export const NetflixTabBar: React.FC<NetflixTabBarProps> = ({ 
  state, 
  descriptors, 
  navigation 
}) => {
  const getTabIcon = (routeName: string, isFocused: boolean) => {
    const iconColor = isFocused ? theme.colors.text.primary : theme.colors.text.secondary;
    const iconSize = 24;

    switch (routeName) {
      case 'Home':
        return <Icon name="home" size={iconSize} color={iconColor} />;
      case 'Search':
        return <Icon name="search" size={iconSize} color={iconColor} />;
      case 'MyList':
        return <Icon name="bookmark" size={iconSize} color={iconColor} />;
      case 'Profile':
        return (
          <Image 
            source={require('../../../assets/icon.png')} 
            style={[
              styles.profileIcon,
              { 
                opacity: isFocused ? 1 : 0.7,
                borderColor: isFocused ? theme.colors.primary : 'transparent',
              }
            ]}
            resizeMode="contain"
          />
        );
      default:
        return <Icon name="home" size={iconSize} color={iconColor} />;
    }
  };

  const getTabLabel = (routeName: string) => {
    switch (routeName) {
      case 'Home':
        return 'Início';
      case 'Search':
        return 'Buscar';
      case 'MyList':
        return 'Minha Lista';
      case 'Profile':
        return 'Perfil';
      default:
        return routeName;
    }
  };

  return (
    <SafeAreaView style={styles.tabBarContainer}>
      <View style={styles.tabBar}>
        {state.routes.map((route: any, index: number) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              <View style={styles.tabContent}>
                {getTabIcon(route.name, isFocused)}
                <Text style={[
                  styles.tabLabel,
                  isFocused && styles.tabLabelActive
                ]}>
                  {getTabLabel(route.name)}
                </Text>
                {isFocused && <View style={styles.activeIndicator} />}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.accent,
  },
  tabBar: {
    flexDirection: 'row',
    height: 60,
    paddingHorizontal: 8,
    paddingVertical: 8,
    backgroundColor: theme.colors.surface,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: theme.colors.text.secondary,
    marginTop: 4,
    textAlign: 'center',
  },
  tabLabelActive: {
    color: theme.colors.text.primary,
    fontWeight: '600',
  },
  profileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
  },
  activeIndicator: {
    position: 'absolute',
    top: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.primary,
  },
});