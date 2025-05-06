import {StyleSheet, Text, TouchableOpacity, useWindowDimensions, View} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import {useEffect, useState} from "react";
import {AttributeColors} from "@/constants/Colors";
import {CharacterInGame} from "@/constants/types/CharacterInGame";
import {MaterialIcons} from "@expo/vector-icons";
import {Sizes} from "@/constants/Sizes";

type AttributesProps = {
    locale: string;
    characterAttributes: { id: string, value: number }[]
    characterInGame: CharacterInGame | null,
    onAttributeChange: (attributeName: string, operation: string) => void,
    onPurseChange: (coinType: string, operation: string) => void,
}

type Attribute = {
    id: string
    name: string
    value: number | undefined
}

const styles = StyleSheet.create({
    container: {
        padding: 2,
        flexDirection: "column",
        rowGap: Sizes.rowGap,
    },
    name: {
        fontSize: Sizes.attributeName,
        textAlign: "center"
    },
    value: {
        fontSize: Sizes.attributeValue,
        textAlign: "center"
    },
    item: {
        borderWidth: 2,
    },
    innerItemBox: {
        padding: 7,
        borderWidth: 1,
        borderColor: "black",
        minWidth: 40
    },
    row: {
        flexDirection: "row",
        justifyContent: "center",
        flexWrap: 'wrap',
        columnGap: Sizes.columnGap,
        rowGap: Sizes.rowGap,
    },
    modifiableAttribute: {
        width: 80
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "bold",
    }
})

const CalculatedAttributeTitles = new Map<string, string>([
    ["lp", "LP"],
    ["asp", "ASP"],
    ["kp", "KP"],
    ["soulPower", "SK"],
    ["toughness", "ZK"],
    ["dodge", "AW"],
    ["initiative", "INI"],
    ["velocity", "GS"],
    ["woundThreshold", "WS"],
    ["fatePoints", "SP"],
])

