import {StyleSheet, Text, View} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import {useEffect, useState} from "react";
import {AttributeColors} from "@/constants/Colors";

type AttributesProps = {
    locale: string;
    characterAttributes: { id: string, value: number }[]
}

type Attribute = {
    id: string
    name: string
    value: number | undefined
}

const styles = StyleSheet.create({
    container: {
        padding: 2,
        flexDirection: "row",
        justifyContent: 'space-between',
    },
    name: {
        fontSize: 8,
    },
    value: {
        fontSize: 16,
    },
    item: {
        borderWidth: 2,
    },
    innerItemBox: {
        padding: 7,
        borderWidth: 1,
        borderColor: "black"
    }
})

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
            {
                attrs.map((attr, index) => (
                    <View style={[styles.item, {borderColor: AttributeColors.get(attr.id)}]}
                          key={"attr_" + index.toString()}>
                        <View style={styles.innerItemBox}>
                            <Text style={styles.name}>{attr.name}</Text>
                            <Text style={styles.value}>{attr.value}</Text>
                        </View>
                    </View>
                ))
            }
        </View>
    )
}

export default Attributes
