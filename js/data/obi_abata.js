/**
 * Obi Abata Data
 * Represents the 5 basic positions of the 4-lobed Kola Nut.
 */

const OBI_POSITIONS = [
    {
        id: "alafia",
        name: "Àlàáfíà / Ogbe",
        meaning: "All 4 lobes facing up (YES)",
        description: "The most beneficial of all patterns. No other casting or questioning is necessary.",
        details: "When all four obi are facing up. This means YES and is the most beneficial of all patterns. However because it represents so much good and light it is easy to get tainted with negativity. No other casting or questioning is necessary.",
        image: "images/obi_alafia_replacement.png"
    },
    {
        id: 'etawa',
        name: 'Iwa / Etawa',
        meaning: 'Three up. One down. (MAYBE / CHARACTER)',
        description: 'Speaks about character and behavior. Requires further inquiry. On second cast, it is neither yes nor no.',
        details: 'Three up. One down. Receiving Iwa on the first cast usually speaks about character and behavior and requires further inquiry to clarify what issues of character the orisa is speaking about. This pattern is most useful for character development as it offers the devotee the opportunity to self reflect to see where in their current life they may be demonstrating a lack of good character. Receiving Iwa on the SECOND CAST, is neither a yes or no answer and requires an additional cast to clarify the answer as Iwa is not considered a strong answer. If answer is Obiyan, Alaafia, you would not throw again. No other casting or questioning is necessary with the kola nut',
        image: "images/obi_etawa_replacement.png"
    },
    {
        id: 'ejife',
        name: 'Obìyàn / Ejeife',
        meaning: 'Two face up. Two face down. (YES)',
        description: 'The most balanced of all patterns. It is also a clear yes to the question of acceptance of one’s prayers and offerings.',
        details: 'Two face up. Two face down. This means YES and is the most balanced of all patterns. It is also a clear yes to the question of acceptance of one’s prayers and offerings.',
        image: "images/obi_ejife_replacement.png"
    },
    {
        id: "okaran",
        name: "Okanran",
        meaning: "Three down. One up. (NO / STRUGGLE)",
        description: "On SECOND CAST, definitive NO. On FIRST CAST, indicates something troubling the mind.",
        details: "When three obi face down and one faces up. On the SECOND CAST Okanran means a definitive NO. However, on the FIRST CAST it could indicate various things. If on the Second Cast it comes out Alaafia or Obiyan it means you should not worry. The orisa are acknowledging that there is something troubling your mind and that you should not worry about it. Leave it alone. If the answer which comes out is Iwa, Okanran, or Oyeku, that means orisa is saying 'No it not worry which is the issue right now' then you would ask the follow up questions.",
        image: "images/obi_okanran_new.jpg"
    },
    {
        id: 'oyeku',
        name: 'Ìṣẹ́gun / Ópọ̀tákú / Oyeku',
        meaning: 'All 4 lobes facing down (NO / VICTORY)',
        description: 'Indicates "victory over enemies" or "to kill enemy to death". On the FIRST CAST, this means victory. Otherwise, it means NO.',
        details: 'If on the FIRST CAST, all the obi are down this pattern is called Ìṣẹ́gun which means "victory over enemies," or Ópọ̀tákú which means "to kill enemy to death." On the FIRST CAST this pattern indicate that you have some enemies who may be a issue for you at this time, yet orisa through this obi will allow you to be victorious over them. Anything other than the first cast, this pattern means NO.',
        image: "images/obi_oyeku_replacement.png"
    }
];

