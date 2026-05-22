import { FilmTMDB } from "@core/types/tmdb/film.type";

export const MOCK_SWIPE: FilmTMDB[] = [
    {
        adult: false,
        backdrop_path: '/k7H42H7N88k1s39tKj1P6F4V1lY.jpg',
        genre_ids: [1, 2, 3],
        id: 1,
        original_language: 'en',
        original_title: 'The Movie',
        overview: 'This is the overview of the movie',
        popularity: 100,
        poster_path: '/k7H42H7N88k1s39tKj1P6F4V1lY.jpg',
        release_date: '2022-01-01',
        title: 'The Movie',
        video: false,
        vote_average: 10,
        vote_count: 100,
        softcore: false
    },
    {
        adult: false,
        backdrop_path: '/k7H42H7N88k1s39tKj1P6F4V1lY.jpg',
        genre_ids: [1, 2, 3],
        id: 2,
        original_language: 'en',
        original_title: 'The Movie 2',
        overview: 'This is the overview of the movie 2',
        popularity: 100,
        poster_path: '/k7H42H7N88k1s39tKj1P6F4V1lY.jpg',
        release_date: '2022-01-01',
        title: 'The Movie 2',
        video: false,
        vote_average: 9.2,
        vote_count: 100,
        softcore: true
    },
    {
        adult: false,
        backdrop_path: '/k7H42H7N88k1s39tKj1P6F4V1lY.jpg',
        genre_ids: [1, 2, 3],
        id: 3,
        original_language: 'en',
        original_title: 'The Movie 3',
        overview: 'This is the overview of the movie 3',
        popularity: 100,
        poster_path: '/k7H42H7N88k1s39tKj1P6F4V1lY.jpg',
        release_date: '2022-01-01',
        title: 'The Movie 3',
        video: false,
        vote_average: 10,
        vote_count: 100,
        softcore: false
    }
]

export const MOCK_GENRES: any[] = [
    {
        id: 1,
        name: 'Action'
    },
    {
        id: 2,
        name: 'Comedy'
    },
    {
        id: 3,
        name: 'Drama'
    }
]