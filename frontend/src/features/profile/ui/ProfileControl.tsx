import { useEffect, useState } from 'react'
import { Avatar, Button, Form, Input, Modal, Select, Tabs, message } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useAppData } from '../../../app/providers/AppDataProvider'
import type { UserProfile } from '../../../entities/user/model/types'

type AuthValues = { email: string; password: string; name?: string; city?: string }
const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург']

export default function ProfileControl() {
  const { profile, authenticated, signIn, signUp, signOut, saveProfile, loading } = useAppData()
  const [open, setOpen] = useState(false)
  const [registering, setRegistering] = useState(false)
  const [authLoading, setAuthLoading] = useState(false)
  const [form] = Form.useForm()
  const [messageApi, context] = message.useMessage()

  useEffect(() => {
    const show = () => { setRegistering(false); setOpen(true) }
    window.addEventListener('auth-open', show)
    return () => window.removeEventListener('auth-open', show)
  }, [])

  const submitAuth = async (values: AuthValues) => {
    setAuthLoading(true)
    try {
      if (registering) await signUp(values.name!.trim(), values.email, values.password, values.city!)
      else await signIn(values.email, values.password)
      setOpen(false); form.resetFields(); messageApi.success(registering ? 'Аккаунт создан' : 'Вы вошли в аккаунт')
    } catch (error) { messageApi.error(error instanceof Error ? error.message : 'Не удалось выполнить вход') }
    finally { setAuthLoading(false) }
  }
  const submitProfile = async (values: UserProfile) => {
    try { await saveProfile(values); setOpen(false); messageApi.success('Профиль обновлён') }
    catch (error) { messageApi.error(error instanceof Error ? error.message : 'Не удалось сохранить профиль') }
  }
  const openProfile = () => { form.setFieldsValue(profile); setOpen(true) }

  return <>
    {context}
    {authenticated ? <Button className="profile-button" type="text" onClick={openProfile} aria-label="Открыть профиль"><Avatar className="profile-avatar">{profile.name.trim()[0] || <UserOutlined />}</Avatar><span>{profile.name}</span></Button>
      : <Button className="profile-button" type="text" loading={loading} onClick={() => { setRegistering(false); setOpen(true) }}><Avatar className="profile-avatar"><UserOutlined /></Avatar><span>Войти</span></Button>}
    <Modal title={authenticated ? 'Профиль' : registering ? 'Создать аккаунт' : 'Вход'} open={open} onCancel={() => setOpen(false)} footer={null} destroyOnHidden>
      {authenticated ? <>
        <Form form={form} layout="vertical" onFinish={submitProfile} initialValues={profile}>
          <Form.Item name="name" label="Имя" rules={[{ required: true, whitespace: true, message: 'Укажите имя' }, { max: 80, message: 'Максимум 80 символов' }]}><Input autoComplete="name" /></Form.Item>
          <Form.Item name="email" label="Электронная почта" rules={[{ required: true, type: 'email', message: 'Проверьте электронную почту' }]}><Input autoComplete="email" /></Form.Item>
          <Form.Item name="city" label="Город" rules={[{ required: true, message: 'Выберите город' }]}><Select options={cities.map((city) => ({ value: city, label: city }))} /></Form.Item>
          <Button type="primary" htmlType="submit" block>Сохранить</Button>
          <Button style={{ marginTop: 8 }} block onClick={async () => { await signOut(); setOpen(false); messageApi.success('Вы вышли из аккаунта') }}>Выйти</Button>
        </Form>
      </> : <>
        <Tabs activeKey={registering ? 'register' : 'login'} onChange={(key) => { setRegistering(key === 'register'); form.resetFields() }} items={[{ key: 'login', label: 'Войти' }, { key: 'register', label: 'Регистрация' }]} />
        <Form form={form} layout="vertical" onFinish={submitAuth}>
          {registering && <>
            <Form.Item name="name" label="Имя" rules={[{ required: true, whitespace: true, message: 'Укажите имя' }, { max: 80, message: 'Максимум 80 символов' }]}><Input autoComplete="name" /></Form.Item>
            <Form.Item name="city" label="Город" initialValue="Москва" rules={[{ required: true, message: 'Выберите город' }]}><Select options={cities.map((city) => ({ value: city, label: city }))} /></Form.Item>
          </>}
          <Form.Item name="email" label="Электронная почта" rules={[{ required: true, type: 'email', message: 'Проверьте электронную почту' }]}><Input autoComplete="email" /></Form.Item>
          <Form.Item name="password" label="Пароль" rules={[{ required: true, min: 8, message: 'Минимум 8 символов' }]}><Input.Password autoComplete={registering ? 'new-password' : 'current-password'} /></Form.Item>
          <Button type="primary" htmlType="submit" block loading={authLoading}>{registering ? 'Зарегистрироваться' : 'Войти'}</Button>
        </Form>
      </>}
    </Modal>
  </>
}
