// Ejiogbe (Ogbe) Family - IFA sections
const OGBE_OGBE = {
    summary: "Ifá, Orí, Ọbàtálá, Èṣù Òdàrà, Òṣun, Ajé, Ògún, Ṣàngó, Òkè, Ẹgbẹ́.",
    aliases: ["Èjì Ogbè", "Eji Onile", "Ejônílè"],
    cultural_context: "All Ìrúnmọlè/Òrìṣà are affiliated.",
    orisa: ["Ifá", "Orí", "Ọbàtálá", "Èṣù Òdàrà", "Òṣun", "Ajé", "Ògún", "Ṣàngó", "Òkè", "Ẹgbẹ́"],
    advice: "Illumination, success, elevation, and leadership. Demands humility, integrity, and patience. Blessings include prominence and prosperity.",
    taboos: ["Eat fowl", "Eat she-goat", "Put blood in Ikin", "Wear red or black dresses", "Eat peanuts/groundnuts (to avoid child mortality)", "Eat mushrooms or Imumu (to avoid child mortality)", "Tell lies", "Sleep in complete darkness"],
    names: {
        male: ["Tèmílójù", "Orimidára", "Ifalóyayé"],
        female: ["IfAgbayé", "Omoniyi", "Olákiitán"]
    },
    professions: ["Ifá Priest", "Òrìṣà Priest", "Medical/Para-medical practitioner", "Administrator", "Hospitality", "Music", "Public Relations", "Historian", "Welfare Officer"],
    verses: [
        {
            title: "The Primacy of Truth (Oóto)",
            theme: "This verse establishes the essential nature of Truth (Òtítọ́) as the bedrock of creation and advises that maintaining integrity is the only way to avoid calamity and secure the approval of the Divine.",
            yoruba: "Òtítọ́ òrò òrò,\nÒtítọ́ láà jẹ́ pà, Òtítọ́ láà jẹ́ mùmù\nÒhun torí ni torí, Òhun torí ntòòrí\nÒhun torítóòrí láà rò f'Ọba Mòkín ní òde Ìránjè\nKò le baà fọhùn torí tòòrí tani l'ọ́rẹ",
            translation: "The statement of truth, the statement of truth,\nTruth is what we eat pounded yam (and) truth is what we eat mumu (a type of food).\nWhatever is (tori) is (tori).\nWhatever is truly true is what we must report to King Mọ́kín in Ìránjè.\nWho cannot speak the truth is nobody's friend."
        },
        {
            title: "Victory Over Evil Entities (Ajogun)",
            theme: "This verse demonstrates the comprehensive protective power of Ògbè Méjì, ensuring that once Ẹbọ is performed, the messengers of misfortune (Ajogun) must retreat, allowing all forms of Ire (good fortune) to enter the life of the supplicant.",
            yoruba: "Kí ó bá wa l'ékú lọ, Kí ó bá wa l'àrùn lọ\nKí ó bá wa l'éjọ lọ, Kí ó bá wa l'ègbà lọ\nKí ó bí bí ìre àjẹ́ wá fún wa\nKí ó bí ìre àya/ọkọ wá fún wa\nKí ó bí ìre ọmọ wá fún wa\nKí ó bí ìre gbogbo wá fún wa",
            translation: "That Death might depart, that Sickness might depart,\nThat Litigation might depart, that Paralysis might depart,\nThat the blessings of wealth may come for us,\nThat the blessings of spouse/husband may come for us,\nThat the blessings of children may come for us,\nThat all blessings may come for us."
        }
    ]
};

const OGBE_OYEKU = {
    summary: "Theme of Spiritual Protection. Foresees success, victory, and long life.",
    aliases: ["Ogbè Yèku"],
    orisa: ["Ifá", "Òṣun", "Ògún", "Ṣàngó", "Òkè", "Ẹgbẹ́", "Egúngún"],
    advice: "Must seek forgiveness from enemies. Must maintain hope and perseverance.",
    taboos: ["Use Iyèròsùn during Ikoṣẹdáyé of a child (to prevent premature death)", "Go into the poultry business or rear roosters", "Eat bat (to avoid childlessness)", "Must not take a child near water without proper investigation"],
    names: {
        male: ["Ifáfẹ̀mi", "Ifálọyin", "Bàńgbàlà"],
        female: ["Odùyẹmí", "Ifáṣèwà"]
    },
    professions: []
};

