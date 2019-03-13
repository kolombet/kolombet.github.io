function createScript(src) {
    var scr = document.createElement('script');
    scr.src = src;
    scr.async = false;
    document.body.appendChild(scr);
};

function RoundSimple(val) {
    val = val | 0;
    val = ((val >> 1) << 1);
    return val;
};

function getLanguage() {
    var str = document.location.search;
    var ind = str.indexOf("lang=");
    var lng = "en";
    if (ind !== -1)
    {
        lng = str.substring(ind + 5, ind + 7);
    }
    return lng;
}

function onPreloaderReady() {
    preloader.init();
    preloader.show();

    if (window.isBrowserSupported) {
        var gameContainer = document.getElementById("gameContainer");
        unityHelper.startLoading(gameContainer);
    }
}

function onIntegrationReady() {
    //start main logic
    integrationHelper.onReady = function () {
        createScript(consts.isPreloaderWeb ? "scripts/preloaderWeb.js?v=12" : "scripts/preloader.js?v=12");
    };

    console.log("int ready");
    var preloaderContainer = document.getElementById("preloaderContainer");
    var gameContainer = document.getElementById("gameContainer");
    var loginButton = document.getElementById("playNowButton");

    integrationHelper.init(preloaderContainer, gameContainer, loginButton);
}

function initIntegrationHelper() {
    if (consts.isLocal) {
        createScript("scripts/LocalIntegration.js");
        return;
    }

    createScript(consts.isPortal ? "scripts/PlariumPortalIntegration.js?v=11" : "scripts/FacebookIntegration.js?v=10");
}

function isBrowserSupportedInternal() {
    var isWebglSupported = function () {
        var gl;
        try {
            gl = document.createElement('canvas').getContext("webgl");
        }
        catch (x) {
            gl = null;
        }

        if (gl === null) {
            try {
                gl = document.createElement('canvas').getContext("experimental-webgl");
            }
            catch (x) {
                gl = null;
            }
        }
        return !!gl;
    };

    var isES6Supported = function () {
        "use strict";

        if (typeof Symbol === "undefined") return false;
        try {
            eval("class Foo {}");
            eval("var bar = (x) => x+1");
        } catch (e) {
            return false;
        }

        return true;
    };

    var isModernBrowser = function () {
        var isArrayBufferSupported = !!window.ArrayBuffer;
        var indexedDB = window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB;
        var isIndexDBSupported = !!indexedDB;
        var isWebsocketSupported = !!window.WebSocket;
        var audioContext = (window.AudioContext ||
            window.webkitAudioContext ||
            window.mozAudioContext ||
            window.oAudioContext ||
            window.msAudioContext);
        var isAudioContextSupported = !!audioContext;
        return isArrayBufferSupported && isIndexDBSupported && isWebsocketSupported && isAudioContextSupported;
    };

    var isNotIE = function () {
        // Internet Explorer 6-11
        var isIE = !!document.documentMode;
        // Edge 20+
        //var isEdge = !isIE && !!window.StyleMedia;
        return !isIE;
    };

    return isNotIE() && isWebglSupported() && isModernBrowser();
}
window.isBrowserSupported = isBrowserSupportedInternal();

if (!window.isBrowserSupported) {
    var lang = getLanguage();

    var locales = 
    {
        "ru": [
            "Внимание!",
            "Технология WebGL некорректно работает в вашем браузере или несовместима с ним.",
            "Для полного погружения в игровой процесс используйте последнюю версию браузеров",
            "и других браузеров на базе Chromium.",
            "Продолжить",
            "а также",
            "Яндекс.Браузер"
        ],
        "en": [
            "Attention!",
            "The WebGL technology is not working correctly in your browser or is incompatible with it.",
            "To fully immerse yourself in the game, use the latest version of",
            "or any other Chromium-based browser.",
            "Continue",
            "and also",
            "Yandex.Browser"
        ],
        "fr": [
            "Attention !",
            "La technologie WebGL ne fonctionne pas correctement ou est incompatible avec ton navigateur.",
            "Pour vous immerger complètement dans le jeu, utilisez la dernière version de",
            "ou de tout autre navigateur basé sur Chromium.",
            "Continuer",
            "",
            "Yandex.Browser"
        ],
        "de": [
            "Achtung!",
            "Die WebGL-Technologie funktioniert nicht richtig mit deinem Browser oder ist zu ihm inkompatibel.",
            "Um voll in das Spiel einzutauchen, verwende bitte die neueste Version von",
            "sowie jeden anderen chromium-basierten Browser.",
            "Weiter",
            "oder auch",
            "Yandex.Browser"
        ],
        "it": [
            "Attenzione!",
            "La tecnologia WebGL non funziona correttamente o non è supportata sul tuo browser.",
            "Per un'esperienza di gioco ottimale, usa la versione più recente di",
            "o qualsiasi altro browser con tecnologia Chromium.",
            "Continua",
            "o anche",
            "Yandex.Browser"
        ],
        "es": [
            "¡Atención!",
            "La tecnología WebGL no funciona correctamente en tu navegador o simplemente es incompatible con él.",
            "Para sumergirte de lleno en el juego, usa la última versión de",
            "o cualquier otro navegador basado en Chromium.",
            "Continuar",
            "",
            "Yandex.Browser"
        ]
    };
    var locale = locales[lang];

    var isMac = navigator.platform.toLowerCase().indexOf('mac') >= 0;
    document.querySelector('.updateBrowser__link-safari').style.display = isMac ? "block" : "none";
    document.querySelector('.updateBrowser__container').style.display = "block";
    document.querySelector('.updateBrowser__header').textContent = locale[0];
    document.querySelector('.updateBrowser__title').textContent = locale[1];
    document.querySelector('.updateBrowser__text-top').textContent = locale[2];
    document.querySelector('.updateBrowser__text-bottom').textContent = locale[3];
    document.querySelector('.updateBrowser__continue-text').textContent = locale[4];
    document.querySelector('.updateBrowser__continue-button').addEventListener('click', function () {
        document.querySelector('.updateBrowser__container').style.display = "none";
        unityHelper.startLoading(gameContainer);
    });
    document.querySelector('.updateBrowser__inline-text').textContent = locale[5];
    document.querySelector('.updateBrowser__link-yabrowser').textContent = locale[6];
    
    //Es locale have other "and also" placement: "Mozilla Firefox, Safari, Opera, Google Chrome o Yandex.Browser"
    document.querySelector('.updateBrowser__es-fix').textContent = lang === "es" ? "o" : "";
}

