// Gouda (Ogunda) Family - FA sections
const GOUDA_MEDJI = {
    name: "Gouda-Mêdjì",
    theme: "The Sign of Sacrifice, Spiritual Transmission, and Collective Responsibility. It symbolizes the sacré incarné, spiritual duty, and elevation by responsibility. The native carries a mandate, function, or collective destiny (e.g., chief of a lineage, priest, healer, or protector). It promises grandeur but not ease. It also involves profound inner solitude and signifies the power of the sacred fire used by the smith/forgeron.",
    professions: "Chemists, miners, founders, locksmiths, detectives, secret agents, spies, intermediaries, procurers.",
    gender: "Masculin (Mâle)",
    elements: ["Earth (Terre) - Maléfique", "Iron"],
    animals: {
        associated: [],
        prohibited: ["Tourterelle (turtledove)", "Viande du coq (rooster meat)", "Chickens offered to Gouda must be decapitated"]
    },
    vodun: ["Gou", "Dan", "Tohossou"],
    prohibitions: ["Must not wear red clothes", "Must not be a forgeron (blacksmith)", "Must not marry a fair-skinned woman", "Must not eat red oil (huile rouge)", "Must not consume manioc or igname pilé (Agou)", "Must not creuser un trou ou une fosse (dig a hole or pit)", "Must not dance outside their homes", "Must not place objects of Gu (knife/gun) near the bed"],
    colors: []
};

const GOUDA_YEKOU = {
    name: "Gouda Yekou",
    theme: "The native is initially criticized for decisions but ultimately gains support and appreciation.",
    order: "136th sign overall.",
    prohibitions: ["Must not wear red clothes", "Must not eat haricot (beans)"],
    vodun: ["Gou", "Dan"]
};

const GOUDA_WOLI = {
    name: "Gouda Woli",
    theme: "Announces intense rivalry before marriage and jealousy from family members over wealth.",
    order: "137th sign overall.",
    prohibitions: ["Must live away from brothers to keep wealth", "Must not marry a fair-skinned woman"],
    vodun: ["Dan", "Gou"]
};

const GOUDA_MON_DI = {
    name: "Gouda Mon-Di",
    theme: "Promises that the native will always find a way to satisfy vital needs, even without support (like the Zégué insect).",
    order: "138th sign overall.",
    prohibitions: ["Must not eat palm nuts", "Must not eat rooster whose head was cut and thrown before preparation"],
    vodun: ["Tohossou", "Gou"]
};

const GOUDA_GBO_LOSSO = {
    name: "Gouda Gbo Losso",
    theme: "Sign of malheur (misfortune). Gouda harmed Losso, who returned the blow double.",
    order: "139th sign overall.",
    prohibitions: ["Requires sacrifices"],
    vodun: ["Heviosso", "Dan"]
};

const GOUDA_WINLIN = {
    name: "Gouda Winlin",
    theme: "Warns that the native who prospers through sacrifices must share with their mother; failure to do so leads to poverty.",
    order: "140th sign overall.",
    prohibitions: ["Must always take care of one's mother to prosper"],
    vodun: []
};

const GOUDA_BLA = {
    name: "Gouda Bla",
    theme: "The native works hard but unforeseen events arise just as they are about to enjoy the results, making them absent from the benefit.",
    order: "141st sign overall.",
    prohibitions: [],
    vodun: []
};

const GOUDA_AKLAN = {
    name: "Gouda Aklan",
    theme: "The native must avoid participating in war; the strong (élancé) is spared damage when war arrives.",
    order: "142nd sign overall.",
    prohibitions: ["Must not eat corn and bean mixture", "Must not eat rooster whose head was thrown before preparation"],
    vodun: ["Jumeaux (Twins)", "Gou"]
};

const GOUDA_SA = {
    name: "Gouda-Sa",
    theme: "Sign of victory and perseverance. Promises that hope is always permitted and advises against suicide. The native will eventually triumph.",
    order: "143rd sign overall.",
    prohibitions: [],
    vodun: ["Gou", "Dan", "Tohossou"]
};

const GOUDA_FO_TRUKPIN = {
    name: "Gouda Fo Trukpin",
    theme: "Associated with the risk of stomach aches caused by consumption of specific foods.",
    order: "144th sign overall.",
    prohibitions: ["Must not eat papaya"],
    vodun: []
};