const OGBE_IWORI = {
    summary: "Success comes from hard work and family. Requires spiritual elevation and deep exploration of life's meaning.",
    aliases: ["Ogbè Wèyìn"],
    orisa: ["Ọbàtálá", "Ajé", "Ògún", "Òkè", "Ifá"],
    advice: "Must endeavor to hear all sides of any matter before taking action. Must not under-estimate any child or young one. Must take care of health.",
    taboos: ["Must not marry anyone who hails from his/her place of birth (to avoid matrimonial breakup)", "Must not engage in extra marital affairs"],
    names: {
        male: ["Ifátímílẹyìn", "Ifáwuyì"],
        female: []
    },
    professions: []
};

const OGBE_ODI = {
    summary: "Theme of progress, elevation, and long life. The client shall be freed from any form of bondage. Focus on avoiding self-inflicted ridicule.",
    aliases: ["Ogbè Di Kaka"],
    orisa: ["Ifá", "Orí", "Èṣù-Òdàrà", "Ògún", "Òṣun", "Ọbàtálá", "Ẹgbẹ́", "Ìbejì", "Ṣàngó", "Egúngún"],
    advice: "Must be mindful of words and actions toward others, especially superiors. Must deliberate carefully before taking any major decisions.",
    taboos: ["Must never produce, consume, or sell alcohol", "Must never draw money with force from debtors", "Must never repay good deeds with evil", "Must never engage in usury", "Must never consume fowl", "Must not use any part of the elephant", "Must not tie locust bean, pepper, melon, salt, yam tubers, or fowl without untying it"],
    names: {
        male: ["Ọlágbẹnrọ", "Ifákorede", "Ifálàna"],
        female: ["Olùkọyin", "Ifáṣèékẹ́", "Ifádàmilàre"]
    },
    professions: []
};

const OGBE_IROSUN = {
    summary: "Success is assured; secrets can never be exposed. Blessings come from honesty and integrity.",
    aliases: ["Ogbè Dóṣùmù"],
    orisa: ["Ifá", "Òrìṣà Òkè", "Òsányìn", "Odù", "Ajé", "Ṣàngó", "Ògún", "Ọbàtálá", "Ẹgbẹ́", "Òṣun"],
    advice: "Must investigate extensively before business or relationships. Blessings come from honesty and integrity.",
    taboos: ["Must never eat Okra (threat to children's lives)", "Must not go out at night (threat to life)", "Must never put blood on Ikin", "Must never be avaricious", "Female children must avoid adultery/promiscuity"],
    names: {
        male: [],
        female: []
    },
    professions: []
};

const OGBE_OWONRIN = {
    summary: "Success through hard work ('rely entirely on sweat'). Must overcome lamentation and attain contentment.",
    aliases: ["Ogbè Wúnlé"],
    orisa: ["Ifá", "Orí", "Èṣù-Òdàrà", "Ògún", "Òrò", "Ọbàtálá", "Òṣun", "Ẹgbẹ́", "Ọba"],
    advice: "Must change the habit of pleasing outsiders at the expense of his/her immediate family. Must assist relatives so they can support him/her later.",
    taboos: ["Never sleep in complete darkness", "Never conspire against others", "Never kill, maltreat, consume, or use the porcupine"],
    names: {
        male: ["Ifárèmílẹ́kùn (Ifá puts an end to my crying)", "Ifálàmí", "Ifáṣẹgun"],
        female: []
    },
    professions: []
};

const OGBE_OBARA = {
    summary: "Blesses with prosperity and wealth through vast imagination.",
    aliases: ["Ogbè Gbàràdà"],
    orisa: ["Ọbàtálá", "Ifá", "Ògún", "Ajé", "Odù", "Orí"],
    advice: "Must keep dangerous substances/weapons away from the household. Must work diligently and with integrity. Should avoid excessive nightlife.",
    taboos: ["Must never use bread fruit (Afọn)", "Must never use featherless bird (Opípí)", "Must never use any part of an Elephant", "Must never eat the liver of any animal", "Must never contemplate separation or divorce"],
    names: {
        male: [],
        female: []
    },
    professions: []
};

