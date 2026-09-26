# Kế hoạch Hành động Chi tiết — MMA301 Assignment 1
### Profile & Activity App — Step-by-Step Implementation & Defense Roadmap

> Tài liệu tham khảo để hiểu logic và tự triển khai/điều chỉnh — không nộp nguyên xi nếu không giải thích được, vì pha C (Code Interview) sẽ hỏi trực tiếp vào các dòng này.

---

## 1. State Ownership Map & Kiến trúc Thư mục

### 1.1 Bảng phân loại dữ liệu (State Ownership Map)

| State | Ví dụ cụ thể | Quản lý bởi | Lý do đặt ở đây |
|---|---|---|---|
| Local UI state | input focus, dropdown/modal mở, loading spinner cục bộ | `useState` trong component | Không ai khác cần đọc, tránh re-render toàn cây |
| Form state | `name`, `bio`, `avatarUri`, `errors` đang nhập | `useState` trong `EditProfileScreen` | Gắn vòng đời form; reset độc lập khi Cancel/unmount, không rò ra ngoài |
| Shared state (Context) | `profile` object, `theme` mode | `ProfileContext`, `ThemeContext` | Nhiều screen (Home, Profile, Settings) cần đọc/ghi cùng một nguồn |
| Persistent state | profile đã lưu, theme đã lưu | `AsyncStorage` qua `storageHelper.js` | Phải sống sót qua restart app |
| List state | `activities`/`interests` array | Screen-level state (hoặc Context nếu >1 screen cần) | Đặt gần consumer nhất — tránh Context phình to không cần thiết |

### 1.2 Cây thư mục chuẩn hóa

```
/src
  /screens
    HomeScreen.js
    ProfileScreen.js
    EditProfileScreen.js
    ActivityScreen.js
    SettingsScreen.js
  /components
    ProfileCard.js
    FormField.js
    ActivityItem.js
    EmptyState.js
    ThemeToggle.js
  /context
    ThemeContext.js
    ProfileContext.js
  /storage
    storageHelper.js        // get/set/parse/fallback tập trung, không viết trực tiếp trong screen
  /navigation
    AppNavigator.js
  /constants
    defaultProfile.js
    validationRules.js
  /utils
    validators.js
App.js                       // CHỈ là entry point: bọc <ThemeProvider><ProfileProvider><AppNavigator/></...>
```

**Nguyên tắc bắt buộc:** `App.js` không chứa logic nghiệp vụ (không fetch, không validate, không xử lý state phức tạp) — chỉ compose các Provider và render Navigator.

### 1.3 Phạm vi không bắt buộc (Out-of-Scope)

| Không bắt buộc | Vì sao tránh |
|---|---|
| Firebase / backend thật, Auth production | Rủi ro lệch effort khỏi core evidence rubric |
| Redux | Context API đủ cho scope 5 screen |
| TypeScript | Không phải tiêu chí chấm |
| Animation phức tạp / nhiều thư viện ngoài | Rủi ro không giải thích được ở pha C |

---

## 2. Lộ trình 7 Milestone (M1 → M7)

