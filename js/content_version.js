const notification = document.createElement('div');
notification.id = 'notification';
notification.className= 'notification'
notification.innerText = 'CATS!';
notification.classList.add('hide');

window.addEventListener('load', () => {
	document.body.appendChild(notification);
	
	let link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = chrome.runtime.getURL('../css/content.css');
	(document.head || document.documentElement).appendChild(link);
	
	chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
		if(request.msgType === 'paste') {
			let el = document.activeElement;
			let sel = document.getSelection();
			
			if (el.className.startsWith('ProseMirror') && sel.getRangeAt && sel.rangeCount) {
				var range = sel.getRangeAt(0);
				range.deleteContents();
				range.insertNode(document.createTextNode(request.msg));
			} else {
				showToast('Нельзя сотворить здесь');
			}
		} else if(request.msgType === 'showToast') {
			showToast(request.msg);
		}
	});
});

function showToast(msg) {
	let el = document.getElementById('notification');
	el.innerText = msg;
	el.classList.remove('hide');
	setTimeout(() => {
		el.classList.add('hide');
	}, 1000);
}
