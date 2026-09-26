import { StyleSheet } from "react-native"
import { Text } from "react-native"
import { View } from "react-native"

export default function SettingScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Setting Screen</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    }
})