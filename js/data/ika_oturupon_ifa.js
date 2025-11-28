// Ika Family - IFA sections
const IKA_IKA = {
    summary: "Ifá, Èṣù Òdàrà, Ògún, Ọbàtálá, Ancestors.",
    cultural_context: "From Ejiogbe Voices Archives.",
    taboos: ["Eat land snails", "Marry a spouse from the same locality", "See fresh corpses", "Accept and consume any fruit from anyone", "Use the Ọ̀ríri tree", "Consume alcohol excessively", "Wear black, red, or stripped dresses"],
    orisa: ["Ìká Méjì."],
    advice: "Struggle, Discipline, Karmic Web. The Odù of confrontation through consequence. Linked to sacred revelation and cleansing.",
    names: {
        male: ["Tẹ́ńtẹ́-Olú (The emergence of a leader)", "Ifájọmílójú (Ifá surprises me)", "Araromi (I feel comfortable)."],
        female: ["Àlébíòṣu (She who is as visible as the moon)", "Ifáṣetútù (Ifá brings coolness)."]
    },
    professions: ["Ifá Priest / Òrìṣà Priest", "Politician", "Coordinator", "Consultant", "Security/Secret service/Military/Paramilitary officer", "Entertainer", "Artist", "Musician", "Hospitality operator."]
};

const IKA_OGBE = {
    summary: "The Mouth That Opened The Road To Royalty. Focuses on royalty and fulfillment of destiny.",
    orisa: ["Ifá", "Orí", "Ibeji"],
    advice: "Must wait and fulfill your destiny (implied from the name).",
    taboos: ["Doubt the efficacy of Ifá", "Consume heir or rabbit (to avoid pregnancy problems)"],
    names: {
        male: ["Durooriwa (Wait and fulfill your destiny)"],
        female: []
    },
    professions: ["Military or paramilitary (Police, Army, Air Force, Secret Service)", "Security or Secret Service"]
};

