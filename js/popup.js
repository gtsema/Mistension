import { ZONES } from './constants.js'

document.addEventListener('DOMContentLoaded', async () => {
	const container = document.getElementById('mainPopup');
	
	ZONES.keys().forEach(k => {	
		const div = document.createElement('div');
		div.className = 'form-check';
		
		const input = document.createElement('input');
		input.className = 'form-check-input';
		input.type = 'radio';
		input.name = 'flexRadioDefault';
		input.id = k;
		
		const lbl = document.createElement('label');
		lbl.className = 'form-check-label';
		lbl.htmlFor = k;
		lbl.innerHTML = k;
		
		div.appendChild(input);
		div.appendChild(lbl);
		
		container.appendChild(div);
		
		input.addEventListener('change', async () => {
			chrome.storage.local.set({'zone': k});
		});
	});
	
	chrome.storage.local.get(['zone'], res => {
		document.getElementById(res.zone).setAttribute('checked', true);
	});
	
	// Autofill swith
	let autofillSw = document.getElementById('flexSwitchAutofill');
	
	autofillSw.addEventListener('change', async () => {
		chrome.storage.local.set({'autofill': autofillSw.checked});
	});
	
	chrome.storage.local.get(['autofill'], res => {
		autofillSw.checked = res.autofill;
	});
});
