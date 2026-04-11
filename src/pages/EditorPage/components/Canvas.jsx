import CanvasItem from './CanvasItem';

const Canvas = ({ components, selectedId, onSelect, onDelete }) => {
    return (
        <section className="h-full min-h-[700px] rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="mb-4">
                <h2 className="text-lg font-semibold text-white">Холст</h2>
                <p className="text-sm text-zinc-400">
                    Здесь отображаются добавленные элементы будущего дашборда
                </p>
            </div>

            {components.length === 0 ? (
                <div className="flex h-[500px] items-center justify-center rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/40">
                    <div className="text-center">
                        <h3 className="mb-2 text-lg font-medium text-white">Холст пока пуст</h3>
                        <p className="text-sm text-zinc-400">
                            Добавь элементы из палитры слева, чтобы начать проектирование
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                    {components.map((item) => (
                        <CanvasItem
                            key={item.id}
                            item={item}
                            isSelected={selectedId === item.id}
                            onSelect={onSelect}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </section>
    );
};

export default Canvas;