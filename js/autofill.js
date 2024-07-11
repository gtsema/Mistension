import { Utils } from './utils.js';
import { RandomStringUtils } from './randomStringUtils.js';

document.addEventListener('DOMContentLoaded', () => {
	Utils.getLocators().then((locators) => {
		locators.forEach((v, k, map) => {
			let accordionItem = createAccordionItem(k, v.desc, v.xpath, v.value);
			let accordion = document.getElementById('myAccordion');
			accordion.appendChild(accordionItem);
			
			accordionItem.querySelector('[id^="saveBtn_"]').addEventListener('click', e => saveValues(e));
			accordionItem.querySelector('[id^="cancelBtn_"]').addEventListener('click', e => setDefaultValueForOldElement(e));
			accordionItem.querySelector('[id^="deleteBtn_"]').addEventListener('click', e => removeElement(e));
		});
	});
	
	document.getElementById('appendAccordionItemBtn').addEventListener('click', e => {
		const item = appendAccordionItem();
		item.querySelector('[id^="saveBtn_"]').addEventListener('click', e => saveValues(e));
		item.querySelector('[id^="cancelBtn_"]').addEventListener('click', e => setDefaultValueForNewElement(e));
		item.querySelector('[id^="deleteBtn_"]').addEventListener('click', e => removeElement(e));
		
		item.querySelector('.accordion-button').dispatchEvent(new Event('click', { bubbles: true, cancelable: false }));
	});
	
	document.getElementById('importBtn').addEventListener('click', e => Utils.importLocatorsManual());
	document.getElementById('exportBtn').addEventListener('click', e => Utils.exportLocators());
});

function createAccordionItem(id, desc, xpath, value) {
	const headerId = 'header_' + id;
	const collapseId = 'collapse_' + id;
	const spanDescId = 'spanDesc_' + id;
	const spanXpathId = 'spanXpath_' + id;
	const spanValueId = 'spanValue_' + id;
	const saveBtnId = 'saveBtn_' + id;
	const cancelBtnId = 'cancelBtn_' + id;
	const deleteBtnId = 'deleteBtn_' + id;
	
	let accordionItem = document.createElement('div');
	accordionItem.setAttribute('class', 'accordion-item');
	accordionItem.setAttribute('id', id);
	
	let h2 = document.createElement('h2');
	h2.setAttribute('class', 'accordion-header');
	h2.id = headerId;
	
	let btn = document.createElement('button');
	btn.setAttribute('class', 'accordion-button collapsed');
	btn.setAttribute('type', 'button');
	btn.setAttribute('data-bs-toggle', 'collapse');
	btn.setAttribute('data-bs-target', `#${collapseId}`);
	btn.setAttribute('aria-controls', collapseId);
	btn.setAttribute('aria-expanded', true);
	
	let span = document.createElement('span');
	span.setAttribute('class', 'header-text');
	span.innerText = desc;
	
	let accordionCollapse = document.createElement('div');
	accordionCollapse.id = collapseId;
	accordionCollapse.setAttribute('aria-labelledby', headerId);
	accordionCollapse.setAttribute('class', 'accordion-collapse collapse');
	accordionCollapse.setAttribute('data-bs-parent', '#myAccordion');
	
	let accordionBody = document.createElement('div');
	accordionBody.setAttribute('class', 'accordion-body');
	
	let inputGroupDesc = document.createElement('div');
	inputGroupDesc.setAttribute('class', 'input-group input-group-sm mb-3');
	
	let spanDesc = document.createElement('span');
	spanDesc.setAttribute('class', 'input-group-text');
	spanDesc.id = spanDescId;
	spanDesc.innerText = 'name';
	
	let inputDesc = document.createElement('input');
	inputDesc.setAttribute('class', 'form-control needs-validation-desc required');
	inputDesc.type = 'text';
	inputDesc.setAttribute('aria-describedby', spanDescId);
	inputDesc.value = desc;
	
	let inputGroupXpath = document.createElement('div');
	inputGroupXpath.setAttribute('class', 'input-group input-group-sm mb-3');
	
	let spanXpath = document.createElement('span');
	spanXpath.setAttribute('class', 'input-group-text');
	spanXpath.id = spanXpathId;
	spanXpath.innerText = 'xpath';
	
	let inputXpath = document.createElement('input');
	inputXpath.setAttribute('class', 'form-control needs-validation-xpath required');
	inputXpath.type = 'text';
	inputXpath.setAttribute('aria-describedby', spanXpathId);
	inputXpath.value = xpath;
	
	let inputGroupValue = document.createElement('div');
	inputGroupValue.setAttribute('class', 'input-group input-group-sm mb-3');
	
	let spanValue = document.createElement('span');
	spanValue.setAttribute('class', 'input-group-text');
	spanValue.id = spanValueId;
	spanValue.innerText = 'value';
	
	let inputValue = document.createElement('input');
	inputValue.setAttribute('class', 'form-control needs-validation-value required');
	inputValue.type = 'text';
	inputValue.setAttribute('aria-describedby', spanValueId);
	inputValue.value = value;
	
	let btnGroup = document.createElement('div');
	btnGroup.setAttribute('class', 'btn-group btn-group-sm');
	btnGroup.setAttribute('role', 'group');
	
	let btnHolder = document.createElement('div');
	btnHolder.setAttribute('class', 'd-flex justify-content-between');
	
	let btnLeftHolder = document.createElement('div');
	
	let saveBtn = document.createElement('button');
	saveBtn.setAttribute('class', 'btn btn-primary btn-sm me-2');
	saveBtn.setAttribute('type', 'button');
	saveBtn.setAttribute('id', saveBtnId);
	saveBtn.innerText = 'Сохранить';
	
	let cancelBtn = document.createElement('button');
	cancelBtn.setAttribute('class', 'btn btn-outline-primary btn-sm me-2');
	cancelBtn.setAttribute('type', 'button');
	cancelBtn.setAttribute('id', cancelBtnId);
	cancelBtn.innerText = 'Отменить';
	
	let deleteBtn = document.createElement('button');
	deleteBtn.setAttribute('class', 'btn btn-danger btn-sm');
	deleteBtn.setAttribute('type', 'button');
	deleteBtn.setAttribute('id', deleteBtnId);
	deleteBtn.innerText = 'Удалить';
	
	btn.appendChild(span);
	h2.appendChild(btn);
	
	inputGroupDesc.appendChild(spanDesc);
	inputGroupDesc.appendChild(inputDesc);
	inputGroupXpath.appendChild(spanXpath);
	inputGroupXpath.appendChild(inputXpath);
	inputGroupValue.appendChild(spanValue);
	inputGroupValue.appendChild(inputValue);
	
	accordionBody.appendChild(inputGroupDesc);
	accordionBody.appendChild(inputGroupXpath);
	accordionBody.appendChild(inputGroupValue);
	
	btnLeftHolder.appendChild(saveBtn);
	btnLeftHolder.appendChild(cancelBtn);
	btnHolder.appendChild(btnLeftHolder);
	btnHolder.appendChild(deleteBtn);
	
	accordionBody.appendChild(btnHolder);
	
	accordionCollapse.appendChild(accordionBody);
	
	accordionItem.appendChild(h2);
	accordionItem.appendChild(accordionCollapse);
	
	return accordionItem;
}

