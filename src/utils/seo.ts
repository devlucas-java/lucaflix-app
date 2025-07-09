import { Categoria, CATEGORIA_LABELS, TIPO_LABELS } from "../types/mediaTypes";
import { useEffect } from "react";

// Tipo para configuração SEO
export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  h1: string;
  canonical?: string;
  ogImage?: string;
}

// Configurações base por categoria - usando Record para type safety
const CATEGORY_SEO_BASE: Record<Categoria, {
  title: string;
  description: string;
  keywords: string;
}> = {
  [Categoria.TERROR]: {
    title: "Filmes de Terror",
    description: "os melhores filmes de terror online. Catálogo completo com clássicos do horror, suspense psicológico e terror contemporâneo",
    keywords: "filmes de terror, horror online, suspense psicológico, terror clássico, filmes assombrados",
  },
  [Categoria.ACAO]: {
    title: "Filmes de Ação",
    description: "nossa coleção de filmes de ação online. Aventura, adrenalina e os melhores blockbusters de ação em alta qualidade",
    keywords: "filmes de ação, ação online, aventura, blockbusters, filmes adrenalina",
  },
  [Categoria.COMEDIA]: {
    title: "Filmes de Comédia",
    description: "nossa seleção de filmes de comédia online. Humor inteligente, comédia romântica e os melhores filmes engraçados",
    keywords: "filmes de comédia, comédia online, filmes engraçados, humor, comédia romântica",
  },
  [Categoria.DRAMA]: {
    title: "Filmes de Drama",
    description: "os melhores filmes de drama online. Histórias emocionantes, dramas familiares e os grandes clássicos do cinema",
    keywords: "filmes de drama, drama online, histórias emocionantes, dramas familiares, cinema clássico",
  },
  [Categoria.ROMANCE]: {
    title: "Filmes de Romance",
    description: "os melhores filmes de romance online. Histórias de amor, comédia romântica e os clássicos do romance",
    keywords: "filmes de romance, romance online, histórias de amor, comédia romântica, filmes românticos",
  },
  [Categoria.FICCAO_CIENTIFICA]: {
    title: "Filmes de Ficção Científica",
    description: "nossa coleção de filmes de ficção científica online. Sci-fi, futurismo e as melhores aventuras espaciais",
    keywords: "filmes de ficção científica, sci-fi online, futurismo, aventuras espaciais, tecnologia",
  },
  [Categoria.FANTASIA]: {
    title: "Filmes de Fantasia",
    description: "mundos mágicos com nossos filmes de fantasia online. Aventura épica, magia e criaturas fantásticas",
    keywords: "filmes de fantasia, fantasia online, magia, aventura épica, criaturas fantásticas",
  },
  [Categoria.SUSPENSE]: {
    title: "Filmes de Suspense",
    description: "filmes de suspense online. Thrillers psicológicos e mistérios intrigantes que mantêm você na ponta da cadeira",
    keywords: "filmes de suspense, suspense online, thrillers psicológicos, mistérios, tensão",
  },
  [Categoria.ANIMACAO]: {
    title: "Filmes de Animação",
    description: "filmes de animação online. Desenhos animados, CGI e os melhores estúdios de animação para toda família",
    keywords: "filmes de animação, animação online, desenhos animados, CGI, família",
  },
  [Categoria.DOCUMENTARIO]: {
    title: "Documentários",
    description: "documentários online. Ciência, história, natureza e biografias fascinantes para expandir seus conhecimentos",
    keywords: "documentários online, documentários, ciência, história, natureza, biografias",
  },
  [Categoria.AVENTURA]: {
    title: "Filmes de Aventura",
    description: "filmes de aventura online. Expedições épicas, descobertas emocionantes e aventuras que levam você a mundos inexplorados",
    keywords: "filmes de aventura, aventura online, expedições, descobertas, jornadas épicas",
  },
  [Categoria.INFANTIL]: {
    title: "Filmes Infantis",
    description: "filmes infantis online. Diversão garantida para crianças com histórias educativas, aventuras mágicas e personagens queridos",
    keywords: "filmes infantis, filmes para crianças, entretenimento infantil, diversão família, desenhos animados",
  },
  [Categoria.DESCONHECIDA]: {
    title: "Outros Filmes",
    description: "nossa seleção diversificada de filmes online. Descubra conteúdos únicos e categorias especiais em nosso catálogo",
    keywords: "filmes diversos, conteúdo único, catálogo variado, filmes especiais, entretenimento online",
  },
};

