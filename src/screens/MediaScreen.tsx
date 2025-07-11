import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  StatusBar,
  Linking,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import {
  MediaComplete,
  isMovieComplete,
  isSerieComplete,
  isAnimeComplete,
  CATEGORIA_LABELS,
  EpisodioDTO,
} from '../types/mediaTypes';
import { RootStackParamList } from '../routes/Router';
import authService from '../service/authService';

const { width, height } = Dimensions.get('window');

interface MediaScreenProps {
  media?: MediaComplete;
  onBack?: () => void;
  onMediaSelect?: (media: any) => void;
  onMediaChange?: (media: any) => void;
}

interface RouteParams {
  media: MediaComplete;
}

type MediaScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MediaScreen'>;

// Função para verificar se URL é válida
const isValidUrl = (url: string | null | undefined): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '' || trimmed === 'null' || trimmed === 'undefined') return false;
  
  try {
    const urlObj = new URL(trimmed);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:' || urlObj.protocol === 'data:';
  } catch {
    return false;
  }
};

// Função para obter backdrop válido
const getValidBackdrop = (media: MediaComplete): string => {
  const backdrops = [
    media.backdropURL1,
    media.backdropURL2,
    media.backdropURL3,
    media.backdropURL4,
  ].filter((url) => isValidUrl(url));

  if (backdrops.length > 0) {
    return backdrops[0]!;
  }

  const posters = [media.posterURL1, media.posterURL2].filter((url) => isValidUrl(url));
  return posters.length > 0 ? posters[0]! : '';
};

const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
};

