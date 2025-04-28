import {StyleSheet, Text, View} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import {useEffect, useState} from "react";
import {RawHero} from "@/constants/types/RawHero";

type TalentProps = {
    locale: string;
    characterTalents: RawHero["talents"];
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
        padding: 2,
        flexDirection: "column",
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

const Talents = (props: TalentProps) => {
    const db = useSQLiteContext();

    const [talents, setTalents] = useState<Talent[]>([])

    useEffect(() => {
        async function setup() {
            const allTalents = await db.getAllAsync<{
                id: string,
                check1: string,
                check2: string,
                check3: string,
                gr: number,
                skillName: string,
                groupName: string
            }>(
                "SELECT US.id, US.check1, US.check2, US.check3, US.gr, LS.name AS skillName, LSG.name AS groupName FROM univ__skills AS US" +
                " INNER JOIN " + props.locale + "__skills AS LS ON US.id = LS.id" +
                " INNER JOIN " + props.locale + "__skill_groups AS LSG ON US.gr = LSG.id"
            );

            const givenTalents = new Map<string, number>(Object.keys(props.characterTalents).map(k => [k, props.characterTalents[k]]));

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

    return (
        <View style={styles.container}>
            {
                talents.map((attr, index) => (
                    <View style={styles.item} key={"talent_" + index.toString()}>
                        <View style={styles.innerItemBox}>
                            <Text style={styles.name}>{attr.name}</Text>
                            <Text style={styles.value}>{attr.value}</Text>
                            <Text style={styles.group}>{attr.groupName}</Text>
                        </View>
                    </View>
                ))
            }
        </View>
    )
}

export default Talents
