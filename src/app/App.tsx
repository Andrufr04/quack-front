import AppProvider from './providers/AppProvider/ui/AppProvider'
import AppRouter from './router/AppRouter'
import './styles/global.css'
import './styles/normalize.css'
import './styles/variables.css'
import '../shared/config/i18n/i18n.ts'

function App() {
  return <AppProvider>
    <AppRouter />
  </AppProvider>
}

export default App
