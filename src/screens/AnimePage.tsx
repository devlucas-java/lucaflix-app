// import React, { useState, useEffect } from "react";
// import { animeService } from "../service/animeService";
// import { SearchService } from "../service/searchService";
// import authService from "../service/authService";
// import type {
//   AnimeSimpleDTO,
//   AnimeCompleteDTO,
//   PaginatedResponseDTO,
//   MovieSimpleDTO,
//   SerieSimpleDTO
// } from "../types/mediaTypes";
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

// export const AnimePage: React.FC = () => {
//   // Estados do hero
//   const [heroContent, setHeroContent] = useState<AnimeCompleteDTO | null>(null);
  
//   // Estados para as rows de animes
//   const [popularAnimes, setPopularAnimes] = useState<AnimeSimpleDTO[]>([]);
//   const [newReleases, setNewReleases] = useState<AnimeSimpleDTO[]>([]);
//   const [highRatedAnimes, setHighRatedAnimes] = useState<AnimeSimpleDTO[]>([]);
//   const [top10Animes, setTop10Animes] = useState<AnimeSimpleDTO[]>([]);
  
//   // Estados para o MediaGrid
//   const [gridData, setGridData] = useState<PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO> >();
  
//   // Estados do modal
//   const [isModalOpen, setIsModalOpen] = useState(false);
//   const [selectedMedia, setSelectedMedia] = useState<AnimeCompleteDTO | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [modalLoading, setModalLoading] = useState(false);
//   const [gridLoading, setGridLoading] = useState(false);
//   const [isAuthenticated, setIsAuthenticated] = useState(false);

//   useEffect(() => {
//     // Verificar autenticação
//     setIsAuthenticated(authService.isAuthenticated());
//     loadContent();

//     // Verificar se há um ID na URL ao carregar a página
//     checkUrlForMediaId();
//   }, []);

//   // Função para verificar se há um ID de media na URL
//   const checkUrlForMediaId = () => {
//     const path = window.location.pathname;
//     const pathParts = path.split("/").filter(Boolean);

//     // Formato esperado: /animes/id/titulo-ano ou /animes/id
//     if (pathParts.length >= 2 && pathParts[0] === "animes") {
//       const mediaId = parseInt(pathParts[1]);
//       if (!isNaN(mediaId) && mediaId > 0) {
//         handleInfo({ id: mediaId } as AnimeSimpleDTO);
//       }
//     }
//   };

//   const loadContent = async () => {
//     try {
//       // Carregar conteúdo do hero (anime aleatório)
//       await loadHeroContent();

//       // Carregar content das rows em paralelo
//       await Promise.all([
//         loadAnimeRows(),
//         loadGridContent(0) // Carregar primeira página do grid
//       ]);
//     } catch (error) {
//       if (theme.development){
//         console.error("Error loading anime page content:", error);
//       }
      
//     } finally {
//       setLoading(false);
//     }
//   };

//   const loadHeroContent = async () => {
//     try {
//       // Gerar ID aleatório entre 1 e 100 para o hero
//       const randomId = Math.floor(Math.random() * 100) + 1;
      
//       try {
//         const animeData = await animeService.getAnimeById(randomId);
//         setHeroContent(animeData);
//       } catch (error) {
//         // Se não conseguir buscar por ID aleatório, buscar dos populares
//         try {
//           const popularData = await animeService.getPopularAnimes(0, 1);
//           if (popularData.content.length > 0) {
//             const firstAnime = popularData.content[0];
//             const completeAnime = await animeService.getAnimeById(firstAnime.id);
//             setHeroContent(completeAnime);
//           }
//         } catch (fallbackError) {
//           if (theme.development){
//             console.error("Error loading hero content:", fallbackError);
//         }
//           }
          
//       }
//     } catch (error) {
//       if (theme.development){
//         console.error("Error loading hero content:", error);
//     }
//       }
      
//   };

//   const loadAnimeRows = async () => {
//     try {
//       const [
//         popularAnimesData,
//         newReleasesData,
//         highRatedAnimesData,
//         top10AnimesData
//       ] = await Promise.all([
//         animeService.getPopularAnimes(0, 12),
//         animeService.getNewReleases(0, 12),
//         animeService.getHighRatedAnimes(0, 12),
//         animeService.getTop10MostLiked()
//       ]);

