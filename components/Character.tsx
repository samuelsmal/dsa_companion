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
                    <Text style={styles.sectionTitle}>Attribute</Text>
                    <Attributes locale={locale}
                                characterAttributes={characterData.attr.values}
                                characterInGame={characterInGame}
                                onAttributeChange={modifyInGameAttribute}
                    />
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