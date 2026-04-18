import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db, appId } from '../firebase.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Swords, Heart, Zap, Trophy, RotateCcw, ChevronRight, Shield, X } from 'lucide-react';
import { GACHA_ITEMS } from '../data/items.js';

// ----------------------------------------------------------------
// 単語リスト (ひらがな + 標準ローマ字)
// ----------------------------------------------------------------
const WORD_LIST = [
  { kana: 'ねこ', romaji: 'neko' }, { kana: 'いぬ', romaji: 'inu' },
  { kana: 'さかな', romaji: 'sakana' }, { kana: 'りんご', romaji: 'ringo' },
  { kana: 'きのこ', romaji: 'kinoko' }, { kana: 'はな', romaji: 'hana' },
  { kana: 'くも', romaji: 'kumo' }, { kana: 'かぜ', romaji: 'kaze' },
  { kana: 'もり', romaji: 'mori' }, { kana: 'ひかり', romaji: 'hikari' },
  { kana: 'ほし', romaji: 'hoshi' }, { kana: 'つき', romaji: 'tsuki' },
  { kana: 'たいよう', romaji: 'taiyou' }, { kana: 'うみ', romaji: 'umi' },
  { kana: 'やま', romaji: 'yama' }, { kana: 'かわ', romaji: 'kawa' },
  { kana: 'そら', romaji: 'sora' }, { kana: 'くるま', romaji: 'kuruma' },
  { kana: 'えんぴつ', romaji: 'enpitsu' }, { kana: 'でんしゃ', romaji: 'densha' },
  { kana: 'こうえん', romaji: 'kouen' }, { kana: 'がっこう', romaji: 'gakkou' },
  { kana: 'ともだち', romaji: 'tomodachi' }, { kana: 'せんせい', romaji: 'sensei' },
  { kana: 'いえ', romaji: 'ie' }, { kana: 'まち', romaji: 'machi' },
  { kana: 'らいおん', romaji: 'raion' }, { kana: 'ぞう', romaji: 'zou' },
  { kana: 'きりん', romaji: 'kirin' }, { kana: 'ぱんだ', romaji: 'panda' },
  { kana: 'ぺんぎん', romaji: 'pengin' }, { kana: 'とり', romaji: 'tori' },
  { kana: 'うさぎ', romaji: 'usagi' }, { kana: 'かめ', romaji: 'kame' },
  { kana: 'へび', romaji: 'hebi' }, { kana: 'くじら', romaji: 'kujira' },
  { kana: 'いるか', romaji: 'iruka' }, { kana: 'たこ', romaji: 'tako' },
  { kana: 'えび', romaji: 'ebi' }, { kana: 'かに', romaji: 'kani' },
  { kana: 'すいか', romaji: 'suika' }, { kana: 'ばなな', romaji: 'banana' },
  { kana: 'みかん', romaji: 'mikan' }, { kana: 'いちご', romaji: 'ichigo' },
  { kana: 'ぶどう', romaji: 'budou' }, { kana: 'もも', romaji: 'momo' },
  { kana: 'なし', romaji: 'nashi' }, { kana: 'かき', romaji: 'kaki' },
  { kana: 'さくら', romaji: 'sakura' }, { kana: 'たんぽぽ', romaji: 'tanpopo' },
  { kana: 'ひまわり', romaji: 'himawari' }, { kana: 'つばき', romaji: 'tsubaki' },
  { kana: 'あさがお', romaji: 'asagao' }, { kana: 'ゆり', romaji: 'yuri' },
  { kana: 'しんかんせん', romaji: 'shinkansen' }, { kana: 'ひこうき', romaji: 'hikouki' },
  { kana: 'ふね', romaji: 'fune' }, { kana: 'じてんしゃ', romaji: 'jitensha' },
  { kana: 'ばす', romaji: 'basu' }, { kana: 'たくしー', romaji: 'takushii' },
  { kana: 'ろけっと', romaji: 'roketto' }, { kana: 'うちゅうせん', romaji: 'uchuusen' },
  { kana: 'にじ', romaji: 'niji' }, { kana: 'あめ', romaji: 'ame' },
  { kana: 'ゆき', romaji: 'yuki' }, { kana: 'かみなり', romaji: 'kaminari' },
  { kana: 'たいふう', romaji: 'taifuu' }, { kana: 'こおり', romaji: 'koori' },
  { kana: 'しも', romaji: 'shimo' }, { kana: 'きり', romaji: 'kiri' },
  { kana: 'なつ', romaji: 'natsu' }, { kana: 'ふゆ', romaji: 'fuyu' },
  { kana: 'はる', romaji: 'haru' }, { kana: 'あき', romaji: 'aki' },
  { kana: 'おにぎり', romaji: 'onigiri' }, { kana: 'らーめん', romaji: 'raamen' },
  { kana: 'すし', romaji: 'sushi' }, { kana: 'てんぷら', romaji: 'tenpura' },
  { kana: 'みそしる', romaji: 'misoshiru' }, { kana: 'うどん', romaji: 'udon' },
  { kana: 'そば', romaji: 'soba' }, { kana: 'やきとり', romaji: 'yakitori' },
  { kana: 'たこやき', romaji: 'takoyaki' }, { kana: 'おこのみやき', romaji: 'okonomiyaki' },
  { kana: 'しんごう', romaji: 'shingou' }, { kana: 'びょういん', romaji: 'byouin' },
  { kana: 'としょかん', romaji: 'toshokan' }, { kana: 'コンビニ', romaji: 'konbini' },
  { kana: 'ゆうびんきょく', romaji: 'yuubinkyoku' }, { kana: 'けいさつ', romaji: 'keisatsu' },
  { kana: 'まほう', romaji: 'mahou' }, { kana: 'ゆうしゃ', romaji: 'yuusha' },
  { kana: 'ぼうけん', romaji: 'bouken' }, { kana: 'ドラゴン', romaji: 'doragon' },
  { kana: 'きし', romaji: 'kishi' }, { kana: 'まおう', romaji: 'maou' },
  { kana: 'ひみつ', romaji: 'himitsu' }, { kana: 'でんせつ', romaji: 'densetsu' },
  { kana: 'ちから', romaji: 'chikara' }, { kana: 'ゆうき', romaji: 'yuuki' },
  { kana: 'きぼう', romaji: 'kibou' }, { kana: 'とびら', romaji: 'tobira' },
  { kana: 'たから', romaji: 'takara' }, { kana: 'はっけん', romaji: 'hakken' },
  { kana: 'しんか', romaji: 'shinka' }, { kana: 'ロボット', romaji: 'robotto' },
  { kana: 'きかい', romaji: 'kikai' }, { kana: 'でんき', romaji: 'denki' },
  { kana: 'カメラ', romaji: 'kamera' }, { kana: 'けいたい', romaji: 'keitai' },
  { kana: 'ちょうせん', romaji: 'chousen' }, { kana: 'かいぞく', romaji: 'kaizoku' },
  { kana: 'しんぴ', romaji: 'shinpi' }, { kana: 'ぶんか', romaji: 'bunka' },
  { kana: 'まつり', romaji: 'matsuri' }, { kana: 'おまつり', romaji: 'omatsuri' },
  { kana: 'あいさつ', romaji: 'aisatsu' }, { kana: 'ちきゅう', romaji: 'chikyuu' },
  { kana: 'うちゅう', romaji: 'uchuu' }, { kana: 'たんけん', romaji: 'tanken' },
];

