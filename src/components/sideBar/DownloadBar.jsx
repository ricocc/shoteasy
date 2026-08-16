import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import '@leafer-in/export';
import Icon from '@components/Icon';
import { Button, Tooltip, Popover, Segmented, ConfigProvider, Popconfirm, Upload } from 'antd';
import stores from '@stores';
import { supportImg, toDownloadFile, nanoid, modKey } from '@utils/utils';
import useKeyboardShortcuts from '@hooks/useKeyboardShortcuts';
import useSetImg from '@hooks/useSetImg';

export default observer(function DownloadBar() {
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [format, setFormat] = useState('png');
    const [ratio, setRatio] = useState(1);
    const hasImage = Boolean(stores.editor.img?.src);
    const getFile = useSetImg(stores);

    const replaceImage = async (file) => {
        try {
            await getFile(file, 'blob', { replace: true });
        } catch {
            stores.editor.message?.error?.('图片加载失败，请选择有效图片');
        }
        return Upload.LIST_IGNORE;
    };

    const toDownload = async () => {
        if (!stores.editor.isEditing || loading) return;
        const option = { pixelRatio: ratio, blob: true };
        if (['jpg', 'webp'].includes(format)) {
            option.quality = 0.9;
            option.fill = '#ffffff';
        }
        const key = nanoid();
        setLoading(true);
        stores.editor.message.open({ key, type: 'loading', content: '正在下载…' });
        try {
            const result = await stores.editor.app.tree.export(format, option);
            let name = 'RicoScreenshot';
            if (ratio > 1) name += `@${ratio}`;
            await toDownloadFile(result.data, `${name}.${format}`);
            stores.editor.message.open({ key, type: 'success', content: '下载成功' });
        } catch {
            stores.editor.message.open({ key, type: 'error', content: '下载失败' });
        } finally {
            setLoading(false);
        }
    };

    const toCopy = async () => {
        if (!stores.editor.isEditing || loading) return;
        const key = nanoid();
        setLoading(true);
        stores.editor.message.open({ key, type: 'loading', content: '正在复制…' });
        await stores.editor.app.tree.export('png', { blob: true, pixelRatio: ratio }).then(async result => {
            await navigator.clipboard.write([
                new ClipboardItem({ [result.data.type]: result.data }),
            ]);
            stores.editor.message.open({ key, type: 'success', content: '复制成功' });
        }).catch(() => {
            stores.editor.message.open({ key, type: 'error', content: '复制失败' });
        });
        setLoading(false);
    };

    const confirm = () => {
        stores.editor.destroy();
        stores.editor.clearImg();
        stores.editor.clearFun && stores.editor.clearFun();
    };

    useKeyboardShortcuts(() => toDownload(), () => toCopy(), [toDownload, toCopy]);

    const content = (
        <div className="shoteasy-export-popover">
            <div className="p-3 [&_.ant-segmented]:w-full [&_.ant-segmented-item]:w-[33%]">
                <div className="text-xs font-medium text-[var(--se-muted)] mb-2">格式</div>
                <Segmented
                    options={['png', 'jpg', 'webp']}
                    size="middle"
                    value={format}
                    onChange={setFormat}
                />
                <div className="text-xs font-medium text-[var(--se-muted)] mt-4 mb-2">像素倍率</div>
                <Segmented
                    options={[{ value: 1, label: '1x' }, { value: 2, label: '2x' }, { value: 3, label: '3x' }]}
                    size="middle"
                    value={ratio}
                    onChange={setRatio}
                />
                {stores.option.frameConf.width && (
                    <div className="text-xs p-3 mt-4 flex justify-between bg-[var(--se-panel-muted)] rounded-lg">
                        <span className="text-[var(--se-muted)]">导出尺寸</span>
                        <span className="font-medium text-[var(--se-ink)]" style={{ fontFamily: 'var(--font-mono)', fontVariantNumeric: 'tabular-nums' }}>
                            {stores.option.frameConf.width * ratio} × {stores.option.frameConf.height * ratio}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="shoteasy-top-actions">
            <ConfigProvider
                theme={{
                    components: {
                        Button: {
                            colorPrimary: stores.editor.isDark ? '#0066ff' : '#2563eb',
                            algorithm: true,
                        },
                    },
                }}
            >
                <Upload
                    accept={supportImg.join(',')}
                    showUploadList={false}
                    beforeUpload={replaceImage}
                    disabled={!hasImage || loading}
                >
                    <Tooltip placement="bottom" arrow={false} title="更换图片">
                        <Button
                            type="default"
                            size="middle"
                            className="shoteasy-top-action"
                            disabled={!hasImage || loading}
                            icon={<Icon.ImagePlus size={17} />}
                            aria-label="更换图片"
                        />
                    </Tooltip>
                </Upload>
                <Tooltip placement="bottom" arrow={false} title={`下载 ${modKey} + S · ${ratio}x ${format.toUpperCase()}`}>
                    <Button
                        type="primary"
                        size="middle"
                        className="shoteasy-top-action shoteasy-top-action--primary"
                        loading={loading}
                        disabled={!hasImage}
                        icon={<Icon.Download size={17} />}
                        aria-label="下载图片"
                        onClick={toDownload}
                    />
                </Tooltip>
                <Tooltip placement="bottom" arrow={false} title={`复制 ${modKey} + C`}>
                    <Button
                        type="default"
                        size="middle"
                        className="shoteasy-top-action"
                        icon={<Icon.Copy size={17} />}
                        loading={loading}
                        disabled={!hasImage}
                        aria-label="复制图片"
                        onClick={toCopy}
                    />
                </Tooltip>
                <Popover
                    content={content}
                    trigger="click"
                    arrow={false}
                    placement="bottomRight"
                    open={open}
                    overlayStyle={{ width: '320px' }}
                    onOpenChange={setOpen}
                >
                    <Tooltip placement="bottom" arrow={false} title="导出格式与倍率">
                        <Button
                            size="middle"
                            className="shoteasy-top-action shoteasy-top-action--export"
                            disabled={!hasImage}
                            aria-label={`导出格式与倍率（当前 ${ratio}x ${format.toUpperCase()}）`}
                        >
                            {ratio}x · {format.toUpperCase()}
                        </Button>
                    </Tooltip>
                </Popover>
                {hasImage && (
                    <Popconfirm
                        title="删除截图"
                        description="确定要删除当前截图吗？"
                        placement="bottomRight"
                        onConfirm={confirm}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            size="middle"
                            danger
                            className="shoteasy-top-action"
                            icon={<Icon.Trash2 size={17} />}
                            aria-label="删除截图"
                        />
                    </Popconfirm>
                )}
            </ConfigProvider>
        </div>
    );
});
