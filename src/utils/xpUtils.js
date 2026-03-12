export const XP_THRESHOLDS = [50, 100, 160, 240, 340, 460, 600, 760, 940, 1080, 900, 1100, 1320, 1560, 1830, 2120, 2440, 2790, 3200];
export const XP_CUMULATIVE = XP_THRESHOLDS.reduce((acc, v, i) => { acc.push((acc[i - 1] || 0) + v); return acc; }, []);

export const getLevelFromXp = (xp = 0) => {
  for (let i = 0; i < XP_CUMULATIVE.length; i++) {
    if (xp < XP_CUMULATIVE[i]) return i + 1; // levels 1-19
  }
  return 20; // max
};

export const getXpInfo = (xp = 0) => {
  const level = getLevelFromXp(xp);
  if (level >= 20) {
    return { level: 20, xpInLevel: XP_THRESHOLDS[18], xpToNext: 0, progressPct: 100 };
  }
  const prevCum = level >= 2 ? XP_CUMULATIVE[level - 2] : 0;
  const xpInLevel = xp - prevCum;
  const xpToNext = XP_THRESHOLDS[level - 1];
  return { level, xpInLevel, xpToNext, progressPct: Math.floor((xpInLevel / xpToNext) * 100) };
};

export const getLevelCharacter = (xp = 0) => {
  const { level } = getXpInfo(xp);
  if (level >= 20) return { imageUrl: "/characters/lv5.png", name: "プログラミングマスター", color: "text-amber-500", bg: "bg-amber-100", border: "border-amber-400", evolution: 5 };
  if (level >= 15) return { imageUrl: "/characters/lv4.png", name: "つよつよプログラマー", color: "text-purple-600", bg: "bg-purple-100", border: "border-purple-400", evolution: 4 };
  if (level >= 10) return { imageUrl: "/characters/lv3.png", name: "ゆうかんなチャレンジャー", color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-400", evolution: 3 };
  if (level >= 5)  return { imageUrl: "/characters/lv2.png", name: "げんきなチャレンジャー", color: "text-sky-500", bg: "bg-sky-100", border: "border-sky-400", evolution: 2 };
  return { imageUrl: "/characters/lv1.png", name: "はじまりのルーキー", color: "text-slate-500", bg: "bg-slate-100", border: "border-slate-300", evolution: 1 };
};

export const getGamePlayerLevel = (xp = 0) => {
  const { level } = getXpInfo(xp);
  if (level >= 20) return 5;
  if (level >= 15) return 5;
  if (level >= 10) return 4;
  if (level >= 5)  return 3;
  if (level >= 3)  return 2;
  return 1;
};
