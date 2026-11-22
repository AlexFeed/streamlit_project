# Dashboard Schema v2

Этот документ описывает актуальный контракт декларативной JSON-схемы между визуальным React-редактором ([`editorSchema.js`](src/pages/EditorPage/services/editorSchema.js)) и backend-валидатором/компилятором Streamlit (`app/schemas/dashboard.py`).

---

## 1. Общая структура схемы

На этапе сохранения проекта, запуска предпросмотра или экспорта в ZIP функция `compileDashboardSchema(snapshot, t)` валидирует состояние редактора (`validateSchema`) и собирает его из плоского UI-массива `components` в структурированную схему `Dashboard Schema v2` (`buildDashboardSchema`):

* `version` — версия формата (`2`; backend поддерживает `1 | 2`).
* `dashboard` — метаданные дашборда (`title`, `grid.columns = 12`).
* `pages` — список страниц многостраничного дашборда (`id`, `title`, `order >= 1`, минимум 1 страница, по умолчанию `page-main`).
* `dataSources` — массив подключённых источников данных (`type: "backend_dataset"`).
* `filters` — глобальные интерактивные фильтры (`selectbox`, `data_control`), которые backend применяет к `DataFrame` до расчёта представлений.
* `views` — визуальные компоненты, контейнеры, таблицы, метрики, текст и навигация.

### Ограничения целостности
* `pages[].id` должны быть уникальными.
* `id` всех компонентов должны быть уникальными в совокупности по `filters` и `views`.
* Каждый компонент обязан ссылаться на существующий `pageId`.
* Контейнеры (`layout_group`, `tab_group`) нельзя вкладывать друг в друга (`parentId` запрещён).
* Если у дочернего элемента задан `parentId`, родительский контейнер обязан существовать на той же странице (`pageId`).
* Backend-модели компонентов настроены с `extra="forbid"` — неизвестные поля отклоняются с ошибкой `422`.

---

## 2. Базовые поля компонента (`ComponentBase`)

Все элементы в `filters` и `views` наследуют общий набор полей:

* **Идентификация и связи:** `id`, `type`, `order` (`>= 1`), `pageId`, `datasetId` (`null` для `text`, `page_link`, `layout_group`, `tab_group`), `parentId` (`string | null`), `tabId` (`string | null`, используется внутри `tab_group`).
* **Позиция и размер (`layout`):**
  * `width`: `1..12` колонок 12-колоночной сетки;
  * `height`: `40..720` px (для графиков и `table` — минимум `120` px; компактные компоненты с `heightMode: "auto"` могут иметь высоту от `40` px);
  * `x`: `0..11` (`x + width <= 12`), `y`: `>= 0`.
* **Внешний вид и типографика:**
  * `title`: заголовок компонента (`string`);
  * `surface`: `"none" | "soft" | "card"`;
  * `showBorder`: `boolean | null`, `showBackground`: `boolean | null`;
  * `contentAlignment`: `"left" | "center" | "right"`;
  * `verticalAlignment`: `"top" | "center" | "bottom"`;
  * `padding`: `0..32`, `spacing`: `0..16`;
  * `contentWidth`: `"content" | "stretch"`, `heightMode`: `"auto" | "fixed" | null`;
  * `elementFontSize`: `"auto"` или `12 | 14 | 16 | 18 | 20 | 24 | 28 | 32`;
  * `elementTextColor`: `#RRGGBB`, `elementFontWeight`: `"normal" | "bold"`, `elementFontStyle`: `"normal" | "italic"`.

---

## 3. Поддерживаемые компоненты (13 типов)

### Фильтры (`filters`)

| `type` | Назначение | Основные специфичные поля |
| --- | --- | --- |
| `selectbox` | Фильтр по категориальным значениям | `field`, `scope: "global"`, `widget`: `"selectbox" \| "radio" \| "segmented" \| "pills" \| "multiselect"` |
| `data_control` | Фильтр по диапазону, дате или флагу | `field`, `scope: "global"`, `controlType`: `"range" \| "date" \| "toggle"` |

### Представления (`views`)

