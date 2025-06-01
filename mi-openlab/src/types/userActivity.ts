export type UserActivityType =
  | 'create_project'
  | 'edit_project'
  | 'delete_project'
  | 'comment'
  | 'like'
  | 'favorite'
  | 'join_community'
  | 'leave_community'
  | 'create_discussion';

export interface UserActivity {
  id: string;
  userId: string;
  type: UserActivityType;
  description: string;
  timestamp: Date;
  relatedId?: string; // id del proyecto, comunidad, etc.
  extra?: Record<string, any>;
}
