import type { AnchorHTMLAttributes, MouseEvent } from "react";
import { useRouter } from "./runtime";
export default function Link({ href, onClick, prefetch: _prefetch, scroll, replace, ...props }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; prefetch?: boolean; scroll?: boolean; replace?: boolean }) {
  const router = useRouter();
  return <a {...props} href={href} onClick={(event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented || event.button || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || props.target || props.download || href.startsWith("#")) return;
    const url = new URL(href, location.href);
    if (url.origin !== location.origin) return;
    event.preventDefault();
    if (replace) router.replace(href); else router.push(href, { scroll });
  }} />;
}
