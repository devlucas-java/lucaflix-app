import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  Dimensions,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import Icon from "react-native-vector-icons";
import type {
  MovieCompleteDTO,
  SerieCompleteDTO,
  AnimeCompleteDTO,
} from "../types/mediaTypes";
import { Type } from "../types/mediaTypes";
import {
  isMovie,
  isAnime,
  isSerie,
  truncateText,
  toggleMyList,
  toggleLike,
  getMediaDuration,
} from "../utils/mediaService";
import authService from "../service/authService";

const { width, height } = Dimensions.get("window");

interface HeroSectionProps {
  media: MovieCompleteDTO | SerieCompleteDTO | AnimeCompleteDTO;
  onInfo?: () => void;
  onPlay?: () => void;
  useH1?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  media,
  onInfo,
  onPlay,
  useH1 = false,
}) => {
  const [muted, setMuted] = useState(true);
  const [isInMyList, setIsInMyList] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  useEffect(() => {
    setIsInMyList(media?.inUserList || false);
    setIsLiked(media?.userLiked || false);
  }, [media]);

  const handleMyList = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await toggleMyList(media);
      setIsInMyList(result);
    } catch (error) {
      console.error("Erro ao adicionar/remover da minha lista:", error);
      Alert.alert("Erro", "Não foi possível atualizar sua lista");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const result = await toggleLike(media);
      setIsLiked(result);
    } catch (error) {
      console.error("Erro ao curtir/descurtir:", error);
      Alert.alert("Erro", "Não foi possível curtir/descurtir");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = () => {
    if (onPlay) {
      onPlay();
    }
  };

  const getMediaInfo = () => {
    const duration = getMediaDuration(media);

    if (isMovie(media)) {
      return {
        duration,
        type: Type.MOVIE,
      };
    } else if (isAnime(media)) {
      return {
        duration,
        type: Type.ANIME,
      };
    } else if (isSerie(media)) {
      return {
        duration,
        type: Type.SERIE,
      };
    } else {
      return {
        duration: "Duração desconhecida",
        type: "DESCONHECIDO",
      };
    }
  };

  const mediaInfo = getMediaInfo();

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

  const youtubeURL = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${
        muted ? 1 : 0
      }&controls=0&loop=1&playlist=${videoId}&modestbranding=1&showinfo=0&rel=0&iv_load_policy=3&disablekb=1&fs=0`
    : null;

  if (!media) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-white text-base">Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black" showsVerticalScrollIndicator={false}>
      <View style={{ height: height * 0.8 }} className="relative">
        {/* Background Video/Image */}
        <View className="absolute inset-0">
          {youtubeURL && !videoError && showVideo ? (
            <WebView
              source={{ uri: youtubeURL }}
              style={{ flex: 1 }}
              allowsInlineMediaPlayback
              mediaPlaybackRequiresUserAction={false}
              onError={() => setVideoError(true)}
            />
          ) : (
            <Image
              source={{ uri: media.posterURL1 }}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
              onError={() => {
                if (media.posterURL2) {
                  // Fallback para posterURL2
                }
              }}
            />
          )}
        </View>

        {/* Gradient Overlay */}
        <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        {/* Content */}
        <View className="absolute bottom-0 left-0 right-0 p-6 pb-8">
          {/* Category */}
          <View className="flex-row items-center mb-3">
            <View className="bg-red-600 px-3 py-1 rounded mr-3">
              <Text className="text-white text-xs font-bold">
                {media.type}
              </Text>
            </View>
            <Text className="text-gray-300 text-xs flex-1" numberOfLines={1}>
              {media.categoria?.join(", ").replace(/_/g, " ") || "Categoria"}
            </Text>
          </View>

          {/* Title */}
          <Text className="text-white text-3xl font-bold mb-3 leading-tight">
            {media.title}
          </Text>

          {/* Meta info */}
          <View className="flex-row items-center flex-wrap gap-2 mb-4">
            {media.avaliacao > 0 && (
              <Text className="text-green-400 text-sm font-semibold">
                ★ {media.avaliacao.toFixed(1)}
              </Text>
            )}
            <Text className="text-white text-sm">
              {media.anoLancamento ?? "N/A"}
            </Text>
            <Text className="text-white text-sm">
              {mediaInfo.duration}
            </Text>
            <View className="border border-gray-400 px-2 py-1 rounded">
              <Text className="text-white text-xs">
                {mediaInfo.type}
              </Text>
            </View>
          </View>

          {/* Synopsis */}
          <Text className="text-white text-base mb-6 leading-relaxed">
            {truncateText(media.sinopse, 120) || "Sinopse não disponível."}
          </Text>

          {/* Main Buttons */}
          <View className="flex-row gap-3 mb-4">
            <TouchableOpacity
              onPress={handlePlay}
              className="bg-white flex-1 py-3 px-6 rounded-lg flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Icon name="play-arrow" size={24} color="#000" />
              <Text className="text-black text-base font-semibold ml-2">
                Assistir
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onInfo}
              className="bg-gray-600 flex-1 py-3 px-6 rounded-lg flex-row items-center justify-center"
              activeOpacity={0.8}
            >
              <Icon name="info" size={24} color="#fff" />
              <Text className="text-white text-base font-semibold ml-2">
                Mais info
              </Text>
            </TouchableOpacity>
          </View>

          {/* Secondary Buttons */}
          {authService.isAuthenticated() && (
            <View className="flex-row gap-4 justify-center">
              <TouchableOpacity
                onPress={handleMyList}
                disabled={isLoading}
                className="border-2 border-gray-400 p-3 rounded-full"
                activeOpacity={0.8}
              >
                <Icon
                  name={isInMyList ? "check" : "add"}
                  size={24}
                  color="#fff"
                />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleLike}
                disabled={isLoading}
                className={`border-2 p-3 rounded-full ${
                  isLiked
                    ? "border-green-400"
                    : "border-gray-400"
                }`}
                activeOpacity={0.8}
              >
                <Icon
                  name="thumb-up"
                  size={24}
                  color={isLiked ? "#4ade80" : "#fff"}
                />
              </TouchableOpacity>

              {youtubeURL && !videoError && (
                <TouchableOpacity
                  onPress={() => setMuted(!muted)}
                  className="border-2 border-gray-400 p-3 rounded-full"
                  activeOpacity={0.8}
                >
                  <Icon
                    name={muted ? "volume-off" : "volume-up"}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              )}

              {youtubeURL && !videoError && (
                <TouchableOpacity
                  onPress={() => setShowVideo(!showVideo)}
                  className="border-2 border-gray-400 p-3 rounded-full"
                  activeOpacity={0.8}
                >
                  <Icon
                    name={showVideo ? "videocam-off" : "videocam"}
                    size={24}
                    color="#fff"
                  />
                </TouchableOpacity>
              )}
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
};