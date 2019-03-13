class MemoryTracker {
    constructor() {
        var container = document.createElement('div');

        container.id = 'stats';
        container.style.cssText = 'width:80px;height:15px;opacity:0.8;cursor:pointer;overflow:hidden;z-index:10000;';
        container.style.position = 'fixed';
        container.style.right = '0px';
        container.style.bottom = '0px';
        document.body.appendChild(container);

        let text = document.createElement('div');
        text.id = 'text';
        text.style.cssText = 'color:white;font-family:Helvetica,Arial,sans-serif;font-size:13px;font-weight:bold;line-height:15px';
        container.appendChild(text);

        this.container = container;
        this.text = text;
        requestAnimationFrame(this.update.bind(this));
    }
    
    update() {
        if (Module && Module.asmLibraryArg) {
            this.text.innerText = this.memoryPrint();
        }
            
        requestAnimationFrame(this.update.bind(this));
    }

    memoryPrint() {
        const MB_SIZE = 1048576;
        let available = Math.round(Module.asmLibraryArg._GetTotalMemorySize() / MB_SIZE);
        let stackSize = Math.round(Module.asmLibraryArg._GetTotalStackSize() / MB_SIZE);
        let staticSize = Math.round(Module.asmLibraryArg._GetStaticMemorySize() / MB_SIZE);
        let dynamicSize = Math.round(Module.asmLibraryArg._GetDynamicMemorySize() / MB_SIZE);
        let total = stackSize + staticSize + dynamicSize;
        return `${total}/${available}MB`;
    }
}
window.unityMemoryTracker = new MemoryTracker();