<template>
    <footer class="tm-site-footer">
        <div class="container-wide tm-site-footer__columns">
            <nav
                v-for="col in FOOTER_COLUMNS" :key="col.titleKey"
                class="tm-site-footer__col" :aria-label="t(col.titleKey)"
            >
                <h2 class="tm-site-footer__heading">{{ t(col.titleKey) }}</h2>

                <component
                    :is="routeExists(link.to) ? NuxtLink : 'span'"
                    v-for="link in col.links" :key="link.to"
                    v-bind="routeExists(link.to) ? { to: localePath(link.to) } : {}"
                    class="tm-site-footer__link"
                    :class="{ 'is-planned': !routeExists(link.to) }"
                >
                    {{ t(link.labelKey) }}
                </component>

                <NuxtLink
                    v-if="'more' in col"
                    :to="localePath(col.more.to)" class="tm-site-footer__more"
                >
                    {{ t(col.more.labelKey) }}
                    <Icon name="arrow-right" :size="16" />
                </NuxtLink>
            </nav>


            <!--
                Legal keeps the last column of the five even though the two
                before it are empty: the design's rhythm comes from where the
                columns sit, and pulling this one leftward would close a gap
                that is deliberate.
            -->
            <nav class="tm-site-footer__col tm-site-footer__col--last" :aria-label="t('footer.legal')">
                <h2 class="tm-site-footer__heading">{{ t('footer.legal') }}</h2>
                <component
                    :is="routeExists(l.to) ? NuxtLink : 'span'"
                    v-for="l in FOOTER_LEGAL" :key="l.to"
                    v-bind="routeExists(l.to) ? { to: localePath(l.to) } : {}"
                    class="tm-site-footer__link"
                    :class="{ 'is-planned': !routeExists(l.to) }"
                >
                    {{ t(l.labelKey) }}
                </component>
            </nav>
        </div>

        <div class="container-wide tm-site-footer__bottom">
            <NuxtLink :to="localePath('/')" class="tm-site-footer__logo" :aria-label="BRAND_NAME">
                <img
                    :src="BRAND_LOGO.onLight.src" :alt="BRAND_NAME"
                    :width="BRAND_LOGO.onLight.width" :height="BRAND_LOGO.onLight.height"
                >
            </NuxtLink>

            <span class="tm-site-footer__copyright">{{ t('footer.copyright', { year }) }}</span>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { BRAND_LOGO, BRAND_NAME } from '~/shared/config/brand'
import { FOOTER_COLUMNS, FOOTER_LEGAL } from './SiteFooter.config'

const { t } = useI18n()
const localePath = useLocalePath()
const routeExists = useRouteExists()

const year = new Date().getFullYear()
</script>

<style lang="scss">
@use './_site-footer.scss';
</style>
