"use strict";

enum LoaderState {
    FadeIn,
    Show,
    FadeOut,
}

const LoaderConf = {
    transitionTime: 500,
    showTime: 6000,
    progressBarFullWidth: 462,
    slidePath: "template/loader_assets/slides/",
    slideCount: 29,
    maxLagDelta: 100,
    preloadImagesCount: 4,
    progressBarFillSpeed: 0.00015
};

class PreloaderWeb {
    wrapper: HTMLElement;
    slide: HTMLElement;
    progressBarFill: HTMLElement;
    sliderValue: HTMLElement;
    animationContainers: Array<HTMLElement>;
    gameContainer: HTMLElement;

    currentState: LoaderState = LoaderState.FadeIn;

    progressBarValue: number = 0;
    progressBarTargetValue: number = 0;
    opacityLevel: number = 0;
    showTimestamp: number;
    lastTime: number;

    isVisible: boolean = false;
    isWebPSupported: boolean = false;

    currentImageID: number;
    preloadedImageID: number;
    preloadedImages: Array<HTMLImageElement> = [];
    gameErrorSlideID: number;
    preloadedCount = 0;
    locale: Object;

    constructor() {
    }

    /**
     * Public
     */
    public init() {
        window['fullscreenContainer'] = document.getElementsByClassName('webpreloader__fullscreen-container')[0];

        this.gameContainer = document.getElementsByClassName('webpreloader__game-container')[0] as HTMLElement;
        this.wrapper = document.getElementsByClassName('webpreloader__wrapper')[0] as HTMLElement;
        this.slide = document.getElementsByClassName('webpreloader__animation')[0] as HTMLElement;
        this.progressBarFill = document.getElementsByClassName('webpreloader__progress-bar')[0] as HTMLElement;
        this.sliderValue = document.getElementsByClassName('webpreloader__progress-value')[0] as HTMLElement;
        this.animationContainers = [];
        this.animationContainers.push(document.getElementsByClassName('webpreloader__header')[0] as HTMLElement);
        const icons = document.getElementsByClassName('webpreloader__icon');
        const labels = document.getElementsByClassName('webpreloader__skill-description');
        for (let i = 0; i < icons.length; i++) {
            this.animationContainers.push(icons[i] as HTMLElement);
            this.animationContainers.push(labels[i] as HTMLElement);
        }
        this.animationContainers.push(document.getElementsByClassName('webpreloader__animation')[0] as HTMLElement);
        this.preloadedImageID = Math.round(Math.random() * LoaderConf.slideCount);

        this.updateLocale();
        this.lastTime = Date.now();
    }

    /**
     * @param {number} value
     * @param {boolean} isUnityProgress - is function called from unity plugin
     */
    public setProgress(value: number, isUnityProgress: boolean, isInstant: boolean = false) {
        if (isInstant) {
            this.progressBarValue = value;
            this.progressBarFill.style.left = (this.progressBarValue - 1) * LoaderConf.progressBarFullWidth + "px";
            this.progressBarTargetValue = value;
            return;
        }

        let preloadValue = .5 * value;
        if (isUnityProgress) {
            preloadValue = value;
        }

        this.progressBarTargetValue = preloadValue;
    }

    public show() {
        if (this.isVisible)
            return;

        if (this.gameContainer)
            this.gameContainer.style.visibility = 'hidden';
        this.wrapper.style.display = 'block';

        this.updateLocale();

        this.isVisible = true;
        this.progressBarValue = 0;
        this.progressBarFill.style.left = (this.progressBarValue - 1) * LoaderConf.progressBarFullWidth + "px";
        this.progressBarTargetValue = 0;

        this.checkWebpSupport((isSupported) => {
            this.isWebPSupported = isSupported;
            this.showNextImage();
            this.update();
        });
    }


    /**
     * @param {boolean} isUnityProgress - is function called from unity plugin
     */
    public hide(isUnityProgress: boolean) {
        if (isUnityProgress) {
            if (this.gameContainer)
                this.gameContainer.style.visibility = 'visible';
            this.wrapper.style.display = 'none';
            this.isVisible = false;
            this.currentState = LoaderState.FadeIn;
            this.opacityLevel = 0;
            this.updateOpacity();
            this.progressBarFill.style.left = -LoaderConf.progressBarFullWidth + "px";
        }
    }

    public updateSize() {

    }

    public showLoading() {

    }

    public hideLoading() {

    }

