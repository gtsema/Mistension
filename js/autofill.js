document.addEventListener('DOMContentLoaded', () => {
	
	getLocators().then((locators) => {
		locators.forEach((v, k, map) => {
			const accordionItem = createAccordionItem(v.desc, k, v.value);
			const accordion = document.getElementById('myAccordion');
			accordion.appendChild(accordionItem);
		});
	});
});

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.accordion-header').forEach((header) => {
      header.addEventListener('dblclick', (e) => {
        // Предотвращаем раскрытие/сворачивание элемента аккордеона
        e.stopPropagation();

        let target = e.target.closest('.accordion-header').querySelector('.header-text');
        let currentText = target.innerText;
        let input = document.createElement('input');
        input.type = 'text';
        input.value = currentText;
        
        // Заменяем содержимое заголовка на текстовое поле
        target.innerHTML = '';
        target.appendChild(input);
        input.focus();
        
        // При потере фокуса сохраняем новое значение
        input.addEventListener('blur', () => {
          target.innerText = this.value;
        });
      });
    });
});

async function getLocators() {
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

function createAccordionItem(name, xpath, value) {
	const id = generateRandomString(5, 'mixed');
	const btnId = 'btn_' + id;
	const spanXpathId = 'spanXpath_' + id;
	const spanValueId = 'spanValue_' + id;
	
	let accordionItem = document.createElement('div');
	accordionItem.setAttribute('class', 'accordion-item');
	
	let h2 = document.createElement('h2');
	h2.setAttribute('class', 'accordion-header');
	h2.id = id;
	
	let btn = document.createElement('button');
	btn.setAttribute('class', 'accordion-button');
	btn.type = 'button';
	btn.setAttribute('data-bs-toggle', 'collapse');
	btn.setAttribute('data-bs-target', `#${btnId}`);
	
	let span = document.createElement('span');
	span.setAttribute('class', 'header-text');
	span.innerText = name;
	
	
	let accordionCollapse = document.createElement('div');
	accordionCollapse.id = btnId;
	accordionCollapse.setAttribute('class', 'accordion-collapse collapse show');
	accordionCollapse.setAttribute('data-bs-parent', '#myAccordion');
	
	let accordionBody = document.createElement('div');
	accordionBody.setAttribute('class', 'accordion-body');
	
	let inputGroupXpath = document.createElement('div');
	inputGroupXpath.setAttribute('class', 'input-group mb-3');
	
	let spanXpath = document.createElement('span');
	spanXpath.setAttribute('class', 'input-group-text');
	spanXpath.id = spanXpathId;
	spanXpath.innerText = 'xpath';
	
	let inputXpath = document.createElement('input');
	inputXpath.setAttribute('class', 'form-control');
	inputXpath.type = 'text';
	inputXpath.setAttribute('aria-describedby', spanXpathId);
	inputXpath.value = xpath;
	inputXpath.disabled;
	
	let inputGroupValue = document.createElement('div');
	inputGroupValue.setAttribute('class', 'input-group mb-3');
	
	let spanValue = document.createElement('span');
	spanValue.setAttribute('class', 'input-group-text');
	spanValue.id = 'spanValueId';
	spanValue.innerText = 'value';
	
	let inputValue = document.createElement('input');
	inputValue.setAttribute('class', 'form-control');
	inputValue.type = 'text';
	inputValue.setAttribute('aria-describedby', 'spanValueId');
	inputValue.value = value;
	inputValue.disabled;
	
	
	btn.appendChild(span);
	h2.appendChild(btn);
	
	inputGroupXpath.appendChild(spanXpath);
	inputGroupXpath.appendChild(inputXpath);
	inputGroupValue.appendChild(spanValue);
	inputGroupValue.appendChild(inputValue);
	
	accordionBody.appendChild(inputGroupXpath);
	accordionBody.appendChild(inputGroupValue);
	
	accordionCollapse.appendChild(accordionBody);
	
	accordionItem.appendChild(h2);
	accordionItem.appendChild(accordionCollapse);
	
	return accordionItem;
}

function generateRandomString(length, type) {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  let characters = '';
  
  // Определяем, какой набор символов использовать в зависимости от типа
  if (type === 'letters') {
    characters = letters;
  } else if (type === 'numbers') {
    characters = numbers;
  } else if (type === 'mixed') {
    characters = letters + numbers;
  } else {
    console.error('Invalid type specified. Use "letters", "numbers", or "mixed".');
    return null;
  }
  
  let result = '';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  
  return result;
}