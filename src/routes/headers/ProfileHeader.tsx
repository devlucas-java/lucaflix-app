import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
} from 'react-native';
import { LinearGradient } from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ProfileHeaderProps {
  navigation: any;
  scrollY?: Animated.Value;
  title?: string;
  onSettings?: () => void;
  onNotifications?: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  navigation,
  scrollY,
  title = "Perfil",
  onSettings,
  onNotifications,
}) => {
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    if (scrollY) {
      const listener = scrollY.addListener(({ value }) => {
        setShowBackground(value > 50);
      });
      return () => scrollY.removeListener(listener);
    }
  }, [scrollY]);

  const handleSettings = () => {
    if (onSettings) {
      onSettings();
    } else {
      // Implementação padrão se não houver callback
      console.log('Navegando para configurações...');
    }
  };

  const handleNotifications = () => {
    if (onNotifications) {
      onNotifications();
    } else {
      // Implementação padrão se não houver callback
      console.log('Navegando para notificações...');
    }
  };

  return (
    <View className="absolute top-0 left-0 right-0 z-50 h-20">
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {/* Gradiente condicional */}
      {showBackground && (
        <LinearGradient
          colors={['rgba(0, 0, 0, 0.9)', 'rgba(0, 0, 0, 0.7)', 'rgba(0, 0, 0, 0.3)', 'transparent']}
          className="absolute top-0 left-0 right-0 h-20"
        />
      )}
      
      <SafeAreaView className="flex-1 px-4 pt-3">
        <View className="flex-row items-center justify-between">
          <Text className="text-white text-xl font-bold">{title}</Text>
          
          <View className="flex-row items-center">
            <TouchableOpacity 
              className="p-2 mr-2"
              onPress={handleNotifications}
            >
              <Icon name="notifications" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="p-2"
              onPress={handleSettings}
            >
              <Icon name="settings" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};