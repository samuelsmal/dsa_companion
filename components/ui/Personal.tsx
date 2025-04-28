import {StyleSheet, Text, View} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import {RawHero} from "@/constants/types/RawHero";

type PersonalProps = {
    locale: string;
    name: string;
    personal: RawHero['pers'];
    experienceLevel: string; // e.g. "EL_3"
    ap: number;
    culture: string; // e.g. "C_18"
    profession: string; // e.g. "P_127"
    sex: string; // e.g. "m"
    race: string; // e.g. "R_1"
    raceVariant: string; // e.g. "RV_1"
}

const styles = StyleSheet.create({
    container: {
        padding: 2,
        flexDirection: "row",
        flexWrap: "wrap",
    },
    name: {
        fontSize: 8,
    },
    value: {
        fontSize: 16,
    },
    item: {
        padding: 5
    },
})

const Personal = (props: PersonalProps) => {
    const db = useSQLiteContext();

    const getHumanReadible = (id: string | number | undefined, table: string): string => {
        if (id === undefined) {
            return "";
        }

        // @ts-ignore
        const result = db.getFirstSync(
            "SELECT name FROM " + props.locale + "__" + table + " WHERE id = ?",
            id
        )["name"]

        if (result.startsWith("{")) {
            return JSON.parse(result)[props.sex]
        } else {
            return result
        }
    }

    const renderItem = (name: string, value: number | string | undefined) => {
        return (
            <View style={styles.item}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.value}>{value}</Text>
            </View>
        )
    }

    return (
        <View style={styles.container}>
            {renderItem("AP", props.ap)}
            {renderItem("Erfahrungsgrad", getHumanReadible(props.experienceLevel, "experience_levels"))}
            {renderItem("Familie", props.personal.family)}
            {renderItem("Geburtsdatum", props.personal.dateofbirth)}
            {renderItem("Geburtsort", props.personal.placeofbirth)}
            {renderItem("Alter", props.personal.age)}
            {renderItem("Geschlecht", props.sex)}
            {renderItem("Spezies", getHumanReadible(props.race, "races"))}
            {renderItem("Körpergrösse", props.personal.size)}
            {renderItem("Gewicht", props.personal.weight)}
            {renderItem("Haarfarbge", getHumanReadible(props.personal.haircolor, "hair_colors"))}
            {renderItem("Augenfarbe", getHumanReadible(props.personal.eyecolor, "eye_colors"))}
            {renderItem("Kultur", getHumanReadible(props.culture, "cultures"))}
            {renderItem("Sozialstatus", getHumanReadible(props.personal.socialstatus, "social_statuses"))}
            {renderItem("Profession", getHumanReadible(props.profession, "professions"))}
            {renderItem("Titel", props.personal.title)}
            {renderItem("Charakteristika", props.personal.characteristics)}
            {renderItem("Sonstiges", props.personal.otherinfo)}
        </View>
    )
}

export default Personal
