<template>
    <div class="tm-cms-points">
        <SectionHead :level="1" :title="t('cms.points.title')" :sub="t('cms.points.lead')" />

        <EditorSkeleton v-if="status === 'pending'" variant="rows" />

        <template v-else>
            <section class="tm-cms-points__card">
                <div class="tm-cms-points__card-head">
                    <div>
                        <h2 class="tm-cms-points__card-title">{{ t('cms.points.tiers.title') }}</h2>
                        <p class="tm-cms-points__card-lead">{{ t('cms.points.tiers.lead') }}</p>
                    </div>

                    <Button v-if="canManage && editing !== 'new'" size="sm" variant="secondary" icon="plus" @click="edit(null)">
                        {{ t('cms.points.tiers.add') }}
                    </Button>
                </div>

                <table class="tm-cms-points__table">
                    <thead>
                        <tr>
                            <th scope="col">{{ t('cms.points.tiers.name') }}</th>
                            <th scope="col" class="is-num">{{ t('cms.points.tiers.threshold') }}</th>
                            <th scope="col" class="is-num">{{ t('cms.points.tiers.discount') }}</th>
                            <th v-if="canManage" scope="col" class="is-actions" />
                        </tr>
                    </thead>

                    <tbody>
                        <tr v-for="tier in tiers" :key="tier.id">
                            <template v-if="editing === tier.id">
                                <td><Input v-model="draft.name" :placeholder="t('cms.points.tiers.name')" /></td>
                                <td class="is-num"><Input v-model="draft.threshold" type="number" /></td>
                                <td class="is-num"><Input v-model="draft.discount_percent" type="number" /></td>
                                <td class="is-actions">
                                    <Button size="sm" :disabled="savingTier" @click="submitTier">{{ t('common.save') }}</Button>
                                    <Button size="sm" variant="ghost" :disabled="savingTier" @click="cancel">{{ t('common.cancel') }}</Button>
                                </td>
                            </template>

                            <template v-else>
                                <td class="is-name"><TierBadge :tier="tier" /></td>
                                <td class="is-num">{{ points(tier.threshold) }}</td>
                                <td class="is-num">{{ tier.discount_percent }}%</td>
                                <td v-if="canManage" class="is-actions">
                                    <Button size="sm" variant="ghost" icon="pencil" :disabled="Boolean(editing)" @click="edit(tier)">
                                        {{ t('cms.points.tiers.edit') }}
                                    </Button>
                                    <Button size="sm" variant="danger-quiet" icon="trash" :disabled="Boolean(editing)" @click="remove(tier)">
                                        {{ t('common.delete') }}
                                    </Button>
                                </td>
                            </template>
                        </tr>

                        <tr v-if="editing === 'new'">
                            <td><Input v-model="draft.name" :placeholder="t('cms.points.tiers.name')" /></td>
                            <td class="is-num"><Input v-model="draft.threshold" type="number" placeholder="10000" /></td>
                            <td class="is-num"><Input v-model="draft.discount_percent" type="number" placeholder="5" /></td>
                            <td class="is-actions">
                                <Button size="sm" :disabled="savingTier" @click="submitTier">{{ t('cms.points.tiers.create') }}</Button>
                                <Button size="sm" variant="ghost" :disabled="savingTier" @click="cancel">{{ t('common.cancel') }}</Button>
                            </td>
                        </tr>

                        <tr v-if="!tiers.length && editing !== 'new'">
                            <td :colspan="canManage ? 4 : 3" class="is-empty">{{ t('cms.points.tiers.empty') }}</td>
                        </tr>
                    </tbody>
                </table>
            </section>

            <section class="tm-cms-points__card">
                <div class="tm-cms-points__card-head">
                    <div>
                        <h2 class="tm-cms-points__card-title">{{ t('cms.points.rates.title') }}</h2>
                        <p class="tm-cms-points__card-lead">{{ t('cms.points.rates.lead') }}</p>
                    </div>
                </div>

                <form class="tm-cms-points__rates" novalidate @submit.prevent="submitRates">
                    <Input
                        v-for="currency in POINTS_CURRENCIES" :key="currency"
                        v-model="rates[currency]"
                        type="number"
                        :label="t('cms.points.rates.per', { currency })"
                        :disabled="!canManage"
                    />

                    <Button v-if="canManage" type="submit" :disabled="savingRates">
                        {{ savingRates ? t('cms.saving') : t('cms.save') }}
                    </Button>
                </form>

                <p class="tm-cms-points__example">{{ t('cms.points.rates.example', { points: points(example) }) }}</p>
            </section>
        </template>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import TierBadge from '~/modules/points/components/tierBadge/TierBadge.vue'
import { POINTS_CURRENCIES } from '~/modules/points/contracts/points'
import { usePoints } from './Points.hooks'

const { t, locale } = useI18n()

const {
    status, tiers, canManage,
    rates, savingRates, submitRates,
    editing, draft, savingTier, edit, cancel, submitTier, remove,
} = usePoints()

const points = (value: number): string => value.toLocaleString(locale.value)

const example = computed(() => Math.round(1000 * (Number(rates.USD) || 0)))

useSeoMeta({ title: () => t('cms.points.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_points.scss';
</style>
