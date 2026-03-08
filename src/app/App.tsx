import AppProvider from './providers/AppProvider/ui/AppProvider'
import AppRouter from './router/AppRouter'
import './styles/global.css'
import './styles/normalize.css'
import './styles/variables.css'
import '../shared/config/i18n/i18n.ts'
import { useEffect, useState } from 'react'
import { API_URL } from '../shared/api/api.ts'

function App() {
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const token = localStorage.getItem('access_token');

      if (!token) {
        if (!window.location.pathname.includes('/signin')) {
          window.location.href = '/signin'
        }
        setIsChecking(false)
        return
      }

      try {
        const response = await fetch(`${API_URL}/api/token/verify/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token })
        });

        if (!response.ok) {
          throw new Error("Invalid token");
        }

        setIsChecking(false);
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/signin';
      }
    };

    verifyToken();
  }, []);

  if (isChecking) return <></>;

  return <AppProvider>
    <AppRouter />
  </AppProvider>
}

export default App
