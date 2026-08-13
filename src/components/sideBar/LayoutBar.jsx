import { observer } from 'mobx-react-lite';
import { Button } from 'antd';
import stores from '@stores';
import { cn } from '@utils/utils';
import { LAYOUT_PRESETS } from '@utils/layoutPresets';

const previewPlacement = {
    left: 'items-center justify-start',
    right: 'items-center justify-end',
    bottom: 'items-end justify-center',
    center: 'items-center justify-center',
};

const LayoutThumb = ({ preset }) => (
    <div
        className={cn('shoteasy-layout-thumb flex h-12 w-full', previewPlacement[preset.align] || previewPlacement.center)}
        data-layout-align={preset.align}
        data-layout-frame={preset.frame}
    >
        <div
            className="shoteasy-layout-thumb__surface transition-transform"
            style={{
                transform: `rotate(${preset.rotation}deg) scale(${Math.min(1.08, Math.max(0.72, preset.scale))})`,
                transformOrigin: preset.align === 'bottom' ? 'center bottom' : 'center',
            }}
        />
    </div>
);

const isSelected = (preset) => (
    stores.option.scale === preset.scale &&
    stores.option.rotation === preset.rotation &&
    stores.option.align === preset.align &&
    stores.option.padding === preset.padding &&
    stores.option.shadow === preset.shadow &&
    stores.option.frame === preset.frame
);

export default observer(() => (
    <section className="shoteasy-layout-panel" data-layout-panel>
        <div className="mb-2 text-sm font-semibold">布局</div>
        <div className="grid grid-cols-3 gap-1">
            {LAYOUT_PRESETS.map((preset) => {
                const selected = isSelected(preset);
                return (
                    <Button
                        key={preset.id}
                        type="text"
                        className={cn('shoteasy-layout-option h-auto min-w-0 p-1.5 text-xs', selected && 'is-selected')}
                        onClick={() => stores.option.applyLayoutPreset(preset.id)}
                        aria-pressed={selected}
                        data-layout-preset={preset.id}
                    >
                        <LayoutThumb preset={preset} />
                        <span className="shoteasy-layout-option__label mt-1 block whitespace-nowrap text-center">{preset.title}</span>
                    </Button>
                );
            })}
        </div>
    </section>
));
