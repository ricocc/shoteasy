import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import Icon from '@components/Icon';
import { Button, Popover } from 'antd';
import { cn } from '@utils/utils';
import stores from '@stores';

const cols = ['top-left', 'top', 'top-right', 'left', 'center', 'right', 'bottom-left', 'bottom', 'bottom-right'];

export default observer(function Position() {
    const [open, setOpen] = useState(false);
    const handleSelect = (value) => {
        stores.option.setAlign(value);
        setOpen(false);
    };
    const content = (
        <div className={cn('shoteasy-position-grid position-block', stores.option.align)} role="group" aria-label="图片位置">
            {cols.map(item => (
                <button
                    key={item}
                    type="button"
                    className="w-8 h-8 border border-[var(--c-br)] rounded-sm hover:bg-[var(--c-wb)] cursor-pointer"
                    aria-label={item}
                    aria-pressed={stores.option.align === item}
                    onClick={() => handleSelect(item)}
                />
            ))}
        </div>
    );
    return (
        <Popover
            content={content}
            trigger="click"
            arrow={false}
            placement="bottomRight"
            overlayClassName={cn('shoteasy-components', stores.editor.isDark && 'dark-mode')}
            open={open}
            onOpenChange={setOpen}
        >
            <Button
                type="text"
                shape="circle"
                className={cn('shoteasy-inspector-icon-button', open && 'is-active')}
                aria-label="图片位置"
                icon={<Icon.LayoutGrid size={18} />}
            />
        </Popover>
    );
});
