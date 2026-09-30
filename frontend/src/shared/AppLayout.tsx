import { Avatar, Button, Layout, Menu } from 'antd'
import { CalendarOutlined, CompassOutlined, PlusOutlined, UserOutlined } from '@ant-design/icons'
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const onEventForm = location.pathname.endsWith('/new') || location.pathname.endsWith('/edit')
  return (
    <Layout className="app-shell">
      <header className="topbar">
        <Link to="/events" className="brand"><span className="brand-mark">р</span><span>рядом<span className="brand-period">.</span></span></Link>
        <nav className="desktop-nav"><Link className={location.pathname.includes('/events') ? 'nav-link active' : 'nav-link'} to="/events"><CompassOutlined /> События</Link><span className="nav-link muted-link"><UserOutlined /> Мои встречи</span></nav>
        <div className="topbar-actions"><Button className="create-button" icon={<PlusOutlined />} onClick={() => navigate('/events/new')}>Создать событие</Button><Avatar className="profile-avatar">А</Avatar></div>
      </header>
      <main className="main-content"><Outlet /></main>
      <footer className="footer"><span>рядом<span className="brand-period">.</span> · чтобы было с кем</span><span><CalendarOutlined /> Москва · демо-версия</span></footer>
      {onEventForm && <Menu className="mobile-nav" selectedKeys={['events']} items={[{ key: 'events', icon: <CompassOutlined />, label: <Link to="/events">События</Link> }, { key: 'create', icon: <PlusOutlined />, label: <Link to="/events/new">Создать</Link> }]} />}
    </Layout>
  )
}
