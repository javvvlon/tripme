<template>
    <div class="tm-ad-studio">
        <NuxtLink :to="backTo" class="tm-ad-studio__back">
            <Icon name="chevron-left" :size="16" />{{ t('cms.marketing.back') }}
        </NuxtLink>

        <EditorSkeleton v-if="status === 'pending' && !selection" variant="form" />

        <p v-else-if="!selection" class="tm-ad-studio__empty">{{ t('cms.marketing.missing') }}</p>

        <template v-else>
            <header class="tm-ad-studio__head">
                <div class="tm-ad-studio__heading">
                    <input
                        v-model="title"
                        class="tm-ad-studio__title"
                        :aria-label="t('cms.marketing.fields.title')"
                        maxlength="120"
                        @blur="saveTitle"
                        @keydown.enter="($event.target as HTMLInputElement).blur()"
                    >
                    <p class="tm-ad-studio__sub">
                        <span class="tm-ad-studio__code">{{ selection.code }}</span>
                        <span v-if="selection.author">{{ selection.author }}</span>
                        <span :class="{ 'tm-ad-studio__leads': selection.leads }">{{ t('cms.marketing.leads', { n: selection.leads }) }}</span>
                        <span v-if="selection.published.length">{{ t('cms.marketing.postedTimes', { n: selection.published.length }) }}</span>
                    </p>
                </div>

                <div class="tm-ad-studio__head-actions">
                    <Tabs v-model="language" :items="languageItems" variant="segment" :aria-label="t('cms.marketing.language')" />
                    <Button :href="link" target="_blank" rel="noopener" size="sm" variant="secondary" icon="arrow-up-right">{{ t('cms.marketing.open') }}</Button>
                    <MoreMenu v-if="moreItems.length" :label="t('cms.more')" :items="moreItems" @select="onMore" />
                </div>
            </header>

            <section v-if="selection.archived_at" class="tm-cms-archived" role="status">
                <Icon name="folder" :size="18" />
                <span>{{ t('cms.marketing.archivedSince', { date: day(selection.archived_at) }) }}</span>
                <Button type="button" size="sm" variant="secondary" icon="undo" :loading="busy === 'archive'" @click="restore">{{ t('cms.marketing.restore') }}</Button>
            </section>

            <div class="tm-ad-studio__body">
                <section class="tm-ad-studio__stage" :aria-label="t('cms.marketing.preview')">
                    <div v-if="panel === 'image' || panel === 'tours' || panel === 'video'" class="tm-ad-studio__formats">
                        <button
                            v-for="item in formatItems" :key="item.value"
                            type="button"
                            class="tm-ad-studio__format"
                            :class="[`is-${item.value}`, { 'is-on': format === item.value }]"
                            :aria-pressed="format === item.value"
                            @click="format = item.value"
                        >
                            <span class="tm-ad-studio__format-shape" aria-hidden="true" />
                            {{ item.label }}
                        </button>
                    </div>

                    <div class="tm-ad-studio__artboard" :class="`is-${panel}`">
                        <div v-if="panel === 'video'" class="tm-ad-studio__frame" :class="`is-${format}`">
                            <VideoStage ref="stage" :spec="motionSpec" :mood="design.mood" />
                            <Transition name="tm-ad-render">
                                <div v-if="busy === 'video'" class="tm-ad-studio__render" role="status">
                                    <div class="tm-ad-studio__render-card">
                                        <Icon name="film" :size="22" />
                                        <strong>{{ t('cms.marketing.video.rendering') }}</strong>
                                        <span class="tm-ad-studio__render-track"><span :style="{ width: `${Math.round(videoProgress * 100)}%` }" /></span>
                                        <span class="tm-ad-studio__render-note">{{ Math.round(videoProgress * 100) }}% · {{ t('cms.marketing.video.renderNote') }}</span>
                                    </div>
                                </div>
                            </Transition>
                        </div>

                        <AiGlow v-else-if="panel !== 'post' && panel !== 'page'" :active="busy === 'write' || busy === 'paint' || busy === 'templates'" class="tm-ad-studio__frame" :class="`is-${format}`">
                            <BannerCanvas :spec="spec" />
                            <AiProgress
                                :active="busy === 'write'"
                                :title="t('cms.marketing.steps.write.title')"
                                :note="t('cms.marketing.steps.write.note')"
                                :steps="writeSteps"
                                :pace="1100"
                            />
                            <AiProgress
                                :active="busy === 'templates'"
                                :title="t('cms.marketing.steps.templates.title')"
                                :note="t('cms.marketing.steps.templates.note')"
                                :steps="templateSteps"
                                :pace="900"
                            />
                            <AiProgress
                                :active="busy === 'paint'"
                                :title="t('cms.marketing.steps.paint.title')"
                                :note="t('cms.marketing.steps.paint.note')"
                                :steps="paintSteps"
                                :pace="5000"
                            />
                        </AiGlow>

                        <TelegramPreview
                            v-else-if="panel === 'post'"
                            :image="telegramImage"
                            :caption="post"
                            :buttons="buttons"
                            :channel="settings?.telegram.channel || 'TripMe'"
                        />

                        <div v-else class="tm-ad-studio__page">
                            <span class="tm-ad-studio__page-url">{{ link }}</span>
                            <div class="tm-ad-studio__page-hero" :style="selection.background && design.backdrop === 'photo' ? { backgroundImage: `url(${selection.background.url})` } : undefined">
                                <span v-if="draft[language].kicker" class="tm-ad-studio__page-kicker">{{ draft[language].kicker }}</span>
                                <strong>{{ draft[language].headline }}</strong>
                                <span>{{ draft[language].intro }}</span>
                            </div>
                            <ul class="tm-ad-studio__page-tours">
                                <li v-for="tour in selection.tours" :key="tour.offer_id" :class="{ 'is-gone': tour.check_state === 'gone' }">
                                    <span>{{ hotelOf(tour) }}</span>
                                    <strong>{{ priceOf(tour) }}</strong>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div class="tm-ad-studio__actions">
                        <template v-if="panel === 'post'">
                            <Button
                                icon="telegram"
                                :loading="busy === 'publish'"
                                :disabled="!settings?.telegram.connected || Boolean(busy)"
                                :title="settings?.telegram.connected ? undefined : t('cms.marketing.botOff')"
                                @click="publish"
                            >
                                {{ t('cms.marketing.publish') }}
                            </Button>
                            <Button variant="secondary" icon="copy" :disabled="!post" @click="copy(post)">{{ t('cms.marketing.copyPost') }}</Button>
                        </template>
                        <template v-else-if="panel === 'video'">
                            <Button icon="upload" :loading="busy === 'video'" :disabled="!videoReady || Boolean(busy)" @click="renderThen(downloadVideo)">{{ t('cms.marketing.video.download') }}</Button>
                            <Button
                                variant="secondary"
                                icon="telegram"
                                :loading="busy === 'publish'"
                                :disabled="!videoReady || !settings?.telegram.connected || Boolean(busy)"
                                :title="settings?.telegram.connected ? undefined : t('cms.marketing.botOff')"
                                @click="renderThen(publishVideo)"
                            >
                                {{ t('cms.marketing.video.publish') }}
                            </Button>
                        </template>
                        <template v-else-if="panel === 'page'">
                            <Button :href="link" target="_blank" rel="noopener" icon="arrow-up-right">{{ t('cms.marketing.open') }}</Button>
                            <Button variant="secondary" icon="copy" @click="copy(link)">{{ t('cms.marketing.copy') }}</Button>
                        </template>
                        <template v-else>
                            <Button icon="upload" :disabled="Boolean(busy)" @click="downloadOne()">{{ t('cms.marketing.downloadFormat', { format: t(`cms.marketing.formatShort.${format}`) }) }}</Button>
                            <Button variant="secondary" :loading="busy === 'download'" :disabled="Boolean(busy)" @click="downloadAll">{{ t('cms.marketing.downloadAll') }}</Button>
                        </template>
                    </div>
                </section>

                <aside class="tm-ad-studio__inspector">
                    <Tabs v-model="panel" :items="panelItems" variant="segment" :aria-label="t('cms.marketing.title')" class="tm-ad-studio__panels" />

                    <div v-show="panel === 'image'" class="tm-ad-studio__panel">
                        <div class="tm-ad-studio__ai-card">
                            <span class="tm-ad-studio__ai-icon" aria-hidden="true">
                                <svg viewBox="0 0 24 24"><path d="M12 2c.6 4.6 2.4 7.4 7 8-4.6.6-6.4 3.4-7 8-.6-4.6-2.4-7.4-7-8 4.6-.6 6.4-3.4 7-8Z" /></svg>
                            </span>
                            <div>
                                <strong>{{ t('cms.marketing.aiCard.title') }}</strong>
                                <span>{{ t('cms.marketing.aiCard.sub') }}</span>
                            </div>
                            <button type="button" class="tm-ad-studio__ai-link" @click="openSettings('voice')">{{ t('cms.marketing.settings.voice') }}</button>
                        </div>

                        <VariantCards
                            :variants="variants"
                            :current="draft[language]"
                            :busy="busy === 'write'"
                            :ai="selection.ai"
                            :generation="generation"
                            @pick="pick"
                            @generate="write"
                        />

                        <section class="tm-ad-studio__block">
                            <div class="tm-ad-studio__label-row">
                                <h3 class="tm-ad-studio__label">{{ t('cms.marketing.sections.templates') }}</h3>
                                <Button
                                    size="sm" icon="layers"
                                    :loading="busy === 'templates'"
                                    :disabled="!selection.ai || Boolean(busy)"
                                    :title="selection.ai ? undefined : t('cms.marketing.aiOff')"
                                    @click="designTemplates"
                                >
                                    {{ busy === 'templates' ? t('cms.marketing.templates.designing') : t('cms.marketing.templates.generate') }}
                                </Button>
                            </div>

                            <div class="tm-ad-studio__styles">
                                <button
                                    v-for="thumb in thumbs" :key="thumb.style"
                                    type="button"
                                    class="tm-ad-studio__style"
                                    :class="{ 'is-on': selection.style === thumb.style }"
                                    :aria-pressed="selection.style === thumb.style"
                                    @click="setStyle(thumb.style)"
                                >
                                    <span class="tm-ad-studio__style-art"><BannerCanvas :spec="thumb.spec" /></span>
                                    <span>{{ t(`cms.marketing.styles.${thumb.style}`) }}</span>
                                </button>
                            </div>

                            <template v-if="drafts.length || busy === 'templates'">
                                <span class="tm-ad-studio__sublabel">{{ t('cms.marketing.templates.fresh') }}</span>
                                <AiGlow :active="busy === 'templates'" :label="t('cms.marketing.templates.designing')" class="tm-ad-studio__glow">
                                    <div v-if="busy === 'templates'" class="tm-ad-studio__styles is-four">
                                        <span v-for="n in 4" :key="n" class="tm-ad-studio__style is-ghost" :style="{ '--delay': `${n * 120}ms` }" />
                                    </div>
                                    <TransitionGroup v-else :key="templateGeneration" tag="div" class="tm-ad-studio__styles is-four" name="tm-variant" appear>
                                        <div
                                            v-for="(draft, index) in drafts" :key="`${templateGeneration}-${index}`"
                                            class="tm-ad-studio__style"
                                            :class="{ 'is-on': isApplied(draft.template) }"
                                            :style="{ '--delay': `${index * 90}ms` }"
                                        >
                                            <button type="button" class="tm-ad-studio__style-art" :aria-label="draft.template.name" @click="applyTemplate(draft.template)">
                                                <BannerCanvas :spec="draft.spec" />
                                            </button>
                                            <span class="tm-ad-studio__style-foot">
                                                <span>{{ draft.template.name }}</span>
                                                <IconButton
                                                    :icon="isSaved(draft.template) ? 'check' : 'plus'"
                                                    :label="t('cms.marketing.templates.keep')"
                                                    :disabled="isSaved(draft.template)"
                                                    @click="keepTemplate(draft.template)"
                                                />
                                            </span>
                                        </div>
                                    </TransitionGroup>
                                </AiGlow>
                            </template>

                            <template v-if="savedStyles.length">
                                <span class="tm-ad-studio__sublabel">{{ t('cms.marketing.templates.mine') }}</span>
                                <div class="tm-ad-studio__styles is-four">
                                    <div
                                        v-for="item in savedStyles" :key="item.id"
                                        class="tm-ad-studio__style"
                                        :class="{ 'is-on': isApplied(item.spec) }"
                                    >
                                        <button type="button" class="tm-ad-studio__style-art" :aria-label="item.name" @click="applyTemplate(item.spec)">
                                            <BannerCanvas :spec="item.thumb" />
                                        </button>
                                        <span class="tm-ad-studio__style-foot">
                                            <span>{{ item.name }}</span>
                                            <IconButton icon="folder" :label="t('cms.marketing.archive')" @click="dropTemplate(item)" />
                                        </span>
                                    </div>
                                </div>
                            </template>
                        </section>

                        <section class="tm-ad-studio__block">
                            <h3 class="tm-ad-studio__label">{{ t('cms.marketing.sections.mode') }}</h3>
                            <SelectMenu
                                :model-value="design.hotel"
                                :options="hotelOptions"
                                class="tm-ad-studio__select"
                                @update:model-value="tune({ hotel: String($event) })"
                            />
                        </section>

                        <section class="tm-ad-studio__block">
                            <div class="tm-ad-studio__label-row">
                                <h3 class="tm-ad-studio__label">{{ t('cms.marketing.background') }}</h3>
                                <span v-if="imageBlocked" class="tm-ad-studio__blocked">{{ imageBlocked }}</span>
                            </div>

                            <div class="tm-ad-studio__backdrops">
                                <button
                                    v-for="kind in contextBackdrops" :key="`${kind}-${sceneKind}-${place}`"
                                    type="button"
                                    class="tm-ad-studio__backdrop"
                                    :class="{ 'is-on': design.backdrop === kind }"
                                    :aria-pressed="design.backdrop === kind"
                                    @click="setBackdrop(kind)"
                                >
                                    <canvas :ref="(el) => drawSwatch(el, kind)" />
                                    <span>{{ kind === 'scene' ? t(`cms.marketing.scenes.${sceneKind}`) : t(`cms.marketing.backdrops.${kind}`) }}</span>
                                </button>

                                <button
                                    v-for="file in libraryPhotos" :key="file.url"
                                    type="button"
                                    class="tm-ad-studio__backdrop is-photo"
                                    :class="{ 'is-on': design.backdrop === 'photo' && selection.background?.url === file.url }"
                                    :style="{ backgroundImage: `url(${file.url})` }"
                                    :title="file.title"
                                    @click="useBackground(file.url)"
                                >
                                    <span>{{ t('cms.marketing.backdrops.library') }}</span>
                                </button>

                                <button
                                    v-for="item in selection.backgrounds" :key="item.url"
                                    type="button"
                                    class="tm-ad-studio__backdrop is-photo"
                                    :class="{ 'is-on': design.backdrop === 'photo' && selection.background?.url === item.url }"
                                    :style="{ backgroundImage: `url(${item.url})` }"
                                    @click="useBackground(item.url)"
                                >
                                    <span>{{ item.model ? t('cms.marketing.backdrops.ai') : t('cms.marketing.backdrops.photo') }}</span>
                                </button>

                                <AiGlow :active="busy === 'paint'" class="tm-ad-studio__backdrop-glow">
                                    <button
                                        type="button"
                                        class="tm-ad-studio__backdrop is-action"
                                        :disabled="!selection.ai || Boolean(busy)"
                                        @click="paint"
                                    >
                                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c.6 4.6 2.4 7.4 7 8-4.6.6-6.4 3.4-7 8-.6-4.6-2.4-7.4-7-8 4.6-.6 6.4-3.4 7-8Z" /></svg>
                                        <span>{{ t('cms.marketing.backdrops.generate') }}</span>
                                    </button>
                                </AiGlow>

                                <button type="button" class="tm-ad-studio__backdrop is-action" :disabled="Boolean(busy)" @click="pickBackground">
                                    <Icon name="folder" :size="20" />
                                    <span>{{ t('cms.marketing.pick') }}</span>
                                </button>
                            </div>
                        </section>

                        <section class="tm-ad-studio__block">
                            <h3 class="tm-ad-studio__label">{{ t('cms.marketing.sections.texts') }}</h3>
                            <div class="tm-ad-studio__fields">
                                <div class="tm-ad-studio__pair">
                                    <Input v-model="draft[language].kicker" :label="t('cms.marketing.fields.kicker')" dense @update:model-value="edited()" />
                                    <Input v-model="draft[language].cta" :label="t('cms.marketing.fields.cta')" dense @update:model-value="edited()" />
                                </div>
                                <Input v-model="draft[language].headline" :label="t('cms.marketing.fields.headline')" dense @update:model-value="edited()" />
                            </div>
                        </section>

                        <details class="tm-ad-studio__tune">
                            <summary>{{ t('cms.marketing.sections.tune') }}</summary>

                            <div class="tm-ad-studio__tune-body">
                                <label v-if="design.backdrop === 'photo'" class="tm-ad-studio__range">
                                    <span>{{ t('cms.marketing.tune.dim') }} <em>{{ design.dim }}%</em></span>
                                    <input type="range" min="0" max="90" step="5" :value="design.dim" @input="tune({ dim: Number(($event.target as HTMLInputElement).value) })">
                                </label>
                                <label v-if="design.backdrop === 'photo'" class="tm-ad-studio__range">
                                    <span>{{ t('cms.marketing.tune.focus') }} <em>{{ design.focus }}%</em></span>
                                    <input type="range" min="0" max="100" step="5" :value="design.focus" @input="tune({ focus: Number(($event.target as HTMLInputElement).value) })">
                                </label>

                                <div class="tm-ad-studio__setting">
                                    <span>{{ t('cms.marketing.tune.rows') }}</span>
                                    <div class="tm-ad-studio__steps">
                                        <button
                                            v-for="n in 6" :key="n" type="button"
                                            :class="{ 'is-on': design.rows === n }"
                                            @click="tune({ rows: n })"
                                        >{{ n }}</button>
                                    </div>
                                </div>

                                <div class="tm-ad-studio__setting">
                                    <span>{{ t('cms.marketing.tune.price') }}</span>
                                    <div class="tm-ad-studio__steps is-wide">
                                        <button type="button" :class="{ 'is-on': design.price === 'total' }" @click="tune({ price: 'total' })">{{ t('cms.marketing.tune.total') }}</button>
                                        <button type="button" :class="{ 'is-on': design.price === 'person' }" @click="tune({ price: 'person' })">{{ t('cms.marketing.tune.person') }}</button>
                                    </div>
                                </div>

                                <label v-for="key in switches" :key="key" class="tm-ad-studio__switch">
                                    <input type="checkbox" :checked="design[key]" @change="tune({ [key]: ($event.target as HTMLInputElement).checked })">
                                    <span class="tm-ad-studio__switch-track" aria-hidden="true" />
                                    {{ t(`cms.marketing.tune.${key}`) }}
                                </label>
                            </div>
                        </details>
                    </div>

                    <div v-show="panel === 'post'" class="tm-ad-studio__panel">
                        <VariantCards
                            mode="post"
                            :variants="variants"
                            :current="draft[language]"
                            :busy="busy === 'write'"
                            :ai="selection.ai"
                            :generation="generation"
                            @pick="pick"
                            @generate="write"
                        />

                        <section class="tm-ad-studio__block">
                            <h3 class="tm-ad-studio__label">{{ t('cms.marketing.sections.postText') }}</h3>
                            <div class="tm-ad-studio__fields">
                                <Input v-model="draft[language].intro" :label="t('cms.marketing.fields.intro')" :rows="4" dense @update:model-value="edited()" />
                                <Input v-model="hashtags[language]" :label="t('cms.marketing.fields.hashtags')" dense @update:model-value="edited()" />
                            </div>
                        </section>

                        <section class="tm-ad-studio__block">
                            <h3 class="tm-ad-studio__label">{{ t('cms.marketing.sections.buttons') }}</h3>
                            <div class="tm-ad-studio__steps is-wide">
                                <button
                                    v-for="item in buttonItems" :key="item.value" type="button"
                                    :class="{ 'is-on': design.buttons === item.value }"
                                    @click="setButtons(item.value)"
                                >{{ item.label }}</button>
                            </div>

                            <div v-if="withManagers" class="tm-ad-studio__managers">
                                <button
                                    v-for="contact in settings?.contacts ?? []" :key="contact.id"
                                    type="button"
                                    class="tm-ad-studio__chip"
                                    :class="{ 'is-on': selection.contacts.includes(contact.id) }"
                                    :aria-pressed="selection.contacts.includes(contact.id)"
                                    @click="toggleContact(contact)"
                                >
                                    <Icon :name="selection.contacts.includes(contact.id) ? 'check' : 'telegram'" :size="13" />
                                    {{ contact.name }}
                                </button>
                                <button type="button" class="tm-ad-studio__chip is-add" @click="openSettings('managers')">
                                    <Icon name="plus" :size="13" />{{ settings?.contacts.length ? t('cms.marketing.settings.managers') : t('cms.marketing.settings.addManager') }}
                                </button>
                            </div>
                        </section>

                        <label class="tm-ad-studio__switch">
                            <input type="checkbox" :checked="design.footer" @change="tune({ footer: ($event.target as HTMLInputElement).checked })">
                            <span class="tm-ad-studio__switch-track" aria-hidden="true" />
                            {{ t('cms.marketing.tune.footer') }}
                        </label>

                        <p v-if="!settings?.telegram.connected" class="tm-ad-studio__status">
                            <Icon name="telegram" :size="15" />{{ t('cms.marketing.botOff') }}
                        </p>

                        <ul v-if="selection.published.length" class="tm-ad-studio__history">
                            <li v-for="item in selection.published" :key="`${item.channel}-${item.message_id}`">
                                <Icon :name="item.kind === 'video' ? 'film' : 'check'" :size="13" :stroke="item.kind === 'video' ? 2 : 2.6" />
                                {{ moment(item.at) }} · {{ item.channel }} · {{ item.language.toUpperCase() }}
                            </li>
                        </ul>
                    </div>

                    <div v-show="panel === 'video'" class="tm-ad-studio__panel">
                        <section class="tm-ad-studio__block">
                            <div class="tm-ad-studio__label-row">
                                <h3 class="tm-ad-studio__label">{{ t('cms.marketing.video.mood') }}</h3>
                                <span class="tm-ad-studio__hint">{{ videoFacts }}</span>
                            </div>
                            <div class="tm-ad-studio__moods">
                                <button
                                    v-for="item in moodItems" :key="item.value"
                                    type="button"
                                    class="tm-ad-studio__mood"
                                    :class="[`is-${item.value}`, { 'is-on': design.mood === item.value }]"
                                    :aria-pressed="design.mood === item.value"
                                    @click="setMood(item.value)"
                                >
                                    <span class="tm-ad-studio__mood-wave" aria-hidden="true"><i v-for="n in 5" :key="n" /></span>
                                    <strong>{{ item.title }}</strong>
                                    <span>{{ item.sub }}</span>
                                </button>
                            </div>
                        </section>

                        <p v-if="!videoReady" class="tm-ad-studio__status">
                            <Icon name="film" :size="15" />{{ t('cms.marketing.video.unsupported') }}
                        </p>

                        <p v-else-if="!settings?.telegram.connected" class="tm-ad-studio__status">
                            <Icon name="telegram" :size="15" />{{ t('cms.marketing.botOff') }}
                        </p>
                    </div>

                    <div v-show="panel === 'page'" class="tm-ad-studio__panel">
                        <div class="tm-ad-studio__link">
                            <span class="tm-ad-studio__link-url">{{ link }}</span>
                            <Button size="sm" variant="ghost" icon="copy" @click="copy(link)">{{ t('cms.marketing.copy') }}</Button>
                        </div>
                        <dl class="tm-ad-studio__facts">
                            <div><dt>{{ t('cms.marketing.columns.leads') }}</dt><dd>{{ selection.leads }}</dd></div>
                            <div><dt>{{ t('cms.marketing.columns.tours') }}</dt><dd>{{ selection.tours.filter(tour => tour.check_state !== 'gone').length }} / {{ selection.tours.length }}</dd></div>
                            <div v-if="selection.checked_at"><dt>{{ t('cms.marketing.pricesChecked') }}</dt><dd>{{ moment(selection.checked_at) }}</dd></div>
                        </dl>
                    </div>

                    <div v-show="panel === 'tours'" class="tm-ad-studio__panel">
                        <details v-if="selection.intake" class="tm-ad-studio__source">
                            <summary>
                                <Icon :name="selection.intake.via === 'telegram' ? 'telegram' : 'doc'" :size="14" />
                                <span>{{ t('cms.marketing.intake.source', { operator: selection.intake.report.operator || selection.intake.origin || t('cms.marketing.intake.someOperator') }) }}</span>
                            </summary>
                            <pre>{{ selection.intake.text }}</pre>
                        </details>

                        <div v-if="selection.tours.some(tour => tour.source !== 'own')" class="tm-ad-studio__label-row">
                            <span class="tm-ad-studio__hint">{{ selection.checked_at ? t('cms.marketing.checkedAt', { date: moment(selection.checked_at) }) : '' }}</span>
                            <Button size="sm" variant="secondary" icon="undo" :loading="busy === 'recheck'" :disabled="Boolean(busy)" @click="recheck">
                                {{ busy === 'recheck' ? t('cms.marketing.rechecking') : t('cms.marketing.recheck') }}
                            </Button>
                        </div>

                        <ol class="tm-ad-studio__tours">
                            <li v-for="(tour, index) in selection.tours" :key="tour.offer_id" class="tm-ad-studio__tour" :class="tour.check_state ? `is-${tour.check_state}` : undefined">
                                <div class="tm-ad-studio__tour-main">
                                    <strong class="tm-ad-studio__tour-name">
                                        {{ hotelOf(tour) }}
                                        <span v-if="tour.source === 'post'" class="tm-ad-studio__tag" :title="t('cms.marketing.intake.postTip')">{{ t('cms.marketing.intake.postTag') }}</span>
                                        <span v-else-if="tour.source === 'own'" class="tm-ad-studio__tag is-own" :title="t('cms.marketing.own.tip')">{{ t('cms.marketing.own.tag') }}</span>
                                    </strong>
                                    <span class="tm-ad-studio__tour-meta">
                                        {{ day(tour.check_in) }} · {{ t('search.nights', tour.nights) }}<template v-if="tour.supplier_name"> · {{ tour.supplier_name }}</template>
                                    </span>
                                    <span v-if="tour.check_state" class="tm-ad-studio__check" :class="`is-${tour.check_state}`">
                                        {{ t(`cms.marketing.checks.${tour.check_state}`, { price: tour.check_was ? priceOf(tour, tour.check_was) : '' }) }}
                                    </span>
                                </div>
                                <span class="tm-ad-studio__tour-price">{{ priceOf(tour) }}</span>
                                <div class="tm-ad-studio__tour-actions">
                                    <IconButton icon="chevron-up" :label="t('cms.marketing.up')" :disabled="index === 0 || Boolean(busy)" @click="move(tour, -1)" />
                                    <IconButton icon="chevron" :label="t('cms.marketing.down')" :disabled="index === selection.tours.length - 1 || Boolean(busy)" @click="move(tour, 1)" />
                                    <IconButton v-if="editable(tour)" icon="pencil" :label="t('cms.marketing.own.edit')" :disabled="Boolean(busy)" @click="editLine(tour)" />
                                    <IconButton icon="close" :label="t('cms.marketing.remove')" :disabled="Boolean(busy)" @click="remove(tour)" />
                                </div>
                                <ul v-if="tour.legs?.length" class="tm-ad-studio__legs">
                                    <li v-for="leg in tour.legs" :key="leg.place">{{ leg.place }}<template v-if="leg.nights"> · {{ t('search.nights', leg.nights) }}</template><template v-if="leg.hotel"> · {{ leg.hotel }}</template></li>
                                </ul>
                                <form v-if="editing === tour.offer_id" class="tm-ad-studio__line-form" @submit.prevent="saveLine">
                                    <LineFields :form="lineForm" :error="lineError" :busy="busy === 'order'" @cancel="editing = null" />
                                </form>
                            </li>
                        </ol>

                        <form v-if="editing === 'new'" class="tm-ad-studio__line-form is-new" @submit.prevent="saveLine">
                            <LineFields :form="lineForm" :error="lineError" :busy="busy === 'order'" @cancel="editing = null" />
                        </form>
                        <Button v-else-if="selection.tours.length < 6" size="sm" variant="secondary" icon="plus" class="tm-ad-studio__add-line" :disabled="Boolean(busy)" @click="addLine">{{ t('cms.marketing.own.add') }}</Button>

                        <section class="tm-ad-studio__block">
                            <h3 class="tm-ad-studio__label">{{ t('cms.marketing.own.includes') }}</h3>
                            <div class="tm-ad-studio__managers">
                                <button
                                    v-for="key in includeKeys" :key="key"
                                    type="button"
                                    class="tm-ad-studio__chip"
                                    :class="{ 'is-on': selection.includes?.includes(key) }"
                                    :aria-pressed="selection.includes?.includes(key)"
                                    @click="toggleInclude(key)"
                                >
                                    <Icon v-if="selection.includes?.includes(key)" name="check" :size="13" />
                                    {{ t(`marketing.includes.${key}`) }}
                                </button>
                            </div>
                        </section>
                    </div>

                </aside>
            </div>

            <MarketingSettings v-model="settingsOpen" :settings="settings" :tab="settingsTab" @saved="setSettings" />
        </template>
    </div>