const OBI_VARIANTS = [
    {
        name: "Obi Funfun (White Kola)",
        description: "The white kola nut, sacred to Obatala, Olokun, Aje Salunga, and water spirits. Used for peace, clarity, and cool energy.",
        image: "images/obi_funfun.png"
    },
    {
        name: "Obi Pupa (Pink/Red Kola)",
        description: "The pink or red kola nut, used for many deities except Sango.",
        image: "images/obi_pupa.png"
    },
    {
        name: "Gbanja (Obi Alawe Meji - 2 Lobes)",
        description: "This kola nut is not generally used for divination purposes by Yoruba except for certain towns. This obi is however, the most commonly found kola nut in African Markets in the diaspora.",
        image: "images/obi_2_lobe.png"
    },
    {
        name: "Eta Obi (Obi Oloju Meta - 3 Lobes)",
        description: "This obi is regarded as sacred to Esu orisa and offered to him and Ogun as well. It is used as divination tool yet due to only having 3 lobes, the interpretation is slightly different. In the absence of 4+ lobed kola nuts, Eta obi can be used as an offering to orisa.",
        image: "images/obi_3_lobe.png"
    },
    {
        name: "Obi Abata (4 Lobes - Iya)",
        description: "The standard 4-lobed kola nut used for most divination. Represents balance and the 4 cardinal points.",
        image: "images/obi_alafia.png" // Using Alafia image as it shows 4 lobes
    },
    {
        name: "Male and Female Kola Nut Pieces",
        description: "Two of the lobes are considered female and they are called Abo. And the other two are considered male and are called Ako.",
        image: "images/obi_sexes.png"
    },
    {
        name: "Olufuwa (5 Lobes - Five-lobed Kola Nut)",
        description: "The five lobed kola nut is considered sacred to the elegant and powerful orisa Osun. In addition to having the four lobes (2 male and 2 female pieces), it also has a fifth lobe which is called Ofuwa. Ofuwa has both male and female segments and is not used in divination. This piece is not cast but is given to Esu. It can also be used in certain medicines.",
        image: "images/obi_5_lobe.png"
    },
    {
        name: "Iwarefa (6 Lobes - Six Lobes Obi)",
        description: "The six lobed kola nut is regarded as very special and used for special occasions. It is generally used for great personalities such as chiefs, kings, dignitaries of the community. It is used in Ogboni rites, the sacred society devoted to the worship of Ile, mother earth. It is considered a king's obi because it is also used in the coronation rites of kings. Because of its association with greatness, it is also a great offering for one’s ori if you are lucky enough to find one.",
        image: "images/obi_6_lobe.png"
    },
    {
        name: "Akiriboto (Single Lobed Kola Nut)",
        description: "This kola is very rare which can’t be used for divination. It is primarily used for medicinal purposes. However, pregnant women should not eat this obi.",
        image: "images/obi_1_lobe.png"
    },
    {
        name: "Orogbo (Bitter Kola)",
        description: "Bitter Kola, sacred to Sango and used for longevity and protection. Unlike Obi, it does not soften with time.",
        image: "images/orogbo_whole.png"
    },
    {
        name: "Orogbo (Cut)",
        description: "Bitter Kola split for divination or offering.",
        image: "images/orogbo_cut.png"
    },
    {
        name: "Atare (Alligator Pepper)",
        description: "Used to activate the energy of the Obi and prayers (Ase). The seeds are chewed and sprayed.",
        image: "images/atare.png"
    },
    {
        name: "Agbon (Coconut)",
        description: "Used in the diaspora (Obi Agbon) when fresh Obi Abata is unavailable. Represents resilience and mystery.",
        image: "images/agbon.png"
    }
];

const OBI_WHO_CAN_PRACTICE = [
    "Initiated Orisa and Ifa priests",
    "Non-initiated orisa devotees (aborisa) who have received an orisa or ancestral shrine.",
    "Non-initiated orisa devotees who want to feed their ori. It is important to note that although basically anyone can practice Obì divination, they must be trained to do so properly to prevent negative consequences."
];

