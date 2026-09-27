import { useState } from 'react';
import { View, Button } from 'react-native';
import { useProfile } from '../context/ProfileContext';
import FormField from '../components/FormField';
import { validateProfile } from '../constants/validationRules';

export default function EditProfileScreen({ navigation }) {
    const { profile, updateProfile } = useProfile();
    const [form, setForm] = useState({ name: profile?.name ?? '', bio: profile?.bio ?? '' }); // local form state
    const [errors, setErrors] = useState({});

    const handleSave = async () => {
        const validationErrors = validateProfile(form);
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);   // lỗi -> KHÔNG ghi đè
            return;
        }
        await updateProfile({ ...profile, ...form });
        navigation.goBack();
    };

    const handleCancel = () => {
        navigation.goBack();             // không gọi updateProfile -> dữ liệu cũ giữ nguyên
    };

    return (
        <View style={{ padding: 20 }}>
            <FormField label="Tên" value={form.name} onChangeText={t => setForm(f => ({ ...f, name: t }))} error={errors.name} />
            <FormField label="Bio" value={form.bio} onChangeText={t => setForm(f => ({ ...f, bio: t }))} error={errors.bio} multiline />
            <Button title="Lưu" onPress={handleSave} />
            <Button title="Hủy" color="gray" onPress={handleCancel} />
        </View>
    );
}