</template>

<script setup lang="ts">
import EditorSkeleton from '~/modules/content/components/editorSkeleton/EditorSkeleton.vue'
import Tabs from '~/shared/components/tabs/Tabs.vue'
import SelectMenu from '~/shared/components/selectMenu/SelectMenu.vue'
import BannerCanvas from '~/modules/marketing/components/bannerCanvas/BannerCanvas.vue'
import AiGlow from '~/modules/marketing/components/aiGlow/AiGlow.vue'
import AiProgress from '~/modules/marketing/components/aiProgress/AiProgress.vue'
import VariantCards from '~/modules/marketing/components/variantCards/VariantCards.vue'
import TelegramPreview from '~/modules/marketing/components/telegramPreview/TelegramPreview.vue'
import VideoStage from '~/modules/marketing/components/videoStage/VideoStage.vue'
import LineFields from '~/modules/marketing/components/lineFields/LineFields.vue'
import MarketingSettings from '~/modules/marketing/components/marketingSettings/MarketingSettings.vue'
import { swatch } from '~/modules/marketing/helpers/banner/draw'
import type { ContextBackdrop } from '~/modules/marketing/contracts/marketing'
import { useSelection } from './Selection.hooks'

const { t, locale } = useI18n()

const {
    selection, settings, status, panel, format, language, busy, generation, imageBlocked, title, design, draft, hashtags,
    spec, motionSpec, thumbs, drafts, savedStyles, templateGeneration, templateSteps, post, buttons, link, telegramImage, variants, settingsOpen, settingsTab,
    videoProgress, videoReady, videoFacts, moodItems, setMood, downloadVideo, publishVideo,
    editing, lineForm, lineError, editable, editLine, addLine, saveLine, toggleInclude, includeKeys,
    panelItems, formatItems, languageItems, buttonItems, hotelOptions, moreItems, writeSteps, paintSteps, backTo,
    contextBackdrops, place, sceneKind, libraryPhotos, withManagers,
    edited, tune, saveTitle, setStyle, setBackdrop, move, remove, recheck, write, pick, paint, useBackground, pickBackground,
    applyTemplate, designTemplates, keepTemplate, dropTemplate, isApplied, isSaved,
    restore, onMore, toggleContact, setButtons, downloadOne, downloadAll, publish, copy, openSettings, setSettings, hotelOf, priceOf,
} = useSelection()

const switches = ['caps', 'stars', 'meal', 'party', 'cta'] as const


const stage = ref<InstanceType<typeof VideoStage> | null>(null)

const renderThen = (action: () => Promise<void>) => {
    stage.value?.pause()
    void action()
}

const drawn = new WeakSet<HTMLCanvasElement>()

const drawSwatch = (el: unknown, kind: ContextBackdrop) => {
    if (!(el instanceof HTMLCanvasElement) || drawn.has(el)) return

    drawn.add(el)
    void document.fonts?.ready.then(() => swatch(el, { kind, scene: sceneKind.value, word: place.value }))
}

const day = (value: string) => new Intl.DateTimeFormat(locale.value, { day: 'numeric', month: 'short' }).format(new Date(value))

const moment = (value: string) => new Intl.DateTimeFormat(locale.value, {
    day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
}).format(new Date(value))

useSeoMeta({ title: () => selection.value?.title ?? t('cms.marketing.title'), robots: 'noindex, nofollow' })
</script>

<style lang="scss">
@use './_selection.scss';
</style>
