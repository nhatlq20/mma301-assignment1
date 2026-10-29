# Luồng Thực Thi Chi Tiết Của Ứng Dụng React Native (Execution Workflow)

Tài liệu này phân tích chi tiết quy luật thực thi từng bước (step-by-step) của dự án **`mma301-assignment1`**, bắt đầu từ khi bạn gõ lệnh `npm start` trong terminal cho đến khi giao diện hiển thị trên thiết bị và tiếp nhận tương tác người dùng.

---

## 1. Sơ Đồ Tổng Quan Chuỗi Phương Thức (Method-to-Method Flow)

```text
Terminal: npm start
  │
  ▼
expo start (Expo CLI)
  │
  ▼
Metro Bundler Start (Port 8081)
  │
  ▼
Đọc package.json ("main": "index.js")
  │
  ▼
Thiết bị tải Bundle JS (Hermes / JavaScript Engine)
  │
  ▼
index.js: registerRootComponent(App)
  │
  ▼
AppRegistry.registerComponent('main', () => App)
  │
  ▼
App()
  │
  ├──► ThemeProvider() [Render lần 1: isReady = false]
  │       │
  │       ├──► return null (chưa render con, ngăn chớp màn hình)
  │       │
  │       └──► ThemeProvider.useEffect() kích hoạt sau render
  │               │
  │               ▼
  │            getTheme() (storageHelper.js)
  │               │
  │               ▼
  │            AsyncStorage.getItem('@app_theme')
  │               │
  │               ▼
  │            setIsDark(saved) & setIsReady(true) 
  │               │ (Kích hoạt RE-RENDER LẦN 2)
  │
  └──► ThemeProvider() [Render lần 2: isReady = true]
          │
          ├──► return <ThemeContext.Provider> {children} </ThemeContext.Provider>
          │
          └──► ProfileProvider()
                  │
                  ├──► ProfileProvider.useEffect()
                  │       └──► getProfile() ──► AsyncStorage.getItem('@app_profile') ──► setProfile(loaded)
                  │
                  └──► AppNavigator()
                          │
                          ▼
                       NavigationContainer()
                          │
                          ▼
                       Stack.Navigator(initialRouteName="Home")
                          │
                          ▼
                       HomeScreen({ navigation })
                          │
                          ├──► useTheme() (Lấy colors từ ThemeContext)
                          │
                          └──► return JSX (<SafeAreaView>, <Text>, <PrimaryButton>)
                                  │
                                  ▼
                               Yoga Engine tính toán Flexbox & Toạ độ pixel
                                  │
                                  ▼
                               Native UI Render lên màn hình Android / iOS!
```

---

## 2. Phân Tích Chi Tiết Từng Giai Đoạn

---

### Giai Đoạn 1: Từ Terminal Đến Metro Bundler (`npm start`)

#### 1. Lệnh gọi Terminal
```bash
npm start
```
* **Tệp liên quan:** `package.json`
* **Cơ chế:** 
  `npm` tìm khối script trong `package.json`:
  ```json
  "scripts": {
    "start": "expo start"
  }
  ```
  Nó thực thi lệnh `expo start`.

#### 2. Khởi tạo Metro Bundler
* Expo CLI khởi động **Metro Bundler** (công cụ đóng gói Javascript tương tự như Webpack trên môi trường web).
* Metro đọc tệp cấu hình và tìm trường `"main": "index.js"` để xác định đâu là tệp nhập cảnh (Entry Point) của dự án.
* Metro mở một HTTP/WebSocket server (mặc định tại cổng `8081`) để sẵn sàng truyền mã nguồn JS tới ứng dụng trên điện thoại / máy ảo.

---

### Giai Đoạn 2: Nạp Mã Nguồn Và Khởi Động Native Engine (`index.js`)

Khi bạn mở Expo Go (hoặc máy ảo Android/iOS) và kết nối với Metro Bundler:

1. **Tải Bundle:** Máy ảo/Điện thoại tải toàn bộ mã nguồn JavaScript đã được Metro đóng gói (Bundle).
2. **Khởi tạo Engine:** Động cơ JavaScript (Hermes Engine) trên điện thoại khởi chạy và bắt đầu đọc `index.js`.

