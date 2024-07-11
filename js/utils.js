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
	};
	
	static importLocatorsManual() {
		this.openFile()
			.then(files => files[0].getFile())
			.then(file => file.text())
			.then(text => this.importLocators(text))
			.catch(e => console.log("Невозможно импортировать файл с локаторами: " + e))
			.finally(() => document.location.reload());
	}
	
	static importLocatorsAuto() {
		fetch("../mistension_locators.json")
			.then(res => res.text())
			.then(text => this.importLocators(text))
			.catch(e => console.log("Невозможно импортировать файл с локаторами: " + e));
	}
	
	static importLocators(text) {
		this.validateImport(JSON.parse(text))
			.then(obj => {
				this.getLocators()
					.then(locators => {
						Object.entries(obj).forEach(entry => {
							locators.set(entry[0], entry[1]);
						});
						chrome.storage.local.set({'locators': Object.fromEntries(locators)});
					});
			})
			.catch(e => console.log("Файл с локаторами имеет неверный формат: " + e));
	};
	
	static openFile() {
		return window.showOpenFilePicker({
		  types: [{ accept: { "json/*": [".json"] }}],
		  acceptMultiple: false
		});
	};
	
	static validateImport(importData) {
		return new Promise((res, rej) => {
			if(Object.keys(importData).length === 0) { rej(new Error("Whoops! Файл не прошёл валидацию(")); }
			
			Object.values(importData).forEach(v => {
				if(Object.keys(v).length != 3 ||
					Object.keys(v)[0] != 'desc' || Object.keys(v)[1] != 'value' || Object.keys(v)[2] != 'xpath' ||
					Object.values(v)[0].length > 64 || Object.values(v)[1].length > 64 || Object.values(v)[2].length > 64) {
						
						rej(new Error("Whoops! Файл не прошёл валидацию("));
				}
			});
			
			res(importData);
		});
	};
	
	static exportLocators() {
		Utils.getLocators().then((locators) => {
			let jsonStr = '';
			for (const [key, value] of locators) {
			  jsonStr += `"${key}": ${JSON.stringify(value)},`;
			}
			jsonStr = `{${jsonStr}}`.replace(/,}$/, '}');
			this.saveAs(jsonStr, 'mistension_locators.json');
		});
	};
	
	static saveAs(text, filename) {
		const blob = new Blob([text], { type: 'text/plain' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = filename;
		a.click();
		URL.revokeObjectURL(url);
	  }
}
