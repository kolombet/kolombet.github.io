var phrases = {
    getLongLoadingText: function(locale)
    {
        var locale = integrationHelper.getSystemLanguage();
        return phrases[locale]["id13704"];
    },
    getRandomHint: function()
    {
        var locale = integrationHelper.getSystemLanguage();
        var indeces = ["id13691","id13692", "id13693", "id13694", "id13695", "id13696", "id13697", "id13698", "id13699", "id13700", "id13701", "id13702"];
        return phrases[locale][indeces[Math.floor(Math.random() * indeces.length)]];
    },
    de:
    {

        "id13691" : "Verbessere die Schatzkammer, um für den Fall eines feindlichen Angriffs Ressourcen zu verbergen.",
		"id13692" : "Führe Studien durch, um Zugriff auf neue Technologien und mehr Machtpunkte zu erhalten!",
		"id13693" : "Greife die Eindringlinge an und erledige VIP-Botengänge, um Juwelen zu erhalten, mit denen du die Boni deiner Helden-Ausrüstung verbessern kannst!",
		"id13694" : "Fertige Waffen, Rüstungen und andere Ausrüstung für den Helden, sobald du eine Werkstatt in deiner Stadt gebaut hast – das stärkt ihn ungemein!",
		"id13695" : "Gewinne Ressourcen an Standorten auf der Königreich-Karte. Du erhältst dann alles, was du zur Entwicklung deiner Stadt benötigst!",
		"id13696" : "Nutze die Vorteile des Kollektivs, indem du einen neuen Orden gründest oder einer bestehenden Vereinigung beitrittst.",
		"id13697" : "Die Ritter polieren ihre Rüstungen, um im bevorstehenden Turnier zu glänzen …",
		"id13698" : "Die Arbalester sind müde vom andauernden Training und gehen zum Studieren in die Akademie …",
		"id13699" : "Die Juweliere haben falsche Edelsteine gekauft und reichen nun Beschwerde gegen die Händler ein …",
		"id13700" : "Teile der Turnierspeere werden vom Turnierplatz gefegt …",
		"id13701" : "Wissenschaftler versuchen, den Staub der Jahrhunderte von den Manuskripten zu wischen …",
		"id13702" : "Die Wachen verjagen diejenigen, die den Titel des Ritters einheimsen wollen …",
		"id13704" : "Mein Lord, bleibe in diesem Tab, um das Spiel schneller zu laden."
    },
    en:
    {
        "id13691" : "Upgrade the Treasury to hide some resources in case of an enemy attack.",
		"id13692" : "Conduct Studies to access new technologies and earn more Power points!",
		"id13693" : "Attack the Assailants and complete VIP Errands to get jewels that can be used to improve your Hero’s equipment bonus characteristics!",
		"id13694" : "After you build the Workshop in your Town, you can craft weapons, armor and other equipment for the Hero. This will make them much stronger!",
		"id13695" : "Yield resources in locations on the Kingdom map. Your people won’t want for anything, and you’ll get everything you need to develop the Town!",
		"id13696" : "Upgrade the Treasury to hide some resources in case of an enemy attack.",
		"id13697" : "Knights are polishing their armor to shine at the upcoming Tournament...",
		"id13698" : "Arbalesters, tired of constant training, are off to study science in the Academy...",
		"id13699" : "Jewellers bought fake gems and are filing complaints against the merchants...",
		"id13700" : "Spear fragments are being swept off the tiltyard...",
		"id13701" : "Scientists are trying to clean centuries of dust from the manuscripts...",
		"id13702" : "Guards chase away a line of people aspiring to receive the title of knight...",
		"id13704" : "My Lord, stay on this tab to load the game faster."
    },
    fr:
    {
		"id13691" : "Améliore la Trésorerie pour cacher certaines ressources en cas d'attaque ennemie.",
		"id13692" : "Mène des Études pour avoir accès à de nouvelles technologies et gagner plus de points de Pouvoir !",
		"id13693" : "Attaque des Assaillants et réalise des Missions VIP pour obtenir des joyaux à utiliser pour améliorer les bonus d'équipement de ton Héros !",
		"id13694" : "Fabrique des armes, des armures et d'autres équipements pour le Héros grâce à l'Atelier de ta Ville : ils seront bien plus efficaces !",
		"id13695" : "Récolte des ressources dans des lieux sur la carte du Royaume. Ton peuple n'aura besoin de rien, tu auras tout pour développer ta Ville !",
		"id13696" : "Utilise tous les avantages de jouer avec des alliés en créant un nouvel Ordre ou en rejoignant une alliance déjà existante.",
		"id13697" : "Les chevaliers polissent leurs armures pour qu'elles brillent lors du Tournoi à venir...",
		"id13698" : "Les arbalétriers, fatigués par un entraînement constant, vont étudier la science à l'Académie...",
		"id13699" : "Les joaillers ont acheté de fausses gemmes et déposent des plaintes contre les marchands...",
		"id13700" : "Des morceaux de lances de tournoi sont balayés hors de la carrière...",
		"id13701" : "Les scientifiques essayent de balayer la poussière des siècles dont sont couverts les manuscrits...",
		"id13702" : "Les gardes dispersent la file de ceux qui souhaitent obtenir le titre de chevalier …",
		"id13704" : "Mon Seigneur, restez sur cet onglet pour charger la partie plus vite."
    },
    it:
    {
        "id13691" : "Potenzia la Camera del Tesoro per mettere al sicuro delle risorse in caso di attacco nemico.",
		"id13692" : "Conduci Studi per accedere a nuove tecnologie e guadagnare più punti Potere!",
		"id13693" : "Attacca gli Aggressori e completa Commissioni VIP per ricevere gioielli con cui migliorare le caratteristiche bonus degli equipaggiamenti dell'Eroe!",
		"id13694" : "Nell'Opificio della tua Città puoi produrre armi, armature e altro equipaggiamento, che renderanno molto più forte il tuo Eroe!",
		"id13695" : "Raccogli risorse nelle postazioni indicate sulla mappa del Regno. La tua gente sarà soddisfatta e tu potrai sviluppare la tua Città!",
		"id13696" : "Sfrutta il vantaggio di avere degli alleati creando un nuovo Ordine o unendoti a un'alleanza esistente.",
		"id13697" : "I cavalieri stanno lucidando le armature per brillare nel prossimo Torneo...",
		"id13698" : "I balestrieri, stanchi del continuo addestramento, decidono di studiare scienze all'Accademia...",
		"id13699" : "I gioiellieri hanno ricevuto gemme false e stanno protestando contro i mercanti...",
		"id13700" : "Gli scudieri stanno rimuovendo le lance spezzate dal campo della giostra...",
		"id13701" : "Gli scienziati stanno tentando di togliere la polvere dei secoli dagli antichi manoscritti...",
		"id13702" : "Le guardie scacciano lunghe file di scudieri desiderosi di diventare cavalieri...",
		"id13704" : "Mio Signore, rimani in questa scheda e il gioco caricherà più in fretta."
    },
    jp:
    {
        "id13704": "",
        "id13691": "",
        "id13692": "",
        "id13693": "",
        "id13694": "",
        "id13695": "",
        "id13696": ""
    },
    kr:
    {
        "id13704": "",
        "id13691": "",
        "id13692": "",
        "id13693": "",
        "id13694": "",
        "id13695": "",
        "id13696": "",
        "id13697": "",
        "id13698": "",
        "id13699": "",
        "id13700": "",
        "id13701": "",
        "id13702": "",
        "id13703": ""
    },
    ru:
    {
        "id13691" : "Улучшайте Сокровищницу, чтобы в случае нападения на город спрятать от врага часть ресурсов.",
		"id13692" : "Проводите Исследования, чтобы получить доступ к новым технологиям и заработать больше очков Власти!",
		"id13693" : "Атакуйте Агрессоров и выполняйте VIP Поручения, чтобы получить самоцветы, с помощью которых можно усилить бонусы экипировки вашего Героя!",
		"id13694" : "Создавайте оружие, доспехи и прочую экипировку для Героя, построив в городе Мастерскую, — это сделает его намного сильнее!",
		"id13695" : "Добывайте ресурсы в локациях на карте Королевства. Народ будет жить в достатке, а вы получите все необходимое для развития города!",
		"id13696" : "Используйте все преимущества игры вместе с единомышленниками, создав новый Орден или вступив в один из уже существующих союзов.",
		"id13697" : "Рыцари начищают доспехи, чтобы блеснуть на предстоящем Турнире...",
		"id13698" : "Арбалетчики, устав от постоянных тренировок, идут изучать точные науки в Академию...",
		"id13699" : "Ювелиры приобрели фальшивые самоцветы и пишут жалобы на торговцев...",
		"id13700" : "С турнирного поля выметают обломки копий...",
		"id13701" : "Ученые пытаются стереть пыль веков с рукописей...",
		"id13702" : "Стражники разгоняют очередь из желающих получить рыцарский титул...",
		"id13704" : "Милорд, оставайтесь на этой вкладке для более быстрой загрузки игры."
    },
    sp:
    {
		"id13691" : "Mejora la Tesorería para ocultar al enemigo parte de los recursos en caso de ataque a la Ciudad.",
	    "id13692" : "¡Completa Estudios para obtener acceso a nuevas tecnologías y ganar más puntos de Poder!",
	    "id13693" : "¡Ataca a los Asaltantes y completa Misiones VIP para conseguir joyas que ayudan a aumentar los bonus de los equipos de tu Héroe!",
	    "id13694" : "¡Construye el Taller para fabricar armas, armaduras y otros equipos para el Héroe: esto lo hará mucho más fuerte!",
	    "id13695" : "Obtén recursos en los lugares del Mapa del Reino. ¡Tu gente vivirá en la abundancia y tú tendrás todo lo necesario para el desarrollo de la Ciudad!",
	    "id13696" : "Aprovecha todas las ventajas del juego con tus aliados formando una Orden nueva o uniéndote a una existente.",
	    "id13697" : "Los caballeros dan lustre a sus armaduras para lucirlas en el próximo Torneo...",
	    "id13698" : "Los ballesteros, cansados del constante entrenamiento, acuden a la Academia para aprender ciencias exactas...",
	    "id13699" : "Los joyeros han comprado joyas falsas y ahora se quejan a los comerciantes...",
	    "id13700" : "Los despojos de las lanzas del torneo han de limpiarse de la palestra...",
	    "id13701" : "Los científicos tratan de quitar el polvo secular de los manuscritos...",
	    "id13702" : "Los guardias dispersan la muchedumbre de los que quieren obtener el título de caballero...",
	    "id13704" : "Mi Lord, quédate en esta pestaña para que el juego se inicie más rápido."
    },
    tr:
    {
        "id13704": "",
        "id13691": "",
        "id13692": "",
        "id13693": "",
        "id13694": "",
        "id13695": "",
        "id13696": "",
        "id13697": "",
        "id13698": "",
        "id13699": "",
        "id13700": "",
        "id13701": "",
        "id13702": ""
    },
};