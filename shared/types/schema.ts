// Row types for every table/view in supabase/migrations. Hand-written to stay
// readable; regenerate with `npx supabase gen types typescript` and diff if
// the schema grows. `type` (not `interface`) on purpose: supabase-js needs
// rows to be assignable to Record<string, unknown>.

export type UUID = string
/** Calendar date, `YYYY-MM-DD`, always in the user's local calendar. */
export type ISODate = string
/** Wall-clock time, `HH:MM` or `HH:MM:SS`. */
export type ISOTime = string
/** Timestamp with timezone, ISO 8601. */
export type Timestamp = string

export type SpaceKind = 'personal' | 'household'
export type MemberRole = 'owner' | 'admin' | 'member'
export type TaskStatus = 'open' | 'done' | 'skipped'
export type RecurrenceFreq = 'daily' | 'weekly' | 'monthly' | 'yearly'
export type RecurrenceMode = 'fixed' | 'after_completion'
export type AssignmentStrategy = 'fixed' | 'rotation' | 'balanced' | 'unassigned'
export type TradeStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired'

/** 0 none · 1 low · 2 medium · 3 high · 4 urgent */
export type Priority = 0 | 1 | 2 | 3 | 4
/** ISO weekday: 1 = Monday … 7 = Sunday */
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7

export type Profile = {
  id: UUID
  display_name: string | null
  avatar_url: string | null
  created_at: Timestamp
}

export type Space = {
  id: UUID
  kind: SpaceKind
  name: string
  description: string | null
  icon: string | null
  color: string | null
  created_by: UUID | null
  created_at: Timestamp
}

export type SpaceMember = {
  space_id: UUID
  user_id: UUID
  role: MemberRole
  joined_at: Timestamp
}

export type SpaceInvite = {
  id: UUID
  space_id: UUID
  token: string
  created_by: UUID | null
  expires_at: Timestamp
  max_uses: number | null
  use_count: number
  revoked_at: Timestamp | null
  created_at: Timestamp
}

export type Chore = {
  id: UUID
  space_id: UUID
  title: string
  description: string | null
  priority: Priority
  effort: number
  freq: RecurrenceFreq
  every: number
  by_weekday: Weekday[]
  mode: RecurrenceMode
  start_date: ISODate
  end_date: ISODate | null
  due_time: ISOTime | null
  strategy: AssignmentStrategy
  rotation: UUID[]
  active: boolean
  generated_until: ISODate | null
  generated_count: number
  created_by: UUID | null
  created_at: Timestamp
  updated_at: Timestamp
}

export type Task = {
  id: UUID
  space_id: UUID
  chore_id: UUID | null
  title: string
  description: string | null
  priority: Priority
  effort: number
  due_date: ISODate | null
  due_time: ISOTime | null
  assignee_id: UUID | null
  status: TaskStatus
  closed_at: Timestamp | null
  completed_by: UUID | null
  detached: boolean
  occurrence: number | null
  created_by: UUID | null
  created_at: Timestamp
  updated_at: Timestamp
}

export type TaskTrade = {
  id: UUID
  space_id: UUID
  task_id: UUID
  from_user: UUID
  to_user: UUID | null
  counter_task_id: UUID | null
  message: string | null
  status: TradeStatus
  created_at: Timestamp
  responded_at: Timestamp | null
  responded_by: UUID | null
}

export type ActivityVerb =
  | 'task.created'
  | 'task.completed'
  | 'task.skipped'
  | 'task.reopened'
  | 'chore.created'
  | 'trade.proposed'
  | 'trade.accepted'
  | 'trade.declined'
  | 'member.joined'
  | 'member.left'

export type Activity = {
  id: number
  space_id: UUID
  actor_id: UUID | null
  verb: ActivityVerb
  task_id: UUID | null
  subject: string | null
  data: Record<string, unknown>
  created_at: Timestamp
}

export type MemberStats = {
  space_id: UUID
  user_id: UUID
  role: MemberRole
  done_30d: number
  effort_30d: number
  open_assigned: number
  overdue: number
}

export type InvitePreview = {
  space_id: UUID | null
  name: string | null
  description: string | null
  icon: string | null
  color: string | null
  member_count: number
  already_member: boolean
  valid: boolean
  reason: 'not_found' | 'revoked' | 'expired' | 'used_up' | null
}

// ---- app-level compositions ------------------------------------------------

export type SpaceWithRole = Space & { role: MemberRole }

export type MemberWithProfile = SpaceMember & { profile: Profile }

export const PRIORITY_LABELS: Record<Priority, string> = {
  0: 'No priority',
  1: 'Low',
  2: 'Medium',
  3: 'High',
  4: 'Urgent',
}

export const STRATEGY_LABELS: Record<AssignmentStrategy, string> = {
  rotation: 'Take turns',
  balanced: 'Balance the load',
  fixed: 'Always the same person',
  unassigned: 'Up for grabs',
}
