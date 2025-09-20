import { Controller, Get, Post, Body, Param, Delete, Put, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JournalEntriesService } from './journal-entries.service';
import { CreateJournalEntryDto } from './dto/create-journal-entry.dto';
import { UpdateJournalEntryDto } from './dto/update-journal-entry.dto';
import { StorageService } from '../storage/storage.service';

@Controller('journal-entries')
export class JournalEntriesController {
  constructor(
    private readonly journalEntriesService: JournalEntriesService,
    private readonly storageService: StorageService,
  ) {}

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

  @Post('audio')
  @UseInterceptors(FileInterceptor('audio', StorageService.getMulterOptions()))
  async uploadAudio(
    @UploadedFile() file: Express.Multer.File,
    @Body('duration') duration: string,
    @Body('type') type: string,
  ) {
    if (!file) {
      throw new BadRequestException('No audio file uploaded');
    }

    if (!duration || duration.trim() === '') {
      throw new BadRequestException('Duration is required');
    }

    const durationInSeconds = parseInt(duration, 10);
    if (isNaN(durationInSeconds) || durationInSeconds <= 0) {
      throw new BadRequestException('Duration must be a positive number');
    }

    const audioUrl = this.storageService.getAudioUrl(file.filename);

    const createDto: CreateJournalEntryDto = {
      content: '', // Initially empty, will be filled by transcription later
      type: 'audio',
      audioUrl,
      duration: durationInSeconds,
    };

    return this.journalEntriesService.create(createDto);
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