    public getCurrentImageId() {
        return this.gameErrorSlideID;
    }

    /**
     * Private
     */
    private update() {
        if (this.isVisible === false)
            return;
        const delta = Date.now() - this.lastTime;
        //When unity initializing, main thread freeze and we don't update ui to prevent animation flickering
        if (delta < LoaderConf.maxLagDelta) {
            this.updateAnimationState(delta);
            this.updateBarState(delta);
        }
        this.lastTime = Date.now();
        window.requestAnimationFrame(this.update.bind(this));
    }

    private updateBarState(delta: number) {
        if (Math.abs(this.progressBarTargetValue - this.progressBarValue) < 0.001)
            return;

        this.progressBarValue += LoaderConf.progressBarFillSpeed * delta;

        if (this.progressBarValue > this.progressBarTargetValue)
            this.progressBarValue = this.progressBarTargetValue;

        this.progressBarFill.style.left = (this.progressBarValue - 1) * LoaderConf.progressBarFullWidth + "px";

        if (this.sliderValue) {
            this.sliderValue.textContent = Math.round(this.progressBarValue * 100) + "%";
        }
    }

    private updateAnimationState(delta: number) {
        if (this.currentState === LoaderState.FadeIn) {
            this.opacityLevel += delta / LoaderConf.transitionTime;
        }
        if (this.currentState === LoaderState.FadeOut) {
            this.opacityLevel -= delta / LoaderConf.transitionTime;
        }

        if (this.currentState === LoaderState.FadeIn && this.opacityLevel >= 1) {
            this.currentState = LoaderState.Show;
            this.showTimestamp = Date.now();
        }
        if (this.currentState === LoaderState.Show) {
            const isNextSlideLoaded = this.preloadedCount == LoaderConf.preloadImagesCount;
            const isShowTimePassed = Date.now() - this.showTimestamp >= LoaderConf.showTime;
            //prevent slide switch on unity initialization
            const isLagZone = Math.abs(this.progressBarTargetValue - .5) < 0.05;
            if (isNextSlideLoaded && isShowTimePassed && !isLagZone) {
                this.currentState = LoaderState.FadeOut;
            }
        }
        if (this.currentState === LoaderState.FadeOut && this.opacityLevel <= 0) {
            this.showNextImage();
            this.currentState = LoaderState.FadeIn;
        }

        this.updateOpacity();
    }

    private showNextImage(): void {
        this.currentImageID = this.preloadedImageID;
        if (this.slide != null) {
            this.slide.style.backgroundImage = "url(" + this.getImageURL(this.currentImageID) + ")";
        }

        const header = document.getElementsByClassName('webpreloader__header')[0];
        header.textContent = this.locale[this.preloadedImageID][0];

        const rows = document.getElementsByClassName('webpreloader__skill');
        const iconExtension = ".png";
        for (let index = 0; index < rows.length; index++) {
            let item = rows[index];
            const description = item.getElementsByClassName('webpreloader__skill-description')[0];
            description.textContent = this.locale[this.preloadedImageID][index + 1];

            const icon: HTMLElement = item.getElementsByClassName('webpreloader__icon')[0] as HTMLElement;
            icon.style.backgroundImage = "url(" + LoaderConf.slidePath + this.preloadedImageID + "/" + (index + 1) + iconExtension + ")";
        }

        // Preload next image, to show instantly
        this.preloadedImageID++;
        if (this.preloadedImageID > LoaderConf.slideCount) {
            this.preloadedImageID = 0;
        }

        this.preloadedImages = [];
        this.preloadedCount = 0;

        const preloadedSlideID = this.preloadedImageID;
        const preloadedSlideURL = this.getImageURL(preloadedSlideID);
        const preloadedSlide = new Image();
        preloadedSlide.src = preloadedSlideURL;
        preloadedSlide.onload = () => {
            this.gameErrorSlideID = preloadedSlideID;
            this.preloadedCount++;
        };
        preloadedSlide.onerror = () => {
            this.preloadedCount++;
        };
        this.preloadedImages.push(preloadedSlide);

        const preloadURLs = [
            LoaderConf.slidePath + this.preloadedImageID + "/1" + iconExtension,
            LoaderConf.slidePath + this.preloadedImageID + "/2" + iconExtension,
            LoaderConf.slidePath + this.preloadedImageID + "/3" + iconExtension
        ];
        preloadURLs.forEach((val) => {
            const preloadedImage = new Image();
            preloadedImage.src = val;
            preloadedImage.onload = preloadedImage.onerror = () => {
                this.preloadedCount++;
            };
            this.preloadedImages.push(preloadedImage);
        })
    }

