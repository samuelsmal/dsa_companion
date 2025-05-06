import {Modal, Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import {useEffect, useState} from "react";
import {RawHero} from "@/constants/types/RawHero";
import {createSections, generateRandomInteger, groupBy} from "@/constants/HelperFunctions";
import {AttributeColors, Colors} from "@/constants/Colors";
import {AntDesign, MaterialIcons} from "@expo/vector-icons";
import {getAttributeNames, getSpells} from "@/constants/OptolithDatabase";
import {Sizes} from "@/constants/Sizes";
import {CharacterInGame} from "@/constants/types/CharacterInGame";

type SpellProps = {
    locale: string;
    characterSpells: RawHero["spells"];
    characterAttributes: RawHero["attr"]["values"];
    characterInGame: CharacterInGame;
}

type Spell = {
    id: string
    name: string
    check1: string,
    check2: string,
    check3: string,
    value: number | undefined
    group: number
    groupName: string
    effect: string
    castingTime: string
    aeCost: string
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
        flexDirection: "row",
        columnGap: 5,
        fontSize: Sizes.attributeValue,
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

const Spells = (props: SpellProps) => {
    const db = useSQLiteContext();

    const [spells, setSpells] = useState<Spell[]>([])
    const [attrs, setAttrs] = useState<Map<string, { value: number, name: string }>>()

    const [checkModalVisible, setCheckModalVisible] = useState<boolean>(false)
    const [infoModal, setInfoModal] = useState<{ isVisible: boolean, spellOfInterest: Spell | null }>({
        isVisible: false,
        spellOfInterest: null
    })
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

            const allSpells = await getSpells(db, props.locale);
            const spells = new Map(allSpells.map(spell => [spell.id, spell]))

            const givenSpells = Object.keys(props.characterSpells).map(k => ({
                id: k,
                name: spells.get(k)?.spellName,
                check1: spells.get(k)?.check1,
                check2: spells.get(k)?.check2,
                check3: spells.get(k)?.check3,
                group: spells.get(k)?.gr,
                groupName: spells.get(k)?.groupName,
                effect: spells.get(k)?.effect,
                castingTime: spells.get(k)?.castingTime,
                aeCost: spells.get(k)?.aeCost,
                range: spells.get(k)?.range,
                duration: spells.get(k)?.duration,
                target: spells.get(k)?.target,
                value: props.characterSpells[k]
            }));

            setSpells(givenSpells);
        }

        setup();
    }, [])

    const renderItems = (items: Spell[]) => {
        return items.map((item: Spell) => (
            <View style={styles.item} key={"spell__" + item.id}>
                <Pressable style={{flexDirection: "row", borderColor: "red", borderWidth: 1, flexGrow: 1}} key={"pressable__spell__info__" + item.id}
                           onPress={() => {
                               setInfoModal({
                                   isVisible: true,
                                   spellOfInterest: item,
                               })
                           }}>
                    <View style={{flexDirection: "row",borderColor: "blue", borderWidth: 1}}>
                        <View>
                            <Text style={styles.name}>{item.name}</Text>
                        </View>
                        <View>
                            <Text style={styles.value}>{item.value}</Text>
                        </View>
                    </View>
                </Pressable>
                <Pressable style={{borderColor: "green", borderWidth: 1}} key={"pressable__spell__check__" + item.id} onPress={() => {
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
                        abilityType: "SPELL",
                        abilityValue: item.value || 0,
                        attributes: attributes,
                        difficulty: 0,
                        resultNumber: 0,
                        result: 0
                    }))
                    setCheckModalVisible(true)
                }}>
                    <View style={styles.checks}>
                        {
                            [item.check1, item.check2, item.check3].map((checkId, index) => {
                                return (
                                    <View style={[styles.check, {backgroundColor: AttributeColors.get(checkId)?.main}]}
                                          key={"spells__check__item__" + item.id + index}
                                    >
                                        <Text style={[styles.checkValue, {color: AttributeColors.get(checkId)?.text}]}>
                                            {attrs?.get(item.check1)?.value}
                                        </Text>
                                    </View>
                                )
                            })
                        }
                    </View>

                </Pressable>
            </View>
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
                            <Text key={"explanation__" + index}
                                  style={{fontSize: Sizes.attributeValue, color: AttributeColors.get(id)?.main}}>
                                - {result}
                            </Text>
                        )
                    })
                }
                <Text style={{fontSize: Sizes.attributeValue}}>
                    {"= " + abilityCheck.resultNumber}
                </Text>
                <AntDesign name="arrowright" size={Sizes.attributeValue} color="black"/>
                <Text
                    style={[{fontSize: Sizes.attributeValue}, abilityCheck.result > 0 ? styles.checkSuccessText : styles.checkFailureText]}>
                    {abilityCheck.result < 0 ? "Nicht bestanden!" : "QS" + abilityCheck.result}
                </Text>
            </View>
        )
    }
    const renderInfoModal = () => {
        if (infoModal.spellOfInterest !== null) {
            return (
                <View style={styles.modalContainer}>
                    <View style={styles.modalInnerContainer}>
                        <View style={styles.modalTitle}>
                            <View>
                                <Text style={styles.modalTitleText}>{infoModal.spellOfInterest.name}</Text>
                            </View>
                        </View>
                        <View style={{flexDirection: "column"}}>
                            <View>
                                <Text>Kosten:</Text>
                                <Text>{infoModal.spellOfInterest.aeCost}</Text>
                            </View>
                            <View>
                                <Text>Zauberdauer:</Text>
                                <Text>{infoModal.spellOfInterest.duration}</Text>
                            </View>
                            <View>
                                <Text>Reichweite:</Text>
                                <Text>{infoModal.spellOfInterest.range}</Text>
                            </View>
                            <View>
                                <Text>Wirkungsdauer:</Text>
                                <Text>{infoModal.spellOfInterest.duration}</Text>
                            </View>
                            <View>
                                <Text>Effekt:</Text>
                                <Text>{infoModal.spellOfInterest.effect}</Text>
                            </View>
                        </View>
                        <View style={styles.modalButton}>
                            <TouchableOpacity onPress={() => setInfoModal({isVisible: false, spellOfInterest: null})}
                                              style={styles.modalButtonDone}>
                                <AntDesign name="checkcircle" size={24} color="black"/>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            )
        }
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
                                        <MaterialIcons name="exposure-plus-1" size={24} color="white"/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => modifyDifficulty("dec")}
                                                      style={styles.buttonModifyDec}>
                                        <MaterialIcons name="exposure-minus-1" size={24} color="white"/>
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
                        <TouchableOpacity onPress={() => setCheckModalVisible(false)} style={styles.modalButtonDone}>
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
                visible={checkModalVisible}
                transparent={true}
                onRequestClose={() => setCheckModalVisible(false)}
            >
                {renderCheckModal()}
            </Modal>
            <Modal
                visible={infoModal.isVisible}
                transparent={true}
                onRequestClose={() => setInfoModal({isVisible: false, spellOfInterest: null})}
            >
                {renderInfoModal()}
            </Modal>
            <View style={styles.sectionContainer}>
                {createSections(groupBy(spells, ({groupName}) => groupName)).map(({title, data}) => (
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

export default Spells
