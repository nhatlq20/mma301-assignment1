// MMA301 - Le Quang Nhat - CE190875
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import PrimaryButton from '../components/PrimaryButton';

export default function HomeScreen({ navigation }) {
    const { colors } = useTheme();

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colors.text }]}>Trang chủ</Text>
                <Text style={[styles.subtitle, { color: colors.text }]}>
                    Quản lý hồ sơ và hoạt động của bạn
                </Text>
            </View>

            <View style={styles.actions}>
                <PrimaryButton title="Xem hồ sơ" onPress={() => navigation.navigate('Profile')} />
                <PrimaryButton title="Hoạt động" onPress={() => navigation.navigate('Activity')} />
                <PrimaryButton title="Cài đặt" variant="secondary" onPress={() => navigation.navigate('Settings')} />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, paddingHorizontal: 24 },
    header: { marginTop: 40, marginBottom: 48 },
    title: { fontSize: 28, fontWeight: '700' },
    subtitle: { fontSize: 14, opacity: 0.6, marginTop: 6 },
    actions: { gap: 12 },
});