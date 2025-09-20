import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('journal_entries')
export class JournalEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column({ type: 'varchar', default: 'text' })
  type: 'text' | 'audio';

  @Column({ type: 'varchar', nullable: true })
  audioUrl?: string;

  @Column({ type: 'integer', nullable: true })
  duration?: number;

  @Column({ default: false })
  isDraft: boolean;

  @Column({ default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
