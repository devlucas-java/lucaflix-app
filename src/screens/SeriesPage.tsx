// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { serieService } from "../service/seriesService";
// import { SearchService } from "../service/searchService";
// import authService from "../service/authService";
// import type {
//   SerieSimpleDTO,
//   SerieCompleteDTO,
//   PaginatedResponseDTO,
//   MovieSimpleDTO,
//   AnimeSimpleDTO,
// } from "../types/mediaTypes";
// import { Categoria } from "../types/mediaTypes";
// import { HeroSection } from "../components/HeroSection";
// import { MovieRow } from "../components/MovieRow";
// import { MediaGrid } from "../components/MediaGrid";
// import { MediaModal } from "../components/modal/MediaModal";
// import HeaderHome from "../components/headers/CustomHeader";
// import { formatTitleForUrl } from "../utils/mediaService";
// import { theme } from "../theme/theme";
// import { Footer } from "../components/Footer";
// import { FacaLogin } from "../components/FacaLogin";
// import { Loading } from "../components/Loading";

// const searchService = new SearchService();

// // Hook personalizado para Intersection Observer
// const useIntersectionObserver = (callback: () => void, options = {}) => {
//   const targetRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const observer = new IntersectionObserver(([entry]) => {
//       if (entry.isIntersecting) {
//         callback();
//       }
//     }, {
//       rootMargin: '120px', // Carrega 120px antes de aparecer
//       threshold: 0.1,
//       ...options
//     });

//     const currentTarget = targetRef.current;
//     if (currentTarget) {
//       observer.observe(currentTarget);
//     }

//     return () => {
//       if (currentTarget) {
//         observer.unobserve(currentTarget);
//       }
//     };
//   }, [callback]);

//   return targetRef;
// };

// export const SeriesPage: React.FC = () => {
//   // Estados do hero
//   const [heroContent, setHeroContent] = useState<SerieCompleteDTO | null>(null);

//   // Estados para as rows de séries
//   const [popularSeries, setPopularSeries] = useState<SerieSimpleDTO[]>([]);
//   const [highRatedSeries, setHighRatedSeries] = useState<SerieSimpleDTO[]>([]);
//   const [recentSeries, setRecentSeries] = useState<SerieSimpleDTO[]>([]);
//   const [actionSeries, setActionSeries] = useState<SerieSimpleDTO[]>([]);

//   // Estados para o MediaGrid
//   const [gridData, setGridData] =
//     useState<
//       PaginatedResponseDTO<AnimeSimpleDTO | SerieSimpleDTO | MovieSimpleDTO>
//     >();

//   // Estados do modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedMedia, setSelectedMedia] = useState<SerieCompleteDTO | null>(
//     null
//   );
  
//   // Estados de loading - Hero define o loading principal
//   const [heroLoading, setHeroLoading] = useState(true);
//   const [modalLoading, setModalLoading] = useState(false);
//   const [gridLoading, setGridLoading] = useState(false);
  
//   // Estados de autenticação e total
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [totalSeries, setTotalSeries] = useState<number>(0);

//   // Estados para controle de carregamento por seção
//   const [loadedSections, setLoadedSections] = useState({
//     hero: false,
//     popularSeries: false,
//     highRatedSeries: false,
//     recentSeries: false,
//     actionSeries: false,
//     grid: false,
//     totalCount: false
//   });

//   const [loadingSections, setLoadingSections] = useState({
//     popularSeries: false,
//     highRatedSeries: false,
//     recentSeries: false,
//     actionSeries: false,
//     grid: false,
//     totalCount: false
//   });

//   useEffect(() => {
//     // Verificar autenticação
//     setIsAuthenticated(authService.isAuthenticated());
    
//     // Carregar apenas o hero primeiro para liberar o loading
//     loadHeroContent();

//     // Verificar se há um ID na URL ao carregar a página
//     checkUrlForMediaId();
//   }, []);

//   const checkUrlForMediaId = useCallback(() => {
//     const path = window.location.pathname;
//     const pathParts = path.split("/").filter(Boolean);

