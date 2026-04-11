import { PlusSquare } from 'lucide-react';
import { paletteItems } from '../data/paletteItems';

const ComponentsPalette = ({ onAddComponent }) => {
    return (
        <aside className="border-r border-zinc-800 bg-zinc-900 p-4">
            <div className="mb-4">
                <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-400 my-3">
                    Components
                </h2>
            </div>

            <div className="space-y-3">
                {paletteItems.map((item) => (
                    <button
                        key={item.type}
                        type="button"
                        onClick={() => onAddComponent(item)}
                        className="w-full rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-left transition hover:border-blue-500/40 hover:bg-zinc-800"
                    >
                        <div className="mb-2 flex items-center justify-between">
                            <span className="font-medium text-sm text-white">{item.label}</span>
                            <PlusSquare className="h-4 w-4 text-zinc-400" />
                        </div>
                        <p className="text-xs text-zinc-400">{item.description}</p>
                    </button>
                ))}
            </div>
        </aside>
    );
};

export default ComponentsPalette;