import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useState} from "react";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";

import MetaField from "@/components/ui/MetaField";
import {SafeAreaView} from "react-native-safe-area-context";
import Talent from "@/components/ui/Talent";
import {RawHero} from "@/constants/types/RawHero";
import Attributes from "@/components/ui/Attributes";
import Personal from "@/components/ui/Personal";
import Talents from "@/components/ui/Talents";

const styles = StyleSheet.create({
    container: {
        display: "flex",
        margin: 5,
    },
    block: {
        marginBottom: 20,
    },
    buttonContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#3498db',
        padding: 10,
        borderRadius: 5,
        margin: 5,
        minWidth: 150,
        alignItems: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    message: {
        textAlign: 'center',
        marginVertical: 10,
    },
    errorMessage: {
        textAlign: 'center',
        color: 'red',
        marginVertical: 10,
    },
    scrollContainer: {
        flex: 1,
    },
    dataContainer: {
        backgroundColor: 'white',
        padding: 15,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    heroTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingBottom: 15,
    },
    sectionContent: {
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    attribute: {
        fontSize: 16,
        marginBottom: 5,
    },
    avatar: {
        width: 64,
        height: 64,
    },
    heroName: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    sectionBelongings: {
        flexDirection: 'column',
    },
    loadingButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
})

const Character = () => {
    const [characterData, setCharacterData] = useState<RawHero | null>(null);
    const [locale, setLocale] = useState<string>("de_de");
    const [error, setError] = useState<string | null>(null);

    const loadCharacterFromPicker = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/json',
                copyToCacheDirectory: true,
            });

            if (result.canceled) {
                return;
            }

            const fileUri = result.assets[0].uri;
            const fileContent = await FileSystem.readAsStringAsync(fileUri);
            try {
                const jsonData = JSON.parse(fileContent);
                // TODO validate json to be in the Optolith format
                setCharacterData(jsonData);
                setLocale((jsonData.locale?.replaceAll("-", "_") || "de_de").toLocaleLowerCase());
            } catch (parseError) {
                // @ts-ignore
                setError("Invalid JSON format: " + parseError.message);
            }
        } catch (err) {
            console.error("Error picking or reading JSON:", err);
            // @ts-ignore
            setError("Could not read the selected file. " + err.message);
        }
    };

    const loadSample = async () => {
        setError(null);
        const data = require("../assets/data/robak.json");
        setCharacterData(data);
        setLocale((data.locale?.replaceAll("-", "_") || "de_de").toLocaleLowerCase());
    }

    const renderCharacterData = () => {
        if (!characterData) return null;

        /*
       "el":"EL_3","r":"R_1","rv":"RV_1","c":"C_18","p":"P_127","sex":"m",
       "attr":{
        "values":[{"id":"ATTR_8","value":10},{"id":"ATTR_7","value":13},{"id":"ATTR_6","value":12},{"id":"ATTR_5","value":12},{"id":"ATTR_4","value":14},{"id":"ATTR_3","value":14},{"id":"ATTR_2","value":15},{"id":"ATTR_1","value":13}],
        "attributeAdjustmentSelected":"ATTR_2","ae":1,"kp":0,"lp":0,
        "permanentAE":{"lost":0,"redeemed":0},
        "permanentKP":{"lost":0,"redeemed":0},
        "permanentLP":{"lost":0}},
       "activatable":{"ADV_50":[{}],"ADV_42":[{"tier":2}],"ADV_14":[{"tier":1}],"ADV_67":[{}],"ADV_68":[],"ADV_0":[{"sid":"Ritter des Walsach"}],"DISADV_5":[],"DISADV_37":[{"sid":8}],"DISADV_33":[{"sid":1}],"DISADV_50":[{"sid":8,"tier":2}],"DISADV_38":[],"DISADV_31":[],"SA_78":[{}],"SA_76":[{}],"SA_70":[{"sid":"SPELL_36"}],"SA_27":[{"sid":9},{"sid":14}],"SA_29":[{"sid":9,"tier":1},{"sid":8,"tier":4},{"sid":6,"tier":3},{"sid":27,"tier":2}],"SA_681":[],"SA_323":[{}],"SA_22":[{"sid":"Festum"}],"SA_250":[{"sid":"SPELL_29"}],"SA_414":[{"sid":397}],"SA_83":[{}],"SA_328":[{"tier":1}]},
       "talents":{"TAL_8":3,"TAL_10":7,"TAL_16":3,"TAL_18":4,"TAL_19":4,"TAL_20":8,"TAL_21":7,"TAL_23":6,"TAL_27":3,"TAL_32":3,"TAL_36":8,"TAL_43":2,"TAL_46":3,"TAL_44":1,"TAL_26":4,"TAL_33":7,"TAL_34":5,"TAL_56":6,"TAL_38":6,"TAL_39":4,"TAL_40":10,"TAL_42":2,"TAL_17":4,"TAL_7":2,"TAL_4":3},
       "ct":{"CT_13":14,"CT_9":8},
       "spells":{"SPELL_105":8,"SPELL_260":10,"SPELL_317":8,"SPELL_132":7,"SPELL_144":4,"SPELL_29":12,"SPELL_155":7,"SPELL_30":4,"SPELL_36":3},
       "cantrips":["CANTRIP_51","CANTRIP_53","CANTRIP_30"],
       "liturgies":{},
       "blessings":[],
       "belongings":{"items":{"ITEM_1":{"id":"ITEM_1","name":"Reisegewand für Magier","gr":6,"amount":1,"isTemplateLocked":true,"weight":3,"price":120,"stp":6,"template":"ITEMTPL_428"},
        "ITEM_2":{"id":"ITEM_2","name":"Magierstab, lang","gr":1,"amount":1,"isTemplateLocked":true,"weight":0.75,"price":80,"at":-1,"damageDiceNumber":1,"damageFlat":2,"length":150,"pa":2,"combatTechnique":"CT_13","damageDiceSides":6,"reach":3,"template":"ITEMTPL_44","primaryThreshold":{"threshold":16},"isParryingWeapon":false,"isTwoHandedWeapon":false},"ITEM_3":{"id":"ITEM_3","name":"Geldbeutel","gr":10,"amount":1,"isTemplateLocked":true,"weight":0.05,"price":1,"stp":2,"template":"ITEMTPL_200"},"ITEM_4":{"id":"ITEM_4","name":"Federkiel","gr":17,"amount":1,"isTemplateLocked":true,"weight":0.05,"price":0.1,"template":"ITEMTPL_282"},"ITEM_5":{"id":"ITEM_5","name":"Kleidungsset: Frei","gr":6,"amount":1,"isTemplateLocked":true,"price":25,"template":"ITEMTPL_139"},"ITEM_6":{"id":"ITEM_6","name":"Umhängetasche","gr":10,"amount":1,"isTemplateLocked":true,"weight":0.5,"price":8.5,"stp":6,"template":"ITEMTPL_214"},"ITEM_7":{"id":"ITEM_7","name":"Papier, 1 Blatt","gr":17,"amount":30,"isTemplateLocked":true,"weight":0.05,"price":0.1,"stp":1,"template":"ITEMTPL_286"},"ITEM_9":{"id":"ITEM_9","name":"Flöte","gr":23,"amount":1,"isTemplateLocked":true,"weight":0.25,"price":2,"template":"ITEMTPL_319"},"ITEM_10":{"id":"ITEM_10","name":"Angel mit Angelschnur","gr":7,"amount":1,"isTemplateLocked":true,"weight":0.5,"price":3,"template":"ITEMTPL_143","where":"Truhe"},"ITEM_11":{"id":"ITEM_11","name":"Schlafsack","gr":7,"amount":1,"isTemplateLocked":true,"weight":2,"price":7,"stp":7,"template":"ITEMTPL_172"},"ITEM_12":{"id":"ITEM_12","name":"Wolldecke","gr":7,"amount":1,"isTemplateLocked":true,"weight":1.5,"price":2,"stp":7,"template":"ITEMTPL_177"},"ITEM_13":{"id":"ITEM_13","name":"Schneeschuhe","gr":7,"amount":1,"isTemplateLocked":true,"weight":1,"price":6.5,"stp":7,"template":"ITEMTPL_173"},"ITEM_14":{"id":"ITEM_14","name":"Seife","gr":24,"amount":1,"isTemplateLocked":true,"weight":0.5,"price":1,"stp":4,"template":"ITEMTPL_349"},"ITEM_15":{"id":"ITEM_15","name":"Schwamm","gr":24,"amount":1,"isTemplateLocked":true,"weight":0.1,"price":2,"template":"ITEMTPL_348"},"ITEM_16":{"id":"ITEM_16","name":"Fernrohr, zusammenschiebbar","gr":14,"amount":1,"isTemplateLocked":true,"weight":1,"price":400,"stp":18,"template":"ITEMTPL_410","where":"Truhe"},"ITEM_17":{"id":"ITEM_17","name":"Kompass (Südweiser)","gr":14,"amount":1,"isTemplateLocked":true,"weight":0.25,"price":6,"stp":4,"template":"ITEMTPL_238"},"ITEM_18":{"id":"ITEM_18","name":"Wundnähzeug","gr":9,"amount":1,"isTemplateLocked":true,"weight":0.1,"price":4.5,"template":"ITEMTPL_198"},"ITEM_19":{"id":"ITEM_19","name":"Verband, 10 Stück","gr":9,"amount":1,"isTemplateLocked":true,"weight":0.05,"price":12.5,"stp":3,"template":"ITEMTPL_197"},"ITEM_20":{"id":"ITEM_20","name":"Tagebuch","gr":17,"amount":1,"isTemplateLocked":true,"weight":1.5,"price":11,"template":"ITEMTPL_290"},"ITEM_21":{"id":"ITEM_21","name":"Kohlestift","gr":17,"amount":1,"isTemplateLocked":true,"weight":0.05,"price":0.2,"template":"ITEMTPL_284"},"ITEM_22":{"id":"ITEM_22","name":"Lederrucksack","gr":10,"amount":1,"isTemplateLocked":true,"weight":2,"price":34,"stp":8,"template":"ITEMTPL_205"},"ITEM_23":{"id":"ITEM_23","name":"Trinkhorn","gr":10,"amount":1,"isTemplateLocked":true,"weight":0.25,"price":0.5,"template":"ITEMTPL_211"},"ITEM_26":{"id":"ITEM_26","name":"Wollstrümpfe","gr":6,"amount":1,"isTemplateLocked":true,"weight":0.1,"price":0.5,"template":"ITEMTPL_137"},"ITEM_27":{"id":"ITEM_27","name":"Winterkleidung","gr":4,"amount":1,"isTemplateLocked":true,"weight":2,"enc":0,"pro":1,"template":"ITEMTPL_81","armorType":2},"ITEM_28":{"id":"ITEM_28","name":"Zelt, 1 Person","gr":7,"amount":1,"isTemplateLocked":true,"weight":3,"price":14.5,"stp":7,"template":"ITEMTPL_179"},"ITEM_29":{"id":"ITEM_29","name":"Wirselkraut","gr":22,"amount":5,"isTemplateLocked":true,"price":2.2,"template":"ITEMTPL_316"},"ITEM_30":{"id":"ITEM_30","name":"Leuwagener Dolch","gr":1,"amount":1,"isTemplateLocked":false,"weight":0.5,"price":45,"at":1,"damageDiceNumber":1,"damageFlat":2,"length":30,"pa":0,"combatTechnique":"CT_3","damageDiceSides":6,"reach":1,"template":"ITEMTPL_2","where":"gg. Dämon Belhalal","primaryThreshold":{"threshold":14},"isParryingWeapon":false,"isTwoHandedWeapon":false},"ITEM_31":{"id":"ITEM_31","name":"Dolch der Adelsmarschallin","gr":1,"amount":1,"isTemplateLocked":false,"weight":0.5,"price":45,"at":1,"damageDiceNumber":1,"damageFlat":1,"length":30,"pa":0,"combatTechnique":"CT_3","damageDiceSides":6,"reach":1,"template":"ITEMTPL_2","primaryThreshold":{"threshold":14},"isParryingWeapon":false,"isTwoHandedWeapon":false},"ITEM_32":{"id":"ITEM_32","name":"Tuchrüstung aus valsa aha","gr":4,"amount":1,"isTemplateLocked":false,"weight":1,"price":75,"enc":0,"pro":2,"template":"ITEMTPL_473","where":"RS3 gg. Hieb & ZwHieb","armorType":3}},
        "armorZones":{},
        "purse":{"d":"18","s":"41","h":"","k":""}},
       "rules":{"higherParadeValues":0,"attributeValueLimit":false,"enableAllRuleBooks":true,"enabledRuleBooks":[],"enableLanguageSpecializations":false},
       "pets":{
         */

        // @ts-ignore
        return (
            <View>
                <Text style={styles.heroName}>{characterData.name}</Text>
                {characterData.avatar &&
                    <Image style={styles.avatar} source={{uri: characterData.avatar}} alt={"avatar"}/>}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Attributes</Text>
                    <Attributes locale={locale} characterAttributes={characterData.attr.values}  />
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Held</Text>
                    <View style={styles.sectionContent}>
                        <Personal locale={locale} personal={characterData.pers}
                                  name={characterData.name}
                                  experienceLevel={characterData.el}
                                  race={characterData.r}
                                  raceVariant={characterData.rv}
                                  culture={characterData.c}
                                  profession={characterData.p}
                                  sex={characterData.sex}
                                  ap={characterData.ap.total}
                        />
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Talente</Text>
                    <View style={styles.sectionContent}>
                        <Talents locale={locale}
                                 characterTalents={characterData.talents}
                                 characterAttributes={characterData.attr.values}/>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Vorteile</Text>
                    <View style={styles.sectionContent}>
                        <Text>TODO</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Nachteile</Text>
                    <View style={styles.sectionContent}>
                        <Text>TODO</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Allgemeine Sonderfertigkeiten</Text>
                    <View style={styles.sectionContent}>
                        <Text>TODO</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Ausrüstung</Text>
                    <View style={styles.sectionBelongings}>
                        {
                            Object.keys(characterData.belongings.items).map((key: string, index: number) => (
                                <Text>{characterData.belongings.items[key].name}</Text>
                            ))
                        }
                    </View>
                </View>
            </View>
        )
    }


    return (
        <ScrollView>
            <SafeAreaView style={styles.container}>
                <View style={styles.loadingButtons}>
                    <TouchableOpacity style={styles.button} onPress={loadSample}>
                        <Text style={styles.buttonText}>Load Sample</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.button} onPress={loadCharacterFromPicker}>
                        <Text style={styles.buttonText}>Load Character</Text>
                    </TouchableOpacity>
                </View>

                {error && <Text style={styles.errorMessage}>{error}</Text>}

                <View style={styles.block}>
                    {renderCharacterData()}
                </View>
            </SafeAreaView>
        </ScrollView>
    )
}

export default Character;