const OGBE_OKANRAN = {
    summary: "Blessing of childbearing, good spouse, and financial success. Must never change job, position, or locality because of challenges.",
    aliases: ["Ogbè 'Kànràn"],
    orisa: ["Ìbejì", "Ògbè", "Egúngún", "Odù"],
    advice: "Must not take his friend to his girlfriend's house. Must not change job, position, or locality because of challenges.",
    taboos: ["Must not eat sheep (ram and ewe) (to avoid childlessness and losing Sàngó/Ọya support)", "Must not eat cock (to avoid curse by elders)", "Must not steal friends' girlfriend or spouse", "Never wear red or black dresses"],
    names: {
        male: ["Ọlánrèwàjú", "Ọládàyọ́"],
        female: []
    },
    professions: []
};

const OGBE_OGUNDA = {
    summary: "Theme of leadership born from discomfort. May be used to obtain from those that were wronged. Must exercise patience and understanding.",
    aliases: ["Ògbè Yọ́ọ́nu"],
    orisa: ["Ògún", "Ifá", "Ajé", "Ẹgbẹ́"],
    advice: "Success requires pursuing greatness on one's own. Must heed wise counseling and avoid being power-drunk or obstinate.",
    taboos: [],
    names: {
        male: ["Fágayọ", "Ajìgúọlá"],
        female: ["Adúràọlá", "Ọmọlẹwà"]
    },
    professions: []
};

const OGBE_OSA = {
    summary: "The child is born to be great and happy. Theme of triumph over ridicule. Must avoid arrogance.",
    aliases: ["Ogbè Ṣáà"],
    orisa: ["Ifá", "Odù", "Orí", "Ẹgbẹ́", "Ọbàtálá", "Ṣàngó", "Ògè/Málámalà", "Ògún", "Elders of the Night", "Òkè"],
    advice: "Must ensure that the newborn feeds from the mother's breast milk. Must speak truth, or remain silent. Warns against deception and plotting.",
    taboos: ["Must never consume antelope meat", "Must never put blood on Ikin", "Must never wear small brimless caps", "Must never skip food or engage in fasting", "Must never curse or swear at others"],
    names: {
        male: ["Gẹ̀gẹ̀lẹ̀", "Ikúsègbàgbé", "Àìkúlọlá"],
        female: ["Ifátóòrèra"]
    },
    professions: []
};

const OGBE_OTURUPON = {
    summary: "Blessings of success, victory, and long life. Warns against taking charge of other people's ventures or babies.",
    aliases: ["Ogbè Tọ́mọpọ̀n"],
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Òṣun", "Ọya", "Ògún", "Ìbejì"],
    advice: "Warns a woman against being too beauty-conscious to avoid childlessness. Ifá warns the husband not to quarrel with others.",
    taboos: ["Never eat the heart of any animal/fish/bird", "Never cheat anyone", "Never strap other people's babies on back (risk of childlessness)", "Never eat ram (wrath of Ọya)", "Never be too fashion or beauty conscious", "Never pay goodness with ingratitude"],
    names: {
        male: ["Ifágbàmílà", "Ifáṣẹgun"],
        female: ["Ẹlẹwà", "Ifáṣemílóore"]
    },
    professions: []
};

const OGBE_OTURA = {
    summary: "Blessings of enjoyment and long life. Must never speak evil of others. Never pay kindness with wickedness.",
    aliases: ["Ogbè Alárá"],
    orisa: ["Ifá", "Orí", "Èṣù-Òdàrà", "Ọ̀ṣun", "Ògún", "Òsányìn"],
    advice: "Must exercise clearness of thought, discernment, patience, and humility. Must not lay emphasis on wealth at the expense of children.",
    taboos: ["Never wear black or red dresses (wrath of Ọbàtálá)", "Never consume alcohol in excess"],
    names: {
        male: ["Agbóọlá", "Mọ̀dùpẹ́ọlá", "Orímídára"],
        female: []
    },
    professions: []
};

