import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { formatDuration } from '../../utils/mediaService';
import { isMovieComplete, isSerieComplete, isAnimeComplete } from '../../types/mediaTypes';

interface EpisodeProps {
  media: any;
  selectedSeason: number;
  onPlayEpisode: (embedUrl: string, episode: any) => void;
  onPlayMovie: (embedUrl: string) => void;
  selectedTab: string;
}

export const Episode: React.FC<EpisodeProps> = ({
  media,
  selectedSeason,
  onPlayEpisode,
  onPlayMovie,
  selectedTab,
}) => {
  const isMovieType = isMovieComplete(media);
  const isSerieType = isSerieComplete(media);
  const isAnimeType = isAnimeComplete(media);

  const getMovieServers = () => {
    const servers = [];
    if (media.embed1?.trim()) {
      servers.push({ id: 1, name: `${media.title} - Servidor 1`, url: media.embed1 });
    }
    if (media.embed2?.trim()) {
      servers.push({ id: 2, name: `${media.title} - Servidor 2`, url: media.embed2 });
    }
    return servers;
  };

  const renderEpisodes = () => {
    if (isMovieType) return null;

    const currentSeason = media.temporadas?.find((t) => t.numeroTemporada === selectedSeason);
    return (
      <View className="gap-2">
        {currentSeason?.episodios?.map((episode, index) => (
          <TouchableOpacity
            key={episode.id}
            onPress={() => onPlayEpisode(episode.embed1, episode)}
            className="flex-row items-center rounded-lg bg-gray-900 p-3">
            <View className="mr-3 h-16 w-16 items-center justify-center rounded-lg bg-gray-700">
              <Text className="text-lg font-bold text-white">{index + 1}</Text>
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-base font-medium text-white">{episode.title}</Text>
              <Text className="mb-1 text-sm text-gray-400">
                {formatDuration(episode.duracaoMinutos)}
              </Text>
              <Text className="text-xs text-gray-300" numberOfLines={2}>
                {episode.sinopse}
              </Text>
            </View>
            <Icon name="play-circle-filled" size={24} color="#fff" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const renderServers = () => {
    if (!isMovieType) return null;

    const servers = getMovieServers();
    return (
      <View className="gap-2">
        {servers.map((server) => (
          <TouchableOpacity
            key={server.id}
            onPress={() => onPlayMovie(server.url)}
            className="flex-row items-center rounded-lg bg-gray-900 p-3">
            <View className="mr-3 h-16 w-16 items-center justify-center rounded-lg bg-gray-700">
              <Icon name="play-arrow" size={24} color="#fff" />
            </View>
            <View className="flex-1">
              <Text className="mb-1 text-base font-medium text-white">{server.name}</Text>
              <Text className="text-sm text-gray-400">Clique para assistir</Text>
            </View>
            <Icon name="play-circle-filled" size={24} color="#fff" />
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  if (selectedTab === 'episódios') {
    return renderEpisodes();
  }

  if (selectedTab === 'servidores') {
    return renderServers();
  }

  return null;
};