const OBI_PRAYER = {
    title: "Opening Prayer for Obi Abata",
    instruction: "After washing hands and sprinkling water on obi and removing pits.",
    yoruba: [
        "Ọ̀tọ̀tọ̀",
        "Ọ̀rọ̀rọ̀",
        "Ọ̀tọ̀tọ̀ laàjẹ̀pà",
        "Ọ̀tọ̀tọ̀ laàjẹ̀mùmù",
        "Ohun tori nítorí",
        "Ohun tori nítorí?",
        "Ohun tori tori láá fọ̀bà mákin lọ́dẹ Ìranjẹ̀",
        "Kò lè bàa fọ̀hùn tori tòrí tánì lóre",
        "",
        "A dífá fún Òrúnmìlà tí í ṣàwọ̀ r’Òtu Ifẹ̀",
        "Nííjà àgọ̀un bẹ ká wọ́n mọ́lẹ̀ pítípítí",
        "Kí lá wá fi lé ajogun ibi lọ l’Òtu Ifẹ̀?",
        "",
        "Ẹ̀só kan gòngòbà gòngòbà làá fi lé ajogun ibi lọ táwa fi ń rìrẹ",
        "Ẹ̀só kan gòngòbà gòngòbà làá fi pẹ̀ ní ọ̀bì",
        "",
        "Kí ò bá dé irewọ̀ lọ",
        "Kí ò bá dé arùn lọ",
        "Kí ò bá dé ikú lọ",
        "Kí ò bá dé ìjà lọ",
        "Kí ò bá dé ẹ̀sìn lọ",
        "Kí ò bá dé ẹ̀gbẹ̀ lọ",
        "Kí ò bá dé ọdá lọ",
        "Kí ò bá dé aìlérò lọ",
        "Kí ó fi ire owó wá fún wa",
        "Kí ó fi ire ọkọ/aya wá fún wa",
        "Kí ó fi ire ọmọ wá fún wa",
        "Kí ó fi ire ilé wá fún wa",
        "Kí ó fi ire àṣeyọrí wá fún wa",
        "Kí ó fi ire gbogbo wá fún wa"
    ],
    english: [
        "We eat groundnut one after another",
        "We eat tiger-nut one after another",
        "We eat mushroom one after another",
        "",
        "What belongs to the head is given to the head",
        "What belongs to vitex-doniana is given to vitex-doniana",
        "Ọba making of Ìranjẹ̀ city is given a good thing",
        "So that the turn gives good things in turn",
        "",
        "They cast divination for Òrúnmìlà on his journey to Òtu Ifẹ̀",
        "When they were under the spell of malevolent forces",
        "They asked: with what do we send evil forces away?",
        "",
        "The answer:",
        "A big seed we use to send evil forces away is kolanut.",
        "It allows us to receive blessing.",
        "",
        "Help us send death away",
        "Help us send sickness away",
        "Help us send loss away",
        "Help us send trouble away",
        "Help us send litigation away",
        "Help us send paralysis away",
        "Help us send misfortunes away",
        "",
        "Endow us with longevity",
        "Endow us with money",
        "Endow us with good husband/wife",
        "Endow us with good children",
        "Endow us with house",
        "Endow us with victory",
        "Endow us with progress",
        "Endow us with titles/honours",
        "Endow us with success",
        "Endow us with all blessings"
    ]
};

const OROGBO_PRAYER = {
    title: "Prayer for Orogbo (Bitter Kola)",
    instruction: "Prayer to be said when offering Orogbo.",
    yoruba: [
        "Alárà ló lọgbọ́n",
        "Ajẹ́rò ló ní ìmọ̀ràn",
        "Èmi ò rí Alárà tó lọgbọ́n",
        "Èmi ò rí Ajẹ́rò tó ní ìmọ̀ràn",
        "",
        "Kò wá fún mi m’pọ̀ọ̀kù àdọ̀",
        "Kí n ríhun mì tami sì káńdò",
        "Kí kándò ríhun mì tami s’ilé mìmọ́ aíkù",
        "",
        "Orógbo, kí ó ní kíyè tèmi ó gbé",
        "Ìyẹ̀ròṣun ló ní kí n ma sùn pẹ̀",
        "Èèwọ̀ Òrìṣà, ataré kí ì bà mí ṣe",
        "Ọ̀pọ̀ tó gbọ́n látàrí òbí mílẹ̀ ayé",
        "Ataré má jẹ́ kí a sọfẹ̀ láyè kí ó fún wa lọ́mọ tó gbọ́n"
    ],
    english: [
        "Alárà is full of intelligence",
        "Ajẹ́rò is witty",
        "I’ve not come across the intelligent Alárà",
        "I’ve not come across Ajẹ́rò who is witty",
        "",
        "To give me herbal gourd",
        "To drop some water in a plate",
        "So that the plate can drop water in the abode of longevity",
        "",
        "Bitter kola will bring me longevity",
        "Divine powder will prevent me from amnesia",
        "It is spiritually forbidden for alligator pepper to beget an imbecile",
        "The offspring of alligator pepper are wise and intelligent",
        "Bitter kola endows us with good health and longevity",
        "Alligator pepper, prevent us from disaster",
        "Provide us with wise and intelligent children"
    ]
};

