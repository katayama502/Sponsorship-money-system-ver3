import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db, appId } from '../firebase.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Swords, Heart, Zap, Trophy, RotateCcw, ChevronRight, Shield, X } from 'lucide-react';
import { GACHA_ITEMS } from '../data/items.js';

// --- 100+ Japanese word list (hiragana + romaji) ---
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
  { kana: 'へびー', romaji: 'hebi' }, { kana: 'くじら', romaji: 'kujira' },
  { kana: 'いるか', romaji: 'iruka' }, { kana: 'たこ', romaji: 'tako' },
  { kana: 'えび', romaji: 'ebi' }, { kana: 'かに', romaji: 'kani' },
  { kana: 'すいか', romaji: 'suika' }, { kana: 'ばなな', romaji: 'banana' },
  { kana: 'みかん', romaji: 'mikan' }, { kana: 'いちご', romaji: 'ichigo' },
  { kana: 'ぶどう', romaji: 'budou' }, { kana: 'もも', romaji: 'momo' },
  { kana: 'なし', romaji: 'nashi' }, { kana: 'かき', romaji: 'kaki' },
  { kana: 'さくら', romaji: 'sakura' }, { kana: 'たんぽぽ', romaji: 'tanpopo' },
  { kana: 'ひまわり', romaji: 'himawari' }, { kana: 'つばき', romaji: 'tsubaki' },
  { kana: 'あさがお', romaji: 'asagao' }, { kana: 'ゆりー', romaji: 'yuri' },
  { kana: 'しんかんせん', romaji: 'shinkansen' }, { kana: 'ひこうき', romaji: 'hikouki' },
  { kana: 'ふね', romaji: 'fune' }, { kana: 'じてんしゃ', romaji: 'jitensha' },
  { kana: 'ばす', romaji: 'basu' }, { kana: 'たくしー', romaji: 'takushi' },
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
  { kana: 'しんごう', romaji: 'shingou' }, { kana: 'こうばん', romaji: 'kouban' },
  { kana: 'びょういん', romaji: 'byouin' }, { kana: 'としょかん', romaji: 'toshokan' },
  { kana: 'スーパー', romaji: 'suupaa' }, { kana: 'でぱーと', romaji: 'depaato' },
  { kana: 'コンビニ', romaji: 'konbini' }, { kana: 'ゆうびんきょく', romaji: 'yuubinkyoku' },
  { kana: 'けいさつ', romaji: 'keisatsu' }, { kana: 'しょうぼうしょ', romaji: 'shoubousho' },
  { kana: 'まほう', romaji: 'mahou' }, { kana: 'ゆうしゃ', romaji: 'yuusha' },
  { kana: 'まじゅつし', romaji: 'majutsushi' }, { kana: 'ぼうけん', romaji: 'bouken' },
  { kana: 'ドラゴン', romaji: 'doragon' }, { kana: 'きし', romaji: 'kishi' },
  { kana: 'まおう', romaji: 'maou' }, { kana: 'ひみつ', romaji: 'himitsu' },
  { kana: 'でんせつ', romaji: 'densetsu' }, { kana: 'ちから', romaji: 'chikara' },
  { kana: 'ゆうき', romaji: 'yuuki' }, { kana: 'きぼう', romaji: 'kibou' },
  { kana: 'とびら', romaji: 'tobira' }, { kana: 'たから', romaji: 'takara' },
  { kana: 'けんきゅう', romaji: 'kenkyuu' }, { kana: 'はっけん', romaji: 'hakken' },
  { kana: 'しんか', romaji: 'shinka' }, { kana: 'ぷろぐらみんぐ', romaji: 'puroguramingu' },
  { kana: 'コンピューター', romaji: 'konpyuutaa' }, { kana: 'ロボット', romaji: 'robotto' },
  { kana: 'きかい', romaji: 'kikai' }, { kana: 'でんき', romaji: 'denki' },
  { kana: 'カメラ', romaji: 'kamera' }, { kana: 'けいたいでんわ', romaji: 'keitaidenwa' },
];

