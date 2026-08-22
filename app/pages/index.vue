<script setup lang="ts">
const { data: offers } = await useHotOffers()

useSeoMeta({
  title: 'TripMe для агентов — один поиск вместо шести кабинетов поставщиков',
  description:
    'Платформа для турагентов-фрилансеров в Узбекистане: единый поиск туров по всем подключённым ' +
    'поставщикам, карточка клиента с несколькими направлениями и готовое предложение с вашими контактами.',
  ogTitle: 'TripMe для агентов',
  ogDescription: 'Один поиск вместо шести кабинетов. Подбор за минуты, а не за час.',
  ogImage: '/og-image.jpg',
  ogLocale: 'ru_RU',
  twitterCard: 'summary_large_image',
})

const steps = [
  { n: '01', t: 'Оставляете заявку',      d: 'Мы проверяем, что вы действующий агент, и открываем доступ. Никаких договоров на десять страниц.' },
  { n: '02', t: 'Ищете в одном окне',      d: 'Запрос уходит ко всем подключённым поставщикам сразу. Первые варианты — через несколько секунд.' },
  { n: '03', t: 'Отправляете предложение', d: 'Отмечаете подходящее — получаете аккуратный файл со своим именем и телефоном. Клиент видит вас, а не нас.' },
]

const features = [
  { i: '⌕', t: 'Один запрос — все поставщики',
    d: 'Не нужно открывать шесть кабинетов по очереди. Результаты приходят волнами, и всегда видно, кто уже ответил, а кто ещё ищет.' },
  { i: '☺', t: 'Клиент не теряется',
    d: '«А покажите Вьетнам» больше не обнуляет работу. Направления лежат рядом в одной карточке, и через три дня разговор продолжается с того же места.' },
  { i: '✉', t: 'Предложение с вашими контактами',
    d: 'Готовый файл для Telegram за одно нажатие: отели, цены, что входит, срок действия — и ваше имя как агента.' },
  { i: '⚑', t: 'Честное наличие мест',
    d: 'Туры, снятые с продажи, помечены и не выдаются за доступные. Лучше показать меньше, чем назвать цену, которую оператор не подтвердит.' },
  { i: '⇄', t: 'Ваши поставщики',
    d: 'Работаете с оператором, которого у нас нет? Скажите — подключим, если он отдаёт данные.' },
  { i: '◷', t: 'Ничего не устанавливать',
    d: 'Открывается в браузере на ноутбуке и на телефоне. Работает из офиса, из дома и из отпуска.' },
]

const faq = [
  { q: 'Я работаю сам на себя. Мне подходит?',
    a: 'Да, платформа сделана именно под таких агентов. Вы не устраиваетесь к нам на работу и не отдаёте своих клиентов — это инструмент подбора, а клиент остаётся вашим.' },
  { q: 'Кто видит моих клиентов?',
    a: 'Только вы. Карточки клиентов, контакты и история подбора закрыты от других агентов на уровне базы данных, а не галочкой в интерфейсе.' },
  { q: 'Можно ли бронировать прямо здесь?',
    a: 'Пока нет — и мы говорим об этом прямо. Вы находите тур у нас, а оформляете у оператора, как и сейчас. Бронирование появится позже: сначала нужно, чтобы поиск стал по-настоящему хорошим.' },
  { q: 'Насколько свежие цены?',
    a: 'Цены в результатах поиска ориентировочные — так устроен весь рынок. Перед тем как назвать клиенту окончательную сумму, система перепроверяет её у поставщика и честно показывает расхождение.' },
  { q: 'Сколько это стоит?',
    a: 'Оплата за использование: вы платите за поиски, а не за «место». Точные тарифы мы согласуем на этапе подключения — сейчас идёт закрытый запуск, и цифры ещё меняются.' },
]

const openFaq = ref<number | null>(0)
</script>

