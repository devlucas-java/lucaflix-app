import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  ImageBackground,
  StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { MediaComplete } from '../types/mediaTypes';
import { isMovieComplete, isSerieComplete } from '../types/mediaTypes';
import { toggleMyList, toggleLike } from '../utils/mediaService';
import authService from '../service/authService';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface HeroSectionProps {
  media: MediaComplete;
  onInfo?: () => void;
  onPlay?: () => void;
  loading?: boolean;
  useH1?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  media,
  onInfo,
  onPlay,
  useH1 = false,
}) => {
  const [isInMyList, setIsInMyList] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showVideo, setShowVideo] = useState(true); // Iniciando com true para mostrar o trailer
  const [imageError, setImageError] = useState(false);
  const [fallbackImageError, setFallbackImageError] = useState(false);
  const [backdropError, setBackdropError] = useState(false);

  useEffect(() => {
    setIsInMyList(media?.inUserList || false);
  }, [media]);

  const handleMyList = async () => {
    if (isLoading) return;

    if (!authService.isAuthenticated()) {
      Alert.alert('Login necessário', 'Você precisa estar logado para adicionar à sua lista');
      return;
    }

    setIsLoading(true);
    try {
      const result = await toggleMyList(media);
      setIsInMyList(result);
    } catch (error) {
      console.error('Erro ao adicionar/remover da minha lista:', error);
      Alert.alert('Erro', 'Não foi possível atualizar sua lista');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    }
  };

  const getYouTubeVideoId = (url: string): string | null => {
    if (!url) return null;

    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/v\/([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }

    return null;
  };

  const videoId = media.trailer ? getYouTubeVideoId(media.trailer) : null;

  // URL do YouTube com som sempre ativo
  const youtubeURL = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=0&controls=0&loop=1&playlist=${videoId}&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&fs=0&playsinline=1`
    : null;

  const getBackdropURL = () => {
    if (!backdropError && media.backdropURL1) {
      return media.backdropURL1;
    } else if (media.backdropURL2) {
      return media.backdropURL2;
    } else if (media.backdropURL3) {
      return media.backdropURL3;
    } else if (media.backdropURL4) {
      return media.backdropURL4;
    }
    return null;
  };

  const getContentType = () => {
    if (isMovieComplete(media)) {
      return 'FILME';
    } else if (isSerieComplete(media)) {
      return 'SÉRIE';
    } else {
      return 'ANIME';
    }
  };

  const renderLogoOrTitle = () => {
    return (
      <View className="mb-4 mt-10">
        {media.logoURL1 && !imageError ? (
          <Image
            source={{ uri: media.logoURL1 }}
            className="aspect-[16/5]"
            resizeMode="contain"
            onError={() => setImageError(true)}
          />
        ) : media.logoURL2 && !fallbackImageError && imageError ? (
          <Image
            source={{ uri: media.logoURL2 }}
            className="aspect-[16/5]"
            resizeMode="contain"
            onError={() => setFallbackImageError(true)}
          />
        ) : (
          <Text className="leading-11 text-4xl font-extralight text-white">{media.title}</Text>
        )}
      </View>
    );
  };

  const renderMediaInfo = () => {
    const info = [];

    if (media.avaliacao) {
      info.push(`${media.avaliacao}/10`);
    }

    if (media.anoLancamento) {
      info.push(media.anoLancamento.toString());
    }

    if (media.minAge) {
      info.push(media.minAge);
    }

    return info.join(' • ');
  };

  if (!media) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-base text-white">Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="z-5 center m-0 flex bg-black" style={{ height: height * 0.75 }}>
      {/* Imagem de fundo sempre visível - quando não há trailer */}
      {!showVideo && (
        <ImageBackground
          source={{ uri: getBackdropURL() }}
          className="z-1 absolute h-full w-full"
          onError={() => setBackdropError(true)}
        />
      )}

      {/* Container do trailer com fotos acima e abaixo */}
      {showVideo && youtubeURL && !videoError && (
        <View className="z-2 -top-20 absolute h-full w-full flex-1 justify-center">
          {/* Foto de fundo acima do trailer */}
          <View className="flex-1">
            <ImageBackground
              source={{ uri: getBackdropURL() }}
              className="h-full w-full"
              onError={() => setBackdropError(true)}
            />
          </View>

          {/* Trailer em aspect-video */}
          <View className="aspect-video w-full overflow-hidden">
            <WebView
              source={{ uri: youtubeURL }}
              className="flex-1 bg-transparent"
              allowsFullscreenVideo={false}
              mediaPlaybackRequiresUserAction={false}
              javaScriptEnabled={true}
              domStorageEnabled={true}
              onError={() => setVideoError(true)}
              scalesPageToFit={true}
              bounces={false}
              scrollEnabled={false}
              showsHorizontalScrollIndicator={false}
              showsVerticalScrollIndicator={false}
            />
          </View>

          {/* Foto de fundo abaixo do trailer */}
          <View className="flex-1">
            <ImageBackground
              source={{ uri: getBackdropURL() }}
              className="h-full w-full"
              onError={() => setBackdropError(true)}
            />
          </View>
        </View>
      )}

      {/* Overlay leve por toda a tela - sempre visível */}
      <View
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.2)',
          zIndex: 9,
        }}
      />

      {/* Gradiente forte na parte inferior - sempre visível */}
      <LinearGradient
        colors={[
          'rgba(0, 0, 0, 1)', // fundo forte
          'rgba(0, 0, 0, 0.9)',
          'rgba(0, 0, 0, 0.5)',
          'rgba(0, 0, 0, 0.2)',
          'rgba(0, 0, 0, 0)', // transparência para transição suave
        ]}
        locations={[0, 0.2, 0.4, 0.6, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{
          position: 'absolute',
          bottom: 0,
          height: '60%',
          width: '100%',
          zIndex: 10,
        }}
        pointerEvents="none"
      />



      {/* Conteúdo principal - sempre visível */}
      <View className="absolute bottom-14 left-0 right-0 z-40 flex justify-center px-5 pb-10">
        {/* Logo ou título */}
        <View className="w-full">{renderLogoOrTitle()}</View>

        {/* Informações */}
        <View className="items-center justify-center">
          <Text className="mb-3 text-sm font-medium text-white">{renderMediaInfo()}</Text>
        </View>

        {/* Botões principais */}
        <View className="flex-row items-center justify-between">
          {/* Botão Minha Lista - Apenas ícone */}
          <TouchableOpacity
            className="h-11 w-11 items-center justify-center rounded-full bg-gray-600/70"
            onPress={handleMyList}
            disabled={isLoading}
            activeOpacity={0.8}>
            <Icon name={isInMyList ? 'check' : 'add'} size={20} color="#fff" />
          </TouchableOpacity>

          {/* Botões centrais - Play e Info colados */}
          <View className="flex-row items-center">
            {/* Botão Play */}
            <TouchableOpacity
              className="flex-row items-center justify-center rounded-l bg-white px-5 py-3"
              onPress={handlePlay}
              activeOpacity={0.9}>
              <Icon name="play-arrow" size={24} color="#000" />
              <Text className="ml-2 text-base font-semibold text-black">Assistir</Text>
            </TouchableOpacity>

            {/* Botão Info - Colado com Play */}
            {onInfo && (
              <TouchableOpacity
                className="items-center justify-center rounded-r-md border-2 border-white bg-gray-600/70 px-4 py-3"
                onPress={onInfo}
                activeOpacity={0.8}>
                <Icon name="info-outline" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Botão Som - Controla trailer */}
          <TouchableOpacity
            className="h-11 w-11 items-center justify-center rounded-full bg-gray-600/70"
            onPress={() => setShowVideo(!showVideo)}
            activeOpacity={0.8}>
            <Icon name={showVideo ? 'volume-off' : 'volume-up'} size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};