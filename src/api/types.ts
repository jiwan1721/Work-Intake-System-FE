/**
 * The v1 wire contract, mirroring the backend serializers (PLAN §8).
 *
 * Hand-written rather than generated. The stretch goal in PLAN §9 is to
 * generate these from the drf-spectacular schema at /api/v1/schema with
 * openapi-typescript, which would make drift impossible instead of merely
 * unlikely.
 */

export const WORK_ITEM_STATUSES = [
  'RECEIVED',
  'ANALYSING',
  'READY_FOR_REVIEW',
  'FAILED',
  'COMPLETED',
] as const

export type WorkItemStatus = (typeof WORK_ITEM_STATUSES)[number]

export const CATEGORIES = [
  'DOCUMENT_REQUEST',
  'INFORMATION_REQUEST',
  'COMPLAINT',
  'TECHNICAL_ISSUE',
  'ACCOUNT_CHANGE',
  'OTHER',
] as const

export type Category = (typeof CATEGORIES)[number]

export const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const

export type Priority = (typeof PRIORITIES)[number]

/** The actions the server says are legal right now (PLAN §8). */
export type WorkItemAction = 'analyse' | 'retry' | 'complete'

export interface Analysis {
  category: Category
  priority: Priority
  summary: string
  recommended_action: string
  analysed_at: string
  model: string | null
}

export interface WorkItemError {
  code: string
  message: string
}

export interface WorkItem {
  id: string
  external_id: string
  title: string
  description: string
  status: WorkItemStatus
  /** Null until a valid analysis exists — never a half-filled object. */
  analysis: Analysis | null
  last_error: WorkItemError | null
  attempt_count: number
  allowed_actions: WorkItemAction[]
  version: number
  created_at: string
  updated_at: string
}

export interface AnalysisAttempt {
  attempt_no: number
  outcome: 'SUCCEEDED' | 'FAILED'
  provider: string
  model: string
  prompt_version: string
  error_code: string | null
  error_message: string | null
  latency_ms: number | null
  started_at: string
  finished_at: string | null
}

export interface StatusTransition {
  from_status: WorkItemStatus
  to_status: WorkItemStatus
  actor: 'system' | 'operator'
  reason: string
  created_at: string
}

export interface WorkItemDetail extends WorkItem {
  attempts: AnalysisAttempt[]
  transitions: StatusTransition[]
}

export interface Paginated<T> {
  count: number
  page: number
  pageSize: number
  totalPages: number
  results: T[]
}

/** Every error from the API has this shape (PLAN §8). */
export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details: Record<string, unknown>
  }
}

export function isWorkItemStatus(value: string): value is WorkItemStatus {
  return (WORK_ITEM_STATUSES as readonly string[]).includes(value)
}

// --- Auth types -------------------------------------------------------------

export interface AuthUser {
  id: number
  email: string
  firstName: string
  lastName: string
  fullName: string
  isActive: boolean
  dateJoined: string
}

export interface AuthTokens {
  access: string
  refresh: string
  user: AuthUser
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
}

export interface RegisterResponse {
  message: string
  email: string
}

export interface MessageResponse {
  message: string
}
