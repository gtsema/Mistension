import * as constants from './constants.js';
import { RandomStringUtils } from './randomStringUtils.js';
import { Utils } from './utils.js';

chrome.runtime.onInstalled.addListener(() => {
	// Очищаем локальное хранилище приложения
	chrome.storage.local.clear();
	
	// Устанавливаем дефолтное значение зоны
	chrome.storage.local.set({'zone': 'release'});
	
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
		Utils.importLocatorsAuto();
	});
	
	chrome.storage.local.set({'locators': new Map()});
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
	if(constants.SERVICES.has(info.menuItemId) && tab.url.startsWith('https://youtrack.medlinx.online')) {
		chrome.storage.local.get('zone', (res) => {
			fetchData(constants.ZONES.get(res.zone) + "/version", tab)
				.then(res => {
					let v = res.find(item => item.version.name == info.menuItemId);
					let msg = v.version.name + ": " + v.version.version;
					chrome.tabs.sendMessage(tab.id, {"msgType": "paste", "msg": msg});
				});
		});
	}
});

async function fetchData(url, tab) {
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
