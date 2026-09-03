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
  /** Clicking the backdrop or pressing Escape gives up on the modal. */
  dismissible?: boolean
}

export interface IModalEntry {
  /** Loaded when first opened, so a registry costs nothing until used. */
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

/**
 * What a modal component gets when the host renders it: how to finish, and
 * how to walk away. Reached with `useModalContext()` inside the component.
 */
export interface IModalContext<T = unknown> {
  resolve: (value: T) => void
  dismiss: () => void
  config: IModalConfig
}

export const MODAL_CONTEXT = Symbol('tm-modal-context') as InjectionKey<IModalContext>

/**
 * Opens modals that modules registered, by key.
 *
 * The stack lives per request for the same reason the toasts do: module-level
 * state on the server belongs to every visitor being rendered at once.
 */
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

  /**
   * Resolves with whatever the modal passed to `resolve`, or `undefined` if
   * the person closed it. Awaiting the call is the whole point: the caller
   * reads like it asked a question and got an answer.
   */
  open<T = unknown>(
    key: ModalKey,
    props: Record<string, unknown> = {},
    config: IModalConfig = {},
  ): Promise<T | undefined> {
    const entry = this.registry[key]

    if (!entry) {
      /**
       * A missing key means a module did not register what a page asked for.
       * Rejecting would make every call site handle it; a warning keeps the
       * page usable and puts the mistake where a developer will see it.
       */
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

  /** Closes the topmost modal as if it had been dismissed. */
  dismissTop(): void {
    const top = this.stack.value.at(-1)

    if (top) top.resolve(undefined)
  }

  dismissAll(): void {
    for (const item of [...this.stack.value]) item.resolve(undefined)
  }
}
