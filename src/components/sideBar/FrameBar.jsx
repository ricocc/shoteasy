import { useMemo, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from '@components/Icon';
import { Button, Radio, Drawer } from 'antd';
import stores from '@stores';
import { cn } from '@utils/utils';
import { DEVICE_FRAME_INFO, getFrameDefinition, getFrameGroups, isDeviceFrame } from '@utils/frameConfig';

const frameThumbStyle = (frame) => {
    const definition = getFrameDefinition(frame);
    const styles = {
        none: { background: 'rgba(148,163,184,.18)' },
        light: { background: 'rgba(148,163,184,.18)', border: '2px solid rgba(255,255,255,.9)' },
        dark: { background: 'rgba(148,163,184,.18)', border: '2px solid rgba(15,23,42,.65)' },
        card: { background: '#fff', borderRadius: 7, boxShadow: '0 3px 7px #0003' },
        stack: { background: '#fff', borderRadius: 7, boxShadow: '5px 4px 0 #dbe2ea, 0 3px 7px #0003' },
        stack2: { background: '#fff', borderRadius: 7, boxShadow: '8px 6px 0 #dbe2ea, 5px 4px 0 #eef2f7, 0 3px 7px #0003' },
        'glass-light': { background: '#ffffffaa', border: '1px solid #fff', borderRadius: 7, boxShadow: '0 3px 9px #64748b55' },
        'glass-dark': { background: '#111827cc', border: '1px solid #fff6', borderRadius: 7, boxShadow: '0 3px 9px #0005' },
        polaroid: { background: '#fff', borderRadius: 3, boxShadow: '0 3px 7px #0003', paddingBottom: 5 },
        'mac-light': { background: 'linear-gradient(#fff 0 25%, #cbd5e1 25%)', borderRadius: 4, boxShadow: '0 3px 7px #0003' },
        'mac-dark': { background: 'linear-gradient(#202124 0 25%, #64748b 25%)', borderRadius: 4, boxShadow: '0 3px 7px #0003' },
        'windows-light': { background: 'linear-gradient(#fff 0 25%, #cbd5e1 25%)', borderRadius: 4, boxShadow: '0 3px 7px #0003' },
        'windows-dark': { background: 'linear-gradient(#202124 0 25%, #64748b 25%)', borderRadius: 4, boxShadow: '0 3px 7px #0003' },
        arc: { background: 'linear-gradient(#e5e7eb 0 25%, #f6f7fb 25%)', border: '1px solid #cbd5e1', borderRadius: 5 },
    };
    if (definition.kind === 'device') {
        return { backgroundImage: `url(${DEVICE_FRAME_INFO[frame].image})`, backgroundPosition: 'center', backgroundRepeat: 'no-repeat', backgroundSize: 'contain' };
    }
    return styles[definition.thumbnail] || styles.none;
};

const FrameThumb = ({ frame, large = false }) => {
    const definition = getFrameDefinition(frame);
    return (
        <div className={cn('flex w-full items-center justify-center rounded-md bg-slate-400/10 px-2 py-1', large ? 'h-16' : 'h-9')}>
            <div className="relative h-full w-[82%]" style={frameThumbStyle(frame)}>
                {(definition.kind === 'browser' || definition.kind === 'arc') && <div className="absolute left-1 top-1 flex gap-0.5"><i className="h-1 w-1 rounded-full bg-red-400" /><i className="h-1 w-1 rounded-full bg-yellow-400" /><i className="h-1 w-1 rounded-full bg-green-400" /></div>}
            </div>
        </div>
    );
};

const FrameOption = ({ frame, large = false }) => {
    const definition = getFrameDefinition(frame);
    return (
        <Radio value={frame} aria-label={definition.title} className="[&_.ant-radio]:hidden [&_span]:mr-0 [&_span]:block [&_span]:w-full">
            <div className="space-y-1 text-center">
                <FrameThumb frame={frame} large={large} />
                <div className="truncate text-[11px]">{definition.title}</div>
            </div>
        </Radio>
    );
};

export default observer(() => {
    const [showMore, setShowMore] = useState(false);
    const groups = useMemo(() => getFrameGroups(), []);
    const selectFrame = (value) => {
        stores.option.setFrame(value);
        if (value === 'macbookpro16') stores.option.setPaddingBg('#000000');
    };
    const device = isDeviceFrame(stores.option.frame);
    return (
        <>
            <div className="shoteasy-frame-panel [&_label]:font-semibold [&_label]:text-sm">
                <div className="flex items-center justify-between">
                    <label>外框</label>
                    <Button type="text" size="small" className="m-0 flex items-center text-xs opacity-80" onClick={() => setShowMore(true)}>全部外框 <Icon.ChevronRight size={16} /></Button>
                </div>
                <div className="py-3 [&_.ant-radio-wrapper_span]:p-0 [&_.ant-radio-wrapper_span]:px-1">
                    <Radio.Group rootClassName="grid grid-cols-3" onChange={(event) => selectFrame(event.target.value)} value={stores.option.frame}>
                        {groups.find((group) => group.id === 'basic')?.items.slice(0, 6).map((item) => <FrameOption key={item.id} frame={item.id} />)}
                    </Radio.Group>
                </div>
            </div>
            <Drawer
                title="全部外框"
                placement="right"
                closable
                mask={false}
                onClose={() => setShowMore(false)}
                open={showMore}
                getContainer={false}
                width="100%"
                className="[&_.ant-drawer-body]:p-0"
            >
                <div className="shoteasy-frame-drawer h-full overflow-y-auto px-4 py-3">
                    {groups.map((group) => (
                        <section key={group.id} className="border-b border-gray-200 py-2 last:border-0 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <h4 className="py-2 text-sm font-bold">{group.title}</h4>
                                {group.id === 'device' && (
                                    <Radio.Group value={stores.option.frameMode} onChange={(event) => stores.option.setFrameMode(event.target.value)} size="small" aria-label="设备图片适配方式">
                                        <Radio.Button value="cover">覆盖</Radio.Button>
                                        <Radio.Button value="fit">包含</Radio.Button>
                                        <Radio.Button value="strench">拉伸</Radio.Button>
                                    </Radio.Group>
                                )}
                            </div>
                            <Radio.Group rootClassName="grid grid-cols-3" onChange={(event) => selectFrame(event.target.value)} value={stores.option.frame}>
                                {group.items.map((item) => <FrameOption key={item.id} frame={item.id} large />)}
                            </Radio.Group>
                        </section>
                    ))}
                    {device && <div className="pt-3 text-xs text-gray-500">设备外框当前使用：{getFrameDefinition(stores.option.frame).title}</div>}
                </div>
            </Drawer>
        </>
    );
});
