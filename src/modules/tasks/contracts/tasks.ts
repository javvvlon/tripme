/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const TASK_STATUSES = ['backlog', 'todo', 'in_progress', 'review', 'done'] as const

export type TaskStatus = typeof TASK_STATUSES[number]

export const TASK_PRIORITIES = ['urgent', 'high', 'medium', 'low'] as const

export type TaskPriority = typeof TASK_PRIORITIES[number]

export const TASK_VIEWS = ['board', 'list', 'mine', 'archive'] as const

export type TaskView = typeof TASK_VIEWS[number]

export interface IPerson {
  uuid: string
  name: string
}

export interface ITask {
  uuid: string
  key: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assignee: IPerson | null
  author: IPerson | null
  due_on: string | null
  labels: string[]
  overdue: boolean
  comments: number
  completed_at: string | null
  archived_at: string | null
  created_at: string
  updated_at: string
}

export interface ITaskEvent {
  uuid: string
  kind: 'created' | 'status' | 'assigned' | 'priority' | 'due' | 'title' | 'comment' | 'archived' | 'restored'
  from: string | null
  to: string | null
  body: string
  actor: IPerson | null
  at: string
}

export interface ITaskDetail extends ITask {
  events: ITaskEvent[]
}

export interface ITaskDraft {
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  assigneeId: string | null
  dueOn: string
  labels: string
}

export interface ITaskPatch {
  title?: string
  description?: string
  status?: TaskStatus
  priority?: TaskPriority
  assignee_id?: string | null
  due_on?: string | null
  labels?: string[]
}

export interface ITaskQuery {
  q?: string
  mine?: boolean
  assignee?: string
  archived?: boolean
}

export interface ITaskSummary {
  open: number
  overdue: number
  due_today: number
  review: number
}
