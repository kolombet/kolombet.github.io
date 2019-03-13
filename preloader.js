var preloader = {
    progress: 0.0,
    isLoading: false,
    isVisible: false,
    background: null,
    backgroundL: null,
    progress_bar_state: null,
    progress_bar_count: null,
    preloaderRoot: null,
    progressBarP1: null,
    progressBarP2: null,
    leafs: [],
    loader: null,
    progressText: null,
    tooltipText: null,
    longLoadText: null,
    intervalId: null,

    backgroundWidth: 2048,
    backgroundHeight: 1024,
    //показать прогрессбар
    showLoading: function()
    {
        console.log('show loading');
        console.log(preloader.loader);
        preloader.isLoading = true;
        //show ui
        preloader.loader.style.display = 'block';
        preloader.updateLoading();
        preloader.longLoadText.innerHTML = phrases.getLongLoadingText();
        preloader.updateHint();
        if(preloader.intervalId == null) preloader.intervalId = setInterval(preloader.updateHint, 5000);
    },
    //скрыть прогрессбар
    hideLoading: function()
    {
        preloader.isLoading = false;
        //hide ui
        preloader.loader.style.display = 'none';
        if (preloader.intervalId != null) clearInterval(preloader.intervalId);
        preloader.intervalId = null;
    },
    //обновить прогрессбар при изменении размера окна
    updateSize: function()
    {
        if (!preloader.isVisible) return;
        var scale = 1;
        var h1 = preloader.preloaderRoot.offsetHeight / preloader.backgroundHeight;
        var w1 = preloader.preloaderRoot.offsetWidth / preloader.backgroundWidth;
        scale = h1 < w1 ? w1 : h1;
        preloader.background.style.transform = 'translate(-50%, -50%) scale(' + scale + ',' + scale + ')';
    },
    updateLoading: function()
    {
        if (!preloader.isLoading) return;

        preloader.background.style.filter = "saturate(" + ((preloader.progress * 100) * 2) + "%)";
        preloader.progress_bar_state.style.width = (preloader.progress * 100) + "%";
        preloader.progressText.innerHTML = Math.floor(preloader.progress * 100);
    },
    //установить значение прогрессбара
    setProgress: function(value)
    {
        console.log(value);
        preloader.progress = value / 2;
        //if (preloader.progress == 1) preloader.hide();
        if (!preloader.isLoading) return;
        preloader.updateLoading();
    },
    //начальная функция - создаёт и инициализирует основной ui прелоадера
    init: function()
    {
		preloader.progress_bar_state = document.getElementById("progress_state");
        preloader.progress_bar_count = document.getElementById("progress_count");
		
        preloader.preloaderRoot = document.getElementById("preloaderContainer");
        preloader.background = document.getElementById("preloaderBackground");

        preloader.progressText = document.getElementById("progress_count");
        preloader.tooltipText = document.getElementById("tooltipText");
        preloader.longLoadText = document.getElementById("longLoadText");

        preloader.loader = document.getElementById("preloaderLoader");
    },
    updateHint: function()
    {
        if (!preloader.isLoading) return;
        preloader.tooltipText.innerHTML = phrases.getRandomHint();
    },

    show: function()
    {
        console.log('show');
        if (preloader.isVisible) return;
        preloader.isVisible = true;
        preloader.updateLoading();
        preloader.preloaderRoot.style.display = '';
    },
    createDiv: function(id, url, zindex, parent)
    {
        var div = document.createElement('div');
        div.id = id;
        div.style.backgroundImage = 'url(' + url + ')';
        //div.style.position='absolute';
        div.style.zIndex = zindex;
        parent.appendChild(div);
        return div;
    },
    //скрыть прелоадер при загрузке юнити
    hide: function()
    {
        if (!preloader.isVisible) return;
        preloader.hideLoading();
        preloader.isVisible = false;
        preloader.preloaderRoot.style.display = 'none';
    },
};