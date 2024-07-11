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
					let elem = document.evaluate(v.xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
					if(elem === e.target) {
						showConfetti(e.clientX, e.clientY);
						e.target.value = RandomStringUtils.randomByTemplate(v.value).substring(0, 128);
						e.target.dispatchEvent(new Event('input', { bubbles: true, cancelable: false }));
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