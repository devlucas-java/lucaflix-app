import api from "./api";
import type { PaginatedResponseDTO } from "../types/mediaTypes";
import type {
  MovieSimpleDTO,
  SerieSimpleDTO,
  AnimeSimpleDTO,
} from "../types/mediaTypes";
import { Categoria } from "../types/mediaTypes";
import theme from "../theme/theme";

// Interfaces para parâmetros de busca
export interface SearchParams {
  texto?: string;
  categoria?: Categoria;
  tipo?: "movie" | "serie" | "anime" | "all";
  page?: number;
  size?: number;
}

export class SearchService {
  private readonly endpoint = "/search/media";

  /**
   * Realiza busca de mídia (filmes, séries, animes)
   */
  async searchMedia(
    params: SearchParams = {}
  ): Promise<
    PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO>
  > {
    try {
      const { texto, categoria, tipo = "all", page = 0, size = 20 } = params;

      // Construir parâmetros da query
      const searchParams = new URLSearchParams();

      if (texto && texto.trim()) {
        searchParams.append("texto", texto.trim());
      }

      if (categoria) {
        searchParams.append("categoria", categoria);
      }

      searchParams.append("tipo", tipo);
      searchParams.append("page", page.toString());
      searchParams.append("size", size.toString());

      if (theme.development) {
        console.log("Realizando busca com parâmetros:", {
        texto,
        categoria,
        tipo,
        page,
        size,
      });
      }
      

      const response = await api.get(
        `${this.endpoint}?${searchParams.toString()}`
      );

      if (theme.development) {
        console.log("Busca realizada com sucesso:", {
        totalElements: response.data.totalElements,
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
      });
      }


      // Retorna diretamente os dados do servidor/admin
      return response.data;
    } catch (error: any) {
      if (theme.development) {
        console.error("Erro ao realizar busca:", error);

      }
      
      // Tratamento específico de erros
      if (error.response?.status === 400) {
        throw new Error("Parâmetros de busca inválidos");
      } else if (error.response?.status === 500) {
        throw new Error(
          "Erro interno do servidor. Tente novamente mais tarde."
        );
      } else if (!navigator.onLine) {
        throw new Error("Sem conexão com a internet");
      } else {
        throw new Error(
          "Erro ao realizar busca. Verifique sua conexão e tente novamente."
        );
      }
    }
  }

  /**
   * Busca rápida (para autocomplete/sugestões)
   */
  async quickSearch(
    query: string,
    limit: number = 5
  ): Promise<(MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO)[]> {
    if (!query.trim()) {
      return [];
    }

    try {
      const response = await this.searchMedia({
        texto: query,
        tipo: "all",
        page: 0,
        size: limit,
      });

      return response.content;
    } catch (error) {
      if (theme.development) {
        console.error("Erro na busca rápida:", error);
      }
      return [];
      
    }
  }

  /**
   * Obter sugestões de busca baseadas em categoria
   */
  async searchByCategory(
    categoria: Categoria,
    page: number = 0,
    size: number = 20
  ): Promise<
    PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO>
  > {
    return this.searchMedia({
      categoria,
      tipo: "all",
      page,
      size,
    });
  }

  /**
   * Buscar apenas filmes
   */
  async searchMovies(
    texto?: string,
    categoria?: Categoria,
    page: number = 0,
    size: number = 20
  ): Promise<
    PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO>
  > {
    return this.searchMedia({
      texto,
      categoria,
      tipo: "movie",
      page,
      size,
    });
  }

  /**
   * Buscar apenas séries
   */
  async searchSeries(
    texto?: string,
    categoria?: Categoria,
    page: number = 0,
    size: number = 20
  ): Promise<
    PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO>
  > {
    return this.searchMedia({
      texto,
      categoria,
      tipo: "serie",
      page,
      size,
    });
  }

  /**
   * Buscar apenas animes
   */
  async searchAnimes(
    texto?: string,
    categoria?: Categoria,
    page: number = 0,
    size: number = 20
  ): Promise<
    PaginatedResponseDTO<MovieSimpleDTO | SerieSimpleDTO | AnimeSimpleDTO>
  > {
    return this.searchMedia({
      texto,
      categoria,
      tipo: "anime",
      page,
      size,
    });
  }
}