const GOUDA_TULA = {
    name: "Gouda Tula",
    theme: "Sign deals with self-confidence and strength against rivals. 'They are strong, I am too. But if ever I die, all will die with me.'",
    order: "145th sign overall.",
    prohibitions: [],
    vodun: []
};

const GOUDA_GBO_LETE = {
    name: "Gouda Gbo Lete",
    theme: "Sign deals with self-confidence and strength against rivals. 'They are strong, I am too. But if ever I die, all will die with me.'",
    order: "146th sign overall.",
    prohibitions: [],
    vodun: ["Sakpata", "Dan"]
};

const GOUDA_KA = {
    name: "Gouda Ka",
    theme: "The sign of revelation and justice; people will lie about the native, but truth will always triumph.",
    order: "147th sign overall.",
    prohibitions: [],
    vodun: ["Jumeaux (Twins)", "Gou"]
};

const GOUDA_TCHE = {
    name: "Gouda Tche",
    theme: "Sign of happiness and wealth. Promises that Vodoun Tohossou never leaves without wealth.",
    order: "148th sign overall.",
    prohibitions: [],
    vodun: ["Tohossou"]
};

const GOUDA_FOU = {
    name: "Gouda Fou",
    theme: "Sign of prosperity. The native is destined to be a chief/leader and gains much with less effort.",
    order: "149th sign overall.",
    prohibitions: [],
    vodun: ["Dan", "Gou"]
};

// Sa (Osa) Family - FA sections
const SA_MEDJI = {
    name: "Sa-Mêdjì",
    theme: "The Sign of Time, Written Destiny, and Inevitable Cycles. It is the sign of sacred time (temps sacré), immutable destiny (destin immuable), and the cosmic order (ordre cosmique). It indicates that major events are in motion, and their manifestation depends on respecting the sacred rhythm; one must neither force nor resist. It is associated with heavy karmas (karmas lourds), soul contracts, and spiritual responsibilities.",
    lessons: "It teaches patience, advising that what arrives too early is lost, and what arrives on time flourishes. 'Patiente encore, le fruit n'est pas mûr' (Patience still, the fruit is not ripe).",
    gender: "Féminin (Feminine) - Sign of the day",
    elements: ["Air - Bénéfique (Beneficial)", "Avoids the ocean"],
    animals: {
        associated: [],
        prohibited: ["All birds used in sorcery", "Monkeys", "Dog", "Cat", "Guinea fowl (pintade) if SA-GOUDA appears"]
    },
    vodun: ["Orunmila", "Mawu", "Divinities of the sky", "Vodoun related to sorcery/magic"],
    prohibitions: ["Must not look at the sexual organs of their spouse", "Women must avoid making love during the day", "Must not act as surety for a debt", "Must not engage in sorcery", "Must not eat chicken, birds used in sorcery, sorgho, elephant, dog, leopard, or cat", "Must avoid palm wine, burning cotton, and using Iroko seed/leaves"],
    colors: []
};

const SA_WO_GBE = {
    name: "Sa Wo-Gbe",
    theme: "Success will turn sour at a certain point; 'Subitement le soir rien ne va' (Suddenly in the evening, nothing works). His wife will often disobey him.",
    order: "150th sign overall.",
    prohibitions: [],
    vodun: ["Dan", "Heviosso"]
};

const SA_YEKOU = {
    name: "Sa Yekou",
    theme: "Sa and Yèkou fought, and Sa won the victory. Destined to be chief of his collectivity if he makes sacrifices.",
    order: "151st sign overall.",
    prohibitions: [],
    vodun: []
};

const SA_WOLI = {
    name: "Sa Woli",
    theme: "Refers to someone of exceptional ability. The male sheep avows that he does not know how to run, but has strategies.",
    order: "152nd sign overall.",
    prohibitions: ["Must make sacrifices to always be victorious"],
    vodun: []
};

const SA_DI = {
    name: "Sa-Di",
    theme: "A sign of malheur (misfortune) and death. 'The death has separated its legs'.",
    order: "153rd sign overall.",
    prohibitions: ["Must make many sacrifices to last long on earth"],
    vodun: []
};

const SA_LOSSO = {
    name: "Sa Losso",
    theme: "Will be immensely rich even with little effort. Happiness will find the native even if they sit doing nothing.",
    order: "154th sign overall.",
    prohibitions: ["Must be humble, integrated, and gentle"],
    vodun: ["Dan", "Heviosso"]
};

const SA_WINLIN = {
    name: "Sa Winlin",
    theme: "Must avoid disputes, quarrels, and interfering in others' affairs. Must always be on guard as people are ready to attack.",
    order: "155th sign overall.",
    prohibitions: [],
    vodun: ["Tohossou", "Dan"]
};

