import { StyleSheet } from "react-native";
import { Button, Text, View } from "react-native";

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Trang chủ</Text>
            <Button title="Xem hồ sơ" onPress={() => navigation.navigate('Profile')}></Button>
            <Button title="Hoạt động" onPress={() => navigation.navigate('Activity')}></Button>
            <Button title="Cài đặt" onPress={() => navigation.navigate('Settings')}></Button>

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