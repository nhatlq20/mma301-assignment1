// MMA301 - Le Quang Nhat - CE190875
import { Switch, Text, View } from "react-native";
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
    const { isDark, toggleTheme, colors } = useTheme();

    return (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ color: colors.text }}> Dark mode</Text>
            <Switch
                value={isDark}
                onValueChange={toggleTheme}
            />
        </View>
    )
}