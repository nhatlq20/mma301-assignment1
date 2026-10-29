// MMA301 - Le Quang Nhat - CE190875
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