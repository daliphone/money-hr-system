import React, { useState, useEffect } from "react";
import { Users, Target, MessageSquare, TrendingUp, ChevronRight, ClipboardCheck, BrainCircuit, Award, AlertCircle, Loader2, UserCheck, Trash2, Settings2, PlusCircle, Database } from "lucide-react";

// ─── 雙軌佈景主題引擎 (Dual-Theme Engine) ────────────────────────────────────
const THEMES = {
  dark: {
    bg: "#0A0E1A", card: "#1a2235", border: "#2a3a55",
    accent: "#00D4FF", gold: "#FFB800", green: "#00E676",
    red: "#FF4444", orange: "#FF6B35", text: "#E8F4FD", muted: "#7a99bb",
    purple: "#B388FF", inputBg: "#0d1829", inputBorder: "#2a3a55",
    headerBg: "linear-gradient(135deg,#0d1829,#0a1520)",
    btnText: "#000", overlay: "rgba(0,0,0,0.85)"
  },
  light: {
    bg: "#F8FAFC", card: "#FFFFFF", border: "#E2E8F0",
    accent: "#0284C7", gold: "#D97706", green: "#059669",
    red: "#DC2626", orange: "#EA580C", text: "#0F172A", muted: "#64748B",
    purple: "#7C3AED", inputBg: "#F1F5F9", inputBorder: "#CBD5E1",
    headerBg: "linear-gradient(135deg,#FFFFFF,#F8FAFC)",
    btnText: "#FFF", overlay: "rgba(255,255,255,0.85)"
  }
};

// --- 配置區 ---
// 【極度重要】請將剛剛重新部署的 GAS 網址貼在這裡，覆蓋掉原有的字串！
const GAS_WEB_APP_URL = "https://script.google.com/macros/s/AKfycby5S12hnwnrwp0ghbfS5PfqFMS3LBwe7wpQCLsV3sQGw6CQ2Z5mdQEfVtql4Ai4-hI9/exec"; 

// ─── 官方預設題庫 (Official Banks) ───────────────────────────────────────────
const COMPETENCY_BANK = [
  { id:"c1",  dim:"溝通協調", q:"當兩位同事對同一客訴處理方式意見分歧時，你會：", options:["傾聽雙方，找出共識並提出折衷方案","請主管裁決，避免自己介入","選擇支持較有經驗的同事","先安撫客戶，事後再討論內部分歧"], scores:[4,1,2,3] },
  { id:"c2",  dim:"問題解決", q:"POS 系統突然當機，排隊客人越來越多，你的第一反應是：", options:["立即告知主管並嘗試重啟系統，同時安撫客戶","請客人稍等，一直等待系統自行恢復","請同事代為處理，自己暫時迴避","直接關閉門市暫停服務"], scores:[4,1,2,0] },
  { id:"c3",  dim:"顧客服務", q:"客戶要求退貨，但已超過退換貨期限，你會：", options:["說明政策同時表達理解，提供可行替代方案","直接拒絕，規定就是規定","私自答應退貨，事後再說","叫客人去找主管解決"], scores:[4,1,0,2] },
  { id:"c4",  dim:"商品銷售", q:"客戶說「我只是看看」時，你會如何應對？", options:["給予空間，觀察適機主動介紹符合需求的商品","立刻熱情推薦最貴的方案","讓客人自行瀏覽，不打擾","詢問預算後立刻報價"], scores:[4,2,1,3] },
  { id:"c5",  dim:"POS操作", q:"關於 POS 系統，下列何者描述最正確？", options:["可用於庫存管理、交易記錄與客戶資料查詢","只能用來結帳收款","每天下班前不需要做結帳對帳","所有折扣都可以員工自行輸入"], scores:[4,1,0,0] },
];

