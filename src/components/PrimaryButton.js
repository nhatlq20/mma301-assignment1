import { Pressable, Text, StyleSheet } from 'react-native';

export default function PrimaryButton({ title, onPress, variant = 'primary' }) {
    return (
        <Pressable
            style={({ pressed }) => [
                styles.button,
                variant === 'secondary' && styles.secondary,
                pressed && styles.pressed,
            ]}
            onPress={onPress}
        >
            <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>
                {title}
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 10,
        width: '100%',
        alignItems: 'center',
    },
    secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: '#2563eb',
    },
    pressed: { opacity: 0.7 },
    text: { color: '#fff', fontSize: 16, fontWeight: '600' },
    secondaryText: { color: '#2563eb' },
});