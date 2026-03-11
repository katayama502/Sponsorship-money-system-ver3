export const RARITY_RATES = [
  { rarity: 'SS', chance: 1, color: 'text-fuchsia-500', bg: 'bg-fuchsia-100', border: 'border-fuchsia-300' },
  { rarity: 'S', chance: 4, color: 'text-rose-500', bg: 'bg-rose-100', border: 'border-rose-300' },
  { rarity: 'A', chance: 15, color: 'text-amber-500', bg: 'bg-amber-100', border: 'border-amber-300' },
  { rarity: 'B', chance: 30, color: 'text-sky-500', bg: 'bg-sky-100', border: 'border-sky-300' },
  { rarity: 'C', chance: 50, color: 'text-slate-500', bg: 'bg-slate-100', border: 'border-slate-300' }
];

export const rollGacha = () => {
  const rand = Math.random() * 100;
  let cumulative = 0;
  let rolledRarity = 'C';
  for (const rate of RARITY_RATES) {
    cumulative += rate.chance;
    if (rand <= cumulative) {
      rolledRarity = rate.rarity;
      break;
    }
  }
  
  const pool = GACHA_ITEMS.filter(i => i.rarity === rolledRarity);
  const randomItem = pool[Math.floor(Math.random() * pool.length)];
  return randomItem;
};

