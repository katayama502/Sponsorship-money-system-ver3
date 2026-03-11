import React, { useState, useEffect, useRef, useCallback } from 'react';
import { db, appId } from '../firebase.js';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { Swords, Heart, Zap, Trophy, RotateCcw, ChevronRight, Shield, X } from 'lucide-react';

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

// --- Stage definitions ---
const STAGES = [
  { id: 1, name: 'スライム',    emoji: '🟢', hp: 30,  atk: 3,  minLv: 1, desc: 'よわよわのスライム。ウォームアップにどうぞ！' },
  { id: 2, name: 'コウモリ',   emoji: '🦇', hp: 60,  atk: 6,  minLv: 1, desc: 'すばやく飛び回るコウモリだ！' },
  { id: 3, name: 'ゴブリン',   emoji: '👺', hp: 100, atk: 10, minLv: 1, desc: 'いたずら好きのゴブリンが現れた！' },
  { id: 4, name: 'オーク',     emoji: '👹', hp: 150, atk: 16, minLv: 2, desc: 'でかくて強いオーク！Lv2以上推奨。' },
  { id: 5, name: 'スケルトン', emoji: '💀', hp: 220, atk: 24, minLv: 2, desc: 'ガシャガシャうごくスケルトン！' },
  { id: 6, name: 'ウィッチ',   emoji: '🧙', hp: 300, atk: 33, minLv: 3, desc: '強力な呪文を使うウィッチ。Lv3以上推奨！' },
  { id: 7, name: 'ドラゴン',   emoji: '🐉', hp: 400, atk: 44, minLv: 3, desc: '炎をはくドラゴン！かなり強い！' },
  { id: 8, name: 'ダークナイト',emoji: '🛡️', hp: 520, atk: 57, minLv: 4, desc: '暗黒騎士が立ちはだかる！Lv4以上推奨。' },
  { id: 9, name: 'デーモン',   emoji: '😈', hp: 680, atk: 72, minLv: 4, desc: '地獄から来た悪魔！Lv5でないと勝てないかも…' },
  { id: 10, name: 'ラスボス',  emoji: '👑', hp: 900, atk: 90, minLv: 5, desc: '伝説の魔王！最強のキャラクターで挑め！' },
];

// --- Player stats mapping by level (1-5) ---
const PLAYER_STATS = {
  1: { maxHp: 80,  atk: 8  },
  2: { maxHp: 120, atk: 14 },
  3: { maxHp: 170, atk: 22 },
  4: { maxHp: 240, atk: 32 },
  5: { maxHp: 350, atk: 50 },
};

const getPlayerLevel = (percentage) => {
  if (percentage >= 100) return 5;
  if (percentage >= 75)  return 4;
  if (percentage >= 50)  return 3;
  if (percentage >= 25)  return 2;
  return 1;
};

const getLevelCharacter = (percentage) => {
  if (percentage >= 100) return { imageUrl: '/characters/lv5.png', name: 'プログラミングマスター' };
  if (percentage >= 75)  return { imageUrl: '/characters/lv4.png', name: 'つよつよプログラマー' };
  if (percentage >= 50)  return { imageUrl: '/characters/lv3.png', name: 'ゆうかんなチャレンジャー' };
  if (percentage >= 25)  return { imageUrl: '/characters/lv2.png', name: 'げんきなチャレンジャー' };
  return { imageUrl: '/characters/lv1.png', name: 'はじまりのルーキー' };
};

const ENEMY_ATTACK_INTERVAL_MS = 3500; // Enemy attacks every 3.5 seconds

