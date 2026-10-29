// MMA301 - Le Quang Nhat - CE190875
import { View, Text, TextInput, StyleSheet } from 'react-native';


export default function FormField({ label, value, onChangeText, error, multiline }) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
                style={[styles.input, error && styles.inputError]}
                value={value}
                onChangeText={onChangeText}
                multiline={multiline}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
        </View>
    )
}
const styles = StyleSheet.create({
    wrapper: { marginBottom: 15 },
    label: { fontWeight: '600', marginBottom: 4 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 },
    inputError: { borderColor: 'red' },
    errorText: { color: 'red', marginTop: 4 },
});