const OGBE_IRETE = {
    summary: "Alignment, Legacy, and Restoration. Signifies ancestral clarity, seeing the past as clearly as the future. Sacred contracts and fulfilling one's destiny. Wealth tied to alignment, service, and integrity. Natural leader whom power chooses due to silence and presence.",
    aliases: ["Ògbè Ìrẹtẹ̀", "Ògbè Atè", "Ogbè Séete", "Ogbè wáátẹ̀"],
    orisa: ["Ọ̀rúnmìlà (Ifá)", "Ọbàtálá", "Èṣù Òdàrà", "Ẹgbẹ́ Ọ̀run", "Yemọa", "Ògún"],
    advice: "Must fulfill the gift/contract and not stray from the path. Silence is sacred, but only when it serves truth. Walk with integrity. Talent without ritual is a debt unpaid. Must feed Orí, honor tongue, wash feet, and listen to Ọbàtálá.",
    taboos: [],
    names: {
        male: [],
        female: []
    },
    professions: ["Oratory", "Healing", "Governance", "Community service"]
};

const OGBE_IKA = {
    summary: "Potential for more success, abundance, and influence. Blesses those who take calculated risks (driving, mining, aviation).",
    aliases: ["Ogbè Ìká"],
    orisa: ["Òṣun", "Òràn", "Ògún", "Ifá", "Orí"],
    advice: "Must heed the warning of the Awo to prevent calamity for loved ones. If death threatens, offer ẹbọ urgently.",
    taboos: ["Never eat land snails", "Never marry spouse from the same locality", "Never see fresh corpses", "Never use the Òrìrì tree"],
    names: {
        male: ["Ifákàyọ́dè", "Adéjùmọ́bi", "Ọlágbàyẹ"],
        female: ["Àyẹ́gbàmí"]
    },
    professions: []
};

const OGBE_OSE = {
    summary: "Theme of triumph over ridicule/disgrace. The path of reparative justice and reversal of exile.",
    aliases: ["Ogbè Ṣé"],
    orisa: ["Òrúnmìlà", "Òṣun", "Ògún", "Èṣù Èlégbàra", "Ọbà", "Egún"],
    advice: "Must guard secrets even from spouse. Betrayal often comes disguised in familiarity.",
    taboos: ["Never eat garden eggs (àgbàdo)", "Never eat goat", "Never work spiritual rituals at night", "Avoid bathing in the river", "Never act as a surety or guarantor"],
    names: {
        male: ["Ajíbọ̀ṣé (born on Òṣé Ifá day)"],
        female: []
    },
    professions: []
};

const OGBE_OFUN = {
    summary: "Spiritual Justice and Rebirth. Guarantees success in all aspects of efforts. Theme of Restoration; female child should marry a Babalawo.",
    aliases: ["Òfún Ògbè"],
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ọbàtálá", "Ajé", "Òrìṣà Oko", "Yemọa"],
    advice: "Must set worthwhile goals and pursue diligently. Must be careful with those you trust.",
    taboos: ["Must never take other people's wives or engage in extramarital activities", "Never eat goat", "Never be outside at night"],
    names: {
        male: ["Òfúnlogbè"],
        female: []
    },
    professions: []
};

// Oyeku (Yeku) Family - IFA sections
const OYEKU_OYEKU = {
    summary: "Ifá, Orí, Èṣù Òdàrà, Ọbàtálá, Ọ̀ṣun, Ògún, Yemọja, Ọ̀yá, Egúngún.",
    aliases: ["Òyèkú Méjì"],
    cultural_context: "From Ejiogbe Voices Archives.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ọbàtálá", "Ọ̀ṣun", "Ògún", "Yemọja", "Ọ̀yá", "Egúngún"],
    advice: "Longevity, abundant wealth, good spouse, and victory over opponents. The older the person, the more successful they become. Must embrace stillness and accept the ending of cycles as transformation. Must view all possessions as a gift from Odù. Must overcome negativity and align heart (Ọkàn) and spiritual head (Orí).",
    taboos: ["Walk in the rain (to avoid missing chances of success)", "Use Palm Bird (Ọgá)", "Use leopard", "Pawn or lend", "Use water as part of feeding Orí", "Rear chicken or engage in poultry business", "Use Iyèròsùn during Ifá consultation", "Wear red, black or very dark coloured dresses"],
    names: {
        male: ["None explicitly listed in these sources for Odù Méjì."],
        female: ["None explicitly listed in these sources for Odù Méjì."]
    },
    professions: ["None explicitly listed in these sources for Odù Méjì."]
};

