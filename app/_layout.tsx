import {Stack} from "expo-router";
import {SafeAreaProvider} from "react-native-safe-area-context";
import {SQLiteProvider} from "expo-sqlite";


export default function RootLayout() {
    return (
        <SafeAreaProvider>
            <SQLiteProvider databaseName="ulisses.db" assetSource={{assetId: require('../assets/data/ulisses.db')}}>
                    <Stack>
                        <Stack.Screen name="index" options={{headerShown: false}}/>
                    </Stack>
            </SQLiteProvider>
        </SafeAreaProvider>
    )
}
