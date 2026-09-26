import { useMutation, useQueryClient } from '@tanstack/react-query'

import { workItemKeys, workItemsApi } from '../api/workItems'

export function useCreateWorkItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: workItemsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: workItemKeys.lists() })
    },
  })
}
