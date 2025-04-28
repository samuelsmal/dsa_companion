import {Text, View, StyleSheet} from "react-native";

type MetaFieldProps = {
    locale: string | undefined;
    title: string;
    value: string | number | undefined;
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

const MetaField = (props: MetaFieldProps) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{props.title}</Text>
            <Text style={styles.value}>{props.value}</Text>
        </View>
    )
}

export default MetaField