//       setPopularAnimes(popularAnimesData.content);
//       setNewReleases(newReleasesData.content);
//       setHighRatedAnimes(highRatedAnimesData.content);
//       setTop10Animes(top10AnimesData);
//     } catch (error) {
//       if (theme.development){
//         console.error("Error loading anime rows:", error);
//     }
//       }
      
//   };

//   const loadGridContent = async (page: number) => {
//     try {
//       setGridLoading(true);
      
//       // Buscar todos os animes usando o SearchService
//       const searchData = await searchService.searchAnimes(undefined, undefined, page, 12);
      
//       setGridData(searchData);
//     } catch (error) {
//       if (theme.development){
//         console.error("Error loading grid content:", error);
//     }
//       }
//        finally {
//       setGridLoading(false);
//     }
//   };

//   const handleInfo = async (media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO ) => {
//     if (modalLoading) return;

//     try {
//       setModalLoading(true);
      
//       // Buscar dados completos do anime
//       const completeAnime = await animeService.getAnimeById(media.id);
      
//       setSelectedMedia(completeAnime);
//       setIsModalOpen(true);

//       // Atualizar URL sem recarregar a página
//       const newUrl = formatTitleForUrl(
//         media.id,
//         media.title,
//         media.anoLancamento,
//         media.type
//       );

//       window.history.pushState(null, "", `/animes${newUrl}`);
//     } catch (error) {
//       if (theme.development){
//         console.error("Error loading anime details:", error);
//     }
//       }
//        finally {
//       setModalLoading(false);
//     }
//   };

//   const handleGridPageChange = (page: number) => {
//     loadGridContent(page);
//   };

//   const handleGridMediaInfo = (media: MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO) => {
//     handleInfo(media);
//   };

//   const handleCloseModal = () => {
//     setIsModalOpen(false);
//     setSelectedMedia(null);

//     // Voltar para a URL da página de animes
//     window.history.pushState(null, "", "/animes");
//   };

//   if (loading) {
//     return <Loading />;
//   }

//   return (
//     <div
//       className="min-h-screen"
//       style={{ backgroundColor: theme.colors.background }}
//     >
//       {/* Header */}
//       <HeaderHome />

//       {/* Hero Section */}
//       {heroContent && (
//         <HeroSection
//           media={heroContent}
//           onInfo={() => handleInfo(heroContent as any)}
//         />
//       )}

//       {/* Content Rows */}
//       <div className="relative z-10 -mt-32 pb-8">
        
//         {/* Row 1: Top 10 Animes */}
//         {top10Animes.length > 0 && (
//           <MovieRow
//             title="Top 10 Animes"
//             movies={top10Animes}
//             onInfo={handleInfo}
//             isTop10={true}
//             isBigCard={true}
//           />
//         )}

//         {/* Row 2: Animes Populares */}
//         {popularAnimes.length > 0 && (
//           <MovieRow
//             title="Animes Populares"
//             movies={popularAnimes}
//             onInfo={handleInfo}
//             isBigCard={true}
//           />
//         )}

//         {/* Row 3: Novos Lançamentos */}
//         {newReleases.length > 0 && (
//           <MovieRow
//             title="Novos Lançamentos"
//             movies={newReleases}
//             onInfo={handleInfo}
//             isBigCard={true}
//           />
//         )}

//         {/* Row 4: Animes Bem Avaliados */}
//         {highRatedAnimes.length > 0 && (
//           <MovieRow
//             title="Animes Bem Avaliados"
//             movies={highRatedAnimes}
//             onInfo={handleInfo}
//             isBigCard={true}
//           />
//         )}

//         {/* MediaGrid Section */}
//         <div className="px-4 md:px-8 lg:px-12 mt-12">
//           <div className="mb-8">
//             <h2 className="text-2xl font-bold text-white mb-2">
//               Explorar Todos os Animes
//             </h2>
//             <p className="text-gray-400">
//               Navegue por nossa coleção completa de animes
//             </p>
//           </div>
          
//           <MediaGrid
//             data={gridData}
//             loading={gridLoading}
//             onPageChange={handleGridPageChange}
//             onMediaInfo={handleGridMediaInfo}
//             gridSize="medium"
//           />
//         </div>

//         {/* Aviso para usuários não logados */}
//         {!isAuthenticated && (
//           <FacaLogin />
//         )}
        
//         <Footer />
//       </div>

//       {/* Modal - só renderiza se tem selectedMedia */}
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