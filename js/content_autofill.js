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

	document.addEventListener('click', (e) => {
		if (!customCursorEnabled || !cachedLocators || cachedLocators.size === 0) return;

		const targetElement = e.target.closest('input, textarea, select') || e.target;

		for (const [k, v] of cachedLocators) {
			// Пропускаем визуальные разделители
			if (v.type === 'divider' || (!v.xpath && !v.selector)) {
				continue;
			}

			// Проверяем фильтрацию по URL страниц
			if (!isUrlMatching(v.url)) {
				continue;
			}

			const selector = v.xpath || v.selector;
			const matchedNode = findElement(selector);

			if (matchedNode && (matchedNode === targetElement || matchedNode.contains(e.target))) {
				fillField(matchedNode, v.value, e.clientX, e.clientY);
				break;
			}
		}
	});

	function fillField(element, template, x, y) {
		showConfetti(x, y);

		const generatedValue = RandomStringUtils.randomByTemplate(template).substring(0, 128);

		// Поддержка реактивных фреймворков (React/Vue) через нативный сеттер прототипа
		const nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
			|| Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;

		if (nativeSetter) {
			nativeSetter.call(element, generatedValue);
		} else {
			element.value = generatedValue;
		}

		element.dispatchEvent(new Event('input', { bubbles: true, cancelable: false }));
		element.dispatchEvent(new Event('change', { bubbles: true, cancelable: false }));

		setTimeout(() => {
			let dropdown = element.parentElement?.querySelector('[role=listbox]');
			if (dropdown) {
				let items = dropdown.querySelectorAll('[role=option]');
				if (items.length === 1 && items[0].textContent.trim() === element.value) {
					items[0].click();
				}
			}
		}, 200);
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