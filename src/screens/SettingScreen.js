import { StyleSheet } from "react-native"
import { Text } from "react-native"
import { View } from "react-native"
import { useTheme } from "../context/ThemeContext"
import ThemeToggle from "../components/ThemeToggle"

export default function SettingScreen() {
    const { colors } = useTheme();

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Text style={[styles.title, { color: colors.text }]}>Setting Screen</Text>
            <ThemeToggle />
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