const OYEKU_OGBE = {
    summary: "Prosperity, success, and leadership. Emphasis on finding harmony between work and rest. Success requires integrity and patience. Children born here will lack nothing in life.",
    aliases: ["Oyeku L'ogbe"],
    orisa: ["Ọ̀rúnmìlà", "Orí", "Èṣù", "Ọbàtálá", "Yemọja"],
    advice: "Blessings are given 'because you returned what was never yours'. Success and happiness are achieved after performing Ẹbọ without hesitation. Represents completion of a cycle and the movement to the next phase.",
    taboos: ["Must not risk changing residence or job", "Must not go out when it is dark", "Must not wear dark-colored clothes (black, dark blue, dark gray, navy blue)", "Must not see a fresh corpse or attend ceremonies of the recently deceased", "Must not administer medicine to sick people", "Must not raise hand against anyone", "Female children: Must not humiliate or look down upon husbands"],
    names: { male: [], female: [] },
    professions: ["(Prohibited from medical profession: doctor, nurse, pharmacist, radiologist, pathologist, or working in any hospital)"]
};

const OYEKU_IWORI = {
    summary: "Transformation and consciousness. The Voice That Dug Its Own Echo.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Egúngún"],
    advice: "Transformation, the blueprint of self. An energy that warns against judging something hastily or rashly. Must take care of health. Must offer sacrifice to Ifá, Èṣù, Orí, Egúngún. Must not abandon ancestral divinities.",
    taboos: ["Must never work in the medical or paramedical field", "Must not abandon ancestral divinities"],
    names: {
        male: ["Oladejobi (Honour surrounds us all)"],
        female: ["Oladejobi (Honour surrounds us all)"]
    },
    professions: ["Ifá/Òrìṣà/Egúngún Priest/Priestess", "Business tycoon", "Sanitary worker", "drycleaner", "laundry man", "garbage collector"]
};

const OYEKU_ODI = {
    summary: "The Silence Beneath The Iron Gate. Discipline, maturity, and order. Represents the need to earn one's way and avoid shortcuts. True wealth is quiet and arrives late.",
    orisa: ["Òrúnmìlà", "Ọbàtálá", "Èṣù", "Ògún", "Egbe Orun", "Ancestors/Egúngún"],
    advice: "Purification before passage. Seeks truth buried beneath shame. Bestows unshakable power (depth, not charisma). Demands release and stripping of self to confront hidden truths. Must rise early, speak softly, honor silences. Must confess to Èṣù. Must move with order in money (document everything, pay debts).",
    taboos: ["Avoid shortcuts, disorder, loudness", "Must guard the bones, mouth, and blood"],
    names: { male: [], female: [] },
    professions: ["Sign for those who work with order and diligence"]
};

const OYEKU_IROSUN = {
    summary: "The Vessel That Refused To Spill. Focuses on longevity and protection against death/disease. Ensures peaceful marital life.",
    orisa: ["Ifá", "Orí", "Ògún", "Ọbalúayé", "Ọ̀ṣun", "Ṣàngó", "Ọbàtálá", "Egbe", "Egúngún", "Ancestors"],
    advice: "Wealth walks backward; comes from cleansing, setting the bones right, and settling family debts. Love is remembered (a promise made before birth). Blessings come after the ritual and tears. Must not refuse assistance to those who need it. Must not abandon Orisa/Irunmole.",
    taboos: ["Must never sell mother's belongings", "Must never inherit a dead person's dresses", "Must never eat beans family (infant mortality/infertility)", "Must never sleep in total darkness", "Must never consume rooster"],
    names: { male: [], female: [] },
    professions: ["Ifá/Òrìṣà Devotees", "Farming", "Poultry Management", "Arable Farm Management"]
};