const DISC_BANK = [
  { id:"d1",  q:"描述你在工作中最自然的狀態：", options:[{text:"積極主導，設定目標並帶領團隊達成",type:"D"},{text:"活潑開朗，擅長激勵他人、帶動氣氛",type:"I"},{text:"穩定支持，確保流程順暢和諧",type:"S"},{text:"謹慎分析，注重細節與標準流程",type:"C"}] },
  { id:"d2",  q:"面對業績壓力時，你通常：", options:[{text:"視為挑戰，激發我更強烈的鬥志",type:"D"},{text:"找同事打氣，保持正向能量繼續衝",type:"I"},{text:"按既有方式穩定執行，盡力而為",type:"S"},{text:"分析未達標原因，系統性調整策略",type:"C"}] },
  { id:"d3",  q:"你最享受工作中的哪個面向？", options:[{text:"達成高難度目標，拿到豐厚獎金",type:"D"},{text:"與客戶建立關係，讓他們開心而來",type:"I"},{text:"維持穩定的工作節奏與良好的團隊關係",type:"S"},{text:"精確完成每個流程，確保零誤差",type:"C"}] },
  { id:"d4",  q:"同事形容你最可能的評語是：", options:[{text:"「做事果斷，有魄力，不怕得罪人」",type:"D"},{text:"「超有活力，跟他在一起很快樂」",type:"I"},{text:"「可靠穩重，永遠是大家的後盾」",type:"S"},{text:"「非常細心，做事有條理很讓人放心」",type:"C"}] },
  { id:"d5",  q:"面對突發狀況，你的本能反應是：", options:[{text:"立即掌握局面，決定行動方向",type:"D"},{text:"找人商量，用熱情說服大家一起解決",type:"I"},{text:"按照既有 SOP 冷靜處理",type:"S"},{text:"先蒐集資訊，確認最佳方案再行動",type:"C"}] },
  { id:"d6",  q:"你覺得哪種主管風格最能激勵你？", options:[{text:"給予明確目標與充分授權，不囉嗦",type:"D"},{text:"常常鼓勵我、表揚我的成果",type:"I"},{text:"穩定、公平、不會突然改變方向",type:"S"},{text:"邏輯清晰，決策有憑有據",type:"C"}] },
  { id:"d7",  q:"在團隊會議中，你通常扮演什麼角色？", options:[{text:"主導討論，快速拍板決策",type:"D"},{text:"活躍氣氛，讓大家都參與進來",type:"I"},{text:"默默支持，確保每個人的意見被聽到",type:"S"},{text:"整理資料，提出有邏輯的分析",type:"C"}] },
  { id:"d8",  q:"什麼樣的獎勵最能激勵你努力工作？", options:[{text:"升遷機會與更大的責任和權力",type:"D"},{text:"公開表揚，讓大家知道我的貢獻",type:"I"},{text:"穩定加薪與工作保障",type:"S"},{text:"學習成長的機會與專業認可",type:"C"}] },
  { id:"d9",  q:"下班後你最可能做什麼？", options:[{text:"研究如何讓明天業績更好",type:"D"},{text:"約朋友出去玩，充電社交",type:"I"},{text:"回家好好休息，享受平靜",type:"S"},{text:"整理今天的工作筆記，準備明天",type:"C"}] },
  { id:"d10", q:"遇到與客戶意見衝突時，你會：", options:[{text:"直接說明立場，堅持正確的做法",type:"D"},{text:"用親切方式說服對方，讓氣氛保持好",type:"I"},{text:"保持耐心，嘗試找到雙方都能接受的方式",type:"S"},{text:"用數據與事實說明，讓對方信服",type:"C"}] },
];

const SITUATIONAL_BANK = [
  { id:"s1",  q:"繁忙時段同時有三位客人需要服務，你的處理方式：", options:["快速評估各客人需求急迫性，依序服務並告知等待時間","只專注服務第一位客人到完成","請所有人等待，等一個忙完再接下一個","立刻請主管支援，自己繼續手邊工作"], scores:[4,1,0,2] },
  { id:"s2",  q:"客戶抱怨手機方案費用太貴，想取消合約，你會：", options:["了解使用習慣後推薦更適合的方案，主動創造留客機會","直接說「這是公司規定的價格，我也沒辦法」","立刻幫客戶辦理取消手續","給予大量折扣以挽留客戶"], scores:[4,1,0,2] },
  { id:"s3",  q:"你發現同事私下給予客戶不符規定的優惠，你會：", options:["私下告知同事此行為不妥，必要時回報主管","假裝沒看到，這不干我的事","直接在客戶面前糾正同事","馬上去跟主管舉報"], scores:[4,0,1,2] },
];

function pickRandom(arr, n) {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, Math.min(n, arr.length));
}

// ─── 子組件 ────────────────────────────────────────────────────────────────

// 圓形分數動畫組件
function CircleScore({ score, colors }) {
  const [p, setP] = useState(0);
  useEffect(() => { setTimeout(() => setP(score), 400); }, [score]);
  const activeColor = score >= 80 ? colors.green : score >= 60 ? colors.gold : colors.red;
  const r = 52, circ = 2 * Math.PI * r;
  return (
    <div style={{ position:"relative", width:130, height:130 }}>
      <svg width={130} height={130} style={{ transform:"rotate(-90deg)" }}>
        <circle cx={65} cy={65} r={r} fill="none" stroke={colors.border} strokeWidth={10} />
        <circle cx={65} cy={65} r={r} fill="none" stroke={activeColor} strokeWidth={10}
          strokeDasharray={circ} strokeDashoffset={circ-(p/100)*circ} strokeLinecap="round"
          style={{ transition:"stroke-dashoffset 1.5s cubic-bezier(0.4,0,0.2,1)", filter:`drop-shadow(0 0 6px ${activeColor})` }} />
      </svg>
      <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
        <div style={{ fontSize:32, fontWeight:900, color:activeColor, lineHeight:1 }}>{p}</div>
        <div style={{ fontSize:11, color:colors.muted }}>/ 100</div>
      </div>
    </div>
  );
}

