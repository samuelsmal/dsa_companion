import {Text, View, StyleSheet} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import {useEffect, useState} from "react";

type TalentProps = {
    locale: string | undefined;
    title: string;
    value: string;
}

const styles = StyleSheet.create({
    container: {
        padding: 2,
    },
    title: {
        fontSize: 12,
    },
    value: {
        fontSize: 16,
    }
})

const Talent = (props: TalentProps) => {
    const db = useSQLiteContext();

    const [fieldTitle, setFieldTitle] = useState("n/a");
    useEffect(() => {
        async function setup() {
            const result = await db.getFirstAsync<{'fieldTitle': string}>(
                "SELECT name as fieldTitle FROM skills WHERE id = ?", props.title
            )
            const allTalents = await db.getAllAsync("SELECT id, name FROM skills");
            if (result) {
                setFieldTitle(result['fieldTitle']);
            }
        }
        setup();
    }, [])

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{fieldTitle}</Text>
            <Text style={styles.value}>{props.value}</Text>
        </View>
    )
}

export default Talent