| MS | Mục tiêu & Gate | Bước code & file tác động | Verification tại chỗ | Git commit mẫu |
|---|---|---|---|---|
| **M1** | Stack Navigator chạy, mở được cả 5 screen | `navigation/AppNavigator.js`, 5 file `screens/*.js` skeleton | Bấm qua lại từng screen + back, không crash | `[MaSV] [Navigation] Setup stack navigator + 5 screen skeleton` |
| **M2** | `ThemeContext` hoạt động, đổi light/dark app-wide (chưa persist) | `context/ThemeContext.js`, `components/ThemeToggle.js` | Toggle ở Settings → màu đổi ngay ở Home | `[MaSV] [Theme] Add ThemeContext + toggle UI (no persistence yet)` |
| **M3** | `storageHelper` + `ProfileScreen` đọc default/persisted đúng | `storage/storageHelper.js`, `context/ProfileContext.js`, `screens/ProfileScreen.js` | Xoá app data → mở lại → thấy default; JSON rác → không crash | `[MaSV] [Storage] Add storageHelper + ProfileContext with safe fallback` |
| **M4** | `EditProfileScreen` controlled form + validate + Save/Cancel không ghi đè khi lỗi/hủy | `screens/EditProfileScreen.js`, `components/FormField.js`, `constants/validationRules.js` | Name rỗng → lỗi, không save; Cancel → không đổi; hợp lệ → Save → cập nhật ngay | `[MaSV] [Profile] Add controlled edit form with validation + save/cancel` |
| **M5** | `Activity/InterestsScreen` FlatList + empty state + interaction immutable | `screens/ActivityScreen.js`, `components/ActivityItem.js`, `components/EmptyState.js` | Mảng rỗng → EmptyState; toggle item → `.map()`, không mutate | `[MaSV] [Activity] Add FlatList with empty state + immutable toggle` |
| **M6** | Persist theme + tích hợp end-to-end toàn workflow | Cập nhật `ThemeContext.js` (persist), review toàn luồng | Restart app: theme + profile vẫn đúng; hết workflow không lỗi console | `[MaSV] [Settings] Persist theme via AsyncStorage + full workflow integration` |
| **M7** | Refactor, smoke test, 2 debug log thật | Review `/src`, xoá code chết | Chạy hết 12 test case, không còn console warning nghiêm trọng | `[MaSV] [Release] Refactor + smoke test pass + finalize docs` |

> **Gate rule:** không chuyển milestone tiếp theo nếu "Verification tại chỗ" của milestone hiện tại chưa pass.

### 2.1 Quy tắc Git

- Commit theo **feature/screen**, tuyệt đối không "one-shot code dump".
- Format: `[MãSV] [Module/Screen] Mô tả ngắn gọn`.

---

## 3. Hướng dẫn triển khai từng bước (Step-by-Step)

### Bước 0 — Khởi tạo project & cài dependency

```bash
npx create-expo-app MaSV_ClassCode
cd MaSV_ClassCode

npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage
```

```bash
mkdir -p src/screens src/components src/context src/storage src/navigation src/constants
```

**Verify:** `npx expo start` → app trắng chạy được, không lỗi.
```bash
git add . && git commit -m "[MaSV] [Setup] Init Expo project + folder structure"
```

---

### M1 — Stack Navigator Skeleton

**`src/screens/HomeScreen.js`**
```jsx
import { View, Text, Button, StyleSheet } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trang chủ</Text>
      <Button title="Xem hồ sơ" onPress={() => navigation.navigate('Profile')} />
      <Button title="Hoạt động" onPress={() => navigation.navigate('Activity')} />
      <Button title="Cài đặt" onPress={() => navigation.navigate('Settings')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
});
```

Tạo tương tự (placeholder rỗng): `ProfileScreen.js`, `EditProfileScreen.js`, `ActivityScreen.js`, `SettingsScreen.js`.

**`src/navigation/AppNavigator.js`**
```jsx
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import ActivityScreen from '../screens/ActivityScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Chỉnh sửa hồ sơ' }} />
        <Stack.Screen name="Activity" component={ActivityScreen} options={{ title: 'Hoạt động / Sở thích' }} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**`App.js`**
```jsx
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return <AppNavigator />;
}
```

**Verify (Gate M1):** mở đủ 5 screen, back được, không crash.
```bash
git add . && git commit -m "[MaSV] [Navigation] Setup stack navigator + 5 screen skeleton"
```

---

### M2 — ThemeContext & Reusable UI

**`src/context/ThemeContext.js`**
```jsx
import { createContext, useContext, useState } from 'react';

const ThemeContext = createContext();