const OYEKU_OWONRIN = {
    summary: "The Inheritance of Ashes. Destiny actualization and victory over enemies.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ẹgbẹ́", "Ọbàtálá", "Egúngún", "Ògún", "Ọ̀ṣun"],
    advice: "For actualization of destiny, elevation, progress, and success. Must not help anyone to carry a load of unknown content (to avoid implication).",
    taboos: ["Must never give shabby burial to anyone", "Must never help anyone carry a load of unknown content"],
    names: {
        male: ["Asunlola (He who sleeps on honour)", "Olori-ire (The one with good destiny)", "Ogunsegun (Ogun brings me victory)"],
        female: []
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Commentator", "announcer", "newscaster", "disc jockey", "Musician", "poet", "comedian"]
};

const OYEKU_OBARA = {
    summary: "The Laughter That Echoed Too Loud. Deals with temptations and sexuality; the betrayal of women toward men. Importance of gratitude and humility.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ọ̀ṣun", "Ògún", "Ṣàngó", "Obalúayé", "Ancestors", "Òrúnmìlà", "Èṣù Odàrà"],
    advice: "Ancestors who were silenced, mocked, or misjudged return for justice through joy. Relationships often begin in conflict but evolve into sacred mirrors. Must balance creativity with order (budgets/routine) to prevent money from fleeing. Must live in gratitude and humility. Must avoid gossip. Must establish balance.",
    taboos: ["Avoid chemical, drug, or sexual vices", "Must not show disrespect to parents or godparents", "Must never strike a child, especially on the head", "Do not curse or blaspheme"],
    names: { male: [], female: [] },
    professions: []
};

