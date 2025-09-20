export class CreateJournalEntryDto {
  content: string;
  isDraft?: boolean;
  type?: 'text' | 'audio';
  audioUrl?: string;
  duration?: number;
}