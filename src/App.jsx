import React, { useState, useEffect, useRef } from "react";
import {
  Users, BrainCircuit, ShieldCheck, Zap, BookOpen,
  Clock, Heart, Handshake, CheckCircle2, RotateCcw,
  Copy, ChevronDown, ChevronUp, Loader2, AlertTriangle,
  TrendingUp, Star, ClipboardList
} from "lucide-react";

// ══════════════════════════════════════════════════════════════════════
//  ⚙️  CONFIG — 替換成你的 GAS 網址
// ══════════════════════════════════════════════════════════════════════
const GAS_URL = "https://script.google.com/macros/s/【替換成你的GAS部署網址】/exec";

// ══════════════════════════════════════════════════════════════════════
//  🎨  THEME
// ══════════════════════════════════════════════════════════════════════
const T = {
  bg:       "#F7F9FC",
  surface:  "#FFFFFF",
  border:   "#E4EAF2",
  accent:   "#1D6FE8",
  accentSoft:"#EBF2FF",
  gold:     "#E8970A",
  green:    "#0F9D58",
  red:      "#D93025",
  orange:   "#E8610A",
  purple:   "#6B3FE8",
  teal:     "#0A8A7A",
  text:     "#111827",
  sub:      "#4B5563",
  muted:    "#9CA3AF",
  inputBg:  "#F3F6FB",
  inputBdr: "#C9D6E8",
};

const TRAIT_META = {
  obedience:  { label:"服從性", icon:ShieldCheck, color:T.purple  },
  discipline: { label:"自律性", icon:Clock,       color:T.green   },
  learning:   { label:"學習心", icon:BookOpen,    color:T.accent  },
  proactivity:{ label:"積極度", icon:Zap,         color:T.orange  },
  stress:     { label:"抗壓性", icon:Heart,       color:T.red     },
  teamwork:   { label:"團隊協作",icon:Handshake,  color:T.teal    },
};

const DISC_INFO = {
  D:{ label:"掌控型", animal:"🐯 老虎", weight:92, desc:"目標導向、果斷主導，適合高競爭業績環境" },
  I:{ label:"影響型", animal:"🦚 孔雀", weight:88, desc:"熱情感染力強、擅長客戶關係，適合活動銷售" },
  S:{ label:"穩定型", animal:"🐨 無尾熊",weight:76,desc:"踏實可靠、忠誠度高，適合長期培育" },
  C:{ label:"謹慎型", animal:"🦉 貓頭鷹",weight:82,desc:"嚴謹細心、流程導向，適合稽核或後台職能" },
};