const OBI_IRE = [
    { name: "Ire Aiku", meaning: "Blessing of long life" },
    { name: "Ire Aje", meaning: "Blessing of prosperity" },
    { name: "Ire Aya/Oko", meaning: "Blessing of wife/husband" },
    { name: "Ire Omo", meaning: "Blessing of children" },
    { name: "Ire Isegun", meaning: "Blessing of victory over enemies" },
    { name: "Ire Ile", meaning: "Blessing of house" },
    { name: "Ire Merin ayika Iwa", meaning: "Blessing of all four good things" }
];

const OBI_IBI = [
    { name: "Ibi Iku", meaning: "Negativity Death" },
    { name: "Ibi Arun", meaning: "Negativity Sickness" },
    { name: "Ibi Ofo", meaning: "Negativity Loss" },
    { name: "Ibi Ejo", meaning: "Negativity Legal Trouble" },
    { name: "Ibi Oran", meaning: "Negativity Big Trouble" },
    { name: "Ibi Ese", meaning: "Negativity Accidents" },
    { name: "Ibi Egba", meaning: "Negativity of Paralysis/Hypertension/High Blood Pressure" }
];

const OBI_OFFERINGS = [
    { name: "Obi", meaning: "Another Kola nut" },
    { name: "Ounje", meaning: "Food" },
    { name: "Oti", meaning: "Alcoholic beverage" },
    { name: "Ije imu", meaning: "Food and drink" },
    { name: "Eje bale", meaning: "Blood offering to drive away bad things" },
    { name: "Eku", meaning: "Dry Rat" },
    { name: "Eja", meaning: "Dry Fish" },
    { name: "Iyo", meaning: "Salt" },
    { name: "Epo", meaning: "Palm oil" },
    { name: "Oyin", meaning: "Honey" },
    { name: "Ataare", meaning: "Alligator pepper" },
    { name: "Ẹyẹ̀lẹ́", meaning: "Pigeon" },
    { name: "Ọbìdìẹ", meaning: "Hen" },
    { name: "Akùkọ adìẹ", meaning: "Rooster" },
    { name: "Ẹtù", meaning: "Guinea fowl" },
    { name: "Pẹpẹ́yẹ", meaning: "Duck" },
    { name: "Ewúrẹ́", meaning: "She-goat" },
    { name: "Ọbùkọ", meaning: "He-goat" },
    { name: "Àgbò", meaning: "Ram" },
    { name: "Àgùntàn", meaning: "Sheep" },
    { name: "Ẹlẹ́dẹ̀", meaning: "Pig" },
    { name: "Màlúù / Ẹnìlá", meaning: "Cow / Bull" }
];

const OBI_ORIKI_LINKS = [
    { name: "Obatala", id: "obatala" },
    { name: "Orunmila", id: "orunmila" },
    { name: "Orí", id: "ori" },
    { name: "Osun", id: "osun" },
    { name: "Yemoja", id: "yemoja" },
    { name: "Sango", id: "sango" },
    { name: "Oya", id: "oya" },
    { name: "Ogun", id: "ogun" },
    { name: "Esu", id: "esu" },
    { name: "Obaluaye", id: "obaluaye" },
    { name: "Aje Salunga", id: "aje_saluga" },
    { name: "Iyaami", id: "iyami" },
    { name: "Egbe Orun", id: "egbe_orun" },
    { name: "Egungun", id: "egungun" },
    { name: "Osanyin", id: "osanyin" }
];

// Export to window
window.OBI_DATA = OBI_POSITIONS;
window.OBI_VARIANTS = OBI_VARIANTS;
window.OBI_WHO_CAN_PRACTICE = OBI_WHO_CAN_PRACTICE;
window.OBI_PRAYER = OBI_PRAYER;
window.OBI_IRE = OBI_IRE;
window.OBI_IBI = OBI_IBI;
window.OBI_OFFERINGS = OBI_OFFERINGS;
window.OROGBO_PRAYER = OROGBO_PRAYER;
window.OBI_ORIKI_LINKS = OBI_ORIKI_LINKS;
