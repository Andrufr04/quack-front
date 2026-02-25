import AppProvider from './providers/AppProvider/ui/AppProvider'
import AppRouter from './router/AppRouter'
import './styles/global.css'
import './styles/normalize.css'
import './styles/variables.css'

function App() {
  return <AppProvider>
    <AppRouter />
  </AppProvider>
}

export default App
