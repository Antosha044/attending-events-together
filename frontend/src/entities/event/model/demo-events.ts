import type { EventItem, EventMessage } from './types'

export const demoEvents: EventItem[] = [
  {
    id: 'jazz', title: 'Вечер джаза в саду', category: 'Музыка', dateLabel: 'Сегодня',
    dateTime: '2026-10-01T19:30', time: '19:30', city: 'Москва', venue: 'Сад «Эрмитаж»',
    address: 'Каретный ряд, 3', description: 'Живая джазовая музыка в саду в центре города.',
    going: 4, capacity: 8, price: 'Бесплатно', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85', host: 'Маша', hostInitials: 'М', hostColor: 'peach',
  },
  {
    id: 'exhibition', title: '«Форма тишины» — выставка', category: 'Искусство', dateLabel: 'Сб, 3 октября',
    dateTime: '2026-10-03T15:00', time: '15:00', city: 'Москва', venue: 'Музей современного искусства',
    address: 'Гоголевский бульвар, 10', description: 'Выставка молодых художников и обсуждение работ после просмотра.',
    going: 6, capacity: 10, price: '600 ₽', image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=85', host: 'Аня', hostInitials: 'А', hostColor: 'lilac',
  },
  {
    id: 'walk', title: 'Гуляем по Коломенскому', category: 'Прогулка', dateLabel: 'Вс, 4 октября',
    dateTime: '2026-10-04T12:00', time: '12:00', city: 'Москва', venue: 'Музей-заповедник Коломенское',
    address: 'Проспект Андропова, 39', description: 'Прогулка по яблоневым садам и набережной.',
    going: 3, capacity: 7, price: 'Бесплатно', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85', host: 'Илья', hostInitials: 'И', hostColor: 'blue',
  },
  {
    id: 'cinema', title: 'Кино под открытым небом', category: 'Кино', dateLabel: 'Пт, 9 октября',
    dateTime: '2026-10-09T20:00', time: '20:00', city: 'Москва', venue: 'Летний кинотеатр «Пионер»',
    address: 'Парк Горького', description: 'Классика на большом экране под вечерним небом.',
    going: 9, capacity: 12, price: '450 ₽', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=85', host: 'Саша', hostInitials: 'С', hostColor: 'yellow',
  },
]

export const initialMessages: Record<string, EventMessage[]> = {
  jazz: [
    { id: 'jazz-1', name: 'Маша', time: '12:41', text: 'Предлагаю встретиться немного заранее и прогуляться по саду.' },
    { id: 'jazz-2', name: 'Аня', time: '12:47', text: 'Там сейчас очень красиво 🌿' },
    { id: 'jazz-3', name: 'Илья', time: '13:02', text: 'Тогда у фонтана, в 19:00?' },
  ],
}
