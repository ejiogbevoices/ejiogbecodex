// Iwori Family - IFA sections
const IWORI_IWORI = {
    summary: "Òrúnmìlà, Ògún, Odù, Òrìṣà Òṣèèrèmògbò (Ọbàtálá).",
    cultural_context: "From Ejiogbe Voices Archives.",
    taboos: ["Be too fashion and beauty conscious (to avoid childbearing problem)", "Fight over legacy"],
    orisa: ["Ìwòrì Méjì", "Eleji-Iwori."],
    advice: "Transformation, Consciousness, Blueprint of self and psyche. Defines nature, direction, and acceptance. Emphasizes the need for cooperation to accomplish tasks.",
    names: {
        male: ["Orí secures love and adoration (Ọlásọ̀un", "translated from Portuguese)", "Ifádárà (Ifá does miracles/wonders)", "Ifáṣọmọ (Ifá gives me child)."],
        female: ["Ifádùnminínú (Ifá makes me happy)", "Ifádárà (Ifá does miracles)", "Ifáṣẹmí (Ifá pampers me)."]
    },
    professions: ["Ifá Priest", "Òrìṣà Priest", "Civil/structural/mechanical/electrical engineering", "Blacksmith/Ferreiro", "Politician", "Presenter", "Broadcaster", "Marketing", "Negotiation."],
    ese: [
        {
            title: "Ẹni a bá wádé la bá lọ relé",
            yoruba: "Ẹni a bá wádé la bá lọ relé\nẸni a bá wà ní aji a bá lọ\n\nA dífá fún Ẹ̀jìwòrì\nẸ̀jí tí yóò tẹ̀jú mọ́ Mákọ̀pé rìgrìgrì\nTí ó bá tẹ̀jú mọ́ ọ̀kọ wò mí ire Ẹ̀jìkòkò Ìwòrì\nTí ó bá tẹ̀jú mọ́ aya wò mí ire\n\nẸ̀jìkòkò Ìwòrì\nTí ó bá tẹ̀jú mọ́nà a máa lọwọ́ lọwọ́\nẸ̀jìkòkò Ìwòrì\nTí ó bá tẹ̀jú mọ́ ọmọdé wò mí ire\n\nTí ó bá tẹ̀jú mọ́ ọmọ ilé yáyà ìkọ́kọ́\nẸ̀jìkòkò Ìwòrì\nTí ó bá tẹ̀jú mọ́ ìbí rere wò mí ire\n\nTí ó bá tẹ̀jú mọ́ ilé lọ (ilé-ọmọ) wò mí ire\nẸ̀jìkòkò Ìwòrì\nTí ó bá tẹ̀jú mọ́ ohun gbogbo wò mí ire\n\nẸ̀jìkòkò Ìwòrì\nIfá, tẹ̀jú mọ́ mí kí ó wò mí ire\n\nTí ó bá tẹ̀jú mọ́nà a máa kó gbogbo ire\nẸ̀jìkòkò Ìwòrì\nIfá, tẹ̀jú mọ́ mí kí ó wò mí ire.",
            english: "We go home with whoever we go out with\nThe dog goes back home with whoever takes it out\n\nCast divination for Ẹ̀jìwòrì\nWho looks for the good interest of his devotees\n\nIfá, keep your watchful eyes on me and give me goodness\nIf you keep your eye on one, the person will be rich\n\nẸ̀jìkòkò Ìwòrì, Ifá:\nKeep your watchful eye on me and give me goodness.\nIf you keep your watchful eye on one, the person will have a good wife/husband.\n\nIfá, keep your watchful eye on me and give me goodness.\nIf you keep your watchful eye on one, the person will have good children.\n\nẸ̀jìkòkò Ìwòrì, Ifá:\nKeep your watchful eye on me and give me goodness.\nIf you keep your watchful eye on one, the person will own houses.\n\nIf you keep your watchful eye on one,\nThe person will be blessed with all good things of life.\n\nẸ̀jìkòkò Ìwòrì, Ifá:\nKeep your watchful eye on me and give me goodness."
        }
    ]
};

