import { StyleSheet } from "react-native"
import { Text } from "react-native"
import { View } from "react-native"
export default function ActivityScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Activity Screen</Text>
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