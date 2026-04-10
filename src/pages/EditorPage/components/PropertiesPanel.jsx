const inputClassName =
    'w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-white outline-none transition placeholder:text-zinc-500 focus:border-blue-500';

const labelClassName = 'mb-2 block text-sm font-medium text-zinc-300';

const PropertiesPanel = ({ selectedComponent, onUpdateComponent, onDeleteSelected }) => {
    if (!selectedComponent) {
        return (
            <aside className="h-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                <h2 className="mb-2 text-lg font-semibold text-white">Свойства</h2>
                <p className="text-sm text-zinc-400">
                    Выбери элемент на холсте, чтобы редактировать его настройки
                </p>
            </aside>
        );
    }

    const { type, props } = selectedComponent;

    const updateProp = (key, value) => {
        onUpdateComponent(selectedComponent.id, {
            ...props,
            [key]: value,
        });
    };

    return (
        <aside className="h-full rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
                <div>
                    <h2 className="text-lg font-semibold text-white">Свойства</h2>
                    <p className="text-sm text-zinc-400">Тип: {type}</p>
                </div>

                <button
                    type="button"
                    onClick={onDeleteSelected}
                    className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
                >
                    Удалить
                </button>
            </div>

            <div className="space-y-4">
                <div>
                    <label className={labelClassName}>Заголовок</label>
                    <input
                        type="text"
                        value={props.title || ''}
                        onChange={(e) => updateProp('title', e.target.value)}
                        className={inputClassName}
                        placeholder="Введите заголовок"
                    />
                </div>

                {type === 'selectbox' && (
                    <>
                        <div>
                            <label className={labelClassName}>Поле данных</label>
                            <input
                                type="text"
                                value={props.field || ''}
                                onChange={(e) => updateProp('field', e.target.value)}
                                className={inputClassName}
                                placeholder="Например: department"
                            />
                        </div>

                        <div>
                            <label className={labelClassName}>Placeholder</label>
                            <input
                                type="text"
                                value={props.placeholder || ''}
                                onChange={(e) => updateProp('placeholder', e.target.value)}
                                className={inputClassName}
                                placeholder="Например: Выберите отдел"
                            />
                        </div>
                    </>
                )}

                {(type === 'line_chart' || type === 'bar_chart') && (
                    <>
                        <div>
                            <label className={labelClassName}>Поле X</label>
                            <input
                                type="text"
                                value={props.xField || ''}
                                onChange={(e) => updateProp('xField', e.target.value)}
                                className={inputClassName}
                                placeholder="Например: date"
                            />
                        </div>

                        <div>
                            <label className={labelClassName}>Поле Y</label>
                            <input
                                type="text"
                                value={props.yField || ''}
                                onChange={(e) => updateProp('yField', e.target.value)}
                                className={inputClassName}
                                placeholder="Например: sales"
                            />
                        </div>
                    </>
                )}

                {type === 'metric' && (
                    <>
                        <div>
                            <label className={labelClassName}>Поле значения</label>
                            <input
                                type="text"
                                value={props.valueField || ''}
                                onChange={(e) => updateProp('valueField', e.target.value)}
                                className={inputClassName}
                                placeholder="Например: revenue"
                            />
                        </div>

                        <div>
                            <label className={labelClassName}>Описание</label>
                            <input
                                type="text"
                                value={props.description || ''}
                                onChange={(e) => updateProp('description', e.target.value)}
                                className={inputClassName}
                                placeholder="Например: Общая выручка"
                            />
                        </div>
                    </>
                )}
            </div>
        </aside>
    );
};

export default PropertiesPanel;