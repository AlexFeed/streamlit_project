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
import useTranslation from '../../../shared/translation/useTranslation.js';
import { getAppearanceDefaults } from '../services/componentAppearance.js';

const aggregationOptions = [
    { value: 'none', labelKey: 'editor.noAggregation' },
    { value: 'sum', labelKey: 'editor.sum' },
    { value: 'mean', labelKey: 'editor.mean' },
    { value: 'count', labelKey: 'editor.count' },
    { value: 'min', labelKey: 'editor.min' },
    { value: 'max', labelKey: 'editor.max' },
];

const sortOptions = [
    { value: 'none', labelKey: 'editor.noSort' },
    { value: 'asc', labelKey: 'editor.ascending' },
    { value: 'desc', labelKey: 'editor.descending' },
];

const sortByOptions = [
    { value: 'x', labelKey: 'editor.sortX' },
    { value: 'y', labelKey: 'editor.sortY' },
];

const fontSizeOptions = [12, 14, 16, 18, 20, 24, 28, 32].map((size) => ({
    value: String(size),
    label: `${size} px`,
}));

const fontWeightOptions = [
    { value: 'normal', labelKey: 'editor.normal' },
    { value: 'bold', labelKey: 'editor.bold' },
];

const fontStyleOptions = [
    { value: 'normal', labelKey: 'editor.normal' },
    { value: 'italic', labelKey: 'editor.italic' },
];

const textAlignOptions = [
    { value: 'left', labelKey: 'editor.alignLeft' },
    { value: 'center', labelKey: 'editor.alignCenter' },
    { value: 'right', labelKey: 'editor.alignRight' },
];

