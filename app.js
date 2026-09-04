(() => {
  'use strict';
  const L = window.BezHistory;
  const $ = selector => document.querySelector(selector);
  const screen = $('#screen');
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const KEY = 'bez-history-v1';
  const uid = () => typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const field = (key,label,doWhat,why,example,notNeeded,optional=false) => ({key,label,doWhat,why,example,notNeeded,optional});
  const steps = [
    {title:'Что сейчас не даёт вам покоя?',phase:0,fields:[field('story','Расскажите своими словами','Опишите то, что беспокоит. Можно эмоционально, как рассказали бы знакомому.','Сначала дадим место вашему взгляду. Факты и выводы разделим позже.','«На встрече отметили коллегу, а меня нет. Мне обидно: я тоже много сделал».','Не нужно писать красиво, объяснять всю свою жизнь или искать причину в детстве.')]},
    {title:'Остановимся на одном эпизоде.',phase:0,fields:[field('episode','Когда и где это произошло?','Выберите одну короткую сцену: время, место, кто участвовал и что случилось.','С конкретной сценой проще разобраться, чем с историей «так бывает всегда».','«Вчера утром, на рабочем созвоне, руководитель подвёл итоги проекта».','Не нужно разбирать все случаи сразу или описывать человека целиком.')]},
    {title:'Что могла бы записать камера?',phase:0,fields:[field('facts','Наблюдаемые факты','Запишите действия, слова или отсутствие конкретного действия. Отложите догадки о причинах.','Так мы отделим произошедшее от значения, которое вы ему придали.','«Руководитель сказал: “Спасибо Антону”. Моего имени не назвал».','Не нужно писать «он специально меня унизил»: намерение нельзя увидеть на записи.')]},
    {title:'Какая одна мысль задевает?',phase:1,fields:[field('thought','Моя стрессующая мысль','Закончите про себя: «Для меня это означает, что…». Запишите один короткий вывод.','Дальше мы исследуем одну мысль, а не будем решать, кто прав во всём.','«Мой вклад не ценят».','Не нужно перечислять пять мыслей, задавать вопрос «почему?» или повторять всю сцену.')]},
    {title:'Насколько эта мысль задевает сейчас?',phase:1,type:'range',key:'before',fields:[field('before','Интенсивность до исследования','Выберите число от 0 до 10: насколько тяжело вам сейчас с этой мыслью.','Это ваша исходная точка для сравнения, а не оценка серьёзности ситуации.','«Сейчас 7: трудно отвлечься, но я могу продолжить».','Не нужно угадывать правильное число. При 9–10 можно сделать паузу.')]},
    {title:'1. Это правда?',phase:2,type:'choice',key:'q1',fields:[field('q1','Ваш ответ на первый вопрос','Посмотрите на выделенную мысль. Какой ответ сейчас ближе: да, нет или не знаю?','Это помогает заметить ваше отношение к мысли именно сейчас.','«Да, сейчас я в это верю» или «Не знаю».','Не нужно отрицать очевидные события, доказывать ответ или выбирать «нет» ради упражнения.')]},
    {title:'2. Можете ли вы знать это абсолютно точно?',phase:2,type:'choice',key:'q2',fields:[field('q2','Ваш ответ на второй вопрос','Проверьте: знаете ли вы наверняка именно этот вывод, а не только то, что произошло?','Мы различаем сильную уверенность и то, что действительно известно.','«Я знаю, что меня не назвали. Но не знаю наверняка, как оценивают мой вклад».','Не нужно сомневаться в своей памяти или убеждать себя, что неприятного события не было.')]},
    {title:'3. Что происходит, когда вы верите этой мысли?',phase:2,fields:[
      field('feel','Какие чувства появляются?','Назовите одну-две эмоции в той сцене.','Это помогает заметить вашу реакцию.','«Обида и злость».','Не нужно объяснять, почему другой человек неправ.'),
      field('body','Что вы замечаете в теле?','Если получается, назовите ощущение и место в теле.','Реакция может проявляться не только словами.','«Сжимаются плечи, становится жарко».','Не нужно искать ощущение, если его не замечаете.',true),
      field('behavior','Что вы делаете или перестаёте делать?','Вспомните свои действия, когда верите этой мысли.','Увидим, как мысль связана с поведением.','«Замолкаю и перестаю предлагать идеи».','Не нужно оценивать себя как хорошего или плохого человека.',true),
      field('self','Как вы относитесь к себе и чего ждёте дальше?','Запишите внутренние слова о себе или ожидание будущего.','Так станет видна ещё одна часть вашей реакции.','«Ругаю себя. Жду, что снова не заметят».','Не нужно прогнозировать будущее точно или искать диагноз.',true)
    ]},
    {title:'4. Как вы были бы в этой ситуации без этой мысли?',phase:2,fields:[field('without','Та же сцена, без одной мысли','На минуту оставьте все факты прежними, но уберите из головы выделенную фразу. Что замечаете?','Это проба другого восприятия, а не требование перестать думать.','«Меня всё ещё не упомянули. Мне неприятно, но я могу позже спросить о своём вкладе».','Не нужно делать вид, что всё хорошо, прощать или отказываться от границ. Можно ответить «пока не получается представить».')]},
    {title:'Есть ли место другому взгляду?',phase:3,fields:[
      field('alternative','Другая возможная формулировка','Если готовы, напишите одну более точную или менее общую версию. Можно оставить прежний взгляд.','Проверим варианты, не превращая их в новую обязательную истину.','«На этой встрече мой вклад не назвали. Общую оценку моей работы я пока не знаю».','Не нужно оправдывать другого, обвинять себя или превращать «он обидел меня» в «я виноват».',true),
      field('evidence','Что поддерживает эту версию — и чего вы не знаете?','Запишите реальный пример или честно укажите, каких данных нет.','Альтернатива должна оставаться проверяемой версией.','«Неделю назад мне доверили проект. Но оценку этой работы я ещё не обсуждал».','Не нужно придумывать доказательства или заставлять себя верить новому взгляду.',true)
    ]},
    {title:'Что вы поняли для себя?',phase:4,fields:[field('insight','Мой вывод','Одной-двумя фразами запишите, что стало яснее. Если ничего — так и напишите.','Это ваш собственный итог, который останется в карте сессии.','«Я связал один эпизод с оценкой всей моей работы. Хочу уточнить, а не догадываться».','Не нужно обязательно почувствовать облегчение или соглашаться с подсказками.')]},
    {title:'Какой небольшой шаг вам подходит?',phase:4,fields:[field('action','Мой следующий шаг','Выберите посильное действие, паузу или решение пока ничего не делать.','Переведём вывод в то, на что вы можете повлиять.','«Завтра попрошу десять минут для обратной связи» или «Сегодня отдохну».','Не нужно срочно выяснять отношения, менять жизнь или обещать невыполнимое.',true)]},
    {title:'Как вам с этой мыслью сейчас?',phase:4,type:'range',key:'after',fields:[field('after','Интенсивность после исследования','Снова оцените от 0 до 10, насколько мысль задевает прямо сейчас.','Сохраним наблюдение рядом с начальной оценкой.','«Теперь 5» или «По-прежнему 7».','Не нужно снижать число ради результата. Если стало тяжелее, можно остановиться и обратиться за поддержкой.')]}
  ];
  const supportFields = [
    field('supportPerson','К кому можно обратиться?','Если безопасно, назовите человека или службу, с которыми можете связаться.','Сейчас важнее доступная поддержка, чем анализ мыслей.','«Позвоню подруге и скажу, что мне нужна помощь».','Не нужно связываться с человеком, который угрожает, или писать личные контакты здесь.',true),
    field('supportAction','Что поможет безопасности прямо сейчас?','Выберите один выполнимый шаг с учётом вашей обстановки.','Зафиксируем то, что вы сами считаете безопасным.','«Свяжусь с экстренной службой» или «Попрошу доверенного человека побыть рядом».','Не нужно рисковать ради упражнения или доказывать свою правоту.',true)
  ];
  let storageIssue = '', blocked = false, revision = 0, lastSaved = null, view = 'home', active = null, selected = null, safetyModalShown = false;
  let state = {version:1,revision:0,draft:null,sessions:[]};
  function validSession(s) {return s && typeof s==='object' && typeof s.id==='string' && Number.isInteger(s.step) && s.step>=0 && s.step<steps.length && s.answers && typeof s.answers==='object' && !Array.isArray(s.answers) && Object.values(s.answers).every(v=>typeof v==='string'||typeof v==='number');}
  function warn(message) { storageIssue=message; const node=$('#storage-status'); node.textContent=message; node.hidden=!message; }
  function legacy(x) {
    if (!x || typeof x!=='object' || typeof x.story!=='string') return null;
    const answers={story:x.story,episode:x.situation||'',facts:x.situation||'',thought:x.thought||'',before:x.before??'',after:x.after??'',q1:x.q1||'',q2:x.q2||'',without:x.q4||'',alternative:(x.alts||[]).join('\n'),evidence:(x.examples||[]).join('\n'),insight:x.insight||'',action:x.action||'',feel:x.q3?.feel||'',body:x.q3?.body||'',behavior:x.q3?.do||'',self:[x.q3?.self,x.q3?.future].filter(Boolean).join('\n')};
    return {id:String(x.id||uid()),step:0,answers,createdAt:new Date(Number(x.id)||Date.now()).toISOString(),safety:L.detectRisk(JSON.stringify(answers)),legacy:true};
  }
  function load() {
    try {
      const raw=localStorage.getItem(KEY);
      if(raw) {
        const parsed=JSON.parse(raw);
        if(parsed.version!==1 || !Number.isInteger(parsed.revision) || !Array.isArray(parsed.sessions) || !parsed.sessions.every(validSession) || (parsed.draft && !validSession(parsed.draft))) throw new Error('format');
        state=parsed; revision=parsed.revision; lastSaved=raw;
      } else {
        const oldSessions=JSON.parse(localStorage.getItem('bi_sessions_v04')||'[]');
        const oldDraft=JSON.parse(localStorage.getItem('bi_draft_v04')||'null');
        state.sessions=(Array.isArray(oldSessions)?oldSessions:[]).map(legacy).filter(Boolean);
        state.draft=legacy(oldDraft);
        if(state.sessions.length||state.draft) persist();
      }
    } catch { blocked=true; warn('Не удалось прочитать сохранения. Старые данные не перезаписаны. Можно работать до закрытия вкладки и сохранить карту в файл.'); }
    active=state.draft;
  }
  function persist() {
    if(blocked) return false;
    try {
      const raw=localStorage.getItem(KEY);
      if(raw!==lastSaved) {blocked=true;warn('Сохранения изменились в другой вкладке. Эта вкладка больше их не перезаписывает. Сохраните свою карту в файл, затем обновите страницу.');return false;}
      const next={...state,revision:revision+1};
      const serialized=JSON.stringify(next);
      localStorage.setItem(KEY,serialized); state=next; revision=next.revision; lastSaved=serialized;
      warn(''); return true;
    } catch {warn('Браузер не смог сохранить ответы: доступ к хранилищу закрыт или оно заполнено. Пока ответы есть только в открытой вкладке. Сохраните карту в файл перед закрытием.');return false;}
  }
  function saveDraft() {if(active && !active.completedAt){active.updatedAt=new Date().toISOString();state.draft=active;return persist();}return false;}
  function fresh(){return {id:uid(),step:0,createdAt:new Date().toISOString(),answers:{},safety:false};}
  function guide(f){return `<div class="guide"><div><b>Что сделать</b>${esc(f.doWhat)}</div><div><b>Зачем</b>${esc(f.why)}</div><div class="example"><b>Пример ответа</b>${esc(f.example)}</div><div class="not-needed"><b>Здесь не требуется</b>${esc(f.notNeeded)}</div></div>`;}
  function textField(f){return `<div class="field"><label for="answer-${f.key}">${esc(f.label)}${f.optional?' <span class="muted">· необязательно</span>':''}</label>${guide(f)}<textarea id="answer-${f.key}" data-field="${f.key}" maxlength="6000" placeholder="${esc(f.example)}">${esc(active.answers[f.key]||'')}</textarea></div>`;}
  function helpers(){return `<div class="helpers"><p class="muted"><small>Если трудно подобрать слова</small></p><div class="helper-buttons"><button data-help="simple">Объясни проще</button><button data-help="example">Покажи пример</button><button data-help="formulate">Помоги сформулировать</button><button data-help="fact">Факт это или моя интерпретация?</button><button data-help="question">Задай мне уточняющий вопрос</button></div><div id="helper-output" class="helper-output" role="status" aria-live="polite"></div></div>`;}
  function render(){
    document.querySelectorAll('.topbar nav button').forEach(b=>b.setAttribute('aria-current',(view==='history'||view==='map')?b.dataset.action==='history'?'page':'false':b.dataset.action==='home'?'page':'false'));
    if(view==='home') home(); else if(view==='session') session(); else if(view==='history') history(); else if(view==='map') map(); else if(view==='support') support();
    screen.focus({preventScroll:true}); window.scrollTo(0,0);
  }
  function home(){screen.innerHTML=`<section class="intro"><div class="eyebrow">Пространство для самоисследования</div><h1>Меньше догадок.<br>Больше ясности.</h1><p class="lead">Одна ситуация. Одна мысль. Несколько бережных вопросов, чтобы увидеть, что произошло и что вы об этом решили.</p><div class="intro-note"><span>Без регистрации</span><span>Ответы только в этом браузере</span><span>Можно остановиться в любой момент</span></div><div class="panel">${state.draft?`<div class="eyebrow">Есть незавершённая сессия</div><h2>Продолжим с того же места?</h2><p class="muted">Шаг ${state.draft.step+1} из ${steps.length}. Ответы ${storageIssue?'есть в этой вкладке':'сохранены на этом устройстве'}.</p><div class="actions"><button class="primary" data-action="resume">Продолжить сессию</button><button data-action="new">Начать заново</button></div>`:`<h2>Что сейчас не даёт вам покоя?</h2><p class="muted">Можно начать с рабочей ситуации, разговора или тревожащего ожидания. Я помогу разобрать одну сцену шаг за шагом.</p><button class="primary" data-action="new">Начать сессию →</button>`}<div class="steps-preview"><span>01 · Отделить факты</span><span>02 · Исследовать мысль</span><span>03 · Собрать свою карту</span></div></div><p class="muted input-foot">Здесь нет внешнего ИИ: подсказки подбираются по вашим словам. Они могут ошибаться. Это инструмент размышления, не терапия и не экстренная помощь.</p></section>`;}
  function session(){
    if(!active){view='home';home();return;}
    if(active.safety){view='support';support();return;}
    const step=steps[active.step], f=step.fields[0];
    const phases=['Одна сцена','Одна мысль','Четыре вопроса','Другой взгляд','Ваша карта'];
    let content='';
    if(step.type==='range') content=`<label for="rating">${esc(f.label)}</label>${guide(f)}<div class="range-line"><input id="rating" type="range" data-field="${step.key}" min="0" max="10" step="1" value="${active.answers[step.key]??5}" aria-describedby="range-note"><output for="rating" id="range-value">${active.answers[step.key]??'—'}</output></div><div class="range-labels"><span>0 · почти не задевает</span><span>10 · очень тяжело</span></div><p id="range-note" class="input-foot">Подвиньте ползунок или нажмите на него, чтобы выбрать оценку.</p>`;
    else if(step.type==='choice') content=`${guide(f)}${step.key==='q2'&&active.answers.q1==='Нет'?'<p class="notice">На первый вопрос вы ответили «нет». Здесь тоже можно ответить «нет» или «не знаю» — специально искать сомнения не нужно.</p>':''}<div class="choices" role="group" aria-label="${esc(f.label)}">${['Да','Нет','Не знаю'].map(x=>`<button data-choice="${x}" aria-pressed="${active.answers[step.key]===x}">${x}</button>`).join('')}</div>`;
    else content=step.fields.map(textField).join('');
    screen.innerHTML=`<div class="layout"><aside class="rail" aria-label="Этапы сессии"><div class="eyebrow">В своём темпе</div><ol>${phases.map((p,i)=>`<li class="${step.phase===i?'current':''}"><span class="dot">${i+1}</span>${p}</li>`).join('')}</ol><p class="rail-note">Вам не нужно менять своё мнение. Достаточно внимательно его рассмотреть.</p></aside><section><div class="eyebrow">Шаг ${active.step+1} из ${steps.length} · ${esc(phases[step.phase])}</div><progress class="progress" value="${active.step+1}" max="${steps.length}" aria-label="Прогресс сессии"></progress><div class="panel">${active.step>=4?`<div class="quote"><small>Исследуемая мысль</small>${esc(active.answers.thought)}</div>`:active.step===3?`<div class="quote"><small>Ваши факты</small>${esc(active.answers.facts)}</div>`:''}<h1>${esc(step.title)}</h1>${content}<div id="risk-inline" role="status"></div>${helpers()}<div id="error" class="error" role="alert"></div><div class="actions"><button data-action="back">← Назад</button><button class="linkbutton" data-action="pause">Сделать паузу</button><button class="primary" data-action="next">${active.step===steps.length-1?'Показать мою карту':step.fields.every(f=>f.optional)?'Продолжить / пропустить →':'Дальше →'}</button></div><p class="input-foot">${storageIssue?'Ответы остаются в этой вкладке. Проверьте сообщение о сохранении выше.':'Ответы сохраняются автоматически в этом браузере.'}</p></div></section></div>`;
  }
  function hasRisk(){return active && (active.safety||L.detectRisk(Object.values(active.answers).join(' ')));}
  function next(){
    if(hasRisk()){active.safety=true;saveDraft();safetyDialog();return;}
    const step=steps[active.step];
    const missing=step.type ? active.answers[step.key]===undefined : step.fields.some(f=>!f.optional&&!String(active.answers[f.key]||'').trim());
    if(missing){$('#error').textContent=step.type==='range'?'Выберите число на шкале.':step.type==='choice'?'Выберите «да», «нет» или «не знаю».':'Напишите хотя бы короткий ответ. «Пока не знаю» тоже подходит.';return;}
    if(active.step===steps.length-1){finish();return;}
    active.step++;saveDraft();render();
  }
  function help(kind){
    const step=view==='support'?{fields:supportFields}:steps[active.step];
    const focusedKey=screen.querySelector('textarea[data-recent=true]')?.dataset.field;
    const f=step.fields.find(x=>x.key===focusedKey)||step.fields.find(x=>!active.answers[x.key])||step.fields[0];
    const answer=String(active.answers[f.key]??''), notes=L.inspect(answer);
    let message='';
    if(kind==='simple') message=`Сейчас только одно: ${f.doWhat}\n\n${f.notNeeded}`;
    if(kind==='example') message=`Для поля «${f.label}»:\n${f.example}\n\nЭто вымышленный пример, не вывод о вас. Используйте только то, что подходит вашей ситуации.`;
    if(kind==='fact') message=L.classify(answer);
    if(kind==='formulate') {
      const templates={story:'Меня беспокоит… Это произошло… Тогда я подумал(а)…',episode:'[Когда], [где], [кто] сделал(а) или сказал(а) [конкретное действие].',facts:'Я увидел(а)… / Я услышал(а) точные слова: «…».',thought:'Для меня это означает: «…». Оставьте только одну самую болезненную фразу.',feel:'Когда я верю этой мысли, я чувствую…',body:'В теле я замечаю… / Пока ничего не замечаю.',behavior:'Я начинаю… / Я перестаю…',self:'Я говорю себе… / Я ожидаю…',without:'Факты остаются: … Без этой мысли я замечаю… и мог(ла) бы…',alternative:'В этой конкретной сцене произошло… Пока я не знаю… Это не обязательно означает…',evidence:'Реальный пример: … / Мне не хватает информации о…',insight:'Я заметил(а), что… Пока мне не ясно…',action:'Мой маленький шаг: … Я могу сделать его…',supportPerson:'Если это безопасно, я могу связаться с…',supportAction:'Сейчас я могу позаботиться о безопасности так: …'};
      message=(answer?`Вы написали: «${answer.slice(0,220)}».\n\n`:'')+(notes.length&&answer?notes.join('\n')+'\n\n':'')+(templates[f.key]||f.doWhat)+'\n\nШаблон ничего не подставляет за вас: ответ остаётся вашим.';
    }
    if(kind==='question') {
      const questions={story:'Какой момент в этой истории особенно задел вас?',episode:'Вспомните последний такой случай. Где вы находились?',facts:'Какие точные слова прозвучали или какое конкретное действие произошло?',thought:'Если оставить один вывод из этой сцены, какой задевает сильнее всего?',before:'Какое число описывает ваше состояние именно сейчас?',q1:'Что вы замечаете: верите мысли, не верите или пока не уверены?',q2:'Что вам известно напрямую, а о чём можно только предполагать?',feel:'Какая эмоция появилась первой?',body:'Если вы это замечаете, где в теле есть напряжение?',behavior:'Что вы сделали сразу после появления этой мысли?',self:'Какие слова вы сказали себе в тот момент?',without:'Если на минуту убрать только эту фразу, что ещё остаётся перед вами?',alternative:'Как можно сделать вашу мысль точнее, ограничив её этим одним эпизодом?',evidence:'Есть ли конкретный факт, который поддерживает другую версию?',insight:'Что вы хотели бы запомнить из этого разбора?',action:'Что находится в вашей власти и не требует решения другого человека?',after:'Сейчас вам легче, так же или тяжелее? Какое число подходит?',supportPerson:'С кем вы чувствуете себя безопаснее?',supportAction:'Какой безопасный шаг доступен вам прямо сейчас?'};
      message=answer&&notes.length?notes[0]:questions[f.key];
      message+=`\n\nЗачем: ${f.why}\nНапример: ${f.example}\nНе требуется: ${f.notNeeded}`;
    }
    if(hasRisk()&&view!=='support'){active.safety=true;saveDraft();safetyDialog();return;}
    $('#helper-output').textContent=message;
  }
  function openDialog(content){$('#overlay').innerHTML=`<dialog aria-labelledby="dialog-title">${content}</dialog>`; const d=$('dialog'); d.showModal(); d.addEventListener('close',()=>{safetyModalShown=false;$('#overlay').innerHTML='';});d.addEventListener('cancel',e=>{if(active?.safety && view==='session'){e.preventDefault();view='support';d.close();render();}});}
  function closeDialog(){ $('dialog')?.close(); }
  function safetyDialog(){
    if(safetyModalShown)return;
    safetyModalShown=true;
    openDialog(`<div class="eyebrow">Сначала безопасность</div><h2 id="dialog-title">Давайте остановим исследование.</h2><p>В ваших словах может быть опасность, насилие или риск причинить вред себе. Подсказка по словам может ошибаться, но здесь лучше сделать паузу.</p><div class="notice danger">Вы не несёте ответственность за чужое насилие. Этот сайт не будет предлагать обвиняющие развороты или сомневаться в реальности угроз.</div>${safetyText()}<div class="actions"><button class="primary" data-action="support">Перейти к поддержке</button><button data-action="safe-exit">Закрыть сессию</button></div>`);
  }
  function safetyText(){return `<p>Если опасность непосредственная или вы уже причинили себе вред, обратитесь в экстренную службу: <a href="tel:112">112 в России</a>. В другой стране — местный экстренный номер. Если это безопасно, свяжитесь с человеком, которому доверяете, и попросите побыть рядом.</p><p class="muted">Сайт не вызывает помощь и не отслеживает ваше состояние. Не продолжайте упражнение через силу.</p><p><a href="https://76.mchs.gov.ru/deyatelnost/poleznaya-informaciya/rekomendacii-naseleniyu/sistema-112" target="_blank" rel="noopener noreferrer">Информация МЧС о номере 112 ↗</a></p>`;}
  function support(){screen.innerHTML=`<section class="map"><div class="eyebrow">Безопасность и поддержка</div><h1>Сейчас можно не разбирать мысль.</h1><div class="notice danger">Никаких разворотов и поиска вашей вины. В этой сессии вопросы о правдивости мысли и альтернативных объяснениях остановлены.</div>${safetyText()}<div class="panel">${active?supportFields.map(textField).join(''):'<p>Можно просто закрыть эту страницу и обратиться за помощью.</p>'}${active?helpers():''}<div class="actions">${active?'<button class="primary" data-action="finish-support">Сохранить карту поддержки</button>':''}<button data-action="home">На главную</button></div></div></section>`;}
  function finish(){
    const result=JSON.parse(JSON.stringify(active));result.completedAt=new Date().toISOString();
    state.sessions=[result,...state.sessions.filter(s=>s.id!==result.id)];state.draft=null;
    persist();active=null;selected=result;view='map';render();
  }
  function date(value){const d=new Date(value);return Number.isNaN(d.getTime())?'Дата не указана':d.toLocaleDateString('ru-RU',{day:'numeric',month:'long',year:'numeric'});}
  function mapEntries(s){const a=s.answers;const all=[['Исходный рассказ',a.story],['Один эпизод',a.episode],['Наблюдаемые факты',a.facts],['Стрессующая мысль',a.thought]];
    if(!s.safety)all.push(['1. Это правда?',a.q1],['2. Могу ли я знать это абсолютно точно?',a.q2],['3. Когда я верю мысли — чувства',a.feel],['Тело',a.body],['Поведение',a.behavior],['Отношение к себе и ожидания',a.self],['4. Та же ситуация без мысли',a.without],['Другая формулировка',a.alternative],['Примеры и неизвестное',a.evidence],['Мой вывод',a.insight],['Мой следующий шаг',a.action]);
    else all.push(['Исследование остановлено','Приоритет — безопасность. Вопросы и альтернативы не применялись после обнаружения риска.'],['К кому я могу обратиться',a.supportPerson],['Мой безопасный шаг',a.supportAction]);
    return all;
  }
  function map(){if(!selected){view='history';history();return;}const a=selected.answers;
    screen.innerHTML=`<section class="map"><div class="eyebrow">${date(selected.completedAt||selected.createdAt)} · ${selected.safety?'Карта поддержки':'Завершённая сессия'}</div><h1>${selected.safety?'Сначала — ваша безопасность.':'Ваша карта сессии.'}</h1><p class="lead">${selected.safety?'Можно вернуться к этим записям, когда будет безопасно.':'Что случилось, что вы подумали и что увидели после исследования — всё в одном месте.'}</p>${selected.legacy?'<p class="notice">Сессия перенесена из прежней версии. Отдельные поля в ней ещё не запрашивались.</p>':''}${!selected.safety?`<div class="metrics"><div><small>До исследования</small><strong>${esc(a.before??'—')} <small>/ 10</small></strong></div><div><small>После исследования</small><strong>${esc(a.after??'—')} <small>/ 10</small></strong></div></div><p class="notice">${Number(a.after)>Number(a.before)?'Вы отметили больше напряжения. Можно сделать паузу и обратиться к человеку, которому доверяете.':'Оценка не обязана снижаться. Эта карта — ваше наблюдение, а не оценка успеха.'}</p>`:''}<div class="panel">${mapEntries(selected).map(([label,value])=>`<article class="map-card"><h3>${esc(label)}</h3><p>${esc(value||'Не заполнено')}</p></article>`).join('')}</div><div class="actions"><button data-action="download">Сохранить карту в файл</button><button data-action="history">К истории</button><button class="primary" data-action="new">Новая сессия →</button></div><button class="linkbutton" data-action="delete-session">Удалить эту сессию</button></section>`;
  }
  function history(){const repeat=L.repeats(state.sessions);screen.innerHTML=`<section class="map"><div class="eyebrow">Личное пространство</div><h1>История сессий.</h1><p class="lead">Записи только в этом браузере. Они не переносятся на другие устройства и исчезнут, если очистить данные сайта.</p>${state.draft?'<div class="notice">Есть незавершённая сессия. <button data-action="resume">Продолжить</button></div>':''}${repeat.length?`<div class="notice"><h2>Повторяющиеся истории</h2><p>Совпадения слов в нескольких сессиях. Это повод присмотреться, а не диагноз или вывод о причинах. Проверьте, подходит ли вам такое название.</p><ul class="repeat-list">${repeat.map(x=>`<li>${esc(x.kind)} «${esc(x.label)}» · в ${x.count} сессиях</li>`).join('')}</ul></div>`:''}${state.sessions.length?state.sessions.map(s=>`<button class="history-item" data-open="${esc(s.id)}"><small>${date(s.completedAt||s.createdAt)} · ${s.safety?'Карта поддержки':`${esc(s.answers.before??'—')} → ${esc(s.answers.after??'—')} / 10`}</small><b>${esc(s.safety?'Безопасность и поддержка':s.answers.thought||'Моя сессия')}</b><span class="muted">Открыть карту →</span></button>`).join(''):'<div class="empty"><h2>Здесь появится ваша первая карта.</h2><p class="muted">После завершения сессии она сохранится автоматически.</p></div>'}<div class="actions"><button class="primary" data-action="new">Новая сессия →</button></div></section>`;}
  function download(){const s=selected||active;if(!s)return;const text=['БЕЗ ИСТОРИИ — '+(s.safety?'карта поддержки':'карта сессии'),date(s.completedAt||s.createdAt),...mapEntries(s).map(([label,value])=>`${label}\n${value||'Не заполнено'}`),...(!s.safety?[`Интенсивность до: ${s.answers.before??'—'}/10\nПосле: ${s.answers.after??'—'}/10`]:[])].join('\n\n');const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='bez-istorii-session.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function start(){closeDialog();active=fresh();state.draft=active;selected=null;view='session';saveDraft();render();}
  function privacy(){openDialog(`<h2 id="dialog-title">Ваши ответы остаются у вас</h2><ul class="privacy-list"><li>Все вопросы и подсказки работают в браузере. Нет внешнего ИИ, аналитики и отправки ответов на сервер.</li><li>Черновик и карты сохраняются в localStorage этого браузера. Это не зашифрованное хранилище: другой человек с доступом к устройству может увидеть записи.</li><li>На другом устройстве будет другая история. Очистка данных сайта удаляет сохранения; приватный режим может стирать их при закрытии.</li><li>Открывая сам сайт, вы запрашиваете его файлы у GitHub Pages. Личные ответы в эти запросы не включаются. Внешние ссылки открываются только по нажатию.</li><li>Подсказки по словам могут ошибаться и не определяют, кто прав. Четыре вопроса — упражнение для размышления, не диагностика, лечение или замена профессиональной помощи.</li><li>При опасности используйте кнопку «Мне сейчас небезопасно». Автоматическое распознавание не может заметить все формулировки.</li></ul><div class="actions"><button data-action="close-dialog">Понятно</button><button data-action="clear-confirm">Удалить все мои записи</button></div>`);}
  document.addEventListener('focusin',e=>{if(e.target.matches('textarea[data-field]')){screen.querySelectorAll('textarea').forEach(t=>delete t.dataset.recent);e.target.dataset.recent='true';}});
  document.addEventListener('input',e=>{
    const key=e.target.dataset.field;if(!key||!active)return;
    active.answers[key]=e.target.type==='range'?Number(e.target.value):e.target.value;
    if(e.target.type==='range')$('#range-value').textContent=e.target.value;
    if(L.detectRisk(String(active.answers[key])))active.safety=true;
    saveDraft();
    if(active.safety && view==='session'){
      $('#risk-inline').innerHTML='<div class="notice danger">Здесь может быть вопрос безопасности. Дальнейшее исследование остановлено. <button data-action="safety">Открыть поддержку</button></div>';
      safetyDialog();
    }
  });
  document.addEventListener('pointerup',e=>{if(e.target.type==='range'&&e.target.dataset.field&&active){active.answers[e.target.dataset.field]=Number(e.target.value);$('#range-value').textContent=e.target.value;saveDraft();}});
  document.addEventListener('change',e=>{if(e.target.type==='range'&&e.target.dataset.field&&active){active.answers[e.target.dataset.field]=Number(e.target.value);$('#range-value').textContent=e.target.value;saveDraft();}});
  document.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.help){help(b.dataset.help);return;}
    if(b.dataset.choice){active.answers[steps[active.step].key]=b.dataset.choice;saveDraft();screen.querySelectorAll('[data-choice]').forEach(x=>x.setAttribute('aria-pressed',x===b?'true':'false'));$('#error').textContent='';return;}
    if(b.dataset.open){selected=state.sessions.find(s=>s.id===b.dataset.open);view='map';render();return;}
    const action=b.dataset.action;
    if(action==='home'||action==='pause'){view='home';render();}
    if(action==='history'){view='history';render();}
    if(action==='resume'){active=state.draft;if(active){view=active.safety?'support':'session';render();}}
    if(action==='new'){
      if(state.draft)openDialog('<h2 id="dialog-title">Начать новую сессию?</h2><p>Незавершённый черновик будет заменён. Завершённые карты останутся в истории.</p><div class="actions"><button data-action="close-dialog">Оставить черновик</button><button class="primary" data-action="start-confirmed">Начать заново</button></div>');else start();
    }
    if(action==='start-confirmed')start();
    if(action==='next')next();
    if(action==='back'){if(active.step>0){active.step--;saveDraft();}else view='home';render();}
    if(action==='privacy')privacy();
    if(action==='close-dialog')closeDialog();
    if(action==='safety'){if(active){active.safety=true;saveDraft();}safetyDialog();}
    if(action==='support'){closeDialog();view='support';render();}
    if(action==='safe-exit'){closeDialog();view='home';render();}
    if(action==='finish-support'){active.safety=true;finish();}
    if(action==='download')download();
    if(action==='delete-session')openDialog('<h2 id="dialog-title">Удалить эту карту?</h2><p>Вернуть её после удаления не получится. Остальные сессии и черновик останутся.</p><div class="actions"><button data-action="close-dialog">Отмена</button><button data-action="delete-confirmed">Удалить карту</button></div>');
    if(action==='delete-confirmed'){state.sessions=state.sessions.filter(s=>s.id!==selected.id);persist();selected=null;closeDialog();view='history';render();}
    if(action==='clear-confirm')openDialog('<h2 id="dialog-title">Удалить все записи?</h2><p>Будут удалены черновик и все завершённые карты этого сайта, включая данные прежней версии. Это нельзя отменить.</p><div class="actions"><button data-action="close-dialog">Отмена</button><button data-action="clear-all">Удалить все записи</button></div>');
    if(action==='clear-all'){
      try{[KEY,'bi_sessions_v04','bi_draft_v04'].forEach(k=>localStorage.removeItem(k));state={version:1,revision:0,draft:null,sessions:[]};active=null;selected=null;blocked=false;revision=0;lastSaved=null;warn('');closeDialog();view='home';render();}catch{warn('Не удалось удалить записи из хранилища. Удалите данные сайта в настройках браузера.');closeDialog();}
    }
  });
  window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null){blocked=true;warn('Сохранения изменились в другой вкладке. Обновите страницу, чтобы увидеть их. Текущая вкладка больше не перезаписывает общие данные.');}});
  load();render();
})();
