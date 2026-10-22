import { Alert, Button, Layout, Menu, Spin } from 'antd'
import { CalendarOutlined, CompassOutlined, PlusOutlined } from '@ant-design/icons'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAppData } from '../app/providers/AppDataProvider'
import ProfileControl from '../features/profile/ui/ProfileControl'

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile, dataError, loading } = useAppData()
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
      {dataError && <div className="request-error" role="alert"><Alert type="error" showIcon message="Не удалось выполнить запрос" description={dataError} closable /></div>}
      <main className="main-content">{loading ? <div className="route-loading"><Spin /> Загружаем события…</div> : <Outlet />}</main>
      <footer className="footer"><span>События вместе</span><span><CalendarOutlined /> {profile.city}</span></footer>
      <Menu className="mobile-nav" selectedKeys={[activeKey]} mode="horizontal" items={[
        { key: 'events', icon: <CompassOutlined />, label: <Link to="/events">Афиша</Link> },
        { key: 'my-events', icon: <CalendarOutlined />, label: <Link to="/my-events">Мои встречи</Link> },
        { key: 'create', icon: <PlusOutlined />, label: <Link to="/events/new">Создать</Link> },
      ]} />
    </Layout>
  )
}
