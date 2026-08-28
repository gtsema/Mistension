export class Utils {
	static getLocators() {
		return new Promise((resolve) => {
			chrome.storage.local.get(['locators'], (result) => {
				const map = new Map();
				const data = result && result['locators'];

				if (Array.isArray(data)) {
					// Массив объектов - сохраняет 100% строгий порядок элементов в Chromium Storage
					data.forEach(item => {
						if (item && item.id) {
							const { id, ...rest } = item;
							map.set(id, rest);
						}
					});
				} else if (data && typeof data === 'object') {
					// Обратная совместимость с форматом Object
					Object.entries(data).forEach(([k, v]) => {
						map.set(k, v);
					});
				}
				resolve(map);
			});
		});
	};

	static saveLocators(locatorsMap) {
		const array = [];
		for (const [key, value] of locatorsMap) {
			array.push({ id: key, ...value });
		}
		return new Promise((resolve) => {
			chrome.storage.local.set({ 'locators': array }, () => {
				resolve(array);
			});
		});
	}
	
	static importLocatorsManual() {
		if (window.showOpenFilePicker) {
			this.openFile()
				.then(files => files[0].getFile())
				.then(file => file.text())
				.then(text => this.importLocators(text))
				.then(() => {
					document.location.reload();
				})
				.catch(e => {
					if (e.name !== 'AbortError') {
						console.warn("showOpenFilePicker не сработал, пробуем fallback:", e);
						this.fallbackFileInput();
					}
				});
		} else {
			this.fallbackFileInput();
		}
	}

	static fallbackFileInput() {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json,application/json';
		input.onchange = (e) => {
			const file = e.target.files[0];
			if (file) {
				const reader = new FileReader();
				reader.onload = (event) => {
					this.importLocators(event.target.result)
						.then(() => {
							document.location.reload();
						})
						.catch(err => alert("Ошибка импорта: " + err.message));
				};
				reader.readAsText(file);
			}
		};
		input.click();
	}
	
	static importLocatorsAuto() {
		fetch(chrome.runtime.getURL("mistension_locators.json"))
			.then(res => res.text())
			.then(text => this.importLocators(text))
			.catch(e => console.error("Невозможно импортировать файл с локаторами:", e));
	}
	
	static importLocators(text) {
		return this.validateImport(JSON.parse(text))
			.then(array => {
				return new Promise((resolve) => {
					// Сохраняем в виде упорядоченного массива
					chrome.storage.local.set({ 'locators': array }, () => {
						resolve(array);
					});
				});
			})
			.catch(e => {
				console.error("Файл с локаторами имеет неверный формат:", e);
				throw e;
			});
	};
	
	static openFile() {
		return window.showOpenFilePicker({
		  types: [{ accept: { "json/*": [".json"] }}],
		  acceptMultiple: false
		});
	};
	
	static validateImport(importData) {
		return new Promise((res, rej) => {
			if (!importData || typeof importData !== 'object') {
				return rej(new Error("Файл не прошёл валидацию. Пустые данные."));
			}

			const list = [];
			const entries = Array.isArray(importData)
				? importData.map((item, idx) => [item.id || `loc_${idx}`, item])
				: Object.entries(importData);

			if (entries.length === 0) {
				return rej(new Error("Файл не прошёл валидацию. Ключи не обнаружены."));
			}
			
			for (const [key, v] of entries) {
				if (!v || typeof v !== 'object') {
					return rej(new Error(`Элемент [${key}] имеет неверный формат.`));
				}

				// Поддержка разделителей / групп
				if (v.type === 'divider') {
					list.push({
						id: key,
						type: 'divider',
						desc: String(v.desc || 'Разделитель').substring(0, 128)
					});
					continue;
				}

				const desc = v.desc;
				const xpath = v.xpath || v.selector;
				const value = v.value;
				const url = typeof v.url === 'string' ? v.url : (typeof v.pages === 'string' ? v.pages : '');

				if (!desc || !xpath || !value) {
					return rej(new Error(`Элемент [${key}] не содержит обязательных полей (desc, xpath/selector, value).`));
				}

				list.push({
					id: key,
					desc: String(desc).substring(0, 128),
					xpath: String(xpath),
					value: String(value).substring(0, 128),
					url: String(url)
				});
			}
			
			res(list);
		});
	};
	
	static exportLocators() {
		Utils.getLocators().then((locators) => {
			const obj = {};
			for (const [key, value] of locators) {
				if (value.type === 'divider') {
					obj[key] = {
						type: 'divider',
						desc: value.desc || 'Разделитель'
					};
				} else {
					obj[key] = {
						desc: value.desc || '',
						xpath: value.xpath || value.selector || '',
						url: value.url || '',
						value: value.value || ''
					};
				}
			}
			const jsonStr = JSON.stringify(obj, null, 2);
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
