import { Controller, Get, Param, Res, NotFoundException } from '@nestjs/common';
import express from 'express';
import * as fs from 'fs/promises';
import { createReadStream } from 'fs';
import * as path from 'path';

@Controller('api/datasets')
export class DatasetController {
  private readonly storageDir = path.join(process.cwd(), 'storage', 'datasets');

  @Get()
  async listDatasets() {
    try {
      const files = await fs.readdir(this.storageDir);
      const datasets = files
        .filter(file => file.endsWith('.ndjson'))
        .map(file => {
          const parts = file.split('_');
          return {
            filename: file,
            category: parts[0],
            source: parts[1],
            timestamp: parts[2]?.replace('.ndjson', ''),
          };
        });
      
      return datasets.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
    } catch (error) {
      return []; 
    }
  }

  @Get('download/:filename')
  async downloadDataset(@Param('filename') filename: string, @Res() res: express.Response) {
    const safeFilename = path.basename(filename); 
    const filepath = path.join(this.storageDir, safeFilename);

    try {
      
      res.setHeader('Content-Type', 'application/x-ndjson');
      res.setHeader('Content-Disposition', `attachment; filename="${safeFilename}"`);
      
      const fileStream = createReadStream(filepath);
      fileStream.pipe(res);
    } catch (error) {
      throw new NotFoundException(`Dataset ${safeFilename} não encontrado.`);
    }
  }
}