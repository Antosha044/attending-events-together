import { Button, Result } from 'antd'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return <Result status="404" title="Кажется, мы свернули не туда" subTitle="Такой страницы пока нет. Вернёмся к событиям?" extra={<Button type="primary"><Link to="/events">К событиям</Link></Button>} />
}
