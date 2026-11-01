import { Trash2, X } from 'lucide-react';
import { paletteItems } from '../data/paletteItems.js';
import {
    FieldSelect,
    TextField,
    TextAreaField,
    ColorField,
    OptionSelect,
    MultiFieldSelect,
} from './properties/PropertyFields.jsx';
import ColorStyleField from './properties/ColorStyleField.jsx';
import { getAppearanceDefaults } from '../services/componentAppearance.js';

const aggregationOptions = [
    { value: 'none', label: 'Без агрегации' },
    { value: 'sum', label: 'Сумма' },
    { value: 'mean', label: 'Среднее' },
    { value: 'count', label: 'Количество' },
    { value: 'min', label: 'Минимум' },
    { value: 'max', label: 'Максимум' },
];

const sortOptions = [
    { value: 'none', label: 'Не сортировать' },
    { value: 'asc', label: 'По возрастанию' },
    { value: 'desc', label: 'По убыванию' },
];

const sortByOptions = [
    { value: 'x', label: 'По значениям X' },
    { value: 'y', label: 'По значениям Y' },
];

const fontSizeOptions = [12, 14, 16, 18, 20, 24, 28, 32].map((size) => ({
    value: String(size),
    label: `${size} px`,
}));
const elementFontSizeOptions = [
    { value: 'auto', label: 'Стандартный Streamlit' },
    ...fontSizeOptions,
];

const fontWeightOptions = [
    { value: 'normal', label: 'Обычный' },
    { value: 'bold', label: 'Жирный' },
];

const fontStyleOptions = [
    { value: 'normal', label: 'Обычный' },
    { value: 'italic', label: 'Курсив' },
];

const textAlignOptions = [
    { value: 'left', label: 'Слева' },
    { value: 'center', label: 'По центру' },
    { value: 'right', label: 'Справа' },
];

const filterWidgetOptions = [
    { value: 'selectbox', label: 'Выпадающий список' },
    { value: 'radio', label: 'Radio-кнопки' },
    { value: 'segmented', label: 'Сегменты' },
    { value: 'pills', label: 'Кнопки-плашки' },
    { value: 'multiselect', label: 'Множественный выбор' },
];

const navigationStyleOptions = [
    { value: 'button', label: 'Кнопка' },
    { value: 'link', label: 'Текстовая ссылка' },
];

const tableRowLimitOptions = [10, 25, 50, 100, 250, 500].map((value) => ({
    value: String(value),
    label: `${value} строк`,
}));

const spacingOptions = [0, 4, 8, 12, 16, 24, 32].map((value) => ({
    value: String(value),
    label: value === 0 ? 'Без отступа' : `${value} px`,
}));

const SectionTitle = ({ children }) => (
    <div className="pt-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        {children}
    </div>
);

