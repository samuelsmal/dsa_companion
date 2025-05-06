import {StyleSheet, Text, View} from "react-native";

const LinedText = ({text, lineColor = '#E0E0E0', textColor = '#000000', fontSize = 18}) => {
    return (
        <View style={styles.container}>
            <View style={[styles.line, {backgroundColor: lineColor}]}/>
            <Text style={[styles.text, {color: textColor, fontSize: fontSize}]}>{text}</Text>
            <View style={[styles.line, {backgroundColor: lineColor}]}/>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 10,
    },
    line: {
        flex: 1,
        height: 1,
    },
    text: {
        paddingHorizontal: 10,
        fontWeight: '500',
    },
});

export default LinedText;