    private getImageExtension(): string {
        return ".jpg";
        // return this.isWebPSupported ? ".webp" : ".jpg";
    }

    private getImageURL(id: number): string {
        return LoaderConf.slidePath + id + "/bg" + ".jpg";
    }

    private checkWebpSupport(callback: Function): void {
        const webP = new Image();
        webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        webP.onload = webP.onerror = () => {
            callback(webP.height === 2);
        };
    }

    private updateOpacity() {
        const opacityValue = this.opacityLevel.toString();
        for (let i = 0; i < this.animationContainers.length; i++) {
            this.animationContainers[i].style.opacity = opacityValue;
        }
    }

    private updateLocale() {
        let lang = PreloaderWeb.getLanguage();

        const locale = getLocale();
        this.locale = locale[lang] ? locale[lang] : locale["en"];

        let longLoadingText = getLongLoadingText();
        let longLoadingTextContainer = document.getElementsByClassName('webpreloader__tips-text')[0] as HTMLElement;
        if (longLoadingTextContainer)
            longLoadingTextContainer.textContent = longLoadingText[lang] ? longLoadingText[lang] : longLoadingText["en"];
    }

    private static getLanguage(): string {
        const integrationHelper = window['integrationHelper'];
        if (!integrationHelper)
            console.error("intergation helper not loaded");

        let lang = localStorage.getItem("webpreloaderLanguage");

        if (!lang) {
            if (integrationHelper)
                lang = integrationHelper.getSystemLanguage();
            else
                lang = "en";
        }
        return lang;
    }
}

const preloader = new PreloaderWeb();

const webPreloaderSetProgress = (value: number, isInstant: number) => {
    preloader.setProgress(value, true, Boolean(isInstant).valueOf());
};

const webPreloaderHide = () => {
    preloader.hide(true);
};

const webPreloaderShow = () => {
    preloader.show();
};

const webPreloaderGetCurrentImageId = () => {
    return preloader.getCurrentImageId();
};

const webPreloaderSetPreloaderLanguage = (lang) => {
    console.log("lang3: webPreloaderSetPreloaderLanguage " + lang);
    localStorage.setItem("webpreloaderLanguage", lang);
};

window['onPreloaderReady'].call();

