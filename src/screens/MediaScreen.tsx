import { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StatusBar,
  Linking,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

import {
  isMovieComplete,
  isSerieComplete,
  isAnimeComplete,
} from '../types/mediaTypes';
import { Hero } from '../components/mediascreen/Hero';
import { Content } from '../components/mediascreen/Content';

export const MediaScreen = ({ media: propMedia, onBack }) => {
  const navigation = useNavigation();
  const route = useRoute();

  const [media, setMedia] = useState(propMedia || route.params?.media);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedTab, setSelectedTab] = useState(() => {
    if (isMovieComplete(media)) return 'servidores';
    if (isSerieComplete(media) || isAnimeComplete(media)) return 'episódios';
    return 'similares';
  });
  const [imageErrors, setImageErrors] = useState(new Set());
  const [showVideo, setShowVideo] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (media?.trailer) setShowVideo(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [media?.trailer]);

  if (!media) {
    return (
      <View className="flex-1 items-center justify-center bg-black">
        <Text className="text-lg text-white">Erro: Mídia não encontrada</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 rounded bg-red-600 px-4 py-2">
          <Text className="text-white">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isMovieType = isMovieComplete(media);
  const isSerieType = isSerieComplete(media);
  const isAnimeType = isAnimeComplete(media);

  const navigateToPlayer = (embedUrl, episode) => {
    if (!embedUrl || embedUrl.trim() === '') {
      Alert.alert('Erro', 'Link do vídeo não disponível');
      return;
    }

    const episodeData = episode
      ? {
          id: episode.id,
          numeroEpisodio: episode.numeroEpisodio,
          title: episode.title,
          sinopse: episode.sinopse,
          duracaoMinutos: episode.duracaoMinutos,
        }
      : undefined;

    navigation.navigate('PlayerScreen', {
      media,
      embedUrl,
      episode: episodeData,
    });
  };

  const handleMainPlayButton = () => {
    if (isMovieType) {
      const embedUrl = media.embed1 || media.embed2;
      if (embedUrl) {
        navigateToPlayer(embedUrl);
      } else {
        Alert.alert('Erro', 'Nenhum link disponível');
      }
    } else if ((isSerieType || isAnimeType) && media.temporadas?.length > 0) {
      const firstEpisode = media.temporadas[0]?.episodios?.[0];
      if (firstEpisode?.embed1) {
        navigateToPlayer(firstEpisode.embed1, firstEpisode);
      } else {
        Alert.alert('Erro', 'Primeiro episódio não disponível');
      }
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleToggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handlePlayEpisode = (embedUrl, episode) => {
    navigateToPlayer(embedUrl, episode);
  };

  const handlePlayMovie = (embedUrl) => {
    navigateToPlayer(embedUrl);
  };

  const handleMediaPress = (selectedMedia) => {
    navigation.push('MediaScreen', { media: selectedMedia });
  };

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <Hero
          media={media}
          onBack={handleBack}
          onMainPlayButton={handleMainPlayButton}
          onToggleMute={handleToggleMute}
          isMuted={isMuted}
          showVideo={showVideo}
          imageErrors={imageErrors}
          setImageErrors={setImageErrors}
        />

        <Content
          media={media}
          setMedia={setMedia}
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
          selectedSeason={selectedSeason}
          setSelectedSeason={setSelectedSeason}
          onPlayEpisode={handlePlayEpisode}
          onPlayMovie={handlePlayMovie}
          onMediaPress={handleMediaPress}
        />
      </ScrollView>
    </View>
  );
};