// --- Sound Effects using Web Audio API ---
const audioCtx = typeof window !== 'undefined' ? new (window.AudioContext || window.webkitAudioContext)() : null;

const playSound = (type) => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  
  const osc = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();
  
  osc.connect(gainNode);
  gainNode.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  
  if (type === 'hit') {
    // Enemy hit (Player attacks) - High pitched short beep
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    gainNode.gain.setValueAtTime(0.1, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
  } else if (type === 'damage') {
    // Player damaged - Low pitched noise/thud
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.2);
    gainNode.gain.setValueAtTime(0.2, now);
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
    osc.start(now);
    osc.stop(now + 0.2);
  } else if (type === 'win') {
    // Win fanfare - Triumphant arpeggio
    osc.type = 'triangle';
    gainNode.gain.setValueAtTime(0.1, now);
    
    osc.frequency.setValueAtTime(440, now); // A4
    osc.frequency.setValueAtTime(554.37, now + 0.1); // C#5
    osc.frequency.setValueAtTime(659.25, now + 0.2); // E5
    osc.frequency.setValueAtTime(880, now + 0.3); // A5
    
    gainNode.gain.linearRampToValueAtTime(0, now + 0.6);
    osc.start(now);
    osc.stop(now + 0.6);
  }
};

// --- Stage definitions ---
const STAGES = [
  { id: 1, name: 'スライム',     emoji: '🟢', hp: 30,  atk: 3,  minLv: 1, desc: 'よわよわのスライム。ウォームアップにどうぞ！',
    bg: 'from-emerald-400 via-green-500 to-teal-600' },
  { id: 2, name: 'コウモリ',    emoji: '🦇', hp: 60,  atk: 6,  minLv: 1, desc: 'すばやく飛び回るコウモリだ！',
    bg: 'from-slate-700 via-slate-800 to-slate-900' },
  { id: 3, name: 'ゴブリン',    emoji: '👺', hp: 100, atk: 10, minLv: 1, desc: 'いたずら好きのゴブリンが現れた！',
    bg: 'from-lime-600 via-green-700 to-emerald-800' },
  { id: 4, name: 'オーク',      emoji: '👹', hp: 150, atk: 16, minLv: 2, desc: 'でかくて強いオーク！Lv2以上推奨。',
    bg: 'from-orange-700 via-red-800 to-stone-900' },
  { id: 5, name: 'スケルトン',  emoji: '💀', hp: 220, atk: 24, minLv: 2, desc: 'ガシャガシャうごくスケルトン！',
    bg: 'from-gray-800 via-zinc-900 to-black' },
  { id: 6, name: 'ウィッチ',    emoji: '🧙', hp: 300, atk: 33, minLv: 3, desc: '強力な呪文を使うウィッチ。Lv3以上推奨！',
    bg: 'from-purple-800 via-violet-900 to-indigo-950' },
  { id: 7, name: 'ドラゴン',    emoji: '🐉', hp: 400, atk: 44, minLv: 3, desc: '炎をはくドラゴン！かなり強い！',
    bg: 'from-rose-700 via-red-800 to-orange-900' },
  { id: 8, name: 'ダークナイト', emoji: '🛡️', hp: 520, atk: 57, minLv: 4, desc: '暗黒騎士が立ちはだかる！Lv4以上推奨。',
    bg: 'from-slate-900 via-zinc-900 to-neutral-900' },
  { id: 9, name: 'デーモン',    emoji: '😈', hp: 680, atk: 72, minLv: 4, desc: '地獄から来た悪魔！Lv5でないと勝てないかも…',
    bg: 'from-red-950 via-rose-900 to-orange-950' },
  { id: 10, name: 'ラスボス',   emoji: '👑', hp: 900, atk: 90, minLv: 5, desc: '伝説の魔王！最強のキャラクターで挑め！',
    bg: 'from-yellow-900 via-amber-950 to-stone-950' },
  { id: 11, name: 'キメラ',       emoji: '🦁', hp: 1200, atk: 110, minLv: 5, desc: 'ガチャで装備を整えないと苦戦するぞ！',
    bg: 'from-fuchsia-900 via-purple-950 to-black' },
  { id: 12, name: 'ゴーレム',     emoji: '🗿', hp: 1600, atk: 130, minLv: 5, desc: '岩のように硬い！HPが多いぞ！',
    bg: 'from-stone-700 via-stone-800 to-stone-950' },
  { id: 13, name: 'ヴァンパイア', emoji: '🧛', hp: 2000, atk: 150, minLv: 5, desc: '夜の支配者！強力な防具が必要だ！',
    bg: 'from-red-900 via-rose-950 to-black' },
  { id: 14, name: 'デスナイト',   emoji: '⚔️', hp: 2400, atk: 170, minLv: 5, desc: '死すら超えた騎士！Sレア以上推奨！',
    bg: 'from-slate-800 via-slate-900 to-black' },
  { id: 15, name: 'ベヒモス',     emoji: '🦏', hp: 2800, atk: 200, minLv: 5, desc: '大地を揺るがす巨獣！',
    bg: 'from-orange-900 via-amber-900 to-black' },
  { id: 16, name: 'リヴァイアサン', emoji: '🌊', hp: 3200, atk: 220, minLv: 5, desc: '海の神獣！凄まじい攻撃力！',
    bg: 'from-blue-900 via-cyan-950 to-black' },
  { id: 17, name: '古の邪竜',     emoji: '🐲', hp: 3800, atk: 250, minLv: 5, desc: '封印されし竜が目覚めた！',
    bg: 'from-emerald-950 via-teal-950 to-black' },
  { id: 18, name: '冥王',         emoji: '☠️', hp: 4500, atk: 280, minLv: 5, desc: '冥界を統べる者！SSレア級の力が必要！',
    bg: 'from-purple-950 via-fuchsia-950 to-black' },
  { id: 19, name: '破壊神',       emoji: '💥', hp: 5500, atk: 320, minLv: 5, desc: '全てを無に帰す存在！超難関！',
    bg: 'from-rose-950 via-red-950 to-black' },
  { id: 20, name: '宇宙の真理',   emoji: '🌌', hp: 7000, atk: 400, minLv: 5, desc: '究極の試練！完全装備で挑め！',
    bg: 'from-indigo-950 via-black to-black border border-indigo-500/30' },
];