//     if (pathParts.length >= 2 && pathParts[0] === "series") {
//       const mediaId = parseInt(pathParts[1]);
//       if (!isNaN(mediaId) && mediaId > 0) {
//         handleInfo({ id: mediaId } as SerieSimpleDTO);
//       }
//     }
//   }, []);

//   // Carrega apenas o hero primeiro
//   const loadHeroContent = async () => {
//     try {
//       const randomId = Math.floor(Math.random() * 100) + 1;

//       try {
//         const serieData = await serieService.getSerieById(randomId);
//         setHeroContent(serieData);
//         setLoadedSections(prev => ({ ...prev, hero: true }));
//       } catch (error) {
//         try {
//           const popularData = await serieService.getPopularSeries(0, 1);
//           if (popularData.content.length > 0) {
//             const firstSerie = popularData.content[0];
//             const completeSerie = await serieService.getSerieById(
//               firstSerie.id
//             );
//             setHeroContent(completeSerie);
//             setLoadedSections(prev => ({ ...prev, hero: true }));
//           }
//         } catch (fallbackError) {
//           if (theme.development) {
//             console.error("Error loading hero content:", fallbackError);
//           }
//         }
//       }
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading hero content:", error);
//       }
//     } finally {
//       // Hero carregado, libera o loading principal
//       setHeroLoading(false);
//     }
//   };

//   const loadPopularSeries = async () => {
//     if (loadedSections.popularSeries || loadingSections.popularSeries) return;
    
//     try {
//       setLoadingSections(prev => ({ ...prev, popularSeries: true }));
//       const popularSeriesData = await serieService.getPopularSeries(0, 12);
//       setPopularSeries(popularSeriesData.content);
//       setLoadedSections(prev => ({ ...prev, popularSeries: true }));
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading popular series:", error);
//       }
//     } finally {
//       setLoadingSections(prev => ({ ...prev, popularSeries: false }));
//     }
//   };

//   const loadHighRatedSeries = async () => {
//     if (loadedSections.highRatedSeries || loadingSections.highRatedSeries) return;
    
//     try {
//       setLoadingSections(prev => ({ ...prev, highRatedSeries: true }));
//       const highRatedSeriesData = await serieService.getHighRatedSeries(0, 12);
//       setHighRatedSeries(highRatedSeriesData.content);
//       setLoadedSections(prev => ({ ...prev, highRatedSeries: true }));
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading high rated series:", error);
//       }
//     } finally {
//       setLoadingSections(prev => ({ ...prev, highRatedSeries: false }));
//     }
//   };

//   const loadRecentSeries = async () => {
//     if (loadedSections.recentSeries || loadingSections.recentSeries) return;
    
//     try {
//       setLoadingSections(prev => ({ ...prev, recentSeries: true }));
//       const recentSeriesData = await serieService.getRecentSeries(0, 12);
//       setRecentSeries(recentSeriesData.content);
//       setLoadedSections(prev => ({ ...prev, recentSeries: true }));
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading recent series:", error);
//       }
//     } finally {
//       setLoadingSections(prev => ({ ...prev, recentSeries: false }));
//     }
//   };

//   const loadActionSeries = async () => {
//     if (loadedSections.actionSeries || loadingSections.actionSeries) return;
    
//     try {
//       setLoadingSections(prev => ({ ...prev, actionSeries: true }));
//       const actionSeriesData = await serieService
//         .getSeriesByCategory(Categoria.ACAO, 0, 12)
//         .catch(() => ({ content: [] }));
      
//       setActionSeries(actionSeriesData.content);
//       setLoadedSections(prev => ({ ...prev, actionSeries: true }));
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading action series:", error);
//       }
//     } finally {
//       setLoadingSections(prev => ({ ...prev, actionSeries: false }));
//     }
//   };

//   const loadGridContent = async (page: number = 0) => {
//     if (page === 0 && (loadedSections.grid || loadingSections.grid)) return;
    
//     try {
//       setGridLoading(true);
//       if (page === 0) {
//         setLoadingSections(prev => ({ ...prev, grid: true }));
//       }

//       const searchData = await searchService.searchSeries(
//         undefined,
//         undefined,
//         page,
//         12
//       );

