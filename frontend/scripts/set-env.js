import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { dirname } from 'path';

const targetPath = './src/environments/environment.ts';
const dirPath = dirname(targetPath);

if (!existsSync(dirPath)) {
  mkdirSync(dirPath, { recursive: true });
}

const content = `
export const environment = {
  production: true,
  apiUrl: '${process.env.apiUrl || process.env.API_URL || ''}',
  supabaseUrl: '${process.env.supabaseUrl || process.env.SUPABASE_URL || ''}',
  supabaseKey: '${process.env.supabaseKey || process.env.SUPABASE_KEY || ''}',
  tmdbUrl: '${process.env.tmdbUrl || process.env.TMDB_URL || 'https://api.themoviedb.org/3/discover'}',
  tmdbKey: '${process.env.tmdbKey || process.env.TMDB_KEY || ''}'
};
`;

writeFileSync(targetPath, content);
console.log('environment.ts generado con variables de entorno robustas');