const IKA_IWORI = {
    summary: "The Mouth of the Drum and the Eyes of the Storm. Deals with conflict and the need for internal discipline.",
    orisa: ["Ifá", "Orí", "Ọ̀yá"],
    advice: "Must guard against teimosia (stubbornness) and disobedience.",
    taboos: ["Use Iroko tree, shrubs, leaves and stems for anything (to avoid humiliation)", "Use or Python snake (to avoid premature death)"],
    names: {
        male: ["Ifáwunmi (I cherish Ifá)"],
        female: ["Ifáyemi (Ifá befits me)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Administrator", "Counseling Officer", "Welfare Officer"]
};

const IKA_ODI = {
    summary: "The Wall That Withstood Fire And Fell To Silence. Focuses on protection of children and avoiding problems related to health and beauty.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà"],
    advice: "",
    taboos: ["Pursue wealth or beauty at the expense of children", "Wear black or red dresses (to avoid incessant health challenges)", "Consume land snail", "Plant maize or corn"],
    names: {
        male: ["Ifáṣeye (Ifá brings prestige)", "Ifasomo (Ifá give me children)", "Ifagbolahan (Ifá enhances my honour)"],
        female: ["Ifayemisi (Ifá gives me honour and prestige)", "Ifadara (Ifá performs wonders)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Artist", "Musician", "Hospitality", "Trading", "Business tycoon", "marketer", "sales consultant", "Judge", "lawyer", "Advocate", "counselor", "welfare officer"]
};

const IKA_IROSUN = {
    summary: "The Conspiracy of the Dew and the Wisdom of the Traveler. Deals with matrimonial problems and the wrath of the divinities.",
    orisa: ["Ifá", "Òsù", "Òrìṣà Oko"],
    advice: "Must avoid envy of others' achievements.",
    taboos: ["Never eat crab (to avoid matrimonial problems and unconsummated fortune)", "Never be envious of other people's achievements"],
    names: {
        male: ["Òsùdaisi (Òsù launches this one from death)"],
        female: []
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Counselor", "Legal Practices"]
};

const IKA_OWONRIN = {
    summary: "The One Who Burned The Chicken Coop To Free The Fireflies.",
    orisa: [],
    advice: "",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const IKA_OBARA = {
    summary: "The Fisherman Who Would Not Leave The Shore. Destiny to be a historian of high repute.",
    orisa: ["Ifá", "Orí", "Egúngún", "Odù", "Òsù", "Ṣàngó", "Òṣun", "Ògún", "Ẹgbẹ́"],
    advice: "Must learn the detailed history of family/community for authority. Must not be too light-fisted. Must never pay back evil with evil.",
    taboos: ["Never show wickedness (to avoid dying a wretched person)", "Never be too light-fisted", "Never use red and black dresses"],
    names: {
        male: ["Ifasegun (Ifá is victorious)", "Ifaola (Ifá of prosperity)", "Ifafore", "Ifaranti"],
        female: []
    },
    professions: ["Historian", "Commentator/Broadcaster/Presenter/Announcer", "Ifá/Òrìṣà Priest"]
};

const IKA_OKANRAN = {
    summary: "The One Who Danced With Empty Hands.",
    orisa: [],
    advice: "",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const IKA_OGUNDA = {
    summary: "The One Who Was Healed By The River And Lost Love To The Current. Focuses on specialized professions and avoiding conspiracy.",
    orisa: ["Ifá", "Èṣù Òdàrà", "Orí"],
    advice: "",
    taboos: ["Never move with many friends (to avoid unconsummated fortune)", "Never use black and red dresses"],
    names: {
        male: ["Ifátooki (Ifá is worthy of being saluted)"],
        female: []
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "All specialized professions (engineering, medicine, accounting, banking, geology, security)"]
};

const IKA_OSA = {
    summary: "The Mouth That Spoke Before The Sky Was Ready. Where truth must be timed and beauty can burn. Requires alignment before utterance.",
    orisa: ["Orí", "Ṣàngó", "Èṣù"],
    advice: "Cleanse your tongue before speech. Do not use your voice carelessly. Consult Ifá and walk with restraint.",
    taboos: ["Lying with Ọ̀ṣun's sweetness"],
    names: { male: [], female: [] },
    professions: []
};

const IKA_OTURUPON = {
    summary: "The One Who Asked The Drum Why It Echoed. Success requires persistence and avoiding illicit love.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ẹgbẹ́"],
    advice: "Must not rely on charms. Must Honor Èṣù with clarity and Ọbàtálá with stillness.",
    taboos: ["Never engage in extra-marital activity", "Never consume alcohol in excess or use drugs", "Never swear a false oath (to avoid Ògún's wrath)"],
    names: {
        male: ["Ifálana (Ifá opens the way)", "Ifasola (Ifá brings honor)", "Ifawumi (I cherish Ifá)", "Ifadamilare (Ifá absolves me)"],
        female: ["Ifáloyin (Ifá has honey)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Administrator", "counseling officer", "welfare officer", "psychologist", "Show business", "musician", "singer"]
};

const IKA_OTURA = {
    summary: "The Stranger Who Danced Without A Name. Focuses on healing, honor, and protection.",
    orisa: ["Ifá", "Orí", "Ṣàngó"],
    advice: "Never be too inquisitive or doubt the efficacy of Ifá. Must not live a life of infidelity.",
    taboos: ["Never be too inquisitive", "Never live a life of infidelity (threat to life and fortune)"],
    names: {
        male: ["Ifáṣọlá (Ifá brings honor)"],
        female: ["Adepele (the crown multiplies my value)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Medical", "Paramedical", "Herbal healing professional"]
};

const IKA_IRETE = {
    summary: "The One Who Buried His Name To Protect His Song. Focuses on success, victory, and child protection.",
    orisa: [],
    advice: "Must persevere. Must show magnanimity when successful.",
    taboos: [],
    names: {
        male: ["Ifágbamila", "Ifáṣẹgun", "Ifákorede"],
        female: ["Alayode", "Ifásayo", "Ọ̀ṣunyemi"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Commerce", "Teaching", "counseling", "instructing", "Security Agent"]
};

const IKA_OSE = {
    summary: "The One Who Hid The Feather To Protect The Future. Foresees Ire of comfort and good health.",
    orisa: [],
    advice: "If buying property, wait until the next day before paying to avoid regret.",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const IKA_OFUN = {
    summary: "The Palm Tree That Refused To Bend Until The Wind Sang Its Name. Focuses on longevity, progress, and contentment.",
    orisa: [],
    advice: "Must not run faster than destiny through impatience. Must be content.",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const IKA_OYEKU = {
    summary: "The One Who Fires Arrows Into The House Of Silence. Focuses on accountability and punishing hypocrisy.",
    orisa: ["Ifá", "Èṣù", "Ògún", "Ọbalúayé", "Yemọja", "Egúngún"],
    advice: "Must confess and repair hypocrisy. Speak rarely; Ọrúnmìlà corrects, not comforts.",
    taboos: ["A single lie delays a blessing by a year"],
    names: { male: [], female: [] },
    professions: []
};

// Oturupon Family - IFA sections
const OTURUPON_OTURUPON = {
    summary: "Endurance and Manifesting Truth. Focuses on ancestral wisdom, the mystery of gestation, and health. It reveals that wisdom is developed through patience, character, and sacrifice.",
    orisa: ["Ifá", "Orí", "Ọ̀yá", "Ògún", "Èṣù Òdàrà", "Ọbalúwayé", "Òṣányìn", "Egúngún", "Ìbejì"],
    advice: "Must possess the necessary endurance to pursue the path of truth. Must practice humility and pay attention to consciousness and character. Patience is important.",
    taboos: ["Must not show that he/she is cleverer than others (to avoid self-inflicted problems)", "Must avoid gossip"],
    names: { male: [], female: [] },
    professions: []
};

const OTURUPON_OGBE = {
    summary: "Rebirth and Transformation. The warrior is asked to become a teacher. Focuses on using the intellect (mind) for positive creation.",
    orisa: ["Ifá", "Ògún", "Ọbàtálá", "Èṣù"],
    advice: "Must ask: 'Am I killing, or am I sewing?'. Use the mind to bless, heal, and remember.",
    taboos: ["Must not eat ram"],
    names: {
        male: ["Durooriwa (Wait and fulfill your destiny)"],
        female: []
    },
    professions: []
};

const OTURUPON_OYEKU = {
    summary: "Unfinished Contracts/Agreements and Preparation. Delay is not denial, but preparation.",
    orisa: ["Ọ̀rúnmìlà (whisperer)"],
    advice: "Must not interpret delay as denial. The babaláwo should not speak until after the kolanut has been broken.",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const OTURUPON_IWORI = {
    summary: "(Not explicitly detailed in sources). Listed as one of the 15 Omo Odù.",
    orisa: [],
    advice: "",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const OTURUPON_ODI = {
    summary: "(Not explicitly detailed in sources). Listed as one of the 15 Omo Odù.",
    orisa: [],
    advice: "",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const OTURUPON_IROSUN = {
    summary: "Deals heavily with the reproductive organs (infertility, miscarriages). Themes of diseases of silence (mental unrest, envy).",
    orisa: ["Ifá", "Òrì", "Èṣù Odàrà"],
    advice: "Must wash the body as you would the spirit; avoid heat and conflict. Prosperity comes through discipline, not desire.",
    taboos: ["Must not carry burdens with your hips"],
    names: { male: [], female: [] },
    professions: []
};

const OTURUPON_OWONRIN = {
    summary: "(Not explicitly detailed in sources). Listed as one of the 15 Omo Odù.",
    orisa: [],
    advice: "",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const OTURUPON_OBARA = {
    summary: "(Not explicitly detailed in sources). Listed as one of the 15 Omo Odù.",
    orisa: [],
    advice: "",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const OTURUPON_OKANRAN = {
    summary: "Deals with the consequences of greed, lies, wickedness, and stubbornness.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ọbàtálá", "Ṣàngó", "Ògún", "Ọ̀ṣun", "Ibeji", "Ọbalúayé", "Ẹgbẹ́"],
    advice: "Must never tell lies or display wickedness. Must avoid greed. Must not be stubborn.",
    taboos: ["Must never engage in extra marital affair", "Must never organize elaborate weddings for daughters (to avoid untimely death)", "Must never eat a duck", "Must never stay or sleep in total darkness"],
    names: {
        male: ["Olasoju (I am a living witness of honour)", "Olaifa (the honour of Ifa)"],
        female: []
    },
    professions: ["Ifá/Òrìṣà Priestess", "Salesman", "Military/Paramilitary/Security Officer", "Entertainer and Hospitality Worker"]
};

const OTURUPON_OGUNDA = {
    summary: "Ancestral Debt (The crown is owed, not given). Success, fulfillment, and comfort after hardship.",
    orisa: ["Ifá", "Ògún", "Ṣàngó", "Èṣù Òdàrà", "Òṣun", "Egúngún", "Ìbejì", "Yemọja", "Ẹgbẹ́"],
    advice: "Must exercise patience and understanding. Must not deceive the less privileged. Must stop running and ask the ancestors what was never said.",
    taboos: ["Must never eat okra or Akara", "Must never tell lies or steal", "Must never cheat on spouse", "Must never eat/kill monkey family"],
    names: {
        male: ["Ifakemi (Ifa takes care of me)", "Ifajebe (Ifa listen to my plea)"],
        female: []
    },
    professions: ["Ifá/Òrìṣà Priestess", "Merchandise", "Medical/Paramedical", "Marketing/Salesmanship", "Legal Practitioners"]
};

const OTURUPON_OSA = {
    summary: "Unexpected Fortune that demands discipline. Success through healing, teaching, or performance.",
    orisa: ["Òrúnmìlà", "Èṣù Odàrà (judge/ledger)"],
    advice: "Must not grow arrogant; money must be tied to purpose. Must feed Èṣù with silence that has been earned.",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const OTURUPON_OTURA = {
    summary: "Honor and Progress. Deals with suicidal ideation and self-harm. Needs social reform.",
    orisa: ["Ifá", "Èṣù Òdàrà", "Ògún", "Ọbàtálá", "Òṣun", "Ẹgbẹ́", "Oró"],
    advice: "Must not think of suicide or causing bodily harm. Must exercise patience and understanding. Must not be too fashion conscious (for women).",
    taboos: ["Must never consume African Cherry Mango", "Must never eat okra or garden egg fruit", "Must never consume rabbit or heir"],
    names: {
        male: ["Ọláǹwọ́n (honour is progressing)", "Aikulola (longevity is honour)", "Ifasomo"],
        female: ["Ọlákitan (honour never will end)", "Ifasooto (Ifa is truthful)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Military/Paramilitary/Security", "Trading", "Tourism", "Hospitality", "Consultancy", "Musician", "Cantor"]
};

const OTURUPON_IRETE = {
    summary: "Success, Victory, and Patience. Requires listening and patience to achieve the deepest truth.",
    orisa: ["Òrúnmìlà", "Èṣù Odàrà"],
    advice: "Honor Òrúnmìlà early (before wealth/fame). Feed Èṣù with earned silence.",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const OTURUPON_IKA = {
    summary: "Justice, Accountability, and Persistence. Success requires persistence and avoiding illicit love.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ẹgbẹ́"],
    advice: "Must not rely on charms. Must Honor Èṣù with clarity and Ọbàtálá with stillness. Must never swear a false oath.",
    taboos: ["Never engage in extra-marital activity", "Never consume alcohol in excess or use drugs"],
    names: {
        male: ["Ifasola", "Ifawumi", "Ifadamilare", "Ifálana (Ifá opens the way)"],
        female: ["Ifáloyin (Ifá has honey)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Administrator", "Counseling Officer", "Welfare Officer", "Psychologist", "Show Business", "Musician", "Singer"]
};

const OTURUPON_OSE = {
    summary: "(Not explicitly detailed in sources). Listed as one of the 15 Omo Odù.",
    orisa: [],
    advice: "",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const OTURUPON_OFUN = {
    summary: "Patience, Restraint, and Longevity. Carries great blessings that only unfold through restraint and sequence.",
    orisa: ["Ifá", "Ọbàtálá", "Èṣù", "Ẹgbẹ́"],
    advice: "Must break kola before prayer. Promise rarely, fulfill always. Trust Orí more than anyone's advice.",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

// Export for global usage
window.ODU_IKA_OTURUPON_IFA = {
    "Ika-Ika": IKA_IKA,
    "Ika-Ogbe": IKA_OGBE,
    "Ika-Oyeku": IKA_OYEKU,
    "Ika-Iwori": IKA_IWORI,
    "Ika-Odi": IKA_ODI,
    "Ika-Irosun": IKA_IROSUN,
    "Ika-Owonrin": IKA_OWONRIN,
    "Ika-Obara": IKA_OBARA,
    "Ika-Okanran": IKA_OKANRAN,
    "Ika-Ogunda": IKA_OGUNDA,
    "Ika-Osa": IKA_OSA,
    "Ika-Oturupon": IKA_OTURUPON,
    "Ika-Otura": IKA_OTURA,
    "Ika-Irete": IKA_IRETE,
    "Ika-Ose": IKA_OSE,
    "Ika-Ofun": IKA_OFUN,
    "Oturupon-Oturupon": OTURUPON_OTURUPON,
    "Oturupon-Ogbe": OTURUPON_OGBE,
    "Oturupon-Oyeku": OTURUPON_OYEKU,
    "Oturupon-Iwori": OTURUPON_IWORI,
    "Oturupon-Odi": OTURUPON_ODI,
    "Oturupon-Irosun": OTURUPON_IROSUN,
    "Oturupon-Owonrin": OTURUPON_OWONRIN,
    "Oturupon-Obara": OTURUPON_OBARA,
    "Oturupon-Okanran": OTURUPON_OKANRAN,
    "Oturupon-Ogunda": OTURUPON_OGUNDA,
    "Oturupon-Osa": OTURUPON_OSA,
    "Oturupon-Otura": OTURUPON_OTURA,
    "Oturupon-Irete": OTURUPON_IRETE,
    "Oturupon-Ika": OTURUPON_IKA,
    "Oturupon-Ose": OTURUPON_OSE,
    "Oturupon-Ofun": OTURUPON_OFUN
};
