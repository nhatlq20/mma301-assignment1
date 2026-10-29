// MMA301 - Le Quang Nhat - CE190875
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import ActivityScreen from "../screens/ActivityScreen";
import SettingScreen from "../screens/SettingScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Home">
                <Stack.Screen name="Home" component={HomeScreen}></Stack.Screen>
                <Stack.Screen name="Profile" component={ProfileScreen}></Stack.Screen>
                <Stack.Screen name="EditProfile" component={EditProfileScreen}></Stack.Screen>
                <Stack.Screen name="Activity" component={ActivityScreen}></Stack.Screen>
                <Stack.Screen name="Settings" component={SettingScreen}></Stack.Screen>
            </Stack.Navigator>
        </NavigationContainer>

    )
}