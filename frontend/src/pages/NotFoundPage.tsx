import { Button, Result } from 'antd'
import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return <Result status="404" title="Страница не найдена" subTitle="Проверьте адрес или откройте афишу." extra={<Button type="primary"><Link to="/events">Открыть афишу</Link></Button>} />
}
