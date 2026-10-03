<template>
    <footer class="tm-site-footer">
        <div class="container-wide tm-site-footer__directory">
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

                <NuxtLink v-if="col.more" :to="localePath(col.more.to)" class="tm-site-footer__more">
                    {{ t(col.more.labelKey) }}
                    <Icon name="arrow-right" :size="16" />
                </NuxtLink>
            </nav>
        </div>

        <div class="container-wide tm-site-footer__main">
            <div class="tm-site-footer__brand">
                <NuxtLink :to="localePath('/')" class="tm-site-footer__logo" :aria-label="BRAND_NAME">
                    <img
                        :src="BRAND_LOGO.onLight.src" :alt="BRAND_NAME"
                        :width="BRAND_LOGO.onLight.width" :height="BRAND_LOGO.onLight.height"
                    >
                </NuxtLink>

                <template v-if="socials.length">
                    <p class="tm-site-footer__heading">{{ t('footer.social') }}</p>

                    <ul class="tm-site-footer__socials">
                        <li v-for="social in socials" :key="social.id">
                            <a
                                :href="social.href" class="tm-site-footer__social"
                                target="_blank" rel="noopener"
                                :aria-label="t(social.labelKey)" :title="t(social.labelKey)"
                            >
                                <Icon :name="social.icon" :size="18" />
                            </a>
                        </li>
                    </ul>
                </template>
            </div>

            <nav class="tm-site-footer__col" :aria-label="t('footer.company')">
                <h2 class="tm-site-footer__heading">{{ t('footer.company') }}</h2>

                <component
                    :is="routeExists(link.to) ? NuxtLink : 'span'"
                    v-for="link in FOOTER_COMPANY" :key="link.to"
                    v-bind="routeExists(link.to) ? { to: localePath(link.to) } : {}"
                    class="tm-site-footer__link tm-site-footer__link--quiet"
                    :class="{ 'is-planned': !routeExists(link.to) }"
                >
                    {{ t(link.labelKey) }}
                </component>
            </nav>

            <div class="tm-site-footer__stack">
                <nav class="tm-site-footer__col" :aria-label="t('footer.legal')">
                    <h2 class="tm-site-footer__heading">{{ t('footer.legal') }}</h2>

                    <component
                        :is="routeExists(link.to) ? NuxtLink : 'span'"
                        v-for="link in FOOTER_LEGAL" :key="link.to"
                        v-bind="routeExists(link.to) ? { to: localePath(link.to) } : {}"
                        class="tm-site-footer__link tm-site-footer__link--quiet"
                        :class="{ 'is-planned': !routeExists(link.to) }"
                    >
                        {{ t(link.labelKey) }}
                    </component>
                </nav>

                <section class="tm-site-footer__payments">
                    <h2 class="tm-site-footer__heading">{{ t('footer.payments.title') }}</h2>
                    <p class="tm-site-footer__note">{{ t('footer.payments.note') }}</p>

                    <ul class="tm-site-footer__marks">
                        <li v-for="method in PAYMENT_METHODS" :key="method.id" class="tm-site-footer__mark">
                            <img v-if="method.image" :src="method.image" :alt="method.label" height="20">
                            <span v-else>{{ method.label }}</span>
                        </li>
                    </ul>
                </section>
            </div>

            <address class="tm-site-footer__contacts">
                <h2 class="tm-site-footer__heading">{{ t('footer.contactUs') }}</h2>

                <a :href="`tel:${phoneHref}`" class="tm-site-footer__contact tm-site-footer__contact--loud">
                    <Icon name="phone" :size="16" />{{ t('contact.channels.phoneValue') }}
                </a>

                <a :href="`mailto:${email}`" class="tm-site-footer__contact">
                    <Icon name="mail" :size="16" />{{ email }}
                </a>

                <p class="tm-site-footer__contact">
                    <Icon name="pin" :size="16" />{{ t('contact.channels.officeValue') }}
                </p>

                <p class="tm-site-footer__contact">
                    <Icon name="clock" :size="16" />{{ t('footer.hours') }}
                </p>
            </address>
        </div>

        <div class="tm-site-footer__legalbar">
            <div class="container-wide tm-site-footer__legalbar-inner">
                <span v-if="entity" class="tm-site-footer__entity">{{ entity }}</span>
                <span class="tm-site-footer__copyright">{{ t('footer.copyright', { year }) }}</span>
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
import { NuxtLink } from '#components'
import { BRAND_LOGO, BRAND_NAME } from '~/shared/config/brand'
import {
  FOOTER_COLUMNS, FOOTER_COMPANY, FOOTER_LEGAL, FOOTER_SOCIALS, PAYMENT_METHODS,
} from './SiteFooter.config'

const { t } = useI18n()
const localePath = useLocalePath()
const routeExists = useRouteExists()

const year = new Date().getFullYear()

const socials = computed(() => FOOTER_SOCIALS.filter(social => social.href))

const email = computed(() => t('contact.channels.emailValue'))

const phoneHref = computed(() => t('contact.channels.phoneValue').replace(/[^\d+]/g, ''))

const entity = computed(() => t('footer.entity').trim())
</script>

<style lang="scss">
@use './_site-footer.scss';
</style>
