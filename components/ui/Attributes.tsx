import {StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import {useEffect, useState} from "react";
import {AttributeColors} from "@/constants/Colors";
import {CalculatedAttributes} from "@/constants/OptolithDatabase";
import {CharacterInGame} from "@/constants/types/CharacterInGame";
import {AntDesign, MaterialIcons} from "@expo/vector-icons";

type AttributesProps = {
    locale: string;
    characterAttributes: { id: string, value: number }[]
    characterInGame: CharacterInGame | null,
    onAttributeChange: (attributeName: string, operation: string) => void,
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
        rowGap: 5
    },
    name: {
        fontSize: 8,
        textAlign: "center"
    },
    value: {
        fontSize: 16,
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
        justifyContent: 'flex-start',
        flexWrap: 'wrap',
        columnGap: 5,
    },
    modifableAttribute: {
        width: 80
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
        <View style={[styles.item, styles.modifableAttribute]}>
            <View style={{flexGrow: 1}}>
                <TouchableOpacity onPress={() => modFn(name, "inc")}
                                  style={{flexGrow: 1, alignItems: "center", backgroundColor: "black"}}>
                    <MaterialIcons name="exposure-plus-1" size={16} color="white"/>
                </TouchableOpacity>
            </View>
            <View style={[styles.innerItemBox, {flexGrow: 1, alignItems: "center"}]}>
                <Text style={styles.name}>{CalculatedAttributeTitles.get(name)}</Text>
                <View style={{flexDirection: "row"}}>
                    <Text style={styles.value}>{currentValue}</Text>
                    <Text style={styles.value}>/</Text>
                    <Text style={styles.value}>{maxValue}</Text>
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

const Attributes = (props: AttributesProps) => {
    const db = useSQLiteContext();

    const [attrs, setAttrs] = useState<Attribute[]>([])

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
                        <View style={[styles.item, {backgroundColor: AttributeColors.get(attr.id)?.main}]}
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


                </View>
            }
        </View>
    )
}

export default Attributes
