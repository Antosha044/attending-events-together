import { useState } from 'react'
import { Button, Input } from 'antd'
import { ArrowRightOutlined, SearchOutlined, SlidersOutlined, StarOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'
import { events } from '../data/events'
import EventCard from '../shared/EventCard'
import PageIntro from '../shared/PageIntro'

const categories = ['Все события', 'Музыка', 'Искусство', 'Прогулки', 'Кино', 'Еда']

export default function EventsPage() {
  const [category, setCategory] = useState('Все события')
  const [query, setQuery] = useState('')
  const filtered = events.filter((event) => (category === 'Все события' || event.category === category || (category === 'Прогулки' && event.category === 'Прогулка')) && event.title.toLowerCase().includes(query.toLowerCase()))
  return (
    <>
      <section className="hero-banner"><div className="hero-copy"><div className="hero-kicker"><StarOutlined /> НОВЫЕ ВПЕЧАТЛЕНИЯ БЛИЖЕ</div><h1>Хорошие планы<br /><span>лучше вместе.</span></h1><p>Находи события по душе и людей, с которыми захочется разделить этот день.</p><Link to="/events#listing" className="hero-link">Посмотреть события <ArrowRightOutlined /></Link></div><div className="hero-art"><img src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1100&q=85" alt="Друзья проводят время вместе"/><div className="hero-note"><span className="note-avatars"><i>М</i><i>А</i><i>И</i></span><span>Уже идут<br /><strong>248 человек</strong></span></div><span className="hero-sticker">не<br/>одни ✳</span></div></section>
      <section className="events-section" id="listing"><PageIntro eyebrow="АФИША ГОРОДА" title="Найди своё событие" description="Интересные планы и компания на ближайшие дни." action={<Input className="search-input" prefix={<SearchOutlined />} placeholder="Найти событие" value={query} onChange={(e) => setQuery(e.target.value)} />} />
        <div className="filter-row"><div className="category-list">{categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`category-chip ${category === item ? 'selected' : ''}`}>{item}</button>)}</div><Button className="filter-button" icon={<SlidersOutlined />} disabled title="Дополнительные фильтры пока недоступны">Фильтры</Button></div>
        {filtered.length ? <div className="events-grid">{filtered.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}</div> : <div className="empty-state"><span>Пока здесь тихо</span><p>Попробуйте изменить запрос или категорию.</p></div>}
        <div className="more-events"><span>Каждая встреча — начало истории.</span><Button type="link" onClick={() => { setCategory('Все события'); setQuery('') }}>Все события <ArrowRightOutlined /></Button></div>
      </section>
    </>
  )
}
