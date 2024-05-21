import { SERVICES } from './constants.js'

document.addEventListener('DOMContentLoaded', async () => {
	const container = document.getElementById('container');
	
	SERVICES.forEach((v, k, map) => {
		const div = document.createElement('div');
		div.className = 'form-check';
		
		const input = document.createElement('input');
		input.className = 'form-check-input';
		input.type = 'checkbox';
		input.id = k;
		
		const lbl = document.createElement('label');
		lbl.className = 'form-check-label';
		lbl.htmlFor = k;
		lbl.innerHTML = k;
		
		div.appendChild(input);
		div.appendChild(lbl);
		
		container.appendChild(div);
		
		chrome.storage.local.get([k], (res) => {
			if(res[k] == 1) {
				document.getElementById(k).setAttribute('checked', true);
			}
		});
		
		input.addEventListener('change', function() {
			if(this.checked) {
				chrome.storage.local.set({[k]: 1});
				chrome.contextMenus.create({
					"id": k,
					"title": k,
					"contexts": ["editable"]
				});
			} else {
				chrome.storage.local.set({[k]: 0});
				chrome.contextMenus.remove(k);
			}
		});
	});
});
