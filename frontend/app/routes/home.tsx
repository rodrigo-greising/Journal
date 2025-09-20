import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";
import { AudioRecorder } from "../components/AudioRecorder";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Health Journal" },
    { name: "description", content: "Record your thoughts and experiences" },
  ];
}

interface JournalEntry {
  id: string;
  content: string;
  createdAt: string;
  isDraft: boolean;
  isDeleted: boolean;
  type: 'text' | 'audio';
  audioUrl?: string;
  duration?: number;
}

interface JournalEntryProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entryId: string) => void;
}

function JournalEntryComponent({ entry, onEdit, onDelete }: JournalEntryProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <article
      className={`bg-white rounded-lg shadow-md p-4 border ${
        entry.isDraft ? 'border-amber-200 bg-amber-50' : 'border-gray-200'
      } ${entry.isDraft && entry.type === 'text' ? 'cursor-pointer hover:border-amber-300 transition-colors' : ''}`}
      aria-label={`${entry.isDraft ? 'Draft' : ''} ${entry.type} journal entry from ${new Date(entry.createdAt).toLocaleDateString()}`}
      onClick={entry.isDraft && entry.type === 'text' ? () => onEdit(entry) : undefined}
      role={entry.isDraft && entry.type === 'text' ? 'button' : 'article'}
      tabIndex={entry.isDraft && entry.type === 'text' ? 0 : undefined}
      onKeyDown={(e) => {
        if (entry.isDraft && entry.type === 'text' && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onEdit(entry);
        }
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {entry.type === 'audio' && (
            <div className="flex items-center text-blue-600" aria-label="Audio entry">
              <span className="text-lg">🎤</span>
              <span className="text-sm font-medium ml-1">
                Audio{entry.duration ? ` (${formatDuration(entry.duration)})` : ''}
              </span>
            </div>
          )}
          {entry.isDraft && (
            <div className="flex items-center text-amber-600" aria-label="Draft entry">
              <span className="text-lg">📝</span>
              <span className="text-sm font-medium ml-1">
                Draft{entry.type === 'text' ? ' - Click to edit' : ''}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {entry.isDraft && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(entry.id);
              }}
              className="text-red-500 hover:text-red-700 p-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
              aria-label="Delete draft"
              title="Delete draft"
            >
              🗑️
            </button>
          )}
          <time
            dateTime={entry.createdAt}
            className="text-sm text-gray-500 font-medium"
          >
            {new Date(entry.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </time>
        </div>
      </div>

      {entry.type === 'audio' && entry.audioUrl ? (
        <div className="mb-3">
          <audio
            controls
            src={entry.audioUrl}
            className="w-full"
            aria-label={`Audio recording${entry.duration ? `, duration ${formatDuration(entry.duration)}` : ''}`}
          >
            Your browser does not support the audio element.
          </audio>
          {entry.content && (
            <div className="mt-3 p-3 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-600 mb-1">Transcript:</p>
              <p className="text-gray-800">{entry.content}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="prose prose-sm max-w-none">
          <p className="text-gray-800 leading-relaxed">{entry.content}</p>
        </div>
      )}

      {entry.isDraft && (
        <p className="text-sm text-amber-700 mt-2 italic">
          {entry.type === 'text'
            ? 'Click anywhere on this draft to edit it, or use the delete button to remove it'
            : 'This is a draft audio entry. Use the delete button to remove it if needed.'
          }
        </p>
      )}
    </article>
  );
}

export default function Home() {
  const [content, setContent] = useState("");
  const [entries, setEntries] = useState<Array<JournalEntry>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [lastSavedDraft, setLastSavedDraft] = useState<string>("");
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleEditDraft = (draft: JournalEntry) => {
    setContent(draft.content);
    setLastSavedDraft(draft.content);
    setEditingDraftId(draft.id);

    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSoftDeleteDraft = async (draftId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/journal-entries/${draftId}/soft`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove from UI
        setEntries(prev => prev.filter(entry => entry.id !== draftId));

        // Clear input if this was the draft being edited
        if (editingDraftId === draftId) {
          setContent("");
          setLastSavedDraft("");
          setEditingDraftId(null);
        }

        setSuccessMessage('Draft deleted successfully.');
      } else {
        setError('Failed to delete draft. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting draft:', error);
      setError('Unable to delete draft. Please check your internet connection and try again.');
    }
  };

  const handleAudioRecorded = async (audioBlob: Blob, duration: number) => {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('duration', duration.toString());
      formData.append('type', 'audio');

      const response = await fetch('http://localhost:3001/journal-entries/audio', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const newEntry = await response.json();
        setEntries(prev => [newEntry, ...prev]);
        setSuccessMessage('Your audio entry has been saved successfully.');
      } else {
        setError('Failed to save your audio entry. Please try again.');
      }
    } catch (error) {
      console.error('Error saving audio entry:', error);
      setError('Unable to save your audio entry. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to filter visible entries (hide currently editing draft)
  const getVisibleEntries = () => {
    return entries.filter(entry => {
      // Hide draft if it's currently being edited
      if (entry.isDraft && content.trim() &&
          (editingDraftId === entry.id || (!editingDraftId && entry.content === content.trim()))) {
        return false;
      }
      return true;
    });
  };

  // Autosave effect
  useEffect(() => {
    if (content.trim() && content !== lastSavedDraft) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for autosave
      autoSaveTimeoutRef.current = setTimeout(() => {
        saveDraft();
      }, 2000); // Auto-save after 2 seconds of inactivity
    }

    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [content, lastSavedDraft]);

  const fetchEntries = async () => {
    try {
      setError(null);
      const response = await fetch('http://localhost:3001/journal-entries');
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      } else {
        setError('Failed to load your journal entries. Please try refreshing the page.');
      }
    } catch (error) {
      console.error('Error fetching entries:', error);
      setError('Unable to connect to the server. Please check your internet connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const saveDraft = async () => {
    if (!content.trim() || content === lastSavedDraft) return;

    setIsAutoSaving(true);
    try {
      const response = await fetch('http://localhost:3001/journal-entries/draft', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        const savedDraft = await response.json();
        setLastSavedDraft(content);
        setEditingDraftId(savedDraft.id);

        // Update entries list
        setEntries(prev => {
          const existingDraftIndex = prev.findIndex(entry => entry.isDraft && !entry.isDeleted);
          if (existingDraftIndex >= 0) {
            // Update existing draft
            const updated = [...prev];
            updated[existingDraftIndex] = savedDraft;
            return updated;
          } else {
            // Add new draft
            return [savedDraft, ...prev];
          }
        });
      }
    } catch (error) {
      console.error('Error saving draft:', error);
    } finally {
      setIsAutoSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Check if we're editing a draft
      if (editingDraftId) {
        // Publish existing draft
        const response = await fetch(`http://localhost:3001/journal-entries/${editingDraftId}/publish`, {
          method: 'POST',
        });

        if (response.ok) {
          const publishedEntry = await response.json();
          setEntries(prev => prev.map(entry =>
            entry.id === editingDraftId ? publishedEntry : entry
          ));
          setContent("");
          setLastSavedDraft("");
          setEditingDraftId(null);
          setSuccessMessage('Your journal entry has been published successfully.');

          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        } else {
          setError('Failed to publish your journal entry. Please try again.');
        }
      } else {
        // Create new entry
        const response = await fetch('http://localhost:3001/journal-entries', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        });

        if (response.ok) {
          const newEntry = await response.json();
          setEntries(prev => [newEntry, ...prev]);
          setContent("");
          setLastSavedDraft("");
          setSuccessMessage('Your journal entry has been saved successfully.');

          if (textareaRef.current) {
            textareaRef.current.focus();
          }
        } else {
          setError('Failed to save your journal entry. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      setError('Unable to save your entry. Please check your internet connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Health Journal</h1>
            <div className="flex items-center space-x-4">
              <a
                href="/dashboard"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Dashboard →
              </a>
              <a
                href="/analysis"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
              >
                Analysis →
              </a>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {successMessage && (
            <div
              role="status"
              aria-live="polite"
              className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md"
            >
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Input Mode Selection */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  inputMode === 'text'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-pressed={inputMode === 'text'}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clipRule="evenodd" />
                </svg>
                Text Entry
              </button>
              <button
                type="button"
                onClick={() => setInputMode('audio')}
                className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  inputMode === 'audio'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-pressed={inputMode === 'audio'}
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
                </svg>
                Voice Recording
              </button>
            </div>
          </div>

          {inputMode === 'text' ? (
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  How are you feeling today? <span aria-label="required" className="text-red-500">*</span>
                </label>
                <div className="flex justify-between items-start mb-2">
                  <p id="content-description" className="text-sm text-gray-600">
                    Share your thoughts, feelings, or experiences. This information will help track your wellness journey.
                  </p>
                  {isAutoSaving && (
                    <div className="flex items-center text-sm text-blue-600" role="status" aria-live="polite">
                      <span className="animate-pulse mr-1">💾</span>
                      <span>Saving draft...</span>
                    </div>
                  )}
                </div>
                <textarea
                  ref={textareaRef}
                  id="content"
                  name="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={4}
                  required
                  aria-required="true"
                  aria-describedby="content-description"
                  aria-invalid={error ? 'true' : 'false'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors duration-200"
                  placeholder="Share your thoughts, feelings, or experiences..."
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                aria-describedby={isSubmitting ? "submit-status" : undefined}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600 transition-colors duration-200 font-medium"
              >
                {isSubmitting ? (
                  <>
                    <span aria-hidden="true">⏳ </span>
                    <span id="submit-status">Saving your entry...</span>
                  </>
                ) : (
                  'Save Entry'
                )}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div>
                <h2 className="block text-sm font-medium text-gray-700 mb-2">
                  Record your voice entry
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Record how you're feeling today. Your audio will be saved and can be transcribed for analysis.
                </p>
              </div>
              <AudioRecorder
                onAudioRecorded={handleAudioRecorded}
                disabled={isSubmitting}
              />
            </div>
          )}
        </div>

        {isLoading ? (
          <div
            role="status"
            aria-live="polite"
            className="text-center py-8"
          >
            <p className="text-gray-600">Loading your journal entries...</p>
          </div>
        ) : (() => {
            const visibleEntries = getVisibleEntries();

            return visibleEntries.length > 0 ? (
              <section aria-labelledby="recent-entries">
                <h2 id="recent-entries" className="text-lg font-semibold text-gray-900 mb-4">
                  Your Recent Entries ({visibleEntries.length})
                </h2>
                <div className="space-y-4" role="feed" aria-label="Journal entries">
                  {visibleEntries.map((entry) => (
                    <JournalEntryComponent
                      key={entry.id}
                      entry={entry}
                      onEdit={handleEditDraft}
                      onDelete={handleSoftDeleteDraft}
                    />
                  ))}
                </div>
              </section>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  {content.trim()
                    ? 'Continue writing your current entry!'
                    : entries.length > 0
                      ? 'All entries are currently being edited.'
                      : 'No journal entries yet. Start by sharing how you\'re feeling today!'
                  }
                </p>
              </div>
            );
          })()
        }
      </div>
    </div>
  );
}
