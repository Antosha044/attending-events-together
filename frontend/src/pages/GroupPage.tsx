import { Avatar, Button, Tag } from 'antd'
import { ArrowLeftOutlined, CheckOutlined, EnvironmentOutlined, MessageOutlined, TeamOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import { getEvent } from '../data/events'
import PageIntro from '../shared/PageIntro'
import NotFoundPage from './NotFoundPage'

const people = [{ name: 'Маша', note: 'Организатор', initial: 'М', color: '#f0c2a7' }, { name: 'Аня', note: 'Любит живую музыку', initial: 'А', color: '#d7c8f3' }, { name: 'Илья', note: 'Будет чуть заранее', initial: 'И', color: '#bad2d5' }, { name: 'Лена', note: 'Здесь за атмосферой', initial: 'Л', color: '#e9d69e' }]

export default function GroupPage() {
  const event = getEvent(useParams().eventId ?? '')
  if (!event) return <NotFoundPage />
  return <div className="subpage"><Link to={`/events/${event.id}`} className="back-link"><ArrowLeftOutlined /> К событию</Link><PageIntro eyebrow="ИДЁМ ВМЕСТЕ" title="Наша компания" description={`${event.title} · ${event.dateLabel}`} action={<Tag className="open-tag" bordered={false}><span className="status-dot"/> Группа открыта</Tag>} /><div className="group-summary"><div className="group-summary-icon"><TeamOutlined /></div><div><b>{event.going} из {event.capacity} участников</b><span>Ещё есть место — будем рады знакомству</span></div><Button type="primary" disabled>Присоединиться</Button></div><h2 className="section-title">Участники <span>04</span></h2><div className="people-list">{people.map((person, i) => <div className="person-row" key={person.name}><Avatar style={{ backgroundColor: person.color, color: '#354039' }}>{person.initial}</Avatar><div className="person-info"><b>{person.name}</b><span>{person.note}</span></div>{i === 0 ? <Tag bordered={false}>Организатор</Tag> : <CheckOutlined className="member-check" />}</div>)}</div><div className="meetup-location"><EnvironmentOutlined /><span><b>Встречаемся у центрального входа в сад</b><small>{event.venue}, {event.address}</small></span></div><div className="demo-note"><MessageOutlined /> Группа и список участников показаны на демонстрационных данных.</div></div>
}
