import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  Animated,
} from 'react-native';

interface HomeHeaderProps {
  navigation: any;
  scrollY?: Animated.Value;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ navigation, scrollY }) => {
  const [selectedCategory, setSelectedCategory] = useState('Series');
  const [showBackground, setShowBackground] = useState(false);

  const categories = [
    { id: 'series', name: 'Series' },
    { id: 'filmes', name: 'Filmes' },
    { id: 'animes', name: 'Minha Lista' },
  ];

  useEffect(() => {
    if (scrollY) {
      const listener = scrollY.addListener(({ value }) => {
        setShowBackground(value > 50);
      });
      return () => scrollY.removeListener(listener);
    }
  }, [scrollY]);

  const handleCategorySelect = (category: any) => {
    setSelectedCategory(category.name);
    navigation.navigate('Home');
  };

  return (
    <SafeAreaView className="absolute top-6 left-0 right-0 z-50 h-32">
      <StatusBar 
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />
      
      {/* Alternative gradient using View with opacity */}
      {showBackground && (
        <View className="absolute top-0 left-0 right-0 h-16 bg-black opacity-80" />
      )}
      
      <SafeAreaView className="flex-1 px-4 pt-3">
        <View className="flex-row items-center justify-start px-2">
          <Image 
            source={require('../../../assets/icon.png')}
            className="w-20 h-8"
            resizeMode="contain" 
          />
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              className="items-center mr-10 py-2 relative"
              onPress={() => handleCategorySelect(category)}
            >
              <Text className={`text-base font-medium ${
                selectedCategory === category.name
                  ? 'text-white font-semibold'
                  : 'text-gray-300'
              }`}>
                {category.name}
              </Text>
              {selectedCategory === category.name && (
                <View className="w-1.5 h-1.5 rounded-full bg-red-600 mt-1" />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </SafeAreaView>
    </SafeAreaView>
  );
};