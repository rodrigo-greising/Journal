import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { JournalEntry } from '../journal-entries/journal-entry.entity';

export type AnalysisType = 'mood' | 'energy' | 'nutrition' | 'triggers';

export type AnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed';

@Entity('analysis_results')
export class AnalysisResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  journalEntryId: string;

  @ManyToOne(() => JournalEntry, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'journalEntryId' })
  journalEntry: JournalEntry;

  @Column({ type: 'varchar' })
  analysisType: AnalysisType;

  @Column({ type: 'varchar', default: 'pending' })
  status: AnalysisStatus;

  @Column({ type: 'jsonb', nullable: true })
  result: any;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ type: 'integer', default: 0 })
  retryCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
