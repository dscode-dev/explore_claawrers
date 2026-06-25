import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class CrawlerService {
  constructor(@InjectQueue('crawler-queue') private crawlerQueue: Queue) {}

  async dispatchCrawlerJob(source: string, league: string, season: string) {
    const job = await this.crawlerQueue.add('scrape-football-data', {
      source,
      league,
      season,
    });

    return {
      jobId: job.id,
      status: 'enqueued',
      message: `Extração agendada para ${league}`,
    };
  }

  async getActiveJobsStatus() {
    const jobs = await this.crawlerQueue.getJobs([
      'active',
      'waiting',
      'completed',
      'failed',
    ]);

    return await Promise.all(
      jobs.map(async (job) => {

        const currentStatus = await job.getState();

        return {
          id: job.id,
          source: job.data.source,
          league: job.data.league,
          status: currentStatus || 'waiting', 
          progress: job.progress || 0,
        };
      }),
    );
  }
}
