import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  BackHandler,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';
import MiniBrowserPlayer from './MiniBrowserPlayer';
import { RootStackParamList } from '../routes/Router';

const { width, height } = Dimensions.get('window');

type PlayerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'PlayerScreen'>;

interface RouteParams {
  media: any;
  embedUrl: string;
  episode?: {
    id: number;
    numeroEpisodio: number;
    title: string;
    sinopse: string;
    duracaoMinutos: number;
    embed1?: string;
    embed2?: string;
  };
  allEpisodes?: Array<{
    id: number;
    numeroEpisodio: number;
    title: string;
    sinopse: string;
    duracaoMinutos: number;
    embed1?: string;
    embed2?: string;
  }>;
}

const removeFirstSlash = (url: string): string => {
  if (url.startsWith('/')) {
    return url.slice(1);
  }
  return url;
};

// Função para identificar o tipo de URL e completar se necessário
const identifyAndCompleteUrl = (url) => {
  if (!url) return { url, type: 'unknown' };

  // Se já tem protocolo (Rede Canais já vem completo)
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (url.includes('server.php') || url.includes('redecaneais')) {
      return { url, type: 'rede_canais' };
    } else if (url.includes('embedder.net')) {
      return { url, type: 'embedder' };
    } else if (url.includes('superflixapi')) {
      return { url, type: 'superflix' };
    }
    return { url, type: 'unknown' };
  }

  // URLs parciais que precisam ser completadas

  // Identificar Embedder: sempre tem /e/
  if (url.includes('/e/') || url.startsWith('e/')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    const completeUrl = `https://embedder.net${cleanPath}`;
    return { url: completeUrl, type: 'embedder' };
  }

  // Identificar Superflix: sempre tem /filme/ ou /serie/
  if (
    url.includes('/filme/') ||
    url.includes('/serie/') ||
    url.startsWith('filme/') ||
    url.startsWith('serie/')
  ) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    const completeUrl = `https://superflixapi.my${cleanPath}`;
    return { url: completeUrl, type: 'superflix' };
  }

  // Identificar Rede Canais: sempre tem server.php (mas não deveria chegar aqui pois já vem completo)
  if (url.includes('server.php')) {
    const fixedUrl = removeFirstSlash(url);
    return { url: fixedUrl, type: 'rede_canais' };
  }

  // Fallback: se começa com /*/, tenta embedder
 if (/^\/.\//.test(url)) {
  const completeUrl = `https://embedder.net${url}`;
  return { url: completeUrl, type: 'embedder' };
}


  // Fallback final
  return { url: `https://embedder.net/${url}`, type: 'embedder' };
};

// Função para completar URL se necessário (wrapper para compatibilidade)
const completeUrl = (url) => {
  const result = identifyAndCompleteUrl(url);
  return result.url;
};