const PropertiesPanel = ({
                             selectedComponent,
                             onUpdateComponent,
                             onDeleteSelected,
                             onClose,
                             datasets = [],
                             pages = [],
                         }) => {
    const { t } = useTranslation();

    if (!selectedComponent) {
        return null;
    }

    const { type, config, bindings } = selectedComponent;
    const appearance = getAppearanceDefaults(type, config);
    const componentLabel = t(paletteItems[type]?.labelKey || 'editor.componentLabel');
    const localizeOptions = (options) => options.map(({ labelKey, ...option }) => ({
        ...option,
        label: t(labelKey),
    }));

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

    const updateConfig = (key, value) => {
        onUpdateComponent(selectedComponent.id, (component) => ({
            ...component,
            config: {
                ...component.config,
                [key]: value,
                ...(key === 'content' ? { contentKey: undefined } : {}),
            },
            layout: {
                ...component.layout,
                ...(key === 'heightMode' && value === 'auto' ? { manualHeight: false } : {}),
                ...(key === 'contentWidth' && value === 'content' ? { manualWidth: false } : {}),
            },
        }));
    };

    const updateBinding = (key, value) => {
        onUpdateComponent(selectedComponent.id, (component) => ({
            ...component,
            bindings: {
                ...component.bindings,
                [key]: value,
            },
        }));
    };

    const updateDataset = (nextDatasetId) => {
        const nextDataset = datasets.find((ds) => ds.datasetId === nextDatasetId);
        const nextFields = new Set(nextDataset?.fields || []);

        onUpdateComponent(selectedComponent.id, (component) => {
            const cleanedBindings = { ...component.bindings };

            Object.keys(cleanedBindings).forEach((key) => {
                if (Array.isArray(cleanedBindings[key])) {
                    cleanedBindings[key] = cleanedBindings[key].filter((field) => nextFields.has(field));
                } else if (cleanedBindings[key] && !nextFields.has(cleanedBindings[key])) {
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
                aria-label={t('editor.properties')}
                onClick={onClose}
                className="properties-backdrop"
            />
            <aside className="properties-panel">
                <div className="properties-panel-header">
                    <div>
                        <h2 className="properties-panel-title">
                            {config.title || componentLabel}
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="btn btn-secondary properties-close-button"
                    >
                        <X aria-hidden="true" />
                        {t('common.close')}
                    </button>
                </div>

                <div className="properties-panel-fields">
                    <TextField
                        label={type === 'text' ? t('editor.optionalTitle') : t('editor.chartTitle')}
                        value={config.title || ''}
                        onChange={(value) => updateConfig('title', value)}
                        placeholder={type === 'text'
                            ? t('editor.leaveBlank')
                            : t('editor.enterComponentTitle')}
                        helperText={type === 'text'
                            ? t('editor.titleIfBlank')
                            : t('editor.titleAbove')}
                    />

                    {!['text', 'page_link', 'layout_group'].includes(type) && (
                        <FieldSelect
                            label={t('editor.dataSource')}
                            value={activeDataset?.datasetId || ''}
                            onChange={updateDataset}
                            options={datasetOptions}
                            placeholder={t('editor.chooseCsv')}
                            helperText={t('editor.csvSource')}
                        />
                    )}

                    {type === 'text' && (
                        <>
                            <TextAreaField
                                label={t('editor.text')}
                                value={config.content || (config.contentKey ? t(config.contentKey) : '')}
                                onChange={(value) => updateConfig('content', value)}
                                placeholder={t('editor.textPlaceholder')}
                                helperText={t('editor.textDescription')}
                            />

                            <OptionSelect
                                label={t('editor.fontSize')}
                                value={String(config.fontSize || 16)}
                                onChange={(value) => updateConfig('fontSize', Number(value))}
                                options={fontSizeOptions}
                            />

                            <OptionSelect
                                label={t('editor.fontWeight')}
                                value={config.fontWeight || 'normal'}
                                onChange={(value) => updateConfig('fontWeight', value)}
                                options={localizeOptions(fontWeightOptions)}
                            />

                            <OptionSelect
                                label={t('editor.fontStyle')}
                                value={config.fontStyle || 'normal'}
                                onChange={(value) => updateConfig('fontStyle', value)}
                                options={localizeOptions(fontStyleOptions)}
                            />

                            <ColorField
                                label={t('editor.textColor')}
                                value={config.color || '#d4d4d8'}
                                onChange={(value) => updateConfig('color', value)}
                            />

                            <OptionSelect
                                label={t('editor.alignment')}
                                value={config.textAlign || 'left'}
                                onChange={(value) => updateConfig('textAlign', value)}
                                options={localizeOptions(textAlignOptions)}
                            />
                        </>
                    )}

                    {type === 'selectbox' && (
                        <>
                            <FieldSelect
                                label={t('editor.dataField')}
                                value={bindings.field || ''}
                                onChange={(value) => updateBinding('field', value)}
                                options={fieldOptions}
                                placeholder={t('editor.chooseField')}
                                helperText={t('editor.filterFieldHelp')}
                            />

                            <TextField
                                label={t('editor.filterPlaceholder')}
                                value={config.placeholder || ''}
                                onChange={(value) => updateConfig('placeholder', value)}
                                placeholder={t('editor.filterExample')}
                                helperText={t('editor.shownBeforeSelect')}
                            />

                            <OptionSelect
                                label={t('editor.filterAppearance')}
                                value={config.widget || 'selectbox'}
                                onChange={(value) => updateConfig('widget', value)}
                                options={[
                                    { value: 'selectbox', label: t('editor.filterSelectbox') },
                                    { value: 'multiselect', label: t('editor.filterMultiselect') },
                                    { value: 'radio', label: t('editor.filterRadio') },
                                    { value: 'segmented', label: t('editor.filterSegmented') },
                                    { value: 'pills', label: t('editor.filterPills') },
                                ]}
                            />
                        </>
                    )}

                    {type === 'table' && (
                        <>
                            <OptionSelect
                                label={t('editor.tableMode')}
                                value={config.tableMode || 'data'}
                                onChange={(value) => updateConfig('tableMode', value)}
                                options={[
                                    { value: 'data', label: t('editor.tableModeData') },
                                    { value: 'pivot', label: t('editor.tableModePivot') },
                                ]}
                            />
                            {(config.tableMode || 'data') === 'data' ? (
                            <MultiFieldSelect
                                label={t('editor.tableColumns')}
                                value={bindings.columns || []}
                                onChange={(value) => updateBinding('columns', value)}
                                options={fieldOptions}
                                helperText={t('editor.tableColumnsHelp')}
                            />
                            ) : (
                                <>
                                    <FieldSelect label={t('editor.pivotRows')} value={config.pivotIndex || ''} onChange={(value) => updateConfig('pivotIndex', value)} options={fieldOptions} placeholder={t('editor.chooseField')} />
                                    <FieldSelect label={t('editor.pivotValues')} value={config.pivotValue || ''} onChange={(value) => updateConfig('pivotValue', value)} options={valueFieldOptions} placeholder={t('editor.chooseField')} />
                                    <OptionSelect label={t('editor.pivotAggregation')} value={config.pivotAggregation || 'sum'} onChange={(value) => updateConfig('pivotAggregation', value)} options={localizeOptions(aggregationOptions.filter((option) => option.value !== 'none'))} />
                                </>
                            )}
                            <OptionSelect
                                label={t('editor.tableRowsMode')}
                                value={config.rowMode || 'limit'}
                                onChange={(value) => updateConfig('rowMode', value)}
                                options={[
                                    { value: 'all', label: t('editor.tableAllRows') },
                                    { value: 'limit', label: t('editor.tableFirstRows') },
                                ]}
                            />
                            {(config.rowMode || 'limit') === 'limit' && (
                                <TextField
                                    label={t('editor.tableRowLimit')}
                                    value={String(config.rowLimit || 50)}
                                    onChange={(value) => updateConfig('rowLimit', Math.max(1, Math.min(10000, Number(value) || 1)))}
                                    helperText={t('editor.tableRowLimitHelp')}
                                />
                            )}
                        </>
                    )}

                    {type === 'page_link' && (
                        <>
                            <OptionSelect
                                label={t('editor.targetPage')}
                                value={config.targetPageId || ''}
                                onChange={(value) => updateConfig('targetPageId', value)}
                                options={pages.filter((page) => page.id !== selectedComponent.pageId).map((page) => ({ value: page.id, label: page.title }))}
                            />
                            <OptionSelect
                                label={t('editor.linkAppearance')}
                                value={config.displayStyle || 'button'}
                                onChange={(value) => updateConfig('displayStyle', value)}
                                options={[
                                    { value: 'button', label: t('editor.asButton') },
                                    { value: 'link', label: t('editor.asTextLink') },
                                ]}
                            />
                            <ColorField
                                label={t('editor.buttonColor')}
                                value={config.buttonColor || '#f47721'}
                                onChange={(value) => updateConfig('buttonColor', value)}
                            />
                        </>
                    )}

                    {type === 'layout_group' && (
                        <>
                            <OptionSelect
                                label={t('editor.containerDirection')}
                                value={config.direction || 'vertical'}
                                onChange={(value) => updateConfig('direction', value)}
                                options={[
                                    { value: 'vertical', label: t('editor.vertical') },
                                    { value: 'horizontal', label: t('editor.horizontal') },
                                ]}
                            />
                            <TextField label={t('editor.containerGap')} value={String(config.gap ?? 8)} onChange={(value) => updateConfig('gap', Math.max(0, Math.min(64, Number(value) || 0)))} />
                            <TextField label={t('editor.padding')} value={String(config.padding ?? 8)} onChange={(value) => updateConfig('padding', Math.max(0, Math.min(64, Number(value) || 0)))} />
                        </>
                    )}

                    {paletteItems[type]?.isChart && (
                        <>
                            <FieldSelect
                                label={t('editor.fieldX')}
                                value={bindings.xField || ''}
                                onChange={(value) => updateBinding('xField', value)}
                                options={xFieldOptions}
                                placeholder={t('editor.chooseFieldX')}
                                helperText={t('editor.xAxisHelp')}
                            />

                            <FieldSelect
                                label={t('editor.fieldY')}
                                value={bindings.yField || ''}
                                onChange={(value) => updateBinding('yField', value)}
                                options={aggregatedValueFieldOptions}
                                placeholder={t('editor.chooseFieldY')}
                                helperText={t('editor.chartValuesHelp')}
                            />

                            <OptionSelect
                                label={t('editor.aggregation')}
                                value={config.aggregation || 'none'}
                                onChange={(value) => updateConfig('aggregation', value)}
                                options={localizeOptions(aggregationOptions)}
                                helperText={t('editor.aggregateHelp')}
                            />

                            <OptionSelect
                                label={t('editor.sort')}
                                value={config.sort || 'none'}
                                onChange={(value) => updateConfig('sort', value)}
                                options={localizeOptions(sortOptions)}
                                helperText={t('editor.sortDirection')}
                            />

                            {config.sort !== 'none' && (
                                <OptionSelect
                                    label={t('editor.sortBy')}
                                    value={config.sortBy || 'x'}
                                    onChange={(value) => updateConfig('sortBy', value)}
                                    options={localizeOptions(sortByOptions)}
                                    helperText={t('editor.sortHelp')}
                                />
                            )}

                            <ColorStyleField
                                type={type}
                                config={config}
                                onUpdate={updateConfig}
                            />

                            <ColorField label={t('editor.axisLabelColor')} value={config.axisLabelColor || '#766d66'} onChange={(value) => updateConfig('axisLabelColor', value)} />
                            <OptionSelect label={t('editor.axisLabelSize')} value={String(config.axisLabelFontSize || 11)} onChange={(value) => updateConfig('axisLabelFontSize', Number(value))} options={[10, 11, 12, 13, 14, 16].map((size) => ({ value: String(size), label: `${size} px` }))} />
                            <ColorField label={t('editor.axisTitleColor')} value={config.axisTitleColor || '#766d66'} onChange={(value) => updateConfig('axisTitleColor', value)} />
                            <OptionSelect label={t('editor.axisTitleSize')} value={String(config.axisTitleFontSize || 12)} onChange={(value) => updateConfig('axisTitleFontSize', Number(value))} options={[10, 11, 12, 13, 14, 16, 18].map((size) => ({ value: String(size), label: `${size} px` }))} />
                        </>
                    )}

                    {type === 'metric' && (
                        <>
                            <FieldSelect
                                label={t('editor.valueField')}
                                value={bindings.valueField || ''}
                                onChange={(value) => updateBinding('valueField', value)}
                                options={aggregatedValueFieldOptions}
                                placeholder={t('editor.chooseField')}
                                helperText={t('editor.metricFieldHelp')}
                            />

                            <TextField
                                label={t('editor.descriptionOptional')}
                                value={config.description || ''}
                                onChange={(value) => updateConfig('description', value)}
                                placeholder={t('editor.metricDescriptionExample')}
                                helperText={t('editor.metricDescriptionHelp')}
                            />

                            <OptionSelect
                                label={t('editor.aggregation')}
                                value={config.aggregation || 'sum'}
                                onChange={(value) => updateConfig('aggregation', value)}
                                options={localizeOptions(aggregationOptions.filter((option) => option.value !== 'none'))}
                                helperText={t('editor.aggregateMethod')}
                            />
                        </>
                    )}

                    <OptionSelect
                        label={t('editor.showBorder')}
                        value={appearance.showBorder ? 'show' : 'hide'}
                        onChange={(value) => updateConfig('showBorder', value === 'show')}
                        options={[
                            { value: 'show', label: t('editor.show') },
                            { value: 'hide', label: t('editor.hide') },
                        ]}
                    />

                    <OptionSelect
                        label={t('editor.showBackground')}
                        value={appearance.showBackground ? 'show' : 'hide'}
                        onChange={(value) => updateConfig('showBackground', value === 'show')}
                        options={[
                            { value: 'show', label: t('editor.show') },
                            { value: 'hide', label: t('editor.hide') },
                        ]}
                    />

                    {!paletteItems[type]?.isChart && type !== 'table' && type !== 'layout_group' && (
                        <>
                            {type !== 'text' && (
                                <>
                                    <OptionSelect
                                        label={t('editor.contentAlignment')}
                                        value={appearance.contentAlignment}
                                        onChange={(value) => updateConfig('contentAlignment', value)}
                                        options={localizeOptions(textAlignOptions)}
                                    />
                                    <OptionSelect
                                        label={t('editor.verticalAlignment')}
                                        value={appearance.verticalAlignment}
                                        onChange={(value) => updateConfig('verticalAlignment', value)}
                                        options={[
                                            { value: 'top', label: t('editor.alignTop') },
                                            { value: 'center', label: t('editor.alignMiddle') },
                                            { value: 'bottom', label: t('editor.alignBottom') },
                                        ]}
                                    />
                                </>
                            )}
                            <OptionSelect
                                label={t('editor.padding')}
                                value={String(appearance.padding)}
                                onChange={(value) => updateConfig('padding', Number(value))}
                                options={[0, 4, 8, 12, 16, 24, 32].map((size) => ({ value: String(size), label: `${size} px` }))}
                            />
                            <OptionSelect
                                label={t('editor.externalSpacing')}
                                value={String(appearance.spacing)}
                                onChange={(value) => updateConfig('spacing', Number(value))}
                                options={[0, 4, 8, 12, 16].map((size) => ({ value: String(size), label: `${size} px` }))}
                            />
                        </>
                    )}

                    {['metric', 'selectbox', 'page_link'].includes(type) && (
                        <>
                            <OptionSelect
                                label={t('editor.fontSize')}
                                value={String(appearance.elementFontSize)}
                                onChange={(value) => updateConfig('elementFontSize', value === 'auto' ? 'auto' : Number(value))}
                                options={[
                                    { value: 'auto', label: t('editor.automatic') },
                                    ...fontSizeOptions,
                                ]}
                            />
                            <OptionSelect label={t('editor.fontWeight')} value={appearance.elementFontWeight} onChange={(value) => updateConfig('elementFontWeight', value)} options={localizeOptions(fontWeightOptions)} />
                            <OptionSelect label={t('editor.fontStyle')} value={appearance.elementFontStyle} onChange={(value) => updateConfig('elementFontStyle', value)} options={localizeOptions(fontStyleOptions)} />
                            <ColorField label={t('editor.textColor')} value={appearance.elementTextColor} onChange={(value) => updateConfig('elementTextColor', value)} />
                        </>
                    )}
                </div>

                <div className="properties-panel-footer">
                    <button
                        type="button"
                        onClick={onDeleteSelected}
                        className="btn properties-delete-button"
                    >
                        <Trash2 aria-hidden="true" />
                        {t('editor.deleteComponent')}
                    </button>
                </div>
            </aside>
        </>
    );
};

export default PropertiesPanel;
