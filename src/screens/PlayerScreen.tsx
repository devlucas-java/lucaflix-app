import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StatusBar,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  BackHandler,
  Alert,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { useNavigation, useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { activateKeepAwake, deactivateKeepAwake } from 'expo-keep-awake';
import * as ScreenOrientation from 'expo-screen-orientation';
import { PanGestureHandler } from 'react-native-gesture-handler';

// Configuração base do embed
const EMBED_BASE_URL = 'https://embedder.net';

interface PlayerScreenProps {
  media: any;
  embedUrl: string;
  episode?: any;
}

export const PlayerScreen: React.FC<PlayerScreenProps> = () => {
  const navigation = useNavigation();
  const route = useRoute<{ params: PlayerScreenProps }>();
  const { media, embedUrl, episode } = route.params;

  // Estados principais
  const [isControlsVisible, setIsControlsVisible] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(episode?.duracaoMinutos ? episode.duracaoMinutos * 60 : 7200);
  const [isBuffering, setIsBuffering] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedQuality, setSelectedQuality] = useState('HD');
  const [showSpeedOptions, setShowSpeedOptions] = useState(false);
  const [showQualityOptions, setShowQualityOptions] = useState(false);

  // Animações
  const controlsOpacity = useRef(new Animated.Value(1)).current;
  const controlsTimeout = useRef<NodeJS.Timeout>();
  const progressInterval = useRef<NodeJS.Timeout>();

  // Configuração inicial
  useEffect(() => {
    setupPlayer();
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => {
      cleanupPlayer();
      backHandler.remove();
    };
  }, []);

  // Timer de progresso
  useEffect(() => {
    if (isPlaying) {
      progressInterval.current = setInterval(() => {
        setCurrentTime(prev => prev >= duration ? duration : prev + 1);
      }, 1000);
    } else if (progressInterval.current) {
      clearInterval(progressInterval.current);
    }
    
    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [isPlaying, duration]);

  const setupPlayer = async () => {
    try {
      activateKeepAwake();
      await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
      StatusBar.setHidden(true);
      startControlsTimer();
    } catch (error) {
      console.error('Erro ao configurar player:', error);
    }
  };

  const cleanupPlayer = async () => {
    try {
      deactivateKeepAwake();
      await ScreenOrientation.unlockAsync();
      StatusBar.setHidden(false);
      if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
      if (progressInterval.current) clearInterval(progressInterval.current);
    } catch (error) {
      console.error('Erro ao limpar player:', error);
    }
  };

  const startControlsTimer = () => {
    if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
    controlsTimeout.current = setTimeout(() => {
      if (!isLocked && isPlaying) hideControls();
    }, 4000);
  };

  const hideControls = () => {
    Animated.timing(controlsOpacity, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => setIsControlsVisible(false));
  };

  const showControls = () => {
    setIsControlsVisible(true);
    Animated.timing(controlsOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    startControlsTimer();
  };

  const handleScreenTouch = () => {
    if (isLocked) return;
    isControlsVisible ? hideControls() : showControls();
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    startControlsTimer();
  };

  const handleSeekTo = (time: number) => {
    setCurrentTime(time);
    startControlsTimer();
  };

  const handleBackPress = () => {
    if (isLocked) return true;
    Alert.alert('Sair do Player', 'Tem certeza que deseja sair?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', onPress: () => navigation.goBack() },
    ]);
    return true;
  };

  const handleLockPress = () => {
    setIsLocked(!isLocked);
    !isLocked ? hideControls() : showControls();
  };

  // Utilitários
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getMediaTitle = () => {
    return episode ? `${media.title} - T1:E${episode.numeroEpisodio} ${episode.title}` : media.title;
  };

  const getMediaType = () => {
    if (media.type === 'movie') return 'FILME';
    if (media.type === 'serie') return 'SÉRIE';
    if (media.type === 'anime') return 'ANIME';
    return 'MÍDIA';
  };

  // Construir URL do embed
  const getPlayerUrl = () => {
    // Se embedUrl já contém o domínio completo, usa direto
    if (embedUrl.includes('http')) {
      return embedUrl;
    }
    // Senão, combina com o domínio base
    return `${EMBED_BASE_URL}${embedUrl}`;
  };

  const speedOptions = [0.5, 0.75, 1.0, 1.25, 1.5, 2.0];
  const qualityOptions = ['Auto', 'HD', 'Full HD', '4K'];

  return (
    <View className="flex-1 bg-black">
      <StatusBar hidden />
      
      {/* WebView Player */}
      <WebView
        source={{ uri: getPlayerUrl() }}
        className="flex-1 bg-black"
        allowsFullscreenVideo={true}
        mediaPlaybackRequiresUserAction={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        mixedContentMode="compatibility"
        onLoadStart={() => setIsBuffering(true)}
        onLoadEnd={() => setIsBuffering(false)}
        onError={() => Alert.alert('Erro', 'Não foi possível carregar o vídeo')}
      />

      {/* Touch Area */}
      <TouchableWithoutFeedback onPress={handleScreenTouch}>
        <View className="absolute inset-0" />
      </TouchableWithoutFeedback>

      {/* Buffering Indicator */}
      {isBuffering && (
        <View className="absolute inset-0 justify-center items-center bg-black/30">
          <View className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
          <Text className="text-white mt-4 text-lg font-medium">Carregando...</Text>
        </View>
      )}

      {/* Controls Overlay */}
      {isControlsVisible && !isLocked && (
        <Animated.View className="absolute inset-0" style={{ opacity: controlsOpacity }}>
          {/* Gradients */}
          <View className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/80 to-transparent" />
          <View className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />

          {/* Top Bar */}
          <View className="absolute top-0 left-0 right-0 flex-row items-center justify-between px-6 pt-8 pb-4">
            <View className="flex-row items-center flex-1">
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                className="p-3 rounded-full bg-black/40 mr-4"
              >
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>

              <View className="flex-1">
                <View className="flex-row items-center mb-1">
                  <View className="bg-red-600 px-2 py-1 rounded-sm mr-2">
                    <Text className="text-white text-xs font-bold">N</Text>
                  </View>
                  <View className="bg-white/20 px-2 py-1 rounded-sm mr-2">
                    <Text className="text-white text-xs font-semibold">{getMediaType()}</Text>
                  </View>
                  <View className="bg-white/20 px-2 py-1 rounded-sm">
                    <Text className="text-white text-xs font-semibold">{selectedQuality}</Text>
                  </View>
                </View>
                <Text className="text-white text-base font-medium" numberOfLines={1}>
                  {getMediaTitle()}
                </Text>
              </View>
            </View>

            <View className="flex-row items-center">
              <TouchableOpacity
                onPress={() => setShowQualityOptions(!showQualityOptions)}
                className="p-3 rounded-full bg-black/40 mr-3"
              >
                <MaterialCommunityIcons name="high-definition" size={24} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleLockPress}
                className="p-3 rounded-full bg-black/40"
              >
                <MaterialCommunityIcons name="lock-open" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Center Controls */}
          <View className="absolute inset-0 justify-center items-center">
            <View className="flex-row items-center space-x-8">
              <TouchableOpacity
                onPress={() => handleSeekTo(Math.max(0, currentTime - 10))}
                className="p-4 rounded-full bg-black/40"
              >
                <MaterialCommunityIcons name="rewind-10" size={32} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handlePlayPause}
                className="p-6 rounded-full bg-white/20"
              >
                <Icon name={isPlaying ? "pause" : "play-arrow"} size={48} color="#fff" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSeekTo(Math.min(duration, currentTime + 10))}
                className="p-4 rounded-full bg-black/40"
              >
                <MaterialCommunityIcons name="fast-forward-10" size={32} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Controls */}
          <View className="absolute bottom-0 left-0 right-0 px-6 pb-6">
            <View className="mb-4">
              <Slider
                style={{ width: '100%', height: 40 }}
                minimumValue={0}
                maximumValue={duration}
                value={currentTime}
                onValueChange={handleSeekTo}
                minimumTrackTintColor="#E50914"
                maximumTrackTintColor="#333"
                thumbStyle={{ backgroundColor: '#E50914', width: 20, height: 20 }}
              />
              
              <View className="flex-row justify-between items-center mt-2">
                <Text className="text-white text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </Text>
                
                <View className="flex-row items-center space-x-4">
                  <TouchableOpacity
                    onPress={() => setShowSpeedOptions(!showSpeedOptions)}
                    className="p-2 rounded bg-black/40"
                  >
                    <Text className="text-white text-sm font-medium">{playbackSpeed}x</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity className="p-2 rounded-full bg-black/40">
                    <MaterialCommunityIcons name="fullscreen" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Speed Options */}
          {showSpeedOptions && (
            <View className="absolute bottom-20 right-6 bg-black/90 rounded-lg p-4">
              <Text className="text-white text-sm font-semibold mb-3">Velocidade</Text>
              {speedOptions.map((speed) => (
                <TouchableOpacity
                  key={speed}
                  onPress={() => {
                    setPlaybackSpeed(speed);
                    setShowSpeedOptions(false);
                  }}
                  className="py-2 px-4 rounded"
                >
                  <Text className={`text-sm ${speed === playbackSpeed ? 'text-red-500 font-bold' : 'text-white'}`}>
                    {speed}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quality Options */}
          {showQualityOptions && (
            <View className="absolute top-20 right-6 bg-black/90 rounded-lg p-4">
              <Text className="text-white text-sm font-semibold mb-3">Qualidade</Text>
              {qualityOptions.map((quality) => (
                <TouchableOpacity
                  key={quality}
                  onPress={() => {
                    setSelectedQuality(quality);
                    setShowQualityOptions(false);
                  }}
                  className="py-2 px-4 rounded"
                >
                  <Text className={`text-sm ${quality === selectedQuality ? 'text-red-500 font-bold' : 'text-white'}`}>
                    {quality}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </Animated.View>
      )}

      {/* Lock Screen */}
      {isLocked && (
        <View className="absolute inset-0 bg-black/50 justify-center items-center">
          <TouchableOpacity
            onPress={handleLockPress}
            className="bg-black/80 p-6 rounded-full"
          >
            <MaterialCommunityIcons name="lock" size={48} color="#fff" />
          </TouchableOpacity>
          <Text className="text-white mt-4 text-lg font-medium">Tela bloqueada</Text>
          <Text className="text-white/60 text-sm mt-1">Toque para desbloquear</Text>
        </View>
      )}
    </View>
  );
};