const lightColors = { background: '#fff', text: '#000', card: '#f2f2f2' };
const darkColors  = { background: '#121212', text: '#fff', card: '#1e1e1e' };

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const colors = isDark ? darkColors : lightColors;

  const toggleTheme = () => setIsDark(prev => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

> Persist chưa thêm ở M2 — sẽ bổ sung ở M6 khi đã có storage helper (M3).

**`src/components/ThemeToggle.js`**
```jsx
import { Switch, View, Text } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme, colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Text style={{ color: colors.text }}>Dark mode</Text>
      <Switch value={isDark} onValueChange={toggleTheme} />
    </View>
  );
}
```

Bọc Provider trong `App.js`:
```jsx
import { ThemeProvider } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <AppNavigator />
    </ThemeProvider>
  );
}
```

Trong `SettingsScreen.js`, dùng `useTheme()` để lấy `colors` và render `<ThemeToggle />`; áp `colors.background`/`colors.text` vào `HomeScreen` để chứng minh app-wide.

**Verify (Gate M2):** Toggle ở Settings → quay lại Home → màu đổi ngay, không cần reload.
```bash
git commit -m "[MaSV] [Theme] Add ThemeContext + toggle UI (no persistence yet)"
```

---

### M3 — Storage Helper & Profile Screen

**`src/constants/defaultProfile.js`**
```js
export const DEFAULT_PROFILE = {
  name: 'Người dùng mới',
  bio: 'Chưa có mô tả',
  avatarUri: null,
};

export const STORAGE_KEYS = {
  PROFILE: 'PROFILE_DATA',
  THEME: 'THEME_MODE',
};
```

**`src/storage/storageHelper.js`** — nơi **duy nhất** giao tiếp AsyncStorage:
```js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_PROFILE, STORAGE_KEYS } from '../constants/defaultProfile';

export async function getProfile() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
    if (!raw) return DEFAULT_PROFILE;          // first-run
    return JSON.parse(raw);
  } catch (e) {
    console.warn('Profile storage corrupt, fallback to default', e);
    return DEFAULT_PROFILE;                     // corrupt data
  }
}

export async function saveProfile(profile) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    return true;
  } catch (e) {
    console.warn('Failed to save profile', e);
    return false;
  }
}

export async function getTheme() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
    return raw === 'dark';
  } catch {
    return false;
  }
}

export async function saveTheme(isDark) {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.THEME, isDark ? 'dark' : 'light');
  } catch (e) {
    console.warn('Failed to save theme', e);
  }
}
```

**`src/context/ProfileContext.js`**
```jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { getProfile, saveProfile } from '../storage/storageHelper';

const ProfileContext = createContext();

export function ProfileProvider({ children }) {
  const [profile, setProfile] = useState(null); // null = đang hydrate
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const loaded = await getProfile();
      setProfile(loaded);
      setIsReady(true);
    })();
  }, []);

  const updateProfile = async (newProfile) => {
    setProfile(newProfile);           // cập nhật UI ngay
    await saveProfile(newProfile);    // rồi mới persist
  };

  return (
    <ProfileContext.Provider value={{ profile, updateProfile, isReady }}>
      {children}
    </ProfileContext.Provider>
  );
}

export const useProfile = () => useContext(ProfileContext);
```

**`src/screens/ProfileScreen.js`**
```jsx
import { View, Text, Button, ActivityIndicator } from 'react-native';
import { useProfile } from '../context/ProfileContext';

export default function ProfileScreen({ navigation }) {
  const { profile, isReady } = useProfile();

  if (!isReady) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>{profile.name}</Text>
      <Text style={{ marginVertical: 10 }}>{profile.bio}</Text>
      <Button title="Chỉnh sửa" onPress={() => navigation.navigate('EditProfile')} />
    </View>
  );
}
```

Bọc thêm `ProfileProvider` trong `App.js`, lồng trong `ThemeProvider`.

**Verify (Gate M3):** Xoá app data → mở lại → thấy `DEFAULT_PROFILE`. Sửa tay giá trị trong AsyncStorage thành chuỗi không phải JSON → app không crash, vẫn fallback default.
```bash
git commit -m "[MaSV] [Storage] Add storageHelper + ProfileContext with safe fallback"
```

---

### M4 — Controlled Form & Validation (EditProfileScreen)

**`src/constants/validationRules.js`**
```js
export function validateProfile({ name, bio }) {
  const errors = {};
  if (!name || name.trim().length === 0) errors.name = 'Tên không được để trống';
  if (name && name.length > 40) errors.name = 'Tên tối đa 40 ký tự';
  if (bio && bio.length > 200) errors.bio = 'Bio tối đa 200 ký tự';
  return errors;
}
```

**`src/components/FormField.js`**
```jsx
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
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 15 },
  label: { fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10 },
  inputError: { borderColor: 'red' },
  errorText: { color: 'red', marginTop: 4 },
});
```

**`src/screens/EditProfileScreen.js`** — điểm mấu chốt: **form state cục bộ**, chỉ ghi vào `ProfileContext` khi Save hợp lệ.
```jsx
import { useState } from 'react';
import { View, Button } from 'react-native';
import { useProfile } from '../context/ProfileContext';
import FormField from '../components/FormField';
import { validateProfile } from '../constants/validationRules';

export default function EditProfileScreen({ navigation }) {
  const { profile, updateProfile } = useProfile();
  const [form, setForm] = useState({ name: profile.name, bio: profile.bio }); // local form state
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
```

**Verify (Gate M4):** Xoá tên → Save → báo lỗi, Profile không đổi. Sửa tên hợp lệ rồi Cancel → Profile giữ nguyên. Sửa hợp lệ rồi Save → quay lại Profile thấy cập nhật ngay, không cần restart.
```bash
git commit -m "[MaSV] [Profile] Add controlled edit form with validation + save/cancel"
```

---

### M5 — FlatList & Empty State (ActivityScreen)

**`src/components/ActivityItem.js`**
```jsx
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
```

**`src/components/EmptyState.js`**
```jsx
import { View, Text } from 'react-native';
export default function EmptyState({ message = 'Chưa có mục nào' }) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <Text style={{ color: '#888' }}>{message}</Text>
    </View>
  );
}
```

**`src/screens/ActivityScreen.js`** — điểm mấu chốt: **immutable update** bằng `.map()`, không mutate.
```jsx
import { useState } from 'react';
import { FlatList } from 'react-native';
import ActivityItem from '../components/ActivityItem';
import EmptyState from '../components/EmptyState';

const initialData = [
  { id: '1', title: 'Đọc sách', done: false },
  { id: '2', title: 'Tập gym', done: false },
];

export default function ActivityScreen() {
  const [activities, setActivities] = useState(initialData); // đổi thành [] để test empty state

  const toggleItem = (id) => {
    setActivities(prev =>
      prev.map(item => item.id === id ? { ...item, done: !item.done } : item) // immutable
    );
  };

  if (activities.length === 0) return <EmptyState message="Chưa có hoạt động nào" />;

  return (
    <FlatList
      data={activities}
      keyExtractor={item => item.id}
      renderItem={({ item }) => <ActivityItem item={item} onToggle={toggleItem} />}
    />
  );
}
```

**Verify (Gate M5):** Đổi `initialData` thành `[]` → thấy EmptyState. Bấm vào 1 item → toggle done, các item khác không đổi.
```bash
git commit -m "[MaSV] [Activity] Add FlatList with empty state + immutable toggle"
```

---

### M6 — Persist Theme & Tích hợp End-to-End

Cập nhật `ThemeContext.js` để hydrate + persist:
```jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { getTheme, saveTheme } from '../storage/storageHelper';

const ThemeContext = createContext();
const lightColors = { background: '#fff', text: '#000', card: '#f2f2f2' };
const darkColors  = { background: '#121212', text: '#fff', card: '#1e1e1e' };

export function ThemeProvider({ children }) {
  const [isDark, setIsDark] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      const saved = await getTheme();
      setIsDark(saved);
      setIsReady(true);
    })();
  }, []);

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      saveTheme(next);   // persist song song, không chặn UI
      return next;
    });
  };

  const colors = isDark ? darkColors : lightColors;
  if (!isReady) return null; // tránh nháy sai theme trước khi hydrate xong

  return (
    <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
```

Sau đó đi hết workflow: Home → Profile → Edit → Save → Activity → toggle → Settings → đổi theme → **restart app** → kiểm tra cả profile lẫn theme còn đúng.

**Verify (Gate M6):** Restart app 2-3 lần liên tiếp, mọi state persistent đều đúng; không có màn hình nào "nháy" theme sai trước khi hydrate xong.
```bash
git commit -m "[MaSV] [Settings] Persist theme via AsyncStorage + full workflow integration"
```

---

### M7 — Refactor & Smoke Test

1. Rà lại toàn bộ `/src`, xoá `console.log` thừa, import không dùng.
2. Chạy đủ 12 test case trong Test Matrix, điền cột Actual.
3. Viết 2 Debug Log **từ lỗi thật bạn gặp** trong quá trình code (không bịa).
4. Hoàn thiện README (cách chạy từ môi trường sạch), RTM, DDR.
5. Thử clone lại project ở thư mục khác, `npm install` sạch, `expo start` — đảm bảo README đúng 100%.

```bash
git commit -m "[MaSV] [Release] Refactor + smoke test pass + finalize docs"
```

---

## 4. Khung mẫu Bộ Hồ sơ Bắt buộc

### 4.1 RTM (Requirement Traceability Matrix)

| ID | Yêu cầu | File/code liên quan | Test case tương ứng |
|---|---|---|---|
| R01 | Project chạy đúng quy ước | `package.json`, `app.json` | Cold start |
| R02 | Navigation ≥5 khu vực | `navigation/AppNavigator.js` | Mở từng screen + back |
| R03 | Profile hiển thị dữ liệu | `screens/ProfileScreen.js` | Default + persisted |
| R04 | Edit Profile + validation | `screens/EditProfileScreen.js` | Valid/invalid/cancel |
| R05 | Theme/preference shared qua Context | `context/ThemeContext.js` | Toggle ở nhiều screen |
| R06 | FlatList/SectionList | `screens/ActivityScreen.js` | Non-empty + empty |
| R07 | Persistence AsyncStorage | `storage/storageHelper.js` | First-run + restart |
| R08 | Reusable components | `components/*.js` | Render/reuse ≥2 nơi |
| R09 | Responsive Flexbox | toàn bộ `StyleSheet` | Portrait/kích thước cơ bản |
| R10 | Error/fallback state | `storage/storageHelper.js` (try/catch) | Invalid local data |

### 4.2 DDR (Design Decision Record) — điền tối thiểu 5 dòng

| Quyết định | Lựa chọn của tôi | Lý do | Impact nếu đổi requirement |
|---|---|---|---|
| Navigation | Stack Navigator | Scope không cần Tab/Drawer phức tạp | Thêm screen mới → chỉ thêm route |
| State ownership | Context cho profile/theme, local cho form | Cân bằng shared cần thiết vs. over-sharing | Thêm màn hình cần profile → không cần đổi kiến trúc |
| Persistence/hydration | Hydrate ở `useEffect` mount trong Provider | Đảm bảo data sẵn sàng trước khi UI phụ thuộc nó render | Đổi sang API thật → chỉ đổi bên trong `storageHelper` |
| List item structure | Object có `id` ổn định làm `keyExtractor` | Tránh re-render sai khi list thay đổi | Thêm field mới cho item → không ảnh hưởng key |
| Component reuse | `FormField` dùng chung cho name/bio | Giảm lặp code, validate tập trung | Thêm field `phone` → tái dùng `FormField` ngay |

### 4.3 Test Matrix (12 case)

| # | Nhóm | Case | Thao tác | Expected | Actual | Pass |
|---|---|---|---|---|---|---|
| 1 | Edge | First run | Không có AsyncStorage | Dùng default, không crash | | |
| 2 | Normal | Profile read | Mở Profile | Đúng dữ liệu | | |
| 3 | Negative | Edit invalid | Name rỗng | Không save, hiện lỗi | | |
| 4 | Normal | Edit valid | Đổi name/bio | Profile cập nhật ngay | | |
| 5 | Normal | Edit cancel | Sửa rồi Cancel | Không ghi đè | | |
| 6 | Normal | Theme toggle | Đổi light/dark | App-wide cập nhật | | |
| 7 | Normal | Theme persistence | Restart | Theme còn đúng | | |
| 8 | Normal | List normal | Có item | FlatList render đúng | | |
| 9 | Edge | List empty | Mảng rỗng | Hiện empty state | | |
| 10 | Normal | List interaction | Mark/toggle item | State/UI cập nhật đúng | | |
| 11 | Negative | Storage corrupt | JSON lỗi | Fallback an toàn | | |
| 12 | Edge | Navigation | Mở hết + back | Không crash/mất state ngoài design | | |

### 4.4 Debug Log (mẫu 2 lỗi)

| Lỗi | Giả thuyết | Cách kiểm tra | Root cause | Fix | Retest |
|---|---|---|---|---|---|
| (VD) Theme không đổi ở Home sau khi toggle | Provider không wrap đúng, hoặc Home không dùng `useContext` | Log giá trị context ở cả 2 nơi | Home đọc `props` cũ thay vì `useContext(ThemeContext)` | Sửa Home dùng `useContext` | Toggle → Home đổi ngay |
| (VD) Reload mất Profile đã lưu | Sai key AsyncStorage giữa lúc save và lúc load | So sánh string key ở 2 hàm | Key `"profile"` vs `"Profile"` không khớp | Thống nhất 1 hằng số `PROFILE_KEY` | Restart → dữ liệu còn đúng |

### 4.5 AI Usage Log

| # | Task/Prompt/Ref | Mục đích | Output có dùng? | Tôi đã sửa gì? | Kiểm chứng thế nào? |
|---|---|---|---|---|---|
| 1 | | | | | |
| 2 | | | | | |

---

## 5. Kịch bản Phòng thủ (Defense Rehearsal)

### 5.1 6 pha đánh giá

| Pha | Nội dung | Giảng viên chấm |
|---|---|---|
| A. Identity & Run | Mở đúng bản nộp, chạy lệnh chuẩn, demo nhanh | Tính xác thực, môi trường |
| B. Requirement Demo | Demo theo RTM, gồm cả failure/empty/edge | Problem Understanding + Implementation |
| C. Code Interview | Mở file GV chỉ định, giải thích flow | Code Explanation + Design Reasoning |
| D. Verification/Debug | Chạy test hoặc phân tích lỗi mới tại chỗ | Testing + Debugging |
| E. Transfer Task | Phân tích impact + sửa/mô tả thay đổi nhỏ | Modification/Transfer |
| F. AI Evidence | Trình bày AI log + cách kiểm chứng | AI Usage & Engineering Practice |

### 5.2 Phản xạ "Mở file trong ≤30 giây"

| Yêu cầu | Làm được? |
|---|---|
| Mở navigation config, chỉ route/screen | ☐ |
| Mở Context (Theme/Profile), chỉ provider/value | ☐ |
| Mở EditProfile save/validation logic | ☐ |
| Mở AsyncStorage helper/hydration | ☐ |
| Mở FlatList `renderItem`/`keyExtractor` | ☐ |
| Mở 1 component tái sử dụng, giải thích lý do tách | ☐ |

### 5.3 Mô hình giải thích 5 tầng (30 giây/lần)

1. **Purpose** — trách nhiệm của file/hàm này là gì?
2. **Input** — props/state/data nào vào?
3. **Trigger** — sự kiện/`useEffect`/action nào gọi nó?
4. **Transform** — logic biến đổi/validate/update state nào chạy?
5. **Output & Failure Path** — cái gì thay đổi? nếu lỗi thì rẽ nhánh nào?

### 5.4 Impact Analysis Worksheet (Transfer Task)

| Change request | Screen/component | State/data | Storage | UI/permission | Test phải sửa/thêm |
|---|---|---|---|---|---|
| Thêm field `phone` | EditProfileScreen, ProfileCard | Thêm `phone` vào profile model + validation | Cập nhật default object + schema lưu | Thêm FormField mới | Test valid/invalid phone |
| Thêm filter theo ngày cho Activity | ActivityScreen | Thêm state `filterDate` | Không đổi (nếu không persist filter) | Thêm UI filter control | Test filter đúng/không có kết quả |
| Offline draft cho Edit Profile | EditProfileScreen | Thêm `draft` state riêng, tách khỏi `profile` chính thức | Có thể thêm key `profileDraft` | Thêm nút "Resume draft" | Test lưu draft, thoát giữa chừng, quay lại còn draft |

---

## 6. Scorecard Tự Đánh giá (10.0 điểm)

| Tiêu chí | Max | Tự chấm | Evidence tôi sẽ mở khi được hỏi |
|---|---|---|---|
| Problem Understanding | 1.0 | | RTM + workflow sketch |
| Solution Design & Reasoning | 1.5 | | DDR (5 quyết định) |
| Implementation | 2.0 | | Demo 5-screen workflow trực tiếp |
| Testing & Verification | 1.5 | | Test Matrix (12 case) + actual result |
| Debugging & Problem Solving | 1.5 | | 2 Debug Log + tái hiện live |
| Code Explanation | 1.0 | | Mở 6 file trong mục 5.2 |
| Modification/Transfer Task | 1.0 | | Impact Worksheet + demo 1 thay đổi |
| AI Usage & Engineering Practice | 0.5 | | AI Usage Log |
| **TỔNG** | **10.0** | | |

**Vì sao Implementation chỉ tối đa 2.0/10?** Code chạy được là điều kiện cần, không phải đủ. 8.0đ còn lại đo năng lực đứng sau code: lập luận thiết kế, tự kiểm chứng, chẩn đoán lỗi có hệ thống, diễn giải luồng dữ liệu, chuyển giao kiến thức sang yêu cầu mới, và minh bạch khi dùng AI — đây là cơ chế chống nộp code chạy được nhưng không hiểu.

---

## 7. Final Sanity Checklist

**Kỹ thuật**
- ☐ Không còn console/runtime error nghiêm trọng
- ☐ Không có chỗ nào mutate state trực tiếp (`push`, gán trực tiếp field) — luôn `.map()`/`.filter()`/spread
- ☐ `storageHelper` có `try/catch` bọc `JSON.parse`, fallback default rõ ràng
- ☐ Không commit API key/secret thật vào repo hay file nộp

**Hồ sơ**
- ☐ README chạy được từ môi trường sạch (`git clone` → `npm install` → `expo start`)
- ☐ RTM, DDR (≥5 quyết định), Test Matrix, ≥2 Debug Log, AI Usage Log đầy đủ

**Kế hoạch 45–60 phút trước buổi bảo vệ**

| Thời gian | Việc làm |
|---|---|
| 0–10' | Clone/mở đúng bản nộp, cài dependency, chạy app, xác nhận version |
| 10–25' | Chạy smoke test toàn bộ 12 case, ưu tiên negative/edge |
| 25–35' | Ôn lại RTM/DDR, luyện giải thích 2–3 luồng chính (Edit Profile, Theme/Persistence) |
| 35–45' | Luyện 1 debug case + 1 transfer case **không dùng AI** |
| 45–60' | Kiểm tra README/Test Matrix/Debug Log/AI Log, chuẩn bị trạng thái demo ổn định |
