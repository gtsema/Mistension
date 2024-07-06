export class RandomStringUtils {
	
	static randomByTemplate(template) {
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
}
