<!DOCTYPE html>
<html lang="en-us">

<head>
    <meta charset="utf-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
    <title>Unity WebGL Player | WebGLRecursionBugTest</title>
    <link rel="stylesheet" href="template/template.css?v=50" />
    <link rel="shortcut icon" href="template/favicon.png" />
    <script src="Build/UnityLoader.js?v=7"></script>
    <script src="scripts/unityhelper.js?v=13"></script>
    <script src="scripts/InputProxy.js?v=6"></script>
    <!--bugsnag-->
    <script src="scripts/bugTracker.js?v=1" data-apikey="DATA_API_KEY"></script>
	<script type="application/javascript">(function(w,d,t,r,u){w[u]=w[u]||[];w[u].push({'projectId':'10000','properties':{'pixelId':'433058'}});var s=d.createElement(t);s.src=r;s.async=true;s.onload=s.onreadystatechange=function(){var y,rs=this.readyState,c=w[u];if(rs&&rs!="complete"&&rs!="loaded"){return}try{y=YAHOO.ywa.I13N.fireBeacon;w[u]=[];w[u].push=function(p){y([p])};y(c)}catch(e){}};var scr=d.getElementsByTagName(t)[0],par=scr.parentNode;par.insertBefore(s,scr)})(window,document,"script","https://s.yimg.com/wi/ytc.js","dotq");</script>
</head>

<body>


    <div class="webpreloader__fullscreen-container">
        <div class="webpreloader__wrapper">
            <div class="webpreloader__animation">
            </div>
            <div class="webpreloader__main">
                <picture>
                    <source class="webpreloader__flag" type="image/webp" srcset="./template/loader_assets/resources/flag.webp" />
                    <img class="webpreloader__flag" src="./template/loader_assets/resources/flag.png" />
                </picture>
                <div class="webpreloader__flag">
                    <p class="webpreloader__header"></p>
                    <div class="webpreloader__skill">
                        <div class="webpreloader__skill-icon-background">
                            <div class="webpreloader__icon"></div>
                            <div class="webpreloader__foreground"></div>
                        </div>
                        <p class="webpreloader__skill-description"></p>
                        <p class="webpreloader__skill-value"></p>
                    </div>
                    <div class="webpreloader__skill">
                        <div class="webpreloader__skill-icon-background">
                            <div class="webpreloader__icon"></div>
                            <div class="webpreloader__foreground"></div>
                        </div>
                        <p class="webpreloader__skill-description"></p>
                        <p class="webpreloader__skill-value"></p>
                    </div>
                    <div class="webpreloader__skill">
                        <div class="webpreloader__skill-icon-background">
                            <div class="webpreloader__icon"></div>
                            <div class="webpreloader__foreground"></div>
                        </div>
                        <p class="webpreloader__skill-description"></p>
                        <p class="webpreloader__skill-value"></p>
                    </div>
                </div>
            </div>

            <picture>
                <source class="webpreloader__footer" type="image/webp" srcset="./template/loader_assets/resources/footer3.webp"  onselectstart="return false" ondragstart="return false" oncontextmenu="return false"/>
                <img class="webpreloader__footer" src="./template/loader_assets/resources/footer3.png" onselectstart="return false" ondragstart="return false" oncontextmenu="return false"/>
            </picture>

            <div class="webpreloader__shadow-left"></div>
            <div class="webpreloader__shadow-right"></div>

            <div class="webpreloader__main">
                <picture>
                    <source class="webpreloader__logo-throne" type="image/webp" srcset="./template/loader_assets/resources/logo_throne.webp" onselectstart="return false" ondragstart="return false" oncontextmenu="return false"
                    />
                    <img class="webpreloader__logo-throne" src="./template/loader_assets/resources/logo_throne.png" onselectstart="return false" ondragstart="return false" oncontextmenu="return false"/>
                </picture>

                <div class="webpreloader__progress">
                    <div class="webpreloader__progress-wrapper">
                        <div class="webpreloader__progress-bar"></div>
                    </div>

                    <div class="webpreloader__progress-left"></div>
                    <div class="webpreloader__progress-right"></div>
                    <p class="webpreloader__progress-value"></p>
                </div>

                <p class="webpreloader__tips-text"></p>
                <div class="webpreloader__plarium-logo"></div>
            </div>
        </div>

        <div id="gameContainer" class="webpreloader__game-container"></div>
    </div>

    <div class="updateBrowser__container">
        <div class="updateBrowser__preload">
            <img src="template/loader_assets/resources/btn_orange_110x35_down.png" width="1" height="1" alt="preload1" />
            <img src="template/loader_assets/resources/btn_orange_110x35_over.png" width="1" height="1" alt="preload2" />
        </div>

        <div class="updateBrowser__image"></div>

        <p class="updateBrowser__header">Alert</p>
        <p class="updateBrowser__title">To fully immerse yourself in the game, use the latest version of</p>

        <div class="updateBrowser__link-container">
            <a class="updateBrowser__link" href="//mozilla.org/firefox/new/" target="_blank">Mozilla Firefox,</a>
            <a class="updateBrowser__link updateBrowser__link-safari" href="//support.apple.com/en-us/HT204416" target="_blank">Safari,</a>
            <a class="updateBrowser__link" href="//opera.com/" target="_blank">Opera</a>
            <span class="updateBrowser__inline-text">and also</span>
            <a class="updateBrowser__link" href="//google.com/chrome/browser/desktop/" target="_blank">Google Chrome,</a>
            <span class="updateBrowser__es-fix"></span>
            <a class="updateBrowser__link updateBrowser__link-yabrowser" href="//browser.yandex.com" target="_blank">Yandex.Browser</a>
        </div>

        <p class="updateBrowser__text-top"></p>
        <p class="updateBrowser__text-bottom"></p>
        <div class="updateBrowser__button-wrapper">
            <div class="updateBrowser__continue-button">
                <span class="updateBrowser__continue-text"></span>
            </div>
        </div>
    </div>

    <script language="javascript">
        var consts = {
            appId: "1348457731834476",
            appVersion: "APP_VERSION",
            isPortal: true,
            isQA: true,
            topMargine: 60,
            minHeight: 800,
            minWidth: 1044,
            unityVersion: 52,
            enableTracker: false,
            isPreloaderWeb: true
        };
		consts.isLocal = true;
        document.body.style.minWidth = consts.minWidth;
        document.body.style.minHeight = consts.minHeight;

        consts.topMargine = consts.isPortal ? 0 : 60;

        CreateMain();

        function CreateMain() {
            var script = document.createElement("script");
            script.src = "scripts/main.js?v=43";
            script.async = false;
            document.body.appendChild(script);
        }
    </script>
</body>

</html>