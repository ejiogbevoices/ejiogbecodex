const toolsData = [
    {
        category: "Yoruba Ifá Tools",
        items: [
            {
                name: "Ọpọ́n Ifá (Divination Tray)",
                description: "A circular or rectangular wooden tray with a raised outer rim. The center represents the universe. The rim is carved with mythological figures and always features the face of Eshu (the divine messenger) at the top, which must face the Babalawo during consultation."
            },
            {
                name: "Ọ̀pẹ̀lẹ̀ (Divination Chain)",
                description: "The primary tool for daily consultation. It consists of eight half-seed pods (from the Opon tree) or brass wafers linked by a chain. It is held in the middle so that four pods hang on each side."
            },
            {
                name: "Ikin Ifá (Sacred Palm Nuts)",
                description: "Sixteen sacred palm nuts used for the most important rituals (like high-level initiation or life-altering questions). They are not thrown like the Ọ̀pẹ̀lẹ̀ but are beaten against the hand to \"mark\" the result in powder."
            },
            {
                name: "Ìrọ́kẹ́ Ifá (Diviner’s Tapper)",
                description: "A carved tapper (wood or ivory), often depicting a kneeling woman or equestrian figure. The Babalawo strikes the tray with it to invoke the spirits and create a rhythmic beat while chanting verses."
            },
            {
                name: "Iyèròsùn (Divination Powder)",
                description: "A yellow powder derived from the termite-eaten wood of the Irosun tree. It is sprinkled on the Ọpọ́n Ifá to mark the binary codes (Odù) when using the Ikin."
            },
            {
                name: "Ibò (Determinants)",
                description: "Small objects used to ask \"Yes\" or \"No\" questions and clarify the details of a reading. Common items include:<br>• <strong>Cowrie shells:</strong> Signifying \"Yes\" or good fortune.<br>• <strong>Bone/Stone:</strong> Signifying \"No\" or negativity."
            },
            {
                name: "Apò Ifá (Diviner’s Bag)",
                description: "A decorated leather or fabric satchel, often beaded, used to carry the tools. It protects the Ọ̀pẹ̀lẹ̀ and Ikin from public view when not in use."
            },
            {
                name: "Ìrùkẹ̀rẹ̀ (Fly Whisk)",
                description: "A whisk made of animal hair (often horse or cow tail) with a beaded handle. It symbolizes authority and is used to wave away negative energy or bless a client."
            }
        ]
    },
    {
        category: "Fon (Fa) Tools",
        items: [
            {
                name: "Fátɛ́ or Yetekplo (Divination Tray)",
                description: "(usually rectangular) The Fon equivalent of the Ọpọ́n Ifá. These trays are often simpler and more portable than the Yoruba counterparts, sometimes shaped like a calabash or a smaller wooden circle."
            },
            {
                name: "Agumaga or Akplekan (Divination Chain)",
                description: "(3 chains) The equivalent of the Ọ̀pẹ̀lẹ̀. It is often made using different seeds (specifically the Crab's Eye or Abrus precatorius seeds are sometimes used for decoration, but the pods are similar). The term Gumaga is widely used for the chain itself."
            }
        ]
    },
    {
        category: "Related Divination Systems",
        items: [
            {
                name: "Agbigba (The \"Four-Chain\" System)",
                description: "Practiced widely by the Nupe (Tapa), Yagba (a Yoruba subgroup), and non-Yoruba groups in the Niger-Benue confluence.",
                details: [
                    "<strong>\"What Brought It\" (Origin Story):</strong><br>• According to many oral traditions, Agbigba was brought by a sage named Setilu (sometimes linked to the Nupe people or early Islamic influence).<br>• In some Ifá verses, Agbigba is described as a \"servant\" or a younger contemporary of Ọ̀rúnmìlà who developed a faster, slightly different method of divination.<br>• Unlike orthodox Ifá which credits Ọ̀rúnmìlà, Agbigba lineages often credit Setilu as their Grand Priest.",
                    "<strong>The Tool (The Agbigba):</strong><br>• While the Babalawo uses an Ọ̀pẹ̀lẹ̀ (one chain with 8 seeds), the Agbigba diviner uses a complex apparatus consisting of four separate chains, each holding four markers.<br>• These chains are often connected at the top by a leather handle or ring.<br>• When cast, the diviner reads the vertical columns formed by the four chains to generate the Odu.",
                    "<strong>Distinct Features:</strong><br>• Agbigba is famous for its ability to \"see\" distinct details about the past and present very quickly.<br>• It is often considered a \"talking\" oracle that can be more aggressive or direct than the cool, diplomatic counsel of standard Ifá."
                ]
            },
            {
                name: "Oguega (The Edo/Bini System)",
                description: "Practiced by the Edo (Bini), Esan, and Urhobo people of Southern Nigeria.",
                details: [
                    "<strong>\"What Brought It\" (Origin Story):</strong><br>• The system was brought by a sage named Ominigbon (also known as Oghemene in Urhobo).<br>• In Edo mythology, Ominigbon is the equivalent of Ọ̀rúnmìlà. He is the ancient sage who uncovered the secrets of destiny.<br>• There is a historical rivalry in the stories: In Yoruba myths, Ominigbon is sometimes portrayed as a student of Ọ̀rúnmìlà. In Edo myths, Ominigbon is the superior master who taught Ọ̀rúnmìlà how to use the specific seeds.",
                    "<strong>The Tool (The Oguega/Iha):</strong><br>• The primary tool is not a chain (like the Opele) but a set of loose strings of seeds.<br>• They use the seeds of the Detarium senegalense fruit (called Oguega in Bini and Iru in Yoruba).<br>• The standard apparatus consists of four strings, each containing four seeds.<br>• The Obo (diviner) throws the strings, and the way the seeds land (convex or concave) determines the \"House\" (Odu).",
                    "<strong>Distinct Features:</strong><br>• The language used is Edo/Bini, not Yoruba.<br>• The 256 signs are called Iha (similar to Fa or Ifa), but the names are dialect versions (e.g., Ogbe becomes Ogbi, Oyeku becomes Ako).<br>• It is deeply tied to the worship of ancestral spirits (Erimwin) common in Benin culture."
                ]
            },
            {
                name: "Ewawa (Osiru / Iha Osun)",
                description: "A distinct divination system primarily practiced by the Edo (Bini) and Itsekiri peoples of Southern Nigeria. Unlike Ifá and Oguega which rely on mathematical binary codes, Ewawa is a visual and tableau-based system that relies on the chaotic arrangement of miniature symbols to tell a story.",
                details: [
                    "<strong>Origins and \"Who Brought It\":</strong><br>• Unlike Agbigba or Oguega, Ewawa is not typically traced back to a single human sage. Instead, it is inextricably linked to the Osun deity (deity of medicine, magic, and the forest).<br>• Ewawa is the voice of this medicine deity.<br>• <strong>The Ehi Connection:</strong> Ewawa is specifically famous for its ability to speak to a person's Ehi (their predestined Guardian Angel/Spirit Double). It is often used to determine why a person chose a specific destiny before they were born.",
                    "<strong>The Tools of Ewawa:</strong><br>• <strong>The Cup/Shaker:</strong> The primary tool is a container, traditionally a bronze or brass cup (reflecting Benin’s metalworking history) or a small gourd/calabash.<br>• <strong>The Icons (The \"Soldiers\"):</strong> Inside the cup is a collection of 50–60 miniature brass figures. These are not abstract seeds but literal sculptures including humans (king, pregnant woman, thief, corpse, warrior), animals (leopard, snake, crocodile, bird), and objects (sword, canoe, drum, cowrie shell).<br>• <strong>The Drum/Tray:</strong> The casting surface is often a flat drum or a wooden tray. The resonance of the metal figures hitting the drum is part of the ritual atmosphere.",
                    "<strong>The Method:</strong><br>• <strong>The Shake:</strong> The Obo (native doctor/priest) shakes the cup while incanting to wake the spirits of the figures.<br>• <strong>The Cast:</strong> He tosses the contents out onto the drum or tray.<br>• <strong>The Reading (Tableau):</strong> The reading is based on spatial relationships. Example: If the \"snake\" lands on top of the \"woman,\" it implies a specific danger to her health. If the \"king\" figure stands upright while others fall, it implies victory or authority. Every position of every object tells a part of the story."
                ]
            }
        ]
    }
];
