<script setup lang="ts">
// SPA-only route: routeRules sets ssr:false for /app/**, so this never
// renders on the server. Nothing here is indexable and nothing should be.
useHead({ title: 'TripMe — рабочее место агента' })
</script>

<template>
  <div class="stub">
    <img src="/tripme-logo.png" alt="TripMe" width="150" height="55">
    <h1>Рабочее место агента</h1>
    <p>
      Здесь будет CRM: поиск, карточки клиентов, предложения.
      Этот маршрут отдаётся как SPA — <code>ssr: false</code> в <code>routeRules</code>,
      потому что за логином индексировать нечего.
    </p>
    <NuxtLink to="/" class="back">← На главную</NuxtLink>
  </div>
</template>

<style scoped>
.stub{min-height:80vh;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:14px;text-align:center;padding:40px}
.stub h1{font-size:26px}
.stub p{color:var(--ink-3);max-width:440px;font-size:15px}
.stub code{background:var(--line-2);padding:2px 6px;border-radius:4px;font-size:13px}
.back{margin-top:12px;color:var(--or-dk);font-weight:600}
</style>
