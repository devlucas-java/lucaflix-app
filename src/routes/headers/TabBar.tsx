// components/TabBar.tsx
import React, { memo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useTabBar } from './hooks/useTabBar';

interface TabBarProps {
  currentRoute?: string;
  onTabPress?: (routeName: string) => void;
}

// Componente de ícone otimizado
const TabIcon = memo(({ routeName, isFocused }: { routeName: string; isFocused: boolean }) => {
  const iconColor = isFocused ? '#FFFFFF' : '#9CA3AF';
  
  switch (routeName) {
    case 'Home':
      return <Icon name="home" size={24} color={iconColor} />;
    case 'Search':
      return <Icon name="search" size={24} color={iconColor} />;
    case 'MyList':
      return <Icon name="favorite" size={24} color={iconColor} />;
    case 'Profile':
      return (
        <Image 
          source={require('../../../assets/icon.png')}
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            borderWidth: isFocused ? 2 : 0,
            borderColor: isFocused ? '#DC2626' : 'transparent',
            opacity: isFocused ? 1 : 0.7,
          }}
          resizeMode="contain"
        />
      );
    default:
      return <Icon name="home" size={24} color={iconColor} />;
  }
});

// Labels estáticos para evitar re-criação
const TAB_LABELS = {
  Home: 'Início',
  Search: 'Buscar',
  MyList: 'Minha Lista',
  Profile: 'Perfil',
};

// Componente de Tab otimizado
const TabButton = memo(({ 
  route, 
  index, 
  isFocused, 
  onPress, 
  onLongPress, 
  options 
}: {
  route: any;
  index: number;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  options: any;
}) => (
  <TouchableOpacity
    accessibilityRole="button"
    accessibilityState={isFocused ? { selected: true } : {}}
    accessibilityLabel={options?.tabBarAccessibilityLabel}
    testID={options?.tabBarTestID}
    onPress={onPress}
    onLongPress={onLongPress}
    className="flex-1 items-center justify-center px-1"
    activeOpacity={0.7}
  >
    <View className="items-center justify-center py-1">
      <TabIcon routeName={route.name} isFocused={isFocused} />
      <Text 
        className={`text-xs font-medium mt-1 text-center ${
          isFocused ? 'text-white font-semibold' : 'text-gray-400'
        }`}
      >
        {TAB_LABELS[route.name as keyof typeof TAB_LABELS] || route.name}
      </Text>
    </View>
  </TouchableOpacity>
));

export const TabBar: React.FC<TabBarProps> = memo(({ 
  currentRoute,
  onTabPress 
}) => {
  const { state, descriptors, navigation } = useTabBar();

  const handleTabPress = useCallback((routeName: string, index: number) => {
    if (onTabPress) {
      onTabPress(routeName);
    } else {
      const event = navigation.emit({
        type: 'tabPress',
        target: state.routes[index].key,
        canPreventDefault: true,
      });

      if (!event.defaultPrevented) {
        navigation.navigate(routeName as never);
      }
    }
  }, [onTabPress, navigation, state.routes]);

  const handleTabLongPress = useCallback((index: number) => {
    navigation.emit({
      type: 'tabLongPress',
      target: state.routes[index].key,
    });
  }, [navigation, state.routes]);

  return (
    <View className="absolute bottom-0 left-0 right-0 z-50">
      {/* Overlay otimizado */}
      <View 
        className="absolute inset-0 bg-black/60"
        style={{ backdropFilter: 'blur(10px)' }}
      />
      
      <SafeAreaView className="bg-transparent">
        <View className="flex-row h-16 px-2 py-2 bg-transparent">
          {state.routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key] || {};
            const isFocused = currentRoute ? 
              currentRoute === route.name : 
              state.index === index;

            return (
              <TabButton
                key={route.key}
                route={route}
                index={index}
                isFocused={isFocused}
                onPress={() => handleTabPress(route.name, index)}
                onLongPress={() => handleTabLongPress(index)}
                options={options}
              />
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
});