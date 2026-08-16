import { useMemo, useRef, useState } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from '@components/Icon';
import { Input, Popover, Button } from 'antd';
import stores from '@stores';
import { cn, getMargin } from '@utils/utils';
import sizeConfig from '@utils/sizeConfig';
import CustomSize from './CustomSize';

const normalizeSearch = (value) => String(value || '').trim().toLocaleLowerCase().replace(/[：:×x]/g, ' ');

export default observer(function SizeBar() {
    const box = useRef(null);
    const [open, setOpen] = useState(false);
    const [height, setHeight] = useState(560);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('all');

    const hide = () => setOpen(false);
    const handleOpenChange = (newOpen) => {
        setOpen(newOpen);
        if (newOpen && box.current) {
            const { y } = box.current.getBoundingClientRect();
            const availableHeight = window.innerHeight - y - 72;
            setHeight(Math.max(320, Math.min(640, availableHeight)));
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
            <div className="shoteasy-size-popover__toolbar shrink-0">
                <Input
                    allowClear
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="搜索比例、平台或尺寸"
                    prefix={<Icon.Magnifier size={15} />}
                    aria-label="搜索尺寸"
                />
                <div className="shoteasy-size-tabs" role="tablist" aria-label="尺寸分类">
                    {[
                        { id: 'all', title: '全部' },
                        { id: 'ratio', title: '比例' },
                        { id: 'platform', title: '平台' },
                    ].map((item) => (
                        <Button
                            key={item.id}
                            type="text"
                            className={cn(category === item.id && 'is-active')}
                            onClick={() => setCategory(item.id)}
                            aria-selected={category === item.id}
                            role="tab"
                        >{item.title}</Button>
                    ))}
                </div>
            </div>
            <div className="shoteasy-size-popover__scroll min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
                {filteredGroups.length ? filteredGroups.map((group) => (
                    <section className="shoteasy-size-group" key={group.key} data-size-category={group.key} aria-labelledby={`size-group-${group.key}`}>
                        <div className="shoteasy-size-group__heading">
                            <h3 id={`size-group-${group.key}`}>{group.title}</h3>
                            <span>{group.lists.length} 项</span>
                        </div>
                        <div className="shoteasy-size-grid">
                            {group.lists.map((child) => {
                                const selected = checkSelected(group.key, child);
                                const ratio = child.w / child.h;
                                const previewSize = ratio >= 1
                                    ? { width: 58, height: Math.max(18, 58 / ratio) }
                                    : { width: Math.max(18, 58 * ratio), height: 58 };
                                return (
                                    <button
                                        key={child.id}
                                        type="button"
                                        className={cn('shoteasy-size-option', selected && 'is-selected')}
                                        onClick={() => toSelected(group.key, group.title, child)}
                                        aria-pressed={selected}
                                        aria-label={`${group.title} ${child.title || ''} ${child.w}:${child.h}`}
                                    >
                                        <div className="shoteasy-size-option__preview" aria-hidden="true">
                                            <span style={previewSize} />
                                        </div>
                                        <strong>{child.title || `${child.w}:${child.h}`}</strong>
                                        <span className="shoteasy-size-option__meta">
                                            {child.title ? `${child.w}:${child.h} · ` : ''}{child.width} × {child.height}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                )) : <div className="shoteasy-size-empty">没有匹配的尺寸</div>}
            </div>
        </div>
    );
    return (
        <Popover
            content={content}
            trigger="click"
            arrow={false}
            placement="bottomLeft"
            open={open}
            overlayClassName={cn("shoteasy-components shoteasy-size-overlay", stores.editor.isDark && 'dark-mode')}
            overlayStyle={{ width: 'min(420px, calc(100vw - 24px))', height: `${height}px`, maxHeight: 'calc(100vh - 72px)' }}
            styles={{ body: { height: '100%', minHeight: 0, padding: 0, overflow: 'hidden' } }}
            onOpenChange={handleOpenChange}
        >
            <button type="button" className={cn('shoteasy-size-trigger', open && 'is-open')} ref={box} aria-expanded={open} aria-label="选择画布尺寸">
                <div className="shoteasy-size-trigger__preview" aria-hidden="true">
                    <span style={{ aspectRatio: stores.option.frameConf.width / stores.option.frameConf.height }} />
                </div>
                <div className="shoteasy-size-trigger__copy">
                    <div className="shoteasy-size-trigger__title">{stores.option.size.title}</div>
                    {!isShowSize ? <div className="shoteasy-size-trigger__meta">自适应截图尺寸</div> : <div className="shoteasy-size-trigger__meta">{stores.option.frameConf.width} × {stores.option.frameConf.height} px</div>}
                </div>
                <Icon.ChevronDown size={15} className="shoteasy-size-trigger__chevron" />
            </button>
        </Popover>
    );
});
