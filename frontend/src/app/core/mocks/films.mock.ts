import { FilmTMDB } from '@core/types/tmdb/film.type';
import { GenreTMDB } from '@core/types/tmdb/genre.type';

export const MOCK_GENRES: GenreTMDB[] = [
  { id: 1, name: 'Action' },
  { id: 2, name: 'Comedy' },
  { id: 3, name: 'Drama' },
  { id: 4, name: 'Romance' }
];

export const MOCK_LANDING_FILMS: FilmTMDB[] = [
  {
    id: 1,
    title: 'La La Land',
    vote_average: 8.4,
    release_date: '2016-12-09',
    genre_ids: [3, 4],
    overview: 'Sebastian and Mia are drawn together by their common desire to do what they love. But as success mounts they are faced with decisions that begin to fray the fragile fabric of their love affair.',
    poster_path: '/assets/images/lalaland.webp',
    adult: false,
    backdrop_path: '',
    original_language: 'en',
    original_title: 'La La Land',
    popularity: 100,
    video: false,
    vote_count: 1000,
    softcore: false
  },
  {
    id: 2,
    title: 'Interstellar',
    vote_average: 8.4,
    release_date: '2014-11-05',
    genre_ids: [1, 3],
    overview: 'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    poster_path: '/assets/images/interestellar.webp',
    adult: false,
    backdrop_path: '',
    original_language: 'en',
    original_title: 'Interstellar',
    popularity: 100,
    video: false,
    vote_count: 1000,
    softcore: false
  },
  {
    id: 3,
    title: 'Everything Everywhere All at Once',
    vote_average: 8.0,
    release_date: '2022-03-24',
    genre_ids: [1, 2, 3],
    overview: 'An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led.',
    poster_path: '/assets/images/every.webp',
    adult: false,
    backdrop_path: '',
    original_language: 'en',
    original_title: 'Everything Everywhere All at Once',
    popularity: 100,
    video: false,
    vote_count: 1000,
    softcore: false
  },
  {
    id: 4,
    title: 'Spider-Man: Across the Spider-Verse',
    vote_average: 8.4,
    release_date: '2023-05-31',
    genre_ids: [1, 2],
    overview: 'After reuniting with Gwen Stacy, Brooklyn’s full-time, friendly neighborhood Spider-Man is catapulted across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    poster_path: '/assets/images/spider.webp',
    adult: false,
    backdrop_path: '',
    original_language: 'en',
    original_title: 'Spider-Man: Across the Spider-Verse',
    popularity: 100,
    video: false,
    vote_count: 1000,
    softcore: false
  },
  {
    id: 5,
    title: 'Dune: Part Two',
    vote_average: 8.3,
    release_date: '2024-02-27',
    genre_ids: [1, 3],
    overview: 'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
    poster_path: '/assets/images/dune.webp',
    adult: false,
    backdrop_path: '',
    original_language: 'en',
    original_title: 'Dune: Part Two',
    popularity: 100,
    video: false,
    vote_count: 1000,
    softcore: false
  }
];
