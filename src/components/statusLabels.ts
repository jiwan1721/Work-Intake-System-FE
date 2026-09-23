import type { WorkItemStatus } from '../api/types'

const STATUS_LABELS: Record<WorkItemStatus, string> = {
  RECEIVED: 'Received',
  ANALYSING: 'Analysing',
  READY_FOR_REVIEW: 'Ready for review',
  FAILED: 'Failed',
  COMPLETED: 'Completed',
}

export function statusLabel(status: WorkItemStatus): string {
  return STATUS_LABELS[status]
}

export const CATEGORY_LABELS: Record<string, string> = {
  DOCUMENT_REQUEST: 'Document request',
  INFORMATION_REQUEST: 'Information request',
  COMPLAINT: 'Complaint',
  TECHNICAL_ISSUE: 'Technical issue',
  ACCOUNT_CHANGE: 'Account change',
  OTHER: 'Other',
}
