// MMA301 - Le Quang Nhat - CE190875
import { createContext, useContext, useEffect, useState } from 'react';
import { getProfile, saveProfile } from '../storage/storageHelper';

const ProfileContext = createContext();
export function ProfileProvider({ children }) {

    const [profile, setProfile] = useState(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        (async () => {
            const loaded = await getProfile();
            setProfile(loaded);
            setIsReady(true);
        })()
    }, []);

    const updateProfile = async (newProfile) => {
        setProfile(newProfile); //cập nhật state ngay lập tức để UI phản hồi nhanh
        await saveProfile(newProfile); //rồi mới persist
    }

    return (
        <ProfileContext.Provider value={{ profile, updateProfile, isReady }}>
            {children}
        </ProfileContext.Provider>
    )
}

export const useProfile = () => useContext(ProfileContext);