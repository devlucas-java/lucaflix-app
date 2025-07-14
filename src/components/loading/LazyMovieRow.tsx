import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { MediaSimple } from "~/types/mediaTypes";
import { MovieRow } from "../MovieRow";
import { useIntersectionObserver } from "~/hooks/useIntersectionObserver";

// Componente para carregamento lazy
export const LazyMovieRow: React.FC<{
  title: string;
  loadData: () => Promise<MediaSimple[]>;
  onInfo: (media: MediaSimple) => void;
  isTop10?: boolean;
  isBigCard?: boolean;
  globalLoading?: boolean;
  loadingDelay?: number;
}> = ({ title, loadData, onInfo, isTop10, isBigCard, globalLoading = false, loadingDelay = 0 }) => {
  const [triggerLoad, isVisible] = useIntersectionObserver();
  const [data, setData] = useState<MediaSimple[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (isVisible && !loaded && !loading && !globalLoading) {
      setLoading(true);

      const loadWithDelay = async () => {
        if (loadingDelay > 0) {
          await new Promise((resolve) => setTimeout(resolve, loadingDelay));
        }
        return loadData();
      };

      loadWithDelay()
        .then(setData)
        .catch(console.error)
        .finally(() => {
          setLoading(false);
          setLoaded(true);
        });
    }
  }, [isVisible, loaded, loading, loadData, globalLoading, loadingDelay]);

  useEffect(() => {
    if (!globalLoading) {
      const timer = setTimeout(() => {
        triggerLoad();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [triggerLoad, globalLoading]);

  if (globalLoading) {
    return (
      <View className="mb-8 px-4">
        <Text className="mb-4 text-xl font-bold text-white">{title}</Text>
        <View className="flex h-32 items-center justify-center">
          <ActivityIndicator size="large" color="#E50914" />
          <Text className="mt-2 text-sm text-gray-400">Carregando...</Text>
        </View>
      </View>
    );
  }

  return (
    <MovieRow
      title={title}
      movies={data}
      onInfo={onInfo}
      isTop10={isTop10}
      isBigCard={isBigCard}
      loading={loading}
      hasMore={false}
    />
  );
};
