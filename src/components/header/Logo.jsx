import logoUrl from '@assets/logo.png';

export default function Logo() {
    return (
        <h1 className="m-0">
            <a href="https://shoteasy.fun" target="_blank" aria-label="RicoScreenshot" className="shoteasy-logo flex gap-2 items-center text-xs font-semibold">
                <img src={logoUrl} alt="" className="shoteasy-logo__image" />
                <span>RicoScreenshot</span>
            </a>
        </h1>
    )
}