// 測驗卡片組件
function QuestionBlock({ questions, answers, setAnswers, colorKey, colors }) {
  const color = { competency:colors.accent, disc:colors.gold, situational:colors.orange }[colorKey];
  const discColor = { D:"#FF6B35", I:"#FFD700", S:"#4CAF50", C:"#7B5EA7" };
  return questions.map((q, qi) => (
    <div key={q.id} style={{ background:colors.card, border:`1px solid ${colors.border}`, borderRadius:16, padding:"22px 26px", marginBottom:14 }}>
      <div style={{ display:"flex", gap:8, marginBottom:10 }}>
        {q.dim && <span style={{ background:`${color}22`, color, borderRadius:6, padding:"2px 10px", fontSize:12, fontWeight:600 }}>{q.dim}</span>}
        {q._custom && <span style={{ background:`${colors.purple}22`, color:colors.purple, borderRadius:6, padding:"2px 10px", fontSize:12, fontWeight:700 }}>★ HR 自訂題</span>}
      </div>
      <div style={{ fontSize:15, fontWeight:600, marginBottom:16, lineHeight:1.6, color:colors.text }}>Q{qi+1}. {q.q}</div>
      {q.options.map((opt, oi) => {
        const label = typeof opt === "object" ? opt.text : opt;
        const dtype = typeof opt === "object" ? opt.type : null;
        const sel = answers[q.id] === oi;
        return (
          <div key={oi} onClick={() => setAnswers({ ...answers, [q.id]: oi })}
            style={{ padding:"12px 16px", borderRadius:10, marginBottom:8, cursor:"pointer", display:"flex", gap:8, alignItems:"center", border:`1px solid ${sel ? color : colors.border}`, background: sel ? `${color}18` : colors.inputBg, fontSize:14, transition:"all 0.2s" }}>
            {dtype && <span style={{ color:discColor[dtype], fontWeight:800, fontSize:12, minWidth:18 }}>{dtype}</span>}
            <span style={{ color: sel ? color : colors.muted, fontWeight:700, flexShrink:0 }}>{["A","B","C","D"][oi]}.</span>
            <span style={{ color:colors.text }}>{label}</span>
          </div>
        );
      })}
    </div>
  ));
}

