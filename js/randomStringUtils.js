export class RandomStringUtils {
	static _dateStep = 0;

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
	
	static _formatDate(d) {
		const day = String(d.getDate()).padStart(2, '0');
		const month = String(d.getMonth() + 1).padStart(2, '0');
		const year = String(d.getFullYear());
		return `${day}.${month}.${year}`;
	}

	static _generateDate() {
		const now = new Date();
		const currentStep = this._dateStep;
		this._dateStep = (this._dateStep + 1) % 3;

		if (currentStep === 0) {
			// Клик 1: Случайный возраст от 0 до 18 лет (несовершеннолетний / ребёнок)
			const randomYearsAgo = Math.floor(Math.random() * 18); // 0..17 лет
			const randomMonth = Math.floor(Math.random() * 12);
			const randomDay = Math.floor(Math.random() * 28) + 1;
			const birthDate = new Date(now.getFullYear() - randomYearsAgo, randomMonth, randomDay);
			if (birthDate > now) {
				birthDate.setTime(now.getTime() - Math.floor(Math.random() * 180 * 24 * 3600 * 1000));
			}
			return this._formatDate(birthDate);
		} else if (currentStep === 1) {
			// Клик 2: Ровно 18 лет (граница совершеннолетия)
			const birthDate = new Date(now.getFullYear() - 18, now.getMonth(), now.getDate());
			return this._formatDate(birthDate);
		} else {
			// Клик 3: Случайный возраст от 18 до 100 лет (взрослый / пожилой)
			const randomYearsAgo = Math.floor(Math.random() * (100 - 18 + 1)) + 18; // 18..100 лет
			const randomMonth = Math.floor(Math.random() * 12);
			const randomDay = Math.floor(Math.random() * 28) + 1;
			const birthDate = new Date(now.getFullYear() - randomYearsAgo, randomMonth, randomDay);
			return this._formatDate(birthDate);
		}
	}
}
