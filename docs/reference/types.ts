// Domain types of the TARGET unified platform (mirror of schema.sql).
// The chores module's live types are in shared/types/schema.ts — a subset.
// Conventions: ids are UUID strings, money is integer minor units (cents)
// plus an ISO 4217 currency, calendar dates are 'YYYY-MM-DD', times 'HH:MM'.

export type UUID = string
export type ISODate = string
export type ISOTime = string
export type Timestamp = string
export type Currency = string // 'EUR', 'USD' …
export type Cents = number

export interface Money { amount: Cents; currency: Currency }

// ================================================================= CORE
export type SpaceKind = 'personal' | 'household' | 'project' | 'organization'
export type MemberRole = 'owner' | 'admin' | 'member' | 'guest'
export type ModuleId = 'chores' | 'money' | 'tickets' | 'calendar' | `x.${string}`

export interface Profile {
  id: UUID
  displayName: string | null
  avatarUrl: string | null
  locale: 'en' | 'es' | 'pt' | string
  timezone: string
  weekStartsOn: 1 | 2 | 3 | 4 | 5 | 6 | 7
  defaultCurrency: Currency
}

export interface Space {
  id: UUID
  kind: SpaceKind
  parentId: UUID | null
  name: string
  description: string | null
  icon: string | null
  color: string | null
  currency: Currency
  settings: SpaceSettings
  archivedAt: Timestamp | null
}

export interface SpaceSettings {
  money?: { simplifyDebts: boolean; defaultSplit: SplitMethodKind }
  chores?: { horizonDays: number; allowSelfAssignOnly: boolean }
  tickets?: { keyPrefix: string } // HOME-42
  [module: string]: unknown
}

export interface SpaceMember {
  spaceId: UUID
  userId: UUID
  role: MemberRole
  nickname: string | null
  away: { from: ISODate; until: ISODate } | null
  joinedAt: Timestamp
}

export interface Contact { id: UUID; spaceId: UUID; name: string; email: string | null; linkedUserId: UUID | null }

export interface Invite {
  id: UUID
  spaceId: UUID
  token: string
  role: MemberRole
  expiresAt: Timestamp
  maxUses: number | null
  useCount: number
  revokedAt: Timestamp | null
}

export interface Tag { id: UUID; spaceId: UUID; name: string; color: string | null }

export interface DomainEvent<V extends string = string, D = Record<string, unknown>> {
  id: number
  spaceId: UUID
  actorId: UUID | null
  moduleId: ModuleId
  verb: V
  subject: { type: string; id: UUID } | null
  data: D
  createdAt: Timestamp
}

export interface Attachment {
  id: UUID
  spaceId: UUID
  owner: { type: 'item' | 'expense' | 'event' | 'asset'; id: UUID }
  storagePath: string
  mime: string | null
  bytes: number | null
}

// ================================================================= WORK
export type ItemKind = 'task' | 'chore' | 'issue' | 'purchase' | 'note'
export type StateCategory = 'backlog' | 'todo' | 'active' | 'waiting' | 'done' | 'cancelled'
export type Priority = 0 | 1 | 2 | 3 | 4
export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7
export type LinkType = 'blocks' | 'relates' | 'duplicates'

export interface Workflow { id: UUID; spaceId: UUID | null; name: string; itemKind: ItemKind; states: WorkflowState[] }
export interface WorkflowState { id: UUID; name: string; category: StateCategory; position: number }

/** Built-in "Repair" workflow from the ticketing brief. */
export const REPAIR_WORKFLOW: Array<Pick<WorkflowState, 'name' | 'category'>> = [
  { name: 'Reported', category: 'backlog' },
  { name: 'Diagnosing', category: 'active' },
  { name: 'Parts needed', category: 'waiting' },
  { name: 'Deferred', category: 'waiting' },
  { name: 'Repair in progress', category: 'active' },
  { name: 'Resolved', category: 'done' },
  { name: "Won't fix", category: 'cancelled' },
]

