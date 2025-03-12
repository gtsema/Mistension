(async() => {
	const randomStringUtilsModule = await import(chrome.runtime.getURL('js/randomStringUtils.js'));
	const { RandomStringUtils } = await randomStringUtilsModule;
	
	const utilsModule = await import(chrome.runtime.getURL('js/utils.js'));
	const { Utils } = await utilsModule;

	let customCursorEnabled = false;
	const cursor = chrome.runtime.getURL('img/cursor.png');

	document.addEventListener('click', (e) => {
		if(customCursorEnabled) {
			Utils.getLocators().then((locators) => {
				locators.forEach((v, k, map) => {
					let xpathResult = document.evaluate(v.xpath, document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
					// Проверяем, входит ли e.target в найденное множество
					for (let i = 0; i < xpathResult.snapshotLength; i++) {
						let node = xpathResult.snapshotItem(i);
						if (node === e.target) { 
							showConfetti(e.clientX, e.clientY);
							e.target.value = RandomStringUtils.randomByTemplate(v.value).substring(0, 128);
							e.target.dispatchEvent(new Event('input', { bubbles: true, cancelable: false }));
							
							setTimeout(() => {
								let dropdown = e.target.parentElement.querySelector('[role=listbox]');
								
								if (dropdown) {
									let items = dropdown.querySelectorAll('[role=option]');
									if (items.length === 1 && items[0].textContent.trim() === e.target.value) {
										items[0].click();
									}
								}
							}, 200);
							break;
						}
					}
				});
			})
			.catch(err => console.error(err));
		}
	});

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