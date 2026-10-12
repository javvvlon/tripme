import { toE164 } from '~/shared/helpers/phone'
import type { AnyObject } from '~/shared/contracts/data'
import type { IMemberDraft, IMyWork, ITeamMember } from '../contracts/team'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export const useTeamRepository = () => {
  const http = useHttp()

  const members = async (): Promise<ITeamMember[]> => (await http.call<ITeamMember[]>('Team', 'members')).data ?? []

  const create = async (draft: IMemberDraft): Promise<{ member: ITeamMember, password: string }> =>
    (await http.call<{ member: ITeamMember, password: string }>('Team', 'createMember', {}, {
      email: draft.email.trim(),
      first_name: draft.firstName.trim(),
      last_name: draft.lastName.trim(),
      phone: toE164(draft.phone),
      role: draft.role,
    } as AnyObject)).data

  const resetPassword = async (id: string): Promise<string> =>
    (await http.call<{ password: string }>('Team', 'resetPassword', { id })).data.password

  const archive = async (id: string, handTo: string | null): Promise<ITeamMember> =>
    (await http.call<ITeamMember>('Team', 'archiveMember', { id }, { hand_to: handTo } as AnyObject)).data

  const restore = async (id: string): Promise<ITeamMember> =>
    (await http.call<ITeamMember>('Team', 'restoreMember', { id })).data

  const myWork = async (): Promise<IMyWork> => (await http.call<IMyWork>('Team', 'myWork')).data

  return { members, create, resetPassword, archive, restore, myWork }
}
