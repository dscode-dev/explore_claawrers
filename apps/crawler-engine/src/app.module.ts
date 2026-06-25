import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BullModule } from '@nestjs/bullmq';
import { CrawlerModule } from './modules/crawler/crawler.module';
import { HttpClientModule } from './modules/http-client/http-client.module';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
      },
    }),
    CrawlerModule,
    HttpClientModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
