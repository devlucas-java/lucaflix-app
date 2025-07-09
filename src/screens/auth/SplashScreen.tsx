import React, { useEffect } from 'react';
import { View, Text, Image, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);
  const slideAnim = new Animated.Value(50);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1 bg-black relative">
      {/* Background with Netflix-style gradient */}
      <LinearGradient
        colors={['#000000', '#141414', '#000000']}
        style={{
          position: 'absolute',
          width: width,
          height: height,
        }}
      />

      {/* Animated background elements */}
      <View className="absolute inset-0">
        <Animated.View 
          className="absolute w-96 h-96 bg-red-600/10 rounded-full blur-3xl"
          style={{
            top: height * 0.25,
            left: width * 0.25,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        />
        <Animated.View 
          className="absolute w-96 h-96 bg-red-800/10 rounded-full blur-3xl"
          style={{
            bottom: height * 0.25,
            right: width * 0.25,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        />
      </View>

      {/* Main content */}
      <View className="flex-1 justify-center items-center px-8">
        <Animated.View
          className="items-center"
          style={{
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ],
          }}
        >
          {/* Logo */}
          <Text className="text-red-600 text-6xl font-bold tracking-wide mb-4 text-center">
            LUCAFLIX
          </Text>
          
          {/* Underline */}
          <View className="w-24 h-1 bg-red-600 rounded-full mb-8" />
          
          {/* Subtitle */}
          <Text className="text-white text-xl font-medium text-center mb-4">
            Seu streaming favorito
          </Text>
          
          {/* Loading indicator */}
          <View className="flex-row space-x-2 mt-8">
            <Animated.View 
              className="w-3 h-3 bg-red-600 rounded-full"
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }}
            />
            <Animated.View 
              className="w-3 h-3 bg-red-600 rounded-full"
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }}
            />
            <Animated.View 
              className="w-3 h-3 bg-red-600 rounded-full"
              style={{
                opacity: fadeAnim,
                transform: [{ scale: scaleAnim }],
              }}
            />
          </View>
        </Animated.View>
      </View>

      {/* Footer */}
      <Animated.View 
        className="absolute bottom-10 left-0 right-0 items-center"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <Text className="text-gray-900 text-sm">
          Carregando...
        </Text>
                <Text className="text-gray-300 text-sm">
          Carregando...
        </Text>
      </Animated.View>
    </View>
  );
};

export default SplashScreen;