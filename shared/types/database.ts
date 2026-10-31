import type {
  Activity,
  AssignmentStrategy,
  Chore,
  InvitePreview,
  MemberRole,
  MemberStats,
  Profile,
  RecurrenceFreq,
  RecurrenceMode,
  Space,
  SpaceInvite,
  SpaceKind,
  SpaceMember,
  Task,
  TaskStatus,
  TaskTrade,
  TradeStatus,
} from './schema'

type Table<Row, Insert, Update = Partial<Row>> = {
  Row: Row
  Insert: Insert
  Update: Update
  Relationships: []
}

// Minimal typing of the database for supabase-js. Mirrors
// supabase/migrations/0001_init.sql; keep both in sync.
export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile, Partial<Profile> & { id: string }, Partial<Pick<Profile, 'display_name' | 'avatar_url'>>>
      spaces: Table<Space, never, Partial<Pick<Space, 'name' | 'description' | 'icon' | 'color'>>>
      space_members: Table<SpaceMember, never, never>
      space_invites: Table<SpaceInvite, Partial<SpaceInvite> & { space_id: string }>
      chores: Table<
        Chore,
        Partial<Omit<Chore, 'id' | 'generated_until' | 'generated_count'>> & { space_id: string; title: string },
        Partial<Omit<Chore, 'id' | 'space_id' | 'generated_until' | 'generated_count'>>
      >
      tasks: Table<Task, Partial<Task> & { space_id: string; title: string }>
      task_trades: Table<TaskTrade, never, never>
      activity: Table<Activity, never, never>
    }
    Views: {
      member_stats: { Row: MemberStats; Relationships: [] }
    }
    Functions: {
      create_space: {
        Args: { p_name: string; p_description?: string | null; p_icon?: string | null; p_color?: string | null }
        Returns: Space
      }
      invite_preview: { Args: { p_token: string }; Returns: InvitePreview[] }
      accept_invite: { Args: { p_token: string }; Returns: string }
      leave_space: { Args: { p_space_id: string }; Returns: undefined }
      remove_member: { Args: { p_space_id: string; p_user_id: string }; Returns: undefined }
      set_member_role: { Args: { p_space_id: string; p_user_id: string; p_role: MemberRole }; Returns: undefined }
      sync_my_spaces: { Args: { p_today?: string }; Returns: number }
      propose_trade: {
        Args: { p_task_id: string; p_to_user?: string | null; p_counter_task_id?: string | null; p_message?: string | null }
        Returns: TaskTrade
      }
      respond_trade: { Args: { p_trade_id: string; p_accept: boolean }; Returns: TaskTrade }
      cancel_trade: { Args: { p_trade_id: string }; Returns: undefined }
      is_space_member: { Args: { p_space_id: string }; Returns: boolean }
      is_space_admin: { Args: { p_space_id: string }; Returns: boolean }
    }
    Enums: {
      space_kind: SpaceKind
      member_role: MemberRole
      task_status: TaskStatus
      recurrence_freq: RecurrenceFreq
      recurrence_mode: RecurrenceMode
      assignment_strategy: AssignmentStrategy
      trade_status: TradeStatus
    }
    CompositeTypes: Record<string, never>
  }
}