// ─── HR 題庫自訂編輯器 (The HR Studio) ─────────────────────────────────────────
function QuestionEditor({ type, customQuestions, setCustomQuestions, onClose, colors }) {
  const META = {
    competency: { label:"職能測驗", color:colors.accent, icon: <Award size={18}/> },
    situational:{ label:"情境模擬", color:colors.orange, icon: <MessageSquare size={18}/> },
  };
  const { label, color, icon } = META[type];
  const [q, setQ] = useState("");
  const [dim, setDim] = useState("門市實務");
  const [options, setOptions] = useState(["","","",""]);
  const [scores, setScores] = useState([0,0,0,0]);
  const [err, setErr] = useState("");

  function add() {
    if (!q.trim()) { setErr("請輸入題目內容"); return; }
    if (options.some(o => !o.trim())) { setErr("請填寫四個完整選項"); return; }
    
    const newQ = {
      id: `custom_${type}_${Date.now()}`, 
      _custom: true, 
      q,
      ...(type === "competency" ? { dim, options:[...options], scores:[...scores] } : { options:[...options], scores:[...scores] })
    };
    
    setCustomQuestions(prev => ({ ...prev, [type]: [...(prev[type]||[]), newQ] }));
    setQ(""); setOptions(["","","",""]); setScores([0,0,0,0]); setErr("");
  }

  function remove(id) {
    setCustomQuestions(prev => ({ ...prev, [type]: prev[type].filter(x => x.id !== id) }));
  }

  const list = customQuestions[type] || [];
  const inp = { width:"100%", padding:"10px 14px", borderRadius:8, background:colors.inputBg, border:`1px solid ${colors.inputBorder}`, color:colors.text, fontSize:14, outline:"none", boxSizing:"border-box" };

  return (
    <div style={{ position:"fixed", inset:0, background:colors.overlay, zIndex:200, overflowY:"auto", display:"flex", justifyContent:"center", padding:"24px 16px", animation: "fadeIn 0.2s ease" }}>
      <div style={{ width:"100%", maxWidth:600 }}>
        
        {/* 編輯器面板 */}
        <div style={{ background:colors.card, border:`1px solid ${color}44`, borderRadius:16, padding:"24px", marginBottom:16, boxShadow:`0 10px 30px rgba(0,0,0,0.1)` }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20, paddingBottom:16, borderBottom:`1px solid ${colors.border}` }}>
            <div style={{ fontSize:18, fontWeight:800, color, display:"flex", alignItems:"center", gap:8 }}>
              {icon} 新增「{label}」自訂題
            </div>
            <button onClick={onClose} style={{ background:"transparent", border:`1px solid ${colors.border}`, color:colors.muted, borderRadius:8, padding:"6px 14px", cursor:"pointer", fontSize:13, fontWeight:700 }}>✕ 關閉儲存</button>
          </div>

          {type === "competency" && (
            <div style={{ marginBottom:16 }}>
              <label style={{ fontSize:13, color:colors.muted, display:"block", marginBottom:6, fontWeight:700 }}>考核維度標籤</label>
              <select value={dim} onChange={e => setDim(e.target.value)} style={{ ...inp, fontWeight:600 }}>
                {["溝通協調","問題解決","顧客服務","商品銷售","POS操作","門市實務"].map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          )}

          <div style={{ marginBottom:20 }}>
            <label style={{ fontSize:13, color:colors.muted, display:"block", marginBottom:6, fontWeight:700 }}>實務情境題目 *</label>
            <textarea value={q} onChange={e => setQ(e.target.value)} placeholder="請描述門市發生的狀況..." rows={3} style={{ ...inp, resize:"vertical" }} />
          </div>

          <div style={{ marginBottom:8 }}>
            <label style={{ fontSize:13, color:colors.muted, display:"block", marginBottom:6, fontWeight:700 }}>設定選項與配分 (0-4分)</label>
            {options.map((opt, i) => (
              <div key={i} style={{ display:"flex", gap:10, marginBottom:10, alignItems:"center" }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:`${color}15`, border:`1px solid ${color}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:800, color, flexShrink:0 }}>
                  {["A","B","C","D"][i]}
                </div>
                <input value={opt} onChange={e => { const o=[...options]; o[i]=e.target.value; setOptions(o); }} placeholder={`輸入選項 ${["A","B","C","D"][i]} 應對方式`} style={{ ...inp, flex:1 }} />
                <select value={scores[i]} onChange={e => { const s=[...scores]; s[i]=Number(e.target.value); setScores(s); }} style={{ ...inp, width:76, padding:"8px", color:colors.green, fontWeight:700 }}>
                  {[0,1,2,3,4].map(v => <option key={v} value={v}>{v} 分</option>)}
                </select>
              </div>
            ))}
          </div>

          {err && <div style={{ color:colors.red, fontSize:13, marginBottom:12, fontWeight:700, display:"flex", alignItems:"center", gap:6 }}><AlertCircle size={14}/> {err}</div>}
          
          <button onClick={add} style={{ width:"100%", padding:"14px", borderRadius:10, background:`linear-gradient(135deg,${color},${color}dd)`, border:"none", color:colors.btnText, fontWeight:800, fontSize:15, cursor:"pointer", marginTop:8, display:"flex", justifyContent:"center", alignItems:"center", gap:8 }}>
            <PlusCircle size={18} /> 將此題加入題庫池
          </button>
        </div>

        {/* 已自訂題目列表 */}
        {list.length > 0 && (
          <div style={{ background:colors.card, border:`1px solid ${colors.border}`, borderRadius:16, padding:"20px 24px" }}>
            <div style={{ fontSize:14, fontWeight:700, color:colors.text, marginBottom:16, display:"flex", alignItems:"center", gap:8 }}>
              <Database size={16} color={colors.muted}/> 您專屬的「{label}」題庫清單 ({list.length} 題)
            </div>
            {list.map((cq, i) => (
              <div key={cq.id} style={{ background:colors.inputBg, borderRadius:12, padding:"14px 16px", marginBottom:10, display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:12, border:`1px solid ${colors.border}` }}>
                <div style={{ fontSize:13, color:colors.text, lineHeight:1.6, flex:1 }}>
                  <span style={{ color, fontWeight:800, marginRight:6 }}>Q{i+1}.</span>{cq.q}
                </div>
                <button onClick={() => remove(cq.id)} style={{ background:`${colors.red}15`, border:`1px solid ${colors.red}33`, color:colors.red, borderRadius:8, padding:"6px 12px", cursor:"pointer", fontSize:12, fontWeight:700, flexShrink:0, transition:"all 0.2s" }}>
                  刪除
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function SuitabilityAssessment() {
  const [isDark, setIsDark] = useState(false);
  const colors = isDark ? THEMES.dark : THEMES.light;

  const STEPS = ["基本資料", "職能測驗", "DISC 人格", "情境模擬", "分析結果"];
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ name:"", position:"", experience:"", motivation:"" });
  
  const [customBanks, setCustomBanks] = useState(() => {
    try {
      const saved = localStorage.getItem('money_custom_question_banks');
      return saved ? JSON.parse(saved) : { competency: [], disc: [], situational: [] };
    } catch (e) {
      return { competency: [], disc: [], situational: [] };
    }
  });

  useEffect(() => {
    localStorage.setItem('money_custom_question_banks', JSON.stringify(customBanks));
  }, [customBanks]);

  const [active, setActive] = useState({ competency:[], disc:[], situational:[] });
  const [cAns, setCAns] = useState({});
  const [dAns, setDAns] = useState({});
  const [sAns, setSAns] = useState({});
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  
  const [hrEditorMode, setHrEditorMode] = useState(null); 

  const DISC_COLOR = { D:"#FF6B35", I:"#FFD700", S:"#4CAF50", C:"#7B5EA7" };
  const DISC_LABEL = { D:"掌控型（老虎）", I:"影響型（孔雀）", S:"穩定型（無尾熊）", C:"謹慎型（貓頭鷹）" };
  const DISC_DESC  = {
    D:"目標導向、企圖心強、勇於挑戰業績壓力，適合高業績門市環境。",
    I:"善於社交、活力充沛、能帶動門市氛圍，顧客關係建立能力強。",
    S:"穩定可靠、支持性強，適合需要長期穩定服務品質的工作環境。",
    C:"謹慎分析、重視細節，適合需要高精確度流程操作的後台支援。",
  };

  const drawQuestions = () => {
    setActive({
      competency: pickRandom([...COMPETENCY_BANK, ...customBanks.competency], 3), 
      disc: pickRandom(DISC_BANK, 4), 
      situational: pickRandom([...SITUATIONAL_BANK, ...customBanks.situational], 2), 
    });
    setCAns({}); setDAns({}); setSAns({});
  };

  useEffect(() => {
    drawQuestions();
  }, [customBanks]); 

  function calcResult() {
    let cs = 0;
    active.competency.forEach(q => { const a=cAns[q.id]; if(a!==undefined) cs+=q.scores[a]; });
    const cMax = active.competency.length * 4;
    const compNorm = cMax > 0 ? Math.round((cs/cMax)*100) : 0;

    const dc = { D:0, I:0, S:0, C:0 };
    active.disc.forEach(q => { const a=dAns[q.id]; if(a!==undefined) dc[q.options[a].type]++; });
    const primary = Object.entries(dc).sort((a,b)=>b[1]-a[1])[0][0];
    const discBonus = primary==="D"||primary==="I" ? 95 : primary==="S" ? 65 : 75;

    let ss = 0;
    active.situational.forEach(q => { const a=sAns[q.id]; if(a!==undefined) ss+=q.scores[a]; });
    const sMax = active.situational.length * 4;
    const sitNorm = sMax > 0 ? Math.round((ss/sMax)*100) : 0;

    const total = Math.round(compNorm*0.30 + discBonus*0.20 + sitNorm*0.50);
    return { compNorm, discBonus, sitNorm, total, primary, dc };
  }

  async function fetchAI(scores) {
    setAiLoading(true);
    try {
      const payload = {
        name: form.name, position: form.position, experience: form.experience, motivation: form.motivation, scores: scores
      };
      const response = await fetch(GAS_WEB_APP_URL, {
        method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload), redirect: "follow"
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setAiText(data.reply || "無評語資料");
    } catch (e) { 
      setAiText("無法連線至後端中樞，請確認 GAS 網址設定是否正確，並檢查 GAS 部署權限是否為「所有人」。"); 
    }
    setAiLoading(false);
  }

  function handleAnalyze() {
    setAnalyzing(true);
    setTimeout(() => {
      const scores = calcResult();
      setResult(scores);
      setAnalyzing(false);
      setStep(4);
      fetchAI(scores); 
    }, 2000);
  }

  function reset() {
    setStep(0); setForm({ name:"", position:"", experience:"", motivation:"" });
    setResult(null); setAiText("");
    drawQuestions(); 
  }

  const canNext = () => {
    if (step===0) return form.name && form.position && form.experience && form.motivation;
    if (step===1) return Object.keys(cAns).length === active.competency.length;
    if (step===2) return Object.keys(dAns).length === active.disc.length;
    if (step===3) return Object.keys(sAns).length === active.situational.length;
    return false;
  };

  const card = (extra={}) => ({ background:colors.card, border:`1px solid ${colors.border}`, borderRadius:16, padding:"22px 26px", marginBottom:14, transition:"all 0.3s ease", ...extra });
  const inp  = { width:"100%", padding:"12px 16px", borderRadius:8, background:colors.inputBg, border:`1px solid ${colors.inputBorder}`, color:colors.text, fontSize:15, outline:"none", boxSizing:"border-box" };
  const btnPrimary = (on) => ({ width:"100%", padding:"16px", borderRadius:12, background: on ? `linear-gradient(135deg,${colors.accent},${colors.accent}bb)` : colors.border, border:"none", color: on ? colors.btnText : colors.muted, fontSize:15, fontWeight:800, cursor: on ? "pointer" : "not-allowed", marginTop:4, transition:"all 0.2s" });

  const getResultBg = (score) => {
    if(score >= 80) return isDark ? "linear-gradient(135deg,#0d2a1a,#1a3a25)" : "linear-gradient(135deg,#ECFDF5,#D1FAE5)";
    if(score >= 60) return isDark ? "linear-gradient(135deg,#2a2000,#3a2e00)" : "linear-gradient(135deg,#FFFBEB,#FEF3C7)";
    return isDark ? "linear-gradient(135deg,#2a0d0d,#3a1515)" : "linear-gradient(135deg,#FEF2F2,#FEE2E2)";
  };

  return (
    <div style={{ minHeight:"100vh", background:colors.bg, fontFamily:"'Noto Sans TC','PingFang TC',sans-serif", color:colors.text, paddingBottom:48, transition:"background 0.3s ease, color 0.3s ease", display:"flex", flexDirection:"column" }}>

      {/* Header */}
      <div style={{ background:colors.headerBg, borderBottom:`1px solid ${colors.border}`, padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div>
          <div style={{ fontSize:10, color:colors.accent, letterSpacing:3, textTransform:"uppercase", marginBottom:3, fontWeight:700 }}>馬尼行動通訊 · 智能人才評測系統</div>
          <div style={{ fontSize:19, fontWeight:800, color:colors.text }}>AI 職能合適度分析</div>
        </div>
        <div style={{ display:'flex', gap: 12, alignItems:'center' }}>
          
          {/* HR 專屬：題庫設定管理員 */}
          <div style={{ display:'flex', background:colors.inputBg, borderRadius:20, padding:4, border:`1px solid ${colors.border}` }}>
             <button onClick={() => setHrEditorMode('competency')} style={{ padding:"6px 12px", borderRadius:16, fontSize:13, fontWeight:700, cursor:"pointer", border:"none", background: "transparent", color: colors.muted, display:"flex", alignItems:"center", gap:6, transition:"all 0.2s" }} title="新增職能測驗自訂題">
               <Settings2 size={14}/> 職能題庫
             </button>
             <button onClick={() => setHrEditorMode('situational')} style={{ padding:"6px 12px", borderRadius:16, fontSize:13, fontWeight:700, cursor:"pointer", border:"none", background: "transparent", color: colors.muted, display:"flex", alignItems:"center", gap:6, transition:"all 0.2s" }} title="新增情境模擬自訂題">
               <Settings2 size={14}/> 情境題庫
             </button>
          </div>

          <button onClick={() => setIsDark(!isDark)} style={{ background:colors.inputBg, border:`1px solid ${colors.border}`, borderRadius:20, padding:"6px 12px", fontSize:14, cursor:"pointer", transition:"all 0.3s", display:"flex", alignItems:"center", gap:6 }}>
            {isDark ? "☀️ 明亮" : "🌙 暗黑"}
          </button>
        </div>
      </div>

      {/* HR 編輯器 Modal Overlay */}
      {hrEditorMode && (
        <QuestionEditor 
          type={hrEditorMode} 
          customQuestions={customBanks} 
          setCustomQuestions={setCustomBanks} 
          onClose={() => setHrEditorMode(null)} 
          colors={colors} 
        />
      )}

      {/* Step bar */}
      <div style={{ padding:"16px 22px 0", overflowX:"auto" }}>
        <div style={{ display:"flex", alignItems:"center", minWidth:520 }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", flex: i<STEPS.length-1 ? 1 : "initial" }}>
              <div style={{ width:26, height:26, borderRadius:"50%", background:i<step?colors.green:i===step?colors.accent:colors.border, display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:700, color: i<=step?colors.btnText:colors.muted, flexShrink:0, boxShadow:i===step?`0 0 10px ${colors.accent}88`:"none", transition:"all 0.4s" }}>
                {i<step?"✓":i+1}
              </div>
              <div style={{ fontSize:11, color:i===step?colors.accent:colors.muted, marginLeft:4, whiteSpace:"nowrap", fontWeight: i===step?700:400 }}>{s}</div>
              {i<STEPS.length-1 && <div style={{ flex:1, height:2, margin:"0 5px", background:i<step?colors.green:colors.border, transition:"background 0.4s" }} />}
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding:"16px 22px", flex: 1 }}>

        {/* ── STEP 0: Basic info ── */}
        {step===0 && (
          <div style={card()}>
            <div style={{ fontSize:16, fontWeight:700, marginBottom:18, color:colors.accent }}>📋 基本應徵資料</div>
            {[{k:"name",l:"姓名",p:"請輸入您的姓名"},{k:"position",l:"應徵職位",p:"例：門市業務人員"}].map(f=>(
              <div key={f.k} style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, color:colors.muted, display:"block", marginBottom:5 }}>{f.l}</label>
                <input value={form[f.k]} onChange={e=>setForm({...form,[f.k]:e.target.value})} placeholder={f.p} style={inp} />
              </div>
            ))}
            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:12, color:colors.muted, display:"block", marginBottom:5 }}>相關工作經驗</label>
              <select value={form.experience} onChange={e=>setForm({...form,experience:e.target.value})} style={{ ...inp, color:form.experience?colors.text:colors.muted }}>
                <option value="">請選擇年資</option>
                {[["0","無相關經驗（應屆）"],["1","1年以下"],["2","1–3年"],["3","3–5年"],["4","5年以上"]].map(([v,l])=><option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ fontSize:12, color:colors.muted, display:"block", marginBottom:5 }}>應徵動機</label>
              <textarea value={form.motivation} onChange={e=>setForm({...form,motivation:e.target.value})} placeholder="請簡述您的應徵動機與目標..." rows={3} style={{ ...inp, resize:"vertical" }} />
            </div>
          </div>
        )}

        {/* ── STEP 1–3: Questions ── */}
        {step===1 && (
          <div>
            <div style={{ ...card({ padding:"12px 16px", marginBottom:12 }) }}>
              <span style={{ fontSize:13, color:colors.muted }}>📊 <span style={{ color:colors.accent }}>零售職能測驗</span> · 共 {active.competency.length} 題</span>
            </div>
            <QuestionBlock questions={active.competency} answers={cAns} setAnswers={setCAns} colorKey="competency" colors={colors} />
          </div>
        )}
        {step===2 && (
          <div>
            <div style={{ ...card({ padding:"12px 16px", marginBottom:12 }) }}>
              <span style={{ fontSize:13, color:colors.muted }}>🧠 <span style={{ color:colors.gold }}>DISC 人格特質</span> · 共 {active.disc.length} 題</span>
            </div>
            <QuestionBlock questions={active.disc} answers={dAns} setAnswers={setDAns} colorKey="disc" colors={colors} />
          </div>
        )}
        {step===3 && (
          <div>
            <div style={{ ...card({ padding:"12px 16px", marginBottom:12 }) }}>
              <span style={{ fontSize:13, color:colors.muted }}>🎯 <span style={{ color:colors.orange }}>情境判斷</span> · 共 {active.situational.length} 題</span>
            </div>
            <QuestionBlock questions={active.situational} answers={sAns} setAnswers={setSAns} colorKey="situational" colors={colors} />
            <button onClick={handleAnalyze} disabled={!canNext()||analyzing}
              style={{ width:"100%", padding:"18px", borderRadius:12, background:canNext()?`linear-gradient(135deg,${colors.accent},${colors.accent}dd)`:colors.border, border:"none", color:canNext()?colors.btnText:colors.muted, fontSize:16, fontWeight:800, cursor:canNext()?"pointer":"not-allowed", boxShadow:canNext()?`0 4px 20px ${colors.accent}44`:"none", transition:"all 0.3s" }}>
              {analyzing ? "⚙️ AI 運算分析中..." : "🚀 提交並進行 AI 合適度分析"}
            </button>
            {analyzing && (
              <div style={card({ textAlign:"center", marginTop:12 })}>
                {["職能交叉比對","DISC 特質加權","情境判斷評分","產出合適度指標","同步寫入雲端中樞..."].map((t,i)=>(
                  <div key={i} style={{ padding:"8px 12px", marginBottom:6, borderRadius:6, background:colors.inputBg, fontSize:13, color:colors.accent }}>▶ {t}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 4: Results ── */}
        {step===4 && result && (
          <div style={{ animation: "fadeIn 0.5s ease" }}>
            <div style={card({ background: getResultBg(result.total), border:`1px solid ${result.total>=80?colors.green:result.total>=60?colors.gold:colors.red}44`, textAlign:"center" })}>
              <div style={{ fontSize:12, color:colors.muted, marginBottom:8, letterSpacing:2 }}>{form.name} 的合適度評測結果</div>
              <div style={{ display:"flex", justifyContent:"center", marginBottom:8 }}><CircleScore score={result.total} colors={colors} /></div>
              <div style={{ fontSize:12, color:colors.muted, marginBottom:14 }}>綜合合適度</div>
              <div style={{ display:"inline-block", padding:"8px 20px", borderRadius:20, background:`${result.total>=80?colors.green:result.total>=60?colors.gold:colors.red}22`, border:`1px solid ${result.total>=80?colors.green:result.total>=60?colors.gold:colors.red}`, fontSize:14, fontWeight:700, color:result.total>=80?colors.green:result.total>=60?colors.gold:colors.red }}>
                {result.total>=80?"✅ 合適度達標 — 系統將自動發送面試邀請":result.total>=60?"⚠️ 待審核 — 需人資主管複審":"❌ 合適度未達標準"}
              </div>
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:10, marginBottom:14 }}>
              {[{l:"職能測驗",s:result.compNorm,c:colors.accent,w:"30%"},{l:"DISC加權",s:result.discBonus,c:colors.gold,w:"20%"},{l:"情境判斷",s:result.sitNorm,c:colors.orange,w:"50%"}].map(x=>(
                <div key={x.l} style={card({ padding:"14px", textAlign:"center", marginBottom:0 })}>
                  <div style={{ fontSize:26, fontWeight:900, color:x.c }}>{x.s}</div>
                  <div style={{ fontSize:11, color:colors.muted }}>{x.l}</div>
                  <div style={{ fontSize:10, color:x.c, background:`${x.c}15`, borderRadius:4, padding:"2px 6px", marginTop:4, display:"inline-block" }}>權重 {x.w}</div>
                </div>
              ))}
            </div>

            <div style={card()}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:14, color:colors.gold }}>🧠 DISC 人格特質</div>
              <div style={{ display:"flex", gap:12, alignItems:"center", marginBottom:12 }}>
                <div style={{ width:52, height:52, borderRadius:"50%", background:`${DISC_COLOR[result.primary]}22`, border:`2px solid ${DISC_COLOR[result.primary]}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, fontWeight:900, color:DISC_COLOR[result.primary], flexShrink:0 }}>{result.primary}</div>
                <div>
                  <div style={{ fontWeight:700, fontSize:14, color:DISC_COLOR[result.primary] }}>{DISC_LABEL[result.primary]}</div>
                  <div style={{ fontSize:12, color:colors.muted, marginTop:3, lineHeight:1.5 }}>{DISC_DESC[result.primary]}</div>
                </div>
              </div>
              <div style={{ display:"flex", gap:8 }}>
                {Object.entries(result.dc).map(([t,c])=>(
                  <div key={t} style={{ flex:1, padding:"8px 4px", borderRadius:8, textAlign:"center", background:t===result.primary?`${DISC_COLOR[t]}22`:colors.inputBg, border:`1px solid ${t===result.primary?DISC_COLOR[t]:colors.border}` }}>
                    <div style={{ fontSize:14, fontWeight:800, color:DISC_COLOR[t] }}>{t}</div>
                    <div style={{ fontSize:18, fontWeight:900, color:colors.text }}>{c}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={card({ border:`1px solid ${colors.accent}44` })}>
              <div style={{ fontSize:14, fontWeight:700, marginBottom:12, color:colors.accent, display:"flex", alignItems:"center", gap:8 }}>
                🤖 AI 人資顧問評語 
                {aiLoading && <Loader2 size={16} className="animate-spin text-accent" />}
              </div>
              {aiLoading
                ? <div style={{ color:colors.muted, fontSize:14 }}>資料已送達後端中樞，AI 正在生成專屬評語...</div>
                : <div style={{ fontSize:14, lineHeight:1.8, color:colors.text, background:`${colors.accent}15`, borderRadius:8, padding:"12px 14px", borderLeft:`3px solid ${colors.accent}` }}>{aiText}</div>
              }
            </div>

            <button onClick={reset} style={{ width:"100%", padding:"13px", borderRadius:10, background:"transparent", border:`1px solid ${colors.border}`, color:colors.muted, fontSize:14, cursor:"pointer" }}>重新填寫評測問卷</button>
          </div>
        )}

        {/* ── Navigation ── */}
        {step < 3 && (
          <button onClick={()=>{ setStep(step+1); }} disabled={!canNext()}
            style={btnPrimary(canNext())}>
            下一步 →
          </button>
        )}
        {step > 0 && step < 4 && (
          <button onClick={()=>setStep(step-1)} style={{ width:"100%", padding:"11px", borderRadius:10, background:"transparent", border:`1px solid ${colors.border}`, color:colors.muted, fontSize:13, cursor:"pointer", marginTop:8 }}>← 返回上一步</button>
        )}
      </div>

      {/* 版權宣告 */}
      <div style={{ textAlign:"center", padding:"16px", color:colors.muted, fontSize:12, borderTop:`1px solid ${colors.border}` }}>
        ©馬尼通訊 人資系統
      </div>
    </div>
  );
}