// ----------------------------------------------------------------
// 効果音 (Web Audio API)
// ----------------------------------------------------------------
const audioCtx = typeof window !== 'undefined'
  ? new (window.AudioContext || window.webkitAudioContext)()
  : null;

const playSound = (type) => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  const t = audioCtx.currentTime;
  if (type === 'hit') {
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(1200, t + 0.1);
    gain.gain.setValueAtTime(0.08, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
    osc.start(t); osc.stop(t + 0.1);
  } else if (type === 'miss') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
    gain.gain.setValueAtTime(0.1, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.start(t); osc.stop(t + 0.15);
  } else if (type === 'damage') {
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);
    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
    osc.start(t); osc.stop(t + 0.2);
  } else if (type === 'win') {
    osc.type = 'triangle';
    gain.gain.setValueAtTime(0.1, t);
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.setValueAtTime(554, t + 0.1);
    osc.frequency.setValueAtTime(659, t + 0.2);
    osc.frequency.setValueAtTime(880, t + 0.3);
    gain.gain.linearRampToValueAtTime(0, t + 0.6);
    osc.start(t); osc.stop(t + 0.6);
  }
};

// ----------------------------------------------------------------
// ステージ定義
// ----------------------------------------------------------------
const STAGES = [
  { id: 1,  name: 'スライム',      emoji: '🟢', hp: 30,   atk: 3,   minLv: 1, desc: 'よわよわのスライム。まずここからはじめよう！', bg: 'from-emerald-400 via-green-500 to-teal-600' },
  { id: 2,  name: 'コウモリ',      emoji: '🦇', hp: 60,   atk: 6,   minLv: 1, desc: 'すばやく飛び回るコウモリだ！', bg: 'from-slate-700 via-slate-800 to-slate-900' },
  { id: 3,  name: 'ゴブリン',      emoji: '👺', hp: 100,  atk: 10,  minLv: 1, desc: 'いたずら好きのゴブリンが現れた！', bg: 'from-lime-600 via-green-700 to-emerald-800' },
  { id: 4,  name: 'オーク',        emoji: '👹', hp: 150,  atk: 16,  minLv: 2, desc: 'でかくて強いオーク！Lv2以上推奨。', bg: 'from-orange-700 via-red-800 to-stone-900' },
  { id: 5,  name: 'スケルトン',    emoji: '💀', hp: 220,  atk: 24,  minLv: 2, desc: 'ガシャガシャうごくスケルトン！', bg: 'from-gray-800 via-zinc-900 to-black' },
  { id: 6,  name: 'ウィッチ',      emoji: '🧙', hp: 300,  atk: 33,  minLv: 3, desc: '強力な呪文を使うウィッチ。Lv3以上推奨！', bg: 'from-purple-800 via-violet-900 to-indigo-950' },
  { id: 7,  name: 'ドラゴン',      emoji: '🐉', hp: 400,  atk: 44,  minLv: 3, desc: '炎をはくドラゴン！かなり強い！', bg: 'from-rose-700 via-red-800 to-orange-900' },
  { id: 8,  name: 'ダークナイト',  emoji: '🛡️', hp: 520,  atk: 57,  minLv: 4, desc: '暗黒騎士が立ちはだかる！Lv4以上推奨。', bg: 'from-slate-900 via-zinc-900 to-neutral-900' },
  { id: 9,  name: 'デーモン',      emoji: '😈', hp: 680,  atk: 72,  minLv: 4, desc: '地獄から来た悪魔！Lv5でないと勝てないかも…', bg: 'from-red-950 via-rose-900 to-orange-950' },
  { id: 10, name: 'ラスボス',      emoji: '👑', hp: 900,  atk: 90,  minLv: 5, desc: '伝説の魔王！最強のキャラクターで挑め！', bg: 'from-yellow-900 via-amber-950 to-stone-950' },
  { id: 11, name: 'キメラ',        emoji: '🦁', hp: 1200, atk: 110, minLv: 5, desc: 'ガチャで装備を整えないと苦戦するぞ！', bg: 'from-fuchsia-900 via-purple-950 to-black' },
  { id: 12, name: 'ゴーレム',      emoji: '🗿', hp: 1600, atk: 130, minLv: 5, desc: '岩のように硬い！HPが多いぞ！', bg: 'from-stone-700 via-stone-800 to-stone-950' },
  { id: 13, name: 'ヴァンパイア',  emoji: '🧛', hp: 2000, atk: 150, minLv: 5, desc: '夜の支配者！強力な防具が必要だ！', bg: 'from-red-900 via-rose-950 to-black' },
  { id: 14, name: 'デスナイト',    emoji: '⚔️', hp: 2400, atk: 170, minLv: 5, desc: '死すら超えた騎士！Sレア以上推奨！', bg: 'from-slate-800 via-slate-900 to-black' },
  { id: 15, name: 'ベヒモス',      emoji: '🦏', hp: 2800, atk: 200, minLv: 5, desc: '大地を揺るがす巨獣！', bg: 'from-orange-900 via-amber-900 to-black' },
  { id: 16, name: 'リヴァイアサン', emoji: '🌊', hp: 3200, atk: 220, minLv: 5, desc: '海の神獣！凄まじい攻撃力！', bg: 'from-blue-900 via-cyan-950 to-black' },
  { id: 17, name: '古の邪竜',      emoji: '🐲', hp: 3800, atk: 250, minLv: 5, desc: '封印されし竜が目覚めた！', bg: 'from-emerald-950 via-teal-950 to-black' },
  { id: 18, name: '冥王',          emoji: '☠️', hp: 4500, atk: 280, minLv: 5, desc: '冥界を統べる者！SSレア級の力が必要！', bg: 'from-purple-950 via-fuchsia-950 to-black' },
  { id: 19, name: '破壊神',        emoji: '💥', hp: 5500, atk: 320, minLv: 5, desc: '全てを無に帰す存在！超難関！', bg: 'from-rose-950 via-red-950 to-black' },
  { id: 20, name: '宇宙の真理',    emoji: '🌌', hp: 7000, atk: 400, minLv: 5, desc: '究極の試練！完全装備で挑め！', bg: 'from-indigo-950 via-black to-black' },
];

