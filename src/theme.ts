export const lightTheme = {
  background: '#f6f5ef',
  surface: '#ffffff',
  card: '#f3f3f0',
  text: '#203d32',
  muted: '#68756d',
  accent: '#244f40',
  accentSoft: '#dfeae4',
  border: '#e1e5dc',
  danger: '#f8e3dd',
  dangerText: '#9d3d3d',
  shadow: '#dfe4dc',
};

export const darkTheme = {
  background: '#111827',
  surface: '#1f2937',
  card: '#0f172a',
  text: '#f2f6f3',
  muted: '#b6c3bd',
  accent: '#7dd3b0',
  accentSoft: '#1d3a38',
  border: '#374151',
  danger: '#3b1f1f',
  dangerText: '#f4b4b4',
  shadow: '#020617',
};

export const getTheme = (isDark: boolean) => (isDark ? darkTheme : lightTheme);