| `type` | Назначение / рендерер | Основные специфичные поля |
| --- | --- | --- |
| `line_chart` | Линейный график (Altair / Vega-Lite) | `x`, `y`, `aggregation`, `sort`, `sortBy`, `color`, `colorMode: "solid"`, `palette`, настройки осей |
| `bar_chart` | Столбчатая диаграмма (Altair / Vega-Lite) | `x`, `y`, `aggregation`, `sort`, `sortBy`, `color`, `colorMode`: `"solid" \| "gradient" \| "categorical"`, `palette`, настройки осей |
| `area_chart` | График с областями (Altair / Vega-Lite) | `x`, `y`, `aggregation`, `sort`, `sortBy`, `color`, `colorMode: "solid"`, `palette`, настройки осей |
| `scatter_plot` | Точечная диаграмма (Altair / Vega-Lite) | `x`, `y`, `aggregation`, `sort`, `sortBy`, `color`, `colorMode`: `"solid" \| "gradient" \| "categorical"`, `palette`, настройки осей |
| `metric` | KPI-карточка (`st.metric`) | `field`, `description`, `aggregation` (`"sum" \| "mean" \| "count" \| "min" \| "max"`) |
| `progress` | Индикатор прогресса (`st.progress`) | `field`, `aggregation` (кроме `"none"`), `minimum`, `maximum` (`maximum > minimum`), `showValue`, `color` |
| `table` | Таблица данных или сводная таблица (`st.dataframe`) | `columns`, `tableMode`: `"data" \| "pivot"`, `rowMode`: `"all" \| "limit"`, `rowLimit` (`1..10000`), `hideIndex`, `pivotIndex`, `pivotValue`, `pivotAggregation` |
| `text` | Текстовый блок | `content` (непустая строка), `fontSize` (`12..32`), `fontWeight`, `fontStyle`, `color` (`#RRGGBB`), `textAlign` |
| `page_link` | Кнопка или ссылка перехода между страницами | `targetPageId` (существующий `pageId`), `displayStyle`: `"button" \| "link"`, `buttonColor` (`#RRGGBB`) |
| `layout_group` | Контейнер-секция для группировки элементов | `direction`: `"vertical" \| "horizontal"`, `gap` (`0..32`), `padding` (`0..32`), `horizontalAlignment`, `verticalAlignment`, `wrap` |
| `tab_group` | Контейнер вкладок (1–8 вкладок) | `tabs` (`[{ id, label }]`), `activeTabId`, `gap` (`0..32`), `padding` (`0..32`) |

### Параметры графиков
* `aggregation`: `"none" | "sum" | "mean" | "count" | "min" | "max"`.
* `sort`: `"none" | "asc" | "desc"`; `sortBy`: `"x" | "y"`.
* `color`: цвет `#RRGGBB`; `palette`: массив от 2 до 8 цветов `#RRGGBB`.
* Подписи и заголовки осей: `axisLabelFontSize` (`8..24`), `axisLabelColor` (`#RRGGBB`), `axisTitleFontSize` (`8..24`), `axisTitleColor` (`#RRGGBB`).
* Цветовые режимы `"gradient"` и `"categorical"` разрешены только для `bar_chart` и `scatter_plot` (для `line_chart` и `area_chart` используется `"solid"`).

---

## 4. Пример схемы v2

```json
{
  "version": 2,
  "dashboard": {
    "title": "Sales dashboard",
    "grid": {
      "columns": 12
    }
  },
  "pages": [
    {
      "id": "page-main",
      "title": "Главная",
      "order": 1
    }
  ],
  "dataSources": [
    {
      "type": "backend_dataset",
      "datasetId": "dataset-1",
      "name": "sales.csv",
      "format": "csv",
      "delimiter": ",",
      "encoding": "utf-8",
      "sheetName": null,
      "fields": ["date", "region", "sales"]
    }
  ],
  "filters": [
    {
      "id": "filter-1",
      "type": "selectbox",
      "pageId": "page-main",
      "datasetId": "dataset-1",
      "parentId": null,
      "tabId": null,
      "order": 1,
      "layout": { "x": 0, "y": 0, "width": 3, "height": 80 },
      "title": "Region",
      "field": "region",
      "scope": "global",
      "widget": "selectbox"
    }
  ],
  "views": [
    {
      "id": "chart-1",
      "type": "bar_chart",
      "pageId": "page-main",
      "datasetId": "dataset-1",
      "parentId": null,
      "tabId": null,
      "order": 2,
      "layout": { "x": 3, "y": 0, "width": 9, "height": 320 },
      "title": "Sales trend",
      "x": "date",
      "y": "sales",
      "aggregation": "sum",
      "sort": "asc",
      "sortBy": "y",
      "color": "#3478c8",
      "colorMode": "gradient",
      "palette": ["#38bdf8", "#0284c7", "#0369a1", "#0c4a6e"]
    }
  ]
}
```

---

## 5. Как схема используется при отрисовке и предпросмотре

1. **Быстрая отрисовка на холсте редактора (Recharts):**
   После загрузки датасета frontend запрашивает выборку строк:
   ```http
   GET /datasets/{datasetId}/preview?limit=1000
   ```
   Ответ содержит `fields`, `fieldTypes`, `rows` (до 1000 строк), `returnedRows` и `limit`. Эта выборка используется только в браузере для мгновенного отклика при редактировании и не сохраняется внутри схемы проекта.
2. **Интерактивный предпросмотр на движке Streamlit:**
   При нажатии кнопки **Preview / Предпросмотр** frontend компилирует схему и управляет сессией на backend (`POST /preview`, обновление *in-place* через `PUT /preview/{sessionId}`, чтение в рантайме через `GET /preview/{sessionId}`), после чего запускает реальный Streamlit-дашборд в `iframe` или отдельной вкладке на всём объёме данных.
3. **Экспорт автономного приложения:**
   При скачивании (`POST /generate`) backend повторно валидирует схему и компилирует её в чистый Python-проект (`app.py`, датасеты в `data/`, `requirements.txt`, `run_local.bat`, `run_local.sh`) без передачи исполняемого Python-кода с клиента.
