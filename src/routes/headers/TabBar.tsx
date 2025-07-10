import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface TabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

export const TabBar: React.FC<TabBarProps> = ({ 
  state, 
  descriptors, 
  navigation 
}) => {
  const getTabIcon = (routeName: string, isFocused: boolean) => {
    const iconColor = isFocused ? '#FFFFFF' : '#9CA3AF';
    const iconSize = 24;

    switch (routeName) {
      case 'Home':
        return <Icon name="home" size={iconSize} color={iconColor} />;
      case 'Search':
        return <Icon name="search" size={iconSize} color={iconColor} />;
      case 'MyList':
        return <Icon name="favorite" size={iconSize} color={iconColor} />;
      case 'Profile':
        return (
          <Image 
            source={require('../../../assets/icon.png')} 
            className={`w-6 h-6 rounded-full border ${
              isFocused 
                ? 'opacity-100 border-red-600' 
                : 'opacity-70 border-transparent'
            }`}
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
    <View className="absolute bottom-0 left-0 right-0 z-50">
      {/* Overlay transparente com blur */}
      <View className="absolute top-0 left-0 right-0 bottom-0 bg-black/30" style={{
        backdropFilter: 'blur(10px)',
      }} />
      
      <SafeAreaView className="bg-transparent">
        <View className="flex-row h-18 px-2 py-2 bg-transparent">
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
                className="flex-1 items-center justify-center px-1"
                activeOpacity={0.7}
              >
                <View className="items-center justify-center py-1">
                  {getTabIcon(route.name, isFocused)}
                  <Text className={`text-xs font-medium mt-1 text-center ${
                    isFocused 
                      ? 'text-white font-semibold' 
                      : 'text-gray-400'
                  }`}>
                    {getTabLabel(route.name)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </SafeAreaView>
    </View>
  );
};