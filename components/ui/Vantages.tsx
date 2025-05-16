import {StyleSheet, Text, View} from "react-native";
import {useSQLiteContext} from "expo-sqlite";
import {useEffect, useState} from "react";
import {Colors} from "@/constants/Colors";
import {Sizes} from "@/constants/Sizes";
import {RawHero} from "@/constants/types/RawHero";

type VantagesProps = {
    locale: string
    characterVantages: RawHero["activatable"]
}

type Vantage = {
    id: string
    name: string
    rules: string | undefined
    group: string | undefined
    levels: number | undefined
    lgroup: string | undefined
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
    modifiableVantage: {
        width: 80
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: "bold",
    }
})


const VantageGroups = new Map<number, string>([
    [1, "Allgemein"],
    [2, "Magisch"],
    [3, "Karmal"],
    [5, "Stabzauber"]
])

const Vantages = (props: VantagesProps) => {
    const db = useSQLiteContext();

    const [vantages, setVantages] = useState<Vantage[]>([])

    useEffect(() => {
        async function setup() {
            const lookup = `WITH lookup AS (SELECT id, gr, levels
                                            FROM univ__advantages
                                            UNION
                                            SELECT id, gr, levels
                                            FROM univ__disadvantages
                                            UNION
                                            SELECT id, gr, levels
                                            FROM univ__special_abilities)`;

            const query = " SELECT id, name, rules, 'advantage' as gr FROM '" + props.locale + "__advantages' " +
                "UNION " +
                "SELECT id, name, rules, 'disadvantage' as gr FROM '" + props.locale + "__disadvantages' " +
                "UNION " +
                "SELECT id, name, rules, 'special' as gr FROM '" + props.locale + "__special_abilities'"

            const fullQuery = lookup + ", WITH translations AS (" + query + ") SELECT T.id, T.name, T.rules, T.gr, L.levels, L.gr AS lgr FROM translations AS T JOIN lookup AS L ON T.id = L.id";

            console.log(fullQuery);

            const result = await db.getAllAsync<{
                id: string,
                name: string,
                rules: string,
                gr: string,
                levels: number | null,
                lgr: string
            }>(
                lookup + ", translations AS (" + query + ") SELECT T.id, T.name, T.rules, T.gr, L.levels, L.gr AS lgr FROM translations AS T JOIN lookup AS L ON T.id = L.id"
            );

            if (result) {
                const vals = new Map<string, { id: string, name: string, rules: string, gr: string }>(
                    result.map(item => [item.id, item])
                );

                const vantages = Object.keys(props.characterVantages)
                    // Optolith is a bit weird, all advantages, disadvantages with an empty array are not valid.
                    .filter((vantage) => props.characterVantages[vantage].length > 0)
                    .flatMap(id => props.characterVantages[id].map(i => [id, i]))
                    .map(x => {
                        const id = x[0]
                        const attrs = x[1]

                        if (id === "SA_29") {
                            return {
                                id: id,
                                name: vals.get(id)?.name + " (" + attrs["sid"] + ")",
                                tier: attrs["tier"],
                                rules: vals.get(id)?.rules,
                                group: vals.get(id)?.gr,
                                lgroup: vals.get(id)?.lgr,
                            }
                        } else if (id === "SA_27") {
                            return {
                                id: id,
                                name: vals.get(id)?.name + " (" + attrs["sid"] + ")",
                                tier: attrs["tier"],
                                rules: vals.get(id)?.rules,
                                group: vals.get(id)?.gr,
                                lgroup: vals.get(id)?.lgr,
                            }
                        }

                        return {
                            id: id,
                            name: id.endsWith("_0") ? attrs["sid"] : vals.get(id)?.name,
                            rules: id.endsWith("_0") ? "" : vals.get(id)?.rules,
                            tier: attrs["tier"] || 0,
                            group: vals.get(id)?.gr,
                            lgroup: vals.get(id)?.lgr,
                        }
                    });

                setVantages(vantages)
            }
        }

        setup();
    }, [])


    return (
        <View style={styles.container}>
            <View style={styles.row}>
                {
                    vantages.map((attr, index) => (
                        <View style={[styles.item]} key={"vantage__attr_" + index.toString()}>
                            <View style={styles.innerItemBox}>
                                <Text style={[styles.name]}>{attr.id}</Text>
                                <Text style={[styles.name]}>{attr.name}</Text>
                                <Text style={[styles.name]}>{attr.group}</Text>
                                <Text style={[styles.name]}>{attr.lgroup}</Text>
                                <Text style={[styles.name]}>{attr.tier}</Text>
                            </View>
                        </View>
                    ))
                }
            </View>
        </View>
    )
}

export default Vantages
