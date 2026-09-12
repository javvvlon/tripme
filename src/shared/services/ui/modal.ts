import type { Component, Ref } from 'vue'
import type { ModalSizeValue } from '~/shared/components/modal/Modal.config'

/**
 * @author Javlon Khalimjonov <khalimjanov2000@gmail.com>
 */
export type ModalKey = string

export interface IModalConfig {
  size?: ModalSizeValue
  title?: string
  description?: string
  dismissible?: boolean
}

export interface IModalEntry {
  component: Component | (() => Promise<Component | { default: Component }>)
  config?: IModalConfig
}

export type IModalRegistry = Record<ModalKey, IModalEntry>

export interface IOpenModal<T = unknown> {
  id: number
  key: ModalKey
  entry: IModalEntry
  props: Record<string, unknown>
  config: IModalConfig
  resolve: (value: T) => void
}

export interface IModalContext<T = unknown> {
  resolve: (value: T) => void
  dismiss: () => void
  config: IModalConfig
}

export const MODAL_CONTEXT = Symbol('tm-modal-context') as InjectionKey<IModalContext>

export class ModalService {
  private readonly registry: IModalRegistry

  private readonly stack: Ref<IOpenModal[]>

  private next = 0

  constructor(registry: IModalRegistry, stack: Ref<IOpenModal[]>) {
    this.registry = registry
    this.stack = stack
  }

  get open_(): Ref<IOpenModal[]> {
    return this.stack
  }

  has(key: ModalKey): boolean {
    return key in this.registry
  }

  open<T = unknown>(
    key: ModalKey,
    props: Record<string, unknown> = {},
    config: IModalConfig = {},
  ): Promise<T | undefined> {
    const entry = this.registry[key]

    if (!entry) {
      if (import.meta.dev) console.warn(`[modal] nothing registered for "${key}"`)

      return Promise.resolve(undefined)
    }

    return new Promise<T | undefined>((resolve) => {
      const id = (this.next += 1)

      const settle = (value: T | undefined) => {
        this.stack.value = this.stack.value.filter(item => item.id !== id)
        resolve(value)
      }

      this.stack.value = [...this.stack.value, {
        id,
        key,
        entry,
        props,
        config: { dismissible: true, ...entry.config, ...config },
        resolve: settle as (value: unknown) => void,
      }]
    })
  }

  dismissTop(): void {
    const top = this.stack.value.at(-1)

    if (top) top.resolve(undefined)
  }

  dismissAll(): void {
    for (const item of [...this.stack.value]) item.resolve(undefined)
  }
}