export interface RecurrenceRule {
  freq: 'daily' | 'weekly' | 'monthly' | 'yearly' | null
  every: number
  byWeekday: Weekday[]
  mode: 'fixed' | 'after_completion' | 'pool'
  startDate: ISODate
  endDate: ISODate | null
  dueTime: ISOTime | null
  cooldownDays: number
}

export type AssignmentStrategy = 'fixed' | 'rotation' | 'balanced' | 'unassigned'

export interface Series {
  id: UUID
  spaceId: UUID
  template: Pick<Item, 'title' | 'body' | 'priority' | 'effort' | 'kind'> & { tagIds?: UUID[]; workflowId?: UUID }
  rule: RecurrenceRule
  strategy: AssignmentStrategy
  rotation: UUID[]
  active: boolean
}

export interface Item {
  id: UUID
  spaceId: UUID
  number: number
  kind: ItemKind
  parentId: UUID | null
  seriesId: UUID | null
  workflowId: UUID | null
  stateId: UUID | null
  stateCategory: StateCategory
  title: string
  body: string | null
  nextAction: string | null
  priority: Priority
  rank: string
  effort: 1 | 2 | 3 | 4 | 5 | null
  estimateMinutes: number | null
  due: { date: ISODate; time: ISOTime | null } | null
  startDate: ISODate | null
  assigneeId: UUID | null
  assetId: UUID | null
  location: string | null
  estimatedCost: Money | null
  private: boolean
  detached: boolean
  closedAt: Timestamp | null
  completedBy: UUID | null
  createdBy: UUID | null
  createdAt: Timestamp
  updatedAt: Timestamp
}

/** Derived, never stored: an item is actionable when nothing open blocks it. */
export interface ItemView extends Item {
  key: string // 'HOME-42'
  blockedBy: UUID[]
  children: { total: number; done: number }
  materials: Material[]
  actualCost: Money | null // sum of linked expenses
  tags: Tag[]
}

export interface ItemLink { from: UUID; to: UUID; type: LinkType }

export interface Comment { id: UUID; itemId: UUID; authorId: UUID | null; body: string; kind: 'comment' | 'diagnosis' | 'repair_note'; createdAt: Timestamp }

export interface Material {
  id: UUID
  itemId: UUID
  name: string
  quantity: number
  unit: string | null
  url: string | null
  estimatedUnitCost: Cents | null
  purchaseItemId: UUID | null
  expenseId: UUID | null
  acquired: boolean
}

export interface Asset { id: UUID; spaceId: UUID; name: string; category: string | null; location: string | null; purchasedOn: ISODate | null; warrantyUntil: ISODate | null }

export type TradeStatus = 'pending' | 'accepted' | 'declined' | 'cancelled' | 'expired'
export interface Trade { id: UUID; spaceId: UUID; itemId: UUID; fromUser: UUID; toUser: UUID | null; counterItemId: UUID | null; message: string | null; status: TradeStatus }

export interface Board {
  id: UUID
  spaceId: UUID
  name: string
  layout: 'list' | 'kanban' | 'table' | 'calendar'
  query: ItemQuery
}
export interface ItemQuery {
  kinds?: ItemKind[]
  states?: StateCategory[]
  assignee?: UUID | 'me' | 'nobody'
  tagIds?: UUID[]
  parentId?: UUID | null
  due?: { from?: ISODate; to?: ISODate }
  text?: string
  groupBy?: 'state' | 'assignee' | 'priority' | 'tag' | 'parent'
  sort?: Array<{ field: 'rank' | 'due' | 'priority' | 'created'; dir: 'asc' | 'desc' }>
}

// ================================================================ MONEY
export type SplitMethodKind = 'equal' | 'shares' | 'percent' | 'exact'
export type Party = { userId: UUID } | { contactId: UUID }