// SS (2 items), S (8 items), A (15 items), B (30 items), C (45 items) -> Total 100
export const GACHA_ITEMS = [
  // SS Rare (2) - Massive Stats
  { id: 'w_ss_1', name: '覇王の聖剣', rarity: 'SS', type: 'weapon', stats: { hp: 0, atk: 50, def: 0 }, desc: '伝説の勇者が用いたとされる究極の剣' },
  { id: 'a_ss_1', name: '神竜の鎧', rarity: 'SS', type: 'armor', stats: { hp: 200, atk: 0, def: 50 }, desc: '神話の竜の鱗から作られた絶対防壁' },

  // S Rare (8) - High Stats
  { id: 'w_s_1', name: '炎帝の杖', rarity: 'S', type: 'weapon', stats: { hp: 0, atk: 30, def: 0 }, desc: '触れるもの全てを灰にする杖' },
  { id: 'w_s_2', name: '魔神の双刃', rarity: 'S', type: 'weapon', stats: { hp: 0, atk: 35, def: 0 }, desc: '暗黒の力を秘めた恐るべき双剣' },
  { id: 'w_s_3', name: '雷光の弓', rarity: 'S', type: 'weapon', stats: { hp: 0, atk: 28, def: 0 }, desc: '雷の如き速さで矢を放つ' },
  { id: 'a_s_1', name: '聖騎士の盾', rarity: 'S', type: 'armor', stats: { hp: 50, atk: 0, def: 30 }, desc: 'あらゆる邪悪を弾く高潔なる盾' },
  { id: 'a_s_2', name: '漆黒のローブ', rarity: 'S', type: 'armor', stats: { hp: 0, atk: 10, def: 25 }, desc: '闇夜に紛れる隠密の衣' },
  { id: 'ac_s_1', name: '命の神石', rarity: 'S', type: 'accessory', stats: { hp: 300, atk: 0, def: 0 }, desc: '無限の生命力を与えるといわれる石' },
  { id: 'ac_s_2', name: '英雄の証', rarity: 'S', type: 'accessory', stats: { hp: 100, atk: 15, def: 15 }, desc: '真の英雄のみが身につけられる証' },
  { id: 'ac_s_3', name: '星詠みの指輪', rarity: 'S', type: 'accessory', stats: { hp: 50, atk: 20, def: 10 }, desc: '星の理を理解し力を引き出す指輪' },

  // A Rare (15) - Medium-High Stats
  { id: 'w_a_1', name: '達人の刀', rarity: 'A', type: 'weapon', stats: { hp: 0, atk: 15, def: 0 }, desc: '研ぎ澄まされた名刀' },
  { id: 'w_a_2', name: '氷牙の槍', rarity: 'A', type: 'weapon', stats: { hp: 0, atk: 14, def: 0 }, desc: '凍てつく冷気を纏う槍' },
  { id: 'w_a_3', name: '猛獣の爪', rarity: 'A', type: 'weapon', stats: { hp: 0, atk: 16, def: 0 }, desc: '獣の力を宿す鋭い爪' },
  { id: 'w_a_4', name: '賢者の杖', rarity: 'A', type: 'weapon', stats: { hp: 0, atk: 13, def: 5 }, desc: '深い知識が込められた杖' },
  { id: 'w_a_5', name: '狂戦士の斧', rarity: 'A', type: 'weapon', stats: { hp: -20, atk: 25, def: 0 }, desc: '強力だが体力を削る呪われた斧' },
  { id: 'a_a_1', name: 'ミスリルメイル', rarity: 'A', type: 'armor', stats: { hp: 0, atk: 0, def: 15 }, desc: '軽くて硬い魔法の金属鎧' },
  { id: 'a_a_2', name: '大樹の盾', rarity: 'A', type: 'armor', stats: { hp: 30, atk: 0, def: 12 }, desc: '世界樹の枝から作られた盾' },
  { id: 'a_a_3', name: '幻影の外套', rarity: 'A', type: 'armor', stats: { hp: 0, atk: 0, def: 18 }, desc: '攻撃を幻のようにかわす' },
  { id: 'a_a_4', name: '溶岩の鎧', rarity: 'A', type: 'armor', stats: { hp: 0, atk: 5, def: 14 }, desc: '高熱を放つ危険な鎧' },
  { id: 'a_a_5', name: '風の衣', rarity: 'A', type: 'armor', stats: { hp: 20, atk: 0, def: 10 }, desc: '風に乗るように軽い衣' },
  { id: 'ac_a_1', name: '力の腕輪', rarity: 'A', type: 'accessory', stats: { hp: 0, atk: 10, def: 0 }, desc: '腕力が大幅に上がる' },
  { id: 'ac_a_2', name: '守りの指輪', rarity: 'A', type: 'accessory', stats: { hp: 0, atk: 0, def: 10 }, desc: '物理攻撃を軽減する' },
  { id: 'ac_a_3', name: '生命のネックレス', rarity: 'A', type: 'accessory', stats: { hp: 100, atk: 0, def: 0 }, desc: '生命力がみなぎる' },
  { id: 'ac_a_4', name: '全能のピアス', rarity: 'A', type: 'accessory', stats: { hp: 20, atk: 5, def: 5 }, desc: '全ての能力が少し上がる' },
  { id: 'ac_a_5', name: '吸血のリング', rarity: 'A', type: 'accessory', stats: { hp: 50, atk: 8, def: -5 }, desc: '攻撃力と引き換えに防御が下がる' },

  // B Rare (30) - Medium Stats
  { id: 'w_b_1', name: '鋼の剣', rarity: 'B', type: 'weapon', stats: { hp: 0, atk: 8, def: 0 }, desc: '標準的で扱いやすい剣' },
  { id: 'w_b_2', name: '兵士の槍', rarity: 'B', type: 'weapon', stats: { hp: 0, atk: 7, def: 0 }, desc: '城の衛兵が使う槍' },
  { id: 'w_b_3', name: '狩人の弓', rarity: 'B', type: 'weapon', stats: { hp: 0, atk: 6, def: 0 }, desc: '森の民が使う弓' },
  { id: 'w_b_4', name: '魔術師の杖', rarity: 'B', type: 'weapon', stats: { hp: 0, atk: 9, def: 0 }, desc: '魔法の威力を少し高める' },
  { id: 'w_b_5', name: '暗殺者の短剣', rarity: 'B', type: 'weapon', stats: { hp: 0, atk: 10, def: 0 }, desc: '急所を突きやすい' },
  { id: 'w_b_6', name: 'バトルアックス', rarity: 'B', type: 'weapon', stats: { hp: 0, atk: 12, def: -2 }, desc: '重いが破壊力がある' },
  { id: 'w_b_7', name: 'モーニングスター', rarity: 'B', type: 'weapon', stats: { hp: 0, atk: 11, def: 0 }, desc: 'トゲのついた鉄球' },
  { id: 'w_b_8', name: 'レイピア', rarity: 'B', type: 'weapon', stats: { hp: 0, atk: 7, def: 2 }, desc: '受け流しにも使える細剣' },
  { id: 'w_b_9', name: 'クレイモア', rarity: 'B', type: 'weapon', stats: { hp: -10, atk: 14, def: 0 }, desc: '巨大な両手剣' },
  { id: 'w_b_10', name: '呪いのお札', rarity: 'B', type: 'weapon', stats: { hp: 0, atk: 8, def: 0 }, desc: '不気味な力を持つ' },
  { id: 'a_b_1', name: '鋼の鎧', rarity: 'B', type: 'armor', stats: { hp: 0, atk: 0, def: 8 }, desc: '頑丈な鋼鉄製' },
  { id: 'a_b_2', name: '騎士の盾', rarity: 'B', type: 'armor', stats: { hp: 0, atk: 0, def: 7 }, desc: '一般的な金属盾' },
  { id: 'a_b_3', name: '魔道衣', rarity: 'B', type: 'armor', stats: { hp: 10, atk: 2, def: 4 }, desc: '魔力を帯びた服' },
  { id: 'a_b_4', name: '盗賊の服', rarity: 'B', type: 'armor', stats: { hp: 0, atk: 0, def: 5 }, desc: '動きやすさ重視' },
  { id: 'a_b_5', name: 'チェインメイル', rarity: 'B', type: 'armor', stats: { hp: 0, atk: 0, def: 6 }, desc: '鎖編みのよろい' },
  { id: 'a_b_6', name: 'スパイクシールド', rarity: 'B', type: 'armor', stats: { hp: 0, atk: 3, def: 5 }, desc: '攻撃にも使える盾' },
  { id: 'a_b_7', name: '重装騎士の鎧', rarity: 'B', type: 'armor', stats: { hp: -10, atk: 0, def: 12 }, desc: '防御力は高いが重い' },
  { id: 'a_b_8', name: '森の狩り着', rarity: 'B', type: 'armor', stats: { hp: 20, atk: 0, def: 4 }, desc: '自然に溶け込む服' },
  { id: 'a_b_9', name: '司祭のローブ', rarity: 'B', type: 'armor', stats: { hp: 30, atk: 0, def: 3 }, desc: '聖なる加護がある' },
  { id: 'a_b_10', name: '武闘家の道着', rarity: 'B', type: 'armor', stats: { hp: 0, atk: 4, def: 3 }, desc: '戦うための服' },
  { id: 'ac_b_1', name: 'ルビーの指輪', rarity: 'B', type: 'accessory', stats: { hp: 0, atk: 4, def: 0 }, desc: '攻撃力を少し上げる' },
  { id: 'ac_b_2', name: 'サファイアの指輪', rarity: 'B', type: 'accessory', stats: { hp: 0, atk: 0, def: 4 }, desc: '防御力を少し上げる' },
  { id: 'ac_b_3', name: 'エメラルドの指輪', rarity: 'B', type: 'accessory', stats: { hp: 50, atk: 0, def: 0 }, desc: '体力を少し上げる' },
  { id: 'ac_b_4', name: '戦士のお守り', rarity: 'B', type: 'accessory', stats: { hp: 10, atk: 2, def: 2 }, desc: '戦士の必需品' },
  { id: 'ac_b_5', name: '風のブーツ', rarity: 'B', type: 'accessory', stats: { hp: 0, atk: 0, def: 5 }, desc: '素早く動ける' },
  { id: 'ac_b_6', name: '力のベルト', rarity: 'B', type: 'accessory', stats: { hp: 0, atk: 5, def: 0 }, desc: '力が入るベルト' },
  { id: 'ac_b_7', name: '魔よけの護符', rarity: 'B', type: 'accessory', stats: { hp: 30, atk: 0, def: 2 }, desc: '災いを退ける' },
  { id: 'ac_b_8', name: '幸運のコイン', rarity: 'B', type: 'accessory', stats: { hp: 20, atk: 2, def: 0 }, desc: '持っているといいことがあるかも' },
  { id: 'ac_b_9', name: '職人のメガネ', rarity: 'B', type: 'accessory', stats: { hp: 0, atk: 3, def: 0 }, desc: '弱点が見えやすくなる' },
  { id: 'ac_b_10', name: '防寒マント', rarity: 'B', type: 'accessory', stats: { hp: 10, atk: 0, def: 3 }, desc: '寒さから身を守る' },

  // C Rare (45) - Low/Entry Stats
  { id: 'w_c_1', name: '木の剣', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 2, def: 0 }, desc: '練習用の木剣' },
  { id: 'w_c_2', name: '竹の槍', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 2, def: 0 }, desc: '先を尖らせただけの竹' },
  { id: 'w_c_3', name: 'おもちゃの弓', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 1, def: 0 }, desc: '子供のおもちゃ' },
  { id: 'w_c_4', name: 'ただの木の枝', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 1, def: 0 }, desc: 'その辺で拾った枝' },
  { id: 'w_c_5', name: '錆びたナイフ', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 3, def: 0 }, desc: '手入れされていない' },
  { id: 'w_c_6', name: '石の斧', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 4, def: 0 }, desc: '原始的な武器' },
  { id: 'w_c_7', name: 'こん棒', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 3, def: 0 }, desc: 'ただの丸太' },
  { id: 'w_c_8', name: 'ハリセン', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 1, def: 1 }, desc: 'ツッコミ用' },
  { id: 'w_c_9', name: 'フライパン', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 2, def: 1 }, desc: '料理用の道具' },
  { id: 'w_c_10', name: 'ボロの杖', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 2, def: 0 }, desc: '魔力はほとんどない' },
  { id: 'w_c_11', name: '骨の剣', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 3, def: 0 }, desc: '不気味だがもろい' },
  { id: 'w_c_12', name: 'スリングショット', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 2, def: 0 }, desc: '石を飛ばす' },
  { id: 'w_c_13', name: 'クワ', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 2, def: 0 }, desc: '農具' },
  { id: 'w_c_14', name: 'ピコピコハンマー', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 1, def: 0 }, desc: '叩くと音が鳴る' },
  { id: 'w_c_15', name: '虫取り網', rarity: 'C', type: 'weapon', stats: { hp: 0, atk: 1, def: 0 }, desc: '虫を捕まえる網' },
  { id: 'a_c_1', name: '布の服', rarity: 'C', type: 'armor', stats: { hp: 0, atk: 0, def: 1 }, desc: 'ただの服' },
  { id: 'a_c_2', name: '旅人の服', rarity: 'C', type: 'armor', stats: { hp: 0, atk: 0, def: 2 }, desc: '少し丈夫な服' },
  { id: 'a_c_3', name: '皮の鎧', rarity: 'C', type: 'armor', stats: { hp: 0, atk: 0, def: 3 }, desc: '動物の皮で作った' },
  { id: 'a_c_4', name: 'おなべのフタ', rarity: 'C', type: 'armor', stats: { hp: 0, atk: 0, def: 1 }, desc: '盾代わり' },
  { id: 'a_c_5', name: '木の盾', rarity: 'C', type: 'armor', stats: { hp: 0, atk: 0, def: 2 }, desc: '木板を合わせた盾' },
  { id: 'a_c_6', name: 'バンダナ', rarity: 'C', type: 'armor', stats: { hp: 10, atk: 0, def: 0 }, desc: '頭に巻く布' },
  { id: 'a_c_7', name: '麦わら帽子', rarity: 'C', type: 'armor', stats: { hp: 5, atk: 0, def: 1 }, desc: '日差しを防ぐ' },
  { id: 'a_c_8', name: 'ボロのローブ', rarity: 'C', type: 'armor', stats: { hp: 10, atk: 0, def: 1 }, desc: 'あちこち破れている' },
  { id: 'a_c_9', name: 'エプロン', rarity: 'C', type: 'armor', stats: { hp: 0, atk: 0, def: 1 }, desc: '汚れを防ぐ' },
  { id: 'a_c_10', name: '厚手のシャツ', rarity: 'C', type: 'armor', stats: { hp: 0, atk: 0, def: 2 }, desc: '少し暖かい' },
  { id: 'a_c_11', name: '皮の盾', rarity: 'C', type: 'armor', stats: { hp: 0, atk: 0, def: 3 }, desc: '木よりはマシ' },
  { id: 'a_c_12', name: '作業着', rarity: 'C', type: 'armor', stats: { hp: 10, atk: 0, def: 2 }, desc: '汚れに強い' },
  { id: 'a_c_13', name: 'パジャマ', rarity: 'C', type: 'armor', stats: { hp: 20, atk: 0, def: 0 }, desc: 'よく眠れる' },
  { id: 'a_c_14', name: 'レインコート', rarity: 'C', type: 'armor', stats: { hp: 0, atk: 0, def: 2 }, desc: '雨具' },
  { id: 'a_c_15', name: 'ダンボール', rarity: 'C', type: 'armor', stats: { hp: 5, atk: 0, def: 0 }, desc: 'かぶって隠れる' },
  { id: 'ac_c_1', name: 'ガラスの指輪', rarity: 'C', type: 'accessory', stats: { hp: 0, atk: 0, def: 1 }, desc: '安物のおもちゃ' },
  { id: 'ac_c_2', name: 'ミサンガ', rarity: 'C', type: 'accessory', stats: { hp: 10, atk: 0, def: 0 }, desc: '願いが叶うかも' },
  { id: 'ac_c_3', name: 'おもちゃのメダル', rarity: 'C', type: 'accessory', stats: { hp: 0, atk: 1, def: 0 }, desc: '子供だまし' },
  { id: 'ac_c_4', name: '貝殻のネックレス', rarity: 'C', type: 'accessory', stats: { hp: 5, atk: 0, def: 1 }, desc: '海で拾った' },
  { id: 'ac_c_5', name: '皮のベルト', rarity: 'C', type: 'accessory', stats: { hp: 10, atk: 0, def: 0 }, desc: 'ズボンが落ちない' },
  { id: 'ac_c_6', name: '伊達メガネ', rarity: 'C', type: 'accessory', stats: { hp: 0, atk: 0, def: 1 }, desc: '賢そうに見える' },
  { id: 'ac_c_7', name: '絆創膏', rarity: 'C', type: 'accessory', stats: { hp: 20, atk: 0, def: 0 }, desc: '少し回復する気がする' },
  { id: 'ac_c_8', name: '安全ピン', rarity: 'C', type: 'accessory', stats: { hp: 0, atk: 1, def: 0 }, desc: '服を留める' },
  { id: 'ac_c_9', name: 'どんぐり', rarity: 'C', type: 'accessory', stats: { hp: 5, atk: 0, def: 0 }, desc: '秋の気配' },
  { id: 'ac_c_10', name: '布の切れ端', rarity: 'C', type: 'accessory', stats: { hp: 0, atk: 0, def: 1 }, desc: '何かに使えるかも' },
  { id: 'ac_c_11', name: '四葉のクローバー', rarity: 'C', type: 'accessory', stats: { hp: 10, atk: 1, def: 1 }, desc: '少し運がよくなる' },
  { id: 'ac_c_12', name: 'お守り', rarity: 'C', type: 'accessory', stats: { hp: 15, atk: 0, def: 0 }, desc: '交通安全' },
  { id: 'ac_c_13', name: '名札', rarity: 'C', type: 'accessory', stats: { hp: 0, atk: 0, def: 1 }, desc: '名前が書いてある' },
  { id: 'ac_c_14', name: 'ヘアピン', rarity: 'C', type: 'accessory', stats: { hp: 0, atk: 1, def: 0 }, desc: '髪をまとめる' },
  { id: 'ac_c_15', name: '空き缶', rarity: 'C', type: 'accessory', stats: { hp: 0, atk: 0, def: 0 }, desc: 'ただのゴミ…？' }
];