// ══════════════════════════════════════════════════════════════════════
//  📚  題庫 — 每個維度 7 題（每次隨機抽 3 題），DISC 10 題抽 8 題
// ══════════════════════════════════════════════════════════════════════
const BEHAVIOR_BANK = [

  /* ─── 服從性 obedience ─── */
  { id:"o1", trait:"obedience",
    q:"主管要求改用全新門市報表系統，你認為舊系統效率更高，你會：",
    opts:["先切換配合，整理使用問題後用數據向主管反映","說明舊系統優點，請求保留","表面答應，私下繼續用舊系統","直接在會議上反駁新系統的合理性"],
    s:[4,2,0,1] },
  { id:"o2", trait:"obedience",
    q:"公司規定每天下班前完成客流回報，但你今天加班到非常疲累：",
    opts:["再累也在離開前完成規定的回報","明天早上補報就好","隨便填個大概數字應付","沒人催就不報了"],
    s:[4,2,1,0] },
  { id:"o3", trait:"obedience",
    q:"總公司更改促銷話術腳本，但你認為舊話術轉換率更高：",
    opts:["立刻改用新話術執行，同時整理業績數據給主管參考","私下繼續用舊話術，因為業績才是重點","跟同事討論後選多數人覺得好的","向主管抱怨這個決策不合理"],
    s:[4,1,2,0] },
  { id:"o4", trait:"obedience",
    q:"排班表出爐，你被安排了不喜歡的假日班：",
    opts:["接受安排，若有需求透過正式換班流程申請","直接找同事私下換班不通報主管","消極上班讓主管感受到你的不滿","在群組抱怨排班不公平"],
    s:[4,2,1,0] },
  { id:"o5", trait:"obedience",
    q:"你不同意主管的某個業務決策，你的做法是：",
    opts:["正式場合提出疑問，聽完解釋後依指示執行並留下記錄","私下持續向同事表達反對意見","當眾反駁主管","事後當決策出錯時說「我早就說過了」"],
    s:[4,1,0,0] },
  { id:"o6", trait:"obedience",
    q:"你接到一個臨時交辦任務，但手邊已有既定工作排程：",
    opts:["回報手邊狀況後詢問優先順序，依主管指示調整","直接忽略臨時任務，以原定計畫為主","跟主管說太忙沒辦法做","隨便做做交差"],
    s:[4,1,0,2] },
  { id:"o7", trait:"obedience",
    q:"公司推行新的服裝規定，但你認為原本的裝扮更專業：",
    opts:["遵守新規定，若有意見透過正式管道反映","繼續依個人判斷穿著","找藉口說沒看到通知","在同事間引發對新規定的討論"],
    s:[4,1,2,0] },

  /* ─── 自律性 discipline ─── */
  { id:"d1", trait:"discipline",
    q:"門市離峰時段完全沒有客人，你通常會：",
    opts:["自主整理環境、研讀新方案或練習話術","和同事聊天等客人","滑手機放鬆","找機會到後場休息"],
    s:[4,3,1,0] },
  { id:"d2", trait:"discipline",
    q:"你有一份繁瑣的庫存盤點需在下班前完成：",
    opts:["拆分小任務，設定時間點逐一完成","盡量做，做不完留給下一班","先做喜歡的部分，盤點最後再做","被催促前拖到最後才開始"],
    s:[4,2,1,0] },
  { id:"d3", trait:"discipline",
    q:"連續三天業績未達標，你的自我管理方式是：",
    opts:["每天晚上回顧銷售過程，擬定隔天改進計畫","稍微反省一下，明天看看","覺得是市場問題，不必改變","等主管來問才開始思考"],
    s:[4,2,1,0] },
  { id:"d4", trait:"discipline",
    q:"主管出差三天沒有交辦明確任務，你在這段時間：",
    opts:["按既定工作清單執行，主動補位可能的空缺","完成基本工作就好，其他放鬆","行事標準依主管在不在場而調整","趁機鬆懈"],
    s:[4,3,0,0] },
  { id:"d5", trait:"discipline",
    q:"面對你不擅長的行政報表或合約審核，你的態度是：",
    opts:["設定目標在截止前精確完成，不管喜不喜歡","能交差就好，不求準確","想辦法請同事代勞","拖到被催才動手"],
    s:[4,2,1,0] },
  { id:"d6", trait:"discipline",
    q:"你為自己設定了每月讀一本銷售書的目標，但這個月工作特別繁忙：",
    opts:["利用通勤或午休時間分段閱讀，仍完成目標","工作忙時這種目標可以暫停","快速翻翻說完成了","沒人監督的目標不必太認真"],
    s:[4,2,1,0] },
  { id:"d7", trait:"discipline",
    q:"你知道某個工作習慣影響你的效率，但改起來很不舒服：",
    opts:["強迫自己養成新習慣，即使初期痛苦","改一點點，不要太勉強","打算改但一直沒行動","覺得現在這樣也還可以"],
    s:[4,2,1,0] },

  /* ─── 學習心 learning ─── */
  { id:"l1", trait:"learning",
    q:"公司推出複雜的 AI 資費方案，你完全不熟悉相關技術：",
    opts:["主動找資料並向店長請教，確保自己能流利說明","等開會時聽一下就好","只記價格，技術細節不懂就說不清楚","客人沒問就不去研究"],
    s:[4,2,1,0] },
  { id:"l2", trait:"learning",
    q:"一次銷售失敗後，你的習慣性反應是：",
    opts:["仔細回想對話過程，找出轉折點並記錄","覺得只是客人今天心情不好","問同事為什麼客人都這麼難搞","不去想它，繼續接下一個"],
    s:[4,2,1,0] },
  { id:"l3", trait:"learning",
    q:"同事的某個話術成效特別好，你的做法是：",
    opts:["主動詢問並嘗試在自己的銷售中融入","有點興趣但不特別去學","覺得每人風格不同不需要學","認為自己的方式就很好"],
    s:[4,2,1,0] },
  { id:"l4", trait:"learning",
    q:"公司提供線上教育訓練，但沒有強制觀看：",
    opts:["利用空檔主動完成，因為對工作有幫助","等主管要求再看","快速倍速看完應付","根本不去看"],
    s:[4,2,1,0] },
  { id:"l5", trait:"learning",
    q:"主管給你一個從未做過的新任務：",
    opts:["視為成長機會，主動詢問需要什麼資源","有點擔心但願意嘗試","想辦法推掉，說自己能力不足","抱怨為什麼交給自己"],
    s:[4,3,0,0] },
  { id:"l6", trait:"learning",
    q:"你在某通銷售電話中使用了錯誤的資費資訊，客人當場糾正你：",
    opts:["誠懇道歉並立即記下正確資訊，下班前複習相關資料","道歉，但不特別做記錄","覺得資費太複雜，下次再說","歸咎於公司資料沒有更新"],
    s:[4,2,1,0] },
  { id:"l7", trait:"learning",
    q:"你看到同業競爭門市有個很好的陳列方式，你會：",
    opts:["拍照記錄並帶回來跟主管討論是否可以借鑒","注意到了但沒有特別行動","覺得競爭對手的東西不需要學","忘記了"],
    s:[4,2,1,0] },

  /* ─── 積極度 proactivity ─── */
  { id:"p1", trait:"proactivity",
    q:"看到客人在門口張望但沒有進來：",
    opts:["主動開門微笑打招呼，詢問是否需要協助","點頭示意等他自己進門","忙手邊的事不去管","等他進門後再招呼"],
    s:[4,2,1,0] },
  { id:"p2", trait:"proactivity",
    q:"這個月業績目標提前第三週完成，你的選擇是：",
    opts:["設定更高個人目標，繼續挑戰","維持現在節奏，不要太衝","稍微放鬆，把剩餘客戶留給同事","目標達成就沒有動力了"],
    s:[4,3,1,0] },
  { id:"p3", trait:"proactivity",
    q:"你發現門市有個小流程可以改善客戶體驗，但不在你的職責範圍：",
    opts:["主動向主管提出改善建議並附上具體做法","告訴同事讓同事去說","覺得不關我事","等主管自己發現"],
    s:[4,2,0,1] },
  { id:"p4", trait:"proactivity",
    q:"客人剛辦完手機正要離開，你會：",
    opts:["主動介紹相關配件或保險方案延伸銷售","客人沒問就讓他離開","說一句歡迎再來就結束","聊幾句建立下次回訪關係"],
    s:[3,1,0,4] },
  { id:"p5", trait:"proactivity",
    q:"你發現某區展示機一直沒有客人駐足：",
    opts:["主動思考陳列問題，提出調整建議","這是店長的事","跟同事提一下看怎麼看","注意到但不採取任何行動"],
    s:[4,0,2,1] },
  { id:"p6", trait:"proactivity",
    q:"今天進門客流明顯減少，你的反應是：",
    opts:["主動想辦法：整理客戶名單、聯絡舊客戶、優化門口陳列","等待客人自然上門","跟同事討論是不是哪裡出了問題","反正業績不好是整體環境問題"],
    s:[4,2,1,0] },
  { id:"p7", trait:"proactivity",
    q:"門市剛換了一批新機型，你尚未完全熟悉規格：",
    opts:["主動在開店前先研究一遍並試用","等客人來問再查","有需要再說，先顧好手邊的工作","靠同事幫忙回答就好"],
    s:[4,2,1,0] },

  /* ─── 抗壓性 stress ─── */
  { id:"s1", trait:"stress",
    q:"連假旺季，你一人同時要接待三組客人、處理換機問題並完成報表：",
    opts:["冷靜評估輕重緩急，依序處理並請同事支援","努力同時應付但品質下降","焦慮到判斷失誤","跟主管說人力不足要求調人"],
    s:[4,2,1,0] },
  { id:"s2", trait:"stress",
    q:"客人無理取鬧，在現場大聲投訴你的服務態度：",
    opts:["保持冷靜，同理客人情緒，尋求解決方案","嘗試解釋但語氣逐漸強硬","請主管來處理，自己先離開","跟客人爭論是非對錯"],
    s:[4,2,2,0] },
  { id:"s3", trait:"stress",
    q:"連續兩週業績墊底，主管在週會點名你要改進：",
    opts:["雖然難受，但轉化為動力設定行動計畫","非常沮喪但還是繼續撐","覺得被針對，心情差影響工作","開始考慮辭職"],
    s:[4,2,1,0] },
  { id:"s4", trait:"stress",
    q:"你今天身體不舒服，但門市只剩你一人，下一班還有三小時：",
    opts:["撐住繼續工作，通知主管狀況並請求後續支援","狀況太差打電話請人頂替","硬撐但情緒不穩影響接待","直接離開留給主管處理"],
    s:[4,3,1,0] },
  { id:"s5", trait:"stress",
    q:"你提出的方案被主管直接否決且沒有太多解釋：",
    opts:["接受結果，找機會了解原因並學習","心裡難受但不表現出來","覺得主管不重視你而不滿","此後不再提出任何建議"],
    s:[4,3,1,0] },
  { id:"s6", trait:"stress",
    q:"月底最後一天，你距離目標還差三單，剩一小時下班：",
    opts:["立刻聯絡潛在客戶名單，全力衝刺最後機會","再盡力試試，但不太抱希望","已經放棄了，等下個月","跟同事抱怨今個月運氣不好"],
    s:[4,2,1,0] },
  { id:"s7", trait:"stress",
    q:"你在現場被客人當面比較競爭對手說對方更好，你的反應是：",
    opts:["冷靜聆聽，找出客人真正的需求後針對優勢回應","有點慌，支支吾吾","直接說對方哪裡不好","沉默或把客人交給同事"],
    s:[4,2,1,0] },

  /* ─── 團隊協作 teamwork ─── */
  { id:"t1", trait:"teamwork",
    q:"你的業績已達標，而你知道同事今天差一單即可達標：",
    opts:["主動告知可能有需求的客人，幫助同事達標","這是他自己的事","競爭是好事，不需幫忙","如果方便就幫，不特別去做"],
    s:[4,0,1,2] },
  { id:"t2", trait:"teamwork",
    q:"同事因家庭緊急狀況需提早下班，請你臨時代班：",
    opts:["只要公司允許，願意協助","有點不方便但勉強答應","要看有沒有加班費再決定","拒絕，因為不是我的問題"],
    s:[4,3,1,0] },
  { id:"t3", trait:"teamwork",
    q:"你有好想法，但說出來可能讓負責的同事難看：",
    opts:["私下或婉轉方式表達，避免讓人難堪","直接在會議上說出來，好想法要說","不說了，免得製造麻煩","事後私下跟主管說，不在團隊中討論"],
    s:[4,2,0,1] },
  { id:"t4", trait:"teamwork",
    q:"你發現新同事處理客訴的方式有問題：",
    opts:["適當時機主動分享自己的做法，語氣友善","告訴主管讓主管去處理","不關我的事，他自己學","在群組說這個人沒有經驗"],
    s:[4,2,0,0] },
  { id:"t5", trait:"teamwork",
    q:"團隊達成重要業績里程碑，但你個人貢獻較少：",
    opts:["替團隊高興，思考下次如何貢獻更多","有點尷尬但參與慶祝","心裡不在乎，反正不是我的功勞","覺得應按貢獻比例分配獎勵"],
    s:[4,3,1,0] },
  { id:"t6", trait:"teamwork",
    q:"你和某位同事的工作風格差異很大，常造成摩擦：",
    opts:["主動找時間溝通了解彼此的做事方式，找共識","保持距離，各做各的","向主管反映希望調整搭班組合","默默在心裡抱怨對方"],
    s:[4,2,1,0] },
  { id:"t7", trait:"teamwork",
    q:"門市需要有人週末留下來參加總部稽查，沒有強制誰去：",
    opts:["主動詢問是否需要人手，若需要的話願意參加","等別人先表態","假裝沒看到這個通知","說自己有事沒辦法"],
    s:[4,2,0,1] },
];

