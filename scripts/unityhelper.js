var Module;
var unityHelper = {
    signedRequest: null,
    lid: null,
    gameContainer: null,
    url: null,

    startLoading: function(gameContainer)
    {
        preloader.showLoading();

        unityHelper.url = ("Build/WebGL.json") + "?v=" + consts.appVersion;
        Module = UnityLoader.instantiate(gameContainer, unityHelper.url,
        {
            onProgress: function(a, b)
            {
                preloader.setProgress(b);
            },
            Module:
            {
                resolveBuildUrl: function(buildUrl)
                {
                    return (buildUrl.match(/(http|https|ftp|file):\/\//) ? buildUrl : unityHelper.url.substring(0, unityHelper.url.lastIndexOf("/") + 1) + buildUrl);
                },
                postRun: [unityHelper.postRun],
            },
        }).Module;
    },
    postRun: function () {
        console.log("post run");
        preloader.hide();
        gameContainer.style.display = '';
        if (Module !== undefined && Module.useWasm !== undefined) {
            setBugsnagTabContent("Additional Info", "Use wasm", Module.useWasm ? "true" : "false");
        }
    },
};