import type { AnyObject } from '~/shared/contracts/data'
import { labelsOf } from '../helpers'
import type { ITask, ITaskDetail, ITaskDraft, ITaskEvent, ITaskPatch, ITaskQuery, ITaskSummary } from '../contracts/tasks'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTasksRepository = () => {
  const http = useHttp()

  const list = async (query: ITaskQuery): Promise<ITask[]> => {
    const params: Record<string, string> = {}

    if (query.q) params.q = query.q
    if (query.mine) params.mine = '1'
    if (query.assignee) params.assignee = query.assignee
    if (query.archived) params.archived = '1'

    return (await http.call<ITask[]>('Tasks', 'list', params)).data ?? []
  }

  const summary = async (): Promise<ITaskSummary> => (await http.call<ITaskSummary>('Tasks', 'summary')).data

  const one = async (id: string): Promise<ITaskDetail> => (await http.call<ITaskDetail>('Tasks', 'one', { id })).data

  const create = async (draft: ITaskDraft): Promise<ITask> =>
    (await http.call<ITask>('Tasks', 'create', {}, {
      title: draft.title.trim(),
      description: draft.description.trim(),
      status: draft.status,
      priority: draft.priority,
      assignee_id: draft.assigneeId,
      due_on: draft.dueOn || null,
      labels: labelsOf(draft.labels),
    } as AnyObject)).data

  const update = async (id: string, patch: ITaskPatch): Promise<ITask> =>
    (await http.call<ITask>('Tasks', 'update', { id }, patch as AnyObject)).data

  const comment = async (id: string, body: string): Promise<ITaskEvent> =>
    (await http.call<ITaskEvent>('Tasks', 'comment', { id }, { body } as AnyObject)).data

  const archive = async (id: string): Promise<ITask> => (await http.call<ITask>('Tasks', 'archive', { id })).data

  const restore = async (id: string): Promise<ITask> => (await http.call<ITask>('Tasks', 'restore', { id })).data

  return { list, summary, one, create, update, comment, archive, restore }
}
