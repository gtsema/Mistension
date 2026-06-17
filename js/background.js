import { Utils } from './utils.js';

chrome.runtime.onInstalled.addListener(() => {
	// Очищаем локальное хранилище приложения
	chrome.storage.local.clear();

	chrome.storage.local.set({
		autofill: false,
		locators: new Map()
	});

	Utils.importLocatorsAuto();
});

chrome.commands.onCommand.addListener((cmd) => {
	if(cmd === 'autofill') {
		chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, {action: "autofill"});
		});
	}
});