// Configurações base por tipo
const TYPE_SEO_BASE = {
  movie: {
    title: "Filmes",
    description: "filmes online em alta qualidade. Todos os gêneros, lançamentos recentes e clássicos do cinema",
    keywords: "filmes online, cinema, lançamentos, filmes HD, catálogo filmes",
  },
  serie: {
    title: "Séries",
    description: "as melhores séries online. Drama, comédia, ação e os seriados mais populares em alta definição",
    keywords: "séries online, seriados, temporadas completas, séries HD, maratona",
  },
  anime: {
    title: "Animes",
    description: "animes online legendados e dublados. Shounen, shoujo, seinen e os melhores animes japoneses",
    keywords: "animes online, anime legendado, anime dublado, shounen, shoujo, seinen",
  }
};

// Verbos e prefixos para criar variações dinâmicas
const ACTION_VERBS = {
  movie: ["Assista", "Descubra", "Explore"],
  serie: ["Maratone", "Assista", "Descubra"],
  anime: ["Assista", "Descubra", "Explore"],
  search: ["Encontre", "Descubra", "Explore"],
  category: ["Descubra", "Explore", "Mergulhe em"]
};

const CONTENT_PREFIXES = {
  movie: ["aos", "nossa coleção de", "os melhores"],
  serie: ["as", "nossa seleção de", "as melhores"],
  anime: ["", "nossa coleção de", "os melhores"],
  mixed: ["", "nosso catálogo de", "os melhores"]
};

// Função principal para gerar SEO dinâmico
export const generateSEO = (params: {
  categoria?: Categoria | string;
  tipo?: "movie" | "serie" | "anime" | "all";
  texto?: string;
  totalResults?: number;
  currentPage?: number;
}): SEOConfig => {
  const { categoria, tipo, texto, totalResults, currentPage } = params;

  // SEO para busca por texto
  if (texto) {
    return generateSearchSEO(texto, categoria, tipo, totalResults, currentPage);
  }

  // SEO para categoria + tipo
  if (categoria && tipo && tipo !== "all") {
    return generateCategoryTypeSEO(categoria, tipo);
  }

  // SEO apenas para categoria
  if (categoria) {
    return generateCategorySEO(categoria);
  }

  // SEO apenas para tipo
  if (tipo && tipo !== "all") {
    return generateTypeSEO(tipo);
  }

  // SEO padrão para página de busca
  return {
    title: "Buscar Filmes, Séries e Animes Online",
    description: "Encontre filmes, séries e animes online. Busque por gênero, título ou categoria em nosso catálogo completo com conteúdo em alta qualidade.",
    keywords: "buscar filmes, buscar séries, buscar animes, catálogo online, entretenimento",
    h1: "Buscar Conteúdo Online",
  };
};

// Função para SEO de busca por texto
const generateSearchSEO = (
  texto: string,
  categoria?: Categoria | string,
  tipo?: "movie" | "serie" | "anime" | "all",
  totalResults?: number,
  currentPage?: number
): SEOConfig => {
  const cleanText = texto.trim();
  const pageText = currentPage && currentPage > 0 ? ` - Página ${currentPage + 1}` : "";
  const resultsText = totalResults ? ` (${totalResults} resultados)` : "";

  let typeText = "";
  let descriptionPrefix = "Resultados da busca por";

  if (tipo && tipo !== "all") {
    typeText = ` em ${TIPO_LABELS[tipo]}`;
    descriptionPrefix = `${TIPO_LABELS[tipo]} encontrados para`;
  }

  if (categoria && typeof categoria === 'string' && categoria in Categoria) {
    const cat = categoria as Categoria;
    const categoryName = CATEGORIA_LABELS[cat];
    typeText += ` na categoria ${categoryName}`;
  }

  return {
    title: `"${cleanText}"${typeText}${resultsText}${pageText}`,
    description: `${descriptionPrefix} "${cleanText}"${typeText}. Encontre exatamente o que procura em nosso catálogo completo.`,
    keywords: `${cleanText}, buscar ${cleanText}, ${cleanText} online${tipo && tipo !== "all" ? `, ${cleanText} ${tipo}` : ""}`,
    h1: `Resultados para "${cleanText}"${typeText}`,
  };
};

// Função para SEO de categoria + tipo
const generateCategoryTypeSEO = (
  categoria: Categoria | string,
  tipo: "movie" | "serie" | "anime"
): SEOConfig => {
  const cat = typeof categoria === 'string' ? categoria as Categoria : categoria;
  
  // Safe access with proper type checking
  const categoryBase = CATEGORY_SEO_BASE[cat];
  const typeBase = TYPE_SEO_BASE[tipo];

  if (!categoryBase || !typeBase) {
    return generateFallbackSEO();
  }

  const verb = ACTION_VERBS[tipo][Math.floor(Math.random() * ACTION_VERBS[tipo].length)];
  const prefix = CONTENT_PREFIXES[tipo][Math.floor(Math.random() * CONTENT_PREFIXES[tipo].length)];

  const title = `${categoryBase.title} - ${typeBase.title} Online`;
  const description = `${verb} ${prefix} ${categoryBase.description.toLowerCase()}.`;
  const keywords = `${categoryBase.keywords}, ${typeBase.keywords}`;
  const h1 = `${categoryBase.title} - ${typeBase.title} Online`;

  return { title, description, keywords, h1 };
};