const removeElement = function(e) {
	e.target.closest('.accordion-item').querySelector('.accordion-button').dispatchEvent(new Event('click', { bubbles: true, cancelable: false }));
	setTimeout(function(){
        e.target.closest('.accordion-item').remove();
   },300);
	
	// удаление в бд если он там есть
	Utils.getLocators().then(locators => {
		locators.delete(e.target.closest('.accordion-item').id);
		chrome.storage.local.set({'locators': Object.fromEntries(locators)});
	});
};

const appendAccordionItem = function() {
	const id = RandomStringUtils.randomAlphanumeric(5);
	const accordionItem = createAccordionItem(id ,'Новый элемент', '', '');
	const accordion = document.getElementById('myAccordion');
	accordion.appendChild(accordionItem);
	
	return accordionItem;
};

const setDefaultValueForNewElement = function(e) {
	e.target.closest('.accordion-item').querySelector('input[aria-describedby^="spanDesc_"]').value = 'Новый элемент';
	e.target.closest('.accordion-item').querySelector('input[aria-describedby^="spanXpath_"]').value = '';
	e.target.closest('.accordion-item').querySelector('input[aria-describedby^="spanValue_"]').value = '';
};

const setDefaultValueForOldElement = function(e) {
	const accordionItem = e.target.closest('.accordion-item');
	Utils.getLocators().then((locators) => {
		if(locators.get(accordionItem.id)) {
			accordionItem.querySelector('input[aria-describedby^="spanDesc_"]').value = locators.get(accordionItem.id).desc;
			accordionItem.querySelector('input[aria-describedby^="spanXpath_"]').value = locators.get(accordionItem.id).xpath;
			accordionItem.querySelector('input[aria-describedby^="spanValue_"]').value = locators.get(accordionItem.id).value;
		} else {
			accordionItem.querySelector('input[aria-describedby^="spanDesc_"]').value = 'Новый элемент';
			accordionItem.querySelector('input[aria-describedby^="spanXpath_"]').value = '';
			accordionItem.querySelector('input[aria-describedby^="spanValue_"]').value = '';
		}
	}).catch(err => console.error(err));
};

const saveValues = function(e) {
	// Валидация значений
	let inputDesc = e.target.closest('.accordion-item').querySelector('.needs-validation-desc');
	let inputXpath = e.target.closest('.accordion-item').querySelector('.needs-validation-xpath');	
	let inputValue = e.target.closest('.accordion-item').querySelector('.needs-validation-value');
	
	if(!validateTextLine(inputDesc) | !validateXpath(inputXpath) | !validateTextLine(inputValue)) {
		return;
	}	
	
	// Сохранение в базу
	Utils.getLocators().then(locators => {
		const update = {
			desc: inputDesc.value,
			xpath: inputXpath.value,
			value: inputValue.value
		};
		locators.set(e.target.closest('.accordion-item').id, update);
		chrome.storage.local.set({'locators': Object.fromEntries(locators)});
	});
	
	e.target.closest('.accordion-item').querySelector('.header-text').innerHTML = inputDesc.value;
	e.target.closest('.accordion-item').querySelector('.accordion-button').dispatchEvent(new Event('click', { bubbles: true, cancelable: false }));
};

function validateTextLine(e) {
	const value = e.value;
	if(value.length > 0 && value.length < 64) {
		e.classList.remove('is-invalid');
		return true;
	} else {
		e.classList.add('is-invalid');
		return false;
	}
};

function validateXpath(e) {
	const xpathEvaluator = new XPathEvaluator();
	try {
		xpathEvaluator.createExpression(e.value);
		e.classList.remove('is-invalid');
		return true;
	} catch (error) {
		e.classList.add('is-invalid');
		return false;
	}
};
