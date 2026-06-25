import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosRequestConfig } from 'axios';

@Injectable()
export class HttpClientService {
  private readonly logger = new Logger(HttpClientService.name);

  private readonly userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  ];

  constructor(private readonly httpService: HttpService) {}

  private getRandomUserAgent(): string {
    return this.userAgents[Math.floor(Math.random() * this.userAgents.length)];
  }
  async fetchWithRetry(url: string, retries = 3, delayMs = 2000): Promise<string> {
    const config: AxiosRequestConfig = {
      headers: {
        'User-Agent': this.getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      timeout: 10000, // 10 seg
    };

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        this.logger.debug(`[GET] ${url} (Tentativa ${attempt}/${retries})`);
        const response = await firstValueFrom(this.httpService.get(url, config));
        return response.data;
      } catch (error: any) {
        this.logger.warn(`Falha na requisição para ${url}: ${error.message}`);
        
        if (attempt === retries) {
          throw new Error(`Falha após ${retries} tentativas: ${url}`);
        }
        
        await new Promise((resolve) => setTimeout(resolve, delayMs * attempt));
      }
    }
    
    throw new Error('Unreachable');
  }
}