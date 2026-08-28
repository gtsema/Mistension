import { Utils } from './utils.js';
import { RandomStringUtils } from './randomStringUtils.js';

document.addEventListener('DOMContentLoaded', () => {
	Utils.getLocators().then((locators) => {
		const accordion = document.getElementById('myAccordion');
		locators.forEach((v, k, map) => {
			if (v.type === 'divider' || (!v.xpath && !v.selector && v.desc)) {
				let dividerItem = createDividerItem(k, v.desc);
				accordion.appendChild(dividerItem);
			} else {
				let accordionItem = createAccordionItem(k, v.desc, v.xpath || v.selector, v.value, v.url || '');
				accordion.appendChild(accordionItem);
				
				accordionItem.querySelector('[id^="saveBtn_"]').addEventListener('click', e => saveValues(e));
				accordionItem.querySelector('[id^="cancelBtn_"]').addEventListener('click', e => setDefaultValueForOldElement(e));
				accordionItem.querySelector('[id^="deleteBtn_"]').addEventListener('click', e => removeElement(e));
			}
		});
	});
	
	document.getElementById('appendAccordionItemBtn').addEventListener('click', e => {
		const item = appendAccordionItem();
		item.querySelector('[id^="saveBtn_"]').addEventListener('click', e => saveValues(e));
		item.querySelector('[id^="cancelBtn_"]').addEventListener('click', e => setDefaultValueForNewElement(e));
		item.querySelector('[id^="deleteBtn_"]').addEventListener('click', e => removeElement(e));
		
		item.querySelector('.accordion-button').dispatchEvent(new Event('click', { bubbles: true, cancelable: false }));
	});

	document.getElementById('appendDividerBtn').addEventListener('click', e => {
		appendDividerItem();
	});
	
	document.getElementById('importBtn').addEventListener('click', e => Utils.importLocatorsManual());
	document.getElementById('exportBtn').addEventListener('click', e => Utils.exportLocators());
});

function createDividerItem(id, desc = 'Новая группа') {
	let divider = document.createElement('div');
	divider.setAttribute('class', 'locator-divider');
	divider.setAttribute('id', id);

	// Контейнер отображения (View Mode)
	let viewContainer = document.createElement('div');
	viewContainer.setAttribute('class', 'd-flex align-items-center justify-content-between w-100 view-mode');

	let titleSpan = document.createElement('div');
	titleSpan.setAttribute('class', 'divider-title');
	titleSpan.innerHTML = `<span class="divider-icon">📁</span> <span class="divider-text">${desc}</span>`;

	let btnGroup = document.createElement('div');
	btnGroup.setAttribute('class', 'btn-group btn-group-sm');

	let editBtn = document.createElement('button');
	editBtn.setAttribute('class', 'btn btn-outline-secondary btn-sm me-1');
	editBtn.setAttribute('type', 'button');
	editBtn.innerText = 'Переименовать';

	let deleteBtn = document.createElement('button');
	deleteBtn.setAttribute('class', 'btn btn-outline-danger btn-sm');
	deleteBtn.setAttribute('type', 'button');
	deleteBtn.innerText = 'Удалить';

	btnGroup.appendChild(editBtn);
	btnGroup.appendChild(deleteBtn);

	viewContainer.appendChild(titleSpan);
	viewContainer.appendChild(btnGroup);

	// Контейнер редактирования (Edit Mode)
	let editContainer = document.createElement('div');
	editContainer.setAttribute('class', 'input-group input-group-sm w-100 edit-mode d-none');

	let input = document.createElement('input');
	input.setAttribute('type', 'text');
	input.setAttribute('class', 'form-control');
	input.value = desc;
	input.placeholder = 'Название группы / раздела';

	let saveBtn = document.createElement('button');
	saveBtn.setAttribute('class', 'btn btn-primary btn-sm');
	saveBtn.setAttribute('type', 'button');
	saveBtn.innerText = 'Сохранить';

	let cancelBtn = document.createElement('button');
	cancelBtn.setAttribute('class', 'btn btn-outline-secondary btn-sm');
	cancelBtn.setAttribute('type', 'button');
	cancelBtn.innerText = 'Отмена';

	editContainer.appendChild(input);
	editContainer.appendChild(saveBtn);
	editContainer.appendChild(cancelBtn);

	divider.appendChild(viewContainer);
	divider.appendChild(editContainer);

	// Обработчики
	editBtn.addEventListener('click', () => {
		viewContainer.classList.add('d-none');
		editContainer.classList.remove('d-none');
		input.focus();
		input.select();
	});

	cancelBtn.addEventListener('click', () => {
		input.value = titleSpan.querySelector('.divider-text').textContent;
		editContainer.classList.add('d-none');
		viewContainer.classList.remove('d-none');
	});

	saveBtn.addEventListener('click', () => {
		const newTitle = input.value.trim() || 'Группа';
		titleSpan.querySelector('.divider-text').textContent = newTitle;
		
		// Сохраняем в storage
		Utils.getLocators().then(locators => {
			locators.set(id, {
				type: 'divider',
				desc: newTitle
			});
			Utils.saveLocators(locators);
		});

		editContainer.classList.add('d-none');
		viewContainer.classList.remove('d-none');
	});

	input.addEventListener('keydown', (e) => {
		if (e.key === 'Enter') {
			saveBtn.click();
		} else if (e.key === 'Escape') {
			cancelBtn.click();
		}
	});

	deleteBtn.addEventListener('click', () => {
		divider.remove();
		Utils.getLocators().then(locators => {
			locators.delete(id);
			Utils.saveLocators(locators);
		});
	});

	return divider;
}