export const MediaScreen: React.FC<MediaScreenProps> = ({
  media: propMedia,
  onBack,
  onMediaSelect,
  onMediaChange,
}) => {
  const navigation = useNavigation<MediaScreenNavigationProp>();
  const route = useRoute<{ params: RouteParams }>();
  
  // Usar mídia dos props ou da rota
  const media = propMedia || route.params?.media;
  
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [showTrailer, setShowTrailer] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  if (!media) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-white text-lg">Erro: Mídia não encontrada</Text>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mt-4 bg-red-600 px-4 py-2 rounded"
        >
          <Text className="text-white">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isMovie = isMovieComplete(media);
  const isSerie = isSerieComplete(media);
  const isAnime = isAnimeComplete(media);

  // Verificar se o usuário é admin
  const isLoggedIn = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigation.goBack();
    }
  };

  const handleImageError = (imageUrl: string) => {
    setImageErrors(prev => new Set([...prev, imageUrl]));
  };

  // Função para navegar para o player
  const navigateToPlayer = (embedUrl: string, episode?: EpisodioDTO) => {
    if (!embedUrl || embedUrl.trim() === '') {
      Alert.alert('Erro', 'Link do vídeo não disponível');
      return;
    }

    const episodeData = episode ? {
      id: episode.id,
      numeroEpisodio: episode.numeroEpisodio,
      title: episode.title,
      sinopse: episode.sinopse,
      duracaoMinutos: episode.duracaoMinutos,
    } : undefined;

    navigation.navigate('PlayerScreen', {
      media,
      embedUrl,
      episode: episodeData,
    });
  };

  const handlePlayTrailer = () => {
    if (media.trailer && media.trailer.trim() !== '') {
      setShowTrailer(true);
      Linking.openURL(media.trailer);
    }
  };

  const handleUpdateMedia = () => {
    let mediaType = '';
    if (isMovie) mediaType = 'filme';
    else if (isSerie) mediaType = 'série';
    else if (isAnime) mediaType = 'anime';
    
    Alert.alert('Atualizar', `Atualizar ${mediaType}: ${media.title}`);
  };

  const getMediaTypeLabel = () => {
    if (isMovie) return 'filme';
    if (isSerie) return 'série';
    if (isAnime) return 'anime';
    return 'mídia';
  };

  const getSeasonEpisodeInfo = () => {
    if (isMovie && media.duracaoMinutos) {
      return formatDuration(media.duracaoMinutos);
    }
    
    if (isSerie || isAnime) {
      const seasonText = media.totalTemporadas === 1 ? 'temporada' : 'temporadas';
      const episodeText = media.totalEpisodios === 1 ? 'episódio' : 'episódios';
      
      return `${media.totalTemporadas} ${seasonText} • ${media.totalEpisodios} ${episodeText}`;
    }
    
    return '';
  };

  const getMovieEpisodes = (movie: any) => {
    const episodes = [];

    if (movie.embed1 && movie.embed1.trim() !== '') {
      episodes.push({
        id: 1,
        numeroEpisodio: 1,
        title: `${movie.title} - Parte 1`,
        sinopse: movie.sinopse,
        duracaoMinutos: Math.floor((movie.duracaoMinutos || 120) / 2),
        embed1: movie.embed1,
        embed2: '',
        dataCadastro: new Date(),
      });
    }

    if (movie.embed2 && movie.embed2.trim() !== '') {
      episodes.push({
        id: 2,
        numeroEpisodio: 2,
        title: `${movie.title} - Parte 2`,
        sinopse: movie.sinopse,
        duracaoMinutos: Math.ceil((movie.duracaoMinutos || 120) / 2),
        embed1: movie.embed2,
        embed2: '',
        dataCadastro: new Date(),
      });
    }

    return episodes;
  };

  const handleMainPlayButton = () => {
    if (isMovie) {
      // Para filmes, usar o primeiro embed disponível
      const embedUrl = media.embed1 || media.embed2;
      if (embedUrl) {
        navigateToPlayer(embedUrl);
      } else {
        Alert.alert('Erro', 'Nenhum link de vídeo disponível');
      }
    } else if ((isSerie || isAnime) && media.temporadas && media.temporadas.length > 0) {
      // Para séries/animes, usar o primeiro episódio da primeira temporada
      const firstEpisode = media.temporadas[0]?.episodios?.[0];
      if (firstEpisode && firstEpisode.embed1) {
        navigateToPlayer(firstEpisode.embed1, firstEpisode);
      } else {
        Alert.alert('Erro', 'Primeiro episódio não disponível');
      }
    } else {
      Alert.alert('Erro', 'Conteúdo não disponível para reprodução');
    }
  };

  const backdropUrl = getValidBackdrop(media);
  const shouldShowBackdrop = backdropUrl && !imageErrors.has(backdropUrl);

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      
      <ScrollView 
        ref={scrollViewRef}
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View className="relative">
          {/* Backdrop/Trailer Container */}
          <View className="relative" style={{ height: height * 0.65 }}>
            {shouldShowBackdrop ? (
              <Image
                source={{ uri: backdropUrl }}
                className="w-full h-full"
                style={{ resizeMode: 'cover' }}
                onError={() => handleImageError(backdropUrl)}
              />
            ) : (
              <View className="w-full h-full bg-gray-700 justify-center items-center">
                <Icon name="play-arrow" size={60} color="#6B7280" />
              </View>
            )}
            
            {/* Gradient Overlay */}
            <View className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
          </View>

          {/* Header Controls */}
          <View className="absolute top-10 left-0 right-0 flex-row justify-between items-center px-4 z-10">
            <TouchableOpacity
              onPress={handleBack}
              className="bg-black/50 rounded-full p-2"
            >
              <Icon name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>
            
            {/* Logo */}
            <View className="bg-red-600 rounded px-3 py-1">
              <Text className="text-white font-bold text-sm">LUCAFLIX</Text>
            </View>
            
            {isAdmin && (
              <TouchableOpacity
                onPress={handleUpdateMedia}
                className="bg-blue-600 rounded-full p-2"
              >
                <Icon name="edit" size={20} color="#fff" />
              </TouchableOpacity>
            )}
          </View>

          {/* Title and Main Info */}
          <View className="absolute bottom-0 left-0 right-0 p-4 z-10">
            <Text className="text-white text-3xl font-bold mb-2">{media.title}</Text>
            
            {/* Media Info */}
            <View className="flex-row flex-wrap items-center mb-4 gap-2">
              <Text className="text-white text-base font-medium">
                {media.anoLancamento}
              </Text>
              <Text className="text-white text-base font-medium">
                {getSeasonEpisodeInfo()}
              </Text>
              <View className="bg-gray-700 px-2 py-1 rounded">
                <Text className="text-white text-xs">HD</Text>
              </View>
              <View className="bg-gray-700 px-2 py-1 rounded">
                <Text className="text-white text-xs">CC</Text>
              </View>
              {isAnime && (
                <View className="bg-purple-600 px-2 py-1 rounded">
                  <Text className="text-white text-xs">ANIME</Text>
                </View>
              )}
            </View>

            {/* Age Rating */}
            <View className="flex-row items-center mb-4">
              <View className="bg-yellow-600 px-2 py-1 rounded">
                <Text className="text-black text-sm font-bold">{media.minAge}</Text>
              </View>
              <Text className="text-white ml-2 text-sm">classificação</Text>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-3">
              {/* Play Button */}
              <TouchableOpacity
                onPress={handleMainPlayButton}
                className="bg-white rounded-md flex-row items-center justify-center py-3 px-6 flex-1"
              >
                <Icon name="play-arrow" size={20} color="#000" />
                <Text className="text-black text-lg font-bold ml-2">Assistir</Text>
              </TouchableOpacity>

              {/* Trailer Button */}
              {media.trailer && (
                <TouchableOpacity
                  onPress={handlePlayTrailer}
                  className="bg-gray-600/80 rounded-md flex-row items-center justify-center py-3 px-4"
                >
                  <Icon name="info" size={20} color="#fff" />
                  <Text className="text-white text-sm font-medium ml-1">Trailer</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Secondary Actions */}
            <View className="flex-row items-center justify-between mt-4">
              <View className="flex-row gap-6">
                <TouchableOpacity className="items-center">
                  <Icon name="add" size={24} color="#fff" />
                  <Text className="text-white text-xs mt-1">Minha Lista</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="items-center">
                  <Ionicons name="thumbs-up" size={24} color="#fff" />
                  <Text className="text-white text-xs mt-1">Avaliar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity className="items-center">
                  <MaterialCommunityIcons name="download" size={24} color="#fff" />
                  <Text className="text-white text-xs mt-1">Download</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Content Section */}
        <View className="px-4 py-6">
          {/* Synopsis */}
          <View className="mb-6">
            <Text className="text-white text-base leading-6 mb-4">{media.sinopse}</Text>
          </View>

          {/* Additional Info */}
          <View className="mb-6">
            <View className="flex-row mb-2">
              <Text className="text-gray-400 text-sm">Elenco: </Text>
              <Text className="text-white text-sm flex-1">
                {isAnime 
                  ? 'Elenco de dublagem japonês original' 
                  : 'Elenco principal do filme/série'
                }
              </Text>
              <Text className="text-red-600 text-sm"> mais</Text>
            </View>
            
            <View className="flex-row mb-2">
              <Text className="text-gray-400 text-sm">Gêneros: </Text>
              <Text className="text-white text-sm flex-1">
                {media.categoria.map(cat => CATEGORIA_LABELS[cat]).join(', ')}
              </Text>
            </View>

            <View className="flex-row mb-2">
              <Text className="text-gray-400 text-sm">Esta {getMediaTypeLabel()} é: </Text>
              <Text className="text-white text-sm flex-1">
                {isAnime 
                  ? 'Emocionante, Aventura, Japonês' 
                  : 'Envolvente, Dramático, Cativante'
                }
              </Text>
            </View>
          </View>

          {/* Season Selector */}
          {((isSerie || isAnime) && media.temporadas && media.temporadas.length > 1) && (
            <View className="mb-4">
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View className="flex-row gap-2 px-1">
                  {media.temporadas.map((temporada) => (
                    <TouchableOpacity
                      key={temporada.id}
                      onPress={() => setSelectedSeason(temporada.numeroTemporada)}
                      className={`px-4 py-2 rounded-full border ${
                        selectedSeason === temporada.numeroTemporada
                          ? 'bg-white border-white'
                          : 'bg-transparent border-gray-600'
                      }`}
                    >
                      <Text
                        className={`text-sm font-medium ${
                          selectedSeason === temporada.numeroTemporada
                            ? 'text-black'
                            : 'text-white'
                        }`}
                      >
                        Temporada {temporada.numeroTemporada}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Episodes Section */}
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-white text-xl font-bold">
                {isMovie ? 'Partes disponíveis' : 'Episódios'}
              </Text>
            </View>

            {/* Episodes List */}
            <View className="gap-2">
              {isMovie && getMovieEpisodes(media).map((episode) => (
                <TouchableOpacity
                  key={episode.id}
                  onPress={() => navigateToPlayer(episode.embed1, episode)}
                  className="bg-gray-900 rounded-xl p-3 flex-row items-center"
                >
                  <View className="w-16 h-16 bg-gray-700 rounded-lg justify-center items-center mr-3">
                    <Text className="text-white font-bold text-lg">
                      {episode.numeroEpisodio}
                    </Text>
                  </View>
                  
                  <View className="flex-1">
                    <Text className="text-white font-medium text-base mb-1">
                      {episode.title}
                    </Text>
                    <Text className="text-gray-400 text-sm">
                      {formatDuration(episode.duracaoMinutos)}
                    </Text>
                  </View>
                  
                  <View className="ml-3">
                    <Icon name="play-circle-filled" size={24} color="#fff" />
                  </View>
                </TouchableOpacity>
              ))}

              {((isSerie || isAnime) && media.temporadas) &&
                media.temporadas
                  .find(t => t.numeroTemporada === selectedSeason)
                  ?.episodios?.map((episode) => (
                    <TouchableOpacity
                      key={episode.id}
                      onPress={() => navigateToPlayer(episode.embed1, episode)}
                      className="bg-gray-900 rounded-xl p-3 flex-row items-center"
                    >
                      <View className="w-16 h-16 bg-gray-700 rounded-lg justify-center items-center mr-3">
                        <Text className="text-white font-bold text-lg">
                          {episode.numeroEpisodio}
                        </Text>
                      </View>
                      
                      <View className="flex-1">
                        <Text className="text-white font-medium text-base mb-1">
                          {episode.title}
                        </Text>
                        <Text className="text-gray-400 text-sm mb-1">
                          {formatDuration(episode.duracaoMinutos)}
                        </Text>
                        <Text className="text-gray-300 text-xs" numberOfLines={2}>
                          {episode.sinopse}
                        </Text>
                      </View>
                      
                      <View className="ml-3">
                        <Icon name="play-circle-filled" size={24} color="#fff" />
                      </View>
                    </TouchableOpacity>
                  ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};