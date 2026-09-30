import type { DemoEvent } from '../types/event'

export const events: DemoEvent[] = [
  {
    id: 'jazz', title: 'Вечер джаза в саду', category: 'Музыка', dateLabel: 'Сегодня, 19:30', time: '19:30',
    venue: 'Сад «Эрмитаж»', address: 'Каретный ряд, 3', description: 'Тёплый вечер, живая музыка и большой зелёный сад в самом центре. Берите плед и хорошее настроение — остальное найдём на месте.',
    going: 4, capacity: 8, price: 'Бесплатно', image: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=1000&q=85', host: 'Маша', hostInitials: 'М', hostColor: 'peach',
  },
  {
    id: 'exhibition', title: '«Форма тишины» — выставка', category: 'Искусство', dateLabel: 'Сб, 3 октября', time: '15:00',
    venue: 'Музей современного искусства', address: 'Гоголевский бульвар, 10', description: 'Новая выставка молодых художников о том, что остаётся между словами. После — кофе неподалёку и обсуждение любимых работ.',
    going: 6, capacity: 10, price: '600 ₽', image: 'https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?auto=format&fit=crop&w=1000&q=85', host: 'Аня', hostInitials: 'А', hostColor: 'lilac',
  },
  {
    id: 'walk', title: 'Гуляем по Коломенскому', category: 'Прогулка', dateLabel: 'Вс, 4 октября', time: '12:00',
    venue: 'Музей-заповедник Коломенское', address: 'Проспект Андропова, 39', description: 'Неспешная прогулка по яблоневым садам и набережной. Можно присоединиться в любой момент маршрута.',
    going: 3, capacity: 7, price: 'Бесплатно', image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1000&q=85', host: 'Илья', hostInitials: 'И', hostColor: 'blue',
  },
  {
    id: 'cinema', title: 'Кино под открытым небом', category: 'Кино', dateLabel: 'Пт, 9 октября', time: '20:00',
    venue: 'Летний кинотеатр «Пионер»', address: 'Парк Горького', description: 'Смотрим классику на большом экране под вечерним небом. Сбор у главного входа, пледы и попкорн приветствуются.',
    going: 9, capacity: 12, price: '450 ₽', image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1000&q=85', host: 'Саша', hostInitials: 'С', hostColor: 'yellow',
  },
]

export const getEvent = (id: string) => events.find((event) => event.id === id)
