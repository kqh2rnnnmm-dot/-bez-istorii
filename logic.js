/* Pure local rules. No requests, models, or external dependencies. */
(function (root) {
  'use strict';
  const normalize = text => String(text || '').toLowerCase().replace(/ё/g, 'е').replace(/\s+/g, ' ').trim();
  const general = /всегда|никогда|постоянно|вечно|все\s+(?:считают|думают|против)|никто|каждый раз/;
  const motives = /специально|намеренно|назло|ненавид|не\s+цен[яи]|игнорир|счита[ею]т|дума[ею]т|не\s+уваж|не\s+люб|хочет[, ]+чтобы/;
  const riskPatterns = [
    /суицид|самоубий|самоповреж|селфхарм|изнасил|насили|домога|шантаж|преследу|сталкинг/,
    /(?:не\s+хочу|не\s+могу|незачем|нет\s+смысла)\s+(?:больше\s+)?жить|хочу\s+(?:просто\s+)?(?:умереть|исчезнуть)|покончить\s+с\s+(?:собой|жизнью)|свести\s+счеты\s+с\s+жизнью/,
    /(?:убить|убью|убьет|убьют|убьем|порезать|порежу|режу|ранить|покалечить|повредить)\s+(?:себя|себе|меня|его|ее|их)|(?:вскрыть|режу|резать)\s+вены/,
    /(?:меня|мне|ребенка|ребенку|ее|его)\s+(?:бьет|бьют|бил|били|била|избива|ударил|души|угрожа|запер|запира|насилу|принужда)/,
    /избива|избиени|избил|избить|побил|побои|(?:он|она|муж|отец|партнер)\s+(?:меня\s+)?(?:ударил|бьет|бил|души)|угроз[аыуе]|угрожа|убью|убьет|убьют|убить/,
    /(?:прыгнуть|прыгну|сброситься)\s+(?:с\s+)?(?:крыши|моста|балкона)|передоз|(?:выпил|выпила|принял|приняла)\s+(?:все|много|пачку)\s+таблет/,
    /боюсь\s+(?:идти|возвращаться)\s+домой|не\s+выпуска[ею]т|заперли|запер\s+меня|удуш|не\s+могу\s+дышать|боль\s+в\s+груди/,
    /(?:навредить|наврежу|причинить|причиняю|нанести)\s+себе|лучше\s+бы\s+меня\s+не\s+было|хочу\s+чтобы\s+все\s+закончилось/,
    /kill\s+myself|suicid|self.?harm|rape|abuse|want\s+to\s+die/
  ];
  function detectRisk(text) { const t = normalize(text); return riskPatterns.some(re => re.test(t)); }
  function inspect(text) {
    const t = normalize(text), result = [];
    if (!t) return ['Напишите хотя бы одну фразу. Можно начать с «Вчера…» или «Когда это случилось, я подумал…».'];
    if (general.test(t)) result.push('В ответе есть обобщение. Какой один случай вы вспоминаете? Укажите время, место и конкретные слова или действие.');
    if (motives.test(t)) result.push('Здесь может быть предположение о чужих намерениях или отношении. Что именно вы увидели или услышали, прежде чем сделали этот вывод?');
    if (t.length > 280 || (t.match(/[.!?;]/g) || []).length > 3) result.push('Здесь может быть несколько эпизодов или мыслей. Выберите одну сцену и одну фразу, которая задевает сильнее остальных.');
    return result;
  }
  function classify(text) {
    if (detectRisk(text)) return 'В тексте могут быть насилие или опасность. Не нужно считать произошедшее «просто интерпретацией». Сначала безопасность; ответственность за насилие лежит на том, кто его совершает.';
    const notes = inspect(text);
    if (notes.length) return notes.join('\n\n') + '\n\nЭто подсказка по словам, а не решение о том, что произошло на самом деле.';
    return 'Одних слов недостаточно для точного решения. Факт — наблюдаемое действие или точная цитата: «Он не ответил на два сообщения». Интерпретация — значение: «Я ему не нужен». Чувство «мне грустно» — ваш переживаемый опыт. Попробуйте разделить ответ на эти три части.';
  }
  const topics = [
    ['Работа и признание', /работ|началь|руковод|коллег|вклад|совещан|ценят|ценит/],
    ['Отношения и близость', /партнер|муж|жена|супруг|отношен|люб[ияо]|одиноч|одинок|бросит/],
    ['Оценка себя', /недостаточ|неудач|хуже|стыд|ошиб|провал|глуп|неспособ/],
    ['Неопределённость и будущее', /будущ|тревог|неизвест|боюсь|случится|не справ/],
    ['Границы и ожидания', /долж[еннаы]|обязан|отказ|границ|требу|уступ/]
  ];
  function repeats(sessions) {
    const eligible = sessions.filter(s => !s.safety && !detectRisk(JSON.stringify(s.answers || {})));
    const found = [];
    for (const [label, re] of topics) {
      const ids = eligible.filter(s => re.test(normalize([s.answers.story, s.answers.thought, s.answers.insight].join(' ')))).map(s => s.id);
      if (new Set(ids).size >= 2) found.push({label, count:new Set(ids).size, kind:'Тема'});
    }
    const phrases = new Map();
    eligible.forEach(s => {
      const words = normalize(s.answers.thought).match(/[а-яa-z]+/g) || [];
      const unique = new Set();
      for (let i=0; i<words.length-1; i++) {
        const phrase=words.slice(i,i+3).join(' ');
        if (phrase.length >= 9) unique.add(phrase);
      }
      unique.forEach(p => { if (!phrases.has(p)) phrases.set(p,new Set()); phrases.get(p).add(s.id); });
    });
    [...phrases].filter(([,ids])=>ids.size>=2).sort((a,b)=>b[1].size-a[1].size || b[0].length-a[0].length).slice(0,4).forEach(([label,ids])=>found.push({label,count:ids.size,kind:'Фраза'}));
    return found;
  }
  const api = {normalize, detectRisk, inspect, classify, repeats};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.BezHistory = api;
})(typeof window !== 'undefined' ? window : this);
