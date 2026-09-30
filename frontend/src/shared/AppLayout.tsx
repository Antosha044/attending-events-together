import { Button, Layout, Menu } from 'antd'
import { CalendarOutlined, CompassOutlined, PlusOutlined } from '@ant-design/icons'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import ProfileControl from '../features/profile/ui/ProfileControl'

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, storageError } = useAppData()
  const activeKey = location.pathname === '/my-events' ? 'my-events' : 'events'

  return (
    <Layout className="app-shell">
      <header className="topbar">
        <Link to="/events" className="brand" aria-label="События вместе — главная"><span className="brand-mark">С</span><span>События вместе</span></Link>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <Link className={activeKey === 'events' ? 'nav-link active' : 'nav-link'} to="/events"><CompassOutlined /> Афиша</Link>
          <Link className={activeKey === 'my-events' ? 'nav-link active' : 'nav-link'} to="/my-events"><CalendarOutlined /> Мои встречи</Link>
        </nav>
        <div className="topbar-actions">
          <Button className="create-button" icon={<PlusOutlined />} onClick={() => navigate('/events/new')}>Создать событие</Button>
          <ProfileControl />
        </div>
      </header>
      {storageError && <div role="alert" className="storage-alert">{storageError}</div>}
      <main className="main-content"><Outlet /></main>
      <footer className="footer"><span>События вместе</span><span><CalendarOutlined /> {profile.city}</span></footer>
      <Menu className="mobile-nav" selectedKeys={[activeKey]} mode="horizontal" items={[
        { key: 'events', icon: <CompassOutlined />, label: <Link to="/events">Афиша</Link> },
        { key: 'my-events', icon: <CalendarOutlined />, label: <Link to="/my-events">Мои встречи</Link> },
        { key: 'create', icon: <PlusOutlined />, label: <Link to="/events/new">Создать</Link> },
      ]} />
    </Layout>
  )
}
