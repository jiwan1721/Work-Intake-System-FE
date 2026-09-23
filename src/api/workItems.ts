import { api } from './client'
import type { Paginated, WorkItem, WorkItemDetail, WorkItemStatus } from './types'

export interface ListParams {
  status?: WorkItemStatus | undefined
  page?: number | undefined
}

function listPath({ status, page }: ListParams): string {
  const search = new URLSearchParams()
  if (status) search.set('status', status)
  if (page && page > 1) search.set('page', String(page))
  const query = search.toString()
  return query ? `/work-items?${query}` : '/work-items'
}

export const workItemsApi = {
  list: (params: ListParams) => api.get<Paginated<WorkItem>>(listPath(params)),
  get: (id: string) => api.get<WorkItemDetail>(`/work-items/${id}`),
  analyse: (id: string) => api.post<WorkItem>(`/work-items/${id}/analyse`),
  retry: (id: string) => api.post<WorkItem>(`/work-items/${id}/retry`),
  complete: (id: string) =>
    api.patch<WorkItem>(`/work-items/${id}/status`, { status: 'COMPLETED' }),
}

/**
 * Query keys in one place so an invalidation can never miss a cache entry by
 * spelling the key differently.
 */
export const workItemKeys = {
  all: ['workItems'] as const,
  lists: () => [...workItemKeys.all, 'list'] as const,
  list: (params: ListParams) => [...workItemKeys.lists(), params] as const,
  details: () => [...workItemKeys.all, 'detail'] as const,
  detail: (id: string) => [...workItemKeys.details(), id] as const,
}
