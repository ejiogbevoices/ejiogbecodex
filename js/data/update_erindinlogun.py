import re
import json

# User provided text
verses_text = """Verses of the Ẹẹ́rìndínlógún (1 to 12 Open Cowries)
1. Ọ̀kànràn (1 Cowrie Open)
Verse Name/Context
Yorùbá Verse (with diacritics)
English Translation
Sources
Verse 1: Good Fortune
Ìre ni mo ko / Ìre ni mo ji ri / Ọkan ni mo pe / Èjì lo wole to mi / Ìre ni mo ko / Ìre ni mo ji ri
Good things are coming to their way / When I woke up blessed with good things / I asked for one / And two were the ones who gave me / Good things come to my way / As I woke up blessed with good things
Verse 2: Okanran Ties the Ide
Ọ̀kànràn sodè, / Ajá olóde gbóràn jú olódelo, / Oro ti ńse ni wuje wujè, / Bí ò gbó ni si rere, / Kòsí ewu lóko, / Àfi gìrìrì àparò lásàn
Okanran ties the ide / The hunting dog is the one who listens to the owner whose words annoy us. / Surely it will be good / There is no evil on the mountain / Except the bird's flight
2. Èjì Òkò (2 Cowries Open)
Verse Name/Context
Yorùbá Verse (with diacritics)
English Translation
Sources
Verse 1: The Hunter and the Serpent
Èjò kò ní ‘lé / Jókòó èbá t’onà / Èsù kò ní ‘lé / Jókòó èbá t’onà / Dá 'Sà fun Ode / Nígbatí nlo ìgbó / Nwon ni ki o ru ebo fun Èsù
The Serpent has no home, / He sits by the roadside / Esu has no home, sits by the side of the road / They were the priests who consulted Òrìsà for the Hunter / when he went to the forest / They said that I should make an offering for Èsù
Verse 2: The Child of Joy
Ejì onkò, / Mo kóre èmín dé, / ọmọ ayò, / Bí eyélẹ ́rílú yòjó, / E kí gbe ìbeèjì, / Ìbeèjì o, / Ìbeèjì òrìṣà
Eji onko / Has brought my blessings / The child of joy / If the pigeon hears a sound, it will dance. / Shout the name of the twin / The orisa twins
3. Ògúndà (3 Cowries Open)
Verse Name/Context
Yorùbá Verse (with diacritics)
English Translation
Sources
Verse 1: Dividing the Fish
Iwaju ní nkoko yọ iparo á si gbà tií / A d’Ifá fún Bàbá Onibu má nlọ gbun / Abufún Bàbá Ologbun má nni bu / A d’ífá fún Ògún / Ti nlọ réé dá èja si méjì / Igbati m’Ògún dá èja si méjì / Ni ire dá ba gbogbo wà
The front comes first before the occipital (bone at the back of the head) / They made divination for the one who had the river, but did not have the excavator / They made divination for the excavator, but who did not have the river / They made divination for Ògún / Who was going to divide a fish in two / After having divided the fish / All good luck arrived
Verse 2: Selecting the Head (Excerpt)
Ígbó réré ni modé / Mo gbó ohùn odò / òkè réré ni modé / Mo gbó ohùn edùn / ómórí odó ló jehun / Ló yó tán ló dìdòbálè gbóró / Ní mí sìbásìbo
I am in the far forest / I am hearing the voice of the mortal / I am in the mountain / I am hearing the voice of edù / The pestle has already eaten / Fully and prostrate properly / Breathing deeply
Verse 3: Breaking the Snail
Ògúndá di Ìgbín, / Orí n’ikú ahun, / Okusu dádí ìgèrè, / Ajádi agbọ̀n gbótọ́n ó deni aláa, / Èrò ìpo / Èrò ọ̀fà / Ká wá báni l’asèyorí
Ogunda breaks the snail from below / Turtle dies by the head / Okusu breaks igere's bottom / When the baskets are old, they will no longer be useful. / People of ipo and ofa / Come meet us in a successful life
4. Ìròsùn (4 Cowries Open)
Verse Name/Context
Yorùbá Verse (with diacritics)
English Translation
Sources
Verse 1: Rain and Fire
Òjú npǫn Irosun / Irosun iná pupa pȩlȩnjȩ / Ojo dudu gbǫlǫjǫ / Ojo pȩlu oorun won nleri / Ojo ni ti o hun ba su Ina ko ni ran / Oorun ni to ohun b aran Ojo ko ni su / Ojo rǫ O pa ina
Irosun is hurried. / Irosun is the bright red fire. / The dark and cloudy rain. / The rain and the sun are vain / The Rain says when it is cloudy. The fire does not shine. / The sun said if he starts to shine. The rain will remain cloudy. / Rain fell. The rain subsided
Verse 2: The Jealous Elements
Iná pupa pelenje laranta / Ojo Dudu bolojo laranta / Kakaki nfena má fẹ ojo / A d’Ífá fún Oluokoko / Ti nlọ si isale àbàtà lọ rèé kán rilé ọmọ ni bibi / Ẹbọ ni wọ́n ni kó ṣe / Ó si gbéḅọ, nbè ó rúbọ / Ojo ó ba má nmá nduro kóò wà gbàmi lówó ajogun
The fire is jealous / The rain is jealous / Instead of marrying the fire I will marry the rain / They made divination for malanga (vegetable) / Who was going to the swamp to have children / They said to make ẹbọ / He heard and made the sacrifice / Rain will stand still and save me from the evil spirits
Verse 3: Bathed in Blood
Ìrosùn ọmọ afi èjè wè, / Arí baba lójú àlààlá fìjàdùn…
Irosun the son of the one who bathes in blood / The one who dreamed of his father
5. Ọ̀ṣẹ́ (5 Cowries Open)
Verse Name/Context
Yorùbá Verse (with diacritics)
English Translation
Sources
Verse 1: The Perfect Messenger (Òṣé Ìwòrì)
Bí o bá mọ sé jé, / O mọ́ mo jé onísé, / Bí ò mọ́ mo sé jé, / O mọ́ mo jé olùsé, / Onísé làwá jé níran tàwa, / Àwá kìí was olùsé, / Ìwọ àyàsùn jíse ẹbọ tòní si rere…
If a child is good at sending messages, he should be named a perfect worker. / If a child doesn't know how to deliver a message, he should be called a bad messenger. / We are the perfect worker, not a bad one. / Ayasuhan delivers our very perfect message
Verse 2: Sese Olongo
Sese Olongo puru aparo / A d’ífá fún Ọ̀rúnmìlà / Ifá ó má nṣe Owo Ija kadi kaye / Tóò bà dá bàbá wọ́n ani kóò mu eku wà / Sese Olongo puru aparo…
Sese Olongo puru aparo / He made divination for Ọ̀rúnmìlà / The father who was going to enter a world fight / If you do Ifá, I say bring fish / Sese Olongo puru aparo…
Verse 3: Blessings in the City
Ají ní gboro / Arìn ní gboro / Òjí ní kùtùkùtù / F’omi ìgboro bójú / Olá ti ń oni ní gboro lówà / Ire gbogbo ti ń oni ní gboro lówà / Ire gbogbo ní gboro ní gboro
We woke up in the city / We walk in the city / We use water to wash our face early in the morning. / All my blessings are in the city / All the blessings of life I will find in the village / I will go gbogbo ní gboro ní gboro
6. Ọ̀bàrà (6 Cowries Open)
Verse Name/Context
Yorùbá Verse (with diacritics)
English Translation
Sources
Verse 1: Today Cheap, Tomorrow Cheap
Ọ̀bàrà balẹ̀ ságun, / Adífáfún Àsìsè the ọmọ Olọ́fin, / Òní bàrà, / Òla bàrà, / Eye bàrà kìí káátè
Obara bale sagun / Launched ifá for young man reach / today cheap / tomorrow cheap / The bird of bara did not hang himself
Verse 2: Tentere and Her Children
Adondo ado nlonjé / Adondo Ado tori Okun ado sokan soso / Adífá fún Tentere / Eyiti obimo mẹ́fa tiku Opa meta / Ti yo oko meteta Iyoku to Iya ikú láládé ọ̀run
Adondo ado is your name / Adondo The small gourd makes a single product because of the rope / They made divination for Tentere / She who had six children and whose death killed three of her children / The rest went to the Mother of Death in heaven
Verse 3: Prosperity After Poverty
Obara seke seke A da fun Olofin / Ti won ni Ibaje mbo wa di ero / Obara eni ise nse / Obara eni ode n da / Ni igbehin o do ‘lokun / Ni igbehin o do ‘lu ode
Obara seke seke (name of the awo) / Consulted for Ǫlǫfin / And they told Ǫlǫfin / Your sentiments will soon become things of the past / Obara who is tormented by poverty. / Obara who is not the one in his community / In the end of the day, he became prosperous
7. Òdí (7 Cowries Open)
Verse Name/Context
Yorùbá Verse (with diacritics)
English Translation
Sources
Verse 1: The Wise Man and the Fish
Òdídí kàá kàá, / Òdí kooko, / Òdídí kí gànmù gànmù / Imu rè ò mọ́n yo, / Òdí n kólá, / Aya rè mọ́n àgbọn, / Ológbón dí orí ẹja mú, / Omúgó dí irurè mú, / Taní ó sàìmọ́ pe / Eni tódi orí ẹja mú, lẹj́a n bá lọ
Odi blocked it harder / Odi blocked it well / Odi blocks it so nothing shows outside / Odi is being rich / Your wife has wisdom. / The person who is wise grabbed him by the head / The fool grabbed the fish by the tail / The one who grabbed the fish by the head was the one who took it home
Verse 2: The Lord of the Market
Odindi Odi Odindi Odi / Èjì Odi meji, a di otito / D'ifa fun Akesan, ti o nlo ree je Baale oja / Akesan nd'ade, aya re nda oja / Eyin o mo pe olori ire ni eni nd'aja
Odi is healthy Odi is healthy / The two legs of Odi became the truth / Consulted Ifá for Akesan, when he was about to become the lord of the market / Akesan wears a crown, his wife controls the market / Please I ask blessings to found a market with effort
8. Èjì Ogbè (8 Cowries Open)
Verse Name/Context
Yorùbá Verse (with diacritics)
English Translation
Sources
Verse 1: The Soul Child of Elédùmarè
Gbogbo orí àfi ewú / Abuké rerù òrìsà másò / Lààlàgbàjà ló ti gbé ìse rè dé / Adífáfún Èmí / Tí yo jé olójà / Láwùjo Òrun / Láwùjo Ará / Èmí jé omo Elédùmarè
All the head have grey hair / The hunch carries the load of Orisa without putting it on the ground / Laalagbaje you have started your behaviour / Divining for the soul / Who will be a king / In heaven / In earth / The soul, the child of Eledumare
Verse 2: The Eye and Ire
O ni gboyin daji gboyin / Babalawo oju da fun oju / O ni gboyin daji gboyin / Babalawo Ire da fun Ire / Oju nwa Ire, Ire nwa Oju / Won ni ki won kale ebo ni ki won se / Oju rubo a ru so / Ire rubo a ru be yewo / Peko o, a ko ara wa / Ire ri oju, Oju r’Ire / Peko o, a ko r’a wa
The babalawo of the eye did ifa for Oju / The babalawo of Ire did Ifa for Ire / The eye seeks Ire, Ire seeks the Òjú / He was asked to make ȩbǫ / Òjú made the ȩbǫ and looked where it was made / Ire performed the offering and placed it in the same space as Òjú / Here we meet / Ire sees Òjú, Òjú sees Ire / Here we meet
Verse 3: Supporting the Two
Èjèjì ni mogbè, / Nògbe enìkan ṣoṣo, / Bí mo bá gbe Táyé, / Má gbe Kéhìndé, / Tim mo bá gbe onínú ibú, / Má gbe onínú ire, / Adágún odò abì eerí lójú, / Àbàtà toní ibíre tíkò lọ
I blessed both of them not just one person. / Yes I blessed taye (taiwo) / I must bless kehinde / If I blessed the wicked / I will bless the one who thinks good thoughts / Stagnant water will be dirty / Abata has nowhere to go and refuses to go
9. Òsà / Òtùá (9 Cowries Open)
Verse Name/Context
Yorùbá Verse (with diacritics)
English Translation
Sources
Verse 1: Òsá of the Witches
Òtúá oríkò tán, / Ìkọ nsá, / Òsá méjì, / Òsá eleye, / Kí e báni sé, / Òsáwò, / Ìwòrìwó, / Ohun a bá dìjowò, / Gégé nígún, / Gégé ni mín esín korawọn…
Otua oriko tan / Iko nsa osa meji / Osa of the witches / Come to help me / Stare Iwori I look at him / Whatever we watch together won't go to waste / The poop of the horses is put step by step
Verse 2: Sàngó Conquers Enemies
Ò sáá méjì lákòjà / Ó bú yekeyékè lójú opón / A díá fún Òlúkòso làlú Bámbí / Omo a rígba ota ségun / Èyí tí ó gòkè àlàpà / Ségun òtá è / Ebo n wón ní ó se / Ó sì gbébo n bé / Ó rúbo
Ò Sáá Méjì lákòjà / He roared strongly on the board / Consulted Ifá for Òlúkòso làlú Bámbí / Son who conquered with 200 stones / Who will go to the top of the mountain / Conquer his enemies / He was told to offer sacrifice / He heard and offered
Verse 3: The Pot of Destiny (Invocation)
òrìsà wápe àwon awo rè / Òtùá ni odù tí ó jáde / Wón ní kí òrìsà kó rúbo / Kó fi ìkòkò kún ebo rú
Orisa called their priests / Otua was the Odu revealed / They told them to make offering / To add a pot to the elements for offering
10. Òfún (10 Cowries Open)
Verse Name/Context
Yorùbá Verse (with diacritics)
English Translation
Sources
Verse 1: White and Red Chalk (Obàtálá Molding)
Òfún sááre / Kámo pé léfun / Òfún sááre / Kámo pé lósùn / Òfún sááre / Kámo pé ní mòrìwò òpè yeyèye / Adífáfún Obàtálá / Ti anpe ni Òrìsà Ńlá
Ofun point to good / Let call it white chalk / Ofun point to good / Let call it red chalk / Ofun point to good / Let call it moriwo ope yeyeye / Divined for Obatala / called Òrìsà Nlá
Verse 2: Òsun Receives the Oracle
Òfún sàá léfu / Òfún sàá Lósù / Òfún sàá ní mòriẁò òpe / Yeyèy / Adif́á fún Òsun àwúrá olú / Tiń lo gbàse lówó obańla
Ofun Saa Lefu / Ofun Saa Losu / Ofun Saa ni moriwo op / Yeeyey / Divine for Òsun Awura Olú / She went for permission from Obanla
Verse 3: Warning of Sickness/Fear
Òfún fura fuù, / Òyèyè yera wo, / Bí ó fún soyún ilé, / Afún sárùn, / Ala alábàláse, / Òkùnkùn baba èrù, / Arín mọn tọ́n, / Kómo aráyé o tó rín ni, / Òrìṣà ńlá Òsèrèmọ̀gbò, / Mó fi èrín wa só mo aráyé lenu…
Ofun care / Oye take care / Take care of those who are pregnant / For sickness / The commander / Darkness is the father of fear. / The one who laughs at someone before the people on earth / Orisanla Oseremogbo / Don't let people laugh at me
11. Ọ̀wọ́nrín (11 Cowries Open)
Verse Name/Context
Yorùbá Verse (with diacritics)
English Translation
Sources
Verse 1: Okere and the Egg
Enu Okere ni npa okere / Enu Oforo ni npa Oforo / Okere bi omo kan / O ni ile ohun kun sososo
The mouth of Okere kills Okere / The mouth of Oforo kills Oforo / Okere cooked an egg / She announced that her nest is full of new eggs
Verse 2: Enemies Nearby (Òwónrín sogbè)
Òwónrín sogbè, / Ogbè sòwọ́nrín san, / Sémi nse hó, / Abi èmọ́n n bàdí, / Èyìnkùlé lòtá wà, / Inú ilé ni asení n’gbé, / Adìe dàmí lògùn nùn, / Ń ó si fo léyin…
Owonrin did bad to ogbe / Ogbe replied back / I do mine and you do yours / That's what makes the same spread / Your enemies are not far from you / Who hurts you is who knows you / The chicken used its pen and pours my medicine powder / I will also break the egg
Verse 3: The Scarce
Owon owo lá n nawo eyo / Owon ounjé lá npè niyan / Adifá fún Eyin Owon / Ti nṣe ọmọ ọbá leyo / Ajori Esarè ̣wá è ̣wá raja ọmọ Oba / Eposese è ̣wá raja eyi owon / Esarè ̣wá è ̣wá raja ọmọ oba
During the scarcity of money, little money is seen to spend / During the scarcity of food, little food is seen to eat / They made divination for The Scarce / The descendant (son) of the king of Òyó / Come buy the goods of the king's son / Come in groups buy the goods of the Scarce / Come buy the goods of the king's son
12. Ẹ̀jìlá Áṣẹ́bọra (12 Cowries Open)
Verse Name/Context
Yorùbá Verse (with diacritics)
English Translation
Sources
Verse 1: Sàngó’s Victory
Ògúnlénirinwó Okó, / Wọ́n wá bá nílé yebe, / Òtàlé legbèje Àdá, / Wọ́n wá bá nílé yebe,, / Gbògbo wọ́n parapo wọ́n n’bá Òkè sọ̀tá, / Òkè o jé, / Òkè o mú, / Òkè ní yóò reyin gbogbo wọn, / Ẹ bá wa pé Káàbièsi o Ṣàngó!
Four hundred and twenty stones / They met at Yebe's house. / Two hundred and ten was the broken cutlass that we found in his house / It all comes together, they're muttering on the hill / Oke don't take any drinks, oke will surely beat them / Let's praise his highness "sango"
Verse 2: Obàtálá Receiving the Oracle
À tànpàkò ni ́ júwe ookán / Omódiń ní sobi tó lo / Adif́ á fún gbogbo Òrìsà / Wón tò de òrun bò wá sáyé / Niǵ bàtijó / Gbogbo ilé ayé jé èkún omi
Apantako ni juwe ookan ile / Omoodin ni sobi to lo / Divine for all Orisa / When they were coming to create the earth / Before the earth was only water
Verse 3: The Priest of the Leg
Òpèbé Awo Esè / A díá fún Esè / N tòrun bò wálé ayé / Ebo n wón ní ó se / Esè sì gbébo nbè / Ó rúbo / Òpèbé o dé Ìwo lawo Esè / A ì í gbìmòràn ká yo tesèé lè
Opebe the priest of the leg / Consulted for the leg / Who was coming from heaven to earth / He was asked to offer the sacrifice / He performed / Opebe you are here / You are the priest of the leg / Nobody plans an event and excludes the leg
"""

