import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StatusBar,
  Alert,
  BackHandler,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width, height } = Dimensions.get('window');

// User Agents mais modernos e específicos
const USER_AGENTS = {
  android: 'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  desktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  ios: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
};

// Função para completar URL se necessário
const completeUrl = (url) => {
  if (!url) return url;
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  if (url.startsWith('/e/') || url.startsWith('e/')) {
    const cleanPath = url.startsWith('/') ? url : `/${url}`;
    return `https://embedder.net${cleanPath}`;
  }
  
  if (url.startsWith('/')) {
    return `https://embedder.net${url}`;
  }
  
  return `https://embedder.net/${url}`;
};

export const MiniBrowserPlayer = ({ 
  embedUrl, 
  media, 
  episode, 
  onClose, 
  onBack,
  onNextEpisode,
  onPreviousEpisode,
  isSeries = false
}) => {
  const [currentUrl, setCurrentUrl] = useState(completeUrl(embedUrl));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [userAgent, setUserAgent] = useState(USER_AGENTS.android);
  const [retryCount, setRetryCount] = useState(0);
  const [showControls, setShowControls] = useState(true);

  const webViewRef = useRef(null);
  const controlsTimeout = useRef(null);

  // Esconder controles após 5 segundos
  useEffect(() => {
    const hideControls = () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
      controlsTimeout.current = setTimeout(() => {
        setShowControls(false);
      }, 5000);
    };

    if (showControls && !loading) {
      hideControls();
    }

    return () => {
      if (controlsTimeout.current) {
        clearTimeout(controlsTimeout.current);
      }
    };
  }, [showControls, loading]);

  // Mostrar controles quando tocar na tela
  const handleScreenTap = () => {
    setShowControls(true);
  };

  // Interceptar botão voltar do Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    return () => backHandler.remove();
  }, []);

  const handleBackPress = () => {
    if (onClose) {
      onClose();
      return true;
    }
    return false;
  };

  const handleWebViewNavigationStateChange = (navState) => {
    setCurrentUrl(navState.url);
    setLoading(navState.loading);
  };

  const handleWebViewLoad = () => {
    setLoading(false);
    setError(null);
    setRetryCount(0);
  };

  const handleWebViewError = (syntheticEvent) => {
    const { nativeEvent } = syntheticEvent;
    console.log('WebView Error:', nativeEvent);
    
    if (nativeEvent.description?.includes('access_denied') || 
        nativeEvent.description?.includes('ERR_ACCESS_DENIED')) {
      
      if (retryCount < 3) {
        const userAgents = Object.values(USER_AGENTS);
        const nextUserAgent = userAgents[retryCount % userAgents.length];
        setUserAgent(nextUserAgent);
        setRetryCount(retryCount + 1);
        
        setTimeout(() => {
          if (webViewRef.current) {
            webViewRef.current.reload();
          }
        }, 500);
        
        return;
      }
    }
    
    setError(nativeEvent.description || 'Erro desconhecido');
    setLoading(false);
  };

  const handleWebViewProgress = ({ nativeEvent }) => {
    setProgress(nativeEvent.progress);
  };

  const reload = () => {
    if (webViewRef.current) {
      setError(null);
      setRetryCount(0);
      webViewRef.current.reload();
    }
  };

  const retryWithDifferentUserAgent = () => {
    const userAgents = Object.values(USER_AGENTS);
    const nextUserAgent = userAgents[(retryCount + 1) % userAgents.length];
    setUserAgent(nextUserAgent);
    setRetryCount(retryCount + 1);
    setError(null);
    
    if (webViewRef.current) {
      webViewRef.current.reload();
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onBack) {
      onBack();
    }
  };

  // JavaScript otimizado para forçar modo paisagem e tela cheia
  const injectedJavaScript = `
    (function() {
      try {
        // Forçar orientação paisagem
        if (screen.orientation && screen.orientation.lock) {
          screen.orientation.lock('landscape-primary').catch(() => {});
        }
        
        // CSS para forçar tela cheia e modo paisagem
        const style = document.createElement('style');
        style.textContent = \`
          * {
            -webkit-user-select: none !important;
            -webkit-touch-callout: none !important;
            -webkit-tap-highlight-color: transparent !important;
          }
          body, html {
            margin: 0 !important;
            padding: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            overflow: hidden !important;
            background: #000 !important;
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            transform: rotate(0deg) !important;
            transform-origin: center !important;
          }
          video, iframe, embed, object {
            width: 100% !important;
            height: 100% !important;
            border: none !important;
            outline: none !important;
            position: absolute !important;
            top: 0 !important;
            left: 0 !important;
            z-index: 9999 !important;
            object-fit: cover !important;
          }
          .advertisement, .ads, [class*="ad-"], [id*="ad-"] {
            display: none !important;
          }
          /* Forçar elementos fullscreen */
          [class*="fullscreen"], [class*="theater"], [class*="cinema"] {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 99999 !important;
          }
        \`;
        document.head.appendChild(style);
        
        // Viewport meta tag otimizado
        let viewport = document.querySelector('meta[name="viewport"]');
        if (!viewport) {
          viewport = document.createElement('meta');
          viewport.name = 'viewport';
          document.head.appendChild(viewport);
        }
        viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        
        // Detectar e otimizar elementos de mídia
        const optimizeMedia = () => {
          // Otimizar vídeos
          const videos = document.querySelectorAll('video');
          videos.forEach(video => {
            video.setAttribute('playsinline', 'true');
            video.setAttribute('webkit-playsinline', 'true');
            video.setAttribute('controls', 'true');
            video.setAttribute('preload', 'auto');
            video.style.cssText = 'width: 100vw !important; height: 100vh !important; object-fit: cover !important; position: fixed !important; top: 0 !important; left: 0 !important; z-index: 9999 !important;';
            
            // Forçar fullscreen quando disponível
            video.addEventListener('loadedmetadata', () => {
              if (video.requestFullscreen) {
                video.requestFullscreen().catch(() => {});
              } else if (video.webkitRequestFullscreen) {
                video.webkitRequestFullscreen().catch(() => {});
              }
            });
          });
          
          // Otimizar iframes
          const iframes = document.querySelectorAll('iframe');
          iframes.forEach(iframe => {
            iframe.style.cssText = 'width: 100vw !important; height: 100vh !important; border: none !important; position: fixed !important; top: 0 !important; left: 0 !important; z-index: 9999 !important;';
            iframe.setAttribute('allowfullscreen', 'true');
            iframe.setAttribute('webkitallowfullscreen', 'true');
            iframe.setAttribute('mozallowfullscreen', 'true');
            iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
          });
          
          // Remover elementos desnecessários
          const unwantedElements = document.querySelectorAll('.header, .footer, .navigation, .sidebar, .menu, .ads, .advertisement');
          unwantedElements.forEach(el => el.remove());
        };
        
        // Executar otimizações
        optimizeMedia();
        
        // Observer para novos elementos
        const observer = new MutationObserver((mutations) => {
          mutations.forEach((mutation) => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
              setTimeout(optimizeMedia, 100);
            }
          });
        });
        
        observer.observe(document.body, {
          childList: true,
          subtree: true
        });
        
        // Executar após carregamento
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', optimizeMedia);
        } else {
          optimizeMedia();
        }
        
        // Interceptar eventos de fullscreen
        document.addEventListener('fullscreenchange', () => {
          if (document.fullscreenElement) {
            document.fullscreenElement.style.cssText = 'width: 100vw !important; height: 100vh !important; object-fit: cover !important;';
          }
        });
        
        // Capturar toques na tela
        let touchTimeout;
        document.addEventListener('touchstart', (e) => {
          clearTimeout(touchTimeout);
          touchTimeout = setTimeout(() => {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage('screen_tap');
            }
          }, 100);
        });
        
        // Comunicar com React Native
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage('player_ready');
        }
        
      } catch (error) {
        console.log('Erro no JavaScript injetado:', error);
      }
    })();
    
    true;
  `;

  const handleWebViewMessage = (event) => {
    const message = event.nativeEvent.data;
    if (message === 'screen_tap') {
      handleScreenTap();
    }
  };

  // Função para determinar headers customizados
  const getCustomHeaders = () => {
    return {
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-User': '?1',
      'Sec-Fetch-Dest': 'document',
      'Upgrade-Insecure-Requests': '1',
      'DNT': '1'
    };
  };

  // Tela de erro
  if (error && retryCount >= 3) {
    return (
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" backgroundColor="#000" hidden />
        
        <View className="flex-1 justify-center items-center px-5">
          <Icon name="error-outline" size={60} color="#ff6b6b" />
          <Text className="text-white text-xl font-bold mt-4 mb-2">
            Erro ao carregar conteúdo
          </Text>
          <Text className="text-gray-300 text-sm text-center mb-8">
            {error.includes('access_denied') ? 
              'Acesso negado pelo servidor. Tente novamente.' : 
              error
            }
          </Text>
          
          <View className="w-full items-center space-y-3">
            <TouchableOpacity 
              className="bg-red-500 flex-row items-center justify-center px-5 py-3 rounded-lg min-w-48"
              onPress={retryWithDifferentUserAgent}
            >
              <Icon name="refresh" size={20} color="#fff" />
              <Text className="text-white ml-2 text-sm font-bold">
                Tentar novamente
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              className="bg-gray-600 flex-row items-center justify-center px-5 py-3 rounded-lg min-w-48"
              onPress={handleClose}
            >
              <Icon name="close" size={20} color="#fff" />
              <Text className="text-white ml-2 text-sm font-bold">
                Fechar
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" hidden />
      
      {/* WebView - Tela cheia absoluta */}
      <WebView
        ref={webViewRef}
        source={{ 
          uri: currentUrl,
          headers: getCustomHeaders()
        }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000'
        }}
        userAgent={userAgent}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        onLoad={handleWebViewLoad}
        onError={handleWebViewError}
        onLoadProgress={handleWebViewProgress}
        onMessage={handleWebViewMessage}
        injectedJavaScript={injectedJavaScript}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        allowsFullscreenVideo={true}
        mixedContentMode="always"
        originWhitelist={['*']}
        allowUniversalAccessFromFileURLs={true}
        allowFileAccessFromFileURLs={true}
        allowFileAccess={true}
        allowsProtectedMedia={true}
        scalesPageToFit={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        bounces={false}
        scrollEnabled={false}
        startInLoadingState={false}
        cacheEnabled={false}
        incognito={false}
        thirdPartyCookiesEnabled={true}
        sharedCookiesEnabled={true}
        onShouldStartLoadWithRequest={(request) => {
          return true;
        }}
      />

      {/* Controles flutuantes - aparecem/desaparecem */}
      {showControls && (
        <View 
          className="absolute inset-0 z-50"
          style={{ pointerEvents: 'box-none' }}
        >
          {/* Botão voltar - canto superior esquerdo */}
          <TouchableOpacity
            className="absolute top-4 left-4 bg-black bg-opacity-70 p-3 rounded-full"
            onPress={handleClose}
            style={{ pointerEvents: 'auto' }}
          >
            <Icon name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Botão reload - canto superior direito */}
          <TouchableOpacity
            className="absolute top-4 right-4 bg-black bg-opacity-70 p-3 rounded-full"
            onPress={reload}
            style={{ pointerEvents: 'auto' }}
          >
            <Icon name="refresh" size={24} color="#fff" />
          </TouchableOpacity>

          {/* Controles de série - apenas se for série */}
          {isSeries && (
            <>
              {/* Episódio anterior */}
              {onPreviousEpisode && (
                <TouchableOpacity
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 p-3 rounded-full"
                  onPress={onPreviousEpisode}
                  style={{ pointerEvents: 'auto' }}
                >
                  <Icon name="skip-previous" size={24} color="#fff" />
                </TouchableOpacity>
              )}

              {/* Próximo episódio */}
              {onNextEpisode && (
                <TouchableOpacity
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-70 p-3 rounded-full"
                  onPress={onNextEpisode}
                  style={{ pointerEvents: 'auto' }}
                >
                  <Icon name="skip-next" size={24} color="#fff" />
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      )}

      {/* Indicador de carregamento - apenas quando necessário */}
      {loading && (
        <View className="absolute inset-0 justify-center items-center bg-black bg-opacity-50 z-40">
          <ActivityIndicator size="large" color="#ff6b6b" />
          <Text className="text-white mt-4 text-base">
            Carregando...
            {retryCount > 0 && ` (${retryCount + 1}ª tentativa)`}
          </Text>
        </View>
      )}
    </View>
  );
};

export default MiniBrowserPlayer;