function appendDividerItem() {
	const id = 'div_' + RandomStringUtils.randomAlphanumeric(5);
	const title = 'Новый раздел';
	const divider = createDividerItem(id, title);
	const accordion = document.getElementById('myAccordion');
	accordion.appendChild(divider);

	Utils.getLocators().then(locators => {
		locators.set(id, {
			type: 'divider',
			desc: title
		});
		Utils.saveLocators(locators);
	});

	divider.querySelector('.view-mode button').click();
	return divider;
}

function createAccordionItem(id, desc, xpath, value, url = '') {
	const headerId = 'header_' + id;
	const collapseId = 'collapse_' + id;
	const spanDescId = 'spanDesc_' + id;
	const spanXpathId = 'spanXpath_' + id;
	const spanUrlId = 'spanUrl_' + id;
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
	
	// 1. Поле name
	let inputGroupDesc = document.createElement('div');
	inputGroupDesc.setAttribute('class', 'input-group input-group-sm mb-3');
	
	let spanDesc = document.createElement('span');
	spanDesc.setAttribute('class', 'input-group-text');
	spanDesc.id = spanDescId;
	spanDesc.innerText = 'name';
	
	let inputDesc = document.createElement('input');
	inputDesc.setAttribute('class', 'form-control needs-validation-desc required');
	inputDesc.type = 'text';
	inputDesc.placeholder = 'Название поля';
	inputDesc.setAttribute('aria-describedby', spanDescId);
	inputDesc.value = desc;
	
	// 2. Поле selector (xpath / css)
	let inputGroupXpath = document.createElement('div');
	inputGroupXpath.setAttribute('class', 'input-group input-group-sm mb-3');
	
	let spanXpath = document.createElement('span');
	spanXpath.setAttribute('class', 'input-group-text');
	spanXpath.id = spanXpathId;
	spanXpath.innerText = 'selector';
	
	let inputXpath = document.createElement('input');
	inputXpath.setAttribute('class', 'form-control needs-validation-xpath required font-monospace');
	inputXpath.type = 'text';
	inputXpath.placeholder = "//input[@id='phone'] или #phone, input.phone";
	inputXpath.setAttribute('aria-describedby', spanXpathId);
	inputXpath.value = xpath || '';
	
	// 3. Поле url
	let inputGroupUrl = document.createElement('div');
	inputGroupUrl.setAttribute('class', 'input-group input-group-sm mb-3');
	
	let spanUrl = document.createElement('span');
	spanUrl.setAttribute('class', 'input-group-text');
	spanUrl.id = spanUrlId;
	spanUrl.innerText = 'url';
	
	let inputUrl = document.createElement('input');
	inputUrl.setAttribute('class', 'form-control needs-validation-url font-monospace');
	inputUrl.type = 'text';
	inputUrl.placeholder = "https://*.medzoom.ru/*, /patients/create* (пусто = везде)";
	inputUrl.setAttribute('aria-describedby', spanUrlId);
	inputUrl.value = url || '';

	// 4. Поле value
	let inputGroupValue = document.createElement('div');
	inputGroupValue.setAttribute('class', 'input-group input-group-sm mb-3');
	
	let spanValue = document.createElement('span');
	spanValue.setAttribute('class', 'input-group-text');
	spanValue.id = spanValueId;
	spanValue.innerText = 'value';
	
	let inputValue = document.createElement('input');
	inputValue.setAttribute('class', 'form-control needs-validation-value required font-monospace');
	inputValue.type = 'text';
	inputValue.placeholder = "%snils, %date, %d4, текст...";
	inputValue.setAttribute('aria-describedby', spanValueId);
	inputValue.value = value;
	
	// Кнопки управления
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

	inputGroupUrl.appendChild(spanUrl);
	inputGroupUrl.appendChild(inputUrl);

	inputGroupValue.appendChild(spanValue);
	inputGroupValue.appendChild(inputValue);
	
	accordionBody.appendChild(inputGroupDesc);
	accordionBody.appendChild(inputGroupXpath);
	accordionBody.appendChild(inputGroupUrl);
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
    }, 300);
	
	Utils.getLocators().then(locators => {
		locators.delete(e.target.closest('.accordion-item').id);
		Utils.saveLocators(locators);
	});
};

