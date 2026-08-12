"""M0 baseline: load demo, verify editor, export PNG/JPG/WebP at 1x/2x/3x, verify pixel dims."""
import struct, re
from playwright.sync_api import sync_playwright

BASE = "http://localhost:4173"
OUT = "C:/Users/win7-64/AppData/Local/Temp/m0"


def img_dims(path):
    with open(path, "rb") as f:
        head = f.read(32)
        f.seek(0)
        data = f.read()
    if head[:8] == b"\x89PNG\r\n\x1a\n":
        w, h = struct.unpack(">II", head[16:24])
        return w, h
    if head[:2] == b"\xff\xd8":  # JPEG
        i = 2
        while i < len(data) - 9:
            if data[i] != 0xFF:
                i += 1
                continue
            marker = data[i + 1]
            if marker in (0xC0, 0xC2):
                h, w = struct.unpack(">HH", data[i + 5:i + 9])
                return w, h
            seg = struct.unpack(">H", data[i + 2:i + 4])[0]
            i += 2 + seg
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        form = head[12:16]
        if form == b"VP8 ":
            w, h = struct.unpack("<HH", head[26:30])
            return w & 0x3FFF, h & 0x3FFF
        if form == b"VP8L":
            bits = struct.unpack("<I", head[21:25])[0]
            return (bits & 0x3FFF) + 1, ((bits >> 14) & 0x3FFF) + 1
        if form == b"VP8X":
            w = head[24] | (head[25] << 8) | (head[26] << 16)
            h = head[27] | (head[28] << 8) | (head[29] << 16)
            return w + 1, h + 1
    return None


def main():
    res = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 1440, "height": 900}, accept_downloads=True)
        page = ctx.new_page()
        page.goto(BASE)
        page.wait_for_load_state("networkidle")
        res["ua"] = page.evaluate("navigator.userAgent")
        page.screenshot(path=OUT + "_01_init.png", full_page=True)

        page.get_by_text("Give it a try").click()
        page.wait_for_timeout(3000)
        page.screenshot(path=OUT + "_02_editor.png", full_page=True)
        res["canvas_count"] = page.locator("canvas").count()

        # Open format Popover: click the gear button (Settings2). It's an icon-only button;
        # click buttons until a popover containing "Format" appears.
        opened = False
        for b in page.locator("button").all():
            try:
                b.click(timeout=800)
                page.wait_for_timeout(300)
                if page.locator(".ant-popover:not(.ant-popover-hidden)").count() > 0 \
                        and page.get_by_text("Format", exact=True).count() > 0:
                    opened = True
                    break
                # close any stray popconfirm/popover
                page.keyboard.press("Escape")
                page.wait_for_timeout(150)
            except Exception:
                continue
        res["popover_opened"] = opened
        if not opened:
            print("FAILED to open export popover; dumping state")
            print(res)
            browser.close()
            return

        # logical size from "Download Size" row
        logical = None
        try:
            txt = page.locator(".ant-popover:not(.ant-popover-hidden)").inner_text(timeout=2000)
            m = re.search(r"(\d[\d,]*)\s*x\s*(\d[\d,]*)", txt)
            if m:
                logical = (int(m.group(1).replace(",", "")), int(m.group(2).replace(",", "")))
        except Exception:
            pass
        res["logical_size"] = logical

        def export(fmt, ridx):
            # format segmented (png/jpg/webp)
            page.locator(".ant-popover:not(.ant-popover-hidden) .ant-segmented-item",
                         has_text=fmt).first.click()
            page.wait_for_timeout(200)
            # ratio segmented: items whose label ends with 'x' (1x/2x/3x)
            ritems = page.locator(".ant-popover:not(.ant-popover-hidden) .ant-segmented-item").all()
            ratio_labels = []
            for r in ritems:
                t = (r.inner_text() or "").strip()
                if re.fullmatch(r"\d+x", t):
                    ratio_labels.append(r)
            ratio_labels[ridx].click()
            page.wait_for_timeout(200)
            with page.expect_download(timeout=20000) as di:
                page.get_by_text("Download", exact=True).first.click()
            d = di.value
            label = "%s_%s" % (fmt, ratio_labels[ridx].inner_text().strip())
            path = OUT + "_" + label + "." + fmt
            d.save_as(path)
            return img_dims(path)

        cases = [("png", 0), ("png", 1), ("png", 2),
                 ("jpg", 0), ("webp", 0)]
        for fmt, ri in cases:
            try:
                res["export_%s_%dx" % (fmt, ri + 1)] = export(fmt, ri)
            except Exception as e:
                res["export_%s_%dx" % (fmt, ri + 1)] = "ERR " + repr(e)[:120]

        browser.close()

    print("=== M0 BASELINE ===")
    for k, v in res.items():
        print("%s = %s" % (k, v))


if __name__ == "__main__":
    main()
