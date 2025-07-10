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

interface CustomHeaderProps {
  navigation: any;
  title: string;
  showBack?: boolean;
  scrollY?: Animated.Value;
}

export const CustomHeader: React.FC<CustomHeaderProps> = ({ 
  navigation, 
  title, 
  showBack = true,
  scrollY 
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
          {showBack && (
            <TouchableOpacity
              className="p-2 mr-4"
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-back" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          )}
          
          <Text className="text-white text-xl font-bold flex-1">{title}</Text>
        </View>
      </SafeAreaView>
    </View>
  );
};