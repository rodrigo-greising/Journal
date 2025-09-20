import type { Route } from "./+types/home";
import { useState, useEffect, useRef } from "react";

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
}

interface JournalEntryProps {
  entry: JournalEntry;
  onEdit: (entry: JournalEntry) => void;
  onDelete: (entryId: string) => void;
}

function JournalEntryComponent({ entry, onEdit, onDelete }: JournalEntryProps) {
  return (
    <article
      className={`bg-white rounded-lg shadow-md p-4 border ${
        entry.isDraft ? 'border-amber-200 bg-amber-50' : 'border-gray-200'
      } ${entry.isDraft ? 'cursor-pointer hover:border-amber-300 transition-colors' : ''}`}
      aria-label={`${entry.isDraft ? 'Draft journal entry' : 'Journal entry'} from ${new Date(entry.createdAt).toLocaleDateString()}`}
      onClick={entry.isDraft ? () => onEdit(entry) : undefined}
      role={entry.isDraft ? 'button' : 'article'}
      tabIndex={entry.isDraft ? 0 : undefined}
      onKeyDown={(e) => {
        if (entry.isDraft && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onEdit(entry);
        }
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          {entry.isDraft && (
            <div className="flex items-center text-amber-600" aria-label="Draft entry">
              <span className="text-lg">📝</span>
              <span className="text-sm font-medium ml-1">Draft - Click to edit</span>
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
      <div className="prose prose-sm max-w-none">
        <p className="text-gray-800 leading-relaxed">{entry.content}</p>
      </div>
      {entry.isDraft && (
        <p className="text-sm text-amber-700 mt-2 italic">
          Click anywhere on this draft to edit it, or use the delete button to remove it
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
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Health Journal</h1>

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
