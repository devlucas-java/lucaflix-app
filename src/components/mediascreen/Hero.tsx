import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { WebView } from 'react-native-webview';
import {
  isMovieComplete,
  isSerieComplete,
  isAnimeComplete,
  MediaComplete,
  Type,
} from '../../types/mediaTypes';
import authService from '../../service/authService';
import { Linking } from 'react-native';

const { height } = Dimensions.get('window');

const isValidUrl = (url: string) => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;
  try {
    const urlObj = new URL(trimmed);
    return (
      urlObj.protocol === 'http:' || urlObj.protocol === 'https:' || urlObj.protocol === 'data:'
    );
  } catch {
    return false;
  }
};

const getYouTubeVideoId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getValidBackdrop = (media: MediaComplete) => {
  const backdrops = [
    media.backdropURL1,
    media.backdropURL2,
    media.backdropURL3,
    media.backdropURL4,
  ].filter((url) => isValidUrl(url));

  if (backdrops.length > 0) {
    return backdrops[Math.floor(Math.random() * backdrops.length)];
  }

  const posters = [media.posterURL1, media.posterURL2].filter((url) => isValidUrl(url));
  return posters.length > 0 ? posters[0] : '';
};

interface HeroProps {
  media: MediaComplete;
  onBack: () => void;
  onMainPlayButton: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
  showVideo: boolean;
  imageErrors: Set<string>;
  setImageErrors: (errors: Set<string>) => void;
}

export const Hero: React.FC<HeroProps> = ({
  media,
  onBack,
  onMainPlayButton,
  onToggleMute,
  isMuted,
  showVideo,
  imageErrors,
  setImageErrors,
}) => {
  const isMovieType = isMovieComplete(media);
  const isSerieType = isSerieComplete(media);
  const isAnimeType = isAnimeComplete(media);
  const isAdmin = authService.isAdmin();

  const getSeasonEpisodeInfo = () => {
    if (isMovieType && media.duracaoMinutos) {
      return `${Math.floor(media.duracaoMinutos / 60)}h ${media.duracaoMinutos % 60}min`;
    }
    if (isSerieType || isAnimeType) {
      return `${media.totalTemporadas} temporada${media.totalTemporadas > 1 ? 's' : ''} • ${media.totalEpisodios} episódio${media.totalEpisodios > 1 ? 's' : ''}`;
    }
    return '';
  };

  const backdropUrl = getValidBackdrop(media);
  const shouldShowBackdrop = backdropUrl && !imageErrors.has(backdropUrl);
  const youtubeVideoId = media.trailer ? getYouTubeVideoId(media.trailer) : null;

  return (
    <View className="relative mt-10" style={{ height: height * 0.55 }}>
      <View className="h-10" />
      {showVideo && youtubeVideoId ? (
        <View className="relative aspect-video">
          <WebView
            source={{
              uri: `https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&playsinline=1&loop=1&playlist=${youtubeVideoId}`,
            }}
            style={{ flex: 1 }}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsFullscreenVideo={false}
            scrollEnabled={false}
            bounces={false}
            onError={() => setShowVideo(false)}
          />
        </View>
      ) : shouldShowBackdrop ? (
        <Image
          source={{ uri: backdropUrl }}
          className=" aspect-video"
          style={{ resizeMode: 'cover' }}
          onError={() => setImageErrors(new Set([...imageErrors, backdropUrl]))}
        />
      ) : (
        <View className="h-full w-full items-center justify-center bg-gray-700">
          <Icon name="play-arrow" size={60} color="#6B7280" />
        </View>
      )}

      <View className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

      {/* Header */}
      <View className="absolute left-0 right-0 top-0 z-10 flex-row items-center justify-between px-4">
        <TouchableOpacity onPress={onBack} className="rounded-full bg-black/50 p-2">
          <Icon name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <View className="rounded bg-red-600 px-3 py-1">
          <Text className="text-sm font-bold text-white">LUCAFLIX</Text>
        </View>

        {isAdmin && (
          <TouchableOpacity className="rounded-full bg-blue-600 p-2">
            <Icon name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      {/* Bottom Info */}
      <View className="absolute bottom-0 left-0 right-0 z-10 p-4">
        {/* <Text className="mb-2 text-3xl font-bold text-white">{media.title}</Text> */}
        <View className="mb-4 flex-col items-start gap-2">
          <Text className="text-3xl font-bold text-white">{media.title}</Text>
          <View className="flex flex-row">
          <View className="rounded bg-yellow-600 px-2 py-1">
            <Text className="text-sm font-bold text-black">{media.minAge}</Text>
          </View>
          <Text className="ml-2 text-sm text-white">classificação</Text>
          </View>
        </View>

        {/* Buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={onMainPlayButton}
            className="flex-1 flex-row items-center justify-center rounded-md bg-white px-6 py-3">
            <Icon name="play-arrow" size={20} color="#000" />
            <Text className="ml-2 text-lg font-bold text-black">Assistir</Text>
          </TouchableOpacity>

          {showVideo && youtubeVideoId && (
            <TouchableOpacity
              onPress={onToggleMute}
              className="flex-row items-center justify-center rounded-md bg-gray-600/80 px-4 py-3">
              <Icon name={isMuted ? 'volume-off' : 'volume-up'} size={20} color="#fff" />
            </TouchableOpacity>
          )}

          {!showVideo && media.trailer && (
            <TouchableOpacity
              onPress={() => Linking.openURL(media.trailer)}
              className="flex-row items-center justify-center rounded-md bg-gray-600/80 px-4 py-3">
              <Icon name="info" size={20} color="#fff" />
            </TouchableOpacity>
          )}
        </View>

        <View className="mt-4 flex-row flex-wrap items-center gap-3">
          <Text className="text-base font-medium text-white">{media.anoLancamento ?? 'N/A'}</Text>

          <Text className="text-base font-medium text-white">{getSeasonEpisodeInfo()}</Text>

          <View className="rounded bg-gray-800 px-2 py-1">
            <Text className="text-xs text-white">HD</Text>
          </View>

          <View className="flex-row items-center rounded bg-gray-800 px-2 py-1">
            {/* Você pode trocar por outro ícone se quiser */}
            <Icon name="volume-up" size={12} color="#fff" />
          </View>

          <View className="rounded bg-gray-800 px-2 py-1">
            <Text className="text-xs text-white">CC</Text>
          </View>

          {media.type === Type.ANIME && (
            <View className="rounded bg-purple-700 px-2 py-1">
              <Text className="text-xs text-white">ANIME</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};
