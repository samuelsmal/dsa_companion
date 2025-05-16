import {Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import {useEffect, useState} from "react";
import {RawHero} from "@/constants/types/RawHero";
import {createSections, generateRandomInteger, groupBy} from "@/constants/HelperFunctions";
import {AttributeColors, Colors} from "@/constants/Colors";
import {AntDesign, MaterialIcons} from "@expo/vector-icons";
import {getAttributeNames, getCantrips} from "@/constants/OptolithDatabase";
import {Sizes} from "@/constants/Sizes";
import {CharacterInGame} from "@/constants/types/CharacterInGame";
import {AbilityAttribute, AbilityCheck, calculateResult} from "@/constants/types/AbilityCheck";
import {t} from "@/constants/Translate";

type CantripProps = {
    locale: string;
    characterCantrips: RawHero["cantrips"];
}

type Cantrip = {
    id: string
    name: string
    effect: string
    range: string
    duration: string
    target: string
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    sectionContainer: {
        padding: 2,
        flexDirection: "column",
        flexGrow: 1,
        rowGap: 5,
    },
    name: {
        fontSize: 18,
    },
    value: {
        fontSize: 18,
        textAlign: "right",
    },
    items: {
        rowGap: 5,
    },
    item: {
        flexDirection: "row",
        alignItems: "baseline",
    },
    itemName: {
        flexGrow: 1,
        flexWrap: "wrap",
        padding: 2,
    },
    modalContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        backgroundColor: Colors.light.backgroundNotFocus,
    },
    modalInnerContainer: {
        width: "100%",
        backgroundColor: Colors.light.backgroundFocus,
        padding: 30,
        rowGap: 5
    },
    modalTitle: {
        flexDirection: "row",
        flexWrap: "wrap",
        alignItems: "baseline",
        columnGap: 5,
        borderBottomWidth: 1,
        paddingBottom: 5,
    },
    modalTitleText: {
        fontSize: Sizes.sectionTitle,
    },
    modalBoxedNumber: {
        borderWidth: 1,
        borderColor: "black",
        width: Sizes.attributeValue * 2,
    },
    modalBoxedNumberText: {
        textAlign: "center",
        fontSize: Sizes.attributeValue,
    },
    modalButton: {},
    modalButtonDone: {
        alignItems: 'center',
        backgroundColor: '#DDDDDD',
        padding: 10,
    },
    abilityCheckExplanation: {
        flexDirection: "column",
        rowGap: 5,
        fontSize: Sizes.attributeValue,
        alignItems: "center",
    },
    modalTitleTextAbility: {
        fontSize: Sizes.attributeValue + 2,
        fontWeight: "bold",
    },
    modalTitleAbilityValue: {
        flexDirection: "row",
    },
    modalTitleAbilityValueText: {
        fontSize: Sizes.attributeValue,
        textDecorationLine: "underline"
    },
    sectionHeader: {
        marginBottom: 5,
    },
})

const Cantrips = (props: CantripProps) => {
    const db = useSQLiteContext();

    const [cantrips, setCantrips] = useState<Cantrip[]>([])

    const [infoModal, setInfoModal] = useState<{ isVisible: boolean, cantripOfInterest: Cantrip | null}>({
        isVisible: false,
        cantripOfInterest: null
    })

    useEffect(() => {
        async function setup() {
            setCantrips(await getCantrips(db, props.locale, props.characterCantrips));
        }

        setup();
    }, [])

    const renderItems = (items: Cantrip[]) => {
        return items.map((item: Cantrip) => (
            <View style={styles.item} key={"cantrip__" + item.id}>
                <Pressable style={{flexDirection: "column", flexGrow: 1, paddingRight: Sizes.columnGap}}
                           key={"pressable__cantrip__info__" + item.id}
                           onPress={() => {
                               setInfoModal({
                                   isVisible: true,
                                   cantripOfInterest: item,
                               })
                           }}>
                    <View style={{flexDirection: "row"}}>
                        <View style={{flexGrow: 1}}>
                            <Text style={styles.name}>{item.name}</Text>
                        </View>
                    </View>
                </Pressable>
            </View>
        ))
    }

    const renderInfoModal = () => {
        if (infoModal.cantripOfInterest !== null) {
            return (
                <View style={styles.modalContainer}>
                    <View style={styles.modalInnerContainer}>
                        <View style={styles.modalTitle}>
                            <View>
                                <Text style={styles.modalTitleText}>{infoModal.cantripOfInterest.name}</Text>
                            </View>
                        </View>
                        <ScrollView>
                            <View style={{flexDirection: "column"}}>
                                {[
                                    "range",
                                    "duration",
                                    "effect",
                                ].map(attr => (
                                    <View key={"spells__info__" + attr}>
                                        <Text
                                            style={{fontSize: Sizes.attributeName}}>{t.get(attr)}</Text>
                                        <Text
                                            style={{fontSize: Sizes.attributeValue - 4}}>{infoModal.cantripOfInterest[attr]}</Text>
                                    </View>
                                ))}
                            </View>
                        </ScrollView>
                        <View style={styles.modalButton}>
                            <TouchableOpacity
                                onPress={() => setInfoModal({isVisible: false, cantripOfInterest: null})}
                                style={styles.modalButtonDone}>
                                <AntDesign name="checkcircle" size={24} color="black"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        }
    }


    return (
        <View style={styles.container}>
            <Modal
                visible={infoModal.isVisible}
                transparent={true}
                onRequestClose={() => setInfoModal({isVisible: false, cantripOfInterest: null})}
            >
                {renderInfoModal()}
            </Modal>
            <View style={styles.sectionContainer}>
                {renderItems(cantrips)}
            </View>
        </View>
    )
}

export default Cantrips
