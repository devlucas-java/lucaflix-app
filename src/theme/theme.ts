export const playerLink = "https://lucaplayer.netlify.app";

export const theme = {
  development: false, // Modo de desenvolvimento

  colors: {
    // Principais
    background: '#141414',
    backgroundLight: '#1a1a1a',
    backgroundCard: '#2a2a2a',
    surface: '#141414',
    primary: '#e50914',
    primaryHover: '#f40612',
    secondary: '#B20710',
    accent: '#564D4D',
    noUse: '#b3b3b3',

    // Texto
    text: {
      primary: '#ffffff',
      secondary: '#b3b3b3',
      muted: '#808080',
      inverse: '#000000',
    },

    // Botões
    button: {
      primary: '#ffffff',
      primaryText: '#000000',
      secondary: 'rgba(109, 109, 110, 0.7)',
      secondaryText: '#ffffff',
      danger: '#e50914',
      dangerText: '#ffffff',
    },

    // Status
    error: '#F40612',
    success: '#46D369',
    warning: '#FFA500',
    info: '#17a2b8',

    // Overlay
    overlay: 'rgba(0, 0, 0, 0.75)',
    overlayLight: 'rgba(0, 0, 0, 0.5)',

    // Bordas
    border: '#333333',
    borderLight: '#404040',

    // Gradientes
    gradients: {
      hero: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0) 100%)',
      cardHover: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)',
      topFade: 'linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
      bottomFade: 'linear-gradient(to top, rgba(20,20,20,1) 0%, rgba(20,20,20,0) 100%)',
    },
  },

  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
    '3xl': '4rem',
    '4xl': '6rem',
  },

  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem',
    '7xl': '4.5rem',
  },

  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900,
  },

  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px',
  },

  boxShadow: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    netflix: '0 4px 8px rgba(0, 0, 0, 0.6)',
  },

  transition: {
    fast: '150ms ease-in-out',
    base: '300ms ease-in-out',
    slow: '500ms ease-in-out',
  },

  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  components: {
    card: {
      background: '#2a2a2a',
      hoverBackground: '#3a3a3a',
      borderRadius: '0.5rem',
      padding: '1rem',
    },

    button: {
      borderRadius: '0.25rem',
      padding: {
        sm: '0.5rem 1rem',
        md: '0.75rem 1.5rem',
        lg: '1rem 2rem',
      },
    },

    input: {
      background: '#333333',
      border: '#555555',
      borderRadius: '0.25rem',
      padding: '0.75rem 1rem',
    },

    modal: {
      background: '#1a1a1a',
      borderRadius: '0.5rem',
      maxWidth: '90vw',
      maxHeight: '90vh',
    },
  },
};

export default theme;
