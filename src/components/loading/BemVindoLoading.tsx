import { colorScheme } from "nativewind";
import { StatusBar, Text, View, Animated } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useRef, useState } from "react";

export const BemVindoLoading = () => {
  const [displayText, setDisplayText] = useState("");
  const [showWelcome, setShowWelcome] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const welcomeOpacity = useRef(new Animated.Value(0)).current;

  const targetText = "LUCAFLIX";

  useEffect(() => {
    // Animação de fade in inicial
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1200,
      useNativeDriver: true,
    }).start();

    // Animação de escrita letra por letra
    const writeText = () => {
      let currentIndex = 0;
      const interval = setInterval(() => {
        if (currentIndex <= targetText.length) {
          setDisplayText(targetText.substring(0, currentIndex));
          currentIndex++;
        } else {
          clearInterval(interval);
          // Após terminar de escrever, animar o scale e mostrar boas-vindas
          Animated.sequence([
            Animated.timing(scaleAnim, {
              toValue: 1.1,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(scaleAnim, {
              toValue: 1,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            // Mostrar mensagem de boas-vindas
            setShowWelcome(true);
            Animated.timing(welcomeOpacity, {
              toValue: 1,
              duration: 1000,
              useNativeDriver: true,
            }).start();
          });
        }
              }, 300); // Velocidade da escrita

      return () => clearInterval(interval);
    };

    // Delay antes de começar a escrever
    const timer = setTimeout(writeText, 300);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <View className="flex-1 justify-center items-center">
        {/* Logo sendo escrito */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
        >
          <View className="flex-row">
            {displayText.split('').map((letter, index) => (
              <Animated.Text
                key={index}
                className="text-7xl font-bold tracking-wider"
                style={{
                  opacity: fadeAnim,
                  color: '#E50914', // Vermelho Netflix
                }}
              >
                {letter}
              </Animated.Text>
            ))}
          </View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};