function getLocale() {
    var ru = [
        ['Ударник', 'Урон копейщиков', 'Защита копейщиков с Героем', 'Цена тренировки Ударников'],
        ['Егерь', 'Урон кавалерии с Героем', 'Защита кавалерии', 'Цена тренировки Егерей'],
        ['Пращник', 'Урон стрелков', 'Цена тренировки Пращников', 'Здоровье стрелков с Героем'],
        ['Милитисса', 'Урон рыцарей с Героем', 'Защита рыцарей', 'Цена тренировки Милитисс'],
        ['Информатор', 'Урон воинов разведки I', 'Скорость воинов разведки I', 'Здоровье воинов разведки'],
        ['Кольщик', 'Цена тренировки Кольщиков', 'Защита копейщиков', 'Здоровье копейщиков с Героем'],
        ['Всадник', 'Здоровье кавалерии с героем', 'Цена тренировки Всадников', 'Урон кавалерии'],
        ['Лучница', 'Цена тренировки Лучниц', 'Урон стрелков с Героем', 'Защита стрелков'],
        ['Храмовник', 'Цена тренировки Храмовников', 'Урон рыцарей', 'Защита рыцарей с Героем'],
        ['Агент', 'Цена тренировки Агентов', 'Урон воинов разведки с Героем', 'Защита воинов разведки I'],
        ['Пикинер', 'Урон копейщиков с Героем', 'Цена тренировки Пикинеров', 'Защита копейщиков'],
        ['Кирасир', 'Цена тренировки Кирасиров', 'Урон кавалерии', 'Защита кавалерии с Героем'],
        ['Арбалетчик', 'Защита стрелков с Героем', 'Урон стрелков', 'Цена тренировки Арбалетчиков'],
        ['Легионер', 'Здоровье рыцарей с Героем', 'Цена тренировки Легионеров', 'Урон рыцарей'],
        ['Разведчик', 'Цена тренировки Разведчиков', 'Скорость воинов разведки II', 'Защита воинов разведки II'],
        ['Алебардист', 'Цена тренировки Алебардистов', 'Защита копейщиков', 'Здоровье копейщиков с Героем'],
        ['Латник', 'Цена тренировки Латников', 'Урон кавалерии с Героем', 'Защита кавалерии'],
        ['Рейнджер', 'Защита стрелков', 'Цена тренировки Рейнджеров', 'Здоровье стрелков с Героем'],
        ['Чемпион', 'Защита рыцарей', 'Цена тренировки Чемпионов', 'Урон рыцарей с Героем'],
        ['Шпион', 'Цена тренировки Шпионов', 'Урон воинов разведки с Героем', 'Скорость воинов разведки III'],
        ['Фаворит', 'Урон копейщиков', 'Здоровье копейщиков с Героем', 'Цена тренировки Фаворитов'],
        ['Страж', 'Защита кавалерии с Героем', 'Урон кавалерии', 'Цена тренировки Стражей'],
        ['Мастер', 'Урон стрелков с Героем', 'Защита стрелков', 'Цена тренировки Мастеров'],
        ['Гранд', 'Цена тренировки Грандов', 'Защита рыцарей', 'Здоровье рыцарей с Героем'],
        ['Тень', 'Защита воинов разведки с Героем', 'Урон воинов разведки I', 'Цена тренировки Теней'],
        ['Тритон', 'Урон Тритонов', 'Защита Тритонов', 'Здоровье Тритонов'],
        ['Левиафан', 'Урон Левиафанов', 'Защита Левиафанов', 'Здоровье Левиафанов'],
        ['Морская Ведьма', 'Урон Морских Ведьм', 'Защита Морских Ведьм', 'Здоровье Морских Ведьм'],
        ['Наутилус', 'Урон Наутилусов', 'Защита Наутилусов', 'Здоровье Наутилусов'],
        ['Мираж', 'Урон Миражей', 'Защита Миражей', 'Здоровье Миражей']
    ];
    var en = [
        ['Striker', 'Spearman Offense', 'Spearman Defense With the Hero', 'Striker Training Cost'],
        ['Forester', 'Cavalry Offense With the Hero', 'Cavalry Defense', 'Forester Training Cost'],
        ['Slinger', 'Ranged Offense', 'Slinger Training Cost', 'Ranged Health With the Hero'],
        ['Militissa', 'Knight Offense With the Hero', 'Knight Defense', 'Militissa Training Cost'],
        ['Informer', 'Scout Offense I', 'Scouting Speed I', 'Scout Health'],
        ['Impaler', 'Impaler Training Cost', 'Spearman Defense', 'Spearman Health With the Hero'],
        ['Horseman', 'Cavalry Health With the Hero', 'Horseman Training Cost', 'Cavalry Offense'],
        ['Archeress', 'Archeress Training Cost', 'Ranged Offense With the Hero', 'Ranged Defense'],
        ['Templar', 'Templar Training Cost', 'Knight Offense', 'Knight Defense With the Hero'],
        ['Agent', 'Agent Training Cost', 'Scout Offense With the Hero', 'Scout Defense I'],
        ['Pikeman', 'Spearman Offense With the Hero', 'Pikeman Training Cost', 'Spearman Defense'],
        ['Cuirassier', 'Cuirassier Training Cost', 'Cavalry Offense', 'Cavalry Defense With the Hero'],
        ['Arbalester', 'Ranged Defense With the Hero', 'Ranged Offense', 'Arbalester Training Cost'],
        ['Legionary', 'Knight Health With the Hero', 'Legionary Training Cost', 'Knight Offense'],
        ['Scout', 'Scout Training Cost', 'Scouting Speed II', 'Scout Defense II'],
        ['Halberdier', 'Halberdier Training Cost', 'Spearman Defense', 'Spearman Health With the Hero'],
        ['Knight-at-arms', 'Knight-at-arms Training Cost', 'Cavalry Offense With the Hero', 'Cavalry Defense'],
        ['Ranger', 'Ranged Defense', 'Ranger Training Cost', 'Ranged Health With the Hero'],
        ['Champion', 'Knight Defense', 'Champion Training Cost', 'Knight Offense With the Hero'],
        ['Spy', 'Spy Training Cost', 'Scout Offense With the Hero', 'Scouting Speed III'],
        ['Frontrunner', 'Spearman Offense', 'Spearman Health With the Hero', 'Frontrunner Training Cost'],
        ['Guardine', 'Cavalry Defense With the Hero', 'Cavalry Offense', 'Guardine Training Cost'],
        ['Crossbower', 'Ranged Offense With the Hero', 'Ranged Defense With the Hero', 'Crossbower Training Cost'],
        ['Seignior', 'Seignior Training Cost', 'Knight Defense', 'Knight Health With the Hero'],
        ['Shadowess', 'Scout Defense With the Hero', 'Scout Offense I', 'Shadowess Training Cost'],
        ['Triton', 'Triton Offense', 'Triton Defense', 'Triton Health'],
        ['Leviathan', 'Leviathan Offense', 'Leviathan Defense', 'Leviathan Health'],
        ['Sea Witch', 'Sea Witch Offense', 'Sea Witch Defense', 'Sea Witch Health'],
        ['Nautilus', 'Nautilus Offense', 'Nautilus Defense', 'Nautilus Health'],
        ['Mirage', 'Mirage Offense', 'Mirage Defense', 'Mirage Health']
    ];
    var sp = [
        ['Combatiente', 'Ataque de lanceros', 'Defensa de lanceros con el Héroe', 'Coste de Combatientes'],
        ['Guardabosques', 'Ataque de caballería con el Héroe', 'Defensa de caballería', 'Coste de Guardabosques'],
        ['Hondero', 'Ataque de tropas a distancia', 'Coste de Honderos', 'Vida de tropas a distancia con el Héroe'],
        ['Miliciana', 'Ataque de caballeros con el Héroe', 'Defensa de caballeros', 'Coste de Milicianas'],
        ['Informador', 'Ataque de exploradores I', 'Velocidad de exploradores I', 'Vida de exploradores'],
        ['Empalador', 'Coste de Empaladores', 'Defensa de lanceros', 'Vida de lanceros con el Héroe'],
        ['Jinete', 'Vida de caballería con el Héroe', 'Coste de Jinetes', 'Ataque de caballería'],
        ['Arquera', 'Coste de Arqueras', 'Ataque de tropas a distancia con el Héroe', 'Defensa de tropas a distancia'],
        ['Templario', 'Coste de Templarios', 'Ataque de caballeros', 'Defensa de caballeros con el Héroe'],
        ['Agente', 'Coste de Agentes', 'Ataque de exploradores con el Héroe', 'Defensa de exploradores I'],
        ['Piquero', 'Ataque de lanceros con el Héroe', 'Coste de Piqueros', 'Defensa de lanceros'],
        ['Coracero', 'Coste de Coraceros', 'Ataque de caballería', 'Defensa de caballería con el Héroe'],
        ['Ballestero', 'Defensa de tropas a distancia con el Héroe', 'Ataque de tropas a distancia', 'Coste de Ballesteros'],
        ['Legionario', 'Vida de caballeros con el Héroe', 'Coste de Legionarios', 'Ataque de caballeros'],
        ['Explorador', 'Coste de Exploradores', 'Velocidad de exploradores II', 'Defensa de exploradores II'],
        ['Alabardero', 'Coste de Alabarderos', 'Defensa de lanceros', 'Vida de lanceros con el Héroe'],
        ['Celada', 'Coste de Celadas', 'Ataque de caballería con el Héroe', 'Defensa de caballería'],
        ['Ranger', 'Defensa de tropas a distancia', 'Coste de Rangers', 'Vida de tropas a distancia con el Héroe'],
        ['Campeón', 'Defensa de caballeros', 'Coste de Campeones', 'Ataque de caballeros con el Héroe'],
        ['Espía', 'Coste de Espías', 'Ataque de exploradores con el Héroe', 'Velocidad de exploradores III'],
        ['Elegido', 'Ataque de lanceros', 'Vida de lanceros con el Héroe', 'Coste de Elegidos'],
        ['Guardiana', 'Defensa de caballería con el Héroe', 'Ataque de caballería', 'Coste de Guardianas'],
        ['Diestro', 'Ataque de tropas a distancia con el Héroe', 'Defensa de tropas a distancia', 'Coste de Maestros'],
        ['Alcurniado', 'Coste de Alcurniados', 'Defensa de caballeros', 'Vida de caballeros con el Héroe'],
        ['Sombra', 'Defensa de exploradores con el Héroe', 'Ataque de exploradores I', 'Coste de Sombras'],
        ['Tritón', 'Ataque de Tritones', 'Defensa de Tritones', 'Vida de Tritones'],
        ['Leviatán', 'Ataque de Leviatanes', 'Defensa de Leviatanes', 'Vida de Leviatanes'],
        ['Bruja del Mar', 'Ataque de Brujas del Mar', 'Defensa de Brujas del Mar', 'Vida de Brujas del Mar'],
        ['Nautilus', 'Ataque de Nautilus', 'Defensa de Nautilus', 'Vida de Nautilus'],
        ['Espejismo', 'Ataque de Espejismos', 'Defensa de Espejismos', 'Vida de Espejismos']
    ];
    var fr = [
        ['Combattant', 'Attaque – lancier', 'Défense – lancier avec le Héros', 'Coût des Combattants'],
        ['Forestier', 'Attaque – cavalerie avec le Héros', 'Défense – cavalerie', 'Coût des Forestiers'],
        ['Frondeur', 'Attaque – distance', 'Coût des Frondeurs', 'Santé – unité à distance avec le Héros'],
        ['Milicienne', 'Attaque – chevalier avec le Héros', 'Défense – chevalier', 'Coût des Miliciennes'],
        ['Informateur', 'Attaque – éclaireur I', "Vitesse d'exploration I", 'Santé – éclaireur'],
        ['Empaleur', 'Coût des Empaleurs', 'Défense – lancier', 'Santé – lancier avec le Héros'],
        ['Cavalier', 'Santé – cavalerie avec le Héros', 'Coût des Cavaliers', 'Attaque – cavalerie'],
        ['Archère', 'Coût des Archères', 'Attaque – unité à distance avec le Héros', 'Défense – distance'],
        ['Templier', 'Coût des Templiers', 'Attaque – chevalier', 'Défense – chevalier avec le Héros'],
        ['Agent', 'Coût des Agents', 'Attaque – éclaireur avec le Héros', 'Défense – éclaireur I'],
        ['Piquier', 'Attaque – lancier avec le Héros', 'Coût des Piquiers', 'Défense – lancier'],
        ['Cuirassier', 'Coût des Cuirassiers', 'Attaque – cavalerie', 'Défense – cavalerie avec le Héros'],
        ['Arbalétrier', 'Défense – unité à distance avec le Héros', 'Attaque – distance', 'Coût des Arbalétriers'],
        ['Légionnaire', 'Santé – chevalier avec le Héros', 'Coût des Légionnaires', 'Attaque – chevalier'],
        ['Éclaireur', 'Coût des Éclaireurs', "Vitesse d'exploration II", 'Défense – éclaireur II'],
        ['Hallebardier', 'Coût des Hallebardiers', 'Défense – lancier', 'Santé – lancier avec le Héros'],
        ["Homme d'armes", "Coût des Hommes d'armes", 'Attaque – cavalerie avec le Héros', 'Défense – cavalerie'],
        ['Rôdeuse', 'Défense – distance', 'Coût des Rôdeuses', 'Santé – unité à distance avec le Héros'],
        ['Champion', 'Défense – chevalier', 'Coût des Champions', 'Attaque – chevalier avec le Héros'],
        ['Espion', 'Coût des Espions', 'Attaque – éclaireur avec le Héros', "Vitesse d'exploration III"],
        ['Favori', 'Attaque – lancier', 'Santé – lancier avec le Héros', 'Coût des Favoris'],
        ['Gardienne', 'Défense – cavalerie avec le Héros', 'Attaque – cavalerie', 'Coût des Gardiennes'],
        ['Tireur', 'Attaque – unité à distance avec le Héros', 'Défense – unité à distance avec le Héros', 'Coût des Tireurs'],
        ['Vassal', 'Coût des Vassaux', 'Défense – chevalier', 'Santé – chevalier avec le Héros'],
        ['Ombre', 'Défense – éclaireur avec le Héros', 'Attaque – éclaireur I', 'Coût des Ombres'],
        ['Triton', 'Attaque – Triton', 'Défense – Triton', 'Santé – Triton'],
        ['Léviathan', 'Attaque – Léviathan', 'Défense – Léviathan', 'Santé – Léviathan'],
        ['Sorcière marine', 'Attaque – Sorcière marine', 'Défense – Sorcière marine', 'Santé – Sorcière marine'],
        ['Nautilus', 'Attaque – Nautilus', 'Défense – Nautilus', 'Santé – Nautilus'],
        ['Mirage', 'Attaque – Mirage', 'Défense – Mirage', 'Santé – Mirage']
    ];
    var de = [
        ['Lanzenträger', 'Schaden der Speerkämpfer', 'Schutz der Speerkämpfer mit Held', 'Trainingskosten Lanzenträger'],
        ['Förster', 'Schaden der Kavallerie mit Held', 'Kavallerieschutz', 'Trainingskosten Förster'],
        ['Schleuderer', 'Schaden der Fernkämpfer', 'Trainingskosten Schleuderer', 'Leben der Fernkämpfer mit Held'],
        ['Soldatin', 'Ritterschaden mit Held', 'Ritterschutz', 'Trainingskosten Soldatin'],
        ['Denunziant', 'Späherschaden I', 'Spähertempo I', 'Leben der Späher'],
        ['Pfähler', 'Trainingskosten Pfähler', 'Schutz der Speerkämpfer', 'Leben der Speerkämpfer mit Held'],
        ['Reiter', 'Leben der Kavallerie mit Held', 'Trainingskosten Reiter', 'Schaden der Kavallerie'],
        ['Bogenschützin', 'Trainingskosten Bogenschützin', 'Schaden der Fernkämpfer mit Held', 'Schutz der Fernkämpfer'],
        ['Templer', 'Trainingskosten Templer', 'Ritterschaden', 'Ritterschutz mit Held'],
        ['Agentin', 'Trainingskosten Agentin', 'Späherschaden mit Held', 'Späherschutz I'],
        ['Pikenier', 'Schaden der Speerkämpfer mit Held', 'Trainingskosten Pikenier', 'Schutz der Speerkämpfer'],
        ['Kürassier', 'Trainingskosten Kürassier', 'Schaden der Kavallerie', 'Kavallerieschutz mit Held'],
        ['Arbalester', 'Schutz der Fernkämpfer mit Held', 'Schaden der Fernkämpfer', 'Trainingskosten Arbalester'],
        ['Legionär', 'Leben der Ritter mit Held', 'Trainingskosten Legionär', 'Ritterschaden'],
        ['Späher', 'Trainingskosten Späher', 'Spähertempo II', 'Späherschutz II'],
        ['Hellebardist', 'Trainingskosten Hellebardist', 'Schutz der Speerkämpfer', 'Leben der Speerkämpfer mit Held'],
        ['Recke', 'Trainingskosten Recke', 'Schaden der Kavallerie mit Held', 'Kavallerieschutz'],
        ['Waldläuferin', 'Schutz der Fernkämpfer', 'Trainingskosten Waldläuferin', 'Leben der Fernkämpfer mit Held'],
        ['Streiter', 'Ritterschutz', 'Trainingskosten Streiter', 'Ritterschaden mit Held'],
        ['Spion', 'Trainingskosten Spion', 'Späherschaden mit Held', 'Spähertempo III'],
        ['Sturmsoldat', 'Schaden der Speerkämpfer', 'Leben der Speerkämpfer mit Held', 'Trainingskosten Sturmsoldat'],
        ['Wächterin', 'Kavallerieschutz mit Held', 'Schaden der Kavallerie', 'Trainingskosten Wächterin'],
        ['Armbrustschütze', 'Schaden der Fernkämpfer mit Held', 'Schutz der Fernkämpfer mit Held', 'Trainingskosten Armbrustschütze'],
        ['Feudalherr', 'Trainingskosten Feudalherr', 'Ritterschutz', 'Leben der Ritter mit Held'],
        ['Schattenkriegerin', 'Späherschutz mit Held', 'Späherschaden I', 'Trainingskosten Schattenkriegerin'],
        ['Triton', 'Tritonenschaden', 'Tritonenschutz', 'Tritonenleben'],
        ['Leviathan', 'Leviathanenschaden', 'Leviathanenschutz', 'Leviathanenleben'],
        ['Seehexe', 'Seehexenschaden', 'Seehexenschutz', 'Seehexenleben'],
        ['Nautilus', 'Nautilusschaden', 'Nautilusschutz', 'Nautilusleben'],
        ['Phantom', 'Phantomschaden', 'Phantomschutz', 'Phantomleben']
    ];
    var it = [
        ['Combattente', 'Attacco lancieri', "Difesa lancieri con l'Eroe", 'Costo addestramento Combattenti'],
        ['Forestale', "Attacco cavalleria con l'Eroe", 'Difesa сavalleria', 'Costo addestramento Forestali'],
        ['Fromboliere', 'Attacco a distanza', 'Costo addestramento Frombolieri', "Salute a distanza con l'Eroe"],
        ['Miliziana', "Attacco cavalieri con l'Eroe", 'Difesa cavalieri', 'Costo addestramento Miliziane'],
        ['Informatore', 'Attacco esploratori I', 'Velocità esplorazione I', 'Salute esploratori'],
        ['Impalatore', 'Costo addestramento Impalatori', 'Difesa lancieri', "Salute lancieri con l'Eroe"],
        ['Cavalleggero', "Salute cavalleria con l'Eroe", 'Costo addestramento Cavalleggeri', 'Attacco cavalleria'],
        ['Arciera', 'Costo addestramento Arciere', "Attacco a distanza con l'Eroe", 'Difesa a distanza'],
        ['Templare', 'Costo addestramento Templari', 'Attacco cavalieri', "Difesa cavalieri con l'Eroe"],
        ['Agente', 'Costo addestramento Agenti', "Attacco esploratori con l'Eroe", 'Difesa esploratori I'],
        ['Picchiere', "Attacco lancieri con l'Eroe", 'Costo addestramento Picchieri', 'Difesa lancieri'],
        ['Corazziere', 'Costo addestramento Corazzieri', 'Attacco cavalleria', "Difesa cavalleria con l'Eroe"],
        ['Balestriere', "Difesa a distanza con l'Eroe", 'Attacco a distanza', 'Costo addestramento Balestrieri'],
        ['Legionario', "Salute cavalieri con l'Eroe", 'Costo addestramento Legionari', 'Attacco cavalieri'],
        ['Esploratore', 'Costo addestramento Esploratori', 'Velocità esplorazione II', 'Difesa esploratori II'],
        ['Alabardiere', 'Costo addestramento Alabardieri', 'Difesa lancieri', "Salute lancieri con l'Eroe"],
        ['Cavaliere Armato', 'Costo Cavalieri armati', "Attacco cavalleria con l'Eroe", 'Difesa сavalleria'],
        ['Guardiaboschi', 'Difesa a distanza', 'Costo addestramento Guardiaboschi', "Salute a distanza con l'Eroe"],
        ['Campione', 'Difesa cavalieri', 'Costo addestramento Campioni', "Attacco cavalieri con l'Eroe"],
        ['Spia', 'Costo addestramento Spie', "Attacco esploratori con l'Eroe", 'Velocità esplorazione III'],
        ['Capofila', 'Attacco lancieri', "Salute lancieri con l'Eroe", 'Costo addestramento Capifila'],
        ['Protettrice', "Difesa cavalleria con l'Eroe", 'Attacco cavalleria', 'Costo addestramento Protettrici'],
        ['Tiratore', "Attacco a distanza con l'Eroe", "Difesa a distanza con l'Eroe", 'Costo addestramentro Tiratori'],
        ['Vassallo', 'Costo addestramento Vassalli', 'Difesa cavalieri', "Salute cavalieri con l'Eroe"],
        ['Ombra', "Difesa esploratori con l'Eroe", 'Attacco esploratori I', 'Costo addestramento Ombre'],
        ['Tritone', 'Attacco Tritoni', 'Difesa Tritoni', 'Salute Tritoni'],
        ['Leviatano', 'Attacco Leviatani', 'Difesa Leviatani', 'Salute Leviatani'],
        ['Strega dei mari', 'Attacco Streghe dei mari', 'Difesa Streghe dei mari', 'Salute Streghe dei mari'],
        ['Nautilus', 'Attacco Nautilus', 'Difesa Nautilus', 'Salute Nautilus'],
        ['Miraggio', 'Attacco Miraggi', 'Difesa Miraggi', 'Salute Miraggi']
    ];

    return {ru: ru, en: en, sp: sp, de: de, it: it, fr: fr};
}

function getLongLoadingText() {
    return {
        de: "Mein Lord, bleibe in diesem Tab, um das Spiel schneller zu laden.",
        en: "My Lord, stay on this tab to load the game faster.",
        fr: "Mon Seigneur, restez sur cet onglet pour charger la partie plus vite.",
        it: "Mio Signore, rimani in questa scheda e il gioco caricherà più in fretta.",
        ru: "Милорд, оставайтесь на этой вкладке для более быстрой загрузки игры.",
        sp: "Mi Lord, quédate en esta pestaña para que el juego se inicie más rápido.",
    }
}