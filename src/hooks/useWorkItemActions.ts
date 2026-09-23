import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'

import { ApiError } from '../api/client'
import type { WorkItemAction } from '../api/types'
import { workItemKeys, workItemsApi } from '../api/workItems'
import { useToast } from '../components/feedback/toastContext'

export const STALE_ITEM_MESSAGE = 'This item changed since you loaded it; refreshed'

/**
 * The three workflow actions.
 *
 * Deliberately not optimistic (PLAN §9). The server owns transitions: it can
 * reject the action, and an analysis can come back FAILED. Pretending to know
 * the outcome would mean showing a result that then flips, so the UI shows a
 * pending state and refetches instead.
 */
export function useWorkItemActions(id: string) {
  const queryClient = useQueryClient()
  const { showToast } = useToast()

  const onSettled = useCallback(async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: workItemKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: workItemKeys.detail(id) }),
    ])
  }, [queryClient, id])

  const onError = useCallback(
    (error: unknown) => {
      // 409 means somebody else moved this item — the operator is looking at
      // a stale screen. Say so plainly; onSettled pulls the truth down.
      if (error instanceof ApiError && error.status === 409) {
        showToast(STALE_ITEM_MESSAGE)
      }
    },
    [showToast],
  )

  const analyse = useMutation({
    mutationFn: () => workItemsApi.analyse(id),
    onError,
    onSettled,
  })

  const retry = useMutation({
    mutationFn: () => workItemsApi.retry(id),
    onError,
    onSettled,
  })

  const complete = useMutation({
    mutationFn: () => workItemsApi.complete(id),
    onError,
    onSettled,
  })

  const byAction = { analyse, retry, complete }

  const pendingAction: WorkItemAction | null =
    (Object.keys(byAction) as WorkItemAction[]).find((key) => byAction[key].isPending) ?? null

  return {
    ...byAction,
    byAction,
    /** Which action is in flight, so the other buttons can be disabled. */
    pendingAction,
    isPending: pendingAction !== null,
  }
}
