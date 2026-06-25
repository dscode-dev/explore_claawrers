import { Controller, Post, Get, Body, HttpException, HttpStatus } from '@nestjs/common';
import { CrawlerService } from './crawler.service';

interface CreateCrawlerDto {
  source: string;
  league: string;
}

@Controller('api/crawlers')
export class CrawlerController {
  constructor(private readonly crawlerService: CrawlerService) {}

  @Post()
  async startCrawler(@Body() payload: CreateCrawlerDto) {
    if (!payload.source || !payload.league) {
      throw new HttpException('Source e League são obrigatórios', HttpStatus.BAD_REQUEST);
    }

    const result = await this.crawlerService.dispatchCrawlerJob(
      payload.source,
      payload.league,
      'CURRENT_SEASON' 
    );

    return result;
  }

  @Get('status')
  async getCrawlerStatuses() {
    return await this.crawlerService.getActiveJobsStatus();
  }
}