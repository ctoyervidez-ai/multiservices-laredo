import { homeContent } from './home-content';

export function contentFields(value: unknown = homeContent, prefix = ''): Record<string, string> {
  if (typeof value === 'string') return { [prefix]: value };
  if (!value || typeof value !== 'object') return {};
  return Object.assign({}, ...Object.entries(value).map(([key, item]) => contentFields(item, prefix ? `${prefix}.${key}` : key)));
}
export const editableContentFields = contentFields();
export function validateContentOverrides(input: unknown): Record<string, string> {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Contenido inválido.');
  const entries = Object.entries(input);
  if (entries.length > Object.keys(editableContentFields).length) throw new Error('Demasiados campos.');
  for (const [key, value] of entries) {
    if (!Object.hasOwn(editableContentFields, key) || typeof value !== 'string' || !value.trim() || value.length > 5000) throw new Error('Revisa los textos: no pueden estar vacíos ni superar 5000 caracteres.');
  }
  return Object.fromEntries(entries.map(([key, value]) => [key, (value as string).trim()]));
}
export function applyContentOverrides<T>(defaults: T, overrides: Record<string, string>, prefix = ''): T {
  if (typeof defaults === 'string') return (overrides[prefix] ?? defaults) as T;
  if (Array.isArray(defaults)) return defaults.map((item, i) => applyContentOverrides(item, overrides, `${prefix}.${i}`)) as T;
  if (defaults && typeof defaults === 'object') return Object.fromEntries(Object.entries(defaults).map(([key, value]) => [key, applyContentOverrides(value, overrides, prefix ? `${prefix}.${key}` : key)])) as T;
  return defaults;
}
