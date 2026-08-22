<script setup lang="ts">
const nav = [
  { href: '#how',     label: 'Как это работает' },
  { href: '#what',    label: 'Что вы получаете' },
  { href: '#pricing', label: 'Сколько стоит' },
  { href: '#faq',     label: 'Вопросы' },
]
const open = ref(false)
</script>

<template>
  <div class="shell">
    <header class="hdr">
      <div class="wrap inner">
        <NuxtLink to="/" class="logo" aria-label="TripMe — на главную">
          <img src="/tripme-logo.png" alt="TripMe" width="132" height="48">
        </NuxtLink>

        <nav class="nav" :class="{ open }" aria-label="Основная навигация">
          <a v-for="i in nav" :key="i.href" :href="i.href" @click="open = false">{{ i.label }}</a>
        </nav>

        <a href="#apply" class="btn cta">Оставить заявку</a>

        <button class="burger" :aria-expanded="open" aria-label="Меню" @click="open = !open">
          <span /><span /><span />
        </button>
      </div>
    </header>

    <main><slot /></main>

    <footer class="ftr">
      <div class="wrap fin">
        <div>
          <img src="/tripme-logo.png" alt="TripMe" width="118" height="43">
          <p class="fnote">
            Единая система поиска туров для агентов.<br>
            Ташкент, Узбекистан
          </p>
        </div>
        <div class="fcols">
          <div>
            <h4>Платформа</h4>
            <a v-for="i in nav" :key="i.href" :href="i.href">{{ i.label }}</a>
          </div>
          <div>
            <h4>Контакты</h4>
            <a href="mailto:agents@tripme.uz">agents@tripme.uz</a>
            <a href="https://t.me/tripme_uz" rel="noopener">Telegram</a>
          </div>
        </div>
      </div>
      <div class="wrap fbot">
        <span>© {{ new Date().getFullYear() }} TripMe · tourism company</span>
        <span class="muted">Прототип — цифры и условия не финальные</span>
      </div>
    </footer>
  </div>
</template>

<style scoped>
.shell{display:flex;flex-direction:column;min-height:100vh}
main{flex:1}

.hdr{position:sticky;top:0;z-index:50;background:rgba(255,255,255,.92);
  backdrop-filter:saturate(150%) blur(10px);border-bottom:1px solid var(--line)}
.inner{display:flex;align-items:center;gap:28px;height:70px}
.logo img{width:118px;height:auto}
.logo{filter:invert(1) brightness(.16)}
.nav{display:flex;gap:26px;font-size:14.5px;font-weight:500;color:var(--ink-2)}
.nav a:hover{color:var(--or-dk)}
.cta{margin-left:auto;padding:10px 20px;font-size:14.5px}
.burger{display:none;flex-direction:column;gap:4px;padding:8px}
.burger span{width:20px;height:2px;background:var(--ink);border-radius:2px}

@media(max-width:860px){
  .nav{position:absolute;top:70px;left:0;right:0;background:#fff;flex-direction:column;
    gap:0;padding:0 24px;border-bottom:1px solid var(--line);max-height:0;overflow:hidden;
    transition:max-height .25s}
  .nav.open{max-height:280px;padding:8px 24px 18px}
  .nav a{padding:11px 0}
  .cta{margin-left:auto;order:2}
  .burger{display:flex;order:3}
}

.ftr{background:var(--night);color:#9AA3AF;padding:56px 0 24px;margin-top:auto}
.fin{display:flex;gap:56px;flex-wrap:wrap;padding-bottom:34px}
.fnote{margin-top:14px;font-size:14px;line-height:1.6}
.fcols{display:flex;gap:64px;margin-left:auto;flex-wrap:wrap}
.fcols h4{color:#E4E8ED;font-size:13px;font-weight:700;margin-bottom:12px;
  text-transform:uppercase;letter-spacing:.07em}
.fcols a{display:block;font-size:14px;padding:5px 0}
.fcols a:hover{color:var(--or)}
.fbot{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;
  border-top:1px solid #1D222A;padding-top:20px;font-size:13px}
.fbot .muted{color:#6B7482}
</style>
