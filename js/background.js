import * as constants from './constants.js'

chrome.runtime.onInstalled.addListener(() => {
	// Очищаем локальное хранилище приложения
	chrome.storage.local.clear();
	
	// Устанавливаем дефолтное значение зоны
	chrome.storage.local.set({'zone': 'stab'});
	
	// Устанавливаем дефолтное значение автозаполнения
	chrome.storage.local.set({'autofill': false});
	
	constants.SERVICES.forEach((v, k, map) => {
		// Настройка контекстного меню
		if(v == 1) {
			chrome.contextMenus.create({
				"id": k,
				"title": k,
				"contexts": ["editable"]
			});
		}
		
		// Инициализируем бд для страницы options
		chrome.storage.local.set({[k]: v});
	});
	
	// Инициализация xpath элемента (Форма создания заказа - телефон) для автозаполнения. Для тестирования, после разработки ui - удалить.
	let elem = {
		desc: 'Создание заказа. Поиск по телефону',
		value: '+7 952 265-51-19'
	};
	
	let elem1 = {
		desc: 'Создание заказа. Номер карты',
		value: '1234567890'
	};
	
	let elem2 = {
		desc: 'Создание пациента. Фамилия',
		value: 'Иванов'
	};
	
	const locators = new Map([
		["//input[contains(@data-test, 'Телефон')]", elem],
		["//input[contains(@id, 'card-num')]", elem1],
		["//input[contains(@id, 'lastName')]", elem2]
	]);
	
	chrome.storage.local.set({'locators': Object.fromEntries(locators)});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if(constants.SERVICES.has(info.menuItemId) && tab.url.startsWith('https://youtrack.medlinx.online')) {
		chrome.storage.local.get('zone', (res) => {
			fetchData(constants.ZONES.get(res.zone) + "/version")
				.then(res => {
					let v = res.find(item => item.version.name == info.menuItemId);
					let msg = v.version.name + ": " + v.version.version;
					chrome.tabs.sendMessage(tab.id, {"msgType": "paste", "msg": msg});
				});
		});
	}
});

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('There has been a problem with your fetch operation:', error);
	chrome.tabs.sendMessage(tab.id, {"msgType": "showToast", "msg": error.message});
  }
}

chrome.commands.onCommand.addListener((cmd) => {
	if(cmd === 'autofill') {
		chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, {action: "autofill"});
		});
	}
});