def parse_verses(text):
    signs = {}
    current_sign = None
    current_verse = None
    
    lines = text.split('\n')
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        # Check for sign header
        sign_match = re.match(r'^(\d+)\.\s+(.+)\s+\((\d+)\s+Cowrie', line)
        if sign_match:
            order = int(sign_match.group(1))
            current_sign = {
                "order": order,
                "verses": []
            }
            signs[order] = current_sign
            current_verse = None
            continue
            
        # Check for verse header
        verse_match = re.match(r'^Verse\s+(\d+):\s+(.+)', line)
        if verse_match and current_sign:
            current_verse = {
                "title": verse_match.group(2),
                "yoruba": "",
                "english": ""
            }
            current_sign["verses"].append(current_verse)
            continue
            
        # Content parsing
        if current_verse:
            if not current_verse["yoruba"]:
                current_verse["yoruba"] = line
            elif not current_verse["english"]:
                current_verse["english"] = line
                
    return signs

parsed_signs = parse_verses(verses_text)

# Read existing data
with open('js/data/erindinlogun.js', 'r') as f:
    content = f.read()
    # Extract the array content
    start = content.find('[')
    end = content.rfind(']') + 1
    json_str = content[start:end]
    
    # Convert JS object syntax to JSON for parsing (simplified)
    # This is tricky because JS keys aren't quoted. 
    # Instead of full parsing, we'll use string manipulation to inject verses.

updated_lines = []
lines = content.split('\n')
current_id = None
in_object = False

for line in lines:
    stripped = line.strip()
    
    # Detect ID
    id_match = re.search(r'id:\s*(\d+),', stripped)
    if id_match:
        current_id = int(id_match.group(1))
    
    # Detect end of object to inject verses
    if stripped.startswith('},') or (stripped.startswith('}') and 'sources' in updated_lines[-1]):
        if current_id in parsed_signs:
            verses = parsed_signs[current_id]["verses"]
            updated_lines.append('        verses: [')
            for v in verses:
                updated_lines.append('            {')
                updated_lines.append(f'                title: "{v["title"]}",')
                updated_lines.append(f'                yoruba: "{v["yoruba"]}",')
                updated_lines.append(f'                english: "{v["english"]}"')
                updated_lines.append('            },')
            updated_lines.append('        ],')
            
    updated_lines.append(line)

final_content = '\n'.join(updated_lines)

with open('js/data/erindinlogun.js', 'w') as f:
    f.write(final_content)
