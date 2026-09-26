import { Button } from "react-native"
import { StyleSheet } from "react-native"
import { Text } from "react-native"
import { View } from "react-native"

export default function EditProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Edit Profile Screen</Text>
            <Button title="Back to profile" onPress={() => navigation.goBack()}></Button>
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
        fontqSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
    }
})