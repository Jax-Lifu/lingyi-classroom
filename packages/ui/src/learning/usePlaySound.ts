import { useEffect, useState } from "react";
import type { Platform } from "@lingyi-classroom/shared";

export function usePlaySound(store: Platform["store"]) {
  const [muted, setMuted] = useState<boolean>();
  useEffect(() => {
    let live = true;
    const load = (saved?: boolean) => {
      if (live) setMuted((current) => current ?? saved === true);
    };
    void store
      .get<boolean>("play.muted.v1")
      .then(load)
      .catch(() => load());
    return () => {
      live = false;
    };
  }, [store]);

  function changeMuted(value: boolean) {
    setMuted(value);
    void store.set("play.muted.v1", value).catch(() => {});
  }
  return { muted, changeMuted };
}
