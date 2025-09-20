import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JournalEntry } from './journal-entry.entity';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';

@Injectable()
export class JournalEntriesService {
  constructor(
    @InjectRepository(JournalEntry)
    private journalEntriesRepository: Repository<JournalEntry>,
  ) {}

  async create(createJournalEntryDto: CreateJournalEntryDto): Promise<JournalEntry> {
    const journalEntry = this.journalEntriesRepository.create(createJournalEntryDto);
    return await this.journalEntriesRepository.save(journalEntry);
  }

  async findAll(): Promise<JournalEntry[]> {
    return await this.journalEntriesRepository.find({
      where: { isDeleted: false },
      order: { createdAt: 'DESC' },
    });
  }

  async saveOrUpdateDraft(content: string): Promise<JournalEntry> {
    // Look for existing draft
    const existingDraft = await this.journalEntriesRepository.findOne({
      where: { isDraft: true, isDeleted: false },
      order: { updatedAt: 'DESC' },
    });

    if (existingDraft) {
      // Update existing draft
      existingDraft.content = content;
      return await this.journalEntriesRepository.save(existingDraft);
    } else {
      // Create new draft
      const draft = this.journalEntriesRepository.create({
        content,
        isDraft: true,
      });
      return await this.journalEntriesRepository.save(draft);
    }
  }

  async publishDraft(id: string): Promise<JournalEntry | null> {
    const draft = await this.findOne(id);
    if (draft && draft.isDraft) {
      draft.isDraft = false;
      return await this.journalEntriesRepository.save(draft);
    }
    return null;
  }

  async findOne(id: string): Promise<JournalEntry | null> {
    return await this.journalEntriesRepository.findOne({ where: { id } });
  }

  async update(id: string, updateJournalEntryDto: UpdateJournalEntryDto): Promise<JournalEntry | null> {
    await this.journalEntriesRepository.update(id, updateJournalEntryDto);
    return await this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.journalEntriesRepository.delete(id);
  }

  async softDelete(id: string): Promise<JournalEntry | null> {
    const entry = await this.findOne(id);
    if (entry) {
      entry.isDeleted = true;
      return await this.journalEntriesRepository.save(entry);
    }
    return null;
  }
}