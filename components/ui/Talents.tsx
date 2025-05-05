import {Modal, Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import {useEffect, useState} from "react";
import {RawHero} from "@/constants/types/RawHero";
import {createSections, generateRandomInteger, groupBy} from "@/constants/HelperFunctions";
import {AttributeColors, Colors} from "@/constants/Colors";
import {AntDesign, MaterialIcons} from "@expo/vector-icons";
import {getAttributeNames, getTalents} from "@/constants/OptolithDatabase";

type TalentProps = {
    locale: string;
    characterTalents: RawHero["talents"];
    characterAttributes: RawHero["attr"]["values"];
}

type Talent = {
    id: string
    name: string
    check1: string,
    check2: string,
    check3: string,
    value: number | undefined
    group: number
    groupName: string
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
        fontSize: 16,
    },
    value: {
        fontSize: 16,
    },
    items: {
        rowGap: 5,
    },
    item: {
        flexDirection: "row",
        columnGap: 5,
        alignContent: "center",
    },
    itemName: {
        flexGrow: 1,
        padding: 2
    },
    itemValue: {
        padding: 2
    },
    checks: {
        flexDirection: "row",
        columnGap: 5,
    },
    check: {
        borderWidth: 1,
        padding: 2,
    },
    checkValue: {
        alignContent: "center",
        alignSelf: "center",
    },
    checkSuccess: {
        backgroundColor: "green",
    },
    checkFailure: {
        backgroundColor: "red",
    },
    sectionTitle: {
        fontSize: 18,
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
        width: "70%",
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
        fontSize: 14,
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
        fontSize: 16,
    },
    modalBoxedNumber: {
        borderWidth: 1,
        borderColor: "black",
        width: 25,
    },
    modalBoxedNumberText: {
        textAlign: "center",
    },
    modalButton: {},
    modalButtonDone: {
        alignItems: 'center',
        backgroundColor: '#DDDDDD',
        padding: 10,
    },
    abilityCheckExplanation: {
        flexDirection: "row",
        columnGap: 5,
    },
    modalTitleTextAbility: {
        fontSize: 18,
        fontWeight: "bold",
    },
    modalTitleAbilityValue: {
        flexDirection: "row",
    },
    modalTitleAbilityValueText: {
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
    }
})

type AbilityAttribute = {
    id: string;
    name: string;
    value: number;
    diceValue: number;
    result: number
}

type AbilityCheck = {
    abilityId: string;
    abilityName: string;
    abilityType: string;
    abilityValue: number;
    attributes: AbilityAttribute[];
    difficulty: number;
    resultNumber: number;
    result: number;
}

