import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useState} from "react";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import {SafeAreaView} from "react-native-safe-area-context";
import {RawHero} from "@/constants/types/RawHero";
import Attributes from "@/components/ui/Attributes";
import Personal from "@/components/ui/Personal";
import Talents from "@/components/ui/Talents";
import {useSQLiteContext} from "expo-sqlite";
import {CharacterInGame} from "@/constants/types/CharacterInGame";
import {getCharacterInGame} from "@/constants/Storage";
import {Sizes} from "@/constants/Sizes";
import LinedText from "@/components/ui/LineText";
import Spells from "@/components/ui/Spells";
import Vantages from "@/components/ui/Vantages";
import {t} from "@/constants/Translate";
import Cantrips from "@/components/ui/Cantrips";
import Belongings from "@/components/ui/Belongings";

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
        backgroundColor: 'black',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
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
        fontSize: Sizes.sectionTitle,
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
        color: 'white',
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
    const db = useSQLiteContext();
    const [characterData, setCharacterData] = useState<RawHero | null>(null);
    const [characterInGame, setCharacterInGame] = useState<CharacterInGame | null>(null);
    const [locale, setLocale] = useState<string>("de_de");
    const [error, setError] = useState<string | null>(null);

    const modifyInGameAttribute = (attributeName: string, operation: string) => {
        if (characterInGame !== null) {
            if (operation === "inc") {
                // TODO save this to storage as well
                setCharacterInGame(cig => {
                    // might not be the best code... but I am lazy
                    let next = {...cig};
                    next[attributeName] = {
                        current: Math.min(cig[attributeName].max, cig[attributeName].current + 1),
                        max: cig[attributeName].max
                    };

                    return next;
                })
            } else if (operation === "dec") {
                setCharacterInGame(cig => {
                    let next = {...cig};
                    next[attributeName] = {
                        current: Math.max(0, cig[attributeName].current - 1),
                        max: cig[attributeName].max
                    };

                    return next;
                })
            }
        }
    }

    const modifyPurse = (coinType: string, operation: string) => {
        if (characterInGame !== null) {
            if (operation === "inc") {
                setCharacterInGame(cig => {
                        let newPurse = cig?.purse

                        if (newPurse) {
                            newPurse[coinType] = Math.max(0, newPurse[coinType] + 1)
                        }

                        return {
                            ...cig,
                            purse: newPurse
                        }
                    }
                )
            } else if (operation === "dec") {
                setCharacterInGame(cig => {
                        let newPurse = cig?.purse

                        if (newPurse) {
                            newPurse[coinType] = Math.max(0, newPurse[coinType] - 1)
                        }

                        return {
                            ...cig,
                            purse: newPurse
                        }
                    }
                )
            }
        }
    }

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
                setCharacterInGame(await getCharacterInGame(db, jsonData));
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
        setCharacterInGame(await getCharacterInGame(db, data));
        setLocale((data.locale?.replaceAll("-", "_") || "de_de").toLocaleLowerCase());
    }

    const renderCharacterData = () => {
        if (!characterData) return null;

        return (
            <View>
                <View style={styles.heroTitle}>
                    <View style={{flexGrow: 1}}>
                        <Text style={styles.heroName}>{characterData.name}</Text>
                    </View>
                    {characterData.avatar &&
                        <Image style={styles.avatar} source={{uri: characterData.avatar}} alt={"avatar"}/>}
                </View>
                <View style={styles.section}>
                    <LinedText text={"Attribute"}/>
                    <Attributes locale={locale}
                                characterAttributes={characterData.attr.values}
                                characterInGame={characterInGame}
                                onAttributeChange={modifyInGameAttribute}
                                onPurseChange={modifyPurse}
                    />
                </View>
                <View style={styles.section}>
                    <LinedText text={"Persönliche Daten"}/>
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
                    <LinedText text={"Vorteile"}/>
                    <View style={styles.sectionContent}>
                        <Vantages locale={locale} characterVantages={characterData.activatable}/>
                    </View>
                </View>

                <View style={styles.section}>
                    <LinedText text={"Nachteile"}/>
                    <View style={styles.sectionContent}>
                        <Text>TODO</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <LinedText text={"Allgemeine Sonderfertigkeiten"}/>
                    <View style={styles.sectionContent}>
                        <Text>TODO</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <LinedText text={"Talente"}/>
                    <View style={styles.sectionContent}>
                        <Talents locale={locale}
                                 characterTalents={characterData.talents}
                                 characterAttributes={characterData.attr.values}/>
                    </View>
                </View>

                {
                    characterInGame && characterInGame.asp.max > 0 && (
                        <View style={styles.section}>
                            <LinedText text={"Zauber & Rituale"}/>
                            <View style={styles.sectionContent}>
                                <Spells locale={locale}
                                        characterSpells={characterData.spells}
                                        characterAttributes={characterData.attr.values}
                                        characterInGame={characterInGame}
                                />
                            </View>
                        </View>
                    )
                }

                {
                    characterData && characterData.cantrips.length > 0 && (
                        <View style={styles.section}>
                            <LinedText text={t.get("cantrips")}/>
                            <View style={styles.sectionContent}>
                                <Cantrips locale={locale}
                                          characterCantrips={characterData.cantrips}
                                />
                            </View>
                        </View>
                    )
                }

                <View style={styles.section}>
                    <LinedText text={"Allgemeine Sonderfertigkeiten"}/>
                    <View style={styles.sectionContent}>
                        <Text>TODO</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <LinedText text={"Ausrüstung"}/>
                    <View style={styles.sectionContent}>
                        <Belongings locale={locale}
                                    characterInGame={characterInGame}
                                    characterBelongings={Object.values(characterData.belongings.items)}/>
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