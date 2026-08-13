import { useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from '@components/Icon';
import { Input, Popover, Button } from 'antd';
import stores from '@stores';
import { cn, getMargin } from '@utils/utils';
import sizeConfig from '@utils/sizeConfig';
import CustomSize from './CustomSize';

const normalizeSearch = (value) => String(value || '').trim().toLocaleLowerCase().replace(/[：:×x]/g, ' ');

export default observer(() => {
    const box = useRef(null);
    const [open, setOpen] = useState(false);
    const [height, setHeight] = useState(500);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    const hide = () => setOpen(false);
    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
        if (newOpen && box.current) {
            const { y } = box.current.getBoundingClientRect();
            const availableHeight = window.innerHeight - y - 72;
            setHeight(Math.max(220, availableHeight));
        }
    };
    const checkSelected = (key, item) => (
        key === stores.option.size.type &&
        item.height === stores.option.frameConf.height &&
        item.width === stores.option.frameConf.width
    );
    const onSet = (value) => {
        hide();
        if (value.type === 'auto' && stores.editor.img.width) {
            const margin = getMargin(stores.editor.img.width, stores.editor.img.height);
            stores.option.setSize({ ...value, width: stores.editor.img.width + margin, height: stores.editor.img.height + margin });
            return;
        }
        stores.option.setSize(value);
    };
    const toSelected = (key, title, item) => {
        hide();
        stores.option.setSize({
            type: key,
            title: `${title}${item.title ? ` ${item.title}` : ''} ${item.w} : ${item.h}`,
            width: item.width,
            height: item.height,
        });
    };
    const filteredGroups = useMemo(() => {
        const query = normalizeSearch(search);
        return sizeConfig.map((group) => {
            if (category !== 'all' && group.category !== category) return null;
            const groupMatches = normalizeSearch(`${group.title} ${group.search}`).includes(query);
            const lists = groupMatches || !query
                ? group.lists
                : group.lists.filter((item) => normalizeSearch(`${item.title} ${item.search} ${item.w} ${item.h} ${item.width} ${item.height}`).includes(query));
            return lists.length ? { ...group, lists } : null;
        }).filter(Boolean);
    }, [category, search]);
    const title = <CustomSize type={stores.option.size.type} frameWidth={stores.option.frameConf.width} frameHeight={stores.option.frameConf.height} onSet={onSet} />;
    const isShowSize = stores.editor.img?.src || stores.option.size.type !== 'auto';
    const content = (
        <div className="shoteasy-size-popover flex h-full flex-col" data-mode={stores.editor.isDark ? 'dark' : 'light'}>
            <div className="shoteasy-size-popover__custom shrink-0">{title}</div>
            <div className="shrink-0 space-y-2 border-b border-[var(--se-border)] px-2 py-2">
                <Input
                    allowClear
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="搜索比例、平台或尺寸"
                    prefix={<Icon.Magnifier size={15} />}
                    aria-label="搜索尺寸"
                />
                <div className="flex gap-1 overflow-x-auto" role="tablist" aria-label="尺寸分类">
                    {[
                        { id: 'all', title: '全部' },
                        { id: 'ratio', title: '比例' },
                        { id: 'platform', title: '平台' },
                    ].map((item) => (
                        <Button
                            key={item.id}
                            size="small"
                            type={category === item.id ? 'primary' : 'text'}
                            onClick={() => setCategory(item.id)}
                            aria-selected={category === item.id}
                            role="tab"
                        >{item.title}</Button>
                    ))}
                </div>
            </div>
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-2">
                {filteredGroups.length ? filteredGroups.map((group) => (
                    <div key={group.key} data-size-category={group.key}>
                        <div className="font-semibold pt-2">{group.title}</div>
                        <section className="flex flex-wrap items-end border-b border-[var(--se-border)] pb-2">
                            {group.lists.map((child) => {
                                const selected = checkSelected(group.key, child);
                                return (
                                    <Button
                                        key={child.id}
                                        type="text"
                                        className={cn(
                                            'flex-[33%] p-3 h-auto flex-col gap-0 cursor-pointer',
                                            selected && 'bg-blue-500/10 text-blue-600 ring-1 ring-inset ring-blue-500 dark:text-blue-300',
                                        )}
                                        disabled={selected}
                                        onClick={() => toSelected(group.key, group.title, child)}
                                        aria-pressed={selected}
                                        aria-label={`${group.title} ${child.title || ''} ${child.w}:${child.h}`}
                                    >
                                        <div className="w-full px-3 py-2">
                                            <div
                                                className={cn(
                                                    'w-full flex items-center justify-center rounded-md border border-black/50 bg-black/10 opacity-75 dark:border-white/40 dark:bg-white/20',
                                                    selected && 'border-blue-500 opacity-100',
                                                )}
                                                style={{ aspectRatio: child.w / child.h }}
                                            ><span>{child.w} : {child.h}</span></div>
                                        </div>
                                        {child.title && <div className="text-xs">{child.title}</div>}
                                        <div className="overflow-hidden text-xs text-gray-500">{child.width} x {child.height}</div>
                                    </Button>
                                );
                            })}
                        </section>
                    </div>
                )) : <div className="py-8 text-center text-sm text-gray-500">没有匹配的尺寸</div>}
            </div>
        </div>
    );
    return (
        <Popover
            content={content}
            trigger="click"
            arrow={false}
            placement="bottomRight"
            open={open}
            overlayClassName={cn("shoteasy-components shoteasy-size-overlay", stores.editor.isDark && 'dark-mode')}
            overlayStyle={{ width: '420px', height: `${height}px`, maxHeight: 'calc(100vh - 72px)' }}
            styles={{ body: { height: '100%', minHeight: 0, padding: 0, overflow: 'hidden' } }}
            onOpenChange={handleOpenChange}
        >
            <button type="button" className={cn('shoteasy-size-trigger px-3 py-1.5 border shrink-0 gap-3 overflow-hidden max-h-12 cursor-pointer flex items-center', open && 'is-open')} ref={box} aria-expanded={open} aria-label="选择画布尺寸">
                <div className="w-4 rounded-sm border border-black/50 bg-black/10 dark:border-white/40 dark:bg-white/20" style={{ aspectRatio: stores.option.frameConf.width / stores.option.frameConf.height }} />
                <div className="text-xs">
                    <div className="mb-0.5 font-semibold leading-3">{stores.option.size.title}</div>
                    {!isShowSize ? <div className="leading-3 text-gray-500">自适应截图尺寸</div> : <div className="leading-3 text-gray-500">{stores.option.frameConf.width} x {stores.option.frameConf.height} px</div>}
                </div>
                <div className="flex-1" />
                {open ? <Icon.ChevronUp size={16} /> : <Icon.ChevronDown size={16} />}
            </button>
        </Popover>
    );
});
