import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { CATEGORIA_LABELS, isSerieComplete, isAnimeComplete } from '../../types/mediaTypes';
import authService from '../../service/authService';
import { toggleMyList, toggleLike } from '../../utils/mediaService';
import { Episode } from './Episode';
import { Similar } from './Similar';

interface ContentProps {
  media: any;
  setMedia: (media: any) => void;
  selectedTab: string;
  setSelectedTab: (tab: string) => void;
  selectedSeason: number;
  setSelectedSeason: (season: number) => void;
  onPlayEpisode: (embedUrl: string, episode: any) => void;
  onPlayMovie: (embedUrl: string) => void;
  onMediaPress: (media: any) => void;
}

export const Content: React.FC<ContentProps> = ({
  media,
  setMedia,
  selectedTab,
  setSelectedTab,
  selectedSeason,
  setSelectedSeason,
  onPlayEpisode,
  onPlayMovie,
  onMediaPress,
}) => {
  const [isLiked, setIsLiked] = useState(media?.userLiked || false);
  const [isInList, setIsInList] = useState(media?.inUserList || false);
  const [isLoading, setIsLoading] = useState(false);
  const [seasonDropdownVisible, setSeasonDropdownVisible] = useState(false);

  const isSerieType = isSerieComplete(media);
  const isAnimeType = isAnimeComplete(media);
  const isLoggedIn = authService.isAuthenticated();

  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      Alert.alert('Login necessário', 'Você precisa estar logado para curtir.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await toggleLike(media.id);
      if (response?.success) {
        const newLikedState = !isLiked;
        setIsLiked(newLikedState);
        setMedia((prev) => ({
          ...prev,
          userLiked: newLikedState,
          totalLikes: response.totalLikes || prev.totalLikes,
        }));
      }
    } catch (error) {
      console.error('Erro ao curtir:', error);
      Alert.alert('Erro', 'Não foi possível curtir este conteúdo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleList = async () => {
    if (!isLoggedIn) {
      Alert.alert('Login necessário', 'Você precisa estar logado para adicionar à lista.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await toggleMyList(media.id);
      if (response?.success) {
        const newListState = !isInList;
        setIsInList(newListState);
        setMedia((prev) => ({
          ...prev,
          inUserList: newListState,
        }));
      }
    } catch (error) {
      console.error('Erro ao adicionar à lista:', error);
      Alert.alert('Erro', 'Não foi possível adicionar à lista.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="px-4 py-6">
      <Text className="mb-4 text-base leading-6 text-white">{media.sinopse}</Text>

      <View className="mb-6">
        <View className="mb-2 flex-row">
          <Text className="text-sm text-gray-400">Gêneros: </Text>
          <Text className="flex-1 text-sm text-white">
            {media.categoria?.map((cat) => CATEGORIA_LABELS[cat] || cat).join(', ')}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View className="mb-6 flex-row items-center justify-between">
        <View className="flex-row gap-6">
          <TouchableOpacity
            className="items-center"
            onPress={handleToggleList}
            disabled={isLoading}>
            <Icon
              name={isInList ? 'check' : 'add'}
              size={24}
              color={isInList ? '#22c55e' : '#fff'}
            />
            <Text className="mt-1 text-xs text-white">
              {isInList ? 'Na Lista' : 'Minha Lista'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="items-center"
            onPress={handleToggleLike}
            disabled={isLoading}>
            <Ionicons
              name={isLiked ? 'thumbs-up' : 'thumbs-up-outline'}
              size={24}
              color={isLiked ? '#22c55e' : '#fff'}
            />
            <Text className="mt-1 text-xs text-white">{isLiked ? 'Curtido' : 'Avaliar'}</Text>
          </TouchableOpacity>

          <TouchableOpacity className="items-center">
            <MaterialCommunityIcons name="download" size={24} color="#fff" />
            <Text className="mt-1 text-xs text-white">Download</Text>
          </TouchableOpacity>
        </View>

        {/* Season Selector */}
        {(isSerieType || isAnimeType) && media.temporadas?.length > 1 && (
          <View className="mb-4 relative z-10">
            <Text className="mb-2 text-xl font-bold text-white">Temporadas</Text>

            <TouchableOpacity
              onPress={() => setSeasonDropdownVisible((prev) => !prev)}
              className="flex-row items-center justify-between rounded-md border border-gray-600 bg-gray-800 px-5 py-2">
              <Text className="text-base font-medium text-white">
                Temporada {selectedSeason}
              </Text>
              <Icon
                name={seasonDropdownVisible ? 'chevron-up' : 'chevron-down'}
                size={20}
                color="white"
              />
            </TouchableOpacity>

            {seasonDropdownVisible && (
              <View className="absolute top-20 left-0 right-0 bg-gray-900 rounded-xl p-2 shadow-lg border border-gray-700 max-h-100">
                <ScrollView>
                  {media.temporadas.map((temporada) => (
                    <TouchableOpacity
                      key={temporada.id}
                      onPress={() => {
                        setSelectedSeason(temporada.numeroTemporada);
                        setSeasonDropdownVisible(false);
                      }}
                      className={`px-3 py-2 rounded-lg mb-1 ${
                        selectedSeason === temporada.numeroTemporada
                          ? 'bg-white'
                          : 'bg-gray-800'
                      }`}>
                      <Text
                        className={`text-base font-medium ${
                          selectedSeason === temporada.numeroTemporada
                            ? 'text-black'
                            : 'text-white'
                        }`}>
                        Temporada {temporada.numeroTemporada}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>
        )}
      </View>

      {/* Tabs */}
      <View className="mb-4 flex-row rounded-lg bg-transparent p-1">
        {(isSerieType || isAnimeType) && (
          <TouchableOpacity
            onPress={() => setSelectedTab('episódios')}
            className={`flex-1 rounded-md px-3 py-2 ${
              selectedTab === 'episódios' ? 'border-t-2 border-t-red-600' : 'bg-transparent'
            }`}>
            <Text className="text-center font-medium text-white">Episódios</Text>
          </TouchableOpacity>
        )}

        {!isSerieType && !isAnimeType && (
          <TouchableOpacity
            onPress={() => setSelectedTab('servidores')}
            className={`flex-1 rounded-md px-3 py-2 ${
              selectedTab === 'servidores' ? 'border-t-2 border-t-red-600' : 'bg-transparent'
            }`}>
            <Text className="text-center font-medium text-white">Servidores</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          onPress={() => setSelectedTab('similares')}
          className={`flex-1 rounded-md px-3 py-2 ${
            selectedTab === 'similares' ? 'border-t-2 border-t-red-600' : 'bg-transparent'
          }`}>
          <Text className="text-center font-medium text-white">Similares</Text>
        </TouchableOpacity>
        <View className="w-18 h-1" />
        <View className="w-18 h-1" />
      </View>

      {/* Tab Content */}
      <View className="mb-6">
        <Episode
          media={media}
          selectedSeason={selectedSeason}
          onPlayEpisode={onPlayEpisode}
          onPlayMovie={onPlayMovie}
          selectedTab={selectedTab}
        />
        <Similar
          media={media}
          selectedTab={selectedTab}
          onMediaPress={onMediaPress}
        />
      </View>
    </View>
  );
};