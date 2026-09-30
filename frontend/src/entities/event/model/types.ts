export type EventItem = {
  id: string
  title: string
  category: string
  dateLabel: string
  dateTime: string
  time: string
  city: string
  venue: string
  address: string
  description: string
  going: number
  capacity: number
  price: string
  image: string
  host: string
  hostInitials: string
  hostColor: string
}

export type EventInput = Omit<EventItem, 'id' | 'going' | 'host' | 'hostInitials' | 'hostColor'>

export type EventMessage = {
  id: string
  name: string
  time: string
  text: string
}
