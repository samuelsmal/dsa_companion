import {Modal, Pressable, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import {useEffect, useState} from "react";
import {RawHero} from "@/constants/types/RawHero";
import {createSections, generateRandomInteger, groupBy} from "@/constants/HelperFunctions";
import {AttributeColors, Colors} from "@/constants/Colors";
import {AntDesign} from "@expo/vector-icons";

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
        borderColor: "green",
    },
    checkFailure: {
        borderColor: "red",
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
    }
})

type AbilityCheck = {
    abilityId: string;
    abilityName: string;
    abilityType: string;
    abilityValue: number;
    attributes: { id: string, name:string, value: number, diceValue: number, result: number }[];
    difficulty: number;
    resultNumber: number;
    result: number;
}

const Talents = (props: TalentProps) => {
    const db = useSQLiteContext();

    const [talents, setTalents] = useState<Talent[]>([])
    const [attrs, setAttrs] = useState<Map<string, {value:number, name:string}>>()

    const [modalVisible, setModalVisible] = useState<boolean>(false)
    const [abilityCheck, setAbilityCheck] = useState<AbilityCheck | null>(null)

    useEffect(() => {
        async function setup() {
            const attributeNames= await db.getAllAsync<{ id: string, name: string }>(
                "SELECT id, short as name FROM '" + props.locale + "__attributes' ORDER BY id"
            );

            const attributeNamesMap = new Map(attributeNames.map(item => [item.id, item.name]))

            setAttrs(new Map<string, {value: number, name: string}>(
                props.characterAttributes.map(item =>
                    [item.id, {value: item.value, name: attributeNamesMap.get(item.id) || ""}])
            ))

            const allTalents = await db.getAllAsync<{
                id: string,
                check1: string,
                check2: string,
                check3: string,
                gr: number,
                skillName: string,
                groupName: string
            }>(
                "SELECT US.id, US.check1, US.check2, US.check3, US.gr, LS.name AS skillName, LSG.name AS groupName " +
                " FROM univ__skills AS US" +
                " INNER JOIN " + props.locale + "__skills AS LS ON US.id = LS.id" +
                " INNER JOIN " + props.locale + "__skill_groups AS LSG ON US.gr = LSG.id"
            );

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
                        <View style={[styles.check, {borderColor: AttributeColors.get(item.check1)}]}>
                            <Text style={styles.checkValue}>{attrs?.get(item.check1)?.value}</Text>
                        </View>
                        <View style={[styles.check, {borderColor: AttributeColors.get(item.check2)}]}>
                            <Text style={styles.checkValue}>{attrs?.get(item.check2)?.value}</Text>
                        </View>
                        <View style={[styles.check, {borderColor: AttributeColors.get(item.check3)}]}>
                            <Text style={styles.checkValue}>{attrs?.get(item.check3)?.value}</Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        ))
    }

    const renderDices = () => {
        return abilityCheck?.attributes.map(({id, diceValue}, index) => {
            return <View style={[styles.modalBoxedNumber, {borderColor: AttributeColors.get(id)}]}
                         key={"check__dice_" + index}>
                <Text style={styles.modalBoxedNumberText}>
                    {diceValue}
                </Text>
            </View>
        })
    }

    const renderDifficulty = () => {
        return abilityCheck?.attributes.map(({id, diceValue}, index) => {
            return <View style={[styles.modalBoxedNumber, {borderColor: AttributeColors.get(id)}]}
                         key={"check__difficulty_" + index}>
                <Text style={styles.modalBoxedNumberText}>
                    {abilityCheck?.difficulty}
                </Text>
            </View>
        })
    }

    const renderAttributeNames = () => {
        return abilityCheck?.attributes.map(({id, name}, index) => {
            return <View style={[styles.modalBoxedNumber, {borderColor: AttributeColors.get(id)}]}
                         key={"check__attribute_" + index}>
                <Text style={styles.modalBoxedNumberText}>
                    {name}
                </Text>
            </View>
        })
    }

    const renderAttributes = () => {
        return abilityCheck?.attributes.map(({id, value}, index) => {
            return <View style={[styles.modalBoxedNumber, {borderColor: AttributeColors.get(id)}]}
                         key={"check__attribute_" + index}>
                <Text style={styles.modalBoxedNumberText}>
                    {value}
                </Text>
            </View>
        })
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

    const renderResults = () => {
        return abilityCheck?.attributes.map(({result}, index) => {
            return <View style={[styles.modalBoxedNumber, result > 0 ? styles.checkFailure : styles.checkSuccess]}
                         key={"check__result_" + index}>
                <Text style={styles.modalBoxedNumberText}>
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
                            <Text key={"explanation__" + index} style={{color: AttributeColors.get(id)}}>
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
                                {renderAttributeNames()}
                            </View>
                        </View>
                        <View style={styles.modalCheckNumbers}>
                            <View style={styles.modalCheckNumbersTitle}>
                                <Text style={styles.modalCheckNumbersTitleText}>
                                    Werte:
                                </Text>
                            </View>
                            <View style={styles.modalCheckNumbersValues}>
                                {renderAttributes()}
                            </View>
                        </View>
                        <View style={styles.modalCheckNumbers}>
                            <View style={styles.modalCheckNumbersTitle}>
                                <Text style={styles.modalCheckNumbersTitleText}>
                                    Würfel:
                                </Text>
                            </View>
                            <View style={styles.modalCheckNumbersValues}>
                                {renderDices()}
                            </View>
                        </View>
                        <View style={styles.modalCheckNumbers}>
                            <View style={styles.modalCheckNumbersTitle}>
                                <Text style={styles.modalCheckNumbersTitleText}>
                                    Modifikation:
                                </Text>
                                <View style={{flexDirection: "row"}}>
                                    <TouchableOpacity onPress={() => modifyDifficulty("inc")}
                                                      style={styles.modalButtonDone}>
                                        <AntDesign name="pluscircle" size={24} color="black"/>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => modifyDifficulty("dec")}
                                                      style={styles.modalButtonDone}>
                                        <AntDesign name="minuscircle" size={24} color="black"/>
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View style={[styles.modalCheckNumbersValues, {alignItems: "flex-start"}]}>
                                {renderDifficulty()}
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