// ── DISC 題庫 10 題（抽 8 題）──────────────────────────────────────────
const DISC_BANK = [
  { id:"dc1", q:"在工作場合，你最自然的角色是：", opts:[
    {t:"掌控者：帶頭衝刺，設定目標確保達成",d:"D"},
    {t:"激勵者：活絡氣氛，讓大家保持正向積極",d:"I"},
    {t:"支持者：穩定執行，確保每個環節不出錯",d:"S"},
    {t:"分析者：深度分析，找出最佳方案再行動",d:"C"}] },
  { id:"dc2", q:"面對業績壓力，你的第一反應是：", opts:[
    {t:"視為挑戰，激發更強烈的鬥志",d:"D"},
    {t:"找夥伴互相打氣，一起衝",d:"I"},
    {t:"按部就班，相信穩定才能長久",d:"S"},
    {t:"分析數據，找出差距的根本原因",d:"C"}] },
  { id:"dc3", q:"同事最可能這樣形容你：", opts:[
    {t:"果斷、有主見，說到做到",d:"D"},
    {t:"熱情開朗，讓人充滿能量",d:"I"},
    {t:"可靠踏實，永遠是大家的後盾",d:"S"},
    {t:"細心嚴謹，非常讓人放心",d:"C"}] },
  { id:"dc4", q:"你做決策時傾向：", opts:[
    {t:"快速決定，邊做邊修正",d:"D"},
    {t:"先感受這個方向對不對再決定",d:"I"},
    {t:"確認大家都能接受再往前走",d:"S"},
    {t:"收集充分資訊全面評估再決定",d:"C"}] },
  { id:"dc5", q:"進入新環境時，你最先做的事是：", opts:[
    {t:"評估機會，找到可以發揮的空間",d:"D"},
    {t:"認識更多人，建立人際關係",d:"I"},
    {t:"觀察現有流程，穩步融入",d:"S"},
    {t:"了解規則與標準，確保自己不踩錯",d:"C"}] },
  { id:"dc6", q:"你最擅長的溝通方式是：", opts:[
    {t:"直接有力，重點清晰",d:"D"},
    {t:"生動感性，容易感染他人",d:"I"},
    {t:"耐心穩重，讓對方感到被尊重",d:"S"},
    {t:"邏輯清晰，有條理地陳述事實",d:"C"}] },
  { id:"dc7", q:"面對變化與不確定性，你的感覺是：", opts:[
    {t:"充滿刺激，越變越好玩",d:"D"},
    {t:"有點興奮，期待和人討論新方向",d:"I"},
    {t:"有些不安，偏好穩定環境",d:"S"},
    {t:"需要更多資訊才能安心",d:"C"}] },
  { id:"dc8", q:"說服別人接受你的想法時，你會：", opts:[
    {t:"強調結果效益，直接告訴他這樣做最好",d:"D"},
    {t:"分享熱情和故事，讓他被感染",d:"I"},
    {t:"找對方需求，說明這方向對大家都好",d:"S"},
    {t:"提供詳細數據與邏輯，讓他無從反駁",d:"C"}] },
  { id:"dc9", q:"工作中你最有成就感的時刻是：", opts:[
    {t:"達成一個困難的目標",d:"D"},
    {t:"讓團隊氣氛變得很好",d:"I"},
    {t:"協助別人解決困難",d:"S"},
    {t:"找到一個問題的完美解法",d:"C"}] },
  { id:"dc10", q:"你最不能忍受的工作狀況是：", opts:[
    {t:"被過度微管理，無法自主決策",d:"D"},
    {t:"工作太孤立，沒有互動交流",d:"I"},
    {t:"頻繁的變動，缺乏穩定性",d:"S"},
    {t:"粗心的錯誤或缺乏品質標準",d:"C"}] },
];

// ══════════════════════════════════════════════════════════════════════
//  🧩  SUB-COMPONENTS
// ══════════════════════════════════════════════════════════════════════

