// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { movieService } from "../service/movieService";
// import { SearchService } from "../service/searchService";
// import authService from "../service/authService";
// import type {
//   MovieSimpleDTO,
//   MovieCompleteDTO,
//   PaginatedResponseDTO,
//   SerieSimpleDTO,
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

// export const MoviePage: React.FC = () => {
//   // Estados do hero
//   const [heroContent, setHeroContent] = useState<MovieCompleteDTO | null>(null);

//   // Estados para as rows de filmes
//   const [popularMovies, setPopularMovies] = useState<MovieSimpleDTO[]>([]);
//   const [newReleases, setNewReleases] = useState<MovieSimpleDTO[]>([]);
//   const [highRatedMovies, setHighRatedMovies] = useState<MovieSimpleDTO[]>([]);
//   const [actionMovies, setActionMovies] = useState<MovieSimpleDTO[]>([]);

//   // Estados para o MediaGrid
//   const [gridData, setGridData] =
//     useState<
//       PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO>
//     >();

//   // Estados do modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedMedia, setSelectedMedia] = useState<MovieCompleteDTO | null>(
//     null
//   );
  
//   // Estados de loading - Hero define o loading principal
//   const [heroLoading, setHeroLoading] = useState(true);
//   const [modalLoading, setModalLoading] = useState(false);
//   const [gridLoading, setGridLoading] = useState(false);
  
//   // Estados de autenticação e total
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [totalMovies, setTotalMovies] = useState<number>(0);

//   // Estados para controle de carregamento por seção
//   const [loadedSections, setLoadedSections] = useState({
//     hero: false,
//     popularMovies: false,
//     newReleases: false,
//     highRatedMovies: false,
//     actionMovies: false,
//     grid: false,
//     totalCount: false
//   });

//   const [loadingSections, setLoadingSections] = useState({
//     popularMovies: false,
//     newReleases: false,
//     highRatedMovies: false,
//     actionMovies: false,
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

//     if (pathParts.length >= 2 && pathParts[0] === "movies") {
//       const mediaId = parseInt(pathParts[1]);
//       if (!isNaN(mediaId) && mediaId > 0) {
//         handleInfo({ id: mediaId } as MovieSimpleDTO);
//       }
//     }
//   }, []);

//   // Carrega apenas o hero primeiro
//   const loadHeroContent = async () => {
//     try {
//       const randomId = Math.floor(Math.random() * 100) + 1;

//       try {
//         const movieData = await movieService.getMovieById(randomId);
//         setHeroContent(movieData);
//         setLoadedSections(prev => ({ ...prev, hero: true }));
//       } catch (error) {
//         try {
//           const popularData = await movieService.getPopularMovies(0, 1);
//           if (popularData.content.length > 0) {
//             const firstMovie = popularData.content[0];
//             const completeMovie = await movieService.getMovieById(
//               firstMovie.id
//             );
//             setHeroContent(completeMovie);
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

//   const loadPopularMovies = async () => {
//     if (loadedSections.popularMovies || loadingSections.popularMovies) return;
    
//     try {
//       setLoadingSections(prev => ({ ...prev, popularMovies: true }));
//       const popularMoviesData = await movieService.getPopularMovies(0, 12);
//       setPopularMovies(popularMoviesData.content);
//       setLoadedSections(prev => ({ ...prev, popularMovies: true }));
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading popular movies:", error);
//       }
//     } finally {
//       setLoadingSections(prev => ({ ...prev, popularMovies: false }));
//     }
//   };

//   const loadNewReleases = async () => {
//     if (loadedSections.newReleases || loadingSections.newReleases) return;
    
//     try {
//       setLoadingSections(prev => ({ ...prev, newReleases: true }));
//       const newReleasesData = await movieService.getNewReleases(0, 12);
//       setNewReleases(newReleasesData.content);
//       setLoadedSections(prev => ({ ...prev, newReleases: true }));
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading new releases:", error);
//       }
//     } finally {
//       setLoadingSections(prev => ({ ...prev, newReleases: false }));
//     }
//   };

//   const loadHighRatedMovies = async () => {
//     if (loadedSections.highRatedMovies || loadingSections.highRatedMovies) return;
    
//     try {
//       setLoadingSections(prev => ({ ...prev, highRatedMovies: true }));
//       const highRatedMoviesData = await movieService.getHighRatedMovies(0, 12);
//       setHighRatedMovies(highRatedMoviesData.content);
//       setLoadedSections(prev => ({ ...prev, highRatedMovies: true }));
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading high rated movies:", error);
//       }
//     } finally {
//       setLoadingSections(prev => ({ ...prev, highRatedMovies: false }));
//     }
//   };

//   const loadActionMovies = async () => {
//     if (loadedSections.actionMovies || loadingSections.actionMovies) return;
    
//     try {
//       setLoadingSections(prev => ({ ...prev, actionMovies: true }));
//       const actionMoviesData = await movieService
//         .getMoviesByCategory(Categoria.ACAO, 0, 12)
//         .catch(() => ({ content: [] }));
      
