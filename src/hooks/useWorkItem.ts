import { useQuery } from '@tanstack/react-query'

import { workItemKeys, workItemsApi } from '../api/workItems'
import { ANALYSING_POLL_MS } from './useWorkItems'

export function useWorkItem(id: string | undefined) {
  return useQuery({
    queryKey: workItemKeys.detail(id ?? ''),
    queryFn: () => workItemsApi.get(id as string),
    enabled: Boolean(id),
    refetchInterval: (query) =>
      query.state.data?.status === 'ANALYSING' ? ANALYSING_POLL_MS : false,
  })
}
