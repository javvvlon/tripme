<template>
    <form class="tm-esim-search" @submit.prevent="submit">
        <Combobox
            v-model="country"
            :label="t('esim.where')" :placeholder="t('esim.wherePlaceholder')"
            :options="options" :loading="loading"
            icon="globe" variant="panel" clearable
        />

        <Button type="submit" size="lg" class="tm-esim-search__submit">
            {{ t('esim.showPlans') }}
        </Button>
    </form>
</template>

<script setup lang="ts">
import { useEsimSearch } from './EsimSearch.hooks'

const { t } = useI18n()

const { country, options, loading, submit } = useEsimSearch()
</script>

<style lang="scss">
@use './_esim-search.scss';
</style>