//       setActionMovies(actionMoviesData.content);
//       setLoadedSections(prev => ({ ...prev, actionMovies: true }));
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading action movies:", error);
//       }
//     } finally {
//       setLoadingSections(prev => ({ ...prev, actionMovies: false }));
//     }
//   };

//   const loadGridContent = async (page: number = 0) => {
//     if (page === 0 && (loadedSections.grid || loadingSections.grid)) return;
    
//     try {
//       setGridLoading(true);
//       if (page === 0) {
//         setLoadingSections(prev => ({ ...prev, grid: true }));
//       }

//       const searchData = await searchService.searchMovies(
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

//   const loadTotalMovies = async () => {
//     if (loadedSections.totalCount || loadingSections.totalCount) return;
    
//     try {
//       setLoadingSections(prev => ({ ...prev, totalCount: true }));
      
//       const totalData = await searchService.searchMovies(
//         undefined,
//         undefined,
//         0,
//         1
//       );
      
//       setTotalMovies(totalData.totalElements || 0);
//       setLoadedSections(prev => ({ ...prev, totalCount: true }));
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading total movies count:", error);
//       }
//     } finally {
//       setLoadingSections(prev => ({ ...prev, totalCount: false }));
//     }
//   };

//   // Intersection Observer refs com lazy loading mais agressivo
//   const popularRef = useIntersectionObserver(loadPopularMovies, { rootMargin: '100px' });
//   const newReleasesRef = useIntersectionObserver(loadNewReleases, { rootMargin: '150px' });
//   const highRatedRef = useIntersectionObserver(loadHighRatedMovies, { rootMargin: '150px' });
//   const actionRef = useIntersectionObserver(loadActionMovies, { rootMargin: '150px' });
//   const gridRef = useIntersectionObserver(() => loadGridContent(0), { rootMargin: '120px' });
//   const totalRef = useIntersectionObserver(loadTotalMovies, { rootMargin: '100px' });

//   const handleInfo = async (
//     media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO
//   ) => {
//     if (modalLoading) return;

//     try {
//       setModalLoading(true);

//       const completeMovie = await movieService.getMovieById(media.id);

//       setSelectedMedia(completeMovie);
//       setIsModalOpen(true);

//       const newUrl = formatTitleForUrl(
//         media.id,
//         media.title,
//         media.anoLancamento,
//         media.type
//       );

//       window.history.pushState(null, "", `/movies${newUrl}`);
//     } catch (error) {
//       if (theme.development) {
//         console.error("Error loading movie details:", error);
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
//     window.history.pushState(null, "", "/movies");
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
//         {/* Row 1: Filmes Populares - Lazy Loading */}
//         <div ref={popularRef}>
//           {loadedSections.popularMovies && popularMovies.length > 0 ? (
//             <MovieRow
//               title="Filmes Populares"
//               movies={popularMovies}
//               onInfo={handleInfo}
//             />
//           ) : loadingSections.popularMovies ? (
//             <RowSkeleton />
//           ) : (
//             <div className="h-4"></div> // Espaço reservado
//           )}
//         </div>

//         {/* Row 2: Novos Lançamentos - Lazy Loading */}
//         <div ref={newReleasesRef}>
//           {loadedSections.newReleases && newReleases.length > 0 ? (
//             <MovieRow
//               title="Novos Lançamentos"
//               movies={newReleases}
//               onInfo={handleInfo}
//             />
//           ) : loadingSections.newReleases ? (
//             <RowSkeleton />
//           ) : (
//             <div className="h-4"></div>
//           )}
//         </div>

//         {/* Row 3: Filmes Bem Avaliados - Lazy Loading */}
//         <div ref={highRatedRef}>
//           {loadedSections.highRatedMovies && highRatedMovies.length > 0 ? (
//             <MovieRow
//               title="Filmes Bem Avaliados"
//               movies={highRatedMovies}
//               onInfo={handleInfo}
//             />
//           ) : loadingSections.highRatedMovies ? (
//             <RowSkeleton />
//           ) : (
//             <div className="h-4"></div>
//           )}
//         </div>

//         {/* Row 4: Filmes de Ação - Lazy Loading */}
//         <div ref={actionRef}>
//           {loadedSections.actionMovies && actionMovies.length > 0 ? (
//             <MovieRow
//               title="Filmes de Ação"
//               movies={actionMovies}
//               onInfo={handleInfo}
//             />
//           ) : loadingSections.actionMovies ? (
//             <RowSkeleton />
//           ) : (
//             <div className="h-4"></div>
//           )}
//         </div>

//         {/* Estatísticas de Filmes - Lazy Loading */}
//         <div ref={totalRef}>
//           {loadedSections.totalCount ? (
//             <div className="px-4 md:px-8 lg:px-12 mb-8">
//               <div className="text-center text-gray-400">
//                 <p>Total de {totalMovies.toLocaleString()} filmes disponíveis</p>
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
//               Explorar Todos os Filmes
//             </h2>
//             <p className="text-gray-400">
//               Navegue por nossa coleção completa de filmes
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