const IWORI_OGBE = {
    summary: "Elevation, Success, and Spiritual Harmony. Destiny is to rise from grass to grace and occupy a leadership position.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Egúngún", "Oró", "Ṣàngó"],
    advice: "Must endeavour to hear all sides before taking action. Must never under-estimate any child or young one.",
    taboos: ["Must never kill ants of any kind", "Must never divorce or separate (for a woman)", "Must not be proud or arrogant"],
    names: { male: [], female: [] },
    professions: ["Ifá Priest", "Òrìṣà Priestess", "Hunter", "Military", "Paramilitary"]
};

const IWORI_OYEKU = {
    summary: "Transformation and consciousness. Focuses on longevity and the ability to find harmony.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Egúngún"],
    advice: "Must take care of health. Must not abandon ancestral divinities.",
    taboos: ["Must never work in the medical or paramedical field", "Must not abandon ancestral divinities"],
    names: {
        male: ["Oladejobi (Honour surrounds us all)"],
        female: []
    },
    professions: ["Ifá/Òrìṣà/Egúngún Priest/Priestess", "Business tycoon", "Sanitary worker", "drycleaner", "laundry man", "garbage collector"]
};

const IWORI_ODI = {
    summary: "Focuses on family harmony and the elimination of ailments. Represents the need to accommodate all people and their character.",
    orisa: ["Ifá", "Èṣù Òdàrà", "Orí", "Ọbàtálá", "Ọbalúayé (Ṣanponna)", "Egúngún"],
    advice: "Must avoid promiscuity (to avoid sexually transmitted ailments). Must seek realization of destiny.",
    taboos: ["Must avoid all things forbidden by Ọbàtálá (to avoid ailments/disasters)", "Must not be promiscuous"],
    names: {
        male: ["Odunayo", "Esubiyii", "Alalade"],
        female: ["Odunayo", "Olajumoke", "Esubiyii"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Comedian", "dramatist", "artist", "musician", "Medical and paramedical professions", "Administrator", "consultant", "social worker", "Trading", "marketing"]
};

const IWORI_IROSUN = {
    summary: "Destiny of success brought right from heaven. Associated with long life and all Ire of life.",
    orisa: ["Ifá", "Orí", "Òrìṣà Oko", "Òṣun"],
    advice: "Must not be in a hurry for success or money. Must not underestimate anyone.",
    taboos: ["Must never be in a hurry to make money", "Must never abandon his wife when she is ill"],
    names: {
        male: ["Dòṣùmú (I hold onto the Òṣu staff)", "Ifáṣọlá (Ifá brings me honour)"],
        female: ["Àlàláàtà (She who turns her dreams into money)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Administrator", "merchant/trader"]
};

const IWORI_OWONRIN = {
    summary: "Acquisition of all the great things of life. Focuses on victory, protection, and success. Success is dependent on following advice.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ẹgbẹ́", "Òṣun", "Yemọja"],
    advice: "Must be extremely careful in selection of spouse (warns of choosing a promiscuous woman). Must not rely on charms. Must rise early and speak softly.",
    taboos: ["Must never tell lies", "Must not underestimate women", "Must never pay good with evil", "Must not eat or rear a female sheep", "Must not drink excessive alcohol"],
    names: {
        male: ["Igbehinadun (The end shall be successful)"],
        female: []
    },
    professions: ["Administrator/Management/Personnel Officer"]
};

const IWORI_OBARA = {
    summary: "Self-realization, love, success, and leadership. Associated with wealth gained through business dealings given by Ọbàtálá.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ògún", "Òkè", "Ẹgbẹ́", "Yemọja"],
    advice: "Must perform any work diligently and with integrity. Must not reveal plans so they are not thwarted. Must avoid excessive nightlife (due to chest/lung disease warning).",
    taboos: ["Must never make love in a standing position", "A woman must not be too extravagant (to avoid unconsummated fortune)", "Must not eat pangolin", "Must not work during the designated day of Ifá worship"],
    names: {
        male: ["Ifadara (Ifa performs wonders)"],
        female: []
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Agriculture (arable/pastoral)", "fishery", "Trading", "marketing", "salesmanship", "Counselor", "welfare officer", "medical/paramedical officer"]
};

const IWORI_OKANRAN = {
    summary: "Leadership and achievement. Theme: The Rooster That Forgot It Was Morning.",
    orisa: ["Ifá", "Orí", "Ògún", "Ṣàngó", "Òṣun"],
    advice: "Must not show wickedness. Must not pay back evil with evil. Must be mindful of words and actions toward others.",
    taboos: ["Must never be too light-fisted", "Must never use red and black dresses"],
    names: {
        male: ["Ifasegun (Ifa is victorious)", "Ifaola (Ifa of prosperity)", "Ifafore (Ifa says that it is Ire)", "Ifaranti (Ifa remember everything)"],
        female: []
    },
    professions: ["Historian", "Commentator/Broadcaster/Presenter/Announcer", "Ifá/Òrìṣà Priest"]
};

const IWORI_OGUNDA = {
    summary: "Success, victory, elevation, and leadership. Focuses on perseverance. Theme: The Forest Path That Spoke In Sparks.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà"],
    advice: "Must not be in a hurry for success. Must not fight over a legacy. Must not be too fashion and beauty conscious.",
    taboos: ["Must never be in a hurry for success", "Must not fight over legacy", "Must not be too fashion and beauty conscious (to avoid childbearing problem)"],
    names: {
        male: ["Ifasola (Ifa has done great honour)", "Oloye (the title holder)"],
        female: ["Omoyeni (child is befitting)", "Oriomodun (having a child is more rewarding)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Trading"]
};

const IWORI_OSA = {
    summary: "Secrets, Prophecy, and Feminine Power. Theme: The Mirror That Refused To Lie. Foresees success and victory over enemies.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Òrìṣà Oko", "Ìbejì", "Egúngún", "Ṣàngó", "Ọbàtálá"],
    advice: "Must never take any step without prior proper deliberation. Must not be too sensitive to rights.",
    taboos: ["Must never eat walnut (to avoid quarrel among siblings)", "Must never eat locust bean", "Must never eat dog", "Must never eat he-goat", "Must not be promiscuous"],
    names: {
        male: ["Ifatooyanran (Ifa is worthy of being proud of)", "Ifayemi (Ifa befits me)"],
        female: ["Ifadunmininu (Ifa makes me happy)", "Ifakanyin (Ifa had honey to my life)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Trading", "Marketing", "Consultancy", "Hospitality", "Agriculture", "Transportation"]
};

const IWORI_OTURUPON = {
    summary: "Health, Vitality, and Success. Theme: The House That Paid Its Debt In One Day. Foresees a barren woman being blessed with babies.",
    orisa: ["Ifá", "Èṣù Òdàrà", "Ọbàtálá", "Òṣun", "Ajé", "Ẹgbẹ́"],
    advice: "Woman must not be too beauty-conscious (to avoid childlessness). Man must resolve disagreement with wife immediately to avoid uprising. Must not be promiscuous.",
    taboos: ["Must never eat Ooyo (to avoid child bearing problem)", "Must never eat hot meal", "Must not practice strange religion or abandon Òrìṣà/Irúnmọ̀lè"],
    names: {
        male: ["Towolope (Respect is for Ifá)", "Ifagbayi (Ifa is prestigious)"],
        female: ["Owoope (The respect of Ifá)", "Ifatutu (Ifa is cool and comfortable)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Blacksmith", "goldsmith", "metal worker", "Medical/Paramedical worker", "Trader/marketer/sales person"]
};

const IWORI_OTURA = {
    summary: "Guidance, Honor, and Prosperity. Theme: The Transformation of Yalumo.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ògún", "Ọ̀ṣun", "Ọbàtálá"],
    advice: "Must not lay emphasis on wealth at the expense of children. Must exercise patience and understanding.",
    taboos: ["Must not consume alcohol in excess", "Must not wear black or red dresses", "Must never speak evil of others"],
    names: {
        male: ["Awoyemi (Awo befits me)", "Ifágbàmílà (Ifá comes in my rescue)"],
        female: ["Ifálere (Ifá is profitable)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Trading", "Public Relations", "Educationist"]
};

const IWORI_IRETE = {
    summary: "Prosperity and Fulfillment of Destiny. Theme: The Flame That Burns From Within. Ifá foresees success coming from outside the domain.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ṣàngó"],
    advice: "Must use diplomacy and rationale reasoning. Must avoid self-deceit and be realistic.",
    taboos: ["Must never consume alcohol", "Must never steal or misappropriate public funds", "Must not stand as guarantor"],
    names: {
        male: ["Okanmbi (Child born with special purpose)"],
        female: ["Egbojente (My Ẹgbẹ prevents humiliation)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Administrator", "Negotiator", "Marketing Officer", "All water-related professions"]
};

const IWORI_IKA = {
    summary: "Justice, Discipline, and Karmic Testing. Theme: The Mouth That Paid The Bride Price. Associated with arts and music.",
    orisa: ["Ifá", "Ògún", "Ọṣọ́ṣì", "Àyán"],
    advice: "Must feed the Egúngún that guards the paternal house.",
    taboos: ["Must never drink raffia palm-wine", "Must not fast or skip food", "Must not eat Oro African Cherry Mango"],
    names: {
        male: ["Ajibilu (Born into drummers)", "Amoka (Known the world over)"],
        female: ["Ayoka (Surrounded with joy)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Sculptor", "designer", "artist", "structural engineer", "Drummer", "percussionist", "singer", "musician", "chorister"]
};

const IWORI_OSE = {
    summary: "Sweetness, Fertility, and Success. Associated with victory, beauty, and grace. Theme is often about not cherishing money more than children.",
    orisa: ["Ọ̀ṣun", "Ifá", "Orí", "Èṣù Òdàrà", "Ògún", "Ṣàngó", "Ọbàtálá"],
    advice: "Must not steal what you can earn. Must not curse what you envy. Must never argue.",
    taboos: ["Must not eat chicken", "Must not eat okra", "Must not use black, red or tie-dye clothes", "Must not swear at people"],
    names: {
        male: ["Ifasola (Ifa brings honour)"],
        female: ["Osunfunmilayo (Osun brings joy)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Military/Paramilitary", "Counseling/Public Relation/Welfare Officer", "Farming (pastoral and arable)"]
};

const IWORI_OFUN = {
    summary: "Purity, Completion, and Protection. Theme: The Hand That Cleanses The Head Of The Sky. Foresees victory and success.",
    orisa: ["Ifá", "Orí", "Odù", "Egúngún", "Òṣun", "Ajé", "Èṣù Òdàrà"],
    advice: "Must never underestimate anyone.",
    taboos: ["Must not eat àkàrà (bean cake)", "Must not take any alcoholic drink", "Must never eat snail", "Must never use a Vulture or Àkàlà (ground hornbill)"],
    names: {
        male: ["Ifápero (Ifá brings peace and comfort)", "Ifáṣọlá (Ifá brings prosperity)"],
        female: []
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess"]
};

// Odi Family - IFA sections
const ODI_ODI = {
    summary: "Ifá, Odù (the source of Babaláwo power), Òrúnmìlà, Òrìṣànlá (Òòṣà), Àjé (witches).",
    cultural_context: "From Ejiogbe Voices Archives.",
    taboos: ["Use Olóbùró bird", "Leave his/her locality for other places in search of fortune", "Use beetles for anything", "(For women) Humiliate/disgrace their husband", "(For couples) Avoid insincerity"],
    orisa: ["Òdí Méjì", "Fine dust (alias)."],
    advice: "Temporary transformation and the establishment of a foundation. Deals with the mystery of rebirth and repeating cycles.",
    names: {
        male: ["Ajígunwá (He who wakes up in majestic splendor)", "Ifákọyá (Ifá rejects suffering for me)", "Ifádáre (Ifá exonerates me)", "Odùbíyìí (Odù begets this)."],
        female: ["Òkúntó (Energy and vitality)", "Awójáre (Awo is vindicated)", "Máyèdé (Do not depart from me)."]
    },
    professions: ["None explicitly listed in these sources for Odù Méjì. (However", "related Odù like Òdì Ogbè mention Babaláwo", "Musicians", "Medical Doctor", "Hunter/Soldier", "Farmer", "Politician", "Trader)."]
};

const ODI_OGBE = {
    summary: "Longevity, survival, and recovery of lost glory. Theme: 'The Drum Buried Beneath The Ground'. Focused on escaping poverty through hard work and a positive attitude.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ògún", "Òkè", "Ṣàngó", "Ajé", "Ẹgbẹ́"],
    advice: "Must deliberate carefully before taking any major decisions. Must accept humility as a lifestyle. Do not envy the one who shines too soon.",
    taboos: ["Must not eat hare/rabbit (to avoid losing those who could help him)", "If a woman, must not eat groundnut (to avoid losing her children)", "Must not wear loud colors"],
    names: {
        male: ["Idigbemi", "Olajunbala", "Iponjupin", "Ikusaanu", "Ifajenroju", "Ifajenraaye"],
        female: ["Iwinlara", "Okikiade", "Ikusaanu", "Ifajenroju", "Ifajenraaye"]
    },
    professions: ["Babaláwo (specializing in rituals and initiations)", "Musicians", "Medical Doctor", "Herbalist", "Hunter/Soldier", "Farmer", "Politician", "Trader"]
};

const ODI_OYEKU = {
    summary: "Theme: 'The Night That Birthed A Name'. Foresees a difficult situation caused by inability to avoid taboos.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà"],
    advice: "Must avoid taboos to prevent pains and sorrow.",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const ODI_IWORI = {
    summary: "Theme: 'The Drum in the Courtyard, The Secret in the Wall'. Focuses on family harmony and the elimination of ailments.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ọbàtálá", "Ọbalúayé (Sanponna)", "Egúngún"],
    advice: "Must seek realization of destiny. Must accommodate all people and their character.",
    taboos: ["Must avoid all things forbidden by Ọbàtálá (to avoid ailments and disasters)", "Must not be promiscuous (to avoid sexually transmitted ailments)"],
    names: {
        male: ["Odunayo", "Esubiyii", "Egungundeji", "Alalade (the owner of the white dress arrived)"],
        female: ["Ọlajumoke", "Odunayo", "Esubiyii", "Egungundeji"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Comedian", "dramatist", "artist", "musician", "Medical and paramedical professions", "Administrator", "consultant", "social worker", "Trading", "marketing", "sales"]
};

const ODI_IROSUN = {
    summary: "Theme: 'The Path Where Olódùmarè Walked Without Children'. Foresees Ire of victorious triumph over those in conflict. Predicts compatible spouse and giving birth to great children.",
    orisa: ["Ifá", "Orí", "Osu"],
    advice: "Woman planning to leave husband warned against doing so. Must feed Orí regularly for acceptance and peace.",
    taboos: [],
    names: { male: [], female: [] },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Administrator", "merchant/trader"]
};

const ODI_OWONRIN = {
    summary: "Theme: 'The Flame That Grows In Silence'. Focuses on financial success, guidance, and victory. Theme: truthfulness and ungreediness transformed one into a wealthy man.",
    orisa: ["Ẹgbẹ́", "Èṣù Òdàrà", "Òṣun"],
    advice: "Must never refuse genuine advice. Must not be avaricious.",
    taboos: ["Must never use eagle, hawk or falcon for anything", "Must not be avaricious", "Must never use or consume anything forbidden by Ọbàtálá"],
    names: {
        male: ["Igbehinadun (the end shall be successful)"],
        female: ["Igbehinadun (the end shall be successful)"]
    },
    professions: ["Farming/Agriculture"]
};

const ODI_OBARA = {
    summary: "Theme: 'The Cave That Sings With Broken Voices'. Focuses on avoiding unethical conduct and childbearing issues.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ògún", "Ọbàtálá", "Òṣun", "Ṣàngó", "Odù"],
    advice: "Must never engage in unethical conduct. Must avoid self-deceit and be realistic.",
    taboos: ["Must never enter inside the rain", "Must never eat, or kill maggots (to avoid childbearing and stability problems)"],
    names: {
        male: ["Ifadara (Ifa performs wonders)"],
        female: []
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Pharmacist", "herbalist", "medical doctor and para-medical worker"]
};

const ODI_OKANRAN = {
    summary: "Theme: 'The Voice That Dug A Grave To Plant The Future'. Focuses on disorder leading to untimely death and missing opportunities.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ẹgbẹ́", "Ògún", "Òṣun", "Ọbàtálá"],
    advice: "Must not be too sensitive to his right. Must not lose hope (implied from theme of rebirth/future planting).",
    taboos: ["Must never drink alcohol (to avoid untimely death)", "Must never wear green or milk colored dress (to avoid infant mortality)", "Must never stay outside his place of birth or travel too constantly"],
    names: {
        male: ["Temi-O-Sunwon (Mine will be more successful)", "Ebudola (insult turns to prosperity)"],
        female: ["Yoyin-soye (had honey to title)", "Eredola (membership of the Emere group turns to prosperity)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Sympathetic undertaker", "mortuary attendant", "coffin seller", "Sewage cleaner", "environmental cleaner", "garbage collector"]
};

const ODI_OGUNDA = {
    summary: "Theme: 'The Wall That Cut Its Own Shadow'. Focuses on support, victory, and professional accomplishment. Foresees all goodness in life.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Osu", "Òṣun", "Ògún", "Àyán"],
    advice: "Must not rely on charms. Must not be too obstinate. Must not be frequenting his in-laws house.",
    taboos: ["Must never trade in potash business", "Must never marry someone who is not initiated into Ifá", "Must never travel outside normal domicile on trading"],
    names: {
        male: ["Ifasegun (Ifa is victorious)", "Iwa-pele (meekness)", "Olannisa (honour in a hidden place)"],
        female: ["Ire (all goodness in life)", "Are (Celebration)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Musician", "drummer", "singer", "chorister", "orchestra manager", "Agriculturist", "farming", "fishery", "snail rearing"]
};

const ODI_OSA = {
    summary: "Theme: 'The Mirror That Cuts Before It Reflects'. Foresees Ire of prestigious honor and leadership. Success in ocean/water professions.",
    orisa: ["Ifá", "Òrìṣà Oko", "Ògún", "Ṣàngó", "Ọbàtálá", "Olókun"],
    advice: "Must not go to any meeting without prior Ifá consultation. Must feed Orí as recommended.",
    taboos: ["Must not eat snail", "Must avoid conspiracy"],
    names: { male: [], female: [] },
    professions: ["Exploration of the ocean", "fishing", "oceanography", "sound excavation", "and related water professions"]
};

const ODI_IKA = {
    summary: "Theme: Justice, Discipline, and Accountability. Foresees victory, success, and leadership.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ẹgbẹ́", "Ṣàngó", "Egúngún", "Ìbejì", "Ajé"],
    advice: "Must not be arrogant. Must avoid seeking wealth or beauty at the expense of children.",
    taboos: ["Must not wear green yellowish dresses", "Must never be too beauty conscious at the expense of childbearing", "Must never eat okra", "Must never consume land snail", "Must not plant maize or corn", "Must not use black or red dresses"],
    names: {
        male: ["Ifasomo (Ifa give me children)", "Ifagbolahan (Ifa enhances my honour)"],
        female: ["Ifayemisi (Ifa gives me honour and prestige)", "Ifadara (Ifa performs wonders)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Trading", "Business tycoon", "marketer", "sales person", "sales consultant", "Judge", "lawyer", "Advocate", "counselor", "welfare officer", "Security", "military", "politician", "artist", "musician", "hospitality operator"]
};

const ODI_OTURUPON = {
    summary: "Theme: 'The Drum That Refused To Play'. Focuses on achieving financial success, leadership, and protection. Foresees victory in the hands of Òṣun.",
    orisa: ["Ọ̀ṣun", "Èṣù", "Ilẹ̀ (Earth)", "Ajé"],
    advice: "Must clean the head against chronic debts (for woman). Must avoid using metal bracelets (for women).",
    taboos: [],
    names: { male: [], female: [] },
    professions: []
};

const ODI_OTURA = {
    summary: "Theme: 'The Seed That Hid Its Light In The Sand'. Focuses on honor and progress. Deals with suicidal ideation and self-harm.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ògún"],
    advice: "Must not think of suicide or causing bodily harm. Must exercise patience and understanding.",
    taboos: ["Must not think of suicide or causing bodily harm", "Must not consume African Cherry Mango"],
    names: {
        male: ["Ọláǹwọ́n (honour is progressing)"],
        female: ["Ọlákitan (honour never ends)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Musician", "Cantor"]
};

const ODI_IRETE = {
    summary: "Theme: 'The Altar Beneath The Clay Jar'. Focuses on success, financial prosperity, and water-related professions.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ṣàngó"],
    advice: "Must avoid self-deceit and be realistic. Must not allow trivial things to preclude attaining highest potentials.",
    taboos: ["Must never join any social organization", "Must not conspire against anyone", "Must not be too conscious of his fundamental rights", "Must never stand as guarantor"],
    names: {
        male: ["Tẹmilẹkẹ (mine is more successful)", "Mapowa (bring the Ifá bag)", "Awosope (I am grateful to Ifá)"],
        female: ["Tẹmilẹkẹ (mine is more successful)", "Mapowa (bring the Ifá bag)", "Awosope (I am grateful to Ifá)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Administrator", "Salesman", "Marketing Officer", "Lawyer", "Counselor", "All water related professions"]
};

const ODI_OSE = {
    summary: "Theme: 'The Well That Sang Beneath Its Cover'. Foresees Ire of victory. Associated with the importance of not cursing what one envies.",
    orisa: ["Ifá", "Òṣun", "Èṣù Òdàrà"],
    advice: "Must never argue. Must not swear at people.",
    taboos: ["Must not eat chicken or okra", "Must not use black, red or tie-dye clothes"],
    names: { male: [], female: [] },
    professions: ["Ifá/Òrìṣà Priest/Priestess"]
};

const ODI_OFUN = {
    summary: "Theme: 'The Exile Who Carried A Kingdom In His Pocket'. Focuses on victory over enemies and purity.",
    orisa: ["Ifá", "Orí", "Èṣù Òdàrà", "Ọbàtálá", "Ẹgbẹ́"],
    advice: "Must not engage in argument. Must never underestimate anyone. Must set worthwhile goals (implied from the need for diligence).",
    taboos: ["Must never engage in argument", "(For a woman) Must never kneel down to greet her mother", "Must not take permanent residence outside his place of birth"],
    names: {
        male: ["Ifásemilore (Ifá did me a good favor)", "Ifáṣẹgun (Ifá is victorious)"],
        female: ["Ifákorejo (Ifá assembles all Ire for me)", "Ifájuwọ́n (Ifá is greater than all)"]
    },
    professions: ["Ifá/Òrìṣà Priest/Priestess", "Architect", "sculptor", "artist", "designer", "Administration", "management"]
};

// Export for global usage
window.ODU_IWORI_ODI_IFA = {
    "Iwori-Iwori": IWORI_IWORI,
    "Iwori-Ogbe": IWORI_OGBE,
    "Iwori-Oyeku": IWORI_OYEKU,
    "Iwori-Odi": IWORI_ODI,
    "Iwori-Irosun": IWORI_IROSUN,
    "Iwori-Owonrin": IWORI_OWONRIN,
    "Iwori-Obara": IWORI_OBARA,
    "Iwori-Okanran": IWORI_OKANRAN,
    "Iwori-Ogunda": IWORI_OGUNDA,
    "Iwori-Osa": IWORI_OSA,
    "Iwori-Ika": IWORI_IKA,
    "Iwori-Oturupon": IWORI_OTURUPON,
    "Iwori-Otura": IWORI_OTURA,
    "Iwori-Irete": IWORI_IRETE,
    "Iwori-Ose": IWORI_OSE,
    "Iwori-Ofun": IWORI_OFUN,
    "Odi-Odi": ODI_ODI,
    "Odi-Ogbe": ODI_OGBE,
    "Odi-Oyeku": ODI_OYEKU,
    "Odi-Iwori": ODI_IWORI,
    "Odi-Irosun": ODI_IROSUN,
    "Odi-Owonrin": ODI_OWONRIN,
    "Odi-Obara": ODI_OBARA,
    "Odi-Okanran": ODI_OKANRAN,
    "Odi-Ogunda": ODI_OGUNDA,
    "Odi-Osa": ODI_OSA,
    "Odi-Ika": ODI_IKA,
    "Odi-Oturupon": ODI_OTURUPON,
    "Odi-Otura": ODI_OTURA,
    "Odi-Irete": ODI_IRETE,
    "Odi-Ose": ODI_OSE,
    "Odi-Ofun": ODI_OFUN
};