// ----------------------------------------------------------------
// XP / レベル計算
// ----------------------------------------------------------------
const _XP_THRESHOLDS = [50,100,160,240,340,460,600,760,940,1080,900,1100,1320,1560,1830,2120,2440,2790,3200];
const _XP_CUMULATIVE = _XP_THRESHOLDS.reduce((acc, v, i) => { acc.push((acc[i-1]||0)+v); return acc; }, []);
const _getLevelFromXp = (xp = 0) => {
  for (let i = 0; i < _XP_CUMULATIVE.length; i++) { if (xp < _XP_CUMULATIVE[i]) return i + 1; }
  return 20;
};
const getCharInfo = (xp = 0) => {
  const level = _getLevelFromXp(xp);
  if (level >= 20) return { imageUrl: '/characters/lv5.png', name: 'プログラミングマスター' };
  if (level >= 15) return { imageUrl: '/characters/lv4.png', name: 'つよつよプログラマー' };
  if (level >= 10) return { imageUrl: '/characters/lv3.png', name: 'ゆうかんなチャレンジャー' };
  if (level >= 5)  return { imageUrl: '/characters/lv2.png', name: 'げんきなチャレンジャー' };
  return { imageUrl: '/characters/lv1.png', name: 'はじまりのルーキー' };
};
const getPlayerLevel = (xp = 0) => {
  const l = _getLevelFromXp(xp);
  if (l >= 15) return 5;
  if (l >= 10) return 4;
  if (l >= 5)  return 3;
  if (l >= 3)  return 2;
  return 1;
};

