<template>
    <section class="tm-lead-owner">
        <div class="tm-lead-owner__who">
            <span class="tm-lead-owner__avatar" :class="{ 'is-queue': !lead.manager_id }">
                <Icon :name="lead.manager_id ? 'user' : 'inbox'" :size="18" />
            </span>

            <div class="tm-lead-owner__text">
                <span class="tm-lead-owner__label">{{ t('cms.ownership.column') }}</span>
                <strong v-if="!lead.manager_id">{{ t('cms.ownership.queueTitle') }}</strong>
                <strong v-else-if="lead.manager_id === me">{{ t('cms.ownership.yours') }}</strong>
                <strong v-else>{{ lead.manager_name || '—' }}</strong>
                <span class="tm-lead-owner__hint">{{ hint }}</span>
            </div>
        </div>

        <div class="tm-lead-owner__actions">
            <Button v-if="!lead.manager_id" size="md" icon="check" :disabled="busy" @click="takeIt">
                {{ t('cms.ownership.take') }}
            </Button>

            <Combobox
                v-if="elevated"
                :model-value="lead.manager_id ?? ''"
                variant="field"
                :label="t('cms.ownership.assign')"
                :options="assignOptions"
                :placeholder="t('cms.ownership.assignPlaceholder')"
                :disabled="busy"
                menu-align="end"
                class="tm-lead-owner__assign"
                @update:model-value="assign"
            />
        </div>
    </section>
</template>

<script setup lang="ts">
import { useLeadsRepository } from '~/modules/leads/repositories'
import { useManagers } from '~/modules/leads/hooks/use-managers'
import type { ILeadRaw } from '~/modules/leads/contracts/leads'
import type { ILeadOwnerProps } from './LeadOwner.d'

const props = defineProps<ILeadOwnerProps>()
const emit = defineEmits<{ changed: [lead: ILeadRaw] }>()

const { t } = useI18n()
const { failed, saved: cheer } = useToast()
const { take, patch } = useLeadsRepository()
const { elevated, me, assignOptions } = useManagers()

const busy = ref(false)

const hint = computed(() => {
  if (!props.lead.manager_id) return t('cms.ownership.queueHint')
  if (props.lead.manager_id === me.value) return t('cms.ownership.yoursHint')

  return t(elevated.value ? 'cms.ownership.reassignHint' : 'cms.ownership.theirsHint')
})

async function run(action: () => Promise<ILeadRaw>, message: string) {
  busy.value = true

  try {
    emit('changed', await action())
    cheer(message)
  }
  catch (e) {
    failed(e)
  }
  finally {
    busy.value = false
  }
}

const takeIt = () => run(() => take(props.lead.uuid), t('cms.ownership.taken'))

const assign = (value: string | null) => {
  const target = value || null

  if (target === props.lead.manager_id) return

  void run(() => patch(props.lead.uuid, { manager_id: target }), t('cms.ownership.assigned'))
}
</script>

<style lang="scss">
@use './_lead-owner.scss';
</style>
