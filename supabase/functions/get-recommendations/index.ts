import { createRequestLogger } from '@shared/utils/logger.ts'
import { requireUser } from '@shared/utils/security.ts';
import { createServiceClient } from '@shared/utils/supabase-client.ts';
import { SwipeRepository } from '@shared/repositories/swipe.repository.ts';
import { Router } from '@shared/utils/router.ts';
import { RecommendationsController } from './controllers/recommendations.controller.ts';
import { corsHeaders } from '@shared/utils/cors.ts';
import { errorResponse } from '@shared/utils/http-helper.ts';

const TMDB_KEY = Deno.env.get('TMDB_API_KEY') ?? ''
const TMDB_BASE_URL = Deno.env.get('TMDB_BASE_URL') ?? ''

Deno.serve(async (req: Request) => {
  const logger = createRequestLogger('RecommendationsWorker');
  const url = new URL(req.url);
  const pathname = url.pathname;
  const method = req.method;

  if (method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createServiceClient();
    const swipeRepository = new SwipeRepository(supabaseClient);
    const recommendationsController = new RecommendationsController(swipeRepository, TMDB_KEY, TMDB_BASE_URL);

    logger.debug('Init', 'Controllers and repositories initialized');

    const user = await requireUser(req, supabaseClient);

    const router = new Router();

    router.get('/', async () => {
      logger.info('Route', `Matched: ${method} /`);
      const limit = Number(url.searchParams.get('limit')) || 20;
      const excludeParam = url.searchParams.get('exclude');
      const excludeIds = excludeParam ? excludeParam.split(',').map(Number).filter(n => !isNaN(n)) : [];
      const response = await recommendationsController.getRecommendations(user.id, limit, excludeIds);
      logger.success('Request', `${method} ${pathname}`);
      return response;
    });

    const response = await router.handle(req);
    if (!response) {
      logger.warn('Route', `Route not found: ${method} ${pathname}`);
      return new Response(JSON.stringify({ error: 'Route not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return response;
  } catch (err) {
    logger.error('ErrorHandler', 'Request failed', err instanceof Error ? err : new Error(String(err)));
    return errorResponse(err);
  }
})
