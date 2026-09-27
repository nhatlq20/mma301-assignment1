import { ActivityIndicator, Button, Text, View } from "react-native"
import { useProfile } from "../context/ProfileContext";

export default function ProfileScreen({ navigation }) {
    const { profile, isReady } = useProfile();

    if (!isReady)
        return <ActivityIndicator style={{ flex: 1 }}></ActivityIndicator>

    return (
        <View style={{ flex: 1, pading: 20 }}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{profile.name}</Text>
            <Text style={{ marginVertical: 10 }}>{profile.bio}</Text>
            <Button title="Chỉnh sửa" onPress={() => navigation.navigate('EditProfile')}></Button>
        </View>
    )
}