function getCpuArchitecture() {
    var get64UserAgents = function get64UserAgents() {
        return ['x86_64', 'x86-64', 'Win64', 'x64;', 'amd64', 'AMD64', 'WOW64', 'x64_64'];
    };
    var is64ByCpuClass = function is64ByCpuClass() {
        return navigator.cpuClass === 'x64';
    };
    var is64BitByPlatform = function is64BitByPlatform() {
        return navigator.platform === 'MacIntel' || navigator.platform === 'Linux x86_64';
    };
    var is64BitByUa = function is64BitByUa() {
        return get64UserAgents().filter(function (str) {
            return navigator.userAgent.indexOf(str) > -1;
        }).length > 0;
    };
    var is64arch = function is64arch() {
        return is64ByCpuClass() || is64BitByPlatform() || is64BitByUa();
    };
    return is64arch() ? 'x64' : 'x86';
}

function setBugsnagTabContent(strTabName, strAttrName, strAttrValue) {
	if (Bugsnag.metaData == null) 
	Bugsnag.metaData = {};

	if (Bugsnag.metaData[strTabName] == null) 
		Bugsnag.metaData[strTabName] = {};

	Bugsnag.metaData[strTabName][strAttrName] = strAttrValue;
}

function formatBytesToMb(val) {
    var MB_SIZE = 1048576;
    return Math.round(val / MB_SIZE);
}

function getMemoryStats() {
    var memory = window.performance.memory;
    var limit = formatBytesToMb(memory.jsHeapSizeLimit);
    var total = formatBytesToMb(memory.totalJSHeapSize);
    var used = formatBytesToMb(memory.usedJSHeapSize);
    return used + "/" + total + "/" + limit;
}

function updateMemoryStats() {
    if (window.performance !== undefined && window.performance.memory !== undefined) {
        setBugsnagTabContent("Additional Info", "Chrome memory stats", getMemoryStats());
    }
}

setBugsnagTabContent("Additional Info", "Browser Supported", window.isBrowserSupported ? "true" : "false");
if (window.isBrowserSupported) {
    if (consts.isQA)
        CreateMemoryTracker();

    setBugsnagTabContent("Additional Info", "Cpu Architecture", getCpuArchitecture());

    updateMemoryStats();
    initIntegrationHelper();
} 


/* QA label helper */
document.addEventListener('keydown', function(event) {
    var yKeyCode = 89;
    if (event.keyCode == yKeyCode) {
        var unityClipboard = window["WebGLHelperUnityClipboard"]
        if (unityClipboard == undefined)
            return;
        var input = document.createElement("input");
        input.setAttribute("value", unityClipboard);
        document.body.appendChild(input);
        input.select();
        var result = document.execCommand("copy");
        document.body.removeChild(input);
    }
}, false);

function showLabelsViewer(json) {
	window.labelsViewerJson = JSON.parse(json);
	
	if (window.labelsViewerInstance == undefined)
		createScript("scripts/labelsViewer.js?v=4");
	else
		window.onLabelsViewerReady();
}

function onLabelsViewerReady() {
	window.labelsViewerInstance.draw(window.labelsViewerJson);
}
/* QA label helper end*/

function CreateMemoryTracker() {
    createScript("scripts/memory.js?v=1");
}

function GetBrowserNameVersion() {
	var browsers = {
		Firefox: !!window.InstallTrigger,
		Safari: !!window.ApplePaySession,
		Opera: window.opr && !!window.opr.addons,
		Yandex: !!window.yandex,
		Edge: !!window.StyleMedia,
		Chrome: window.chrome && !this.Opera && !this.Yandex && !this.Edge && !this.Firefox && !this.Safari
	};

	var userAgents = {
		Firefox: /Firefox\/([0-9]+)\./,
		Safari: / Safari\/([0-9]+)\./,
		Opera: / OPR\/([0-9]+)\./,
		Yandex: /YaBrowser\/([0-9]+)\./,
		Chrome: /Chrome\/([0-9]+)\./,
		Edge: /Edge\/([0-9]+)\./
	};

	var match = function match(userAgentRegex) {
		return window.navigator.userAgent.match(userAgentRegex);
	};

	var getVersion = function getVersion(match) {
		return match ? parseInt(match[1]) : 0;
	};

	var check = function check(browser) {
		return browsers[browser] === true && !!match(userAgents[browser]);
	};

	var detect = function detect() {
		return Object.keys(browsers).find(check);
	};

	var browser = detect();
	var version = getVersion(match(userAgents[browser]));
	return browser + " " + version;
}