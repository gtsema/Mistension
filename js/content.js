let customCursorEnabled = false;
const cursor = chrome.runtime.getURL('img/cursor.png');

const notification = document.createElement('div');
notification.id = 'notification';
notification.className= 'notification'
notification.innerText = 'CATS!';
notification.classList.add('hide');

window.addEventListener('load', () => {
	document.body.appendChild(notification);
	
	let link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = chrome.runtime.getURL('../css/content.css');
	(document.head || document.documentElement).appendChild(link);
	
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.msgType === 'paste') {
			let el = document.activeElement;
			let sel = document.getSelection();
			
			if (el.className.startsWith('ProseMirror') && sel.getRangeAt && sel.rangeCount) {
				var range = sel.getRangeAt(0);
				range.deleteContents();
				range.insertNode(document.createTextNode(request.msg));
			} else {
				showToast('Нельзя сотворить здесь');
			}
		} else if(request.msgType === 'showToast') {
			showToast(request.msg);
		}
	});
});

function showToast(msg) {
	let el = document.getElementById('notification');
	el.innerText = msg;
	el.classList.remove('hide');
	setTimeout(() => {
		el.classList.add('hide');
	}, 1000);
}

document.addEventListener('click', (e) => {
	if(customCursorEnabled) {
		getLocators()
			.then((locators) => {
				locators.forEach((v, k, map) => {
					let elem = document.evaluate(k, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
					if(elem === e.target) {
						showConfetti(e.clientX, e.clientY);
						e.target.value = v.value;
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

async function getLocators() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(['locators'], (result) => {
			if (result['locators']) {
				const retrievedMap = new Map(Object.entries(result['locators']));
				resolve(retrievedMap);
			} else {
				reject(new Error('Данных по ключу не найдено.'));
			}
		});
	});
}