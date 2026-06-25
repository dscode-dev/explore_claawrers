import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client/extension';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    // Inicializa o pool de conexão nativo do Node.js
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    
    // Acopla o pool ao adaptador do Prisma
    const adapter = new PrismaPg(pool);
    
    // Passa o adaptador para o construtor original do PrismaClient
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}