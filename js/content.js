const notification = document.createElement('div');
notification.id = 'notification';
notification.className= 'notification'
notification.innerText = 'CATS!';
notification.classList.add('hide');

window.addEventListener('load', function() {
	document.body.appendChild(notification);
	
	let link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = chrome.runtime.getURL('../css/notification.css');
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

document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.shiftKey && event.key === 'F') {
    showToast("ПИСЬКА!");
  }
});

function showToast(msg) {
	let el = document.getElementById('notification');
	el.innerText = msg;
	el.classList.remove('hide');
	setTimeout(() => {
		el.classList.add('hide');
	}, 1000);
}