// Função para SEO apenas de categoria
const generateCategorySEO = (categoria: Categoria | string): SEOConfig => {
  const cat = typeof categoria === 'string' ? categoria as Categoria : categoria;
  const categoryBase = CATEGORY_SEO_BASE[cat];

  if (!categoryBase) {
    return {
      title: `Categoria ${categoria}`,
      description: `Explore conteúdos da categoria ${categoria} online.`,
      keywords: `${categoria}, categoria ${categoria}`,
      h1: `Categoria ${categoria}`,
    };
  }

  const verb = ACTION_VERBS.category[Math.floor(Math.random() * ACTION_VERBS.category.length)];
  const prefix = CONTENT_PREFIXES.mixed[Math.floor(Math.random() * CONTENT_PREFIXES.mixed.length)];

  return {
    title: `${categoryBase.title} Online`,
    description: `${verb} ${prefix} ${categoryBase.description.toLowerCase()}.`,
    keywords: categoryBase.keywords,
    h1: `${categoryBase.title} Online - Catálogo Completo`,
  };
};

// Função para SEO apenas de tipo
const generateTypeSEO = (tipo: "movie" | "serie" | "anime"): SEOConfig => {
  const typeBase = TYPE_SEO_BASE[tipo];
  const verb = ACTION_VERBS[tipo][Math.floor(Math.random() * ACTION_VERBS[tipo].length)];
  const prefix = CONTENT_PREFIXES[tipo][Math.floor(Math.random() * CONTENT_PREFIXES[tipo].length)];

  return {
    title: `${typeBase.title} Online`,
    description: `${verb} ${prefix} ${typeBase.description.toLowerCase()}.`,
    keywords: typeBase.keywords,
    h1: `${typeBase.title} Online - Catálogo Completo`,
  };
};

// Função fallback para casos não cobertos
const generateFallbackSEO = (): SEOConfig => {
  return {
    title: "Entretenimento Online",
    description: "Descubra filmes, séries e animes online em alta qualidade.",
    keywords: "entretenimento online, filmes, séries, animes",
    h1: "Entretenimento Online",
  };
};

// Função para aplicar SEO na página
export const applySEO = (seoConfig: SEOConfig, baseUrl?: string) => {
  // Check if we're in a browser environment
  if (typeof document === 'undefined' || typeof window === 'undefined') {
    return;
  }

  // Título da página
  document.title = seoConfig.title;

  // Meta description
  updateOrCreateMeta("description", seoConfig.description);

  // Meta keywords
  updateOrCreateMeta("keywords", seoConfig.keywords);

  // Open Graph tags
  updateOrCreateMeta("og:title", seoConfig.title, "property");
  updateOrCreateMeta("og:description", seoConfig.description, "property");
  updateOrCreateMeta("og:type", "website", "property");

  // Twitter Card tags
  updateOrCreateMeta("twitter:card", "summary_large_image");
  updateOrCreateMeta("twitter:title", seoConfig.title);
  updateOrCreateMeta("twitter:description", seoConfig.description);

  // Canonical URL se fornecida
  if (seoConfig.canonical || baseUrl) {
    const canonicalUrl = seoConfig.canonical || `${baseUrl}${window.location.pathname}`;
    updateOrCreateLink("canonical", canonicalUrl);
  }

  // Imagem OG se fornecida
  if (seoConfig.ogImage) {
    updateOrCreateMeta("og:image", seoConfig.ogImage, "property");
    updateOrCreateMeta("twitter:image", seoConfig.ogImage);
  }
};

// Função auxiliar para atualizar ou criar meta tags
const updateOrCreateMeta = (name: string, content: string, attribute: string = "name") => {
  if (typeof document === 'undefined') return;
  
  const selector = `meta[${attribute}="${name}"]`;
  let meta = document.querySelector(selector) as HTMLMetaElement;

  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attribute, name);
    document.head.appendChild(meta);
  }

  meta.setAttribute("content", content);
};

// Função auxiliar para atualizar ou criar link tags
const updateOrCreateLink = (rel: string, href: string) => {
  if (typeof document === 'undefined') return;
  
  const selector = `link[rel="${rel}"]`;
  let link = document.querySelector(selector) as HTMLLinkElement;

  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", rel);
    document.head.appendChild(link);
  }

  link.setAttribute("href", href);
};

// Hook personalizado para usar SEO (opcional, para componentes React)
export const useSEO = (params: Parameters<typeof generateSEO>[0], baseUrl?: string) => {
  const seoConfig = generateSEO(params);
  
  useEffect(() => {
    applySEO(seoConfig, baseUrl);
  }, [seoConfig, baseUrl]);

  return seoConfig;
};