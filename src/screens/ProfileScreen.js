import { StyleSheet } from "react-native"
import { Button, Text, View } from "react-native"

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Profile Screen</Text>
            <Button title="Edit Profile" onPress={() => navigation.navigate('EditProfile')}></Button>

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