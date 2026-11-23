import { useEffect, useRef, useState } from "react";
import { changeLearningStamps, LearningStampsWereReset, learningStampVersion, learningStampKey, readLearningStamps, type Platform } from "@lingyi-classroom/shared";
import { expandLearnedIds } from "./childCatalog";

export type StampResult = "saved" | "failed" | "reset";

export function usePracticeRecord({ store }: Platform) {
  const [done, setDone] = useState(new Set<string>());
  const [notice, setNotice] = useState("");
  const [resetVersion, setResetVersion] = useState(0);
  const revision = useRef(0);
  useEffect(() => {
    const refresh = () => {
      const request = ++revision.current;
      void readLearningStamps(store).then((ids) => {
        if (request === revision.current) {
          setResetVersion(learningStampVersion(store));
          setDone(expandLearnedIds(ids));
          setNotice("");
        }
      }).catch(() => {
        if (request === revision.current) setNotice("本次可以练习，学习记录暂时无法读取。");
      });
    };
    const unsubscribe = store.subscribe?.(learningStampKey, refresh);
    refresh();
    return () => { revision.current++; unsubscribe?.(); };
  }, [store]);

  async function change(id: string, learned: boolean, version?: number): Promise<StampResult> {
    const ids = learned ? [id] : [...expandLearnedIds([id])];
    const request = ++revision.current;
    try {
      const saved = await changeLearningStamps(store, ids, learned, version);
      if (request === revision.current) {
        setDone(expandLearnedIds(saved));
        setNotice("");
      }
      return "saved";
    } catch (error) {
      if (error instanceof LearningStampsWereReset) {
        setResetVersion(learningStampVersion(store));
        return "reset";
      }
      if (request === revision.current && version === undefined) setNotice("本次可以练习，本设备暂时无法保存学习印章。");
      return "failed";
    }
  }
  return { done, notice, resetVersion, mark: (id: string, version?: number) => change(id, true, version), unmark: (id: string) => change(id, false) };
}