// ----------------------------------------------------------------
// ローマ字複数表記の対応テーブル
// ----------------------------------------------------------------
// 各エントリは [標準形, 代替形1, 代替形2, ...] の形式
// 置換はペアで双方向に行われる
const ROMAJI_ALTS = [
  // し行
  ['shi', 'si'],
  ['sha', 'sya'],
  ['shu', 'syu'],
  ['sho', 'syo'],
  // ち行 (chi / ti / ci すべて有効)
  ['chi', 'ti'],
  ['chi', 'ci'],
  ['cha', 'tya'],
  ['cha', 'cya'],
  ['chu', 'tyu'],
  ['chu', 'cyu'],
  ['cho', 'tyo'],
  ['cho', 'cyo'],
  // つ (tsu / tu)
  ['tsu', 'tu'],
  // ふ (fu / hu)
  ['fu', 'hu'],
  // じ行 (ji / zi)
  ['ji', 'zi'],
  ['ja', 'zya'],
  ['ja', 'jya'],
  ['jo', 'zyo'],
  ['jo', 'jyo'],
  ['ju', 'zyu'],
  ['ju', 'jyu'],
  // にゃ行
  ['nya', 'nya'],
  // ひゃ行
  ['hya', 'hya'],
  // みゃ行
  ['mya', 'mya'],
  // りゃ行
  ['rya', 'rya'],
];

/**
 * 標準ローマ字から打ち込み可能な全バリエーションを生成する
 * 例: "jitensha" → ["jitensha","jitensya","zitensha","zitensya"]
 */
const getAllValidRomaji = (canonical) => {
  let results = new Set([canonical]);
  for (const [a, b] of ROMAJI_ALTS) {
    if (a === b) continue;
    const next = new Set(results);
    for (const s of results) {
      if (s.includes(a)) next.add(s.split(a).join(b));
      if (s.includes(b)) next.add(s.split(b).join(a));
    }
    results = next;
  }
  return [...results];
};

/**
 * 現在の入力に対して、最も一致しているローマ字形式を返す
 * typed: 入力済み文字 (緑), remaining: 残り (グレー), wrong: ミス
 */
