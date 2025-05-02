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

        return (
            <View>
                <Text style={styles.heroName}>{characterData.name}</Text>
                {characterData.avatar &&
                    <Image style={styles.avatar} source={{uri: characterData.avatar}} alt={"avatar"}/>}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Attributes</Text>
                    <Attributes locale={locale} characterAttributes={characterData.attr.values} lp={characterData.attr.lp}  />
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