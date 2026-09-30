import { Avatar, Input } from 'antd'
import { ArrowLeftOutlined, LockOutlined, SendOutlined } from '@ant-design/icons'
import { Link, useParams } from 'react-router-dom'
import { getEvent } from '../data/events'
import PageIntro from '../shared/PageIntro'
import NotFoundPage from './NotFoundPage'

const messages = [{ name: 'Маша', time: '12:41', text: 'Всем привет! Как вам идея встретиться немного заранее и прогуляться по саду?' }, { name: 'Аня', time: '12:47', text: 'Привет! Я только за 🌿 Там сейчас очень красиво.' }, { name: 'Илья', time: '13:02', text: 'Тогда давайте у фонтана, в 19:00?' }, { name: 'Вы', time: '13:10', text: 'Отличный план, буду!' }]

export default function ChatPage() {
  const event = getEvent(useParams().eventId ?? '')
  if (!event) return <NotFoundPage />
  return <div className="chat-page"><Link to={`/events/${event.id}/group`} className="back-link"><ArrowLeftOutlined /> К группе</Link><div className="chat-window"><div className="chat-header"><Avatar style={{ background: '#d8eadf', color: '#356b55' }}>✳</Avatar><div><b>Компания на событие</b><span>{event.title} · {event.going} участника</span></div><Link to={`/events/${event.id}/group`}>Участники</Link></div><div className="chat-date">СЕГОДНЯ</div><div className="chat-messages">{messages.map((message, i) => <div className={`message-row ${i === messages.length - 1 ? 'own-message' : ''}`} key={message.name}><Avatar size={32} style={{ background: ['#f0c2a7', '#d7c8f3', '#bad2d5', '#e9d69e'][i] }}>{message.name[0]}</Avatar><div className="message-body"><span className="message-meta"><b>{message.name}</b> · {message.time}</span><div className="message-bubble">{message.text}</div></div></div>)}</div><div className="chat-composer"><Input disabled placeholder="Чат пока доступен только в макете" suffix={<SendOutlined className="send-muted" />} /><small><LockOutlined /> Сообщения не отправляются в демонстрационной версии</small></div></div><PageIntro eyebrow="ОБЩЕНИЕ БЕЗ ЛИШНИХ ФОРМАЛЬНОСТЕЙ" title="Знакомимся до встречи" description="Здесь компания сможет договориться о деталях и узнать друг друга." /></div>
}
