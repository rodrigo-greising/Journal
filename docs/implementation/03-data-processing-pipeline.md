# User Story: Data Processing Pipeline

## Story
As a healthcare provider, I want unstructured patient journal entries (text/audio) to be automatically processed into structured data so that I can analyze patterns and provide better care.

## Acceptance Criteria
- [x] Text entries are processed through OpenAI APIs to extract structured data
- [x] Audio entries are transcribed to text then processed
- [x] Structured data includes sentiment, keywords, and health-relevant entities
- [x] Processing happens asynchronously without blocking user interface
- [x] Users receive feedback when processing is complete
- [x] Failed processing attempts are retried with error logging

## Technical Requirements
- [x] Integrate cloud NLP APIs (OpenAI gpt-5-nano-2025-08-07)
- [x] Implement speech-to-text for audio entries (OpenAI Whisper)
- [x] Design data schema for structured output
- [x] Add job queue for background processing (BullMQ + Redis)
- [x] Implement error handling and retry logic

## Priority
High - Essential for healthcare value

## Dependencies
- Cloud API integrations
- Database schema design
- Audio recording functionality

## Estimated Effort
Large (1-2 weeks)

## Dev Notes

Use this
https://js.langchain.com/docs/concepts/structured_outputs/

https://platform.openai.com/docs/guides/speech-to-text

I also want to use specifically a builder pattern for this. We can have the defaults for the POC as an example, but in the real world, you would have a builder pattern, and for each of them, you would run one analysis, and then that would end up in the structure output for one graph. So we can do something like mood or energy or something like that and try to extract those from the transcripts or from the journaling notes. But in the real world, we would extract other types of structure data. If this is used for something like nutrition, then the nutritionist would have stuff about calories or macros, protein, carbs, etc.

## Implementation Status: COMPLETED ✅

### What Was Built

1. **Analysis Module** (`backend/src/analysis/`)
   - `AnalysisService`: Core service for processing journal entries with builder pattern support
   - `AnalysisController`: REST API endpoints for analysis operations
   - `AnalysisWorkerService`: Background worker for async processing
   - `AnalysisResult` entity: Database schema for storing analysis results
   - `AnalysisConfig` DTOs: Type-safe configuration for different analysis types

2. **OpenAI Integration** (`backend/src/openai/`)
   - `OpenAIService`: Handles all OpenAI API calls using LangChain
   - Audio transcription using OpenAI Whisper API
   - Structured analysis using gpt-5-nano-2025-08-07 with Zod schema validation
   - Analysis types: mood, energy, nutrition, triggers
   - Langfuse integration for LLM observability and tracing

3. **Queue System** (`backend/src/queue/`)
   - `QueueService`: BullMQ integration with Redis
   - Background job processing with worker management
   - Retry logic and error handling
   - Job prioritization (triggers get higher priority)
   - Bulk job processing capabilities

4. **Langfuse Integration** (`backend/src/langfuse/`)
   - `LangfuseService`: LLM observability and tracing
   - OpenTelemetry integration for distributed tracing
   - Analysis callback handlers for monitoring AI operations
   - Performance tracking and debugging capabilities

5. **Builder Pattern Implementation**
   - `AnalysisBuilder` class for flexible analysis configuration
   - Predefined analysis sets: default, healthcare, nutrition
   - Custom analysis configuration support
   - Fluent API for chaining analysis types
   - Automatic queuing and execution

### Key Features

- **Asynchronous Processing**: All analysis happens in background workers
- **Multiple Analysis Types**: Mood, energy, nutrition, and trigger analysis
- **Audio Support**: Automatic transcription of audio entries using Whisper
- **Error Handling**: Comprehensive retry logic and error logging
- **Scalable Architecture**: Queue-based processing with Redis
- **Flexible Configuration**: Builder pattern for custom analysis workflows
- **LLM Observability**: Full tracing and monitoring with Langfuse
- **Type Safety**: Zod schemas for structured output validation
- **Real-time Updates**: Frontend polling for analysis status updates

### Analysis Types & Outputs

#### Mood Analysis
- Sentiment classification (positive/negative/neutral)
- Emotion extraction (array of emotions)
- Mood scale (1-10 rating)
- Confidence score

#### Energy Analysis
- Energy level (1-10 rating)
- Fatigue indicators
- Sleep quality assessment (optional)
- Confidence score

#### Nutrition Analysis
- Food mentions extraction
- Calorie estimation (optional)
- Macronutrient breakdown (protein/carbs/fats)
- Meal timing patterns
- Confidence score

#### Trigger Analysis
- Stressor identification
- Craving detection
- Risk factor assessment
- Coping strategy suggestions
- Risk level classification (low/medium/high)
- Confidence score

### API Endpoints

