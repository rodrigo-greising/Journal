import { Controller, Get, Post, Body, Param, Delete, Put } from '@nestjs/common';
import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';

@Controller('journal-entries')
export class JournalEntriesController {
  constructor(private readonly journalEntriesService: JournalEntriesService) {}

  @Post()
  create(@Body() createJournalEntryDto: CreateJournalEntryDto) {
    return this.journalEntriesService.create(createJournalEntryDto);
  }

  @Get()
  findAll() {
    return this.journalEntriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journalEntriesService.findOne(id);
  }

  @Post('draft')
  saveDraft(@Body() body: { content: string }) {
    return this.journalEntriesService.saveOrUpdateDraft(body.content);
  }

  @Post(':id/publish')
  publishDraft(@Param('id') id: string) {
    return this.journalEntriesService.publishDraft(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateJournalEntryDto: UpdateJournalEntryDto) {
    return this.journalEntriesService.update(id, updateJournalEntryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.journalEntriesService.remove(id);
  }

  @Delete(':id/soft')
  softDelete(@Param('id') id: string) {
    return this.journalEntriesService.softDelete(id);
  }
}