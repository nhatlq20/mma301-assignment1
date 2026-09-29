
import { View, Text } from 'react-native';

export default function EmptyState({ message = 'Chưa có mục nào' }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <Text style={{ color: '#888' }}>{message}</Text>
        </View>
    )

}