//       setGridData(searchData);
//       if (page === 0) {
//         setLoadedSections(prev => ({ ...prev, grid: true }));
//       }
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading grid content:", error);
//       }
//     } finally {
//       setGridLoading(false);
//       if (page === 0) {
//         setLoadingSections(prev => ({ ...prev, grid: false }));
//       }
//     }
//   };

//   const loadTotalSeries = async () => {
//     if (loadedSections.totalCount || loadingSections.totalCount) return;
    
//     try {
//       setLoadingSections(prev => ({ ...prev, totalCount: true }));
      
//       const totalData = await searchService.searchSeries(
//         undefined,
//         undefined,
//         0,
//         1
//       );
      
//       setTotalSeries(totalData.totalElements || 0);
//       setLoadedSections(prev => ({ ...prev, totalCount: true }));
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading total series count:", error);
//       }
//     } finally {
//       setLoadingSections(prev => ({ ...prev, totalCount: false }));
//     }
//   };

//   // Intersection Observer refs com lazy loading mais agressivo
//   const popularRef = useIntersectionObserver(loadPopularSeries, { rootMargin: '100px' });
//   const highRatedRef = useIntersectionObserver(loadHighRatedSeries, { rootMargin: '150px' });
//   const recentRef = useIntersectionObserver(loadRecentSeries, { rootMargin: '150px' });
//   const actionRef = useIntersectionObserver(loadActionSeries, { rootMargin: '150px' });
//   const gridRef = useIntersectionObserver(() => loadGridContent(0), { rootMargin: '120px' });
//   const totalRef = useIntersectionObserver(loadTotalSeries, { rootMargin: '100px' });

//   const handleInfo = async (
//     media: SerieSimpleDTO | MovieSimpleDTO | AnimeSimpleDTO
//   ) => {
//     if (modalLoading) return;

//     try {
//       setModalLoading(true);

//       const completeSerie = await serieService.getSerieById(media.id);

//       setSelectedMedia(completeSerie);
//       setIsModalOpen(true);

//       const newUrl = formatTitleForUrl(
//         media.id,
//         media.title,
//         media.anoLancamento,
//         media.type
//       );

//       window.history.pushState(null, "", `/series${newUrl}`);
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading serie details:", error);
//       }
//     } finally {
//       setModalLoading(false);
//     }
//   };

//   const handleGridPageChange = useCallback((page: number) => {
//     loadGridContent(page);
//   }, []);

//   const handleGridMediaInfo = useCallback((
//     media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO
//   ) => {
//     handleInfo(media);
//   }, []);

//   const handleCloseModal = useCallback(() => {
//     setIsModalOpen(false);
//     setSelectedMedia(null);
//     window.history.pushState(null, "", "/series");
//   }, []);

//   // Skeleton components otimizados
//   const RowSkeleton = () => (
//     <div className="px-4 md:px-8 lg:px-12 mb-8">
//       <div className="h-6 bg-gray-700/50 rounded w-48 mb-4 animate-pulse"></div>
//       <div className="flex gap-4 overflow-hidden">
//         {Array(6).fill(0).map((_, i) => (
//           <div key={i} className="flex-shrink-0 w-48 h-72 bg-gray-700/30 rounded animate-pulse"></div>
//         ))}
//       </div>
//     </div>
//   );

//   const GridSkeleton = () => (
//     <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
//       {Array(12).fill(0).map((_, i) => (
//         <div key={i} className="aspect-[2/3] bg-gray-700/30 rounded animate-pulse"></div>
//       ))}
//     </div>
//   );

//   // Loading apenas para o hero
//   if (heroLoading) {
//     return <Loading />;
//   }

//   return (
//     <div
//       className="min-h-screen"
//       style={{ backgroundColor: theme.colors.background }}
//     >
//       {/* Header */}
//       <HeaderHome />

//       {/* Hero Section - Sempre renderizado após carregamento */}
//       {heroContent && loadedSections.hero && (
//         <HeroSection
//           media={heroContent}
//           useH1={true}
//           onInfo={() => handleInfo(heroContent as any)}
//         />
//       )}

