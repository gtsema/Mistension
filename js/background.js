import { Utils } from './utils.js';

chrome.runtime.onInstalled.addListener(() => {
	chrome.storage.local.get(['locators'], (result) => {
		if (!result['locators'] || Object.keys(result['locators']).length === 0) {
			chrome.storage.local.set({
				autofill: false,
				locators: {}
			}, () => {
				Utils.importLocatorsAuto();
			});
		}
	});
});

chrome.commands.onCommand.addListener((cmd) => {
	if(cmd === 'autofill') {
		chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
			chrome.tabs.sendMessage(tabs[0].id, {action: "autofill"});
		});
	}
});
