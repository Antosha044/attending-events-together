import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider } from 'antd'
import ruRU from 'antd/locale/ru_RU'
import App from './app/App'
import './styles.css'
import './loading.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={ruRU}
      theme={{ token: { colorPrimary: '#356b55', colorText: '#212a25', colorBgContainer: '#ffffff', borderRadius: 12, fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' } }}
    >
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)
