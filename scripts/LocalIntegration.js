var LocalIntegration = {
    //base properties
    onReady: null,
    gameContainer: null,
    preloaderContainer: null,
    //facebook properties
    permissions: ["public_profile", "email", "user_friends"],
    needLogin: true,
    forcePermissions: true,

    loginButton: null,
    updateSize: null,
    isCanvasMaybe: false,

    getUrlParams: function () {
        return window.location.search;
    },

    getSystemLanguage: function () {
        return "en";
    },

    init: function (preloaderContainer, gameContainer, loginButton) {
        integrationHelper.preloaderContainer = preloaderContainer;
        integrationHelper.loginButton = loginButton;
        integrationHelper.gameContainer = gameContainer;
        integrationHelper.isCanvasMaybe = document.referrer.indexOf("https://apps.facebook.com/") != -1;
        console.log(integrationHelper.isCanvasMaybe);

        window.addEventListener("resize", integrationHelper.updateSize);
        setInterval(integrationHelper.updateSize, 1000);

        var xmlHttp = new XMLHttpRequest();
		
		xmlHttp.open("GET", "/authorization.json", true);
		xmlHttp.send(null);
		
		xmlHttp.onreadystatechange = function() {
			if (this.readyState != 4) return;
			
			if (this.status != 200) 
			{
				console.error("Error loading authorization.json");
				return;
			}
			
			var obj = JSON.parse(xmlHttp.responseText);

			unityHelper.signedRequest = obj.request;
			unityHelper.lid = obj.user;
			unityHelper.serverUri = obj.serverUri ? obj.serverUri : "";
			integrationHelper.portalNetwork = "LC";

			setTimeout(function () {
				LocalIntegration.done();
			}, 500);
		};
    },
    done: function () {
        console.log("done");
        if (typeof integrationHelper.onReady == "function") integrationHelper.onReady();
    },
    updateSize: function () {
        var isFullscreen = document.fullscreen ||
            document.mozFullscreen ||
            document.mozFullScreen ||
            document.msFullscreen ||
            document.webkitFullscreen;

        if (isFullscreen) return;

        var frameHeight = window.innerHeight;
        var h = RoundSimple(frameHeight < consts.minHeight ? consts.minHeight : frameHeight);
        var w = RoundSimple(window.innerWidth < consts.minWidth ? consts.minWidth : window.innerWidth);
        //console.log("Normal:" + w + "x" + h + " Scroll:" + document.body.scrollWidth + "x" + document.body.scrollHeight);
        document.body.style.height = (h - 20) + "px";
        document.body.style.width = (w - 2) + "px";
        integrationHelper.gameContainer.style.width = (w - 2) + "px";
        integrationHelper.gameContainer.style.height = (h - 22 - consts.topMargine) + "px";
        // integrationHelper.preloaderContainer.style.width = (w - 2) + "px";
        // integrationHelper.preloaderContainer.style.height = (h - 22 - consts.topMargine) + "px";

        if (preloader)
            preloader.updateSize();
        else
            setTimeout(FacebookIntegration.updateSizeNormal, 200);

        if (typeof Module == "undefined" || typeof Module.canvas == "undefined") return;
        Module.canvas.width = w - 2;
        Module.canvas.height = h - 22 - consts.topMargine;
    },
};

var integrationHelper = LocalIntegration;
onIntegrationReady();