import { useMemo, useState } from 'react'
import { Empty, Input, Select } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import { useAppData } from '../app/providers/AppDataProvider'
import EventCard from '../shared/EventCard'

const categories = ['Все события', 'Музыка', 'Искусство', 'Прогулка', 'Кино', 'Еда']
const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург']

export default function EventsPage() {
  const { events, profile, saveProfile } = useAppData()
  const city = profile.city || 'Москва'
  const [category, setCategory] = useState('Все события')
  const [query, setQuery] = useState('')
  const filtered = useMemo(() => events.filter((event) =>
    event.city === city &&
    (category === 'Все события' || event.category === category) &&
    `${event.title} ${event.venue} ${event.description}`.toLocaleLowerCase('ru').includes(query.toLocaleLowerCase('ru')),
  ), [events, city, category, query])

  return (
    <section className="events-section events-page">
      <div className="events-toolbar">
        <div>
          <div className="eyebrow">АФИША</div>
          <h1>События вместе</h1>
        </div>
        <label className="city-picker">
          <span>Город</span>
          <Select aria-label="Выбрать город" value={city} onChange={(value) => {
            try { saveProfile({ ...profile, city: value }) } catch { /* The global storage alert explains persistence errors. */ }
          }} options={cities.map((value) => ({ value, label: value }))} />
        </label>
      </div>

      <div className="events-controls">
        <Input className="search-input" prefix={<SearchOutlined />} placeholder="Название или место" value={query} onChange={(event) => setQuery(event.target.value)} allowClear />
        <div className="category-list" aria-label="Категории событий">
          {categories.map((item) => <button type="button" key={item} onClick={() => setCategory(item)} className={`category-chip ${category === item ? 'selected' : ''}`} aria-pressed={category === item}>{item}</button>)}
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="events-grid">{filtered.map((event, index) => <EventCard key={event.id} event={event} index={index} />)}</div>
      ) : (
        <div className="events-empty"><Empty description={events.length === 0 ? 'Событий пока нет' : `В городе «${city}» событий по этому запросу нет`} /></div>
      )}
    </section>
  )
}
