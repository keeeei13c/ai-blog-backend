// src/workers/cron-worker.ts
import { ExecutionContext } from 'hono';
import { CronController } from '../controllers/cron';
import { Bindings } from '../types/bindings';

export interface ScheduledEvent {
  cron: string;
  scheduledTime: number;
}

export default {
  async scheduled(event: ScheduledEvent, env: Bindings, ctx: ExecutionContext): Promise<void> {
    console.log('Cron triggered:', event.cron, 'at', new Date(event.scheduledTime).toISOString());
    
    const cronController = new CronController(env);
    
    // 記事生成の実行
    await cronController.generateDailyArticle();
  }
};