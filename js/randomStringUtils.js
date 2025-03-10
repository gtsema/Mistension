export class RandomStringUtils {
	
	static randomByTemplate(template) {
		if (template === '%snils') return this._generateSNILS();
		
		if (template === '%date') {
			return this._generateDate();
		}
		
		const regex = /(%[dsm][1-9]\d?)/g;
		let result = '';
		let endIdx = 0;
		for (const match of template.matchAll(regex)) {
			let group = match[0];    
			let startIdx = match.index;
			result += template.substring(endIdx, startIdx);
			result += this._random(group[1], Number(group.substr(2)));
			endIdx = startIdx + group.length;
		}
		result += template.substr(endIdx);
		
		return result;
	}
	
	static randomAlphabetic(count) {
		return this._random('s', count);
	}
	
	static randomAlphanumeric(count) {
		return this._random('m', count);
	}
	
	static randomNumeric(count) {
		return this._random('d', count);
	}
	
	static _random(type, count) {
		const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
		const numbers = '0123456789';
		let characters = '';

		if (type === 's') {
			characters = letters;
		} else if (type === 'd') {
			characters = numbers;
		} else if (type === 'm') {
			characters = numbers + letters;
		} else {
			console.error('Invalid type specified. Use "s" - letters, "d" - numbers or "m" - mixed');
			return null;
		}

		let result = '';
		const charactersLength = characters.length;
		for (let i = 0; i < count; i++) {
			result += characters.charAt(Math.floor(Math.random() * charactersLength));
		}

		return result;
	}
	
	static _generateSNILS() {
		let snils = Array.from({ length: 9 }, () => Math.floor(Math.random() * 10)).join('');
		let checksum = snils.split('').reduce((sum, digit, index) => sum + digit * (9 - index), 0) % 101;
		if (checksum > 99) checksum = 0;
		return `${snils.substr(0, 3)}-${snils.substr(3, 3)}-${snils.substr(6, 3)} ${checksum.toString().padStart(2, '0')}`;
	}
	
	static _generateDate() {
		const randomDay = String(Math.floor(Math.random() * 28) + 1).padStart(2, "0");
		const randomMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, "0");
		const randomYear = String(Math.floor(Math.random() * 30) + 1990);
		return `${randomDay}.${randomMonth}.${randomYear}`;
	}
}