function ProgressDots({ step, total }) {
  return (
    <div style={{ display:"flex", gap:6, alignItems:"center" }}>
      {Array.from({length:total}).map((_,i) => (
        <div key={i} style={{
          height: i === step ? 8 : 6,
          width:  i === step ? 24 : 6,
          borderRadius: 4,
          background: i < step ? T.green : i === step ? T.accent : T.border,
          transition:"all 0.3s ease"
        }} />
      ))}
    </div>
  );
}

function TraitBar({ trait, value }) {
  const m = TRAIT_META[trait];
  const Icon = m.icon;
  const grade = value >= 80 ? "優秀" : value >= 60 ? "良好" : value >= 40 ? "普通" : "待加強";
  const gradeColor = value >= 80 ? T.green : value >= 60 ? T.accent : value >= 40 ? T.gold : T.red;
  return (
    <div style={{ marginBottom:18 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <div style={{ width:28, height:28, borderRadius:8, background:`${m.color}15`,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <Icon size={14} color={m.color} />
          </div>
          <span style={{ fontSize:13, fontWeight:700, color:T.text }}>{m.label}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:gradeColor,
            background:`${gradeColor}12`, padding:"2px 8px", borderRadius:4 }}>{grade}</span>
          <span style={{ fontSize:15, fontWeight:900, color:m.color, minWidth:38, textAlign:"right" }}>{value}</span>
        </div>
      </div>
      <div style={{ height:9, background:T.inputBg, borderRadius:5, overflow:"hidden", border:`1px solid ${T.border}` }}>
        <div style={{
          height:"100%", width:`${value}%`,
          background:`linear-gradient(90deg,${m.color}70,${m.color})`,
          borderRadius:5, transition:"width 1.6s cubic-bezier(.25,.8,.25,1)"
        }} />
      </div>
    </div>
  );
}

function QuestionCard({ q, qi, total, answer, onAnswer, dim }) {
  return (
    <div style={{ background:T.surface, border:`1px solid ${T.border}`,
      borderRadius:16, padding:"22px 20px", marginBottom:14,
      boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:12 }}>
        {dim && (
          <span style={{ fontSize:11, fontWeight:700, color:TRAIT_META[dim]?.color ?? T.accent,
            background:`${TRAIT_META[dim]?.color ?? T.accent}12`,
            padding:"3px 10px", borderRadius:5 }}>
            {TRAIT_META[dim]?.label ?? dim}
          </span>
        )}
        <span style={{ fontSize:11, color:T.muted, marginLeft:"auto" }}>{qi+1} / {total}</span>
      </div>
      <p style={{ fontSize:15, fontWeight:600, lineHeight:1.65, color:T.text, margin:"0 0 16px" }}>
        {q}
      </p>
      {q.opts !== undefined ? null : null /* handled below */}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  🏠  MAIN COMPONENT
// ══════════════════════════════════════════════════════════════════════
const STEPS = ["基本資料","行為指標 (Part 1)","性格導向 (Part 2)","AI 診斷報告"];

export default function ManiTalentV3() {
  const [step, setStep]       = useState(0);
  const [form, setForm]       = useState({ name:"", position:"", experience:"", note:"" });
  const [active, setActive]   = useState({ behavior:[], disc:[] });
  const [bAns, setBAns]       = useState({});
  const [dAns, setDAns]       = useState({});
  const [result, setResult]         = useState(null);
  const [aiText, setAiText]         = useState("");
  const [aiLoading, setAiLoading]   = useState(false);
  const [analyzing, setAnalyzing]   = useState(false);
  const [showLog, setShowLog]       = useState(false);
  const [copied, setCopied]         = useState(false);
  const [gasStatus, setGasStatus]   = useState("idle"); // idle | saving | ok | err
  // ── 手動確認存儲相關 ──────────────────────────────────────────────
  const [interviewerNote, setInterviewerNote] = useState(""); // 面試官現場補充
  const [saveConfirmed, setSaveConfirmed]     = useState(false); // 是否已按下確認儲存
  const [savedRowId, setSavedRowId]           = useState(null);
  const topRef = useRef(null);

  // 初始化抽題
  useEffect(() => {
    const traits = Object.keys(TRAIT_META);
    let pool = [];
    traits.forEach(t => {
      const qs = BEHAVIOR_BANK.filter(q => q.trait === t).sort(() => Math.random()-0.5);
      pool.push(...qs.slice(0, 3)); // 每維度抽 3 題，共 18 題
    });
    setActive({
      behavior: pool.sort(() => Math.random()-0.5),
      disc: [...DISC_BANK].sort(() => Math.random()-0.5).slice(0, 8),
    });
  }, []);

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior:"smooth" });

  // ── 計分 ──────────────────────────────────────────────────────────
  function calcResult() {
    const totals = {}, maxes = {};
    Object.keys(TRAIT_META).forEach(t => { totals[t]=0; maxes[t]=0; });
    active.behavior.forEach(q => {
      const a = bAns[q.id];
      if (a !== undefined) { totals[q.trait] += q.s[a]; maxes[q.trait] += 4; }
    });
    const traitScores = {};
    Object.keys(TRAIT_META).forEach(t => {
      traitScores[t] = maxes[t] > 0 ? Math.round((totals[t]/maxes[t])*100) : 0;
    });
    const dc = { D:0, I:0, S:0, C:0 };
    active.disc.forEach(q => {
      const a = dAns[q.id];
      if (a !== undefined) dc[q.opts[a].d]++;
    });
    const primary = Object.entries(dc).sort((a,b)=>b[1]-a[1])[0][0];
    const discBonus = DISC_INFO[primary].weight;
    const avg = Object.values(traitScores).reduce((s,v)=>s+v,0)/6;
    const total = Math.round(avg*0.75 + discBonus*0.25);
    return { traitScores, dc, primary, total };
  }

  // ── GAS 寫入（單次，包含面試官補充）────────────────────────────
  async function saveToGAS(res, rowId) {
    if (GAS_URL.includes("替換")) { setGasStatus("idle"); return; }
    setGasStatus("saving");
    try {
      const payload = {
        action: "insertRecord",
        rowId,
        name:       form.name,
        position:   form.position,
        experience: form.experience,
        formNote:   form.note,
        interviewerNote: interviewerNote.trim() || "（無）",
        totalScore: res.total,
        disc:       res.primary,
        ...Object.fromEntries(Object.entries(res.traitScores).map(([k,v])=>[k,v])),
        aiReply:    aiText || "（未產出）",
        timestamp:  new Date().toISOString(),
      };
      await fetch(GAS_URL, {
        method:"POST",
        headers:{"Content-Type":"text/plain;charset=utf-8"},
        body: JSON.stringify(payload)
      });
      setGasStatus("ok");
    } catch(e) {
      setGasStatus("err");
    }
  }

  // ── Gemini 分析（透過 GAS 代理 / 僅傳分數，節省 token）────────────
  async function fetchGemini(res, _rowId) {
    if (aiText) return; // 已有報告就不重複呼叫
    setAiLoading(true);
    const scores = Object.entries(res.traitScores)
      .map(([k,v]) => `${TRAIT_META[k].label}:${v}`).join(" ");

    const prompt = `角色：馬尼通訊人資顧問。請繁體中文輸出，總字數≤180字。
求職者：${form.name}/${form.position}/年資${form.experience||"?"}年
行為分(滿分100)：${scores}
DISC:${res.primary}(${DISC_INFO[res.primary].label}) 總分:${res.total}/100
面試官觀察：${interviewerNote.trim()||"無"}
依序輸出：【核心優勢】【潛在風險】【面試追問】【錄用建議】各1~2行`;

    if (GAS_URL.includes("替換")) {
      await new Promise(r => setTimeout(r, 1000));
      const top2 = Object.entries(res.traitScores).sort((a,b)=>b[1]-a[1]).slice(0,2);
      const low1 = Object.entries(res.traitScores).sort((a,b)=>a[1]-b[1])[0];
      setAiText(
`【核心優勢】
• ${TRAIT_META[top2[0][0]].label} ${top2[0][1]}分、${TRAIT_META[top2[1][0]].label} ${top2[1][1]}分表現突出，具備主動性與執行力。
• DISC ${res.primary} 型（${DISC_INFO[res.primary].label}）：${DISC_INFO[res.primary].desc}。

【潛在風險】
• ${TRAIT_META[low1[0]].label} ${low1[1]}分偏低，建議面試時以情境題深入驗證。

【面試追問】
• 「遇到主管決策與你想法不同時，你如何處理？」
• 「說一個你在高壓狀況下仍達成目標的具體例子。」

【錄用建議】
${res.total >= 75 ? "✅ 建議列為優先人選，安排主管複試。" : res.total >= 60 ? "🔍 建議進入第二輪面試，重點確認低分維度。" : "⚠️ 暫不建議錄用，可保留資料待日後職缺。"}`
      );
      setAiLoading(false);
      return;
    }

    try {
      const resp = await fetch(GAS_URL, {
        method:"POST",
        headers:{"Content-Type":"text/plain;charset=utf-8"},
        body: JSON.stringify({ action:"geminiAnalyze", prompt })
      });
      const data = await resp.json();
      setAiText(data.reply || "分析完成，請查看各維度分數。");
    } catch(e) {
      setAiText(`AI 連線異常。\n系統摘要：${scores}\nDISC：${res.primary}型　總分：${res.total}/100`);
    }
    setAiLoading(false);
  }

  // ── 提交問卷：僅計分，不自動呼叫 Gemini / GAS ───────────────────
  async function handleAnalyze() {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 1000));
    const res = calcResult();
    setResult(res);
    setStep(3);
    scrollTop();
    setAnalyzing(false);
  }

  // ── 手動確認儲存（與 AI 完全獨立）──────────────────────────────
  async function handleConfirmSave() {
    if (saveConfirmed || !result) return;
    setSaveConfirmed(true);
    const rowId = `${form.name}_${Date.now()}`;
    setSavedRowId(rowId);
    await saveToGAS(result, rowId); // aiText 此時已是最新值（有或無皆可）
  }

  const canNext = () => {
    if (step===0) return form.name.trim() && form.position.trim() && form.experience;
    if (step===1) return Object.keys(bAns).length === active.behavior.length;
    if (step===2) return Object.keys(dAns).length === active.disc.length;
    return false;
  };

  const recommend = result ? (
    result.total >= 80 ? { label:"強力推薦錄用", color:T.green,  icon:"✅" } :
    result.total >= 65 ? { label:"建議面試複審", color:T.gold,   icon:"🔍" } :
                         { label:"暫不建議錄用", color:T.red,    icon:"⚠️" }
  ) : null;

  // ── STYLES ────────────────────────────────────────────────────────
  const inp = {
    width:"100%", padding:"12px 14px", borderRadius:10,
    background:T.inputBg, border:`1.5px solid ${T.inputBdr}`,
    color:T.text, fontSize:15, outline:"none",
    boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.2s"
  };
  const btn = (active, color=T.accent) => ({
    width:"100%", padding:"15px", borderRadius:12, border:"none",
    background: active ? color : T.border,
    color: active ? "#fff" : T.muted,
    fontWeight:800, fontSize:15, cursor:active?"pointer":"not-allowed",
    transition:"all 0.2s", fontFamily:"inherit",
    boxShadow: active ? `0 4px 16px ${color}30` : "none"
  });

  return (
    <div ref={topRef} style={{ minHeight:"100vh", background:T.bg,
      fontFamily:"'Noto Sans TC','Segoe UI',sans-serif", color:T.text }}>

      {/* ── Header ── */}
      <div style={{ background:"#fff", borderBottom:`1px solid ${T.border}`,
        padding:"14px 20px", display:"flex", justifyContent:"space-between",
        alignItems:"center", position:"sticky", top:0, zIndex:20,
        boxShadow:"0 1px 8px rgba(0,0,0,0.06)" }}>
        <div>
          <div style={{ fontSize:10, color:T.accent, letterSpacing:3, fontWeight:800, marginBottom:2 }}>
            MANI TELECOM · TALENT ASSESSMENT V3.1
          </div>
          <div style={{ fontSize:16, fontWeight:900, letterSpacing:0.3 }}>智慧人才評測系統</div>
        </div>
        <ProgressDots step={step} total={4} />
      </div>

      {/* ── Progress Bar ── */}
      <div style={{ height:3, background:T.border }}>
        <div style={{ height:"100%", width:`${(step/3)*100}%`,
          background:`linear-gradient(90deg,${T.accent},${T.purple})`,
          transition:"width 0.5s ease" }} />
      </div>

      <div style={{ maxWidth:660, margin:"0 auto", padding:"24px 16px 60px" }}>

        {/* ════ STEP 0: 基本資料 ════ */}
        {step===0 && (
          <div>
            <div style={{ textAlign:"center", padding:"16px 0 28px" }}>
              <div style={{ width:60, height:60, borderRadius:18,
                background:`${T.accent}12`, display:"flex", alignItems:"center",
                justifyContent:"center", margin:"0 auto 14px" }}>
                <Users size={30} color={T.accent} />
              </div>
              <h1 style={{ fontSize:22, fontWeight:900, margin:"0 0 6px" }}>應徵者基本資料</h1>
              <p style={{ fontSize:13, color:T.muted, margin:0 }}>
                評測內容：6 大行為維度 × 18 題 ＋ DISC 性格 × 8 題
              </p>
            </div>
            <div style={{ background:T.surface, border:`1px solid ${T.border}`,
              borderRadius:20, padding:26, boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
              {[
                { key:"name",     label:"求職者姓名 *",   ph:"請輸入完整姓名" },
                { key:"position", label:"應徵職位 *",     ph:"例：門市業務專員" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom:16 }}>
                  <label style={{ fontSize:13, color:T.sub, fontWeight:600,
                    display:"block", marginBottom:6 }}>{f.label}</label>
                  <input style={inp} value={form[f.key]}
                    onChange={e=>setForm({...form,[f.key]:e.target.value})} placeholder={f.ph} />
                </div>
              ))}
              <div style={{ marginBottom:16 }}>
                <label style={{ fontSize:13, color:T.sub, fontWeight:600,
                  display:"block", marginBottom:6 }}>相關工作年資 *</label>
                <select style={inp} value={form.experience}
                  onChange={e=>setForm({...form,experience:e.target.value})}>
                  <option value="">請選擇</option>
                  <option value="0">無經驗（應屆/全新）</option>
                  <option value="1">1 年以下</option>
                  <option value="3">1–3 年</option>
                  <option value="5">3 年以上</option>
                </select>
              </div>
              <div style={{ marginBottom:26 }}>
                <label style={{ fontSize:13, color:T.sub, fontWeight:600,
                  display:"block", marginBottom:6 }}>面試官備註（選填）</label>
                <textarea style={{...inp, height:78, resize:"vertical"}}
                  value={form.note} onChange={e=>setForm({...form,note:e.target.value})}
                  placeholder="可記錄初步觀察或特殊狀況" />
              </div>
              <button style={btn(canNext())} disabled={!canNext()}
                onClick={()=>{ setStep(1); scrollTop(); }}>
                開始評測 →
              </button>
            </div>
          </div>
        )}

        {/* ════ STEP 1: 行為指標 ════ */}
        {step===1 && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:20 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ background:`${T.accent}12`, color:T.accent,
                    padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:800 }}>
                    Part 1 / 2
                  </span>
                  <span style={{ fontWeight:800, fontSize:15 }}>核心行為指標</span>
                </div>
                <span style={{ fontSize:12, color:T.muted }}>
                  已作答 {Object.keys(bAns).length} / {active.behavior.length} 題
                </span>
              </div>
              <div style={{ width:44, height:44, borderRadius:12,
                background:`${T.accent}12`, display:"flex",
                alignItems:"center", justifyContent:"center" }}>
                <ClipboardList size={22} color={T.accent} />
              </div>
            </div>

            {active.behavior.map((q, qi) => {
              const sel = bAns[q.id];
              return (
                <div key={q.id} style={{ background:T.surface,
                  border:`1px solid ${sel !== undefined ? T.border : T.border}`,
                  borderRadius:16, padding:"20px 18px", marginBottom:12,
                  boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:10 }}>
                    <span style={{ fontSize:11, fontWeight:700,
                      color: TRAIT_META[q.trait]?.color ?? T.accent,
                      background:`${TRAIT_META[q.trait]?.color ?? T.accent}12`,
                      padding:"3px 10px", borderRadius:5 }}>
                      {TRAIT_META[q.trait]?.label}
                    </span>
                    <span style={{ fontSize:11, color:T.muted }}>{qi+1} / {active.behavior.length}</span>
                  </div>
                  <p style={{ fontSize:14.5, fontWeight:600, lineHeight:1.65,
                    color:T.text, margin:"0 0 14px" }}>{q.q}</p>
                  {q.opts.map((opt, oi) => {
                    const chosen = sel === oi;
                    return (
                      <div key={oi} onClick={()=>setBAns({...bAns,[q.id]:oi})}
                        style={{ padding:"11px 14px", borderRadius:10, marginBottom:7,
                          cursor:"pointer", display:"flex", gap:10, alignItems:"flex-start",
                          border:`1.5px solid ${chosen ? T.accent : T.border}`,
                          background: chosen ? `${T.accent}0D` : T.inputBg,
                          transition:"all 0.15s", transform:chosen?"translateX(3px)":"none" }}>
                        <div style={{ minWidth:22, height:22, borderRadius:"50%",
                          border:`2px solid ${chosen ? T.accent : T.muted}`,
                          background: chosen ? T.accent : "transparent",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          flexShrink:0, marginTop:1 }}>
                          {chosen
                            ? <CheckCircle2 size={13} color="#fff" />
                            : <span style={{ fontSize:10, fontWeight:800, color:T.muted }}>
                                {["A","B","C","D"][oi]}
                              </span>}
                        </div>
                        <span style={{ fontSize:13.5, color:T.text, lineHeight:1.5 }}>{opt}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            <button style={btn(canNext())} disabled={!canNext()}
              onClick={()=>{ setStep(2); scrollTop(); }}>
              下一階段：性格導向 →
            </button>
          </div>
        )}

        {/* ════ STEP 2: DISC ════ */}
        {step===2 && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:20 }}>
              <div>
                <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                  <span style={{ background:`${T.gold}15`, color:T.gold,
                    padding:"3px 12px", borderRadius:20, fontSize:12, fontWeight:800 }}>
                    Part 2 / 2
                  </span>
                  <span style={{ fontWeight:800, fontSize:15 }}>性格導向分析</span>
                </div>
                <span style={{ fontSize:12, color:T.muted }}>
                  已作答 {Object.keys(dAns).length} / {active.disc.length} 題
                </span>
              </div>
              <div style={{ width:44, height:44, borderRadius:12,
                background:`${T.gold}15`, display:"flex",
                alignItems:"center", justifyContent:"center" }}>
                <Star size={22} color={T.gold} />
              </div>
            </div>

            {active.disc.map((q, qi) => {
              const sel = dAns[q.id];
              return (
                <div key={q.id} style={{ background:T.surface,
                  border:`1px solid ${T.border}`, borderRadius:16,
                  padding:"20px 18px", marginBottom:12,
                  boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:10 }}>
                    <span style={{ fontSize:11, fontWeight:700, color:T.gold,
                      background:`${T.gold}15`, padding:"3px 10px", borderRadius:5 }}>
                      DISC
                    </span>
                    <span style={{ fontSize:11, color:T.muted }}>{qi+1} / {active.disc.length}</span>
                  </div>
                  <p style={{ fontSize:14.5, fontWeight:600, lineHeight:1.65,
                    color:T.text, margin:"0 0 14px" }}>{q.q}</p>
                  {q.opts.map((opt, oi) => {
                    const chosen = sel === oi;
                    return (
                      <div key={oi} onClick={()=>setDAns({...dAns,[q.id]:oi})}
                        style={{ padding:"11px 14px", borderRadius:10, marginBottom:7,
                          cursor:"pointer", display:"flex", gap:10, alignItems:"flex-start",
                          border:`1.5px solid ${chosen ? T.gold : T.border}`,
                          background: chosen ? `${T.gold}0D` : T.inputBg,
                          transition:"all 0.15s", transform:chosen?"translateX(3px)":"none" }}>
                        <div style={{ minWidth:22, height:22, borderRadius:"50%",
                          border:`2px solid ${chosen ? T.gold : T.muted}`,
                          background: chosen ? T.gold : "transparent",
                          display:"flex", alignItems:"center", justifyContent:"center",
                          flexShrink:0, marginTop:1 }}>
                          {chosen
                            ? <CheckCircle2 size={13} color="#fff" />
                            : <span style={{ fontSize:10, fontWeight:800, color:T.muted }}>
                                {["A","B","C","D"][oi]}
                              </span>}
                        </div>
                        <span style={{ fontSize:13.5, color:T.text, lineHeight:1.5 }}>{opt.t}</span>
                      </div>
                    );
                  })}
                </div>
              );
            })}

            <button style={btn(canNext() && !analyzing, T.orange)}
              disabled={!canNext() || analyzing} onClick={handleAnalyze}>
              {analyzing
                ? <span style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
                    <Loader2 size={18} style={{ animation:"spin 1s linear infinite" }} />
                    計算分數中...
                  </span>
                : <span style={{ display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
                    📊 提交問卷，查看評測結果
                  </span>}
            </button>
            <div style={{ textAlign:"center", fontSize:11.5, color:T.muted, marginTop:10, lineHeight:1.6 }}>
              提交後可自行選擇是否產出 AI 報告與儲存，兩者互相獨立
            </div>
          </div>
        )}

        {/* ════ STEP 3: 結果頁（三段分離設計）════ */}
        {step===3 && result && (
          <div>
            {/* 流程提示列 */}
            <div style={{ display:"flex", gap:8, marginBottom:18, fontSize:12,
              background:T.surface, border:`1px solid ${T.border}`,
              borderRadius:14, padding:"12px 16px", alignItems:"center",
              flexWrap:"wrap", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
              <span style={{ color:T.green, fontWeight:800, whiteSpace:"nowrap" }}>① 分數已計算 ✓</span>
              <span style={{ color:T.border }}>──</span>
              <span style={{ color: aiText ? T.green : T.muted, fontWeight:700, whiteSpace:"nowrap" }}>
                {aiText ? "② AI 報告已產出 ✓" : "② AI 報告（選擇性）"}
              </span>
              <span style={{ color:T.border }}>──</span>
              <span style={{ color: saveConfirmed ? T.green : T.muted, fontWeight:700, whiteSpace:"nowrap" }}>
                {saveConfirmed ? "③ 已儲存 ✓" : "③ 儲存紀錄（選擇性）"}
              </span>
            </div>

            {/* ── ① 總分 + 六大維度（立即顯示，不耗 API）── */}
            <div style={{ background:T.surface, border:`1px solid ${T.border}`,
              borderRadius:20, padding:28, textAlign:"center", marginBottom:16,
              boxShadow:"0 2px 16px rgba(0,0,0,0.06)", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:5,
                background:`linear-gradient(90deg,${T.accent},${T.purple})` }} />
              <div style={{ fontSize:12, color:T.muted, marginBottom:6, marginTop:6 }}>
                {form.name} · {form.position} · 年資 {form.experience||"—"} 年
              </div>
              <div style={{ fontSize:72, fontWeight:900, lineHeight:1, letterSpacing:-3,
                color:T.text, marginBottom:10 }}>
                {result.total}
                <span style={{ fontSize:22, color:T.muted, fontWeight:400 }}>/100</span>
              </div>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8,
                padding:"8px 22px", borderRadius:30,
                background:`${recommend.color}14`, color:recommend.color,
                fontSize:15, fontWeight:800 }}>
                {recommend.icon} {recommend.label}
              </div>
            </div>

            {/* 六大維度 */}
            <div style={{ background:T.surface, border:`1px solid ${T.border}`,
              borderRadius:20, padding:24, marginBottom:16,
              boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
              <h3 style={{ fontSize:13, fontWeight:800, marginBottom:18, color:T.sub,
                display:"flex", alignItems:"center", gap:8, margin:"0 0 18px" }}>
                <TrendingUp size={16} color={T.accent} /> 六大核心行為維度
              </h3>
              {Object.entries(result.traitScores).map(([k,v]) => (
                <TraitBar key={k} trait={k} value={v} />
              ))}
            </div>

            {/* DISC 卡 */}
            <div style={{ background:T.surface, border:`1px solid ${T.border}`,
              borderRadius:20, padding:20, marginBottom:16, display:"flex",
              alignItems:"center", gap:16, boxShadow:"0 2px 12px rgba(0,0,0,0.04)" }}>
              <div style={{ width:64, height:64, borderRadius:16, background:T.gold,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:28, fontWeight:900, color:"#fff", flexShrink:0 }}>
                {result.primary}
              </div>
              <div>
                <div style={{ fontWeight:900, fontSize:15, marginBottom:3 }}>
                  {DISC_INFO[result.primary].animal}　{DISC_INFO[result.primary].label}
                </div>
                <div style={{ fontSize:12.5, color:T.sub, lineHeight:1.5 }}>
                  {DISC_INFO[result.primary].desc}
                </div>
                <div style={{ fontSize:11, color:T.muted, marginTop:5 }}>
                  D:{result.dc.D} · I:{result.dc.I} · S:{result.dc.S} · C:{result.dc.C}
                </div>
              </div>
            </div>

            {/* 答題記錄（可展開）*/}
            <div style={{ background:T.surface, border:`1px solid ${T.border}`,
              borderRadius:20, padding:20, marginBottom:20,
              boxShadow:"0 1px 6px rgba(0,0,0,0.03)" }}>
              <button onClick={()=>setShowLog(!showLog)}
                style={{ width:"100%", background:"none", border:"none", cursor:"pointer",
                  display:"flex", justifyContent:"space-between", alignItems:"center",
                  fontFamily:"inherit" }}>
                <span style={{ fontSize:13, fontWeight:700, color:T.sub,
                  display:"flex", alignItems:"center", gap:8 }}>
                  <ClipboardList size={15} color={T.muted} /> 查看詳細答題記錄
                </span>
                {showLog ? <ChevronUp size={16} color={T.muted}/> : <ChevronDown size={16} color={T.muted}/>}
              </button>
              {showLog && (
                <div style={{ marginTop:14 }}>
                  {active.behavior.map((q, qi) => {
                    const a = bAns[q.id];
                    const sc = a !== undefined ? q.s[a] : null;
                    const scColor = sc >= 3 ? T.green : sc >= 2 ? T.gold : T.red;
                    return (
                      <div key={q.id} style={{ padding:"10px 0",
                        borderBottom:`1px solid ${T.border}`, fontSize:12 }}>
                        <div style={{ color:T.muted, marginBottom:3 }}>
                          Q{qi+1}. [{TRAIT_META[q.trait]?.label}] {q.q}
                        </div>
                        <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                          <span style={{ color:T.text, fontWeight:600 }}>
                            {a !== undefined ? `→ ${q.opts[a]}` : "（未作答）"}
                          </span>
                          {sc !== null && (
                            <span style={{ fontSize:11, fontWeight:800, color:scColor,
                              background:`${scColor}14`, padding:"1px 7px", borderRadius:4 }}>
                              {sc} 分
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ── ② AI 報告區（手動觸發，獨立於儲存）── */}
            <div style={{ background:T.surface, border:`1.5px solid ${T.accent}28`,
              borderRadius:20, padding:24, marginBottom:16,
              boxShadow:"0 2px 16px rgba(29,111,232,0.05)" }}>
              <div style={{ display:"flex", justifyContent:"space-between",
                alignItems:"center", marginBottom: aiText ? 14 : 0 }}>
                <h3 style={{ fontSize:13, fontWeight:800, margin:0,
                  display:"flex", alignItems:"center", gap:8, color:T.sub }}>
                  <BrainCircuit size={16} color={T.accent}/> Gemini AI 人資顧問診斷
                </h3>
                {aiText && !aiLoading && (
                  <button onClick={()=>{
                    navigator.clipboard.writeText(aiText);
                    setCopied(true); setTimeout(()=>setCopied(false),2000);
                  }} style={{ background:T.inputBg, border:`1px solid ${T.border}`,
                    borderRadius:8, padding:"4px 10px", cursor:"pointer", fontSize:11,
                    color:T.sub, display:"flex", gap:5, alignItems:"center", fontFamily:"inherit" }}>
                    <Copy size={11}/> {copied ? "已複製" : "複製評語"}
                  </button>
                )}
              </div>

              {/* 尚未觸發 AI */}
              {!aiText && !aiLoading && (
                <div style={{ marginTop:14 }}>
                  <div style={{ fontSize:12.5, color:T.muted, lineHeight:1.6,
                    background:T.inputBg, borderRadius:10, padding:"12px 14px",
                    marginBottom:14, borderLeft:`3px solid ${T.border}` }}>
                    💡 AI 報告尚未產出。看完分數後，若需要 AI 深度分析再點下方按鈕，每次呼叫消耗 Gemini 額度。
                  </div>
                  <button onClick={()=>fetchGemini(result, savedRowId)}
                    style={{ width:"100%", padding:"13px", borderRadius:12, border:"none",
                      background:`linear-gradient(135deg,${T.accent},${T.purple})`,
                      color:"#fff", fontWeight:800, fontSize:14, cursor:"pointer",
                      fontFamily:"inherit", boxShadow:`0 4px 14px ${T.accent}30` }}>
                    🤖 產出 AI 診斷報告（消耗 Gemini 額度）
                  </button>
                </div>
              )}

              {/* AI 產生中 */}
              {aiLoading && (
                <div style={{ display:"flex", alignItems:"center", gap:10,
                  padding:"16px 0", color:T.muted, fontSize:13, marginTop:10 }}>
                  <Loader2 size={18} color={T.accent} style={{ animation:"spin 1s linear infinite" }}/>
                  正在呼叫 Gemini API，請稍候...
                </div>
              )}

              {/* AI 報告內容 */}
              {aiText && !aiLoading && (
                <div style={{ fontSize:13.5, lineHeight:1.85, color:T.text,
                  whiteSpace:"pre-wrap", background:T.inputBg, padding:16,
                  borderRadius:12, borderLeft:`4px solid ${T.accent}`, marginTop:14 }}>
                  {aiText}
                </div>
              )}
            </div>

            {/* ── ③ 面試官補充 + 確認儲存（完全獨立）── */}
            <div style={{ background: saveConfirmed ? `${T.green}08` : T.surface,
              border:`1.5px solid ${saveConfirmed ? T.green : T.border}`,
              borderRadius:20, padding:24, marginBottom:20,
              boxShadow:"0 2px 12px rgba(0,0,0,0.04)",
              transition:"border-color 0.3s, background 0.3s" }}>

              <h3 style={{ fontSize:13, fontWeight:800, margin:"0 0 14px",
                display:"flex", alignItems:"center", gap:8, color:T.sub }}>
                💾 儲存至 Google Sheets
              </h3>

              {!saveConfirmed ? (
                <>
                  <div style={{ marginBottom:14 }}>
                    <label style={{ fontSize:12, color:T.muted, display:"block",
                      marginBottom:6, fontWeight:600 }}>
                      面試官現場補充觀察（選填，將一併存入紀錄）
                    </label>
                    <textarea
                      value={interviewerNote}
                      onChange={e=>setInterviewerNote(e.target.value)}
                      placeholder="例：應答流暢、眼神接觸良好、對薪資期望合理..."
                      style={{ ...inp, height:80, resize:"vertical", fontSize:13 }}
                    />
                  </div>
                  <div style={{ fontSize:11.5, color:T.muted, lineHeight:1.6,
                    background:T.inputBg, borderRadius:8, padding:"10px 12px",
                    marginBottom:14, borderLeft:`3px solid ${T.border}` }}>
                    ⚠️ 儲存與 AI 報告互相獨立。可以只儲存分數（不產出 AI），也可以只看 AI 報告（不儲存）。按下後資料將寫入 Google Sheets，無法自動復原。
                  </div>
                  <button onClick={handleConfirmSave}
                    style={{ width:"100%", padding:"13px", borderRadius:12, border:"none",
                      background:T.green, color:"#fff", fontWeight:800, fontSize:14,
                      cursor:"pointer", fontFamily:"inherit",
                      boxShadow:`0 4px 14px ${T.green}30` }}>
                    ✅ 確認儲存這筆面試紀錄
                  </button>
                </>
              ) : (
                <div>
                  <div style={{ display:"flex", alignItems:"center", gap:10,
                    color:T.green, fontWeight:700, fontSize:14, marginBottom:8 }}>
                    <CheckCircle2 size={20}/> 已成功儲存至 Google Sheets
                  </div>
                  {gasStatus==="err" && (
                    <div style={{ fontSize:12, color:T.red, marginTop:4 }}>
                      ⚠️ Sheets 連線異常，請確認 GAS 網址設定。
                    </div>
                  )}
                  {interviewerNote.trim() && (
                    <div style={{ fontSize:12, color:T.muted, marginTop:8,
                      background:T.inputBg, padding:"8px 12px", borderRadius:8 }}>
                      面試官備注已一併存入：「{interviewerNote.trim()}」
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 重新開始 */}
            <button onClick={()=>window.location.reload()}
              style={{ width:"100%", padding:14, borderRadius:12, cursor:"pointer",
                background:"transparent", border:`1.5px solid ${T.border}`,
                color:T.muted, fontWeight:700, fontFamily:"inherit",
                display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <RotateCcw size={14}/> 重新開始評測
            </button>
          </div>
        )}

      </div>

      {/* Footer */}
      <div style={{ textAlign:"center", padding:"16px 0 24px",
        fontSize:11, color:T.muted, borderTop:`1px solid ${T.border}` }}>
        © 馬尼通訊 人資系統 · 行為科學評測 V3.1 · 題庫 {BEHAVIOR_BANK.length} 題 ＋ DISC {DISC_BANK.length} 題
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  );
}

