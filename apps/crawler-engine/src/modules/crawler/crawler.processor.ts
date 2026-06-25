import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import * as cheerio from 'cheerio';
import { Statistic, Competition } from '@football/contracts';
import { HttpClientService } from '../http-client/http-client.service';
import { DatasetService } from './dataset.service';

@Processor('crawler-queue')
export class CrawlerProcessor extends WorkerHost {
  private readonly logger = new Logger(CrawlerProcessor.name);

  constructor(
    private readonly httpClient: HttpClientService,
    private readonly datasetService: DatasetService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(
      `Iniciando extração para: ${job.data.source} - ${job.data.league}`,
    );

    if (job.data.source === 'fbref') {
      return this.scrapeFbref(job.data.league, job.data.source, job);
    }

    throw new Error(`Fonte não suportada: ${job.data.source}`);
  }

  private async scrapeFbref(league: Competition, source: string, job: Job) {
    await job.updateProgress(10);

    const targetUrl = `https://fbref.com/en/comps/example/${league}-Stats`;
    const htmlData = await this.httpClient.fetchWithRetry(targetUrl);

    await job.updateProgress(40);

    const $ = cheerio.load(htmlData);
    const extractedStats: Statistic[] = [];

    const rows = $('table.stats_table tbody tr');
    const totalRows = rows.length;

    rows.each((index, element) => {
      const teamName = $(element).find('td[data-stat="team"]').text().trim();
      const possession = parseFloat(
        $(element).find('td[data-stat="possession"]').text(),
      );
      const expectedGoals = parseFloat(
        $(element).find('td[data-stat="xg"]').text(),
      );

      if (teamName) {
        extractedStats.push({
          competition: league,
          team: teamName,
          observed_at: new Date().toISOString(),
          metrics: {
            possession_percentage: possession || 0,
            expected_goals: expectedGoals || 0,
          },
        });
      }

      if (totalRows > 0 && index % 5 === 0) {
        const parseProgress = 40 + Math.floor((index / totalRows) * 50);
        job.updateProgress(parseProgress);
      }
    });

    this.logger.log(
      `Extraídas ${extractedStats.length} estatísticas da liga ${league}. Convertendo para NDJSON...`,
    );

    await job.updateProgress(90);

    const { filepath, manifest } =
      await this.datasetService.processAndSaveDataset(
        'statistics',
        source,
        extractedStats,
      );

    await job.updateProgress(100);

    return {
      status: 'success',
      filepath,
      manifest,
    };
  }
}
