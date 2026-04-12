/**
 * State Machine Pattern — File Upload with explicit state transitions
 *
 * Models complex state as a discriminated union to make impossible states impossible.
 * Every transition is explicit and documented.
 */

import { useCallback, useReducer, useRef } from 'react'
import { cn } from '@/lib/utils'

// ─── State Definition (Discriminated Union) ───────────────────────
type UploadState =
  | { status: 'idle' }
  | { status: 'selecting' }
  | { status: 'validating'; file: File }
  | { status: 'uploading'; file: File; progress: number }
  | { status: 'success'; file: File; url: string }
  | { status: 'error'; file: File | null; message: string }

// ─── Action Definition ────────────────────────────────────────────
type UploadAction =
  | { type: 'OPEN_PICKER' }
  | { type: 'SELECT_FILE'; file: File }
  | { type: 'VALIDATION_PASSED'; file: File }
  | { type: 'VALIDATION_FAILED'; message: string; file: File }
  | { type: 'UPLOAD_PROGRESS'; progress: number }
  | { type: 'UPLOAD_SUCCESS'; url: string }
  | { type: 'UPLOAD_ERROR'; message: string }
  | { type: 'RESET' }

// ─── State Transition Diagram ─────────────────────────────────────
/**
 *  idle ─→ selecting ─→ validating ─→ uploading ─→ success
 *                            │              │          │
 *                            ↓              ↓          ↓
 *                          error          error       idle (RESET)
 *                            │              │
 *                            ↓              ↓
 *                          idle (RESET)   idle (RESET)
 */

// ─── Reducer ──────────────────────────────────────────────────────
function uploadReducer(state: UploadState, action: UploadAction): UploadState {
  switch (action.type) {
    case 'OPEN_PICKER':
      if (state.status !== 'idle') return state
      return { status: 'selecting' }

    case 'SELECT_FILE':
      if (state.status !== 'selecting') return state
      return { status: 'validating', file: action.file }

    case 'VALIDATION_PASSED':
      if (state.status !== 'validating') return state
      return { status: 'uploading', file: action.file, progress: 0 }

    case 'VALIDATION_FAILED':
      if (state.status !== 'validating') return state
      return { status: 'error', file: action.file, message: action.message }

    case 'UPLOAD_PROGRESS':
      if (state.status !== 'uploading') return state
      return { ...state, progress: action.progress }

    case 'UPLOAD_SUCCESS':
      if (state.status !== 'uploading') return state
      return { status: 'success', file: state.file, url: action.url }

    case 'UPLOAD_ERROR':
      if (state.status !== 'uploading') return state
      return { status: 'error', file: state.file, message: action.message }

    case 'RESET':
      return { status: 'idle' }

    default: {
      const _exhaustive: never = action
      return state
    }
  }
}

// ─── Custom Hook ──────────────────────────────────────────────────
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/webp']
const MAX_SIZE_MB = 5

function useFileUpload() {
  const [state, dispatch] = useReducer(uploadReducer, { status: 'idle' })
  const inputRef = useRef<HTMLInputElement>(null)

  const openPicker = useCallback(() => {
    dispatch({ type: 'OPEN_PICKER' })
    inputRef.current?.click()
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) {
      dispatch({ type: 'RESET' })
      return
    }

    dispatch({ type: 'SELECT_FILE', file })

    // Validation
    if (!ALLOWED_TYPES.includes(file.type)) {
      dispatch({
        type: 'VALIDATION_FAILED',
        file,
        message: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`,
      })
      return
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      dispatch({
        type: 'VALIDATION_FAILED',
        file,
        message: `File too large. Maximum size: ${MAX_SIZE_MB}MB`,
      })
      return
    }

    dispatch({ type: 'VALIDATION_PASSED', file })

    // Simulate upload
    const uploadFile = async () => {
      try {
        // Simulated progress
        for (let i = 0; i <= 100; i += 10) {
          await new Promise(r => setTimeout(r, 200))
          dispatch({ type: 'UPLOAD_PROGRESS', progress: i })
        }
        dispatch({ type: 'UPLOAD_SUCCESS', url: URL.createObjectURL(file) })
      } catch {
        dispatch({ type: 'UPLOAD_ERROR', message: 'Upload failed. Please try again.' })
      }
    }
    uploadFile()
  }, [])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return { state, inputRef, openPicker, handleFileSelect, reset }
}

// ─── Component ────────────────────────────────────────────────────
export function FileUploader() {
  const { state, inputRef, openPicker, handleFileSelect, reset } = useFileUpload()

  return (
    <div className="w-full max-w-md space-y-4">
      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload zone — adapts to current state */}
      <div
        className={cn(
          'rounded-xl border-2 border-dashed p-8 text-center transition-colors',
          state.status === 'idle' && 'border-muted-foreground/25 hover:border-primary/50 cursor-pointer',
          state.status === 'uploading' && 'border-primary/50 bg-primary/5',
          state.status === 'success' && 'border-emerald-500/50 bg-emerald-500/5',
          state.status === 'error' && 'border-destructive/50 bg-destructive/5'
        )}
        onClick={state.status === 'idle' ? openPicker : undefined}
      >
        {state.status === 'idle' && (
          <p className="text-sm text-muted-foreground">
            Click to upload an image (max {MAX_SIZE_MB}MB)
          </p>
        )}

        {state.status === 'uploading' && (
          <div className="space-y-3">
            <p className="text-sm font-medium">{state.file.name}</p>
            <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-200 rounded-full"
                style={{ width: `${state.progress}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{state.progress}%</p>
          </div>
        )}

        {state.status === 'success' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-emerald-600">Upload complete!</p>
            <p className="text-xs text-muted-foreground">{state.file.name}</p>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-primary underline hover:no-underline"
            >
              Upload another
            </button>
          </div>
        )}

        {state.status === 'error' && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-destructive">Error</p>
            <p className="text-xs text-muted-foreground">{state.message}</p>
            <button
              type="button"
              onClick={reset}
              className="text-xs text-primary underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
