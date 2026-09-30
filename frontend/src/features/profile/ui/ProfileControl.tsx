import { useState } from 'react'
import { Avatar, Button, Form, Input, Modal, Select, message } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useAppData } from '../../../app/providers/AppDataProvider'

export default function ProfileControl() {
  const { profile, saveProfile } = useAppData()
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm()
  const [messageApi, context] = message.useMessage()

  const edit = () => {
    form.setFieldsValue(profile)
    setOpen(true)
  }

  const submit = (values: typeof profile) => {
    try {
      saveProfile(values)
      setOpen(false)
      messageApi.success('Профиль обновлён')
    } catch {
      messageApi.error('Не удалось сохранить профиль')
    }
  }

  return <>
    {context}
    <Button className="profile-button" type="text" onClick={edit} aria-label="Редактировать профиль"><Avatar className="profile-avatar">{profile.name.trim()[0] || <UserOutlined />}</Avatar><span>{profile.name}</span></Button>
    <Modal title="Профиль" open={open} onCancel={() => setOpen(false)} onOk={() => form.submit()} okText="Сохранить" cancelText="Отмена" destroyOnHidden>
      <Form form={form} layout="vertical" onFinish={submit}>
        <Form.Item name="name" label="Имя" rules={[{ required: true, whitespace: true, message: 'Укажите имя' }, { max: 80, message: 'Максимум 80 символов' }]}><Input autoComplete="name" /></Form.Item>
        <Form.Item name="email" label="Электронная почта" rules={[{ required: true, message: 'Укажите электронную почту' }, { type: 'email', message: 'Проверьте формат адреса' }]}><Input autoComplete="email" /></Form.Item>
        <Form.Item name="city" label="Город" rules={[{ required: true, message: 'Выберите город' }]}><Select options={['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург'].map((city) => ({ value: city, label: city }))} /></Form.Item>
      </Form>
    </Modal>
  </>
}
