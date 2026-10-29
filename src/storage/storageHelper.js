// MMA301 - Le Quang Nhat - CE190875
//Nơi duy nhất giao tiếp với AsyncStorage, mọi lõi/corrupt logic đều phải đi qua đây
import AsyncStorage from "@react-native-async-storage/async-storage";
import { DEFAULT_PROFILE, STORAGE_KEYS } from "../constants/defaultProfile";

export async function getProfile() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
        if (!raw) return DEFAULT_PROFILE; //first run 
        return JSON.parse(raw);
    } catch (e) {
        console.warn("Profile storage corrupt, fallback to default:", e);
        return DEFAULT_PROFILE; //corrupt data, fallback to default
    }
}

export async function saveProfile(profile) {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
        return true;
    } catch (e) {
        console.warn("Failed to save profile:", e);
        return false;
    }
}

export async function getTheme() {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        return raw === 'dark'; //default light
    } catch {
        return false;
    }
}
export async function saveTheme(isDark) {
    try {
        await AsyncStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
    } catch (e) {
        console.warn("Failed to save theme:", e);
    }
}