
export default function EmptyState({ message = 'Chua co muc nao' }) {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
            <Text style={{ color: '#888' }}>{message}</Text>
        </View>
    )

}