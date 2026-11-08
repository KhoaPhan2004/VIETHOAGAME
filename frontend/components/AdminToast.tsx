"use client";

import { useEffect, useState } from "react";

type AdminToastProps = {
  message?: string | null;
};

export default function AdminToast({ message }: AdminToastProps) {
  const [visible, setVisible] = useState(() => Boolean(message));

  useEffect(() => {
    if (!message) {
      return;
    }

    const timer = window.setTimeout(() => {
      setVisible(false);

      const url = new URL(window.location.href);
      url.searchParams.delete("notice");
      window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    }, 3500);

    return () => window.clearTimeout(timer);
  }, [message]);

  if (!message || !visible) {
    return null;
  }

  return (
    <div aria-live="polite" className="admin-toast" role="status">
      {message}
    </div>
  );
}
