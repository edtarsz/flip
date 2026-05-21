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
  apiUrl: '${process.env.apiUrl}',
  supabaseUrl: '${process.env.supabaseUrl}',
  supabaseKey: '${process.env.supabaseKey}',
  tmdbUrl: '${process.env.tmdbUrl}',
  tmdbKey: '${process.env.tmdbKey}'
};
`;

writeFileSync(targetPath, content);
console.log('environment.ts generated');
