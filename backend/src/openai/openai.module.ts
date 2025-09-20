import { Module } from '@nestjs/common';
import { OpenAIService } from './openai.service';
import { LangfuseModule } from '../langfuse/langfuse.module';

@Module({
  imports: [LangfuseModule],
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {}