// --- 20レベル XPシステム（App.jsxと同じロジック）
const _XP_THRESHOLDS = [50,100,160,240,340,460,600,760,940,1080,900,1100,1320,1560,1830,2120,2440,2790,3200];
const _XP_CUMULATIVE = _XP_THRESHOLDS.reduce((acc, v, i) => { acc.push((acc[i-1]||0)+v); return acc; }, []);
const _getLevelFromXp = (xp = 0) => {
  for (let i = 0; i < _XP_CUMULATIVE.length; i++) { if (xp < _XP_CUMULATIVE[i]) return i + 1; }
  return 20;
};
const getLevelCharacter = (xp = 0) => {
  const level = _getLevelFromXp(xp);
  if (level >= 20) return { imageUrl: '/characters/lv5.png', name: 'プログラミングマスター' };
  if (level >= 15) return { imageUrl: '/characters/lv4.png', name: 'つよつよプログラマー' };
  if (level >= 10) return { imageUrl: '/characters/lv3.png', name: 'ゆうかんなチャレンジャー' };
  if (level >= 5)  return { imageUrl: '/characters/lv2.png', name: 'げんきなチャレンジャー' };
  return { imageUrl: '/characters/lv1.png', name: 'はじまりのルーキー' };
};

// ゲーム内プレイヤーレベル（1–5にマッピング）
const getPlayerLevel = (xp = 0) => {
  const level = _getLevelFromXp(xp);
  if (level >= 15) return 5;
  if (level >= 10) return 4;
  if (level >= 5)  return 3;
  if (level >= 3)  return 2;
  return 1;
};

const ENEMY_ATTACK_INTERVAL_MS = 3500; // Enemy attacks every 3.5 seconds

