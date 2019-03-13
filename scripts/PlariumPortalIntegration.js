var PlariumPortalIntegration = {
    //base properties
    onReady: null,
    gameContainer: null,
    preloaderContainer: null,
    //portal properties
    prices: "",
    urlParams: "",

    getUrlParams: function()
    {
        return integrationHelper.urlParams;
    },

    getSystemLanguage: function()
    {
        var str = document.location.search;
        var ind = str.indexOf("lang=");
        var lng = "en";
        if (ind != -1)
        {
            lng = str.substring(ind + 5, ind + 7);
            switch (lng)
            {
                case "es":
                    lng = "sp";
                    break;
                case "ja":
                    lng = "jp";
                    break;
                case "ko":
                    lng = "kr";
                    break;
                case "en":
                case "ru":
                case "de":
                case "fr":
                case "it":
                case "tr":
                    break;
                default:
                    lng = "en";
                    break;
            }
        }
        return lng;
    },

    init: function(preloaderContainer, gameContainer, loginButton)
    {
        integrationHelper.preloaderContainer = preloaderContainer;
        integrationHelper.loginButton = loginButton;
        integrationHelper.gameContainer = gameContainer;

        window.addEventListener("resize", integrationHelper.updateSize);
        setInterval(integrationHelper.updateSize, 1000);

        window.portalApiAsyncInit = integrationHelper.portalApiAsyncInit;
        window.plAsyncInit = integrationHelper.plAsyncInit;

        (function(d, s, id)
        {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id))
            {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            js.src = "https://cdn01.x-plarium.com/browser/canvas/sdk/v2/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'plarium-jssdk'));

        (function(d, s, id)
        {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id))
            {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            if (consts.isQA) js.src = "https://staging-wi.x-plarium.com/static/billing/sdk.js";
            else js.src = "//cdn01.x-plarium.com/billing/sdk/sdk.js";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'plarium-billing'));
    },

    plAsyncInit: function()
    {
        PL.Event.subscribe(PL.Event.PRICE_PACKS_LOADED, integrationHelper.pricePacksLoaded);
        PL.Event.subscribe(PL.Event.BANK_CLOSED, function()
        {
            integrationHelper.transactionResult(3);
        });
        PL.Event.subscribe(PL.Event.BANK_PAYMENT_SUCCESS, function()
        {
            integrationHelper.transactionResult(1);
        });
        PL.Event.subscribe(PL.Event.BANK_PAYMENT_FAILED, function()
        {
            integrationHelper.transactionResult(2);
        });
        PL.Event.subscribe(PL.Event.BANK_PAYMENT_CANCELED, function()
        {
            integrationHelper.transactionResult(3);
        });
        PL.Loader.load('Billing',
        {
            gameId: PL.GAMES.TR,
            networkId: PL.NETWORKS.PP
        });
    },

    pricePacksLoaded: function(prices)
    {
        prices = JSON.stringify(prices);
        console.log(prices);
        integrationHelper.prices = prices;
   
        if (typeof Module == "undefined" || typeof Module.asmLibraryArg == "undefined" || typeof Module.asmLibraryArg._PricesLoadedCallback != "function") return;
        Module.asmLibraryArg._PricesLoadedCallback();
        return;       
    },

    transactionResult: function(result)
    {
        console.log('Transaction result:' + result);

        if (typeof Module == "undefined" || typeof Module.asmLibraryArg == "undefined" || typeof Module.asmLibraryArg._TransactionResultCallback != "function") return;
        Module.asmLibraryArg._TransactionResultCallback(result);
        return;
    },

    portalApiAsyncInit: function()
    {
        PLP.init(
        {
            version: 1,
            onReady: function()
            {
                PLP.api(
                {
                    action: 'getUserGameInfo'
                },
                {
                    success: function(userGameData)
                    {
                        console.log(userGameData);
                        integrationHelper.userName = userGameData.name;
                        integrationHelper.avatarUrl = userGameData.pic + "?fromgame=1";

                        //startWith polyfill for old browsers
                        if (!String.prototype.startsWith) {
                            String.prototype.startsWith = function(searchString, position){
                                return this.substr(position || 0, searchString.length) === searchString;
                            };
                        }

                        if (!integrationHelper.avatarUrl.startsWith("http")) integrationHelper.avatarUrl = "https:" + integrationHelper.avatarUrl;
                        unityHelper.signedRequest = userGameData.access_token;
                        unityHelper.lid = userGameData.uid + "";
                        integrationHelper.urlParams = decodeURIComponent(userGameData.q);
                        integrationHelper.email = userGameData.email;
                        integrationHelper.lp = userGameData.lp;
                        integrationHelper.portalNetwork =
                            (userGameData.ht == "Portal Desktop") ? "PPD" :
                            (userGameData.ht == "Portal" ? "PP" : "PPRS");
                        integrationHelper.done();
                    },
                    error: function(message, reason)
                    {
                        // Handle error here.
                        console.log(message);
                        console.log(reason);
                        integrationHelper.portalFail();
                    }
                });
            }
        });
    },

    portalFail: function()
    {
        //TODO
    },

    updateSize: function()
    {
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
        var offset = 2;
        document.body.style.height = (h - offset) + "px";
        document.body.style.width = (w - offset) + "px";
        integrationHelper.gameContainer.style.width = (w - offset) + "px";
        integrationHelper.gameContainer.style.height = (h - consts.topMargine) + "px";
        var preloadContainer = integrationHelper.preloaderContainer;
        if (preloadContainer) {
            preloadContainer.style.width = (w - offset) + "px";
            preloadContainer.style.height = (h - offset - consts.topMargine) + "px";
        }

        if (typeof preloader !== 'undefined')
            preloader.updateSize();
        else
            setTimeout(integrationHelper.updateSize, 200);

        if (typeof Module == "undefined" || typeof Module.canvas == "undefined") return;
        Module.canvas.width = w - offset;
        Module.canvas.height = h - offset - consts.topMargine;
    },

    done: function()
    {
        console.log("done");
        if (typeof integrationHelper.onReady == "function") integrationHelper.onReady();
    },

    showMeHtmlBank: function()
    {
        if (typeof Module == "undefined" || typeof Module.asmLibraryArg == "undefined" || typeof Module.asmLibraryArg._InvokeShowBank != "function") return false;
        return Module.asmLibraryArg._InvokeShowBank() == 1;
    },
};
var integrationHelper = PlariumPortalIntegration;

onIntegrationReady();