const Talents = (props: TalentProps) => {
    const db = useSQLiteContext();

    const [talents, setTalents] = useState<Talent[]>([])
    const [attrs, setAttrs] = useState<Map<string, { value: number, name: string }>>()

    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [abilityCheck, setAbilityCheck] = useState<AbilityCheck | null>(null)

    useEffect(() => {
        async function setup() {
            const attributeNames = await getAttributeNames(db, props.locale);

            setAttrs(new Map<string, { value: number, name: string }>(
                props.characterAttributes.map(item => {
                    // Super annoying type polymorphism
                    if (item instanceof Array) {
                        return [item[0], {value: item[1], name: attributeNames.get(item[0]) || ""}];
                    } else {
                        return [item.id, {value: item.value, name: attributeNames.get(item.id) || ""}];
                    }
                })
            ))

            const allTalents = await getTalents(db, props.locale);

            const givenTalents = new Map<string, number>(
                Object.keys(props.characterTalents).map(k => [k, props.characterTalents[k]]));

            setTalents(allTalents.map(val => ({
                id: val.id,
                name: val.skillName,
                check1: val.check1,
                check2: val.check2,
                check3: val.check3,
                group: val.gr,
                groupName: val.groupName,
                value: givenTalents.get(val.id) || 0,
            })))
        }

        setup();
    }, [])

    const renderItems = (items: Talent[]) => {
        return items.map((item: Talent) => (
            <Pressable key={"pressable_" + item.id} onPress={() => {
                const attributes = [item.check1, item.check2, item.check3]
                    .map(checkId => ({
                        id: checkId,
                        name: attrs?.get(checkId)?.name || "",
                        value: attrs?.get(checkId)?.value || 0,
                        diceValue: generateRandomInteger(),
                        result: 0
                    }))

                setAbilityCheck(calculateResult({
                    abilityId: item.id,
                    abilityName: item.name,
                    abilityType: "TALENT",
                    abilityValue: item.value || 0,
                    attributes: attributes,
                    difficulty: 0,
                    resultNumber: 0,
                    result: 0
                }))
                setModalVisible(true)
            }}>
                <View style={styles.item} key={item.id}>
                    <View style={styles.itemName}>
                        <Text style={styles.name}>{item.name}</Text>
                    </View>
                    <View style={styles.itemValue}>
                        <Text style={styles.value}>{item.value}</Text>
                    </View>
                    <View style={styles.checks}>
                        {
                            [item.check1, item.check2, item.check3].map((checkId, index) => {
                                return (
                                    <View style={[styles.check, {backgroundColor: AttributeColors.get(checkId)?.main}]}
                                          key={"talents__check__item__" + item.id + index}
                                    >
                                        <Text style={[styles.checkValue, {color: AttributeColors.get(checkId)?.text}]}>
                                            {attrs?.get(item.check1)?.value}
                                        </Text>
                                    </View>
                                )
                            })
                        }
                    </View>
                </View>
            </Pressable>
        ))
    }

    const modifyDifficulty = (operator: string) => {
        setAbilityCheck(prevAbilityCheck => {
            if (prevAbilityCheck === null) {
                return null;
            }

            return calculateResult({
                ...prevAbilityCheck,
                difficulty: operator === "inc" ? prevAbilityCheck.difficulty + 1 : prevAbilityCheck.difficulty - 1,
            });
        })
    }

    const calculateResult = (abilityCheck: AbilityCheck | null): AbilityCheck | null => {
        if (abilityCheck === null) {
            return null
        }

        const attributes = abilityCheck.attributes.map(attribute => {
            return {
                ...attribute,
                result: Math.max(0, attribute.diceValue - attribute.value + abilityCheck.difficulty)
            }
        })

        const resultNumber = (abilityCheck.abilityValue || 0)
            - attributes.map(({result}) => result).reduce((a, b) => a + b, 0)
        ;

        let overallResult = resultNumber / 3;
        overallResult = overallResult < 0 ? -1 : Math.ceil(overallResult);
        overallResult = overallResult == 0 ? 1 : overallResult;
        overallResult = Math.min(6, overallResult);

        return {
            ...abilityCheck,
            attributes: attributes,
            resultNumber: resultNumber,
            result: overallResult
        }
    }

    const renderElements = (fnName: string, fn: (abilityAttribute: AbilityAttribute) => string | number | undefined) => {
        return abilityCheck?.attributes.map((attribute: AbilityAttribute, index) => {
            return (
                <View style={[styles.modalBoxedNumber, {backgroundColor: AttributeColors.get(attribute.id)?.main}]}
                      key={"check__" + fnName + index}>
                    <Text style={[styles.modalBoxedNumberText, {color: AttributeColors.get(attribute.id)?.text}]}>
                        {fn(attribute)}
                    </Text>
                </View>
            )
        })
    }

    const renderResults = () => {
        return abilityCheck?.attributes.map(({result}, index) => {
            return <View style={[styles.modalBoxedNumber, {backgroundColor: result >= 0 ? "green" : "red"}]}
                         key={"check__result_" + index}>
                <Text style={[styles.modalBoxedNumberText, {color: "white"}]}>
                    {result}
                </Text>
            </View>
        })
    }

    const renderOverallResult = () => {
        if (abilityCheck === null) {
            return
        }

        if (abilityCheck.attributes.filter(({diceValue}) => diceValue === 20).length >= 2) {
            return (
                <View style={styles.abilityCheckExplanation}>
                    <Text>Kritischer Patzer!</Text>
                </View>
            )
        }

        if (abilityCheck.attributes.filter(({diceValue}) => diceValue === 1).length >= 2) {
            return (
                <View style={styles.abilityCheckExplanation}>
                    <Text>Kritischer Erfolg!</Text>
                </View>
            )
        }

        return (
            <View style={styles.abilityCheckExplanation}>
                <Text style={styles.modalTitleAbilityValueText}>{abilityCheck.abilityValue}</Text>
                {
                    abilityCheck.attributes.map(({id, result}, index) => {
                        return (
                            <Text key={"explanation__" + index} style={{color: AttributeColors.get(id)?.main}}>
                                - {result}
                            </Text>
                        )
                    })
                }
                <Text>
                    {"= " + abilityCheck.resultNumber}
                </Text>
                <AntDesign name="arrowright" size={16} color="black"/>
                <Text style={abilityCheck.result > 0 ? styles.checkSuccessText : styles.checkFailureText}>
                    {abilityCheck.result < 0 ? "Not passed" : "QS" + abilityCheck.result}
                </Text>
            </View>
        )
    }

    const renderCheckModal = () => {
        return (
            <View style={styles.modalContainer}>
                <View style={styles.modalInnerContainer}>
                    <View style={styles.modalTitle}>
                        <View>
                            <Text style={styles.modalTitleText}>
                                Probe auf
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.modalTitleTextAbility}>
                                {abilityCheck?.abilityName}
                            </Text>
                        </View>
                        <View style={styles.modalTitleAbilityValue}>
                            <Text style={styles.modalTitleAbilityValueText}>
                                {"(FW: " + abilityCheck?.abilityValue + ")"}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.modalCheck}>
                        <View style={styles.modalCheckNumbers}>
                            <View style={styles.modalCheckNumbersTitle}>
                                <Text style={styles.modalCheckNumbersTitleText}>
                                    Fertigkeiten:
                                </Text>
                            </View>
                            <View style={styles.modalCheckNumbersValues}>
                                {renderElements("dice", (abilityAttribute: AbilityAttribute) => abilityAttribute.name)}
                            </View>
                        </View>
                        <View style={styles.modalCheckNumbers}>
                            <View style={styles.modalCheckNumbersTitle}>
                                <Text style={styles.modalCheckNumbersTitleText}>
                                    Werte:
                                </Text>
                            </View>
                            <View style={styles.modalCheckNumbersValues}>
                                {renderElements("dice", (abilityAttribute: AbilityAttribute) => abilityAttribute.value)}
                            </View>
                        </View>
                        <View style={styles.modalCheckNumbers}>
                            <View style={styles.modalCheckNumbersTitle}>
                                <Text style={styles.modalCheckNumbersTitleText}>
                                    Würfel:
                                </Text>
                            </View>
                            <View style={styles.modalCheckNumbersValues}>
                                {renderElements("dice", (abilityAttribute: AbilityAttribute) => abilityAttribute.diceValue)}
                            </View>
                        </View>
                        <View style={styles.modalCheckNumbers}>
                            <View style={styles.modalCheckNumbersTitle}>
                                <Text style={styles.modalCheckNumbersTitleText}>
                                    Modifikation:
                                </Text>
                                <View style={{flexDirection: "row", justifyContent: "center", columnGap: 10}}>
                                    <TouchableOpacity onPress={() => modifyDifficulty("inc")}
                                                      style={styles.buttonModifyInc}>
                                        <MaterialIcons name="exposure-plus-1" size={24} color="white" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => modifyDifficulty("dec")}
                                                      style={styles.buttonModifyDec}>
                                        <MaterialIcons name="exposure-minus-1" size={24} color="white" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={[styles.modalCheckNumbersValues, {alignItems: "flex-start"}]}>
                                {renderElements("dice", (abilityAttribute: AbilityAttribute) => abilityCheck?.difficulty)}
                            </View>
                        </View>
                        <View style={styles.modalCheckNumbers}>
                            <View style={styles.modalCheckNumbersTitle}>
                                <Text style={styles.modalCheckNumbersTitleText}>
                                    Kompensation:
                                </Text>
                            </View>
                            <View style={styles.modalCheckNumbersValues}>
                                {renderResults()}
                            </View>
                        </View>
                    </View>
                    <View style={styles.modalResult}>
                        {renderOverallResult()}
                    </View>
                    <View style={styles.modalButton}>
                        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.modalButtonDone}>
                            <AntDesign name="checkcircle" size={24} color="black"/>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            <Modal
                visible={modalVisible}
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                {renderCheckModal()}
            </Modal>
            <View style={styles.sectionContainer}>
                {createSections(groupBy(talents, ({groupName}) => groupName)).map(({title, data}) => (
                    <View>
                        <View style={styles.sectionHeader} key={"title_" + title}>
                            <Text style={styles.sectionTitle}>{title}</Text>
                        </View>
                        <View style={styles.items}>{renderItems(data)}</View>
                    </View>
                ))}
            </View>
        </View>
    )
}

export default Talents
