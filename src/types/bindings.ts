import type { D1Database } from '@cloudflare/workers-types'

export type Bindings = {
  DB: D1Database;
  API_KEY: string;
  OPENAI_API_KEY: string;
}