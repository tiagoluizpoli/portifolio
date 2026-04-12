/**
 * Optimistic Update Pattern
 *
 * Immediately update the UI before the server confirms,
 * then reconcile or rollback based on the response.
 *
 * Uses TanStack Query's mutation with optimistic update.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

// ─── Types ────────────────────────────────────────────────────────
interface Todo {
  id: string
  title: string
  completed: boolean
}

// ─── API (simulated) ──────────────────────────────────────────────
const api = {
  getTodos: async (): Promise<Todo[]> => {
    const res = await fetch('/api/todos')
    if (!res.ok) throw new Error('Failed to fetch todos')
    return res.json()
  },
  toggleTodo: async (id: string): Promise<Todo> => {
    const res = await fetch(`/api/todos/${id}/toggle`, { method: 'PATCH' })
    if (!res.ok) throw new Error('Failed to toggle todo')
    return res.json()
  },
}

// ─── Component ────────────────────────────────────────────────────
export function TodoList() {
  const queryClient = useQueryClient()
  const [optimisticIds, setOptimisticIds] = useState<Set<string>>(new Set())

  // Query: fetch all todos
  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: api.getTodos,
  })

  // Mutation: toggle with optimistic update
  const toggleMutation = useMutation({
    mutationFn: api.toggleTodo,

    // 1. BEFORE the mutation: optimistically update the cache
    onMutate: async (todoId: string) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['todos'] })

      // Snapshot the current value (for rollback)
      const previousTodos = queryClient.getQueryData<Todo[]>(['todos'])

      // Optimistically update the cache
      queryClient.setQueryData<Todo[]>(['todos'], (old = []) =>
        old.map(todo =>
          todo.id === todoId
            ? { ...todo, completed: !todo.completed }
            : todo
        )
      )

      // Track which item is being optimistically updated
      setOptimisticIds(prev => new Set(prev).add(todoId))

      // Return context with the snapshot for rollback
      return { previousTodos }
    },

    // 2. ON ERROR: rollback to the snapshot
    onError: (_error, todoId, context) => {
      if (context?.previousTodos) {
        queryClient.setQueryData(['todos'], context.previousTodos)
      }
      setOptimisticIds(prev => {
        const next = new Set(prev)
        next.delete(todoId)
        return next
      })
    },

    // 3. ON SUCCESS or ERROR: remove optimistic tracking
    onSettled: (_data, _error, todoId) => {
      setOptimisticIds(prev => {
        const next = new Set(prev)
        next.delete(todoId)
        return next
      })
      // Always refetch to ensure server truth
      queryClient.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  if (isLoading) return <div>Loading...</div>

  return (
    <ul className="space-y-2">
      {todos.map(todo => (
        <li
          key={todo.id}
          className="flex items-center gap-3 rounded-lg border px-4 py-3"
        >
          <button
            type="button"
            onClick={() => toggleMutation.mutate(todo.id)}
            disabled={toggleMutation.isPending}
            className="flex items-center gap-3 w-full text-left"
          >
            <span
              className={`h-5 w-5 rounded-full border-2 flex items-center justify-center
                transition-colors ${
                  todo.completed
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-muted-foreground'
                }`}
            >
              {todo.completed && '✓'}
            </span>
            <span
              className={`text-sm transition-opacity ${
                todo.completed ? 'line-through text-muted-foreground' : ''
              } ${optimisticIds.has(todo.id) ? 'opacity-70' : ''}`}
            >
              {todo.title}
            </span>
          </button>
          {/* Visual indicator for optimistic state */}
          {optimisticIds.has(todo.id) && (
            <span className="text-[10px] text-muted-foreground animate-pulse">
              saving...
            </span>
          )}
        </li>
      ))}
    </ul>
  )
}
