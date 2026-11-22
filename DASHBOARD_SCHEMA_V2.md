# Dashboard Schema v2

This document describes the current declarative JSON schema contract between the visual React editor ([`editorSchema.js`](src/pages/EditorPage/services/editorSchema.js)) and the backend Streamlit validator/compiler (`app/schemas/dashboard.py`).

---

## 1. Schema Structure

When saving a project, launching a preview, or exporting a ZIP archive, `compileDashboardSchema(snapshot, t)` validates the editor state (`validateSchema`) and compiles the flat UI `components` array into `Dashboard Schema v2` (`buildDashboardSchema`):

* `version` — schema version (`2`; backend accepts `1 | 2`).
* `dashboard` — dashboard metadata (`title`, `grid.columns = 12`).
* `pages` — list of pages for multi-page dashboards (`id`, `title`, `order >= 1`, minimum 1 page, default `page-main`).
* `dataSources` — array of connected data sources (`type: "backend_dataset"`).
* `filters` — global interactive filters (`selectbox`, `data_control`) applied by the backend to the `DataFrame` before rendering views.
* `views` — visual components, containers, tables, metrics, text blocks, and navigation links.

### Integrity Constraints
* `pages[].id` must be unique.
* Component `id` values must be unique across `filters` and `views` combined.
* Every component must reference an existing `pageId`.
* Containers (`layout_group`, `tab_group`) cannot be nested inside another container (`parentId` is forbidden).
* When a child component specifies `parentId`, the parent container must exist on the same page (`pageId`).
* Backend component models are configured with `extra="forbid"` — unknown fields are rejected with HTTP `422`.

---

## 2. Base Component Fields (`ComponentBase`)

All items in `filters` and `views` share a common set of base fields:

* **Identity & relations:** `id`, `type`, `order` (`>= 1`), `pageId`, `datasetId` (`null` for `text`, `page_link`, `layout_group`, `tab_group`), `parentId` (`string | null`), `tabId` (`string | null`, used inside `tab_group`).
* **Position & size (`layout`):**
  * `width`: `1..12` columns in the 12-column grid;
  * `height`: `40..720` px (`>= 120` px for charts and `table`; compact components with `heightMode: "auto"` may start at `40` px);
  * `x`: `0..11` (`x + width <= 12`), `y`: `>= 0`.
* **Appearance & typography:**
  * `title`: component heading (`string`);
  * `surface`: `"none" | "soft" | "card"`;
  * `showBorder`: `boolean | null`, `showBackground`: `boolean | null`;
  * `contentAlignment`: `"left" | "center" | "right"`;
  * `verticalAlignment`: `"top" | "center" | "bottom"`;
  * `padding`: `0..32`, `spacing`: `0..16`;
  * `contentWidth`: `"content" | "stretch"`, `heightMode`: `"auto" | "fixed" | null`;
  * `elementFontSize`: `"auto"` or `12 | 14 | 16 | 18 | 20 | 24 | 28 | 32`;
  * `elementTextColor`: `#RRGGBB`, `elementFontWeight`: `"normal" | "bold"`, `elementFontStyle`: `"normal" | "italic"`.

---

## 3. Supported Components (13 Types)

### Filters (`filters`)

| `type` | Purpose | Key specific fields |
| --- | --- | --- |
| `selectbox` | Categorical value filter | `field`, `scope: "global"`, `widget`: `"selectbox" \| "radio" \| "segmented" \| "pills" \| "multiselect"` |
| `data_control` | Numeric range, date, or boolean filter | `field`, `scope: "global"`, `controlType`: `"range" \| "date" \| "toggle"` |

### Views (`views`)