const OYEKU_OKANRAN = {
    summary: "The Elephant and the Antelope. Conflict and struggle.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ògún", "Ṣàngó", "Òrúnmìlà", "Èṣù", "Ancestors"],
    advice: "Disobedience is spiritual blindness. The Orí is regal but easily offended; blessings are conditional. Èṣù is strict, not laughing at disobedience.",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const OYEKU_OGUNDA = {
    summary: "The Axe That Danced In The Marketplace. Focuses on victory over enemies and the importance of patience and humility.",
    orisa: ["Ifá", "Ògún", "Ṣàngó", "Orí", "Egúngún", "Ọ̀yá", "Òkè"],
    advice: "Transformation born from rejection. Prosperity is extracted (from sweat and earth), not inherited. Paternal ancestors speak loudly and demand offerings/appeasement. Must not be envious of other people's success. Must practice patience and humility. Must not lay too much emphasis on his/her rights.",
    taboos: ["Must never be selfish", "Must avoid using Ọpeere bird", "Must never use any part of Araba tree", "Must not eat at anyone's home without divining first (spiritual poisoning is possible)"],
    names: {
        male: ["Tẹ́ńtẹ́-Olú (The emergence of a leader)", "Ifágbilọ (Ifá takes over the land)"],
        female: []
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Merchandise", "Sales", "Teaching", "Professor", "Hospitality profession"]
};

const OYEKU_OSA = {
    summary: "The Voice That Died Before It Spoke. Secrets, hidden fortune, and feminine power. Silence is a test. Wealth comes from channeling divine insight.",
    orisa: ["Orí", "Ọ̀rúnmìlà", "Èṣù", "Ọ̀yá", "Yemọa", "Egúngún", "Ọbàtálá", "Ajé", "Ilẹ̀"],
    advice: "Themes of Elevation and Financial Success. Relates to ancestral assignment and aligning the Orí. Requires obedience and confession of truth. Must speak with their head before their mouth. Singing, chanting, crying are essential medicines. Must walk upright, do not envy, do not boast.",
    taboos: ["Must never wear dark or red dresses", "Must never be avaricious", "Must not keep quiet in the face of intimidation", "Must never sell or distill alcohol", "Do not eat dog", "Do not lie", "Do not mock your elders", "Must never attend ceremonies without prior Ifá consultation"],
    names: {
        male: ["Oloye (titled holder)"],
        female: []
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Administrator", "Consultant", "Welfare officer", "Trading", "Salesmanship", "Marketing", "Medical/Paramedical"]
};

const OYEKU_IKA = {
    summary: "The Hand That Trembled Before The Strike. Karmic testing, discipline, and authority. Pain is not punishment—it is prophecy.",
    orisa: ["Orí", "Ọ̀rúnmìlà", "Èṣù", "Ògún", "Obalúayé", "Yemọa", "Egúngún"],
    advice: "The claw does not crush a worthy child. If the path is breaking, ask what you refused to learn. Orí is royal but moody, demanding discipline and cleansing. Esu punishes hypocrisy. Must honor Orí through discipline (early rising, careful speech). Confess and repair hypocrisy.",
    taboos: ["Must never use charm to escape consequences", "Must not walk barefoot in places of power", "Must not marry without consulting Ifá", "Must not delay Ẹbó once revealed", "Must fast periodically (Obalúayé)", "Must keep homes and altars in divine order (Ògún)"],
    names: { male: [], female: [] },
    professions: []
};

const OYEKU_OTURUPON = {
    summary: "The Meal Before Betrayal. Delay is not destiny—it is a call to urgency and action. Focuses on regret and missed moments.",
    orisa: ["Ọ̀rúnmìlà", "Èṣù", "Ọ̀yá", "Ògún", "Yemọa", "Egúngún", "Ọbàtálá", "Ancestors (Egúngún)"],
    advice: "Veiled judgment and quiet reckoning. Èṣù acts as the archivist, testing if silence is cowardice or strategy. Blessings follow purity in thought and action (Ọbàtálá). Must act quickly on intuition in love. Must return to the original calling for fortune. Must release what is unfinished.",
    taboos: ["Must not ignore first instruction", "Must not delay in honoring tools/path/purpose"],
    names: { male: [], female: [] },
    professions: []
};

const OYEKU_OTURA = {
    summary: "Where Death Is A Stranger. Focuses on community health and well-being. Health is prioritized over material wealth.",
    orisa: ["ỌȀrúnmìlà", "Ọbàtálá", "Orí", "Èṣù Ọdàrà"],
    advice: "Reverence for the self is everything. Blessings are delayed to protect the bearer. If wrongly blamed, Èṣù will confuse the tongue and delay helpers. If health is at risk, find an alternative way of doing the assignment. Must know and respect neighbors' likes and dislikes.",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const OYEKU_IRETE = {
    summary: "The Night That Chose To Lead. Mending people's destinies. Destiny fulfilled through discipline and administration.",
    aliases: ["Òyèkú'rete", "Opokú Ìrèté"],
    orisa: ["Ifá", "Orí", "Odù", "Ògún", "Èṣù Òdàrà", "Ọbalúayé", "Egúngún", "Ẹgbẹ́", "Ṣàngó", "Ọbàtálá", "Ọ̀ṣun", "Òrìṣà Oko", "Ancestors (Egúngún)"],
    advice: "Represents ancestral clarity, leadership, and restoration. Blessings arrive through returning to places or names the family abandoned. Success comes from love as covenant, where partners heal ancestral debt together, treating intimacy as ritual. Must not underestimate any Awo. Must not move away from relatives.",
    taboos: ["Must never go bare-footed", "Must not rear chicken or engage in poultry business", "Must never wear red, black or very dark coloured dresses", "Must never use Iyèròsùn during Ifá consultation", "Must never eat ostrich", "Must never be part of any conspiracy", "Must never be climbing ladders or scaffolding"],
    names: {
        male: ["Atunwase (He who mends people's destinies)"],
        female: []
    },
    professions: ["Administrator", "Military", "paramilitary", "legal and social welfare profession", "Law enforcement", "Ifá Priest/Òrìṣà Priest"]
};

const OYEKU_OSE = {
    summary: "The River That Refused To Flow. Focuses on the importance of sacrifice and the consequences of neglecting spiritual duties. Warns against greed and betrayal.",
    aliases: ["Òyèkú se", "Òyèkú P´ose", "Òyèkú Pakín Ose"],
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ọ̀ṣun", "Ọbàtálá", "Ògún", "Egúngún", "Òṣé"],
    advice: "Destiny is heavy with karma and demands sacrifice. Celebration must follow closure, not precede it, teaching restraint. Love is heavy with karma; partners must learn to love without ownership (to avoid entrapment). Requires cleansing the grave and lighting candles for goodbyes. Blessings of wealth must be shared. Must be generous and avoid greed. Must not betray trust. Must make sacrifices to avoid misfortune.",
    taboos: ["Must not be avaricious", "Must not betray trust", "Must not eat dog meat", "Must not eat snail", "Must not eat palm oil", "Must not wear red or black (clashes with spirits of night)", "Must not mistreat animals", "Must not consume alcohol", "Must not eat partridge (wrath of the elders)", "Must never destroy yaayaa grasses (sacred doors)", "Must avoid greed"],
    names: {
        male: ["Ifáṣọla (Ifá brings honor)", "Ifágbemiga (Ifá exalts me)"],
        female: ["Ifáṣọla (Ifá brings honor)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Trader", "Merchant", "Administrator", "Consultant", "Business", "jewelry", "beads", "spiritual service"]
};

const OYEKU_OFUN = {
    summary: "The Sleep That Remembers Its Name. Focuses on purity and abandoning ancestral tradition.",
    aliases: ["Òyèkú'fu", "Òyèkú Ya fokúú"],
    orisa: ["Ifá", "Orí", "Ọbàtálá", "Ajíṯénà"],
    advice: "Marriage is a covenant, demanding loyalty over passion and rhythm over fire. If the covenant is broken, the Orí mourns. The bearer's role is to ensure that the patterns established by Òfún endure (Ajíṯénà's path). Blessings are found in building households that sing (Ìrẹ̀). Warns against arrogance, especially the old toward the young. Must not dismiss children. Must not ignore dreams that come in the voice of a daughter.",
    taboos: ["Must not enter military/paramilitary/secret service professions", "Must never abandon ancestral tradition", "Warns against arrogance", "Must not dismiss children", "Must not ignore dreams that come in the voice of a daughter"],
    names: {
        male: ["Arodede (He who dresses correctly)"],
        female: ["Ibiade (The royal consanguinity)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Sanitary Inspector", "Health worker"]
};

// Export for global usage
window.ODU_OGBE_OYEKU_IFA = {
    "Ogbe-Ogbe": OGBE_OGBE,
    "Ogbe-Oyeku": OGBE_OYEKU,
    "Ogbe-Iwori": OGBE_IWORI,
    "Ogbe-Odi": OGBE_ODI,
    "Ogbe-Irosun": OGBE_IROSUN,
    "Ogbe-Owonrin": OGBE_OWONRIN,
    "Ogbe-Obara": OGBE_OBARA,
    "Ogbe-Okanran": OGBE_OKANRAN,
    "Ogbe-Ogunda": OGBE_OGUNDA,
    "Ogbe-Osa": OGBE_OSA,
    "Ogbe-Ika": OGBE_IKA,
    "Ogbe-Oturupon": OGBE_OTURUPON,
    "Ogbe-Otura": OGBE_OTURA,
    "Ogbe-Irete": OGBE_IRETE,
    "Ogbe-Ose": OGBE_OSE,
    "Ogbe-Ofun": OGBE_OFUN,
    "Oyeku-Oyeku": OYEKU_OYEKU,
    "Oyeku-Ogbe": OYEKU_OGBE,
    "Oyeku-Iwori": OYEKU_IWORI,
    "Oyeku-Odi": OYEKU_ODI,
    "Oyeku-Irosun": OYEKU_IROSUN,
    "Oyeku-Owonrin": OYEKU_OWONRIN,
    "Oyeku-Obara": OYEKU_OBARA,
    "Oyeku-Okanran": OYEKU_OKANRAN,
    "Oyeku-Ogunda": OYEKU_OGUNDA,
    "Oyeku-Osa": OYEKU_OSA,
    "Oyeku-Ika": OYEKU_IKA,
    "Oyeku-Oturupon": OYEKU_OTURUPON,
    "Oyeku-Otura": OYEKU_OTURA,
    "Oyeku-Irete": OYEKU_IRETE,
    "Oyeku-Ose": OYEKU_OSE,
    "Oyeku-Ofun": OYEKU_OFUN
};