const getRomajiDisplay = (word, rawInput) => {
  if (!word) return { typed: '', remaining: '', wrong: false };
  const validForms = getAllValidRomaji(word.romaji);
  const input = rawInput.toLowerCase();
  const activeForm = validForms.find(f => f.startsWith(input)) ?? validForms[0];
  const wrong = input.length > 0 && !validForms.some(f => f.startsWith(input));
  return {
    typed: wrong ? input : activeForm.slice(0, input.length),
    remaining: wrong ? activeForm : activeForm.slice(input.length),
    wrong,
  };
};

// ----------------------------------------------------------------
// 定数
// ----------------------------------------------------------------
const ENEMY_ATTACK_INTERVAL_MS = 3500;
const PLAYER_STATS = {
  1: { maxHp: 80,  atk: 8  },
  2: { maxHp: 120, atk: 14 },
  3: { maxHp: 170, atk: 22 },
  4: { maxHp: 240, atk: 32 },
  5: { maxHp: 350, atk: 50 },
};

// ----------------------------------------------------------------
// メインコンポーネント
// ----------------------------------------------------------------
const TypingGame = ({
  studentId,
  studentXp = 0,
  completedCount,
  totalMaterials,
  customStats = { hp: 0, atk: 0, def: 0 },
  equipped = { weapon: null, armor: null, accessory: null },
  onGameClear
}) => {
  const playerLevel = getPlayerLevel(studentXp);
  const charInfo = getCharInfo(studentXp);
  const base = PLAYER_STATS[playerLevel];

  const totalCustomStats = React.useMemo(() => {
    let hp = customStats.hp || 0, atk = customStats.atk || 0, def = customStats.def || 0;
    ['weapon', 'armor', 'accessory'].forEach(type => {
      if (equipped[type]) {
        const item = GACHA_ITEMS.find(i => i.id === equipped[type]);
        if (item) { hp += item.stats.hp || 0; atk += item.stats.atk || 0; def += item.stats.def || 0; }
      }
    });
    return { hp, atk, def };
  }, [customStats, equipped]);

  const maxHp    = base.maxHp + totalCustomStats.hp;
  const playerAtk = base.atk  + totalCustomStats.atk;
  const playerDef = totalCustomStats.def;

  // --- State ---
  const [screen, setScreen] = useState('select');  // 'select' | 'battle' | 'win' | 'lose'
  const [clearedStages, setClearedStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);
  const [playerHp, setPlayerHp] = useState(maxHp);
  const [enemyHp, setEnemyHp] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [battleLog, setBattleLog] = useState([]);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [missFlash, setMissFlash] = useState(false);

  const inputRef = useRef(null);
  const enemyTimerRef = useRef(null);
  const logRef = useRef(null);

  // Firestore から クリア済みステージ を読み込む
  useEffect(() => {
    const loadData = async () => {
      try {
        const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId));
        if (snap.exists()) setClearedStages(snap.data().clearedStages || []);
      } catch (e) { console.error(e); }
    };
    if (studentId) loadData();
  }, [studentId]);

  const addLog = useCallback((msg, type = 'normal') => {
    setBattleLog(prev => [...prev.slice(-10), { msg, type, id: Date.now() + Math.random() }]);
  }, []);

  const pickNewWord = useCallback(() => {
    setCurrentWord(WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)]);
    setInputValue('');
    setMissFlash(false);
  }, []);

  const saveClearedStage = async (stageId) => {
    try {
      const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId));
      const existing = snap.data()?.clearedStages || [];
      const isNewClear = !existing.includes(stageId);
      const updated = Array.from(new Set([...existing, stageId]));
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId), { clearedStages: updated });
      setClearedStages(updated);
      if (isNewClear && onGameClear) await onGameClear();
    } catch (e) { console.error(e); }
  };

  const startBattle = (stage) => {
    setSelectedStage(stage);
    setPlayerHp(maxHp);
    setEnemyHp(stage.hp);
    setScreen('battle');
    setBattleLog([{ msg: `⚔️ ${stage.name}があらわれた！`, type: 'system', id: Date.now() }]);
    pickNewWord();
  };

  // 敵の攻撃タイマー
  useEffect(() => {
    if (screen !== 'battle') { clearInterval(enemyTimerRef.current); return; }
    enemyTimerRef.current = setInterval(() => {
      setPlayerHp(prev => {
        const dmg = Math.max(1, selectedStage.atk - playerDef);
        const next = prev - dmg;
        if (next <= 0) { clearInterval(enemyTimerRef.current); setScreen('lose'); return 0; }
        setShakePlayer(true);
        playSound('damage');
        setTimeout(() => setShakePlayer(false), 400);
        addLog(`💥 ${selectedStage.name}のこうげき！ -${dmg}ダメージ${playerDef > 0 ? ` (防御-${playerDef})` : ''}`, 'enemy');
        return next;
      });
    }, ENEMY_ATTACK_INTERVAL_MS);
    return () => clearInterval(enemyTimerRef.current);
  }, [screen, selectedStage, addLog, playerDef]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battleLog]);

  useEffect(() => {
    if (screen === 'battle' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [screen, currentWord]);

  // --- 入力ハンドラ (1文字ずつリアルタイム判定) ---
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
      return;
    }
    // 1文字追加後の状態を先読みしてリアルタイムフィードバック
  };

  const handleInput = (e) => {
    const val = e.target.value;
    setInputValue(val);

    if (!currentWord || !val) { setMissFlash(false); return; }
    const lower = val.toLowerCase();
    const validForms = getAllValidRomaji(currentWord.romaji);
    const isPrefix = validForms.some(f => f.startsWith(lower));
    if (!isPrefix) {
      setMissFlash(true);
      playSound('miss');
    } else {
      setMissFlash(false);
      // 完全一致 → 自動確定
      if (validForms.includes(lower)) {
        handleSubmitWord(lower);
      }
    }
  };

  const handleSubmitWord = (typed) => {
    const dmg = playerAtk + Math.floor(Math.random() * 5);
    setEnemyHp(prev => {
      const next = prev - dmg;
      if (next <= 0) {
        clearInterval(enemyTimerRef.current);
        setTimeout(async () => {
          playSound('win');
          await saveClearedStage(selectedStage.id);
          setScreen('win');
        }, 300);
        return 0;
      }
      return next;
    });
    setShakeEnemy(true);
    playSound('hit');
    setTimeout(() => setShakeEnemy(false), 400);
    addLog(`⚡ 「${currentWord.kana}」せいかい！ -${dmg}ダメージ！`, 'player');
    pickNewWord();
  };

  const handleSubmit = () => {
    if (!currentWord || !inputValue.trim()) return;
    const typed = inputValue.trim().toLowerCase();
    const validForms = getAllValidRomaji(currentWord.romaji);
    if (validForms.includes(typed)) {
      handleSubmitWord(typed);
    } else {
      setMissFlash(true);
      playSound('miss');
    }
  };

  // ----------------------------------------------------------------
  // HP バー
  // ----------------------------------------------------------------
  const HpBar = ({ current, max, color }) => {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    const col = pct > 50 ? color : pct > 25 ? 'bg-yellow-400' : 'bg-rose-500';
    return (
      <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden">
        <div className={`h-3 rounded-full transition-all duration-300 ${col}`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  // ================================================================
  // SCREEN: STAGE SELECT
  // ================================================================
  if (screen === 'select') {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* プレイヤーカード (コンパクト) */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-4 flex items-center gap-4 text-white shadow-xl">
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
            <img src={charInfo.imageUrl} alt={charInfo.name} className="w-full h-full object-contain p-1" onError={e => { e.target.style.display='none'; }} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">あなたのキャラクター</p>
            <h3 className="text-base font-black truncate">{charInfo.name}</h3>
            <div className="flex gap-3 mt-1 text-xs font-black flex-wrap">
              <span className="text-rose-300">❤️ HP:{maxHp}</span>
              <span className="text-amber-300">⚡ ATK:{playerAtk}</span>
              <span className="text-sky-300">🛡️ DEF:{playerDef}</span>
              <span className="text-slate-300">Lv.{_getLevelFromXp(studentXp)}</span>
            </div>
          </div>
        </div>

        <p className="text-sm font-black text-slate-600">ステージをえらぼう！</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[55vh] overflow-y-auto pr-1">
          {STAGES.map(stage => {
            const isCleared = clearedStages.includes(stage.id);
            const isLocked  = stage.minLv > playerLevel;
            return (
              <button
                key={stage.id}
                onClick={() => !isLocked && startBattle(stage)}
                disabled={isLocked}
                className={`relative text-left p-4 rounded-2xl border-2 transition-all duration-200 ${
                  isLocked  ? 'border-slate-100 bg-slate-50 opacity-40 cursor-not-allowed'
                  : isCleared ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:shadow-md'
                              : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {isCleared && (
                  <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                    <Trophy size={8} /> クリア
                  </span>
                )}
                {isLocked && (
                  <span className="absolute top-2 right-2 bg-slate-400 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                    🔒 Lv.{stage.minLv}~
                  </span>
                )}
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">{stage.emoji}</span>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stage {stage.id}</p>
                    <h4 className="font-black text-slate-800 text-sm leading-tight">{stage.name}</h4>
                  </div>
                </div>
                <p className="text-[10px] text-slate-500 font-medium mb-2 line-clamp-1">{stage.desc}</p>
                <div className="flex gap-3 text-[9px] font-black uppercase tracking-wider">
                  <span className="text-rose-500 flex items-center gap-0.5"><Heart size={9} /> {stage.hp}</span>
                  <span className="text-orange-500 flex items-center gap-0.5"><Zap size={9} /> {stage.atk}</span>
                </div>
              </button>
            );
          })}
        </div>

        {playerLevel < 5 && (
          <p className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
            🎯 XPをためてレベルアップすれば、つよいてきにもチャレンジできるよ！
          </p>
        )}
      </div>
    );
  }

  // ================================================================
  // SCREEN: BATTLE
  // ================================================================
  if (screen === 'battle' && selectedStage) {
    const rd = getRomajiDisplay(currentWord, inputValue);
    const hpPct = Math.round((playerHp / maxHp) * 100);
    const ePct  = Math.round((Math.max(0, enemyHp) / selectedStage.hp) * 100);

    return (
      <div className={`rounded-2xl overflow-hidden bg-gradient-to-br ${selectedStage.bg} shadow-2xl flex flex-col`}
           style={{ minHeight: '60vh' }}>
        {/* グリッドテクスチャ */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 24px,rgba(255,255,255,.5) 24px,rgba(255,255,255,.5) 25px),repeating-linear-gradient(90deg,transparent,transparent 24px,rgba(255,255,255,.5) 24px,rgba(255,255,255,.5) 25px)' }} />

        {/* ヘッダー */}
        <div className="flex items-center gap-2 px-4 pt-3 pb-2">
          <button
            onClick={() => { if (window.confirm('バトルをやめますか？')) { clearInterval(enemyTimerRef.current); setScreen('select'); } }}
            className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-white transition-colors"
          ><X size={14} /></button>
          <p className="font-black text-white text-sm drop-shadow">⚔️ Stage {selectedStage.id}: {selectedStage.name}</p>
        </div>

        {/* 戦闘フィールド */}
        <div className="grid grid-cols-2 gap-3 px-4 pb-3">
          {/* プレイヤー */}
          <div className={`bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-3 text-center transition-all ${shakePlayer ? 'animate-shake' : ''}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">あなた</p>
            <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center">
              <img src={charInfo.imageUrl} alt="" className="w-full h-full object-contain drop-shadow-md" onError={e => { e.target.style.display='none'; }} />
            </div>
            <p className="text-[10px] font-black text-white mb-1.5">{playerHp}/{maxHp} HP</p>
            <HpBar current={playerHp} max={maxHp} color="bg-sky-400" />
            <div className="mt-1 h-1.5 rounded-full bg-black/20 overflow-hidden">
              <div className="h-full bg-sky-400 rounded-full transition-all duration-300" style={{ width: `${hpPct}%` }} />
            </div>
          </div>

          {/* 敵 */}
          <div className={`bg-black/25 backdrop-blur-sm rounded-2xl border border-white/10 p-3 text-center transition-all ${shakeEnemy ? 'animate-shake' : ''}`}>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/60 mb-1">てき</p>
            <div className="w-12 h-12 mx-auto mb-1 flex items-center justify-center text-4xl drop-shadow-md">{selectedStage.emoji}</div>
            <p className="text-[10px] font-black text-white mb-1.5">{Math.max(0, enemyHp)}/{selectedStage.hp} HP</p>
            <div className="h-1.5 rounded-full bg-black/30 overflow-hidden">
              <div className="h-full bg-rose-400 rounded-full transition-all duration-300" style={{ width: `${ePct}%` }} />
            </div>
          </div>
        </div>

        {/* 単語表示エリア */}
        <div className="mx-4 mb-3 bg-black/40 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/10 flex-1 flex flex-col items-center justify-center">
          <p className="text-white/50 text-[9px] font-black uppercase tracking-widest mb-2">つぎの単語をタイピング！</p>
          {currentWord && (
            <>
              <p className="text-white text-3xl font-black mb-2 tracking-widest">{currentWord.kana}</p>
              {/* リアルタイムローマ字カラー表示 */}
              <div className="font-mono text-xl font-black tracking-widest select-none">
                {rd.wrong ? (
                  <>
                    <span className="text-rose-400">{rd.typed}</span>
                    <span className="text-white/30">{rd.remaining}</span>
                  </>
                ) : (
                  <>
                    <span className="text-emerald-400">{rd.typed}</span>
                    <span className="text-white/40">{rd.remaining}</span>
                  </>
                )}
              </div>
              {rd.wrong && (
                <p className="text-rose-300 text-[10px] font-bold mt-1 animate-pulse">まちがい！Enterでクリア</p>
              )}
            </>
          )}
        </div>

        {/* 入力フォーム */}
        <div className="px-4 pb-2 flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="ローマ字でうちこもう！"
            className={`flex-1 rounded-xl px-4 py-3 text-base font-bold border-2 outline-none transition-all ${
              rd.wrong
                ? 'border-rose-400 bg-rose-50 text-rose-700'
                : 'border-orange-300 bg-white focus:border-orange-500'
            }`}
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="bg-orange-500 text-white font-black px-4 rounded-xl hover:bg-orange-600 transition-colors shadow-md active:scale-95 text-sm"
          >Enter</button>
        </div>

        {/* バトルログ (コンパクト 3行) */}
        <div ref={logRef} className="mx-4 mb-3 bg-black/30 rounded-xl px-3 py-2 h-16 overflow-y-auto space-y-0.5">
          {battleLog.slice(-4).map(log => (
            <p key={log.id} className={`text-[10px] font-bold ${log.type === 'player' ? 'text-orange-300' : log.type === 'enemy' ? 'text-rose-300' : 'text-white/50'}`}>
              {log.msg}
            </p>
          ))}
        </div>
      </div>
    );
  }

  // ================================================================
  // SCREEN: WIN / LOSE
  // ================================================================
  if (screen === 'win') {
    const nextStage = STAGES.find(s => s.id === selectedStage.id + 1);
    return (
      <div className="text-center py-10 space-y-5 animate-in zoom-in-95 duration-500">
        <div className="text-5xl">🎉</div>
        <h2 className="text-2xl font-black text-emerald-600">ステージクリア！</h2>
        <p className="text-slate-600 font-bold text-sm">「{selectedStage.name}」をたおした！</p>
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => setScreen('select')} className="bg-slate-100 text-slate-700 font-black px-5 py-2.5 rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2 text-sm">
            <Shield size={14} /> ステージいちらんへ
          </button>
          {nextStage && nextStage.minLv <= playerLevel && (
            <button onClick={() => startBattle(nextStage)} className="bg-orange-500 text-white font-black px-5 py-2.5 rounded-xl hover:bg-orange-600 transition-colors shadow-md flex items-center gap-2 text-sm">
              つぎのステージへ <ChevronRight size={14} />
            </button>
          )}
          {nextStage && nextStage.minLv > playerLevel && (
            <p className="bg-amber-100 text-amber-700 font-bold text-xs px-4 py-2.5 rounded-xl">
              🔒 つぎはLv.{nextStage.minLv}～
            </p>
          )}
          {!nextStage && (
            <p className="bg-amber-100 text-amber-700 font-bold text-sm px-4 py-2.5 rounded-xl">
              👑 ぜんぶクリア！さいきょうだ！+20XP！
            </p>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'lose') {
    return (
      <div className="text-center py-10 space-y-5 animate-in zoom-in-95 duration-500">
        <div className="text-5xl">💀</div>
        <h2 className="text-2xl font-black text-rose-600">やられた…</h2>
        <p className="text-slate-600 font-bold text-sm">「{selectedStage.name}」にたおされた！</p>
        {playerLevel < 5 && (
          <p className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs font-bold text-amber-700">
            💡 XPをためてレベルアップすれば、もっとつよくなれるよ！
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-3">
          <button onClick={() => setScreen('select')} className="bg-slate-100 text-slate-700 font-black px-5 py-2.5 rounded-xl hover:bg-slate-200 flex items-center gap-2 text-sm">
            <Shield size={14} /> ステージいちらんへ
          </button>
          <button onClick={() => startBattle(selectedStage)} className="bg-rose-500 text-white font-black px-5 py-2.5 rounded-xl hover:bg-rose-600 shadow-md flex items-center gap-2 text-sm">
            <RotateCcw size={14} /> もういちどちょうせん
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TypingGame;