<template>
  <!-- ── hero ─────────────────────────────────────────────── -->
  <section class="hero">
    <div class="wrap hero-in">
      <div class="hero-copy">
        <span class="pill">Закрытый запуск · Ташкент</span>
        <h1>Один поиск<br>вместо шести<br><span class="o">кабинетов</span></h1>
        <p class="lead">
          Подбор тура по всем вашим поставщикам сразу — за минуты, а не за час.
          Клиент остаётся вашим, предложение уходит с вашим именем.
        </p>
        <div class="hero-cta">
          <a href="#apply" class="btn lg">Оставить заявку</a>
          <a href="#how" class="btn lg ghost">Как это работает</a>
        </div>
        <p class="hero-note">Доступ бесплатный на время закрытого запуска</p>
      </div>

      <div class="hero-demo" aria-hidden="true">
        <div class="dcard">
          <div class="dbar">Ташкент → Египет · 2 взрослых · 7 ночей</div>
          <div class="dchips">
            <span class="c ok">Поставщик A · 142</span>
            <span class="c ok">Поставщик B · 98</span>
            <span class="c run">Поставщик C · ищет…</span>
          </div>
          <div class="drow"><b>Albatros Aqua Park 4★</b><i>Хургада · всё включено</i><em>$1 180</em></div>
          <div class="drow"><b>Jaz Aquamarine 5★</b><i>Хургада · всё включено</i><em>$1 260</em></div>
          <div class="drow"><b>Sunrise Royal Makadi 5★</b><i>Макади-Бэй · UAI</i><em>$1 340</em></div>
          <div class="dfoot">Готово за 4 секунды</div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── problem ──────────────────────────────────────────── -->
  <section class="problem">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Знакомо?</span>
        <h2>Клиент передумал — и час работы уходит впустую</h2>
        <p class="lead">
          Вы подобрали Египет: шесть кабинетов, сорок минут. Клиент говорит «а Вьетнам?» —
          и всё начинается заново. К концу разговора цифры по Египту уже никто не помнит,
          а список вы набираете в Telegram руками.
        </p>
      </div>
      <div class="grid g3">
        <div class="pcard"><span class="pn">40 мин</span><p>на подбор одного направления по кабинетам поставщиков</p></div>
        <div class="pcard"><span class="pn">+40 мин</span><p>когда клиент просит посмотреть другое направление</p></div>
        <div class="pcard hot"><span class="pn">6 мин</span><p>тот же подбор в TripMe — вместе с готовым предложением</p></div>
      </div>
      <p class="footnote">
        Цифры — из наблюдения за работой агентов в Ташкенте. Ваши могут отличаться;
        засеките на трёх клиентах и сравните.
      </p>
    </div>
  </section>

  <!-- ── how ──────────────────────────────────────────────── -->
  <section id="how" class="how">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Как это работает</span>
        <h2>Три шага, ничего устанавливать не нужно</h2>
      </div>
      <ol class="steps grid g3">
        <li v-for="s in steps" :key="s.n" class="step">
          <span class="sn">{{ s.n }}</span>
          <h3>{{ s.t }}</h3>
          <p>{{ s.d }}</p>
        </li>
      </ol>
    </div>
  </section>

  <!-- ── features ─────────────────────────────────────────── -->
  <section id="what" class="what">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Что вы получаете</span>
        <h2>Инструмент, а не ещё одна биржа</h2>
        <p class="lead">Мы не забираем ваших клиентов и не встаём между вами и оператором.</p>
      </div>
      <div class="grid g3">
        <article v-for="f in features" :key="f.t" class="card feat">
          <span class="fi" aria-hidden="true">{{ f.i }}</span>
          <h3>{{ f.t }}</h3>
          <p>{{ f.d }}</p>
        </article>
      </div>
    </div>
  </section>

  <!-- ── offers: the composable seam ──────────────────────── -->
  <section class="offers">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Направления</span>
        <h2>Что чаще всего ищут из Ташкента</h2>
      </div>
      <div class="grid g4">
        <article v-for="o in offers" :key="o.id" class="card ocard">
          <div class="ohead">
            <h3>{{ o.country }}</h3>
            <span v-if="!o.live" class="tag">пример</span>
          </div>
          <p class="muted">{{ o.resort }} · {{ o.nights }} ночей</p>
          <p class="oprice">от {{ o.priceFrom.toLocaleString('ru-RU') }} {{ o.currency }}</p>
        </article>
      </div>
      <p class="footnote">
        Цифры на этой странице — образец. Когда подключим живые цены, здесь появятся
        актуальные — страница к этому уже готова.
      </p>
    </div>
  </section>

  <!-- ── pricing ──────────────────────────────────────────── -->
  <section id="pricing" class="pricing">
    <div class="wrap">
      <div class="sec-head">
        <span class="eyebrow">Сколько стоит</span>
        <h2>Платите за поиски, а не за «место»</h2>
      </div>
      <div class="grid g2">
        <div class="card plan">
          <span class="ptag">Закрытый запуск</span>
          <p class="pprice">Бесплатно</p>
          <p class="muted">Пока идёт закрытый запуск — доступ без оплаты. Взамен просим обратную связь: что неудобно, чего не хватает.</p>
          <ul class="plist">
            <li>Единый поиск по подключённым поставщикам</li>
            <li>Карточки клиентов и история подбора</li>
            <li>Готовые предложения с вашими контактами</li>
          </ul>
          <a href="#apply" class="btn">Оставить заявку</a>
        </div>
        <div class="card plan muted-plan">
          <span class="ptag">Дальше</span>
          <p class="pprice">Оплата за использование</p>
          <p class="muted">
            Тариф считается по количеству поисков, а не по числу сотрудников.
            Точные цифры согласуем при подключении — мы не хотим называть их раньше,
            чем поймём реальную нагрузку.
          </p>
          <ul class="plist">
            <li>Никакой абонентской платы за «место»</li>
            <li>Лимит виден заранее, без сюрпризов в счёте</li>
            <li>Можно остановить в любой момент</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <!-- ── faq ──────────────────────────────────────────────── -->
  <section id="faq" class="faq">
    <div class="wrap narrow">
      <div class="sec-head">
        <span class="eyebrow">Вопросы</span>
        <h2>Коротко и честно</h2>
      </div>
      <div class="qs">
        <div v-for="(f, i) in faq" :key="f.q" class="q" :class="{ open: openFaq === i }">
          <button class="qh" :aria-expanded="openFaq === i" @click="openFaq = openFaq === i ? null : i">
            <span>{{ f.q }}</span><i aria-hidden="true">+</i>
          </button>
          <div class="qb"><p>{{ f.a }}</p></div>
        </div>
      </div>
    </div>
  </section>

  <!-- ── apply ────────────────────────────────────────────── -->
  <ApplyForm id="apply" />
