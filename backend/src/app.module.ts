import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JournalEntriesModule } from './journal-entries/journal-entries.module';
import { AnalysisModule } from './analysis/analysis.module';
import { LangfuseModule } from './langfuse/langfuse.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5433'),
      username: process.env.DATABASE_USERNAME || 'journal_user',
      password: process.env.DATABASE_PASSWORD || 'journal_password',
      database: process.env.DATABASE_NAME || 'journal_db',
      autoLoadEntities: true,
      synchronize: true, // Only for development
    }),
    JournalEntriesModule,
    AnalysisModule,
    LangfuseModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
