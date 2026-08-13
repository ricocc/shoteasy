import { Dropdown, Button } from 'antd';

const widths = [1, 2, 4, 6, 8];
const items = widths.map(width => ({
    key: width,
    label: (
        <span className="shoteasy-width-option" aria-label={`${width}px`}>
            <i style={{ height: `${width}px` }} />
        </span>
    ),
}));

export const WidthDropdown = ({ defaultValue, onChange, placement = 'bottom' }) => {
    const handleClick = ({ key }) => {
        onChange(Number(key));
    };
    return (
        <Dropdown
            menu={{ items, onClick: handleClick, selectedKeys: [defaultValue] }}
            trigger={['click']}
            placement={placement}
        >
            <Button
                type="text"
                shape="circle"
                className="shoteasy-width-button"
                aria-label={`线宽 ${defaultValue}px`}
            >
                <span className="shoteasy-width-preview" aria-hidden="true">
                    <i style={{ height: `${defaultValue}px` }} />
                </span>
            </Button>
        </Dropdown>
    );
};
