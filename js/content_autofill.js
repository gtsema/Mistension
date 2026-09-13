(async() => {
	const randomStringUtilsModule = await import(chrome.runtime.getURL('js/randomStringUtils.js'));
	const { RandomStringUtils } = await randomStringUtilsModule;
	
	const utilsModule = await import(chrome.runtime.getURL('js/utils.js'));
	const { Utils } = await utilsModule;

	let customCursorEnabled = false;
	let cachedLocators = null;
	const cursor = chrome.runtime.getURL('img/cursor.png');

	// Кэшируем локаторы в памяти для исключения задержек при клике
	async function loadLocators() {
		try {
			cachedLocators = await Utils.getLocators();
		} catch (err) {
			console.error('Ошибка загрузки локаторов:', err);
		}
	}
	await loadLocators();

	// Автоматически обновляем кэш при изменении базы локаторов в настройках
	chrome.storage.onChanged.addListener((changes, area) => {
		if (area === 'local' && changes.locators) {
			loadLocators();
		}
	});

	// Проверка, подходит ли текущий URL страницы под заданное правило / список правил
	function isUrlMatching(urlPatterns) {
		if (!urlPatterns || typeof urlPatterns !== 'string' || !urlPatterns.trim()) {
			return true; // Если поле пустое — локатор работает везде
		}

		const href = window.location.href;
		const pathname = window.location.pathname + window.location.search;
		const patterns = urlPatterns.split(',');

		return patterns.some(pattern => {
			const p = pattern.trim();
			if (!p) return false;

			try {
				// Если паттерн задан как относительный путь (начинается с /)
				const target = p.startsWith('/') ? pathname : href;

				// Преобразуем wildcard '*' в regex '.*', экранируя остальные спецсимволы
				const escaped = p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
				const regex = new RegExp('^' + escaped + '$', 'i');

				return regex.test(target) || regex.test(href);
			} catch (e) {
				return false;
			}
		});
	}

	// Универсальный поиск элемента по CSS-селектору или XPath
	function findElement(selector) {
		if (!selector || typeof selector !== 'string') return null;
		const trimmed = selector.trim();
		if (!trimmed) return null;

		// 1. Если строка явно является XPath выражением (начинается с //, .//, (, xpath:, ancestor::, descendant::)
		if (trimmed.startsWith('//') || trimmed.startsWith('.//') || trimmed.startsWith('(') || trimmed.startsWith('xpath:') || trimmed.startsWith('ancestor::') || trimmed.startsWith('descendant::')) {
			const xpathExpr = trimmed.startsWith('xpath:') ? trimmed.slice(6).trim() : trimmed;
			try {
				const xpathResult = document.evaluate(xpathExpr, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
				return xpathResult.singleNodeValue;
			} catch (err) {
				console.warn(`Некорректный XPath: ${xpathExpr}`, err);
				return null;
			}
		}

		// 2. Пробуем найти элемент как CSS-селектор
		try {
			const cssElement = document.querySelector(trimmed);
			if (cssElement) {
				return cssElement;
			}
		} catch (err) {
			// Если селектор невалиден как CSS (например, кастомный XPath без ведущих слэшей), пробуем XPath
		}

		// 3. Fallback: пробуем выполнить как XPath
		try {
			const xpathResult = document.evaluate(trimmed, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
			return xpathResult.singleNodeValue;
		} catch (err) {
			// Не является валидным XPath
			return null;
		}
	}

	// Reentrancy guard: пока идёт асинхронное заполнение одного виджета (открытие
	// ng-select / typeahead, выбор опции) — блокируем только ПОВТОРНЫЕ клики по тому
	// же виджету, чтобы не запускать параллельные fillField на одном поле. Клики по
	// ДРУГИМ полям не блокируются — иначе медленный typeahead (таймаут) «подвешивал»
	// и соседние поля (например, клик в «Квартиру» пока ждёт «Дом»).
	// Рекурсия на собственных синтетических событиях отсекается отдельно — guard'ом
	// !e.isTrusted ниже.
	let fillingHost = null;

	document.addEventListener('click', (e) => {
		if (!customCursorEnabled || !cachedLocators || cachedLocators.size === 0) return;

		// Игнорируем синтетические клики (isTrusted === false), которые мы сами
		// диспатчим внутри fillNgSelect/fillTypeahead (mousedown/click на input и опции).
		// У таких событий clientX/clientY = 0 — отсюда были «конфетти в левом верхнем
		// углу» и рекурсивный повторный запуск fillField с координатами (0,0).
		if (!e.isTrusted) return;

		// Не запускаем новое заполнение того же виджета, пока не завершилось предыдущее.
		// Клик в другое поле — разрешается (fillingHost его не содержит).
		if (fillingHost && fillingHost.contains(e.target)) return;

		const targetElement = e.target.closest('input, textarea, select') || e.target;

		// Группируем локаторы по селектору (xpath/css). Внутри группы различаем:
		//   • specific   — локаторы с непустым url, подходящие текущей странице;
		//   • universal  — локаторы с пустым url (срабатывают везде).
		// Локатор с пустым url применяется на странице только если для того же селектора
		// нет более «специфичного» локатора с url, подходящего этой странице.
		const bySelector = new Map();
		for (const [k, v] of cachedLocators) {
			// Пропускаем визуальные разделители
			if (v.type === 'divider' || (!v.xpath && !v.selector)) {
				continue;
			}

			const selector = v.xpath || v.selector;
			if (!bySelector.has(selector)) {
				bySelector.set(selector, { specific: [], universal: null });
			}
			const bucket = bySelector.get(selector);

			const hasUrl = !!(v.url && String(v.url).trim());
			if (hasUrl) {
				if (isUrlMatching(v.url)) {
					bucket.specific.push(v);
				}
			} else {
				// Универсальный — единственный на селектор; запоминаем его значение.
				if (!bucket.universal) bucket.universal = v;
			}
		}

		for (const [selector, bucket] of bySelector) {
			// Приоритет у специфичных локаторов; универсальный используется, лишь если
			// ни один специфичный не сработал на текущей странице.
			const effective = bucket.specific.length ? bucket.specific : (bucket.universal ? [bucket.universal] : []);
			if (!effective.length) continue;

		const matchedNode = findElement(selector);
			if (matchedNode && isClickOnLocator(matchedNode, e.target)) {
				// Хост виджета: ng-select / select / typeahead-обёртка / сам локатор.
				fillingHost = matchedNode.closest('ng-select, select, .typeahead__wrapper') || matchedNode;
				fillField(matchedNode, effective[0].value, e.clientX, e.clientY)
					.catch(err => console.error('Mistension fillField:', err))
					.finally(() => { fillingHost = null; });
				break;
			}
		}
	});
	// Правило совпадения клика и локатора.
	//   • Прямое попадание: клик в сам локатор или в его потомка.
	//   • Составные виджеты (ng-select / [role=combobox] / <select>): локатор может
	//     указывать на внутренний input, но клик может прийтись в любую зону виджета
	//     (плейсхолдер, контейнер, стрелка, значение) — это тоже клик по полю.
	//     Без этого ng-select сработал бы лишь при попадании в узкий inner <input>
	//     (он занимает ~32% площади контейнера).
	function isClickOnLocator(locatorNode, clickTarget) {
		if (!locatorNode || !clickTarget) return false;
		if (locatorNode === clickTarget || locatorNode.contains(clickTarget)) return true;

		// Если клик пришёлся в интерактивную обёртку-виджет, содержащую локатор —
		// считаем, что это клик по полю.
		// ВАЖНО: selector closest не должен матчить сам input[role=combobox],
		// иначе host'ом станет сам input и проверка localhost.contains(...) вновь
		// ограничится узкой областью ввода. Поэтому ищем именно ng-select / select.
		const widgetHost = locatorNode.closest('ng-select, select, .typeahead__wrapper');
		if (widgetHost && widgetHost !== locatorNode && widgetHost.contains(clickTarget)) return true;

		// ВНИМАНИЕ: здесь НЕ должно быть правила "клик в любой предок локатора"
		// (clickTarget.contains(locatorNode)). Крупные контейнеры (fieldset,
		// .form-group, section) содержат сразу несколько полей — такое правило
		// приводило к ложным срабатываниям (конфетти/заполнение соседних полей
		// при клике в "область вокруг"). Для <label for> браузер сам маршрутизирует
		// клик в связанный input.

		return false;
	}

	// Различаем:
	//   • ng-select (Angular) combobox — выбирает опцию из выпадающего списка;
	//   • нативный <select> — выбирает option;
	//   • обычный input/textarea — вставка значения через нативный сеттер.
	async function fillField(element, template, x, y) {
		showConfetti(x, y);

		const generatedValue = RandomStringUtils.randomByTemplate(template).substring(0, 128);

		// ng-select: клик мог прийти в сам <ng-select> или его контейнер — резолвим inner input
		const ngSelectHost = element.closest && element.closest('ng-select');
		if (ngSelectHost) {
			const innerInput = element.matches('input[role="combobox"]')
				? element
				: ngSelectHost.querySelector('input[role="combobox"]');
			if (innerInput) {
				await fillNgSelect(innerInput, generatedValue);
				return;
			}
		}

		// NGB Typeahead (Angular ng-bootstrap): поля «Регион»/«Населённый пункт» адресов.
		// Открывается при вводе, опции грузятся асинхронно с бэкенда. Если опция найдена —
		// выбираем её (список закрывается); если не найдена — список НЕ закрываем.
		const typeaheadHost = element.closest && element.closest('.typeahead__wrapper');
		if (element.tagName === 'INPUT' && typeaheadHost) {
			await fillTypeahead(element, generatedValue);
			return;
		}

		// Нативный <select>
		if (element.tagName === 'SELECT') {
			fillNativeSelect(element, generatedValue);
			return;
		}

		// Обычный input/textarea: поддержка реактивных фреймворков (React/Vue/Angular)
		// через нативный сеттер прототипа
		const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
			|| Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;

		if (nativeSetter) {
			nativeSetter.call(element, generatedValue);
		} else {
			element.value = generatedValue;
		}

		element.dispatchEvent(new Event('input', { bubbles: true, cancelable: false }));
		element.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));
	}

	// Заполнение ng-select (Angular @angular-select/ng-select).
	// ng-select игнорирует прямую запись input.value — значение можно задать только
	// выбрав опцию из выпадающего списка. Логика:
	//   1) сбросить возможный остаток фильтра в поле поиска;
	//   2) открыть dropdown (mousedown + click, фолбэк — ArrowDown);
	//   3) найти опцию по тексту (точное → startsWith → contains, без учёта регистра);
	//   4) выбрать её кликом (mousedown + click), что закрывает dropdown и помечает форму ng-dirty.
	async function fillNgSelect(input, value) {
		const ngSelect = input.closest('ng-select');
		if (!ngSelect) return false;

		const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
		const setInputValue = (v) => {
			if (nativeInputSetter) nativeInputSetter.call(input, v);
			else input.value = v;
			input.dispatchEvent(new Event('input', { bubbles: true }));
		};

		const waitForPanel = async (timeoutMs) => {
			const start = Date.now();
			while (Date.now() - start < timeoutMs) {
				await new Promise(r => setTimeout(r, 30));
				const panel = ngSelect.querySelector('ng-dropdown-panel');
				if (panel) return panel;
			}
			return null;
		};

		const openDropdown = async () => {
			// сбрасываем фильтр, чтобы все опции были видны
			setInputValue('');
			await new Promise(r => setTimeout(r, 60));

			if (input.getAttribute('aria-expanded') !== 'true') {
				input.focus();
				input.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
				input.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			}
			let panel = await waitForPanel(600);
			if (panel) return panel;

			// Фолбэк: открыть стрелкой вниз
			input.focus();
			input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
			return waitForPanel(300);
		};

		const norm = (s) => (s || '').trim().toLowerCase();
		const normValue = norm(value);

		const matchOption = () => {
			const opts = Array.from(ngSelect.querySelectorAll('ng-dropdown-panel .ng-option'))
				.filter(o => !o.classList.contains('ng-option-disabled'));
			if (!opts.length) return null;
			return opts.find(o => norm(o.textContent) === normValue)
				|| opts.find(o => norm(o.textContent).startsWith(normValue))
				|| opts.find(o => norm(o.textContent).includes(normValue));
		};

		let panel = await openDropdown();
		if (!panel) {
			console.warn('Mistension: ng-select dropdown не открылся', ngSelect);
			return false;
		}

		// Небольшая задержка для дорисовки опций
		await new Promise(r => setTimeout(r, 60));

		let opt = matchOption();
		if (!opt) {
			// Возможно, применился фильтр — повторно открываем с чистым полем
			setInputValue('');
			await new Promise(r => setTimeout(r, 80));
			opt = matchOption();
		}

		if (!opt) {
			console.warn(`Mistension: опция "${value}" не найдена в ng-select`, ngSelect);
			// Закрываем dropdown, чтобы не оставить открытым
			input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
			document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
			return false;
		}

		opt.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		opt.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await new Promise(r => setTimeout(r, 120));
		return true;
	}

	// Заполнение NGB Typeahead (Angular ng-bootstrap) — поля «Регион»/«Населённый пункт»/
	// «Улица»/«Дом» в блоках адреса регистрации/проживания, а также «Код подразделения».
	// Особенности:
	//   • dropdown (<typeahead-container role=listbox>) открывается при вводе текста,
	//     опции (<button role=option class=dropdown-item>) грузятся асинхронно с бэкенда;
	//   • текст опции содержит <strong>-подсветку совпадения (напр. «г. Москва»),
	//     поэтому сравниваем по textContent с нормализацией пробелов;
	//   • прямой input.value не валидируется формой — нужно выбрать опцию кликом,
	//     тогда input.value примет текст опции и форма станет ng-dirty.
	// Поведение (простой вариант по требованию):
	//   • вводим значение в поле;
	//   • если за короткое окно (OPTION_WAIT_MS) в списке нашлась подходящая опция —
	//     выбираем её (список закрывается сам);
	//   • если опция не нашлась или поиск затялся — ничего не трогаем: поле и список
	//     остаются как есть, пользователь может сразу доработать руками.
	// Никакой очистки поля, ретраев и fallback — чтобы не «дёргать» список и не
	// перезатирать ввод пользователя во время ожидания.
	const TYPEAHEAD_OPTION_WAIT_MS = 500;

	async function fillTypeahead(input, value) {
		const wrapper = input.closest('.typeahead__wrapper');
		if (!wrapper) return false;

		const nativeInputSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;

		// Вводим значение и запускаем поиск.
		input.focus();
		if (nativeInputSetter) nativeInputSetter.call(input, value);
		else input.value = value;
		input.dispatchEvent(new Event('input', { bubbles: true }));
		input.dispatchEvent(new KeyboardEvent('keyup', { key: value.slice(-1) || 'a', bubbles: true }));

		// Короткое окно ожидания опций. Поллим часто, чтобы заметить их сразу.
		const start = Date.now();
		let opts = [];
		while (Date.now() - start < TYPEAHEAD_OPTION_WAIT_MS) {
			await new Promise(r => setTimeout(r, 30));
			const container = wrapper.querySelector('typeahead-container');
			if (!container) continue;
			opts = Array.from(container.querySelectorAll('button[role="option"], .dropdown-item'))
				.filter(o => !o.classList.contains('disabled')
					&& o.textContent.trim()
					&& !/не найден|no result|ничего не найдено/i.test(o.textContent));
			if (opts.length) break;
		}

		if (!opts.length) return false; // поиск долгий или без результата — оставляем как есть

		const norm = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ');
		const normValue = norm(value);
		const opt = opts.find(o => norm(o.textContent) === normValue)
			|| opts.find(o => norm(o.textContent).startsWith(normValue))
			|| opts.find(o => norm(o.textContent).includes(normValue));

		if (!opt) return false; // совпадения нет — список оставляем открытым

		opt.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
		opt.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		await new Promise(r => setTimeout(r, 150));
		return true;
	}

	// Заполнение нативного <select>.
	// Ищем option по тексту или value (точное → startsWith → contains), выбираем и
	// диспатчим change для совместимости с реактивными обёртками.
	function fillNativeSelect(select, value) {
		const norm = (s) => (s || '').trim().toLowerCase();
		const normValue = norm(value);
		const opts = Array.from(select.options || []);

		const match = opts.find(o => norm(o.text) === normValue || norm(o.value) === normValue)
			|| opts.find(o => norm(o.text).startsWith(normValue))
			|| opts.find(o => norm(o.text).includes(normValue));

		const targetValue = match ? match.value : value;
		const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLSelectElement.prototype, 'value')?.set;
		if (nativeSetter) nativeSetter.call(select, targetValue);
		else select.value = targetValue;

		select.dispatchEvent(new Event('change', { bubbles: true }));
		return !!match;
	}

	chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	  if (request.action === "autofill") {
		customCursorEnabled = !customCursorEnabled;
		
		if(customCursorEnabled) {
			document.documentElement.style.setProperty('--custom-cursor', `url(${cursor}), auto`);
		} else {
			document.documentElement.style.setProperty('--custom-cursor', `auto`);
		}
	  }
	});

	function showConfetti(x, y) {
		for (let i = 0; i < 10; i++) {
			let confetti = document.createElement('div');
			confetti.className = 'confetti';
			document.body.appendChild(confetti);

			let xEnd = 100 - Math.random() * 200;
			let yEnd = 100 - Math.random() * 200;

			confetti.style.left = x + 'px';
			confetti.style.top = y + 'px';
			confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
			confetti.style.setProperty('--x-end', `${xEnd}px`);
			confetti.style.setProperty('--y-end', `${yEnd}px`);
			confetti.style.animation = `confettiAnimation 0.75s forwards`;

			confetti.addEventListener('animationend', () => {
				confetti.remove();
			});
		}
	}
})();