const TypingGame = ({ studentId, completedCount, totalMaterials }) => {
  const progressPercentage = totalMaterials > 0 ? Math.min(100, Math.floor((completedCount / totalMaterials) * 100)) : 0;
  const playerLevel = getPlayerLevel(progressPercentage);
  const charInfo = getLevelCharacter(progressPercentage);
  const { maxHp, atk: playerAtk } = PLAYER_STATS[playerLevel];

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
      const updated = Array.from(new Set([...existing, stageId]));
      await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'students', studentId), { clearedStages: updated });
      setClearedStages(updated);
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
        const next = prev - selectedStage.atk;
        if (next <= 0) {
          clearInterval(enemyTimerRef.current);
          setScreen('lose');
          return 0;
        }
        setShakePlayer(true);
        setTimeout(() => setShakePlayer(false), 400);
        addLog(`💥 ${selectedStage.name}の攻撃！ -${selectedStage.atk}ダメージ`, 'enemy');
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
            await saveClearedStage(selectedStage.id);
            setScreen('win');
          }, 400);
          return 0;
        }
        return next;
      });
      setShakeEnemy(true);
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
              カリキュラム達成率: {progressPercentage}% &nbsp;|&nbsp; Lv.{playerLevel} &nbsp;|&nbsp; HP:{maxHp} ATK:{playerAtk}
            </p>
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
              🎯 カリキュラムをもっとこなしてレベルアップすれば、強い敵に挑戦できるよ！
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
    const enemyHpPct = Math.max(0, (enemyHp / selectedStage.hp) * 100);
    const playerHpPct = Math.max(0, (playerHp / maxHp) * 100);
    return (
      <div className="space-y-4 animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button onClick={() => { clearInterval(enemyTimerRef.current); setScreen('select'); }} className="p-2 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-rose-500 transition-colors">
            <X size={16} />
          </button>
          <h3 className="font-black text-slate-800 text-lg">⚔️ Stage {selectedStage.id}: {selectedStage.name}</h3>
        </div>

        {/* Battle field */}
        <div className="grid grid-cols-2 gap-4">
          {/* Player side */}
          <div className={`bg-white rounded-2xl border-2 border-sky-200 p-4 text-center transition-transform ${shakePlayer ? 'translate-x-2 border-rose-400' : ''}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">あなた</p>
            <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center">
              <img src={charInfo.imageUrl} alt={charInfo.name} className="w-full h-full object-contain" onError={e => { e.target.style.display='none'; }} />
            </div>
            <p className="text-xs font-black text-slate-600 mb-2">Lv.{playerLevel} | HP {playerHp}/{maxHp}</p>
            <HpBar current={playerHp} max={maxHp} color="bg-sky-400" />
          </div>

          {/* Enemy side */}
          <div className={`bg-white rounded-2xl border-2 border-rose-200 p-4 text-center transition-transform ${shakeEnemy ? '-translate-x-2 border-orange-500' : ''}`}>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">てき</p>
            <div className="w-16 h-16 mx-auto mb-2 flex items-center justify-center text-5xl">
              {selectedStage.emoji}
            </div>
            <p className="text-xs font-black text-slate-600 mb-2">{selectedStage.name} HP {Math.max(0, enemyHp)}/{selectedStage.hp}</p>
            <HpBar current={enemyHp} max={selectedStage.hp} color="bg-rose-400" />
          </div>
        </div>

        {/* Word to type */}
        <div className="bg-slate-900 rounded-2xl p-6 text-center">
          <p className="text-slate-400 text-xs font-bold mb-3 uppercase tracking-widest">つぎの単語をタイピング！</p>
          {currentWord && (
            <>
              <p className="text-white text-4xl font-black mb-2 tracking-widest">{currentWord.kana}</p>
              <p className="text-slate-400 text-lg font-mono font-bold tracking-widest">[{currentWord.romaji}]</p>
            </>
          )}
        </div>

        {/* Input */}
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
        <div ref={logRef} className="bg-slate-50 rounded-2xl border border-slate-200 p-4 h-32 overflow-y-auto space-y-1">
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
              👑 全ステージクリア！最強だ！！
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
            💡 カリキュラムをこなしてレベルアップすれば、もっと強くなれるよ！
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
