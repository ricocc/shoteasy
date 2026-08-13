import { Radio } from 'antd';
import { getBackgroundEntries } from '@utils/backgroundConfig';
import { cn } from '@utils/utils';

export const BackgroundSelect = ({ type, options, onChange, value }) => {
    const lists = options?.length
        ? options
        : getBackgroundEntries(type).map((item) => ({ key: item.key, value: item }));
    const isImageCategory = type === 'cosmic' || type === 'desktop';
    return (
        <Radio.Group
            onChange={(e) => onChange(e.target.value)}
            value={value}
            rootClassName={cn(
                'shoteasy-background-options grid [&_span]:ps-0',
                isImageCategory ? 'grid-cols-5 gap-y-1.5' : 'grid-cols-7 gap-y-3'
            )}
        >
            {lists.map((item, index) => (
                <Radio
                    key={item.key || index}
                    className='[&_.ant-radio]:hidden [&_span]:p-0 mr-0'
                    value={item.key}
                    aria-label={item.value.label || item.key}
                >
                    {item.value.type === 'builtin-image' ? (
                        <div className={cn('w-12 h-8 rounded-md overflow-hidden')}>
                            <img src={`${item.value.class}&w=48`} alt="" className='w-full h-full object-cover object-center' />
                        </div>
                    ) : (
                        <div className={cn('w-8 h-8 rounded-full overflow-hidden', item.value.class)} title={item.value.label || item.key}></div>
                    )}
                </Radio>
            ))}
        </Radio.Group>
    );
};
