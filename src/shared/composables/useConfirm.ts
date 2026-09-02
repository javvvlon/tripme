/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export interface IConfirmRequest {
  title: string
  description?: string
  /** what will be lost, named — a title, a number, a person */
  subject?: string
  confirmLabel?: string
  cancelLabel?: string
  tone?: 'danger' | 'default'
}

interface IPending extends IConfirmRequest {
  settle: (answer: boolean) => void
}

const pending = shallowRef<IPending | null>(null)

export const useConfirm = () => {
  const ask = (request: IConfirmRequest): Promise<boolean> =>
    new Promise((resolve) => {
      pending.value = {
        tone: 'danger',
        ...request,
        settle: (answer) => {
          pending.value = null
          resolve(answer)
        },
      }
    })

  return { ask, pending }
}
