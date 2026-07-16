import { SwipeRepository } from "@shared/repositories/swipe.repository.ts";
import {
  TmdbDiscoverResult,
  TmdbMovieDetailsResponse,
} from "@shared/models/tmdb.ts";
import { corsHeaders } from "@shared/utils/cors.ts";

const TARGET_GENRE_CANDIDATES = 20;
const TARGET_PEOPLE_CANDIDATES = 12;
const TARGET_TOTAL_CANDIDATES = 40;

const PEOPLE_PHASE_BONUS = 0.3;

const TODAY = new Date().toISOString().split("T")[0];
const MIN_VOTE_COUNT = 200;
const MIN_RELEASE_DATE = "1980-01-01";

const QUALITY_PARAMS = [
  "sort_by=popularity.desc",
  "include_adult=false",
  `vote_count.gte=${MIN_VOTE_COUNT}`,
  `primary_release_date.gte=${MIN_RELEASE_DATE}`,
  `primary_release_date.lte=${TODAY}`,
].join("&");

export class RecommendationsController {
  private readonly swipeRepository: SwipeRepository;
  private readonly tmdbKey: string;
  private readonly tmdbUrl: string;

  constructor(
    swipeRepository: SwipeRepository,
    tmdbKey: string,
    tmdbUrl: string,
  ) {
    this.swipeRepository = swipeRepository;
    this.tmdbKey = tmdbKey;
    this.tmdbUrl = tmdbUrl;
  }

  async getRecommendations(
    userId: string,
    limit = 20,
    clientExcludedIds: number[] = [],
  ): Promise<Response> {
    const [genreProfile, peopleProfile, swipedIds, genreListData, recentLikes] =
      await Promise.all([
        this.swipeRepository.getUserGenreWeights(userId),
        this.swipeRepository.getUserPeopleWeights(userId),
        this.swipeRepository.getSwipedExternalFilmIds(userId),
        this.tmdbFetch("/genre/movie/list").then((r) => r.json()),
        this.swipeRepository.getRecentLikedExternalFilmIds(userId, 3),
      ]);

    const genreWeightMap: Record<string, number> = {};
    for (const row of genreProfile) {
      genreWeightMap[row.attribute_value] = row.weight;
    }

    const genreNameToId: Record<string, number> = {};
    const genreIdToName: Record<number, string> = {};

    for (const g of genreListData.genres ?? []) {
      genreNameToId[g.name] = g.id;
      genreIdToName[g.id] = g.name;
    }

    const positiveGenres = genreProfile
      .filter((r) => r.weight > 0)
      .sort((a, b) => b.weight - a.weight);

    const topPeopleIds = peopleProfile
      .slice(0, 3)
      .map((r) => r.attribute_value);

    const genrePromise = this.buildGenreCandidates(
      recentLikes,
      positiveGenres,
      genreNameToId,
      swipedIds,
    );

    const peoplePromise =
      topPeopleIds.length > 0
        ? this.fetchCandidates(
            "/discover/movie",
            `${QUALITY_PARAMS}&with_people=${topPeopleIds.join("|")}`,
            TARGET_PEOPLE_CANDIDATES,
            swipedIds,
          )
        : Promise.resolve([]);

    const [genreCandidates, peopleCandidates] = await Promise.all([
      genrePromise,
      peoplePromise,
    ]);

    const candidates: TmdbDiscoverResult[] = [];
    const candidateIds = new Set<number>();
    const fromPeoplePhase = new Set<number>();

    for (const film of genreCandidates) {
      if (!candidateIds.has(film.id) && !clientExcludedIds.includes(film.id)) {
        candidateIds.add(film.id);
        candidates.push(film);
      }
    }

    for (const film of peopleCandidates) {
      if (!candidateIds.has(film.id) && !clientExcludedIds.includes(film.id)) {
        candidateIds.add(film.id);
        candidates.push(film);
        fromPeoplePhase.add(film.id);
      }
    }

    if (candidates.length < TARGET_TOTAL_CANDIDATES) {
      const allExcluded = new Set([
        ...swipedIds,
        ...candidateIds,
        ...clientExcludedIds,
      ]);
      const backfill = await this.fetchCandidates(
        "/discover/movie",
        QUALITY_PARAMS,
        TARGET_TOTAL_CANDIDATES - candidates.length,
        allExcluded,
      );
      for (const film of backfill) {
        if (!candidateIds.has(film.id)) {
          candidateIds.add(film.id);
          candidates.push(film);
        }
      }
    }

    const scored = candidates
      .map((film) => {
        const genreScore = (film.genre_ids || []).reduce((sum, gid) => {
          const name = genreIdToName[gid];
          return (
            sum + (name && genreWeightMap[name] ? genreWeightMap[name] : 0)
          );
        }, 0);

        const peopleBonus = fromPeoplePhase.has(film.id)
          ? PEOPLE_PHASE_BONUS
          : 0;

        return { ...film, score: genreScore + peopleBonus };
      })
      .sort((a, b) => b.score - a.score);

    const topN = scored.slice(0, limit);
    const topNIds = topN.map((film) => film.id);

    const existingFilms =
      await this.swipeRepository.getFilmsByExternalIds(topNIds);
    const existingMap = new Map<number, (typeof existingFilms)[0]>();
    for (const f of existingFilms) {
      existingMap.set(Number(f.external_film_id), f);
    }

    const enriched = await Promise.all(
      topN.map(async (film) => {
        const dbFilm = existingMap.get(film.id);
        if (
          dbFilm &&
          dbFilm.runtime !== null &&
          dbFilm.director_name !== null &&
          dbFilm.credits !== null
        ) {
          return {
            ...film,
            director_id: dbFilm.director_id,
            director_name: dbFilm.director_name,
            runtime: dbFilm.runtime,
            cast_ids: dbFilm.cast_ids ?? [],
            cast_names: dbFilm.cast_names ?? [],
            watch_providers: dbFilm.watch_providers ?? null,
            credits: dbFilm.credits ?? null,
          };
        }

        try {
          const details = await this.fetchFilmDetails(film.id);
          const director =
            details.credits?.crew.find((p) => p.job === "Director") ?? null;
          const topCast = details.credits?.cast.slice(0, 20) ?? [];
          const watchProviders = details["watch/providers"]?.results ?? null;

          const enrichedFilm = {
            external_film_id: film.id,
            title: film.title,
            poster_path: film.poster_path,
            vote_average: film.vote_average,
            vote_count: film.vote_count,
            release_date: film.release_date,
            genre_ids: film.genre_ids ?? [],
            director_id: director?.id ?? null,
            director_name: director?.name ?? null,
            runtime: details.runtime ?? null,
            cast_ids: topCast.map((a) => a.id),
            cast_names: topCast.map((a) => a.name),
            watch_providers: watchProviders,
            credits: {
              cast: topCast.map((a) => ({
                name: a.name,
                profile_path: a.profile_path,
                character: a.character,
              })),
              crew: director ? [director] : [],
            },
          };

          this.swipeRepository.upsertFilm(enrichedFilm).catch((e) => {
            console.error(`Cache upsert failed for film ${film.id}:`, e);
          });

          return {
            ...film,
            ...enrichedFilm,
          };
        } catch (e) {
          console.error(`Failed to fetch details for movie ${film.id}:`, e);
          return {
            ...film,
            director_id: null,
            director_name: null,
            runtime: null,
            cast_ids: [],
            cast_names: [],
            watch_providers: null,
          };
        }
      }),
    );

    return Response.json({ results: enriched }, { headers: corsHeaders });
  }

