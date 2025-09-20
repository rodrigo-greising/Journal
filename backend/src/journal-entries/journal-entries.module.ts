import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JournalEntriesService } from './journal-entries.service';
import { JournalEntriesController } from './journal-entries.controller';
import { JournalEntry } from './journal-entry.entity';
import { StorageService } from '../storage/storage.service';

@Module({
  imports: [TypeOrmModule.forFeature([JournalEntry])],
  controllers: [JournalEntriesController],
  providers: [JournalEntriesService, StorageService],
})
export class JournalEntriesModule {}