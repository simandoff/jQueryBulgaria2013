$(document).ready(function () {
	'use strict'

	var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|mobile/i.test(navigator.userAgent);
	var elBoard = document.body;
	var cursorPos = '';
	var drag = true;
	var interval = 0;
	var loc = window.location;

	var setCursorPos = function(x, y) {
		cursorPos = x + '|' + y;
	}

	/**
	 * WebSocket Connect and Setup
	 */
	var ws = new WebSocket("ws://" + loc.host);

	ws.onopen = function () {
		var oldData = {txt:'', pos:''};
		interval = setInterval(function () {
			var newData = {
				txt: loc.hash.substr(0, 40),
				pos: cursorPos
			}
			if (oldData.txt !== newData.txt || oldData.pos !== newData.pos) {
				oldData = newData;
				ws.send(JSON.stringify(newData));
			}
		}, 1000 / 30 |0)
	}

	ws.onerror = function (error) {
		console.error(error);
		clearInterval(interval);
	}

	ws.onclose = function () {
		clearInterval(interval);
	}

	ws.onmessage = function (e) {
		var data = JSON.parse(e.data);
		if (data.globalCount && loc.hash === '') {
			return (loc.hash = "jQuery" + data.globalCount)
		}
		var item = document.getElementById(data.id);
		// If we have to remove the item
		if (data.remove) {
			item && elBoard.removeChild(item);
		} else {
			if (!item) {
				item = document.createElement('span');
				item.className = "item";
				item.id = data.id;
				elBoard.appendChild(item);
			}
			item.innerText = data.txt;
			if (data.pos) {
				var pos = data.pos.split('|');
				item.style.left = pos[0] + 'px';
				item.style.top = pos[1] + 'px';
			}
		}
	}

	/**
	 * Events definition
	 */
	!isMobile && $(document).on('click', function (e) {
		e.preventDefault();
		$('html')[['remove', 'add'][+(drag = !drag)] + 'Class']('move');
	});

	$(document).on('touch touchmove mousemove', function (e) {
		if (!drag) return;
		e.preventDefault();
		var c = (e = e.originalEvent || e).changedTouches ? e.changedTouches[0] : e;
		drag && setCursorPos(c.pageX, c.pageY);
	});

	// Set random position of the hash
	setCursorPos(
		(Math.random() * $(window).width()/2) |0,
		(Math.random() * $(window).height()/2) |0
	);
});
