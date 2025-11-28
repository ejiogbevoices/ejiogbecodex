// The 16 Principal Roots (Legs)
const ROOTS = [
    { name: "Ogbe", fon: "Gbe", mark: ["I", "I", "I", "I"], binary: "0" },
    { name: "Oyeku", fon: "Yeku", mark: ["II", "II", "II", "II"], binary: "1" },
    { name: "Iwori", fon: "Woli", mark: ["II", "I", "I", "II"], binary: "1" },
    { name: "Odi", fon: "Di", mark: ["I", "II", "II", "I"], binary: "0" },
    { name: "Irosun", fon: "Losun", mark: ["I", "I", "II", "II"], binary: "0" },
    { name: "Owonrin", fon: "Wenle", mark: ["II", "II", "I", "I"], binary: "1" },
    { name: "Obara", fon: "Abla", mark: ["I", "II", "II", "II"], binary: "0" },
    { name: "Okanran", fon: "Akla", mark: ["II", "II", "II", "I"], binary: "1" },
    { name: "Ogunda", fon: "Guda", mark: ["I", "I", "I", "II"], binary: "0" },
    { name: "Osa", fon: "Sa", mark: ["II", "I", "I", "I"], binary: "1" },
    { name: "Ika", fon: "Ka", mark: ["II", "I", "II", "II"], binary: "1" },
    { name: "Oturupon", fon: "Trupon", mark: ["II", "II", "I", "II"], binary: "1" },
    { name: "Otura", fon: "Tula", mark: ["I", "II", "I", "I"], binary: "0" },
    { name: "Irete", fon: "Lete", mark: ["I", "I", "II", "I"], binary: "0" },
    { name: "Ose", fon: "Ce", mark: ["I", "II", "I", "II"], binary: "0" },
    { name: "Ofun", fon: "Fu", mark: ["II", "I", "II", "I"], binary: "1" }
];

function generateOduData() {
    const allOdu = [];
    let idCounter = 1;

    // Aggregate Ifa Data
    const ALL_IFA = Object.assign({},
        window.ODU_OGBE_OYEKU_IFA || {}, window.ODU_IWORI_ODI_IFA || {},
        window.ODU_IROSUN_OWONRIN_IFA || {}, window.ODU_OBARA_OKANRAN_IFA || {},
        window.ODU_OGUNDA_OSA_IFA || {}, window.ODU_IKA_OTURUPON_IFA || {},
        window.ODU_OTURA_IRETE_IFA || {}, window.ODU_OSE_OFUN_IFA || {}
    );

    // Aggregate Fa Data
    const ALL_FA = Object.assign({},
        window.ODU_OGBE_OYEKU_FA || {}, window.ODU_IWORI_ODI_FA || {},
        window.ODU_IROSUN_OWONRIN_FA || {}, window.ODU_OBARA_OKANRAN_FA || {},
        window.ODU_OGUNDA_OSA_FA || {}, window.ODU_IKA_OTURUPON_FA || {},
        window.ODU_OTURA_IRETE_FA || {}, window.ODU_OSE_OFUN_FA || {}
    );

    // First, add the 16 Meji (Priority)
    for (let i = 0; i < ROOTS.length; i++) {
        const root = ROOTS[i];
        const key = `${root.name}-${root.name}`;

        const ifaData = ALL_IFA[key] || {};
        const faData = ALL_FA[key] || {};

        const details = {
            overview: `The double energy of ${root.name}. Represents the pure essence of this force.`,
            ifa: {
                summary: ifaData.summary || `${root.name} Meji speaks of the core attributes of ${root.name}.`,
                ese: ifaData.ese || [],
                ire: ifaData.ire || ["Alignment", "Power"],
                ibi: ifaData.ibi || ["Excess", "Imbalance"],
                taboos: ifaData.taboos || [],
                remedies: ifaData.remedies || [],
                orisa: ifaData.orisa || [],
                names: ifaData.names || { male: [], female: [] },
                professions: ifaData.professions || []
            },
            fa: {
                name: `${root.fon} Meji`,
                theme: `${root.fon} Meji in the Vodun system.`,
                summary: `The Vodun perspective on ${root.fon} Meji.`,
                prohibitions: [],
                vodun: [],
                elements: [],
                colors: [],
                geomancy: null,
                ...faData
            }
        };

        // Ensure ese has placeholders if empty
        const ese = (details.ifa.ese && details.ifa.ese.length > 0) ? details.ifa.ese : [
            { yoruba: "", translation: "" },
            { yoruba: "", translation: "" }
        ];

        allOdu.push({
            id: idCounter++,
            binary: root.binary + root.binary, // Simplified binary rep
            name: {
                yoruba: i === 0 ? "Eji Ogbe" : `${root.name} Meji`,
                fon: details.fa.name || (i === 0 ? "Gbe Meji" : `${root.fon} Meji`)
            },
            markings: { ifa: root.mark, ifa_left: root.mark },
            ...details,
            ifa: { ...details.ifa, ese: ese }
        });
    }

    // Then, add the 240 Omo Odu (Permutations)
    for (let r = 0; r < ROOTS.length; r++) {
        for (let l = 0; l < ROOTS.length; l++) {
            if (r === l) continue; // Skip Meji, already added

            const right = ROOTS[r];
            const left = ROOTS[l];
            const key = `${right.name}-${left.name}`;

            const ifaData = ALL_IFA[key];
            const faData = ALL_FA[key];

            const oduObj = {
                id: idCounter++,
                binary: right.binary + left.binary,
                name: {
                    yoruba: `${right.name} ${left.name}`,
                    fon: faData ? faData.name : `${right.fon} ${left.fon}`
                },
                markings: { ifa: right.mark, ifa_left: left.mark },
                overview: faData ? faData.theme : `The combination of ${right.name} on the right and ${left.name} on the left.`,
                ifa: {
                    summary: ifaData ? ifaData.summary : `This Odu combines the energy of ${right.name} with ${left.name}.`,
                    ese: (ifaData && ifaData.ese) ? ifaData.ese : [
                        { yoruba: "", translation: "" },
                        { yoruba: "", translation: "" }
                    ],
                    ire: ifaData ? (ifaData.ire || []) : [],
                    ibi: ifaData ? (ifaData.ibi || []) : [],
                    taboos: ifaData ? (ifaData.taboos || []) : [],
                    remedies: ifaData ? (ifaData.remedies || []) : [],
                    orisa: ifaData ? (ifaData.orisa || []) : [],
                    names: ifaData ? (ifaData.names || { male: [], female: [] }) : { male: [], female: [] },
                    professions: ifaData ? (ifaData.professions || []) : []
                },
                fa: {
                    name: `${right.fon} ${left.fon}`,
                    theme: "",
                    summary: "",
                    prohibitions: [],
                    vodun: [],
                    elements: [],
                    colors: [],
                    geomancy: null,
                    ...(faData || {})
                }
            };

            allOdu.push(oduObj);
        }
    }

    return allOdu;
}

// Initialize global data
try {
    window.oduData = generateOduData();
    console.log("Odu Data loaded successfully:", window.oduData.length);
} catch (e) {
    console.error("Critical Error generating Odu Data:", e);
    // Fallback to empty array to prevent app crash
    window.oduData = [];
}
