# Dashboard Schema v2

Этот документ фиксирует контракт между визуальным React-редактором и backend-компилятором Streamlit.

## Основная идея

- Порядок компонентов задаётся полем `order`.
- Dashboard использует сетку из 12 колонок.
- `layout.width` определяет ширину компонента: `3`, `4`, `6`, `8` или `12`.
- `layout.height` определяет высоту содержимого от `120` до `720` пикселей.
- Backend последовательно укладывает компоненты в строки. Когда сумма ширин превышает 12, начинается новая строка.
- `type` выбирает Streamlit renderer.

## Сопоставление компонентов

| `type` | Streamlit renderer |
| --- | --- |
| `selectbox` | `st.selectbox` или `st.multiselect` |
| `line_chart` | `st.line_chart` |
| `bar_chart` | `st.bar_chart` |
| `area_chart` | `st.area_chart` |
| `scatter_plot` | `st.scatter_chart` |
| `metric` | `st.metric` |

## Пример

```json
{
  "version": 2,
  "dashboard": {
    "title": "Sales dashboard",
    "grid": {
      "columns": 12
    }
  },
  "dataSource": {
    "type": "backend_dataset",
    "datasetId": "dataset-1",
    "name": "sales.csv",
    "fields": ["date", "region", "sales"]
  },
  "filters": [
    {
      "id": "filter-1",
      "type": "selectbox",
      "order": 1,
      "layout": { "width": 4, "height": 160 },
      "title": "Region",
      "field": "region",
      "scope": "global"
    }
  ],
  "views": [
    {
      "id": "chart-1",
      "type": "bar_chart",
      "order": 2,
      "layout": { "width": 8, "height": 360 },
      "title": "Sales trend",
      "x": "date",
      "y": "sales",
      "aggregation": "sum",
      "sort": "asc",
      "sortBy": "y",
      "color": "#818cf8",
      "colorMode": "gradient",
      "palette": ["#fbbf24", "#f97316", "#ef4444", "#db2777"]
    }
  ]
}
```

## Правила backend-компилятора

1. Отсортировать `filters` и `views` по `order`.
2. Разбить фильтры и представления на 12-колоночные строки по `layout.width`.
3. Для каждой строки создать `st.columns` с соответствующими весами.
4. Сначала отобразить и применить глобальные фильтры, затем строить представления.
5. Если `aggregation` не равен `none`, сгруппировать данные по `x`.
6. Применить `sort` после агрегации по полю `sortBy`: `x` или `y`.
7. Передать `color` в соответствующий метод `st.*_chart`.
8. Для `bar_chart` и `scatter_plot` с `gradient` или `categorical` построить Altair chart с указанной `palette`.
9. Не выполнять Python-код, полученный от клиента: клиент передаёт только декларативную схему.

## Live Canvas

В редакторе нет отдельной кнопки Preview. После загрузки датасета frontend получает выборку для визуализации:

```http
GET /datasets/{datasetId}/preview?limit=500
```

Ответ содержит строки, названия и типы полей:

```json
{
  "datasetId": "dataset-1",
  "fields": ["date", "sales"],
  "fieldTypes": {
    "date": "datetime",
    "sales": "number"
  },
  "rows": [
    { "date": "2026-01-01", "sales": 120 }
  ],
  "returnedRows": 1,
  "limit": 500
}
```

Canvas строит интерактивные графики непосредственно в React, применяет те же aggregation/sort правила и глобальные фильтры. Backend Schema v2 остаётся источником для сохранения проекта и генерации Streamlit-кода.