  private async fetchFilmDetails(
    externalFilmId: number,
  ): Promise<TmdbMovieDetailsResponse> {
    const res = await this.tmdbFetch(
      `/movie/${externalFilmId}?append_to_response=credits,watch/providers`,
    );

    if (!res.ok) {
      throw new Error(
        `TMDB details fetch failed for film ${externalFilmId}: ${res.statusText}`,
      );
    }

    return res.json() as Promise<TmdbMovieDetailsResponse>;
  }

  private async buildGenreCandidates(
    recentLikes: number[],
    positiveGenres: { attribute_value: string; weight: number }[],
    genreNameToId: Record<string, number>,
    swipedIds: Set<number>,
  ): Promise<TmdbDiscoverResult[]> {
    if (recentLikes.length > 0) {
      const perMovieTarget = Math.max(
        1,
        Math.floor(TARGET_GENRE_CANDIDATES / recentLikes.length),
      );
      const batches = await Promise.all(
        recentLikes.map((filmId) =>
          this.fetchCandidates(
            `/movie/${filmId}/similar`,
            "",
            perMovieTarget,
            swipedIds,
          ),
        ),
      );
      return batches.flat();
    }

    if (positiveGenres.length > 0) {
      const topGenreIds = positiveGenres
        .slice(0, 3)
        .map((r) => genreNameToId[r.attribute_value])
        .filter(Boolean);

      if (topGenreIds.length > 0) {
        return this.fetchCandidates(
          "/discover/movie",
          `${QUALITY_PARAMS}&with_genres=${topGenreIds.join("|")}`,
          TARGET_GENRE_CANDIDATES,
          swipedIds,
        );
      }
    }

    return [];
  }

  private async fetchCandidates(
    endpoint: string,
    queryParams: string,
    targetCount: number,
    excludeIds: Set<number>,
    maxPages = 5,
  ): Promise<TmdbDiscoverResult[]> {
    const collected: TmdbDiscoverResult[] = [];
    const localIds = new Set<number>();
    let page = 1;

    while (collected.length < targetCount && page <= maxPages) {
      const fullPath = queryParams
        ? `${endpoint}?${queryParams}&page=${page}`
        : `${endpoint}?page=${page}`;
      const res = await this.tmdbFetch(fullPath);

      if (!res.ok) {
        if (page === 1 && collected.length === 0) {
          console.warn(`TMDB fetch failed for ${fullPath}: ${res.statusText}`);
        }
        break;
      }

      const data = await res.json();
      const results: TmdbDiscoverResult[] = data.results ?? [];

      if (results.length === 0) break;

      for (const film of results) {
        if ((film.vote_count ?? 0) < MIN_VOTE_COUNT) continue;
        if (
          !film.release_date ||
          film.release_date < MIN_RELEASE_DATE ||
          film.release_date > TODAY
        )
          continue;
        if (film.adult) continue;

        if (!excludeIds.has(film.id) && !localIds.has(film.id)) {
          localIds.add(film.id);
          collected.push(film);
        }
      }

      page++;
    }

    return collected;
  }

  private tmdbFetch(path: string): Promise<Response> {
    const url = path.startsWith("http") ? path : `${this.tmdbUrl}${path}`;
    return fetch(url, {
      headers: { Authorization: `Bearer ${this.tmdbKey}` },
    });
  }
}
