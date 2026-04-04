// Paleta de colores de la aplicación Credit Tracker
// Tema premium estilo financiero de lujo: dorado, beige, blanco cálido, champagne

export const Colors = {
  // Primarios premium (dorado/champagne)
  primary: '#B8974A',           // Dorado premium
  primaryLight: '#D4AF6A',      // Dorado claro
  primaryDark: '#8B6914',       // Dorado oscuro
  primaryGlow: '#F0D080',       // Brillo dorado

  // Secundario (carbón/grafito elegante)
  secondary: '#2C2C2E',         // Casi negro premium
  secondaryLight: '#48484A',    // Gris oscuro
  secondaryDark: '#1C1C1E',     // Negro profundo

  // Acento
  accent: '#C9A96E',            // Bronce cálido

  // Estados
  success: '#4A7C59',           // Verde oliva suave
  warning: '#C17D3C',           // Ámbar cálido
  error: '#9B3A3A',             // Rojo vino
  info: '#4A6B8A',              // Azul pizarra

  // Fondos premium
  background: '#F8F5F0',        // Blanco cálido / beige muy claro
  surface: '#FFFFFF',           // Blanco puro
  surfaceAlt: '#F5EFE6',        // Beige cálido para tarjetas
  surfaceCard: '#FDFAF6',       // Beige muy suave

  // Bordes y divisores
  border: '#E8DFD0',            // Beige/arena
  divider: '#F0E8DC',           // Divisor suave beige
  borderGold: '#D4AF6A',        // Borde dorado

  // Textos
  white: '#FFFFFF',
  black: '#000000',
  textPrimary: '#1A1A1A',       // Casi negro elegante
  textSecondary: '#6B5E4E',     // Marrón cálido
  textDisabled: '#B8A898',      // Beige grisáceo
  textOnPrimary: '#FFFFFF',
  textGold: '#B8974A',          // Texto dorado

  // Tarjetas de crédito premium
  cardGold: '#8B6914',
  cardOnyx: '#2C2C2E',
  cardRose: '#8B4A5A',
  cardNavy: '#1A2E4A',
  cardForest: '#2A4A3A',
  cardBurgundy: '#5A1A2A',

  // Aliases para compatibilidad con código existente
  cardBlue: '#1A2E4A',
  cardGreen: '#2A4A3A',
  cardPurple: '#5A3A7A',
  cardOrange: '#C17D3C',
  bankBlue: '#4A6B8A',
  bankGreen: '#4A7C59',
  bankGray: '#6B5E4E',
};

// Tipografías
export const Typography = {
  h1: { fontSize: 28, fontWeight: 'bold' },
  h2: { fontSize: 24, fontWeight: 'bold' },
  h3: { fontSize: 20, fontWeight: '600' },
  h4: { fontSize: 18, fontWeight: '600' },
  body1: { fontSize: 16 },
  body2: { fontSize: 14 },
  caption: { fontSize: 12 },
  small: { fontSize: 10 },
};

// Espaciados
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Bordes redondeados
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
};

export default Colors;
