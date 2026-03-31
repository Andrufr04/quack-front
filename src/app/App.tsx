import AppProvider from './providers/AppProvider/ui/AppProvider'
import AppRouter from './router/AppRouter'
import './styles/global.css'
import './styles/normalize.css'
import './styles/variables.css'
import '../shared/config/i18n/i18n.ts'
import { useEffect, useState } from 'react'
import { API_URL, handleLogout } from '../shared/api/api.ts'
import { jwtDecode } from "jwt-decode";

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
        localStorage.removeItem('active_role')
        window.location.href = '/signin';
      }
    };

    verifyToken();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      try {
        const { exp }: any = jwtDecode(token);
        if (Date.now() >= exp * 1000) {
          handleLogout();
        }
      } catch (e) {
        handleLogout();
      }
    }
  }, [window.location.pathname]);

  useEffect(() => {
    // 1. Пытаемся достать сохраненный цвет
    const savedColor = localStorage.getItem('color');

    // Если цвет есть — применяем его сразу к переменной
    if (savedColor) {
      document.documentElement.style.setProperty('--color-main', savedColor);
    }
  }, []); // Пустой массив значит "выполни один раз при загрузке сайта"

  const updateFavicon = () => {
    const color = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-main')
      .trim();

    const svg = `
    <svg width="30" height="36" viewBox="0 0 30 36" fill="none" xmlns="http://www.w3.org/2000/svg">
<g filter="url(#filter0_i_97_157)">
<path d="M15 0C23.0322 0.000217465 29.5899 6.31395 29.9814 14.249H29.9922V14.5361C29.9969 14.6902 30 14.8448 30 15C30 15.1551 29.9969 15.3099 29.9922 15.4639V35.6211C25.7426 35.6211 22.2061 32.5765 21.4404 28.5498C19.4889 29.4792 17.3054 29.9999 15 30C6.71582 29.9999 0.000167863 23.2842 0 15C0.000286574 6.71594 6.71589 7.62842e-05 15 0ZM15.1426 9.14258C11.9869 9.14274 9.42892 11.7018 9.42871 14.8574C9.42888 18.0131 11.9869 20.5711 15.1426 20.5713C18.2982 20.5711 20.8573 18.0131 20.8574 14.8574C20.8572 11.7018 18.2982 9.1428 15.1426 9.14258Z" fill="${color}"/>
</g>
<defs>
<filter id="filter0_i_97_157" x="0" y="0" width="30" height="38.6211" filterUnits="userSpaceOnUse" color-interpolation-filters="sRGB">
<feFlood flood-opacity="0" result="BackgroundImageFix"/>
<feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape"/>
<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
<feOffset dy="3"/>
<feGaussianBlur stdDeviation="4.95"/>
<feComposite in2="hardAlpha" operator="arithmetic" k2="-1" k3="1"/>
<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
<feBlend mode="normal" in2="shape" result="effect1_innerShadow_97_157"/>
</filter>
</defs>
</svg>

  `;

    const url = "data:image/svg+xml," + encodeURIComponent(svg);

    let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;

    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }

    link.href = url;
  };

  useEffect(() => {
    updateFavicon();

    const observer = new MutationObserver(updateFavicon);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    return () => observer.disconnect();
  }, []);

  if (isChecking) return <></>;

  return <AppProvider>
    <AppRouter />
  </AppProvider>
}

export default App