const renderModifiableAttribute = (name: string, currentValue: number, maxValue: number, modFn: (attributeName: string, operation: string) => void) => {
    return (
        <View style={[styles.item, styles.modifiableAttribute]}>
            <View style={{flexGrow: 1}}>
                <TouchableOpacity onPress={() => modFn(name, "inc")}
                                  style={{flexGrow: 1, alignItems: "center", backgroundColor: "black"}}>
                    <MaterialIcons name="exposure-plus-1" size={Sizes.buttonIconInteraction} color="white"/>
                </TouchableOpacity>
            </View>
            <View style={[styles.innerItemBox, {flexGrow: 1, alignItems: "center", justifyContent: "space-evenly"}]}>
                <Text style={styles.name}>{CalculatedAttributeTitles.get(name)}</Text>
                <View style={{flexDirection: "row", alignItems: "baseline"}}>
                    <Text style={styles.value}>{currentValue}</Text>
                    <Text style={[styles.value, {fontSize: Sizes.attributeName}]}>/</Text>
                    <Text style={[styles.value, {fontSize: Sizes.attributeName}]}>{maxValue}</Text>
                </View>
            </View>
            <View style={{flexGrow: 1}}>
                <TouchableOpacity onPress={() => modFn(name, "dec")}
                                  style={{flexGrow: 1, alignItems: "center", backgroundColor: "black"}}>
                    <MaterialIcons name="exposure-minus-1" size={Sizes.buttonIconInteraction} color="white"/>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const CoinTypeHuman = new Map<string, string>([
    ["d", "Dukate"],
    ["s", "Silber"],
    ["h", "Heller"],
    ["k", "Kreuzer"],
])

const renderPurseCoin = (name: string, currentValue: number, modFn: (attributeName: string, operation: string) => void) => {
    return (
        <View style={[styles.item, styles.modifiableAttribute]}>
            <View style={{flexGrow: 1}}>
                <TouchableOpacity onPress={() => modFn(name, "inc")}
                                  style={{flexGrow: 1, alignItems: "center", backgroundColor: "black"}}>
                    <MaterialIcons name="exposure-plus-1" size={16} color="white"/>
                </TouchableOpacity>
            </View>
            <View style={[styles.innerItemBox, {flexGrow: 1, alignItems: "center"}]}>
                <Text style={styles.name}>{CoinTypeHuman.get(name)}</Text>
                <View style={{flexDirection: "row", alignItems: "center"}}>
                    <Text style={styles.value}>{currentValue}</Text>
                </View>
            </View>
            <View style={{flexGrow: 1}}>
                <TouchableOpacity onPress={() => modFn(name, "dec")}
                                  style={{flexGrow: 1, alignItems: "center", backgroundColor: "black"}}>
                    <MaterialIcons name="exposure-minus-1" size={16} color="white"/>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const attributeWrapperWidth = (windowWidth: number, itemWidth: number, minItemsPerLine: number = 4): number => {
    return Math.max(Math.floor(windowWidth / minItemsPerLine) - Sizes.columnGap * (minItemsPerLine - 1), itemWidth)
}

const Attributes = (props: AttributesProps) => {
    const db = useSQLiteContext();

    const [attrs, setAttrs] = useState<Attribute[]>([])
    const {height, width} = useWindowDimensions();

    useEffect(() => {
        async function setup() {
            const result = await db.getAllAsync<{ id: string, name: string }>(
                "SELECT id, short as name FROM '" + props.locale + "__attributes' ORDER BY id"
            );
            if (result) {
                const charAttrsAsDict = new Map<string, number>(props.characterAttributes.map(item => [item.id, item.value]));
                setAttrs(result.map(val => ({id: val.id, name: val.name, value: charAttrsAsDict.get(val.id)})));
            }
        }

        setup();
    }, [])


    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {
                    attrs.map((attr, index) => (
                        <View style={[styles.item, {backgroundColor: AttributeColors.get(attr.id)?.main, width: attributeWrapperWidth(width, 10)}]}
                              key={"attr_" + index.toString()}>
                            <View style={styles.innerItemBox}>
                                <Text
                                    style={[styles.name, {color: AttributeColors.get(attr.id)?.text}]}>{attr.name}</Text>
                                <Text
                                    style={[styles.value, {color: AttributeColors.get(attr.id)?.text}]}>{attr.value}</Text>
                            </View>
                        </View>
                    ))
                }
            </View>

            {props.characterInGame &&
                <View style={styles.row}>
                    {
                        ["soulPower", "toughness", "dodge", "initiative", "velocity", "woundThreshold"].map((attr, index) => (
                            <View style={styles.item}
                                  key={"calc__attr_" + index.toString()}>
                                <View style={styles.innerItemBox}>
                                    <Text
                                        style={styles.name}>{CalculatedAttributeTitles.get(attr)}</Text>
                                    <Text
                                        style={styles.value}>{props.characterInGame[attr].current}</Text>
                                </View>
                            </View>
                        ))
                    }
                </View>
            }

            {props.characterInGame &&
                <View style={styles.row}>
                    {renderModifiableAttribute(
                        "lp",
                        props.characterInGame.lp.current,
                        props.characterInGame.lp.max,
                        props.onAttributeChange)}
                    {props.characterInGame.asp.max > 0 && renderModifiableAttribute(
                        "asp",
                        props.characterInGame.asp.current,
                        props.characterInGame.asp.max,
                        props.onAttributeChange)}
                    {props.characterInGame.kp.max > 0 && renderModifiableAttribute(
                        "kp",
                        props.characterInGame.kp.current,
                        props.characterInGame.kp.max,
                        props.onAttributeChange)}
                    {renderModifiableAttribute(
                        "fatePoints",
                        props.characterInGame.fatePoints.current,
                        props.characterInGame.fatePoints.max,
                        props.onAttributeChange)}
                </View>
            }

            {props.characterInGame &&
                <View style={styles.row}>
                    <View style={styles.row}>
                        {
                            ["d", "s", "h", "k"].map(coinType => (
                                renderPurseCoin(
                                    coinType,
                                    props.characterInGame?.purse[coinType],
                                    props.onPurseChange)
                            ))
                        }
                    </View>
                </View>
            }
        </View>
    )
}

export default Attributes
