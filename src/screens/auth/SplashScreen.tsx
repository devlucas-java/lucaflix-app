import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const letterAnims = useRef(
    'LUCAFLIX'.split('').map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    // Animação de fade in inicial
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();

    // Animação das letras aparecendo uma por uma
    const letterAnimations = letterAnims.map((anim, index) =>
      Animated.timing(anim, {
        toValue: 1,
        duration: 150,
        delay: index * 100,
        useNativeDriver: true,
      })
    );

    // Executar animações das letras
    Animated.sequence([
      Animated.delay(300),
      Animated.parallel(letterAnimations),
    ]).start(() => {
      // Animação de "boom" no final
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start();
      }, 200);
    });
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

      {/* Main content */}
      <View className="flex-1 justify-center items-center px-8">
        <Animated.View
          className="items-center"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          {/* Logo com animação de escrita */}
          <View className="flex-row items-center justify-center mb-8">
            {'LUCAFLIX'.split('').map((letter, index) => (
              <Animated.Text
                key={index}
                className="text-red-600 text-6xl font-bold tracking-wide"
                style={{
                  opacity: letterAnims[index],
                  transform: [
                    {
                      translateY: letterAnims[index].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
              >
                {letter}
              </Animated.Text>
            ))}
          </View>

          {/* Underline com animação */}
          <Animated.View
            className="w-32 h-1 bg-red-600 rounded-full mb-8"
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  scaleX: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1],
                  }),
                },
              ],
            }}
          />

          {/* Subtitle */}
          <Animated.Text
            className="text-white text-xl font-medium text-center opacity-80"
            style={{
              opacity: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 0.8],
              }),
            }}
          >
            Seu streaming favorito
          </Animated.Text>
        </Animated.View>
      </View>

      {/* Animated background elements */}
      <View className="absolute inset-0 -z-10">
        <Animated.View
          className="absolute w-96 h-96 bg-red-600/5 rounded-full blur-3xl"
          style={{
            top: height * 0.25,
            left: width * 0.25,
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
            transform: [{ scale: scaleAnim }],
          }}
        />
        <Animated.View
          className="absolute w-96 h-96 bg-red-800/5 rounded-full blur-3xl"
          style={{
            bottom: height * 0.25,
            right: width * 0.25,
            opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.3],
            }),
            transform: [{ scale: scaleAnim }],
          }}
        />
      </View>
    </View>
  );
};

export default SplashScreen;