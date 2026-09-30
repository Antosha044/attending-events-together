# Рядом — события, на которые идут вместе

Учебный fullstack-проект: люди находят городские события, собирают компанию, общаются перед встречей и отмечают посещение. Репозиторий один; frontend и backend пока запускаются независимо. Frontend использует демонстрационные данные, а backend работает с PostgreSQL.

## Пользовательские сценарии

- посмотреть афишу и отфильтровать события по категории или названию;
- открыть событие, изучить место, время, организатора и число свободных мест;
- посмотреть участников и демонстрационный макет группового чата;
- открыть макет создания или редактирования события;
- увидеть экран отметки посещения;
- в будущих этапах зарегистрироваться, войти и работать с настоящими данными.

На текущем этапе frontend — прототип на демонстрационных данных: формы и действия, которым нужна серверная логика, явно отключены. Он не отправляет запросы backend. Чат показан как статический пример; сообщений и обновлений в реальном времени нет.

## Структура

```text
frontend/     React + TypeScript + Vite + Ant Design
backend/      FastAPI + SQLAlchemy + PostgreSQL + Alembic
docs/         снимки интерфейса
```

## Frontend (ЛР1)

Нужны Node.js 20.19+ или 22.12+ и Corepack. Из `frontend/`:

```powershell
corepack.cmd pnpm install
corepack.cmd pnpm dev
```

Откройте адрес Vite из вывода команды (обычно `http://localhost:5173`). Для production-сборки: `corepack.cmd pnpm build`; для локального просмотра сборки: `corepack.cmd pnpm preview`.

Доступны `/events`, `/events/:eventId`, `/events/new`, `/events/:eventId/edit`, `/events/:eventId/group`, `/events/:eventId/chat`, `/events/:eventId/attendance`. Визуальные снимки расположены в [`docs/screenshots`](docs/screenshots/).

## Backend (ЛР2)

Требуются Python 3.11+ и PostgreSQL 14+. Установите [uv](https://docs.astral.sh/uv/). Сначала создайте базу и пользователя PostgreSQL, затем из `backend/`:

```powershell
Copy-Item .env.example .env
# задайте DATABASE_URL в .env для вашей базы
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload
```

Для пустого локального сервера PostgreSQL можно создать пользователя и базу SQL-командами (замените пароль и задайте его же в `DATABASE_URL`):

```sql
CREATE USER events WITH PASSWORD 'change-me';
CREATE DATABASE events OWNER events;
```

API и интерактивная документация доступны на `http://localhost:8000` и `http://localhost:8000/docs`. Проверка доступности: `GET /health`. API с префиксом `/api/v1` содержит CRUD для пользователей, событий, участий, сообщений и отметок посещения. Таблицы создаются Alembic-миграцией; новые изменения схемы нужно вносить следующими миграциями.

Backend пока не аутентифицирует запросы: авторизация и защита ресурсов относятся к ЛР4. Клиент может передать идентификатор пользователя при создании участия, сообщения или отметки; это учебный CRUD, а не готовая публичная служба. Лимит мест проверяется при вступлении, но атомарность при одновременных запросах пока не обеспечена.

## Дальнейшие этапы

- **ЛР3:** модульная frontend-архитектура, рабочие формы и состояния загрузки/ошибок.
- **ЛР4:** регистрация, хеширование паролей, access/refresh token и защита API.
- **ЛР5:** подключение интерфейса к API и PostgreSQL вместо демонстрационных данных.

## Скриншоты

Снимки frontend-прототипа с демонстрационными данными:

- [афиша](docs/screenshots/events.png)
- [страница события](docs/screenshots/event-detail.png)
- [редактирование события](docs/screenshots/event-form.png)
- [группа и участники](docs/screenshots/group.png)
- [чат](docs/screenshots/chat.png)
- [отметка посещения](docs/screenshots/attendance.png)
