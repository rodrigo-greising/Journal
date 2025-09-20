import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CallbackHandler } from '@langfuse/langchain';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';

@Injectable()
export class LangfuseService implements OnModuleInit, OnModuleDestroy {
  private langfuseSpanProcessor: LangfuseSpanProcessor;
  private sdk: NodeSDK;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    // Initialize Langfuse span processor
    this.langfuseSpanProcessor = new LangfuseSpanProcessor({
      publicKey: this.configService.get<string>('LANGFUSE_PUBLIC_KEY')!,
      secretKey: this.configService.get<string>('LANGFUSE_SECRET_KEY')!,
      baseUrl:
        this.configService.get<string>('LANGFUSE_HOST') ??
        'http://localhost:3000',
      environment: this.configService.get<string>('NODE_ENV') ?? 'development',
    });

    // Initialize OpenTelemetry SDK
    this.sdk = new NodeSDK({
      spanProcessors: [this.langfuseSpanProcessor],
    });

    // Start the SDK
    this.sdk.start();
  }

  async onModuleDestroy() {
    // Flush all spans before shutdown
    await this.langfuseSpanProcessor.forceFlush();
    await this.sdk.shutdown();
  }

  /**
   * Creates a Langfuse callback handler for tracing LangChain operations
   * @param sessionId - Unique session identifier
   * @param userId - User identifier (optional)
   * @param tags - Additional tags for the trace (optional)
   * @param metadata - Additional metadata for the trace (optional)
   */
  createCallbackHandler(
    sessionId: string,
    userId?: string,
    tags?: string[],
    metadata?: Record<string, any>,
  ): CallbackHandler {
    const handlerParams: any = {
      sessionId,
      tags: tags ?? ['journal-analysis'],
    };

    if (userId) {
      handlerParams.userId = userId;
    }

    return new CallbackHandler(handlerParams);
  }

  /**
   * Creates a callback handler specifically for journal entry analysis
   * @param journalEntryId - The journal entry being analyzed
   * @param analysisType - Type of analysis being performed
   * @param userId - User identifier (optional)
   */
  createAnalysisCallbackHandler(
    journalEntryId: string,
    analysisType: 'mood' | 'energy' | 'nutrition' | 'triggers' | 'sleep',
    userId?: string,
  ): CallbackHandler {
    return this.createCallbackHandler(
      `journal-analysis-${journalEntryId}`,
      userId,
      ['journal-analysis', analysisType],
    );
  }

  /**
   * Force flush all pending spans to Langfuse
   */
  async flushSpans(): Promise<void> {
    await this.langfuseSpanProcessor.forceFlush();
  }
}