const PropertiesPanel = ({
                             selectedComponent,
                             onUpdateComponent,
                             onDeleteSelected,
                             onClose,
                             datasets = [],
                             pages = [],
                             components = [],
                         }) => {
    if (!selectedComponent) {
        return null;
    }

    const { type, config, bindings } = selectedComponent;
    const appearance = getAppearanceDefaults(type, config);
    const isCompact = ['text', 'metric', 'selectbox', 'page_link'].includes(type);
    const supportsElementTypography = ['metric', 'page_link'].includes(type);
    const titleLabel = {
        text: 'Заголовок текста (необязательно)',
        layout_group: 'Название контейнера (необязательно)',
        page_link: 'Текст кнопки или ссылки',
        selectbox: 'Название фильтра',
        metric: 'Название метрики',
        table: 'Название таблицы',
    }[type] || 'Название графика';
    const titleHelper = {
        text: 'Если оставить пустым, будет показан только основной текст',
        layout_group: 'Используется только как подпись группы',
        page_link: 'Этот текст увидит пользователь в готовом приложении',
        selectbox: 'Подпись над элементом выбора',
        metric: 'Подпись над рассчитанным значением',
        table: 'Подпись над таблицей',
    }[type] || 'Подпись над графиком';

    const activeDataset =
        datasets.find((ds) => ds.datasetId === selectedComponent.datasetId) ||
        datasets[0] ||
        null;
    const availableFields = activeDataset?.fields || [];
    const fieldTypes = activeDataset?.fieldTypes || {};

    const datasetOptions = datasets.map((ds) => ({
        value: ds.datasetId,
        label: ds.name,
    }));

    const fieldOptions = availableFields.map((field) => ({
        value: field,
        label: fieldTypes[field] ? `${field} · ${fieldTypes[field]}` : field,
    }));
    const numericFieldOptions = fieldOptions.filter(
        (option) => fieldTypes[option.value] === 'number'
    );
    const valueFieldOptions = numericFieldOptions.length
        ? numericFieldOptions
        : fieldOptions;
    const xFieldOptions = type === 'scatter_plot'
        ? valueFieldOptions
        : fieldOptions;
    const aggregatedValueFieldOptions = config.aggregation === 'count'
        ? fieldOptions
        : valueFieldOptions;
    const containerOptions = [
        { value: '', label: 'На странице' },
        ...components
            .filter((component) => component.type === 'layout_group')
            .map((component, index) => ({
                value: component.id,
                label: component.config?.title || `Контейнер ${index + 1}`,
            })),
    ];

    // Обновление значений конфига в схеме (название схемы)
    const updateConfig = (key, value) => {
        onUpdateComponent(selectedComponent.id, (component) => ({
            ...component,
            config: {
                ...component.config,
                [key]: value,
            },
            layout: {
                ...component.layout,
                ...(key === 'heightMode' && value === 'auto'
                    ? { manualHeight: false }
                    : {}),
                ...(key === 'contentWidth' && value === 'content'
                    ? { manualWidth: false }
                    : {}),
            },
        }));
    };

    // Обновление значений полей в схеме
    const updateBinding = (key, value) => {
        onUpdateComponent(selectedComponent.id, (component) => ({
            ...component,
            bindings: {
                ...component.bindings,
                [key]: value,
            },
        }));
    };

    // Смена источника данных (CSV) для компонента со сбросом отсутствующих полей
    const updateDataset = (nextDatasetId) => {
        const nextDataset = datasets.find((ds) => ds.datasetId === nextDatasetId);
        const nextFields = new Set(nextDataset?.fields || []);

        onUpdateComponent(selectedComponent.id, (component) => {
            const cleanedBindings = { ...component.bindings };

            Object.keys(cleanedBindings).forEach((key) => {
                if (Array.isArray(cleanedBindings[key])) {
                    cleanedBindings[key] = cleanedBindings[key].filter(
                        (field) => nextFields.has(field)
                    );
                } else if (
                    cleanedBindings[key]
                    && !nextFields.has(cleanedBindings[key])
                ) {
                    cleanedBindings[key] = '';
                }
            });

            return {
                ...component,
                datasetId: nextDatasetId,
                bindings: cleanedBindings,
            };
        });
    };

    return (
        <>
            <button
                type="button"
                aria-label="Закрыть панель свойств"
                onClick={onClose}
                className="fixed inset-0 top-[65px] z-30 bg-transparent xl:hidden"
            />
            <aside className="fixed bottom-0 right-0 top-[65px] z-40 w-[360px] overflow-y-auto border-l border-zinc-800 bg-zinc-950 shadow-2xl shadow-black/60 xl:static xl:z-20 xl:h-full xl:w-auto xl:min-w-0 xl:shadow-none">
                <div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur-xl">
                    <div>
                        <h2 className="text-base font-semibold text-white">
                            {config.title || 'Без названия'}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="flex items-center gap-1.5 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-white"
                    >
                        <X className="h-3.5 w-3.5" />
                        Закрыть
                    </button>
                </div>

                <div className="space-y-3 p-4">
                    <TextField
                        label={titleLabel}
                        value={config.title || ''}
                        onChange={(value) => updateConfig('title', value)}
                        placeholder={type === 'text'
                            ? 'Можно оставить пустым'
                            : 'Введите заголовок компонента'}
                        helperText={titleHelper}
                    />

                    {type !== 'layout_group' && containerOptions.length > 1 && (
                        <OptionSelect
                            label="Расположение"
                            value={selectedComponent.parentId || ''}
                            onChange={(value) => onUpdateComponent(
                                selectedComponent.id,
                                (component) => ({ ...component, parentId: value || null })
                            )}
                            options={containerOptions}
                            helperText="Элемент можно оставить на холсте или поместить в контейнер"
                        />
                    )}

                    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                        <p className="mb-3 text-xs font-semibold text-zinc-200">
                            Внешний вид
                        </p>
                        <div className="space-y-3">
                            <OptionSelect
                                label="Граница"
                                value={appearance.showBorder ? 'show' : 'hide'}
                                onChange={(value) => updateConfig('showBorder', value === 'show')}
                                options={[
                                    { value: 'hide', label: 'Не показывать' },
                                    { value: 'show', label: 'Показывать' },
                                ]}
                            />
                            <OptionSelect
                                label="Фон"
                                value={appearance.showBackground ? 'show' : 'hide'}
                                onChange={(value) => updateConfig('showBackground', value === 'show')}
                                options={[
                                    { value: 'hide', label: 'Прозрачный' },
                                    { value: 'show', label: 'Мягкая подложка' },
                                ]}
                            />
                            {isCompact && (
                                <OptionSelect
                                    label="Положение содержимого"
                                    value={appearance.contentAlignment}
                                    onChange={(value) => updateConfig('contentAlignment', value)}
                                    options={[
                                        { value: 'left', label: 'Слева' },
                                        { value: 'center', label: 'По центру' },
                                        { value: 'right', label: 'Справа' },
                                    ]}
                                />
                            )}
                            {isCompact && (
                                <OptionSelect
                                    label="Высота блока"
                                    value={appearance.heightMode}
                                    onChange={(value) => updateConfig('heightMode', value)}
                                    options={[
                                        { value: 'auto', label: 'По содержимому' },
                                        { value: 'fixed', label: 'Фиксированная' },
                                    ]}
                                    helperText="В автоматическом режиме высота зависит от текста и внутреннего отступа"
                                />
                            )}
                            {isCompact && appearance.heightMode === 'fixed' && (
                                <OptionSelect
                                    label="По вертикали"
                                    value={appearance.verticalAlignment}
                                    onChange={(value) => updateConfig('verticalAlignment', value)}
                                    options={[
                                        { value: 'top', label: 'Сверху' },
                                        { value: 'center', label: 'По центру' },
                                        { value: 'bottom', label: 'Снизу' },
                                    ]}
                                />
                            )}
                            {isCompact && (
                                <OptionSelect
                                    label="Ширина содержимого"
                                    value={appearance.contentWidth}
                                    onChange={(value) => updateConfig('contentWidth', value)}
                                    options={[
                                        { value: 'content', label: 'По содержимому' },
                                        { value: 'stretch', label: 'На всю ширину' },
                                    ]}
                                />
                            )}
                            {type !== 'layout_group' && (
                                <OptionSelect
                                    label="Внутренний отступ"
                                    value={String(appearance.padding)}
                                    onChange={(value) => updateConfig('padding', Number(value))}
                                    options={spacingOptions}
                                />
                            )}
                            {supportsElementTypography && (
                                <>
                                    <OptionSelect
                                        label="Размер текста"
                                        value={String(appearance.elementFontSize)}
                                        onChange={(value) => updateConfig('elementFontSize', value)}
                                        options={elementFontSizeOptions}
                                    />
                                    <ColorField
                                        label="Цвет текста"
                                        value={appearance.elementTextColor}
                                        onChange={(value) => updateConfig('elementTextColor', value)}
                                    />
                                    <OptionSelect
                                        label="Начертание"
                                        value={appearance.elementFontWeight}
                                        onChange={(value) => updateConfig('elementFontWeight', value)}
                                        options={fontWeightOptions}
                                    />
                                    <OptionSelect
                                        label="Стиль текста"
                                        value={appearance.elementFontStyle}
                                        onChange={(value) => updateConfig('elementFontStyle', value)}
                                        options={fontStyleOptions}
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    {!['text', 'page_link', 'layout_group'].includes(type) && (
                        <FieldSelect
                            label="Источник данных (CSV)"
                            value={activeDataset?.datasetId || ''}
                            onChange={updateDataset}
                            options={datasetOptions}
                            placeholder="Выберите CSV-файл"
                            helperText="CSV-файл, из которого компонент берёт данные"
                        />
                    )}

                    {type === 'layout_group' && (
                        <>
                            <SectionTitle>Настройки контейнера</SectionTitle>
                            <OptionSelect
                                label="Направление"
                                value={config.direction || 'vertical'}
                                onChange={(value) => updateConfig('direction', value)}
                                options={[
                                    { value: 'vertical', label: 'Сверху вниз' },
                                    { value: 'horizontal', label: 'Слева направо' },
                                ]}
                            />
                            <OptionSelect
                                label="Расстояние между элементами"
                                value={String(config.gap ?? 8)}
                                onChange={(value) => updateConfig('gap', Number(value))}
                                options={spacingOptions}
                            />
                            <OptionSelect
                                label="Внутренний отступ"
                                value={String(config.padding ?? 8)}
                                onChange={(value) => updateConfig('padding', Number(value))}
                                options={spacingOptions}
                            />
                            <OptionSelect
                                label="Выравнивание"
                                value={config.horizontalAlignment || 'left'}
                                onChange={(value) => updateConfig('horizontalAlignment', value)}
                                options={[
                                    { value: 'left', label: 'По левому краю' },
                                    { value: 'center', label: 'По центру' },
                                    { value: 'right', label: 'По правому краю' },
                                    { value: 'distribute', label: 'Распределить' },
                                ]}
                            />
                        </>
                    )}

                    {type === 'text' && (
                        <>
                            <SectionTitle>Содержимое текста</SectionTitle>
                            <TextAreaField
                                label="Текст"
                                value={config.content || ''}
                                onChange={(value) => updateConfig('content', value)}
                                placeholder="Введите пояснение для пользователя"
                                helperText="Этот текст будет показан на холсте и в готовом Streamlit-приложении"
                            />

                            <OptionSelect
                                label="Размер текста"
                                value={String(config.fontSize || 16)}
                                onChange={(value) => updateConfig('fontSize', Number(value))}
                                options={fontSizeOptions}
                            />

                            <OptionSelect
                                label="Начертание"
                                value={config.fontWeight || 'normal'}
                                onChange={(value) => updateConfig('fontWeight', value)}
                                options={fontWeightOptions}
                            />

                            <OptionSelect
                                label="Стиль"
                                value={config.fontStyle || 'normal'}
                                onChange={(value) => updateConfig('fontStyle', value)}
                                options={fontStyleOptions}
                            />

                            <ColorField
                                label="Цвет текста"
                                value={config.color || '#d4d4d8'}
                                onChange={(value) => updateConfig('color', value)}
                            />

                            <OptionSelect
                                label="Выравнивание"
                                value={config.textAlign || 'left'}
                                onChange={(value) => updateConfig('textAlign', value)}
                                options={textAlignOptions}
                            />
                        </>
                    )}

                    {type === 'selectbox' && (
                        <>
                            <SectionTitle>Настройки фильтра</SectionTitle>
                            <OptionSelect
                                label="Вид элемента"
                                value={config.widget || 'selectbox'}
                                onChange={(value) => updateConfig('widget', value)}
                                options={filterWidgetOptions}
                                helperText="Один фильтр, разные нативные элементы Streamlit"
                            />

                            <FieldSelect
                                label="Поле данных"
                                value={bindings.field || ''}
                                onChange={(value) => updateBinding('field', value)}
                                options={fieldOptions}
                                placeholder="Выберите поле"
                                helperText="Поле, по которому строится список значений"
                            />

                            <TextField
                                label="Подсказка"
                                value={config.placeholder || ''}
                                onChange={(value) => updateConfig('placeholder', value)}
                                placeholder="Например: Выберите отдел"
                                helperText="Отображается до выбора значения"
                            />
                        </>
                    )}

                    {type === 'page_link' && (
                        <>
                            <SectionTitle>Переход между страницами</SectionTitle>
                            <OptionSelect
                                label="Страница"
                                value={config.targetPageId || ''}
                                onChange={(value) => updateConfig('targetPageId', value)}
                                options={pages.map((page) => ({
                                    value: page.id,
                                    label: page.title,
                                }))}
                                helperText="Куда перейдёт пользователь"
                            />
                            <OptionSelect
                                label="Вид перехода"
                                value={config.displayStyle || 'button'}
                                onChange={(value) => updateConfig('displayStyle', value)}
                                options={navigationStyleOptions}
                            />
                        </>
                    )}

                    {type === 'table' && (
                        <>
                            <SectionTitle>Настройки таблицы</SectionTitle>
                            <MultiFieldSelect
                                label="Колонки"
                                value={bindings.columns || []}
                                onChange={(value) => updateBinding('columns', value)}
                                options={fieldOptions}
                                helperText="Если ничего не выбрано, показываются все колонки"
                            />
                            <OptionSelect
                                label="Количество строк"
                                value={String(config.rowLimit || 50)}
                                onChange={(value) => updateConfig('rowLimit', Number(value))}
                                options={tableRowLimitOptions}
                            />
                            <OptionSelect
                                label="Индекс строк"
                                value={config.hideIndex === false ? 'show' : 'hide'}
                                onChange={(value) => updateConfig('hideIndex', value === 'hide')}
                                options={[
                                    { value: 'hide', label: 'Скрыть' },
                                    { value: 'show', label: 'Показывать' },
                                ]}
                            />
                        </>
                    )}

                    {paletteItems[type]?.isChart && (
                        <>
                            <SectionTitle>Данные и оси графика</SectionTitle>
                            <FieldSelect
                                label="Поле X"
                                value={bindings.xField || ''}
                                onChange={(value) => updateBinding('xField', value)}
                                options={xFieldOptions}
                                placeholder="Выберите поле X"
                                helperText="Горизонтальная ось графика"
                            />

                            <FieldSelect
                                label="Поле Y"
                                value={bindings.yField || ''}
                                onChange={(value) => updateBinding('yField', value)}
                                options={aggregatedValueFieldOptions}
                                placeholder="Выберите поле Y"
                                helperText="Значения, отображаемые на графике"
                            />

                            <OptionSelect
                                label="Агрегация"
                                value={config.aggregation || 'none'}
                                onChange={(value) => updateConfig('aggregation', value)}
                                options={aggregationOptions}
                                helperText="Как объединять несколько значений для одной точки X"
                            />

                            <OptionSelect
                                label="Сортировка"
                                value={config.sort || 'none'}
                                onChange={(value) => updateConfig('sort', value)}
                                options={sortOptions}
                                helperText="Направление сортировки"
                            />

                            {config.sort !== 'none' && (
                                <OptionSelect
                                    label="Сортировать"
                                    value={config.sortBy || 'x'}
                                    onChange={(value) => updateConfig('sortBy', value)}
                                    options={sortByOptions}
                                    helperText="X — порядок категорий или дат, Y — рейтинг по величине"
                                />
                            )}

                            <ColorStyleField
                                type={type}
                                config={config}
                                onUpdate={updateConfig}
                            />

                            <OptionSelect
                                label="Размер подписей осей"
                                value={String(config.axisLabelFontSize || 11)}
                                onChange={(value) => updateConfig('axisLabelFontSize', Number(value))}
                                options={[10, 11, 12, 14, 16, 18].map((value) => ({
                                    value: String(value),
                                    label: `${value} px`,
                                }))}
                            />
                            <ColorField
                                label="Цвет подписей осей"
                                value={config.axisLabelColor || '#94a3b8'}
                                onChange={(value) => updateConfig('axisLabelColor', value)}
                            />
                            <OptionSelect
                                label="Размер названий осей"
                                value={String(config.axisTitleFontSize || 12)}
                                onChange={(value) => updateConfig('axisTitleFontSize', Number(value))}
                                options={[10, 11, 12, 14, 16, 18].map((value) => ({
                                    value: String(value),
                                    label: `${value} px`,
                                }))}
                            />
                            <ColorField
                                label="Цвет названий осей"
                                value={config.axisTitleColor || '#94a3b8'}
                                onChange={(value) => updateConfig('axisTitleColor', value)}
                            />
                        </>
                    )}

                    {type === 'metric' && (
                        <>
                            <SectionTitle>Расчёт метрики</SectionTitle>
                            <FieldSelect
                                label="Поле значения"
                                value={bindings.valueField || ''}
                                onChange={(value) => updateBinding('valueField', value)}
                                options={aggregatedValueFieldOptions}
                                placeholder="Выберите поле"
                                helperText="Поле, из которого берётся значение метрики"
                            />

                            <TextField
                                label="Описание (необязательно)"
                                value={config.description || ''}
                                onChange={(value) => updateConfig('description', value)}
                                placeholder="Например: Общая выручка"
                                helperText="Если оставить пустым, под метрикой ничего не появится"
                            />

                            <OptionSelect
                                label="Агрегация"
                                value={config.aggregation || 'sum'}
                                onChange={(value) => updateConfig('aggregation', value)}
                                options={aggregationOptions.filter((option) => option.value !== 'none')}
                                helperText="Способ вычисления итогового значения"
                            />
                        </>
                    )}
                </div>

                <div className="sticky bottom-0 border-t border-zinc-800 bg-zinc-950/95 p-4 backdrop-blur-xl">
                    <button
                        type="button"
                        onClick={onDeleteSelected}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-2.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
                    >
                        <Trash2 className="h-4 w-4" />
                        Удалить компонент
                    </button>
                </div>
            </aside>
        </>
    );
};

export default PropertiesPanel;
