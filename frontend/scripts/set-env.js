import { writeFileSync } from 'fs';

const content = `
export const environment = {
  production: true,
  apiUrl: '${process.env.API_URL}'
};
`;

writeFileSync(
  './src/environments/environment.ts',
  content
);

console.log('environment.prod.ts generado');