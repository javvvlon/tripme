<script setup lang="ts">
const form = reactive({ name: '', phone: '', city: 'Ташкент', experience: '1-3', providers: '', agree: false })
const state = ref<'idle' | 'sending' | 'done' | 'error'>('idle')
const error = ref('')

async function submit() {
  error.value = ''
  if (!form.name.trim() || !form.phone.trim()) { error.value = 'Заполните имя и телефон.'; return }
  if (!form.agree) { error.value = 'Нужно согласие на обработку данных.'; return }
  state.value = 'sending'
  try {
    await $fetch('/api/apply', { method: 'POST', body: { ...form } })
    state.value = 'done'
  } catch {
    state.value = 'error'
    error.value = 'Не удалось отправить. Напишите нам в Telegram — так быстрее.'
  }
}
</script>

<template>
  <section class="apply">
    <div class="wrap ain">
      <div class="acopy">
        <span class="eyebrow light">Заявка</span>
        <h2>Попробовать в работе</h2>
        <p class="lead">
          Закрытый запуск, поэтому доступ открываем вручную. Обычно отвечаем в тот же день.
          Никаких обязательств: не подойдёт — просто перестанете пользоваться.
        </p>
        <p class="acontact">
          Или сразу в Telegram: <a href="https://t.me/tripme_uz" rel="noopener">@tripme_uz</a>
        </p>
      </div>

      <div class="acard">
        <form v-if="state !== 'done'" novalidate @submit.prevent="submit">
          <div class="f">
            <label for="af-name">Как вас зовут <span aria-hidden="true">*</span></label>
            <input id="af-name" v-model="form.name" autocomplete="name" required>
          </div>
          <div class="f">
            <label for="af-phone">Телефон или Telegram <span aria-hidden="true">*</span></label>
            <input id="af-phone" v-model="form.phone" placeholder="+998 __ ___ __ __" autocomplete="tel" required>
          </div>
          <div class="frow">
            <div class="f">
              <label for="af-city">Город</label>
              <select id="af-city" v-model="form.city">
                <option>Ташкент</option><option>Самарканд</option><option>Бухара</option>
                <option>Фергана</option><option>Другой</option>
              </select>
            </div>
            <div class="f">
              <label for="af-exp">Опыт в туризме</label>
              <select id="af-exp" v-model="form.experience">
                <option value="0-1">меньше года</option>
                <option value="1-3">1–3 года</option>
                <option value="3+">больше 3 лет</option>
              </select>
            </div>
          </div>
          <div class="f">
            <label for="af-prov">С какими операторами работаете</label>
            <input id="af-prov" v-model="form.providers" placeholder="например ANEX, Kompas, Coral">
            <span class="hint">Поможет понять, что подключать в первую очередь</span>
          </div>

          <label class="agree">
            <input v-model="form.agree" type="checkbox">
            <span>Согласен на обработку имени и контакта для связи по этой заявке</span>
          </label>

          <p v-if="error" class="err" role="alert">{{ error }}</p>
          <button class="btn lg full" type="submit" :disabled="state === 'sending'">
            {{ state === 'sending' ? 'Отправляем…' : 'Отправить заявку' }}
          </button>
        </form>

        <div v-else class="done" role="status">
          <span class="dmark" aria-hidden="true">✓</span>
          <h3>Заявка отправлена</h3>
          <p>Свяжемся с вами по указанному контакту. Если срочно — напишите в Telegram.</p>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.apply{background:var(--night);color:#fff}
.ain{display:grid;grid-template-columns:1fr 1fr;gap:56px;align-items:center}
@media(max-width:900px){.ain{grid-template-columns:1fr;gap:36px}}
.acopy h2{color:#fff;margin:10px 0 16px}
.acopy .lead{color:#B9C0CA;max-width:440px}
.eyebrow.light{color:var(--or)}
.acontact{margin-top:20px;font-size:14.5px;color:#8C949F}
.acontact a{color:var(--or);font-weight:600}

.acard{background:#fff;color:var(--ink);border-radius:14px;padding:28px;box-shadow:0 24px 60px rgba(0,0,0,.36)}
.f{margin-bottom:15px}
.f label{display:block;font-size:12.5px;font-weight:700;color:var(--ink-3);margin-bottom:6px}
.f label span{color:var(--or)}
.f input,.f select{width:100%;padding:11px 13px;border:1px solid var(--line);border-radius:var(--rs);background:#fff}
.f input:focus,.f select:focus{outline:2px solid var(--or);outline-offset:-1px;border-color:transparent}
.hint{display:block;margin-top:5px;font-size:12px;color:var(--ink-4)}
.frow{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.agree{display:flex;gap:9px;align-items:flex-start;font-size:13px;color:var(--ink-2);margin:6px 0 16px}
.agree input{width:16px;height:16px;accent-color:var(--or);margin-top:2px;flex:none}
.err{color:#A32B2B;background:#FDF0F0;border:1px solid #E9BDBD;border-radius:var(--rs);
  padding:9px 12px;font-size:13.5px;margin-bottom:12px}
.full{width:100%}
.done{text-align:center;padding:28px 8px}
.dmark{display:inline-flex;align-items:center;justify-content:center;width:52px;height:52px;
  border-radius:50%;background:var(--ok-bg);color:var(--ok);font-size:24px;font-weight:800;margin-bottom:14px}
.done h3{margin-bottom:8px}
.done p{color:var(--ink-2);font-size:14.5px}
</style>
