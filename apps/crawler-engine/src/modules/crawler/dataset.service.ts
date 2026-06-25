import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as crypto from 'crypto';
import { DatasetManifest } from '@football/contracts';
import { PrismaService } from 'src/prisma.service';


@Injectable()
export class DatasetService {
  private readonly logger = new Logger(DatasetService.name);
  private readonly storageDir = path.join(process.cwd(), 'storage', 'datasets');
  private readonly MAX_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25 MB

  constructor(private prisma: PrismaService) {
    this.ensureStorageDirectory();
  }

  private async ensureStorageDirectory() {
    try {
      await fs.mkdir(this.storageDir, { recursive: true });
    } catch (error) {
      this.logger.error('Falha ao criar diretório de storage', error);
    }
  }

  private generateNDJSON(records: any[]): string {
    return records.map((record) => JSON.stringify(record)).join('\n') + '\n';
  }

  private generateChecksum(data: string): string {
    return crypto.createHash('sha256').update(data, 'utf8').digest('hex');
  }

  async processAndSaveDataset(
    category: DatasetManifest['category'],
    source: string,
    records: any[],
  ): Promise<{ filepath: string; manifest: DatasetManifest }> {
    const ndjsonContent = this.generateNDJSON(records);
    const fileSizeBytes = Buffer.byteLength(ndjsonContent, 'utf8');

    if (fileSizeBytes > this.MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException('Dataset excedeu 25MB.');
    }

    const checksum = this.generateChecksum(ndjsonContent);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${category}_${source}_${timestamp}.ndjson`;
    const filepath = path.join(this.storageDir, filename);

    await fs.writeFile(filepath, ndjsonContent, 'utf8');
    this.logger.log(`Dataset salvo fisicamente: ${filename}`);

    // Nova Integração: Persistência do Manifesto no PostgreSQL
    await this.prisma.datasetManifest.create({
      data: {
        checksum,
        category,
        source,
        extracted_at: new Date(),
        raw_file_size_bytes: fileSizeBytes,
        filepath: filename,
      },
    });

    const manifest: DatasetManifest = {
      checksum,
      lineage: {
        source,
        extracted_at: new Date().toISOString(),
        raw_file_size_bytes: fileSizeBytes,
      },
      category,
    };

    return { filepath, manifest };
  }
}
