const eweData = [
    {
        "name": "Ewé Akòko",
        "botanicalName": "Newbouldia laevis",
        "englishName": "Fertility Tree / Tree of Life",
        "spanishName": "Árbol de frontera",
        "portugueseName": "Árvore de fronteira",
        "description": "A highly significant tree in Yoruba culture, often used in chieftaincy coronation ceremonies.",
        "uses": [
            "Used for coronation of chiefs (symbol of authority).",
            "Used for fertility rites and women's health.",
            "Medicinally used for pain relief and treating infections."
        ]
    },
    {
        "name": "Ewé Ọ̀dúndún",
        "botanicalName": "Kalanchoe crenata",
        "englishName": "Leaf of Calm / Resurrection Plant",
        "spanishName": "Siempreviva / hoja gorda",
        "portugueseName": "Folha-da-fortuna",
        "description": "A succulent herb known for its cooling and calming properties.",
        "uses": [
            "Used to calm the head (Ori) and cool hot tempers.",
            "Used in treating hypertension and headaches.",
            "Applied to burns and sores for healing."
        ]
    },
    {
        "name": "Ewé Tẹ̀tẹ̀",
        "botanicalName": "Amaranthus viridis",
        "englishName": "Green Amaranth",
        "spanishName": "",
        "portugueseName": "",
        "description": "Considered the 'first of all herbs' in some traditions, known for its resilience.",
        "uses": [
            "Used in spiritual baths for longevity and resilience.",
            "Edible vegetable rich in nutrients.",
            "Used to treat dizziness and fatigue."
        ]
    },
    {
        "name": "Ewé Pèrègún",
        "botanicalName": "Dracaena fragrans",
        "englishName": "Dragon Tree",
        "spanishName": "Palo de Brasil",
        "portugueseName": "Pau-d’água",
        "description": "A sacred plant often found in shrines and groves, symbolizing durability and protection.",
        "uses": [
            "Used for marking sacred boundaries.",
            "Used in rituals to remove negative energy and curses.",
            "Medicinally used for treating skin infections."
        ]
    },
    {
        "name": "Ewé Èwúró",
        "botanicalName": "Vernonia amygdalina",
        "englishName": "Bitter Leaf",
        "spanishName": "",
        "portugueseName": "",
        "description": "A common shrub with a distinct bitter taste, widely used in cooking and medicine.",
        "uses": [
            "Used for spiritual cleansing (washing away bad luck).",
            "Medicinally used to treat stomach aches and diabetes.",
            "Used as a detoxifier."
        ]
    },
    {
        "name": "Ewé Kókò",
        "botanicalName": "Colocasia esculenta",
        "englishName": "Taro",
        "spanishName": "Taro / malanga",
        "portugueseName": "Taro / inhame-coco",
        "description": "Commonly known as Taro.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Óògò / Óòjó",
        "botanicalName": "Corchorus olitorius",
        "englishName": "Jute mallow",
        "spanishName": "Molokhia / malva",
        "portugueseName": "Molokhia / malva",
        "description": "Commonly known as Jute mallow.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Tètèrègún",
        "botanicalName": "Costus afer",
        "englishName": "Spiral ginger",
        "spanishName": "Caña agria",
        "portugueseName": "Cana amarga",
        "description": "Commonly known as Spiral ginger.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Ìṣin",
        "botanicalName": "Blighia sapida",
        "englishName": "Ackee",
        "spanishName": "Aki",
        "portugueseName": "Aki",
        "description": "Commonly known as Ackee.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Èlà",
        "botanicalName": "Calyptronhilum christyanum",
        "englishName": "Orchid species",
        "spanishName": "Orquídea",
        "portugueseName": "Orquídea",
        "description": "Commonly known as Orchid species.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Ètipónlá",
        "botanicalName": "Boerhavia diffusa",
        "englishName": "Red spiderling",
        "spanishName": "Pega-pega / hierba punzó",
        "portugueseName": "Erva-tostão",
        "description": "Commonly known as Red spiderling.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Èérán",
        "botanicalName": "Chloris pilosa",
        "englishName": "Hairy chloris grass",
        "spanishName": "Pasto chloris piloso",
        "portugueseName": "Capim chloris piloso",
        "description": "Commonly known as Hairy chloris grass.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Gbégbé",
        "botanicalName": "Icacina trichantha",
        "englishName": "Icacina",
        "spanishName": "Icacina",
        "portugueseName": "Icacina",
        "description": "Commonly known as Icacina.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Ògẹ́gẹ́",
        "botanicalName": "Jatropha multifida",
        "englishName": "Coral bush",
        "spanishName": "Flor de coral",
        "portugueseName": "Pinhão-manso coral",
        "description": "Commonly known as Coral bush.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Làpálàpá pupa",
        "botanicalName": "Jatropha gossypiifolia",
        "englishName": "Bellyache bush",
        "spanishName": "Piñón botija",
        "portugueseName": "Pinhão roxo",
        "description": "Commonly known as Bellyache bush.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Ìmò ọ̀pẹ̀",
        "botanicalName": "Elaeis guineensis",
        "englishName": "Palm oil tree",
        "spanishName": "Palma aceitera",
        "portugueseName": "Dendezeiro",
        "description": "Commonly known as Palm oil tree.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Ọ̀dán",
        "botanicalName": "Ficus thonningii",
        "englishName": "Strangler fig",
        "spanishName": "Higuera africana",
        "portugueseName": "Figueira africana",
        "description": "Commonly known as Strangler fig.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Gbégì",
        "botanicalName": "Eleusine indica",
        "englishName": "Goosegrass",
        "spanishName": "Pata de gallina",
        "portugueseName": "Capim-pé-de-galinha",
        "description": "Commonly known as Goosegrass.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Òwú",
        "botanicalName": "Gossypium barbadense",
        "englishName": "Cotton",
        "spanishName": "Algodón",
        "portugueseName": "Algodão",
        "description": "Commonly known as Cotton.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Ọmọni gèdègédé",
        "botanicalName": "Cuscuta australis",
        "englishName": "Dodder",
        "spanishName": "Cuscuta",
        "portugueseName": "Cuscuta",
        "description": "Commonly known as Dodder.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Èrùmògálè",
        "botanicalName": "Croton lobatus",
        "englishName": "Croton",
        "spanishName": "Croton",
        "portugueseName": "Croton",
        "description": "Commonly known as Croton.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Awède",
        "botanicalName": "Dissotis rotundifolia",
        "englishName": "Pink lady",
        "spanishName": "Hierba rosada",
        "portugueseName": "Erva-rosa",
        "description": "Commonly known as Pink lady.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Gbúre",
        "botanicalName": "Talinum triangulare",
        "englishName": "Waterleaf",
        "spanishName": "Verdolaga africana",
        "portugueseName": "Língua-de-vaca",
        "description": "Commonly known as Waterleaf.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Òjìjì",
        "botanicalName": "Dalbergia lactea",
        "englishName": "Dalbergia",
        "spanishName": "Dalbergia",
        "portugueseName": "Dalbergia",
        "description": "Commonly known as Dalbergia.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Àlúpàyídà",
        "botanicalName": "Uraria picta",
        "englishName": "Uraria",
        "spanishName": "Uraria",
        "portugueseName": "Uraria",
        "description": "Commonly known as Uraria.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Ìranjé",
        "botanicalName": "Securinega virosa",
        "englishName": "Bush willow",
        "spanishName": "Sauce africano",
        "portugueseName": "Salgueiro africano",
        "description": "Commonly known as Bush willow.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Ọ̀wànráǹsàńsán",
        "botanicalName": "Sida acuta",
        "englishName": "Wireweed",
        "spanishName": "Escobilla",
        "portugueseName": "Guaxuma",
        "description": "Commonly known as Wireweed.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Ọ̀rúrú",
        "botanicalName": "Spathodea campanulata",
        "englishName": "African tulip tree",
        "spanishName": "Tulipán africano",
        "portugueseName": "Espatódea",
        "description": "Commonly known as African tulip tree.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Èyìn olobe",
        "botanicalName": "Phyllanthus amarus",
        "englishName": "Stonebreaker",
        "spanishName": "Chanca piedra",
        "portugueseName": "Quebra-pedra",
        "description": "Commonly known as Stonebreaker.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Mẹsẹn-mesẹn gogoro",
        "botanicalName": "Scoparia dulcis",
        "englishName": "Sweet broomweed",
        "spanishName": "Escoba dulce",
        "portugueseName": "Vassourinha doce",
        "description": "Commonly known as Sweet broomweed.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Ewé Òórà",
        "botanicalName": "Rauvolfia vomitoria",
        "englishName": "Rauvolfia",
        "spanishName": "Rauvolfia",
        "portugueseName": "Rauvolfia",
        "description": "Commonly known as Rauvolfia.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Èsinsin",
        "botanicalName": "Mucuna pruriens",
        "englishName": "Velvet bean",
        "spanishName": "Frijol terciopelo",
        "portugueseName": "Mucuna",
        "description": "Commonly known as Velvet bean.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Èsún",
        "botanicalName": "Pennisetum purpureum",
        "englishName": "Elephant grass",
        "spanishName": "Paja elefante",
        "portugueseName": "Capim-elefante",
        "description": "Commonly known as Elephant grass.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Rinrin",
        "botanicalName": "Peperomia pellucida",
        "englishName": "Shiny bush",
        "spanishName": "Peperomia",
        "portugueseName": "Peperomia",
        "description": "Commonly known as Shiny bush.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Àyẹyẹ",
        "botanicalName": "Spondias mombin",
        "englishName": "Hog plum",
        "spanishName": "Ciruela amarilla",
        "portugueseName": "Cajá",
        "description": "Commonly known as Hog plum.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    },
    {
        "name": "Ewé Wọ̀rọ̀wọ̀",
        "botanicalName": "Senecio biafrae",
        "englishName": "African daisy",
        "spanishName": "Margarita africana",
        "portugueseName": "Margarida africana",
        "description": "Commonly known as African daisy.",
        "uses": [
            "Traditional medicinal and spiritual uses."
        ]
    }
];
