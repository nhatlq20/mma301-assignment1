import { TouchableOpacity, Text, StyleSheet } from 'react-native';

export default function ActivityItem({ item, onToggle }) {
    return (
        <TouchableOpacity style={styles.item} onPress={() => onToggle(item.id)}>
            <Text style={{ fontWeight: item.done ? 'normal' : 'bold' }}>
                {item.done ? '✅ ' : '⬜ '}{item.title}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    item: { padding: 12, borderBottomWidth: 1, borderColor: '#eee' },
});