//       {/* Content Rows */}
//       <div className="relative z-10 -mt-32 pb-8">
//         {/* Row 1: Séries Populares - Lazy Loading */}
//         <div ref={popularRef}>
//           {loadedSections.popularSeries && popularSeries.length > 0 ? (
//             <MovieRow
//               title="Séries Populares"
//               movies={popularSeries}
//               onInfo={handleInfo}
//               isBigCard={true}
//             />
//           ) : loadingSections.popularSeries ? (
//             <RowSkeleton />
//           ) : (
//             <div className="h-4"></div> // Espaço reservado
//           )}
//         </div>

//         {/* Row 2: Séries Bem Avaliadas - Lazy Loading */}
//         <div ref={highRatedRef}>
//           {loadedSections.highRatedSeries && highRatedSeries.length > 0 ? (
//             <MovieRow
//               title="Séries Bem Avaliadas"
//               movies={highRatedSeries}
//               onInfo={handleInfo}
//               isBigCard={true}
//             />
//           ) : loadingSections.highRatedSeries ? (
//             <RowSkeleton />
//           ) : (
//             <div className="h-4"></div>
//           )}
//         </div>

//         {/* Row 3: Séries Recentes - Lazy Loading */}
//         <div ref={recentRef}>
//           {loadedSections.recentSeries && recentSeries.length > 0 ? (
//             <MovieRow
//               title="Séries Recentes"
//               movies={recentSeries}
//               onInfo={handleInfo}
//               isBigCard={true}
//             />
//           ) : loadingSections.recentSeries ? (
//             <RowSkeleton />
//           ) : (
//             <div className="h-4"></div>
//           )}
//         </div>

//         {/* Row 4: Séries de Ação - Lazy Loading */}
//         <div ref={actionRef}>
//           {loadedSections.actionSeries && actionSeries.length > 0 ? (
//             <MovieRow
//               title="Séries de Ação"
//               movies={actionSeries}
//               onInfo={handleInfo}
//               isBigCard={true}
//             />
//           ) : loadingSections.actionSeries ? (
//             <RowSkeleton />
//           ) : (
//             <div className="h-4"></div>
//           )}
//         </div>

//         {/* Estatísticas de Séries - Lazy Loading */}
//         <div ref={totalRef}>
//           {loadedSections.totalCount ? (
//             <div className="px-4 md:px-8 lg:px-12 mb-8">
//               <div className="text-center text-gray-400">
//                 <p>Total de {totalSeries.toLocaleString()} séries disponíveis</p>
//               </div>
//             </div>
//           ) : loadingSections.totalCount ? (
//             <div className="px-4 md:px-8 lg:px-12 mb-8">
//               <div className="text-center">
//                 <div className="h-4 bg-gray-700/50 rounded w-48 mx-auto animate-pulse"></div>
//               </div>
//             </div>
//           ) : (
//             <div className="h-4"></div>
//           )}
//         </div>

//         {/* MediaGrid Section - Lazy Loading com carregamento mais tardio */}
//         <div ref={gridRef} className="px-4 md:px-8 lg:px-12 mt-12">
//           <div className="mb-8">
//             <h2 className="text-2xl font-bold text-white mb-2">
//               Explorar Todas as Séries
//             </h2>
//             <p className="text-gray-400">
//               Navegue por nossa coleção completa de séries
//             </p>
//           </div>

//           {loadedSections.grid ? (
//             <MediaGrid
//               data={gridData}
//               loading={gridLoading}
//               onPageChange={handleGridPageChange}
//               onMediaInfo={handleGridMediaInfo}
//               gridSize="medium"
//             />
//           ) : loadingSections.grid ? (
//             <GridSkeleton />
//           ) : (
//             <div className="h-64 flex items-center justify-center text-gray-500">
//               Role para baixo para carregar mais conteúdo
//             </div>
//           )}
//         </div>

//         {/* Aviso para usuários não logados */}
//         {!isAuthenticated && <FacaLogin />}

//         <Footer />
//       </div>

//       {/* Modal */}
//       {selectedMedia && (
//         <MediaModal
//           media={selectedMedia}
//           isOpen={isModalOpen}
//           onClose={handleCloseModal}
//         />
//       )}

//       {/* Loading do modal */}
//       {modalLoading && (
//         <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
//         </div>
//       )}
//     </div>
//   );
// };