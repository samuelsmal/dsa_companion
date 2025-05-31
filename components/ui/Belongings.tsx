import {Modal, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import {useEffect, useState} from "react";
import {RawHero} from "@/constants/types/RawHero";
import {createSections, groupBy} from "@/constants/HelperFunctions";
import {Colors} from "@/constants/Colors";
import {Sizes} from "@/constants/Sizes";
import {CharacterInGame} from "@/constants/types/CharacterInGame";
import {t} from "@/constants/Translate";
import {AntDesign} from "@expo/vector-icons";

type Belonging = RawHero["belongings"]["items"]["id"];
type BelongingProps = {
    locale: string;
    characterBelongings: Belonging[];
    characterInGame: CharacterInGame;
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
        flexDirection: "column",
        alignItems: "baseline",
    },
    itemName: {
        flexGrow: 1,
        flexWrap: "wrap",
        padding: 2,
    },
    itemValue: {
        padding: 2,
    },
    checks: {
        flexDirection: "row",
        columnGap: 5,
    },
    check: {
        borderWidth: 1,
        padding: 2,
        width: Sizes.attributeValue * 1.5,
        fontSize: Sizes.attributeValue,
    },
    checkValue: {
        alignContent: "center",
        alignSelf: "center",
        fontSize: Sizes.attributeValue - 4,
    },
    checkSuccess: {
        backgroundColor: "green",
    },
    checkFailure: {
        backgroundColor: "red",
    },
    sectionTitle: {
        fontSize: Sizes.sectionTitle - 2,
        fontWeight: "bold",
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
    modalCheck: {
        flexDirection: "column",
        rowGap: 5,
    },
    modalCheckNumbers: {
        flexDirection: "row",
        justifyContent: "center",
    },
    modalCheckNumbersValues: {
        flexDirection: "row",
        justifyContent: "center",
        columnGap: 5,
    },
    modalCheckNumbersTitle: {
        flexGrow: 1,
    },
    modalCheckNumbersTitleText: {
        fontSize: Sizes.attributeValue,
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
    checkSuccessText: {
        color: "green",
    },
    checkFailureText: {
        color: "red",
    },
    modalResult: {
        paddingTop: 5,
        paddingBottom: 5,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        alignItems: "center",
    },
    sectionHeader: {
        marginBottom: 5,
    },
    buttonModifyInc: {
        backgroundColor: "black",
        borderRadius: "50%",
        borderWidth: 1,
    },
    buttonModifyDec: {
        backgroundColor: "black",
        borderRadius: "50%",
        borderWidth: 1,
    },
    belongingAttribute: {
        borderWidth: 1,
        borderColor: "black",
        width: Sizes.attributeValue,
    }
})


const Belongings = (props: BelongingProps) => {
    const db = useSQLiteContext();

    const [equipmentGroups, setEquipmentGroups] = useState<Map<number, string>>()
    const [infoModal, setInfoModal] = useState<{ isVisible: boolean, elementOfInterest: Belonging | null }>({
        isVisible: false,
        elementOfInterest: null,
    })

    useEffect(() => {
        async function setup() {

            const equipmentGroups = await db.getAllAsync<{ id: number, name: string }>(
                "SELECT id, name FROM " + props.locale + "__equipment_groups"
            );

            setEquipmentGroups(new Map(equipmentGroups.map(x => [x.id, x.name])));
        }

        setup();
    }, [])

    const renderInfoModal = () => {
        if (infoModal.elementOfInterest !== null) {
            return (
                <View style={styles.modalContainer}>
                    <View style={styles.modalInnerContainer}>
                        <View style={styles.modalTitle}>
                            <View>
                                <Text style={styles.modalTitleText}>{infoModal.elementOfInterest.name}</Text>
                            </View>
                        </View>
                        <ScrollView>
                            <View style={{flexDirection: "column"}}>
                                {["price", "amount", "weight", "combatTechnique",
                                    "reach", "length", "range", "reloadTime",
                                    "where", "iniMod"].map(attr => {
                                        if (infoModal.elementOfInterest[attr]) {
                                            return <View key={"belonging__spells__info__" + attr}>
                                                <Text
                                                    style={{fontSize: Sizes.attributeName}}>{t.get(attr)}</Text>
                                                <Text
                                                    style={{fontSize: Sizes.attributeValue - 4}}>{infoModal.elementOfInterest[attr]}</Text>
                                            </View>
                                        }
                            })}
                            </View>
                        </ScrollView>
                        <View style={styles.modalButton}>
                            <TouchableOpacity
                                onPress={() => setInfoModal({isVisible: false, elementOfInterest: null})}
                                style={styles.modalButtonDone}>
                                <AntDesign name="checkcircle" size={24} color="black"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        }
    }

    const renderItems = (items: Belonging[]) => {
        return items.map((item: Belonging) => (
            <Pressable key={"belonging_pressable__" + item.id}
                       onPress={() => setInfoModal({isVisible: true, elementOfInterest: item})}
                       style={styles.item}>
                <View style={{flexDirection: "row"}}>
                    <View style={[styles.belongingAttribute, {flexGrow: 1}]}>
                        <Text style={styles.name}>{item.name}</Text>
                    </View>
                    <View style={styles.belongingAttribute}>
                        <Text style={styles.value}>{item.amount}</Text>
                    </View>
                </View>
            </Pressable>
        ))
    }

    return (
        <View style={styles.container}>
            <Modal
                visible={infoModal.isVisible}
                transparent={true}
                onRequestClose={() => setInfoModal({isVisible: false, elementOfInterest: null})}
            >
                {renderInfoModal()}
            </Modal>
            <View style={styles.sectionContainer}>
                {equipmentGroups && createSections(groupBy(props.characterBelongings,
                    ({gr}) => equipmentGroups.get(gr))).map(({title, data}) => (
                    <View>
                        <View style={styles.sectionHeader} key={"title_" + title}>
                            <Text style={styles.sectionTitle}>{title}</Text>
                            <Text>{data.map(({
                                                 amount,
                                                 weight
                                             }) => (amount || 1) * (weight || 0)).reduce((acc, val) => acc + val, 0).toFixed(2)}</Text>
                        </View>
                        <View style={styles.items}>{renderItems(data)}</View>
                    </View>
                ))}
            </View>
        </View>
    )
}

export default Belongings
