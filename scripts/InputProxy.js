"use strict";

function InputProxy() {
    this.requestAnimationFrame = (function (w) {
        return w.requestAnimationFrame ||
            w.webkitRequestAnimationFrame ||
            w.mozRequestAnimationFrame ||
            w.oRequestAnimationFrame ||
            w.msRequestAnimationFrame ||
            function (callback) {
                w.setTimeout(callback, 1000 / 60);
            };
    })(window);

    //Current composition input string
    this.data = "";
    //Result for previous composition
    this.result = "";
    this.eventsList = [];
    this.isComposite = false;

    var tf = document.createElement("div");
    tf.contentEditable = true;
    tf.id = "input-emulate";
    tf.style.position = "absolute";
    tf.style.top = '10px';
    tf.style.left = '10px';    
    //tf.style.border = "1px solid black";
    tf.style.width = "auto";
    tf.style.fontSize = "18px";
    tf.style.font = "bold";
    tf.style.opacity = 0;
    tf.style.cursor = "default";

    this.inputTF = tf;
    document.body.appendChild(tf);

    document.addEventListener('keydown', this.onKeyDownHandler.bind(this));
    tf.addEventListener('compositionstart', this.onCompositeStart.bind(this));
    tf.addEventListener('compositionupdate', this.onCompositeUpdate.bind(this));
    tf.addEventListener('compositionend', this.onCompositeEnd.bind(this));

    this.requestAnimationFrame.call(window, this.update.bind(this));
}

/**
* API
**/
InputProxy.prototype.getNextEvent = function () {
    if (this.eventsList.length == 0) {
        return "";
    }

    var ret = this.eventsList.shift();
    return ret;
};

InputProxy.prototype.allowFocus = true;

InputProxy.prototype.setTFOffset = function (xOffset, yOffset) {
    var canvas = document.querySelector("#canvas")||document.querySelector("#\\#canvas");
    if (!canvas) {
        console.error("no canvas found");
    }
    var offset = this.getOffsetRect(canvas);
    var s = {w: this.inputTF.clientWidth, h: this.inputTF.clientHeight};
    this.inputTF.style.left = (offset.left + xOffset - s.w) + "px";
    this.inputTF.style.top = (offset.top + yOffset - s.h) + "px";
};

InputProxy.prototype.setFocus = function (value) {
    this.inputTF.innerHTML = '';
    if (value == true) {
        this.inputTF.focus();
    }
    else {
        this.inputTF.blur();
    }
};

InputProxy.prototype.setAllowFocus = function (value) {
    this.allowFocus = value;	
}

/**
*	Events
**/
InputProxy.prototype.update = function (ev) {
    if (this.isComposite == false) {
        this.inputTF.innerHTML = '';
        this.data = '';
    }

    if (this.data.length > 0) {
        // Hack to reset composition input 
        // If user move caret position, composite input ends
        var offset = window.getSelection().getRangeAt(0).startOffset;
        //In Hangul caret offset have wrong value
        //No need to end composite input on caret move
        if (this.isHangulCompo() == false && offset != this.data.length) {
			this.setFocus(false);
			this.setFocus(true);
        }
    }

    this.requestAnimationFrame.call(window, this.update.bind(this));
};

InputProxy.prototype.onKeyDownHandler = function (ev) {
    if (this.isComposite == false) {
        this.inputTF.innerHTML = '';
        this.data = '';
    }

    var enterKeyCode = 13;
    if (ev.keyCode == enterKeyCode) {
        ev.preventDefault();
        this.data = '';
        this.inputTF.innerHTML = '';
    }

    if (this.allowFocus && document.activeElement != this.inputTF) {
        this.setFocus(true);
    }
};

InputProxy.prototype.onCompositeStart = function (ev) {
    this.isComposite = true;
    this.eventsList.push('compositionstart');
};

InputProxy.prototype.onCompositeUpdate = function (ev) {
    this.data = ev.data;
    this.eventsList.push('compositionupdate');
};

InputProxy.prototype.onCompositeEnd = function (ev) {
    this.isComposite = false;
    this.result = ev.data;
    this.eventsList.push('compositionend');
};

/**
*	Helpers
**/
InputProxy.prototype.isHangulChar = function (charcode) {
    if (charcode > 0x1100 && charcode < 0x11FF) {
        return true;
    }

    if (charcode > 0x3130 && charcode < 0x318F) {
        return true;
    }

    if (charcode > 0xac00 && charcode < 0xd7af) {
        return true;
    }
    return false;
};

InputProxy.prototype.isHangulCompo = function () {
    var d = this.data;
    if (d.length > 0) {
        var code = d.charCodeAt(0);
        return (this.isHangulChar(code) == true);
    }
    return false;
};

InputProxy.prototype.getOffsetRect = function (elem) {
    if (!elem) {
        console.error("no target argument");
        return null;
    }
    var box = elem.getBoundingClientRect();
    var body = document.body;
    var docElem = document.documentElement;
    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
    var clientTop = docElem.clientTop || body.clientTop || 0;
    var clientLeft = docElem.clientLeft || body.clientLeft || 0;
    var top = box.top + scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;
    return {top: Math.round(top), left: Math.round(left)}
};