</template>

<style scoped>
.o{color:var(--or)}
.footnote{margin-top:22px;font-size:13.5px;color:var(--ink-4);max-width:620px}
.narrow{max-width:780px}

/* hero */
.hero{background:var(--night);color:#fff;padding:clamp(56px,8vw,104px) 0 clamp(64px,9vw,112px);overflow:hidden}
.hero-in{display:grid;grid-template-columns:1.05fr .95fr;gap:56px;align-items:center}
.pill{display:inline-block;border:1px solid #2A2F38;color:#C9CFD8;border-radius:99px;
  padding:5px 14px;font-size:12.5px;font-weight:600;margin-bottom:22px}
.hero h1{color:#fff}
.hero .lead{color:#B9C0CA;margin:22px 0 30px;max-width:480px}
.hero-cta{display:flex;gap:12px;flex-wrap:wrap}
.hero-note{margin-top:16px;font-size:13.5px;color:#6B7482}
@media(max-width:900px){.hero-in{grid-template-columns:1fr;gap:40px}}

.dcard{background:#fff;border-radius:14px;overflow:hidden;box-shadow:0 24px 60px rgba(0,0,0,.4);color:var(--ink)}
.dbar{background:#1A1F26;color:#C9CFD8;padding:12px 16px;font-size:13px}
.dchips{display:flex;gap:6px;padding:12px 16px;flex-wrap:wrap;border-bottom:1px solid var(--line-2)}
.c{font-size:11.5px;font-weight:600;padding:3px 10px;border-radius:99px;white-space:nowrap}
.c.ok{background:var(--ok-bg);color:var(--ok);border:1px solid var(--ok-line)}
.c.run{background:#FFF4EA;color:#9A5B18;border:1px solid #F2C89C}
.drow{display:flex;align-items:baseline;gap:10px;padding:13px 16px;border-bottom:1px solid var(--line-2);font-size:13.5px}
.drow b{font-weight:700}
.drow i{font-style:normal;color:var(--ink-3);font-size:12.5px;flex:1}
.drow em{font-style:normal;font-weight:800;font-size:15px}
.dfoot{padding:11px 16px;font-size:12.5px;color:var(--ink-4)}

/* problem */
.problem{background:var(--bg)}
.pcard{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:26px}
.pcard .pn{display:block;font-size:34px;font-weight:800;letter-spacing:-.03em;color:var(--ink-3)}
.pcard p{margin-top:8px;font-size:14.5px;color:var(--ink-2)}
.pcard.hot{border-color:var(--or);background:var(--or-soft)}
.pcard.hot .pn{color:var(--or-dk)}
.pcard.hot p{color:#7A4A1E}

/* steps */
.steps{list-style:none;counter-reset:none}
.step{background:#fff;border:1px solid var(--line);border-radius:var(--r);padding:26px}
.sn{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;
  border-radius:50%;background:var(--or);color:#fff;font-weight:800;font-size:14px;margin-bottom:16px}
.step h3{margin-bottom:8px}
.step p{font-size:14.5px;color:var(--ink-2)}

/* features */
.what{background:var(--bg)}
.feat .fi{display:inline-flex;align-items:center;justify-content:center;width:40px;height:40px;
  border-radius:10px;background:var(--or-soft);color:var(--or-dk);font-size:19px;margin-bottom:14px}
.feat h3{margin-bottom:8px}
.feat p{font-size:14.5px;color:var(--ink-2)}

/* offers */
.ohead{display:flex;align-items:center;gap:8px;margin-bottom:4px}
.tag{font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;
  background:var(--line-2);color:var(--ink-3);padding:2px 7px;border-radius:5px}
.oprice{margin-top:14px;font-size:21px;font-weight:800;letter-spacing:-.02em}

/* pricing */
.pricing{background:var(--bg)}
.plan{display:flex;flex-direction:column;gap:14px}
.ptag{align-self:flex-start;font-size:11.5px;font-weight:700;text-transform:uppercase;
  letter-spacing:.07em;color:var(--or-dk);background:var(--or-soft);padding:4px 10px;border-radius:6px}
.pprice{font-size:28px;font-weight:800;letter-spacing:-.03em}
.plist{list-style:none;display:flex;flex-direction:column;gap:9px;margin-top:2px}
.plist li{position:relative;padding-left:24px;font-size:14.5px;color:var(--ink-2)}
.plist li::before{content:'✓';position:absolute;left:0;color:var(--or);font-weight:800}
.plan .btn{align-self:flex-start;margin-top:6px}
.muted-plan{background:transparent;box-shadow:none;border-style:dashed}

/* faq */
.qs{border-top:1px solid var(--line)}
.q{border-bottom:1px solid var(--line)}
.qh{display:flex;align-items:center;justify-content:space-between;gap:16px;width:100%;
  text-align:left;padding:20px 0;font-size:16.5px;font-weight:600}
.qh i{font-size:22px;color:var(--or);transition:transform .2s;flex:none}
.q.open .qh i{transform:rotate(45deg)}
.qb{max-height:0;overflow:hidden;transition:max-height .25s ease}
.q.open .qb{max-height:320px}
.qb p{padding-bottom:20px;color:var(--ink-2);font-size:15px;max-width:640px}
</style>