// --- Player stats mapping by game level (1-5 mapped from XP level) ---
const PLAYER_STATS = {
  1: { maxHp: 80,  atk: 8  },
  2: { maxHp: 120, atk: 14 },
  3: { maxHp: 170, atk: 22 },
  4: { maxHp: 240, atk: 32 },
  5: { maxHp: 350, atk: 50 },
};

const TypingGame = ({ studentId, studentXp = 0, completedCount, totalMaterials, customStats = { hp: 0, atk: 0, def: 0 }, equipped = { weapon: null, armor: null, accessory: null }, onGameClear }) => {
  const playerLevel = getPlayerLevel(studentXp);
  const charInfo = getLevelCharacter(studentXp);
  const base = PLAYER_STATS[playerLevel];

  const totalCustomStats = React.useMemo(() => {
    let hp = customStats.hp || 0;
    let atk = customStats.atk || 0;
    let def = customStats.def || 0;
    ['weapon', 'armor', 'accessory'].forEach(type => {
      if (equipped[type]) {
        const item = GACHA_ITEMS.find(i => i.id === equipped[type]);
        if (item) {
          hp += item.stats.hp || 0;
          atk += item.stats.atk || 0;
          def += item.stats.def || 0;
        }
      }
    });
    return { hp, atk, def };
  }, [customStats, equipped]);

  const maxHp = base.maxHp + totalCustomStats.hp;
  const playerAtk = base.atk + totalCustomStats.atk;
  const playerDef = totalCustomStats.def;

  // --- Game Screens: 'select' | 'battle' | 'win' | 'lose' ---
  const [screen, setScreen] = useState('select');
  const [clearedStages, setClearedStages] = useState([]);
  const [selectedStage, setSelectedStage] = useState(null);

  // --- Battle state ---
  const [playerHp, setPlayerHp] = useState(maxHp);
  const [enemyHp, setEnemyHp] = useState(0);
  const [currentWord, setCurrentWord] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [battleLog, setBattleLog] = useState([]);
  const [shakePlayer, setShakePlayer] = useState(false);
  const [shakeEnemy, setShakeEnemy] = useState(false);
  const [isWrongInput, setIsWrongInput] = useState(false);

  const inputRef = useRef(null);
  const enemyTimerRef = useRef(null);
  const logRef = useRef(null);

  // Load cleared stages from Firestore
  useEffect(() => {
    const loadData = async () => {
      try {
        const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId));
        if (snap.exists()) {
          setClearedStages(snap.data().clearedStages || []);
        }
      } catch (e) { console.error(e); }
    };
    if (studentId) loadData();
  }, [studentId]);

  const addLog = useCallback((msg, type = 'normal') => {
    setBattleLog(prev => [...prev.slice(-20), { msg, type, id: Date.now() + Math.random() }]);
  }, []);

  const pickNewWord = useCallback(() => {
    const w = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setCurrentWord(w);
    setInputValue('');
    setIsWrongInput(false);
  }, []);

  const saveClearedStage = async (stageId) => {
    try {
      const snap = await getDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId));
      const existing = snap.data()?.clearedStages || [];
      const isNewClear = !existing.includes(stageId);
      const updated = Array.from(new Set([...existing, stageId]));
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId), { clearedStages: updated });
      setClearedStages(updated);
      // 新規クリアのみXP付与
      if (isNewClear && onGameClear) await onGameClear();
    } catch (e) { console.error(e); }
  };

  // Start a battle
  const startBattle = (stage) => {
    setSelectedStage(stage);
    setPlayerHp(maxHp);
    setEnemyHp(stage.hp);
    setScreen('battle');
    setBattleLog([{ msg: `⚔️ ${stage.name}があらわれた！`, type: 'system', id: Date.now() }]);
    pickNewWord();
  };

  // Enemy attack timer
  useEffect(() => {
    if (screen !== 'battle') {
      clearInterval(enemyTimerRef.current);
      return;
    }
    enemyTimerRef.current = setInterval(() => {
      setPlayerHp(prev => {
        const dmg = Math.max(1, selectedStage.atk - playerDef);
        const next = prev - dmg;
        if (next <= 0) {
          clearInterval(enemyTimerRef.current);
          setScreen('lose');
          return 0;
        }
        setShakePlayer(true);
        playSound('damage');
        setTimeout(() => setShakePlayer(false), 400);
        addLog(`💥 ${selectedStage.name}の攻撃！ -${dmg}ダメージ${playerDef > 0 ? ` (防御${playerDef}軽減)` : ''}`, 'enemy');
        return next;
      });
    }, ENEMY_ATTACK_INTERVAL_MS);
    return () => clearInterval(enemyTimerRef.current);
  }, [screen, selectedStage, addLog]);

  // Auto-scroll battle log
  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [battleLog]);

  // Focus input
  useEffect(() => {
    if (screen === 'battle' && inputRef.current) inputRef.current.focus();
  }, [screen, currentWord]);

  const handleInput = (e) => {
    const val = e.target.value;
    setInputValue(val);
    if (currentWord && !currentWord.romaji.startsWith(val.toLowerCase())) {
      setIsWrongInput(true);
    } else {
      setIsWrongInput(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!currentWord) return;
    if (inputValue.trim().toLowerCase() === currentWord.romaji) {
      // Correct!
      const dmg = playerAtk + Math.floor(Math.random() * 5);
      setEnemyHp(prev => {
        const next = prev - dmg;
        if (next <= 0) {
          clearInterval(enemyTimerRef.current);
          setTimeout(async () => {
            playSound('win');
            await saveClearedStage(selectedStage.id);
            setScreen('win');
          }, 400);
          return 0;
        }
        return next;
      });
      setShakeEnemy(true);
      playSound('hit');
      setTimeout(() => setShakeEnemy(false), 400);
      addLog(`⚡ 「${currentWord.kana}」せいかい！ -${dmg}ダメージ！`, 'player');
      pickNewWord();
    } else {
      setIsWrongInput(true);
    }
  };

  const HpBar = ({ current, max, color }) => {
    const pct = Math.max(0, Math.min(100, (current / max) * 100));
    const barColor = pct > 50 ? color : pct > 25 ? 'bg-yellow-400' : 'bg-rose-500';
    return (
      <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
        <div className={`h-4 rounded-full transition-all duration-300 ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    );
  };

  // =========================
  // SCREEN: STAGE SELECT
  // =========================
  if (screen === 'select') {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        {/* Player card */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 flex items-center gap-6 text-white shadow-2xl">
          <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center overflow-hidden shrink-0">
            <img src={charInfo.imageUrl} alt={charInfo.name} className="w-full h-full object-contain p-1" onError={e => { e.target.style.display='none'; }} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-black uppercase tracking-widest text-slate-400 mb-1">あなたのキャラクター</p>
            <h3 className="text-xl font-black">{charInfo.name}</h3>
            <p className="text-sm text-slate-300 mt-1 font-medium">
              Lv.{_getLevelFromXp(studentXp)} | HP:{maxHp}{totalCustomStats.hp > 0 ? ` (+${totalCustomStats.hp})` : ''}
            </p>
            <div className="flex gap-4 mt-2 text-xs font-black">
              <span className="text-rose-300">❤️ HP:{maxHp}{totalCustomStats.hp > 0 ? ` (+${totalCustomStats.hp})` : ''}</span>
              <span className="text-amber-300">⚡ ATK:{playerAtk}{totalCustomStats.atk > 0 ? ` (+${totalCustomStats.atk})` : ''}</span>
              <span className="text-sky-300">🛡️ DEF:{playerDef}</span>
            </div>
          </div>
        </div>

        {/* Stage list */}
        <h3 className="text-lg font-black text-slate-800">ステージをえらぼう！</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {STAGES.map(stage => {
            const isCleared = clearedStages.includes(stage.id);
            const isLocked = stage.minLv > playerLevel;
            return (
              <button
                key={stage.id}
                onClick={() => !isLocked && startBattle(stage)}
                disabled={isLocked}
                className={`relative text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                  isLocked
                    ? 'border-slate-100 bg-slate-50 opacity-50 cursor-not-allowed'
                    : isCleared
                    ? 'border-emerald-200 bg-emerald-50 hover:border-emerald-400 hover:shadow-md'
                    : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg hover:-translate-y-0.5'
                }`}
              >
                {isCleared && (
                  <span className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Trophy size={9} /> クリア済み
                  </span>
                )}
                {isLocked && (
                  <span className="absolute top-2 right-2 bg-slate-400 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                    🔒 Lv.{stage.minLv}~
                  </span>
                )}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{stage.emoji}</span>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stage {stage.id}</p>
                    <h4 className="font-black text-slate-800 text-base">{stage.name}</h4>
                  </div>
                </div>
                <p className="text-xs text-slate-500 font-medium mb-3">{stage.desc}</p>
                <div className="flex gap-4 text-[10px] font-black uppercase tracking-wider">
                  <span className="text-rose-500 flex items-center gap-1"><Heart size={10} /> HP {stage.hp}</span>
                  <span className="text-orange-500 flex items-center gap-1"><Zap size={10} /> ATK {stage.atk}</span>
                </div>
              </button>
            );
          })}
        </div>

        {playerLevel < 5 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-bold text-amber-700">
              🎯 XPを貯めてレベルアップすれば、強い敵に挑戦できるよ！（振り返り・カリキュラム・ゲームクリアでXPGET）
            </p>
          </div>
        )}
      </div>
    );
  }

  // =========================
  // SCREEN: BATTLE
  // =========================
  if (screen === 'battle' && selectedStage) {
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* Battlefield background panel */}
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${selectedStage.bg} p-5 shadow-2xl`}>
          {/* subtle grid overlay for texture */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 30px,rgba(255,255,255,.1) 30px,rgba(255,255,255,.1) 31px),repeating-linear-gradient(90deg,transparent,transparent 30px,rgba(255,255,255,.1) 30px,rgba(255,255,255,.1) 31px)' }} />

          {/* Header */}
          <div className="relative flex items-center gap-3 mb-4">
            <button onClick={() => { clearInterval(enemyTimerRef.current); setScreen('select'); }} className="p-2 bg-white/20 hover:bg-white/30 rounded-xl text-white transition-colors backdrop-blur-sm">
              <X size={16} />
            </button>
            <h3 className="font-black text-white text-lg drop-shadow">⚔️ Stage {selectedStage.id}: {selectedStage.name}</h3>
          </div>

          {/* Combatant panels */}
          <div className="relative grid grid-cols-2 gap-3">
            {/* Player side */}
            <div className={`bg-white/10 backdrop-blur-sm rounded-2xl border border-white/30 p-4 text-center ${shakePlayer ? 'animate-shake' : ''}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">あなた</p>
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
                <img src={charInfo.imageUrl} alt={charInfo.name} className="w-full h-full object-contain drop-shadow-lg" onError={e => { e.target.style.display='none'; }} />
              </div>
              <p className="text-xs font-black text-white mb-2">Lv.{_getLevelFromXp(studentXp)} | HP {playerHp}/{maxHp}</p>
              <HpBar current={playerHp} max={maxHp} color="bg-sky-400" />
            </div>

            {/* Enemy side */}
            <div className={`bg-black/20 backdrop-blur-sm rounded-2xl border border-white/20 p-4 text-center ${shakeEnemy ? 'animate-shake' : ''}`}>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/70 mb-1">てき</p>
              <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center text-5xl filter drop-shadow-lg">
                {selectedStage.emoji}
              </div>
              <p className="text-xs font-black text-white mb-2">{selectedStage.name} HP {Math.max(0, enemyHp)}/{selectedStage.hp}</p>
              <HpBar current={enemyHp} max={selectedStage.hp} color="bg-rose-400" />
            </div>
          </div>

          {/* Word to type — inside field */}
          <div className="relative mt-4 bg-black/40 backdrop-blur-sm rounded-2xl p-5 text-center border border-white/10">
            <p className="text-white/60 text-[10px] font-bold mb-2 uppercase tracking-widest">つぎの単語をタイピング！</p>
            {currentWord && (
              <>
                <p className="text-white text-4xl font-black mb-1 tracking-widest">{currentWord.kana}</p>
                <p className="text-white/50 text-base font-mono font-bold tracking-widest">[{currentWord.romaji}]</p>
              </>
            )}
          </div>
        </div>

        {/* Input (outside the field) */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInput}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="ここにローマ字でタイピング..."
            className={`flex-1 rounded-2xl px-5 py-4 text-lg font-bold border-2 outline-none transition-all ${
              isWrongInput
                ? 'border-rose-400 bg-rose-50 text-rose-700'
                : 'border-orange-300 bg-white focus:border-orange-500'
            }`}
          />
          <button type="submit" className="bg-orange-500 text-white font-black px-6 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg active:scale-95">
            Enter
          </button>
        </form>

        {/* Battle log */}
        <div ref={logRef} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 h-28 overflow-y-auto space-y-1">
          {battleLog.map(log => (
            <p key={log.id} className={`text-xs font-bold ${log.type === 'player' ? 'text-orange-600' : log.type === 'enemy' ? 'text-rose-500' : 'text-slate-500'}`}>
              {log.msg}
            </p>
          ))}
        </div>
      </div>
    );
  }

  // =========================
  // SCREEN: WIN
  // =========================
  if (screen === 'win') {
    const nextStage = STAGES.find(s => s.id === selectedStage.id + 1);
    return (
      <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-3xl font-black text-emerald-600">ステージクリア！</h2>
        <p className="text-slate-600 font-bold">「{selectedStage.name}」をたおした！！</p>
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => setScreen('select')} className="bg-slate-100 text-slate-700 font-black px-6 py-3 rounded-2xl hover:bg-slate-200 transition-colors flex items-center gap-2">
            <Shield size={16} /> ステージ一覧へ
          </button>
          {nextStage && nextStage.minLv <= playerLevel && (
            <button onClick={() => startBattle(nextStage)} className="bg-orange-500 text-white font-black px-6 py-3 rounded-2xl hover:bg-orange-600 transition-colors shadow-lg flex items-center gap-2">
              次のステージへ <ChevronRight size={16} />
            </button>
          )}
          {nextStage && nextStage.minLv > playerLevel && (
            <p className="bg-amber-100 text-amber-700 font-bold text-sm px-5 py-3 rounded-2xl">
              🔒 次のステージはLv.{nextStage.minLv}～。カリキュラムをもっとやってレベルアップしよう！
            </p>
          )}
          {!nextStage && (
            <p className="bg-amber-100 text-amber-700 font-bold px-5 py-3 rounded-2xl">
              👑 全ステージクリア！最強だ！！+20XP獲得！
            </p>
          )}
        </div>
      </div>
    );
  }

  // =========================
  // SCREEN: LOSE
  // =========================
  if (screen === 'lose') {
    return (
      <div className="text-center py-12 space-y-6 animate-in zoom-in-95 duration-500">
        <div className="text-6xl mb-4">💀</div>
        <h2 className="text-3xl font-black text-rose-600">やられた…</h2>
        <p className="text-slate-600 font-bold">「{selectedStage.name}」にたおされた！</p>
        {playerLevel < 5 && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm font-bold text-amber-700">
            💡 XPを貯めてレベルアップすれば、もっと強くなれるよ！
          </div>
        )}
        <div className="flex justify-center gap-4 mt-6">
          <button onClick={() => setScreen('select')} className="bg-slate-100 text-slate-700 font-black px-6 py-3 rounded-2xl hover:bg-slate-200 flex items-center gap-2">
            <Shield size={16} /> ステージ一覧へ
          </button>
          <button onClick={() => startBattle(selectedStage)} className="bg-rose-500 text-white font-black px-6 py-3 rounded-2xl hover:bg-rose-600 shadow-lg flex items-center gap-2">
            <RotateCcw size={16} /> もう一度挑戦
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default TypingGame;