export const PlayerScreen = () => {
  const navigation = useNavigation<PlayerScreenNavigationProp>();
  const route = useRoute<{ params: RouteParams }>();

  const { media, embedUrl, episode, allEpisodes } = route.params;

  const [showServerModal, setShowServerModal] = useState(false);
  const [selectedServer, setSelectedServer] = useState(1);
  const [currentEmbedUrl, setCurrentEmbedUrl] = useState(completeUrl(embedUrl));

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const urlInfo = identifyAndCompleteUrl(embedUrl);
    setCurrentEmbedUrl(urlInfo.url);

    // Debug: mostrar informações da URL
    console.log('PlayerScreen - URL Original:', embedUrl);
    console.log('PlayerScreen - URL Completa:', urlInfo.url);
    console.log('PlayerScreen - Tipo:', urlInfo.type);
  }, [embedUrl]);

  const handleBackPress = () => {
    return false;
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const handleServerChange = (serverNumber) => {
    setSelectedServer(serverNumber);
    setShowServerModal(false);

    let newUrl = embedUrl;
    if (episode) {
      newUrl = serverNumber === 1 ? episode.embed1 : episode.embed2;
    } else if (media) {
      newUrl = serverNumber === 1 ? media.embed1 : media.embed2;
    }

    if (newUrl && newUrl.trim() !== '') {
      const urlInfo = identifyAndCompleteUrl(newUrl);
      setCurrentEmbedUrl(urlInfo.url);

      // Debug: mostrar informações da troca de servidor
      console.log('Trocando servidor - URL Original:', newUrl);
      console.log('Trocando servidor - URL Completa:', urlInfo.url);
      console.log('Trocando servidor - Tipo:', urlInfo.type);

      navigation.replace('PlayerScreen', {
        media,
        embedUrl: newUrl,
        episode,
        allEpisodes,
      });
    } else {
      Alert.alert('Erro', 'Servidor não disponível');
    }
  };

  const hasMultipleServers = () => {
    if (episode) {
      return (
        episode.embed1 &&
        episode.embed2 &&
        episode.embed1.trim() !== '' &&
        episode.embed2.trim() !== ''
      );
    } else if (media) {
      return (
        media.embed1 && media.embed2 && media.embed1.trim() !== '' && media.embed2.trim() !== ''
      );
    }
    return false;
  };

  // Função para navegar para próximo episódio
  const handleNextEpisode = () => {
    if (!episode || !allEpisodes) return;

    const currentIndex = allEpisodes.findIndex((ep) => ep.id === episode.id);
    const nextEpisode = allEpisodes[currentIndex + 1];

    if (nextEpisode) {
      const nextUrl = nextEpisode.embed1 || nextEpisode.embed2;
      if (nextUrl) {
        navigation.replace('PlayerScreen', {
          media,
          embedUrl: nextUrl,
          episode: nextEpisode,
          allEpisodes,
        });
      }
    }
  };

  // Função para navegar para episódio anterior
  const handlePreviousEpisode = () => {
    if (!episode || !allEpisodes) return;

    const currentIndex = allEpisodes.findIndex((ep) => ep.id === episode.id);
    const previousEpisode = allEpisodes[currentIndex - 1];

    if (previousEpisode) {
      const previousUrl = previousEpisode.embed1 || previousEpisode.embed2;
      if (previousUrl) {
        navigation.replace('PlayerScreen', {
          media,
          embedUrl: previousUrl,
          episode: previousEpisode,
          allEpisodes,
        });
      }
    }
  };

  // Verificar se há próximo/anterior episódio
  const hasNextEpisode = () => {
    if (!episode || !allEpisodes) return false;
    const currentIndex = allEpisodes.findIndex((ep) => ep.id === episode.id);
    return currentIndex < allEpisodes.length - 1;
  };

  const hasPreviousEpisode = () => {
    if (!episode || !allEpisodes) return false;
    const currentIndex = allEpisodes.findIndex((ep) => ep.id === episode.id);
    return currentIndex > 0;
  };

  // Verificar se a URL é válida
  if (!embedUrl || embedUrl.trim() === '') {
    return (
      <View className="flex-1 items-center justify-center bg-black px-5">
        <StatusBar barStyle="light-content" backgroundColor="#000" hidden />
        <Icon name="error-outline" size={60} color="#ff6b6b" />
        <Text className="mb-2 mt-4 text-xl font-bold text-white">Link não disponível</Text>
        <Text className="mb-8 text-center text-sm text-gray-300">
          O link para este {episode ? 'episódio' : 'filme'} não está disponível.
        </Text>
        <TouchableOpacity
          className="flex-row items-center rounded-lg bg-red-500 px-5 py-3"
          onPress={handleClose}>
          <Icon name="arrow-back" size={20} color="#fff" />
          <Text className="ml-2 text-sm font-bold text-white">Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" hidden />

      {/* Player em tela cheia */}
      <MiniBrowserPlayer
        embedUrl={currentEmbedUrl}
        media={media}
        episode={episode}
        onClose={handleClose}
        onBack={handleClose}
        onNextEpisode={hasNextEpisode() ? handleNextEpisode : null}
        onPreviousEpisode={hasPreviousEpisode() ? handlePreviousEpisode : null}
        isSeries={!!episode}
      />

      {/* Modal de seleção de servidor */}
      {showServerModal && (
        <View className="absolute inset-0 z-50 items-center justify-center bg-black bg-opacity-90">
          <View className="mx-5 w-80 max-w-full rounded-2xl bg-gray-900 p-6">
            <View className="mb-6 flex-row items-center justify-between">
              <Text className="text-lg font-bold text-white">Trocar Servidor</Text>
              <TouchableOpacity onPress={() => setShowServerModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* Seleção de Servidor */}
            {hasMultipleServers() && (
              <View className="mb-6">
                <Text className="mb-3 text-sm text-gray-300">Selecione o servidor:</Text>
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    className={`flex-1 rounded-lg px-4 py-3 ${
                      selectedServer === 1 ? 'bg-red-500' : 'bg-gray-700'
                    }`}
                    onPress={() => handleServerChange(1)}>
                    <Text
                      className={`text-center font-bold ${
                        selectedServer === 1 ? 'text-white' : 'text-gray-300'
                      }`}>
                      Servidor 1
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    className={`flex-1 rounded-lg px-4 py-3 ${
                      selectedServer === 2 ? 'bg-red-500' : 'bg-gray-700'
                    }`}
                    onPress={() => handleServerChange(2)}>
                    <Text
                      className={`text-center font-bold ${
                        selectedServer === 2 ? 'text-white' : 'text-gray-300'
                      }`}>
                      Servidor 2
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* Informações do que está sendo reproduzido */}
            <View className="border-t border-gray-700 pt-4">
              <Text className="mb-2 text-xs text-gray-400">Reproduzindo:</Text>
              <Text className="text-base font-bold text-white">{media?.title}</Text>
              {episode && (
                <Text className="mt-1 text-sm text-gray-300">
                  Episódio {episode.numeroEpisodio} - {episode.title}
                </Text>
              )}
            </View>
          </View>
        </View>
      )}
    </View>
  );
};

export default PlayerScreen;
