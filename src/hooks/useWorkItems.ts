import { useQuery } from '@tanstack/react-query'

import type { ListParams } from '../api/workItems'
import { workItemKeys, workItemsApi } from '../api/workItems'

/** How often to re-check while work is in flight (PLAN §9). */
export const ANALYSING_POLL_MS = 2000

export function useWorkItems(params: ListParams) {
  return useQuery({
    queryKey: workItemKeys.list(params),
    queryFn: () => workItemsApi.list(params),
    // Poll only while something on screen is actually moving. A list of
    // completed items must not sit there hammering the API.
    refetchInterval: (query) => {
      const busy = query.state.data?.results.some((item) => item.status === 'ANALYSING') ?? false
      return busy ? ANALYSING_POLL_MS : false
    },
    placeholderData: (previous) => previous,
  })
}
