export class Utils {
	
	static getLocators() {
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
	
}
