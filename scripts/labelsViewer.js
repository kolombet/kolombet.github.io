// @ts-check
'use strict'

class LabelsViewer {
    constructor() {
        let instance = document.querySelector('.LabelsViewer__wrapper');
        if (instance)
            instance.parentElement.removeChild(instance);
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('LabelsViewer__wrapper');
        this.wrapper.style.position = 'absolute';
        this.wrapper.style.left = '5px';
        this.wrapper.style.top = '50px';
        this.wrapper.style.zIndex = '5';
        document.body.appendChild(this.wrapper);

        this.showButton = document.createElement('div');
        this.showButton.classList.add('LabelsViewer__showButton');
        this.showButton.style.width = '20px';
        this.showButton.style.height = '20px';
        this.showButton.style.backgroundColor = 'black';
        this.showButton.style.position = 'absolute';
        this.showButton.style.zIndex = '10';
        this.showButton.addEventListener('click', (e) => {
            this.setVisibility(!this.isVisible);
        })
        this.wrapper.appendChild(this.showButton);

        this.scroll = document.createElement('div');
        this.scroll.classList.add('LabelsViewer__scroll');
        this.scroll.style.backgroundColor = 'white';
        this.scroll.style.overflow = 'scroll';
        this.scroll.style.zIndex = '9';
        this.scroll.style.border = '1px solid black';
        this.scroll.style.top = '20px';
        this.wrapper.appendChild(this.scroll);

        this.scrollContent = document.createElement('div');
        this.scrollContent.classList.add('LabelsViewer__scrollContent');
        this.scrollContent.style.position = 'relative';
        this.scrollContent.style.height = '1000px';
        this.scroll.appendChild(this.scrollContent);
        this.setVisibility(false);
    }

    setVisibility(value) {
        this.isVisible = value;
        this.scroll.style.display = value ? 'block' : 'none';
    }

    createLabel() {
        let p = document.createElement('p');
        p.classList.add('coords__item');
        p.style.position = 'absolute';
        p.style.margin = '0';
        p.style.fontFamily = 'Trone-KaW-Regular';
        return p;
    }

    labelApplyStyle(label, style) {
        label.textContent = style['Text'];
        let left = style['X'] + 430;
        let top = style['Y'] - style['Height'] + 350;
        label.style.left = left + 'px';
        label.style.top = top + 'px';
        label.style.width = style['Width'] + 'px';
        label.style.height = style['Height'] + 'px';
        label.style.fontSize = style['Size'] + 'px';
        label.style.textAlign = style['Align'];
    }

    draw(exportedLabels) {
        this.scroll.style.height = exportedLabels.Height + 'px';
        this.scroll.style.width = exportedLabels.Width + 'px';

        while (this.scrollContent.firstChild)
            this.scrollContent.removeChild(this.scrollContent.firstChild);

        exportedLabels.list.forEach((node) => {
            let label = this.createLabel();
            this.labelApplyStyle(label, node);
            this.scrollContent.appendChild(label);
        });

        Array.from(document.querySelectorAll('.coords__item')).forEach((el) => listenEvents(el));

        this.setVisibility(true);
    }
}

function listenEvents(el) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    el.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        if (e.ctrlKey && e.shiftKey) {
            el.style.display = "none";
        } else if (e.ctrlKey) {
            pos3 = e.clientX;
            pos4 = e.clientY;
            document.onmouseup = closeDragElement;
            document.onmousemove = elementDrag;
        }
    }

    function elementDrag(e) {
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        el.style.top = (el.offsetTop - pos2) + "px";
        el.style.left = (el.offsetLeft - pos1) + "px";
    }

    function closeDragElement() {
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

window['labelsViewerInstance'] = new LabelsViewer();
window['onLabelsViewerReady'].call();