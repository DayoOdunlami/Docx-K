import { z } from 'zod';

// Theme schema validation
export const ThemeSchema = z.object({
  name: z.string(),
  domain: z.string(),
  description: z.string(),
  colors: z.object({
    primary: z.string(),
    secondary: z.string(),
    accent: z.string(),
    charcoal: z.string(),
    darkBlue: z.string(),
    background: z.string(),
    foreground: z.string(),
    muted: z.string(),
    mutedForeground: z.string(),
  }),
  typography: z.object({
    fontFamily: z.object({
      heading: z.string(),
      body: z.string(),
    }),
    fontSize: z.object({
      xs: z.string(),
      sm: z.string(),
      base: z.string(),
      lg: z.string(),
      xl: z.string(),
      '2xl': z.string(),
      '3xl': z.string(),
      '4xl': z.string(),
    }),
  }),
  branding: z.object({
    logo: z.string(),
    favicon: z.string(),
    title: z.string(),
    subtitle: z.string(),
  }),
});

export type Theme = z.infer<typeof ThemeSchema>;

// Available themes
export const AVAILABLE_THEMES = {
  'siz': 'catapult-siz',
  'credo': 'catapult-credo',
} as const;

export type ThemeDomain = keyof typeof AVAILABLE_THEMES;

/**
 * Load theme configuration by domain
 */
export async function loadTheme(domain: ThemeDomain): Promise<Theme> {
  const themeFile = AVAILABLE_THEMES[domain];
  
  try {
    const themeModule = await import(`@/data/themes/${themeFile}.json`);
    const theme = ThemeSchema.parse(themeModule.default);
    return theme;
  } catch (error) {
    console.error(`Failed to load theme for domain: ${domain}`, error);
    // Return default theme
    return getDefaultTheme();
  }
}

/**
 * Get default Catapult theme
 */
export function getDefaultTheme(): Theme {
  return {
    name: "Catapult Default",
    domain: "default",
    description: "Default Catapult theme",
    colors: {
      primary: "#006E51",
      secondary: "#E72D2B",
      accent: "#EF7A1E",
      charcoal: "#2E2D2B",
      darkBlue: "#122836",
      background: "#FFFFFF",
      foreground: "#2E2D2B",
      muted: "#F5F5F5",
      mutedForeground: "#6B7280",
    },
    typography: {
      fontFamily: {
        heading: "Inter, sans-serif",
        body: "Inter, sans-serif",
      },
      fontSize: {
        xs: "0.75rem",
        sm: "0.875rem",
        base: "1rem",
        lg: "1.125rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "1.875rem",
        "4xl": "2.25rem",
      },
    },
    branding: {
      logo: "/logos/catapult.svg",
      favicon: "/favicon.ico",
      title: "Connected Places Catapult",
      subtitle: "Innovation for Connected Places",
    },
  };
}

/**
 * Apply theme CSS variables to document
 */
export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  
  const root = document.documentElement;
  
  // Apply color variables
  Object.entries(theme.colors).forEach(([key, value]) => {
    root.style.setProperty(`--color-${key}`, value);
  });
  
  // Apply typography variables
  root.style.setProperty('--font-heading', theme.typography.fontFamily.heading);
  root.style.setProperty('--font-body', theme.typography.fontFamily.body);
}