const SA_AKLAN = {
    name: "Sa-Aklan",
    theme: "Sign has recourse to death and exhorts the young to fight death.",
    order: "156th sign overall.",
    prohibitions: ["Must make many sacrifices to avoid premature death"],
    vodun: ["Jumeaux (Twins)", "Dan"]
};

const SA_GOUDA = {
    name: "Sa-Gouda",
    theme: "Must protect against evil spirits or be tempted on all planes by men.",
    order: "157th sign overall.",
    prohibitions: ["Must not eat guinea fowl (pintade)"],
    vodun: ["Dan", "Gou"]
};

const SA_TRUKPIN = {
    name: "Sa-Trukpin",
    theme: "Predicts long life and triumph over adversaries. Victory returned to the pebble over the salt. Must avoid doing harm to others.",
    order: "158th sign overall.",
    prohibitions: ["Must not eat boule d'akassa", "Must not eat viper meat"],
    vodun: ["Tohossou", "Dan"]
};

const SA_TOULA = {
    name: "Sa-Toula",
    theme: "Karma warning: 'one who kills by the sword perishes by the sword'.",
    order: "159th sign overall.",
    prohibitions: ["Must not eat boule d'akassa", "Must not eat viper meat"],
    vodun: ["Tohossou", "Dan"]
};

const SA_LETE = {
    name: "Sa Lete",
    theme: "Sign of happiness and joy. Will always triumph and earn a living by manual labor.",
    order: "160th sign overall.",
    prohibitions: [],
    vodun: []
};

const SA_KA = {
    name: "Sa-Ka",
    theme: "Friends will hate the native due to jealousy over prosperity.",
    order: "161st sign overall.",
    prohibitions: [],
    vodun: ["Dan", "Jumeaux (Twins)"]
};

const SA_TCHE = {
    name: "Sa-Tche",
    theme: "Must not be avaricious or will lose all possessions. The one who made sacrifice (HOULEGBAN) found easy success.",
    order: "162nd sign overall.",
    prohibitions: ["Must not be avaricious"],
    vodun: ["Legba", "Minonnan"]
};

const SA_FU = {
    name: "Sa-Fu",
    theme: "Signifies one who runs to be first, but the other catches up.",
    order: "163rd sign overall.",
    prohibitions: ["Must make sacrifices to avoid premature death"],
    vodun: ["Legba", "Sakpata", "Dan", "Klouvito"]
};

// Export for global usage
window.ODU_OGUNDA_OSA_FA = {
    "Ogunda-Ogunda": GOUDA_MEDJI,
    "Ogunda-Ogbe": GOUDA_BLA,
    "Ogunda-Oyeku": GOUDA_YEKOU,
    "Ogunda-Iwori": GOUDA_WOLI,
    "Ogunda-Odi": GOUDA_MON_DI,
    "Ogunda-Irosun": GOUDA_GBO_LOSSO,
    "Ogunda-Owonrin": GOUDA_WINLIN,
    "Ogunda-Obara": GOUDA_BLA,
    "Ogunda-Okanran": GOUDA_AKLAN,
    "Ogunda-Osa": GOUDA_SA,
    "Ogunda-Oturupon": GOUDA_FO_TRUKPIN,
    "Ogunda-Otura": GOUDA_TULA,
    "Ogunda-Irete": GOUDA_GBO_LETE,
    "Ogunda-Ika": GOUDA_KA,
    "Ogunda-Ose": GOUDA_TCHE,
    "Ogunda-Ofun": GOUDA_FOU,
    "Osa-Osa": SA_MEDJI,
    "Osa-Ogbe": SA_WO_GBE,
    "Osa-Oyeku": SA_YEKOU,
    "Osa-Iwori": SA_WOLI,
    "Osa-Odi": SA_DI,
    "Osa-Irosun": SA_LOSSO,
    "Osa-Owonrin": SA_WINLIN,
    "Osa-Obara": SA_GOUDA,
    "Osa-Okanran": SA_AKLAN,
    "Osa-Ogunda": SA_GOUDA,
    "Osa-Oturupon": SA_TRUKPIN,
    "Osa-Otura": SA_TOULA,
    "Osa-Irete": SA_LETE,
    "Osa-Ika": SA_KA,
    "Osa-Ose": SA_TCHE,
    "Osa-Ofun": SA_FU
};