#### Chi tiết từng dòng lệnh trong `index.js`:
```javascript
// index.js
import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent gọi AppRegistry.registerComponent('main', () => App);
registerRootComponent(App);
```
* `import { registerRootComponent } from 'expo'`: Nạp hàm hỗ trợ khởi tạo của Expo.
* `import App from './App'`: Nạp component gốc của bạn.
* `registerRootComponent(App)`: 
  * Trong React Native gốc, bạn phải dùng `AppRegistry.registerComponent('main', () => App)`.
  * Hàm này đăng ký component `App` làm điểm neo gốc (Root Component) cho hệ thống Native của hệ điều hành biết nơi bắt đầu vẽ giao diện.

---

### Giai Đoạn 3: Dựng Cây Component Gốc (`App.js`)

React Native triệu gọi hàm `App()`:

```javascript
// App.js
import { ThemeProvider } from './src/context/ThemeContext';
import { ProfileProvider } from './src/context/ProfileContext';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <ThemeProvider>
      <ProfileProvider>
        <AppNavigator />
      </ProfileProvider>
    </ThemeProvider>
  )
}
```

* **Quy luật thứ tự thực thi của React Component Tree:**
  * Component cha bọc ngoài cùng sẽ được thực thi trước: `ThemeProvider` -> `ProfileProvider` -> `AppNavigator`.

---

### Giai Đoạn 4: Vòng Đời Render & Bất Đồng Bộ Dữ Liệu (Async Hydration)

Đây là giai đoạn xử lý dữ liệu lưu trữ cục bộ (`AsyncStorage`) kết hợp vòng đời của React Hooks:

#### Bước 4.1: Render Lần 1 của `ThemeProvider`
Tại `src/context/ThemeContext.js`:
```javascript
export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);  // State khởi tạo: false
    const [isReady, setIsReady] = useState(false); // State khởi tạo: false

    useEffect(() => {
        (async () => {
            const saved = await getTheme();
            setIsDark(saved);
            setIsReady(true);
        })();
    }, []);

    const colors = isDark ? darkColors : lightColors;
    if (!isReady) return null; // <-- CHÚ Ý ĐIỂM NÀY

    return (
        <ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}
```

* **Tại sao `if (!isReady) return null`?**
  * Trong lần đầu hàm `ThemeProvider` được gọi, `isReady` có giá trị khởi tạo là `false`.
  * Gặp lệnh `if (!isReady) return null`, hàm kết thúc ngay lập tức và trả về `null`.
  * **Ý nghĩa:** Tạm thời không render các component con (`ProfileProvider`, `AppNavigator`). Kỹ thuật này giúp tránh hiện tượng chớp/nháy giao diện trắng-đen (flickering) khi chưa kịp đọc thiết lập theme cũ từ máy.

#### Bước 4.2: Chạy Side-Effect đọc bộ nhớ ngầm (`useEffect`)
* Sau khi render lần 1 kết thúc (trả về `null`), React kích hoạt hàm callback trong `useEffect`:
  1. `getTheme()` trong `src/storage/storageHelper.js` được gọi.
  2. `await AsyncStorage.getItem('@app_theme')` đọc dữ liệu lưu trữ từ ổ cứng điện thoại.
  3. `setIsDark(saved)`: Cập nhật theme đọc được.
  4. `setIsReady(true)`: Đánh dấu đã đọc xong dữ liệu.

#### Bước 4.3: Render Lần 2 của `ThemeProvider` (Re-render)
* Việc gọi `setIsReady(true)` khiến React kích hoạt render lại `ThemeProvider`:
  1. `isReady` lúc này đã bằng `true`.
  2. Bỏ qua điều kiện `if (!isReady) return null`.
  3. Trả về `<ThemeContext.Provider value={{ isDark, colors, toggleTheme }}>` và cho phép `{children}` bên trong được render!

---

### Giai Đoạn 5: Khởi Tạo `ProfileProvider` & Bộ Điều Hướng (`AppNavigator`)

Lúc này, các component con bên trong `{children}` bắt đầu chạy:

#### 1. `ProfileProvider` (`src/context/ProfileContext.js`):
* Khởi tạo state `profile = null`, `isReady = false`.
* Đăng ký `useEffect` để chạy `getProfile()` đọc dữ liệu thông tin cá nhân từ `AsyncStorage`.
* Cung cấp các hàm `updateProfile` và dữ liệu `profile` xuống cây component qua `ProfileContext.Provider`.

#### 2. `AppNavigator` (`src/navigation/AppNavigator.js`):
```javascript
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
```
* `<NavigationContainer>`: Khởi tạo hệ thống định tuyến (Routing State) và lắng nghe nút Back vật lý của điện thoại.
* `<Stack.Navigator initialRouteName="Home">`: Khởi tạo ngăn xếp màn hình (Stack), đọc thuộc tính `initialRouteName="Home"` để quyết định hiển thị màn hình `HomeScreen` đầu tiên.
* Stack gọi hàm component `HomeScreen({ navigation })`.

---

### Giai Đoạn 6: Hiển Thị Màn Hình Đầu Tiên (`HomeScreen.js`)

Tại `src/screens/HomeScreen.js`:
```javascript
export default function HomeScreen({ navigation }) {
    const { colors } = useTheme(); // Lấy bảng màu từ ThemeContext

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
```

1. **`useTheme()`**: Lấy đối tượng màu sắc tương ứng (`lightColors` hoặc `darkColors`) mà `ThemeContext` cung cấp.
2. **Trả về JSX (Virtual DOM)**:
   * `<SafeAreaView>`: Đảm bảo giao diện không lẹm vào tai thỏ, phần bo góc hay thanh Home Indicator của máy.
   * `<Text>`, `<View>`, `<PrimaryButton>`: Được chuyển thành các đối tượng React Element.
3. **Chuyển đổi sang Native UI**:
   * Cây Virtual DOM được gửi qua luồng Native.
   * **Yoga Layout Engine** của Meta tính toán kích thước thực tế theo Flexbox.
   * Hệ điều hành vẽ các thành phần tương ứng:
     * `<Text>` -> `android.widget.TextView` (Android) hoặc `UILabel` (iOS).
     * `<View>` -> `android.view.ViewGroup` (Android) hoặc `UIView` (iOS).

---

### Giai Đoạn 7: Vòng Lặp Xử Lý Sự Kiện Người Dùng (Event Loop)

Khi ứng dụng đã hiển thị trên màn hình:

```text
Người dùng chạm ngón tay vào nút "Xem hồ sơ"
  │
  ▼
Hệ điều hành nhận sự kiện Touch Event
  │
  ▼
PrimaryButton (Pressable / TouchableOpacity) kích hoạt hàm onPress
  │
  ▼
navigation.navigate('Profile')
  │
  ▼
React Navigation Stack nhận lệnh Push
  │
  ▼
Màn hình ProfileScreen được nạp và kích hoạt render
  │
  ▼
ProfileScreen dùng useProfile() lấy thông tin và vẽ giao diện hồ sơ
```

---

## 3. Tóm Tắt Quy Luật Cốt Lõi Cần Nhớ Cho Người Mới Bắt Đầu

| Thành phần | Vai trò thực thi |
| :--- | :--- |
| **Metro Bundler** | Trình đóng gói toàn bộ code JS thành 1 bundle file gửi cho app khi gõ `npm start`. |
| **`index.js`** | Điểm bắt đầu của ứng dụng JS, đăng ký root component với Native (`registerRootComponent`). |
| **`Context Providers`** | Bọc ngoài cùng để chia sẻ dữ liệu toàn cục (Theme, Profile) xuống mọi màn hình con. |
| **`useState` + `useEffect`** | `useState` khởi tạo biến -> Render lần 1 -> `useEffect` chạy bất đồng bộ đọc `AsyncStorage` -> Cập nhật state -> Re-render lần 2 với dữ liệu thật. |
| **`React Navigation`** | Quản lý ngăn xếp (Stack) màn hình, quyết định màn hình nào được hiển thị dựa trên URL/Route name. |
| **Yoga Engine** | Chuyển đổi mã JS/JSX Flexbox thành giao diện gốc (Native View) chạy mượt mà trên iOS và Android. |