#### Analysis Management
- `GET /analysis` - Get all analysis results
- `GET /analysis/type/:type` - Get results by analysis type
- `GET /analysis/entry/:entryId` - Get results for specific entry
- `POST /analysis/process/:entryId` - Queue analysis for entry
- `POST /analysis/process-all` - Process all journal entries
- `POST /analysis/reprocess/:type` - Reprocess all entries for specific analysis type

#### Builder Pattern Endpoints
- `POST /analysis/builder/default/:entryId` - Run default analysis (mood + energy)
- `POST /analysis/builder/healthcare/:entryId` - Run healthcare analysis (mood + energy + triggers)
- `POST /analysis/builder/nutrition/:entryId` - Run nutrition analysis (mood + energy + nutrition)
- `POST /analysis/builder/custom/:entryId` - Run custom analysis with configurable types

#### Queue Management
- `GET /analysis/queue/status` - Check queue status (waiting/active/completed/failed)
- `POST /analysis/queue/retry-failed` - Retry failed jobs
- `POST /analysis/queue/clean` - Clean completed/failed jobs from queue

### Frontend Integration

- **Analysis Dashboard** (`frontend/app/routes/analysis.tsx`): Complete UI for viewing analysis results
- **Real-time Updates**: Automatic polling every 10 seconds for status updates
- **Visual Components**: Specialized cards for each analysis type with progress indicators
- **Queue Management**: UI controls for processing entries and retrying failed jobs
- **Filtering**: Filter results by analysis type
- **Error Handling**: User-friendly error messages and retry mechanisms

### Technical Architecture

#### Database Schema
- `AnalysisResult` entity with TypeORM integration
- Status tracking (pending/processing/completed/failed)
- Retry count and error message storage
- Timestamps for audit trail

#### Queue Architecture
- Redis-backed BullMQ for job processing
- Worker-based architecture for scalability
- Job prioritization and batching
- Automatic retry with exponential backoff

#### LLM Integration
- LangChain for structured output parsing
- Zod schemas for type-safe validation
- Langfuse for observability and debugging
- OpenAI gpt-5-nano-2025-08-07 for cost-effective analysis
- Whisper API for audio transcription

#### Error Handling
- Comprehensive error logging
- Graceful failure handling
- User-friendly error messages
- Automatic retry mechanisms

### Dependencies & Configuration

#### Backend Dependencies
- `@langchain/openai`: LangChain integration for OpenAI APIs
- `@langchain/core`: Core LangChain functionality for structured outputs
- `@langfuse/langchain`: Langfuse integration for LLM observability
- `@langfuse/otel`: OpenTelemetry integration for distributed tracing
- `@opentelemetry/sdk-node`: OpenTelemetry SDK for Node.js
- `bullmq`: Redis-based job queue system
- `ioredis`: Redis client for Node.js
- `openai`: OpenAI API client
- `zod`: TypeScript-first schema validation

#### Environment Variables
```bash
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Langfuse Configuration
LANGFUSE_PUBLIC_KEY=your_langfuse_public_key
LANGFUSE_SECRET_KEY=your_langfuse_secret_key
LANGFUSE_HOST=https://cloud.langfuse.com  # or self-hosted URL

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=optional_password

# Application Configuration
NODE_ENV=development
```

#### Database Migrations
The `AnalysisResult` entity requires the following database table:
```sql
CREATE TABLE analysis_result (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID NOT NULL REFERENCES journal_entry(id),
  analysis_type VARCHAR(20) NOT NULL CHECK (analysis_type IN ('mood', 'energy', 'nutrition', 'triggers')),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  result JSONB,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analysis_result_entry_id ON analysis_result(journal_entry_id);
CREATE INDEX idx_analysis_result_type ON analysis_result(analysis_type);
CREATE INDEX idx_analysis_result_status ON analysis_result(status);
```

### Development Setup

#### Prerequisites
1. **Redis Server**: Required for job queue processing
   ```bash
   # Using Docker
   docker run -d --name redis -p 6379:6379 redis:alpine
   
   # Using Homebrew (macOS)
   brew install redis
   brew services start redis
   ```

2. **OpenAI API Key**: Required for AI analysis
   - Sign up at https://platform.openai.com/
   - Generate API key from dashboard
   - Add to environment variables

3. **Langfuse Account**: Optional but recommended for observability
   - Sign up at https://cloud.langfuse.com/
   - Create project and get API keys
   - Add to environment variables

#### Running the System
```bash
# Start Redis (if not already running)
redis-server

# Start backend with analysis capabilities
cd backend
npm run start:dev

# Start frontend
cd frontend
npm run dev
```

#### Testing Analysis Features
1. Create journal entries via the frontend
2. Visit `/analysis` to view the analysis dashboard
3. Use "Process All Entries" to queue analysis jobs
4. Monitor queue status and results in real-time
5. Check Langfuse dashboard for LLM tracing and performance metrics