const appendAccordionItem = function() {
	const id = RandomStringUtils.randomAlphanumeric(5);
	const accordionItem = createAccordionItem(id ,'Новый элемент', '', '', '');
	const accordion = document.getElementById('myAccordion');
	accordion.appendChild(accordionItem);
	
	return accordionItem;
};

const setDefaultValueForNewElement = function(e) {
	const item = e.target.closest('.accordion-item');
	item.querySelector('input[aria-describedby^="spanDesc_"]').value = 'Новый элемент';
	item.querySelector('input[aria-describedby^="spanXpath_"]').value = '';
	item.querySelector('input[aria-describedby^="spanUrl_"]').value = '';
	item.querySelector('input[aria-describedby^="spanValue_"]').value = '';
};

const setDefaultValueForOldElement = function(e) {
	const accordionItem = e.target.closest('.accordion-item');
	Utils.getLocators().then((locators) => {
		const loc = locators.get(accordionItem.id);
		if(loc) {
			accordionItem.querySelector('input[aria-describedby^="spanDesc_"]').value = loc.desc || '';
			accordionItem.querySelector('input[aria-describedby^="spanXpath_"]').value = loc.xpath || loc.selector || '';
			accordionItem.querySelector('input[aria-describedby^="spanUrl_"]').value = loc.url || '';
			accordionItem.querySelector('input[aria-describedby^="spanValue_"]').value = loc.value || '';
		} else {
			setDefaultValueForNewElement(e);
		}
	}).catch(err => console.error(err));
};

const saveValues = function(e) {
	const item = e.target.closest('.accordion-item');
	let inputDesc = item.querySelector('.needs-validation-desc');
	let inputXpath = item.querySelector('.needs-validation-xpath');	
	let inputUrl = item.querySelector('.needs-validation-url');
	let inputValue = item.querySelector('.needs-validation-value');
	
	const isDescValid = validateTextLine(inputDesc);
	const isSelectorValid = validateSelector(inputXpath);
	const isValueValid = validateTextLine(inputValue);

	if (!isDescValid || !isSelectorValid || !isValueValid) {
		return;
	}
	
	Utils.getLocators().then(locators => {
		const update = {
			desc: inputDesc.value.trim(),
			xpath: inputXpath.value.trim(),
			url: inputUrl.value.trim(),
			value: inputValue.value.trim()
		};
		locators.set(item.id, update);
		Utils.saveLocators(locators);
	});
	
	item.querySelector('.header-text').textContent = inputDesc.value.trim();
	item.querySelector('.accordion-button').dispatchEvent(new Event('click', { bubbles: true, cancelable: false }));
};

function validateTextLine(e) {
	const value = e.value.trim();
	if(value.length > 0 && value.length <= 128) {
		e.classList.remove('is-invalid');
		return true;
	} else {
		e.classList.add('is-invalid');
		return false;
	}
}

function validateSelector(e) {
	const value = e.value.trim();
	if (!value) {
		e.classList.add('is-invalid');
		return false;
	}

	// 1. Проверяем как CSS селектор
	let validCss = false;
	try {
		document.createDocumentFragment().querySelector(value);
		validCss = true;
	} catch (err) {}

	// 2. Проверяем как XPath
	let validXpath = false;
	try {
		const xpathEvaluator = new XPathEvaluator();
		xpathEvaluator.createExpression(value);
		validXpath = true;
	} catch (err) {}

	if (validCss || validXpath) {
		e.classList.remove('is-invalid');
		return true;
	} else {
		e.classList.add('is-invalid');
		return false;
	}
}