| `type` | Purpose / renderer | Key specific fields |
| --- | --- | --- |
| `line_chart` | Line chart (Altair / Vega-Lite) | `x`, `y`, `aggregation`, `sort`, `sortBy`, `color`, `colorMode: "solid"`, `palette`, axis settings |
| `bar_chart` | Bar chart (Altair / Vega-Lite) | `x`, `y`, `aggregation`, `sort`, `sortBy`, `color`, `colorMode`: `"solid" \| "gradient" \| "categorical"`, `palette`, axis settings |
| `area_chart` | Area chart (Altair / Vega-Lite) | `x`, `y`, `aggregation`, `sort`, `sortBy`, `color`, `colorMode: "solid"`, `palette`, axis settings |
| `scatter_plot` | Scatter plot (Altair / Vega-Lite) | `x`, `y`, `aggregation`, `sort`, `sortBy`, `color`, `colorMode`: `"solid" \| "gradient" \| "categorical"`, `palette`, axis settings |
| `metric` | KPI card (`st.metric`) | `field`, `description`, `aggregation` (`"sum" \| "mean" \| "count" \| "min" \| "max"`) |
| `progress` | Progress bar (`st.progress`) | `field`, `aggregation` (except `"none"`), `minimum`, `maximum` (`maximum > minimum`), `showValue`, `color` |
| `table` | Data or pivot table (`st.dataframe`) | `columns`, `tableMode`: `"data" \| "pivot"`, `rowMode`: `"all" \| "limit"`, `rowLimit` (`1..10000`), `hideIndex`, `pivotIndex`, `pivotValue`, `pivotAggregation` |
| `text` | Text block | `content` (non-empty string), `fontSize` (`12..32`), `fontWeight`, `fontStyle`, `color` (`#RRGGBB`), `textAlign` |
| `page_link` | Page navigation button or text link | `targetPageId` (existing `pageId`), `displayStyle`: `"button" \| "link"`, `buttonColor` (`#RRGGBB`) |
| `layout_group` | Section container for grouping components | `direction`: `"vertical" \| "horizontal"`, `gap` (`0..32`), `padding` (`0..32`), `horizontalAlignment`, `verticalAlignment`, `wrap` |
| `tab_group` | Tabs container (1–8 tabs) | `tabs` (`[{ id, label }]`), `activeTabId`, `gap` (`0..32`), `padding` (`0..32`) |

### Chart Options
* `aggregation`: `"none" | "sum" | "mean" | "count" | "min" | "max"`.
* `sort`: `"none" | "asc" | "desc"`; `sortBy`: `"x" | "y"`.
* `color`: `#RRGGBB` color; `palette`: array of 2 to 8 `#RRGGBB` colors.
* Axis labels & titles: `axisLabelFontSize` (`8..24`), `axisLabelColor` (`#RRGGBB`), `axisTitleFontSize` (`8..24`), `axisTitleColor` (`#RRGGBB`).
* `"gradient"` and `"categorical"` color modes are allowed only for `bar_chart` and `scatter_plot` (`line_chart` and `area_chart` require `"solid"`).

---

## 4. Schema v2 Example

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
      "title": "Main",
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

## 5. How the Schema Is Used in Rendering & Preview

1. **Fast editor canvas rendering (Recharts):**
   After a dataset is uploaded, the frontend fetches a row sample:
   ```http
   GET /datasets/{datasetId}/preview?limit=1000
   ```
   The response contains `fields`, `fieldTypes`, `rows` (up to 1,000 rows), `returnedRows`, and `limit`. This sample is used solely in the browser for responsive editing and is not persisted inside the project schema.
2. **Interactive preview on the Streamlit engine:**
   When clicking **Preview**, the frontend compiles the schema and manages a backend preview session (`POST /preview`, in-place updates via `PUT /preview/{sessionId}`, runtime lookup via `GET /preview/{sessionId}`), then renders the real Streamlit dashboard in an `iframe` or separate browser tab across the entire dataset.
3. **Standalone application export:**
   When downloading (`POST /generate`), the backend re-validates the schema and compiles it into a clean Python project (`app.py`, datasets in `data/`, `requirements.txt`, `run_local.bat`, `run_local.sh`) without accepting or executing any Python code from the client.
