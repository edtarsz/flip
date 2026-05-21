import { writeFileSync } from 'fs';

const content = `
export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL}',
  supabaseUrl: '${process.env.SUPABASE_URL}',
  supabaseKey: '${process.env.SUPABASE_KEY}',
  tmdbUrl: '${process.env.TMDB_URL}',
  tmdbKey: '${process.env.TMDB_KEY}'
};
`;

writeFileSync(
  './src/environments/environment.ts',
  content
);

console.log('environment.prod.ts generado');