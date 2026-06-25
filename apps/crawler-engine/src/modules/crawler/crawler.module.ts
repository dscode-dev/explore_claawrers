import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';

import { CrawlerService } from './crawler.service';
import { CrawlerProcessor } from './crawler.processor';
import { HttpClientModule } from '../http-client/http-client.module';
import { DatasetService } from './dataset.service';

@Module({
  imports: [
    HttpClientModule,
    BullModule.registerQueue({
      name: 'crawler-queue',
    }),
  ],
  providers: [CrawlerService, CrawlerProcessor, DatasetService],
  exports: [CrawlerService],
})
export class CrawlerModule {}
