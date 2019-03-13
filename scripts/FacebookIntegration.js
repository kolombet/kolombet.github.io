var FacebookIntegration = {
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
    size: {
        width: 0,
        height: 0
    },

    getUrlParams: function()
    {
        return window.location.search;
    },
    
    getSystemLanguage: function()
    {
        var lng = (window.navigator.userLanguage || window.navigator.language).substring(0,2).toLowerCase();
        switch (lng) {
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
        return lng;
    },

    init: function(preloaderContainer, gameContainer, loginButton)
    {
        integrationHelper.preloaderContainer = preloaderContainer;
        integrationHelper.loginButton = loginButton;
        integrationHelper.gameContainer = gameContainer;
        integrationHelper.isCanvasMaybe = document.referrer.indexOf("https://apps.facebook.com/") != -1;
        console.log(integrationHelper.isCanvasMaybe);
        integrationHelper.updateSize = integrationHelper.isCanvasMaybe ? integrationHelper.updateSizeCanvas : integrationHelper.updateSizeNormal;

        window.addEventListener("resize", integrationHelper.updateSize);
        setInterval(integrationHelper.updateSize, 1000);

        window.fbAsyncInit = integrationHelper.fbAsyncInit;

        (function(d, s, id)
        {
            var js, fjs = d.getElementsByTagName(s)[0];
            if (d.getElementById(id))
            {
                return;
            }
            js = d.createElement(s);
            js.id = id;
            if (consts.isDebug) js.src = "https://connect.facebook.net/en_US/sdk/debug.js#xfbml=1&version=v2.6&appId=" + consts.appId + "&cookie=1&status=1";
            else js.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v2.6&appId=" + consts.appId + "&cookie=1&status=1";
            fjs.parentNode.insertBefore(js, fjs);
        }(document, 'script', 'facebook-jssdk'));
    },
    fbAsyncInit: function()
    {
        FB.getLoginStatus(integrationHelper.fbResponseHandler);
        integrationHelper.updateSize();
    },
    fbResponseHandler: function(response)
    {
        console.log(response);
        if (response.status === 'connected')
        {
            unityHelper.signedRequest = response.authResponse.signedRequest;
            unityHelper.lid = response.authResponse.userID;

            if (response.authResponse.grantedScopes === undefined)
            {
                FB.api('/me/permissions', function(response)
                {
                    //console.log(response);
                    var scopes = [];
                    for (var x = 0; x < response.data.length; x += 1)
                        if (response.data[x].status == "granted") scopes.push(response.data[x].permission);
                    integrationHelper.checkPermissions(scopes.join(','));
                });
            }
            else integrationHelper.checkPermissions(response.authResponse.grantedScopes);

        }
        else if (response.status === 'not_authorized')
        {
            integrationHelper.fbFail();
        }
        else
        {
            integrationHelper.fbFail();
        }
    },
    checkPermissions: function(grantedPermissions)
    {
        if ((integrationHelper.needLogin && integrationHelper.forcePermissions) && !integrationHelper.checkArrays(grantedPermissions, integrationHelper.permissions))
        {
            integrationHelper.forcePermissions = false;
            integrationHelper.fbFail();
        }
        else
        {
            integrationHelper.done();
        }
    },
    fbFail: function()
    {
        console.log('fail ' + integrationHelper.needLogin);
        if (integrationHelper.isCanvasMaybe && integrationHelper.needLogin)
        {
            if (!integrationHelper.forcePermissions)
            {
                //TODO: show login button
            }
            integrationHelper.fbDoLogin();
        }
        else
        {
            integrationHelper.showLoginButton();
        }
        integrationHelper.needLogin = false;
    },
    fbDoLogin: function()
    {
        FB.login(integrationHelper.fbResponseHandler,
        {
            scope: integrationHelper.permissions.join(','),
            return_scopes: true,
            auth_type: 'rerequest'
        });
    },
    updateSizeNormal: function()
    {
        var isFullscreenSize = window.innerWidth == screen.width && window.innerHeight == screen.height;
        var isFullscreen = document.fullscreenElement || isFullscreenSize;

        if (isFullscreen) return false;
        
        var frameHeight = window.innerHeight;
        var h = RoundSimple(frameHeight < consts.minHeight ? consts.minHeight : frameHeight);
        var w = RoundSimple(window.innerWidth < consts.minWidth ? consts.minWidth : window.innerWidth);


        integrationHelper.size.width = w;
        integrationHelper.size.height = h;

        var offset = 2;
        document.body.style.height = (h - offset) + "px";
        document.body.style.width = (w - offset) + "px";
        integrationHelper.gameContainer.style.width = (w - offset) + "px";
        integrationHelper.gameContainer.style.height = (h - offset - consts.topMargine) + "px";

        if (typeof preloader !== 'undefined')
            preloader.updateSize();
        else
            setTimeout(FacebookIntegration.updateSizeNormal, 200);


        if (typeof Module == "undefined" || typeof Module.canvas == "undefined") return false;
        Module.canvas.width = w - offset;
        Module.canvas.height = h - offset - consts.topMargine;

        return true;
    },
    updateSizeCanvas: function()
    {
        if (typeof FB == "undefined") return;

        FB.Canvas.getPageInfo(integrationHelper.gotPageInfo);
    },
    gotPageInfo: function(info)
    {
        if (!integrationHelper.updateSizeNormal())
            return false;

        if (typeof FB != "undefined")
        {
            FB.Canvas.setAutoGrow(false);
            FB.Canvas.setSize(
            {
                height: info.clientHeight,
                width: info.clientWidth
            });
        }
    },
    checkArrays: function(first, second)
    {
        if (first === undefined) return false;
        for (var i = 0; i < second.length; i++)
        {
            if (first.indexOf(second[i]) === -1)
                return false;
        }
        return true;
    },
    done: function()
    {
        console.log("done");
        integrationHelper.hideLoginButton();

        if (typeof integrationHelper.onReady == "function") integrationHelper.onReady();
    },
    hideLoginButton: function()
    {
        if (integrationHelper.loginButton) {
            integrationHelper.loginButton.onclick = null;
            integrationHelper.loginButton.style.display = "none";
        }
    },
    showLoginButton: function()
    {
        if (integrationHelper.loginButton) {
            integrationHelper.loginButton.onclick = integrationHelper.fbDoLogin;
            integrationHelper.loginButton.style.display = "block";
        }
    },
};

var integrationHelper = FacebookIntegration;
onIntegrationReady();