export interface Expense {
  id: UUID
  spaceId: UUID
  description: string
  amount: Money
  fxRate: number
  paidBy: Party
  splitMethod: SplitMethodKind
  shares: ExpenseShare[]
  spentOn: ISODate
  category: string | null
  itemId: UUID | null // the chore/issue this was bought for
  materialId: UUID | null
  receiptId: UUID | null
}
export interface ExpenseShare { party: Party; weight: number | null; amount: Cents }

export interface Settlement { id: UUID; spaceId: UUID; from: UUID; to: UUID; amount: Money; settledOn: ISODate; method: string | null; confirmedByReceiver: boolean }

export interface Balance { spaceId: UUID; userId: UUID; balance: Cents } // + is owed, − owes
export interface SuggestedTransfer { from: UUID; to: UUID; amount: Cents }

export interface Account { id: UUID; spaceId: UUID; name: string; type: 'cash' | 'bank' | 'card' | 'savings'; currency: Currency; openingBalance: Cents }
export interface Transaction { id: UUID; accountId: UUID; occurredOn: ISODate; amount: Cents; description: string; counterparty: string | null; category: string | null; expenseId: UUID | null; transferGroup: UUID | null }

// ================================================================= TIME
export interface Calendar { id: UUID; spaceId: UUID; name: string; color: string | null; icsUrl: string | null }

export interface Activity {
  id: UUID
  spaceId: UUID
  name: string // 'Metafísica', 'Upkeep', 'Education'
  kind: 'block' | 'focus' | 'pool'
  color: string | null
  location: string | null
  term: { start: ISODate; end: ISODate } | null
  blocks: ActivityBlock[]
  pool: { tagId: UUID | null; parentItemId: UUID | null; drawsPerDay: number; drawDays: Weekday[] } | null
  candidate: boolean
}
export interface ActivityBlock { id: UUID; weekday: Weekday; starts: ISOTime; ends: ISOTime; info: string | null }

export interface CalendarEvent {
  id: UUID
  spaceId: UUID
  calendarId: UUID | null
  activityId: UUID | null
  itemId: UUID | null
  title: string
  startsAt: Timestamp
  endsAt: Timestamp
  allDay: boolean
  rrule: string | null
  attendees: UUID[]
}

export interface DailyDraw { userId: UUID; activityId: UUID; day: ISODate; itemId: UUID; status: 'drawn' | 'done' | 'rerolled' | 'skipped' }

/** The merged "My day" feed every module contributes to. */
export type AgendaEntry =
  | { type: 'item'; item: ItemView; reason: 'due' | 'overdue' | 'drawn' | 'unblocked' }
  | { type: 'event'; event: CalendarEvent }
  | { type: 'block'; activity: Activity; block: ActivityBlock; date: ISODate }
  | { type: 'money'; transfer: SuggestedTransfer }

// ============================================================== PLUGINS
export interface ModuleManifest {
  id: ModuleId
  name: string
  version: string
  description: string
  requires?: ModuleId[]
  /** Item kinds or workflows this module contributes. */
  itemKinds?: Array<{ kind: ItemKind | `x.${string}`; defaultWorkflow?: string }>
  /** Navigation and routes (first-party: Nuxt layer pages; third-party: iframe URLs). */
  nav?: Array<{ label: string; route: string; icon: string }>
  /** Extension points rendered by the core shell. */
  slots?: Array<'item.sidebar' | 'item.actions' | 'agenda.section' | 'space.settings' | 'space.dashboard'>
  /** Events the module reacts to (delivered via webhook or in-process handler). */
  subscribes?: string[]
  /** Scopes requested from the space owner when enabling. */
  permissions?: Array<'items:read' | 'items:write' | 'money:read' | 'money:write' | 'calendar:read' | 'calendar:write' | 'members:read'>
  settingsSchema?: Record<string, unknown> // JSON Schema
}
