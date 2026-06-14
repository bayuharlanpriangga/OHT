// ── GLOBAL STATE DECLARATIONS (hoisted to prevent TDZ errors) ──
let _todayGroupByTime = false;
let _searchDebounce = null;
let _searchQuery = '';
let _historyCatFilter = 'all';
let _insightFilter = 'all';
let _strengthCache = {};
let _strengthCacheDate = '';
let _undoStack = [];
// [declared at top]
let _ambientNodes = [];
let _backfillData = {};
let _pendingNoteHabitId = null;
let _moreMenuOpen = false;
let _longPressTimer = null;
let _contextMenuHabitId = null;
let _wasChecked = false;
let _prevStats = {};
let _compactMode = false;
window._aiSuggestions = [];

// ═══════════════════════════════════════════════════════════
// OHT v4 ELITE
// ═══════════════════════════════════════════════════════════
// SVG icon picker definitions — each has id + SVG path
const HABIT_ICONS = [
  {id:'star',   svg:'<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'},
  {id:'run',    svg:'<circle cx="13" cy="4" r="2"/><path d="M15 8l-3 4-4 1 1 4"/><path d="M9 12l2 5"/><path d="M13 12l4 2 2 4"/>'},
  {id:'strong', svg:'<path d="M6 4v6"/><path d="M18 4v6"/><path d="M3 7h18"/><path d="M6 10c0 4 2 6 6 6s6-2 6-6"/>'},
  {id:'book',   svg:'<path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="12" y2="11"/>'},
  {id:'meditate',svg:'<circle cx="12" cy="5" r="3"/><path d="M6 22c0-4 2.5-7 6-7s6 3 6 7"/><path d="M3 14c2 0 3-1 3-3"/><path d="M21 14c-2 0-3-1-3-3"/>'},
  {id:'water',  svg:'<path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0c0-5-7-13-7-13z"/>'},
  {id:'food',   svg:'<path d="M3 2l3 18"/><path d="M9 2v6a3 3 0 006 0V2"/><path d="M15 2v18"/>'},
  {id:'target', svg:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'},
  {id:'write',  svg:'<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>'},
  {id:'music',  svg:'<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'},
  {id:'sun',    svg:'<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>'},
  {id:'sleep',  svg:'<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>'},
  {id:'lift',   svg:'<line x1="6" y1="5" x2="6" y2="19"/><line x1="18" y1="5" x2="18" y2="19"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="6" y1="5" x2="10" y2="5"/><line x1="6" y1="19" x2="10" y2="19"/><line x1="14" y1="5" x2="18" y2="5"/><line x1="14" y1="19" x2="18" y2="19"/>'},
  {id:'brain',  svg:'<path d="M9.5 2a4.5 4.5 0 014.5 4.5v1A4.5 4.5 0 0119.5 12v0a4.5 4.5 0 01-4.5 4.5h-6A4.5 4.5 0 014.5 12v0A4.5 4.5 0 019 7.5v-1A4.5 4.5 0 019.5 2z"/>'},
  {id:'pill',   svg:'<path d="M10.5 20.5l10-10a4.95 4.95 0 00-7-7l-10 10a4.95 4.95 0 007 7z"/><line x1="8.5" y1="8.5" x2="15.5" y2="15.5"/>'},
  {id:'leaf',   svg:'<path d="M17 8C8 10 5.9 16.17 3.82 19.97"/><path d="M3.82 19.97A10 10 0 0122 12c0-8.5-6-12-6-12C13 4 9 6 9 12a6 6 0 006 6c3 0 5-2 5-2"/>'},
  {id:'bike',   svg:'<circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 000-2h-3l-3 9"/><path d="M5.5 17.5l5-9 4 6"/><line x1="13" y1="4" x2="19" y2="4"/>'},
  {id:'art',    svg:'<circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 012-2h6a2 2 0 012 2v1.662"/>'},
  {id:'money',  svg:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>'},
  {id:'people', svg:'<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/>'},
  {id:'clean',  svg:'<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><polyline points="9 22 9 12 15 12 15 22"/>'},
  {id:'phone',  svg:'<rect x="5" y="2" width="14" height="20"/><line x1="12" y1="18" x2="12.01" y2="18"/>'},
  {id:'clock',  svg:'<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'},
  {id:'fire',   svg:'<path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-7 7c-1.86 0-3.516-.5-4.862-1.5A7 7 0 012 17"/><path d="M14 14.5c0 1.38-1.12 2.5-2.5 2.5A2.5 2.5 0 019 14.5c0-1 .5-2 1.5-3 .26.62.5 1.3.5 2 .64-.34 1.5-1.26 2-2.5.5 1 1 2 1 3z"/>'},
  {id:'bolt',   svg:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'},
  {id:'heart',  svg:'<path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/>'},
  {id:'coffee', svg:'<path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>'},
  {id:'swim',   svg:'<path d="M2 12h20"/><path d="M2 6c3 0 5 2 8 2s5-2 8-2"/><path d="M2 18c3 0 5-2 8-2s5 2 8 2"/><circle cx="12" cy="3" r="1"/>'},
  {id:'check2', svg:'<polyline points="20 6 9 17 4 12"/>'},
  {id:'code',   svg:'<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>'},
  {id:'yoga',   svg:'<circle cx="12" cy="4" r="2"/><path d="M12 6v6"/><path d="M6 12l3 2 3-2 3 2 3-2"/><path d="M9 14l-3 5"/><path d="M15 14l3 5"/>'},
];
const EMOJIS = HABIT_ICONS.map(i => i.id);
const COLORS=['#FFE600','#FF3CAC','#00F5D4','#AAFF00','#FF6B00','#0057FF','#7B2FBE','#FF1744','#00BCD4','#FF9800','#4CAF50','#E91E63'];
const QUOTES=[
  {q:'"We are what we repeatedly do. Excellence is not an act, but a habit."',a:'ARISTOTLE'},
  {q:'"Motivation is what gets you started. Habit is what keeps you going."',a:'JIM RYUN'},
  {q:'"The secret of your future is hidden in your daily routine."',a:'MIKE MURDOCK'},
  {q:'"Small daily improvements lead to stunning results."',a:'UNKNOWN'},
  {q:'"First forget inspiration. Habit is more dependable."',a:'OCTAVIA BUTLER'},
  {q:'"Do the work. Especially when you don\'t feel like it."',a:'UNKNOWN'},
  {q:'"You do not rise to your goals. You fall to your systems."',a:'JAMES CLEAR'},
];
const CATS={
  health:{label:'Health',svg:'<path d="M6 4v6"/><path d="M18 4v6"/><path d="M3 7h18"/><path d="M6 10c0 4 2 6 6 6s6-2 6-6"/>',color:'#FF3CAC'},
  mind:{label:'Mind',svg:'<path d="M9.5 2a4.5 4.5 0 014.5 4.5c0 1.5-.5 2.5-1.5 3.5h3a4.5 4.5 0 010 9H9a4.5 4.5 0 010-9h.5C8 9 7.5 8 7.5 6.5A4.5 4.5 0 019.5 2z"/>',color:'#0057FF'},
  productivity:{label:'Work',svg:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',color:'#FFE600'},
  wellness:{label:'Wellness',svg:'<path d="M17 8C8 10 5.9 16.17 3.82 19.97"/><path d="M3.82 19.97A10 10 0 0122 12c0-8.5-6-12-6-12C13 4 9 6 9 12a6 6 0 006 6c3 0 5-2 5-2"/>',color:'#00F5D4'},
  social:{label:'Social',svg:'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',color:'#FF6B00'},
  finance:{label:'Finance',svg:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>',color:'#AAFF00'},
  creativity:{label:'Creative',svg:'<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><circle cx="6.5" cy="12.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 011.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>',color:'#7B2FBE'},
  custom:{label:'Custom',svg:'<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',color:'#888'},
};
const DAILY_FREQS=['daily','weekdays','weekends','3x/week'];
const MOOD_EMOJIS=['','😫','😕','😐','😊','🔥'];
const HABIT_TEMPLATES=[
  {id:'morning',icon:'🌅',title:'Morning Routine',count:4,habits:[
    {name:'Wake Up Early',icon:'clock',color:'#FFE600',category:'wellness',freq:'daily',target:1,notes:'Before 6AM',progressive:'none',stack:'',stake:'',scheduledTime:'06:00'},
    {name:'Morning Run',icon:'run',color:'#FF3CAC',category:'health',freq:'daily',target:1,notes:'20 min min',progressive:'slow',stack:'',stake:'',scheduledTime:'06:15'},
    {name:'Cold Shower',icon:'water',color:'#00F5D4',category:'wellness',freq:'daily',target:1,notes:'',progressive:'none',stack:'',stake:'',scheduledTime:''},
    {name:'Journal',icon:'write',color:'#7B2FBE',category:'mind',freq:'daily',target:1,notes:'3 gratitude items',progressive:'none',stack:'',stake:'',scheduledTime:'07:00'},
  ]},
  {id:'fitness',icon:'💪',title:'Fitness Pack',count:4,habits:[
    {name:'Workout',icon:'lift',color:'#FF3CAC',category:'health',freq:'daily',target:1,notes:'',progressive:'medium',stack:'',stake:'',scheduledTime:''},
    {name:'Drink 8 Glasses',icon:'water',color:'#00F5D4',category:'health',freq:'daily',target:8,notes:'',progressive:'none',stack:'',stake:'',scheduledTime:''},
    {name:'Protein Intake',icon:'food',color:'#AAFF00',category:'health',freq:'daily',target:1,notes:'',progressive:'none',stack:'',stake:'',scheduledTime:''},
    {name:'Stretch',icon:'meditate',color:'#FF6B00',category:'health',freq:'daily',target:1,notes:'10 min',progressive:'none',stack:'',stake:'',scheduledTime:''},
  ]},
  {id:'study',icon:'book',title:'Study Pack',count:3,habits:[
    {name:'Read 30 min',icon:'book',color:'#0057FF',category:'mind',freq:'daily',target:1,notes:'',progressive:'slow',stack:'',stake:'',scheduledTime:'21:00'},
    {name:'Study Session',icon:'code',color:'#FFE600',category:'productivity',freq:'weekdays',target:1,notes:'Deep focus',progressive:'none',stack:'',stake:'',scheduledTime:''},
    {name:'Review Notes',icon:'write',color:'#FF6B00',category:'mind',freq:'weekdays',target:1,notes:'',progressive:'none',stack:'',stake:'',scheduledTime:''},
  ]},
  {id:'mindful',icon:'meditate',title:'Mindfulness',count:3,habits:[
    {name:'Meditate',icon:'meditate',color:'#7B2FBE',category:'wellness',freq:'daily',target:1,notes:'10 min',progressive:'slow',stack:'',stake:'',scheduledTime:'07:30'},
    {name:'Gratitude',icon:'bolt',color:'#FFE600',category:'wellness',freq:'daily',target:1,notes:'3 things',progressive:'none',stack:'',stake:'',scheduledTime:''},
    {name:'Digital Detox',icon:'phone',color:'#FF1744',category:'wellness',freq:'weekly',target:1,notes:'No social media',progressive:'none',stack:'',stake:'',scheduledTime:''},
  ]},
  {id:'finance',icon:'money',title:'Finance Pack',count:3,habits:[
    {name:'No Impulse Buy',icon:'money',color:'#AAFF00',category:'finance',freq:'daily',target:1,notes:'',progressive:'none',stack:'',stake:'Donasi Rp20k jika gagal',scheduledTime:''},
    {name:'Log Expenses',icon:'phone',color:'#00BCD4',category:'finance',freq:'daily',target:1,notes:'',progressive:'none',stack:'',stake:'',scheduledTime:'22:00'},
    {name:'Budget Review',icon:'target',color:'#FF9800',category:'finance',freq:'monthly',target:1,notes:'',progressive:'none',stack:'',stake:'',scheduledTime:''},
  ]},
  {id:'social',icon:'people',title:'Social Pack',count:2,habits:[
    {name:'Connect with Someone',icon:'people',color:'#FF6B00',category:'social',freq:'daily',target:1,notes:'Real talk',progressive:'none',stack:'',stake:'',scheduledTime:''},
    {name:'Family Call',icon:'bolt',color:'#E91E63',category:'social',freq:'weekly',target:1,notes:'',progressive:'none',stack:'',stake:'',scheduledTime:''},
  ]},
];
const MISSIONS=[
  {id:'m1',title:'FIRST BLOOD',desc:'7-day streak on any habit',icon:'target',goal:7,type:'streak',reward:1},
  {id:'m2',title:'CONSISTENCY KING',desc:'ALL daily habits done 3 days straight',icon:'👑',goal:3,type:'perfect_days',reward:2},
  {id:'m3',title:'HABIT COLLECTOR',desc:'Add 5 or more habits',icon:'📋',goal:5,type:'habit_count',reward:1},
  {id:'m4',title:'CENTURY CLUB',desc:'Reach 100 total XP',icon:'💯',goal:100,type:'xp',reward:2},
  {id:'m5',title:'ON A ROLL',desc:'7 perfect days in a row',icon:'🔥',goal:7,type:'perfect_days',reward:3},
  {id:'m6',title:'XP BEAST',desc:'Reach 500 total XP',icon:'⚡',goal:500,type:'xp',reward:5},
  {id:'m7',title:'WEEK WARRIOR',desc:'Weekly habit 4 consecutive weeks',icon:'⚔️',goal:4,type:'weekly_streak',reward:2},
];
const ACHIEVEMENTS=[
  {id:'a1',icon:'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--lime)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><path d="M12 3v1M12 20v1M4.22 4.22l.7.7M19.07 19.07l.71.71M1 12h2M21 12h2M4.22 19.78l.7-.7M19.07 4.93l.71-.71"/><circle cx="12" cy="12" r="4"/></svg>',title:'FIRST STEP',desc:'Add your first habit',xp:10},
  {id:'a2',icon:'🔥',title:'ON FIRE',desc:'3-day streak',xp:20},
  {id:'a3',icon:'💪',title:'CONSISTENT',desc:'7-day streak',xp:50},
  {id:'a4',icon:'⚡',title:'LIGHTNING',desc:'100% in one day',xp:30},
  {id:'a5',icon:'🏆',title:'CHAMPION',desc:'30-day streak',xp:200},
  {id:'a6',icon:'book',title:'SCHOLAR',desc:'Track 5+ habits',xp:25},
  {id:'a7',icon:'bolt',title:'SUPERSTAR',desc:'500 total XP',xp:50},
  {id:'a8',icon:'❄',title:'PREPARED',desc:'Earn your first freeze',xp:15},
  {id:'a9',icon:'💯',title:'PERFECTIONIST',desc:'7 perfect days',xp:100},
  {id:'a10',icon:'🧬',title:'ARCHITECT',desc:'Stack 2 habits',xp:30},
  {id:'a11',icon:'<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',title:'LEVELLING UP',desc:'Use progressive difficulty',xp:25},
  {id:'a12',icon:'🦁',title:'OHT COACHED',desc:'Chat with AI Coach',xp:20},
  {id:'a13',icon:'🏖',title:'RECHARGED',desc:'Use vacation mode',xp:15},
  {id:'a14',icon:'🧬',title:'DNA SHARER',desc:'Export your habit DNA',xp:20},
];
const CHALLENGES=[
  {id:'c1',title:'30-DAY WARRIOR',desc:'All habits done 30 days straight.',goal:30,color:'#FF3CAC',icon:'⚔️'},
  {id:'c2',title:'HYDRATION HERO',desc:'Water habit every day for 21 days.',goal:21,color:'#00F5D4',icon:'water'},
  {id:'c3',title:'EARLY RISER',desc:'Morning habits 14 days.',goal:14,color:'#FFE600',icon:'🌅'},
];
const LVL_NAMES=['ROOKIE','STARTER','GRINDER','WARRIOR','CHAMPION','LEGEND','GOD'];

let focusState={running:false,isBreak:false,workDur:25*60,breakDur:5*60,remaining:25*60,total:25*60,sessions:0,interval:null,linkedHabit:''};

// ── STATE ──────────────────────────────────────────────────
let S={
  habits:[],history:[],lockedDays:{},
  xp:0,name:'User',
  freezes:0,freezeLog:[],
  missions:[],achievements:[],
  moodLog:{},coachHistory:[],weeklyReviews:[],insightFeed:[],
  todayFilter:'all',historyFilter:'all',reportPeriod:'daily',
  habitsSort:'default',habitsCatFilter:'all',
  darkMode:false,soundOn:true,confettiOn:true,onboardDone:false,
  vacationMode:false,vacationEnd:'',
  lastDate:todayStr(),selTemplate:null,
};

function todayStr(){
  const d=new Date();
  const y=d.getFullYear();
  const m=String(d.getMonth()+1).padStart(2,'0');
  const day=String(d.getDate()).padStart(2,'0');
  return `${y}-${m}-${day}`;
}
function getWeekMon(){
  const d=new Date();const day=d.getDay()||7;d.setDate(d.getDate()-day+1);
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function getMonthStr(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0');}
const $ = id => document.getElementById(id);
const setTxt = (id,v) => {const el=$(id);if(el)el.textContent=v;};

// ── LOAD / SAVE ────────────────────────────────────────────
function loadState(){
  const raw=localStorage.getItem('hb_v5');
  if(raw){
    try{
      const d=JSON.parse(raw);
      S=Object.assign({},S,d);
      if(!S.achievements?.length) S.achievements=ACHIEVEMENTS.map(a=>({...a,unlocked:false}));
      if(!S.missions?.length) S.missions=MISSIONS.map(m=>({...m,progress:0,completed:false}));
    }catch(e){}
  } else {
    S.missions=MISSIONS.map(m=>({...m,progress:0,completed:false}));
    S.achievements=ACHIEVEMENTS.map(a=>({...a,unlocked:false}));
  }
  // FIX: vacation end auto-resume
  if(S.vacationMode&&S.vacationEnd&&S.vacationEnd<=todayStr()){
    S.vacationMode=false;S.vacationEnd='';
    toast('🏖 Vacation ended. Back to tracking!','success');
  }
  // Day change
  const today=todayStr();
  if(S.lastDate&&S.lastDate!==today&&!S.vacationMode&&new Date(today+'T12:00:00')>new Date(S.lastDate+'T12:00:00')){
    lockInDay(S.lastDate);resetForNewDay();
  }
  S.lastDate=today;
  // Sunday/Monday review prompt (within 24h window)
  if(S.onboardDone){
    const dow=new Date().getDay();
    if(dow===0||dow===1){
      const lastRev=S.weeklyReviews?.length?S.weeklyReviews[0].week:'';
      const mon=getWeekMon();
      const prevMon=new Date(mon);prevMon.setDate(prevMon.getDate()-7);
      const prevMonStr=prevMon.toISOString().split('T')[0];
      // Only prompt if not yet reviewed this week
      // Auto weekly review prompt removed - user opens manually from History page
    }
  }
}

function lockInDay(dateStr){
  if(!dateStr||!S.habits) return;
  S.lockedDays=S.lockedDays||{};
  const snap=S.habits.map(h=>({
    habitId:h.id,habitName:h.name,habitIcon:h.icon,
    category:h.category,completed:!!h.completedToday,xpEarned:h.todayXp||0
  }));
  S.lockedDays[dateStr]=snap;

  // Cek apakah ada habit yang missed (due hari itu, tidak selesai, tidak paused, tidak di-skip)
  const skippedIds=new Set((S.skips&&S.skips[dateStr])||[]);
  const missedAny=snap.some(sn=>{
    const h=S.habits.find(x=>x.id===sn.habitId);
    return h&&isDueDateStr(h,dateStr)&&!sn.completed&&!h.paused&&!skippedIds.has(h.id);
  });

  // Pakai freeze kalau ada yang missed
  const freezeUsed=missedAny&&(S.freezes||0)>0;
  if(freezeUsed){
    S.freezes--;S.freezeLog=S.freezeLog||[];
    S.freezeLog.unshift({date:dateStr,reason:'Auto-used: protected missed habits',earned:false,used:true});
    playSound('freeze');
  }

  // FIX 1: Reset streak daily habits yang missed dan tidak dilindungi freeze/skip
  if(!freezeUsed){
    S.habits.forEach(h=>{
      if(h.paused||h.archived) return;
      const f=h.freq||'daily';
      const sn=snap.find(s=>s.habitId===h.id);
      const missed=sn&&!sn.completed&&isDueDateStr(h,dateStr)&&!skippedIds.has(h.id);
      if(!missed) return;
      if(DAILY_FREQS.includes(f)){
        h.streak=0;
      }
      // weekly/monthly streak reset ditangani di resetForNewDay saat periode baru mulai
    });
  }

  S.history=S.history.filter(e=>!(e.date===dateStr&&!e.locked));
  snap.forEach(sn=>{
    if(sn.completed&&!S.history.some(e=>e.date===dateStr&&e.habitId===sn.habitId&&e.locked)){
      S.history.unshift({id:'l_'+sn.habitId+'_'+dateStr,habitId:sn.habitId,habitName:sn.habitName,habitIcon:sn.habitIcon,category:sn.category,date:dateStr,status:'done',xp:sn.xpEarned,locked:true});
    }
  });
  if(S.history.length>2000)S.history=S.history.slice(0,2000);
}

function resetForNewDay(){
  const todayDay=new Date().getDay();const todayDate=new Date().getDate();
  const curWeek=getWeekMon();const curMonth=getMonthStr();
  S.habits.forEach(h=>{
    const f=h.freq||'daily';
    // FIX 2: reset skippedToday setiap hari baru tanpa terkecuali
    h.skippedToday=false;
    if(DAILY_FREQS.includes(f)){
      h.completedToday=false;h.currentProgress=0;h.todayXp=0;
      // Reset weekLog every Monday
      if(todayDay===1){h.weekLog=Array(7).fill(false);}
      if(todayDay===1&&h.progressive&&h.progressive!=='none'){
        const rate={slow:.1,medium:.2,fast:.3}[h.progressive]||0;
        h.baseTarget=h.baseTarget||h.target;
        const weeksElapsed=Math.max(0,Math.floor((Date.now()-new Date(h.createdAt||Date.now()))/(7*864e5)));
        h.target=Math.max(h.baseTarget,Math.round(h.baseTarget*(1+rate*weeksElapsed)));
      }
    } else if(f==='weekly'){
      if(todayDay===1){
        if(h.lastWeekChecked&&h.lastWeekChecked!==curWeek){
          const prev=new Date(curWeek);prev.setDate(prev.getDate()-7);
          if(h.lastWeekChecked!==prev.toISOString().split('T')[0])h.streak=0;
        }
        h.completedToday=false;h.currentProgress=0;h.todayXp=0;
      }
    } else if(f==='monthly'){
      if(todayDate===1){
        const now=new Date();
        const prevMonth=new Date(now.getFullYear(),now.getMonth()-1,1);
        const prevMonthStr=prevMonth.getFullYear()+'-'+String(prevMonth.getMonth()+1).padStart(2,'0');
        if(h.lastMonthChecked&&h.lastMonthChecked!==prevMonthStr){h.streak=0;}
        h.completedToday=false;h.currentProgress=0;h.todayXp=0;
      }
    }
  });
}

function save(){
  try{
    const today=new Date();
    // Prune lockedDays older than 90 days
    if(S.lockedDays){
      const cutoff=new Date(today);cutoff.setDate(cutoff.getDate()-90);
      const cutStr=cutoff.toISOString().split('T')[0];
      Object.keys(S.lockedDays).forEach(d=>{if(d<cutStr)delete S.lockedDays[d];});
    }
    // Prune waterLog older than 60 days
    if(S.waterLog){
      const cutoff=new Date(today);cutoff.setDate(cutoff.getDate()-60);
      const cutStr=cutoff.toISOString().split('T')[0];
      Object.keys(S.waterLog).forEach(d=>{if(d<cutStr)delete S.waterLog[d];});
    }
    // Prune focusSessions older than 60 days
    if(S.focusSessions){
      const cutoff=new Date(today);cutoff.setDate(cutoff.getDate()-60);
      const cutStr=cutoff.toISOString().split('T')[0];
      Object.keys(S.focusSessions).forEach(d=>{if(d<cutStr)delete S.focusSessions[d];});
    }
    // Prune completionNotes older than 90 days per habit
    if(S.completionNotes){
      const cutoff=new Date(today);cutoff.setDate(cutoff.getDate()-90);
      const cutStr=cutoff.toISOString().split('T')[0];
      Object.keys(S.completionNotes).forEach(hId=>{
        if(S.completionNotes[hId])
          Object.keys(S.completionNotes[hId]).forEach(d=>{if(d<cutStr)delete S.completionNotes[hId][d];});
      });
    }
    // Cap arrays
    if(S.insightFeed?.length>50)S.insightFeed=S.insightFeed.slice(0,50);
    if(S.coachHistory?.length>30)S.coachHistory=S.coachHistory.slice(0,30);
    if(S.gratitudeLog?.length>100)S.gratitudeLog=S.gratitudeLog.slice(0,100);
    if(S.sleepLog?.length>60)S.sleepLog=S.sleepLog.slice(0,60);
    if(S.freezeLog?.length>50)S.freezeLog=S.freezeLog.slice(0,50);
    if(S.history?.length>2000)S.history=S.history.slice(0,2000);
    localStorage.setItem('hb_v5',JSON.stringify(S));
  }catch(e){
    // If quota exceeded, prune more aggressively
    try{
      if(S.history?.length>500)S.history=S.history.slice(0,500);
      if(S.lockedDays){const keys=Object.keys(S.lockedDays).sort();keys.slice(0,keys.length-30).forEach(k=>delete S.lockedDays[k]);}
      localStorage.setItem('hb_v5',JSON.stringify(S));
    }catch(e2){console.warn('OHT: localStorage full, some data may be lost');}
  }
}

// ── SOUND ──────────────────────────────────────────────────
let _actx=null;
function getACtx(){if(!_actx)_actx=new(window.AudioContext||window.webkitAudioContext)();return _actx;}
function playSound(type){
  if(!S.soundOn)return;
  try{
    const ctx=getACtx();
    const sounds={
      tick:{seqs:[[523,.12,.08],[659,.1,.07]],wave:'square'},
      uncheck:{seqs:[[400,.1,.06],[300,.1,.05]],wave:'square'},
      levelup:{seqs:[[523,.12,.09],[659,.12,.09],[784,.12,.09],[1047,.15,.09]],wave:'square'},
      perfect:{seqs:[[659,.1,.08],[784,.1,.08],[880,.1,.08],[1047,.1,.08],[1319,.18,.08]],wave:'square'},
      freeze:{seqs:[[300,.08,.06],[400,.08,.06],[500,.1,.06]],wave:'sine'},
      ach:{seqs:[[523,.13,.09],[784,.13,.09],[1047,.13,.09],[1319,.2,.09]],wave:'square'},
    };
    const s=sounds[type]||sounds.tick;
    s.seqs.forEach(([freq,dur,vol],i)=>{
      const o=ctx.createOscillator();const g=ctx.createGain();
      o.connect(g);g.connect(ctx.destination);
      o.type=s.wave;o.frequency.value=freq;
      const t=ctx.currentTime+i*0.12;
      g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);
      o.start(t);o.stop(t+dur+.01);
    });
  }catch(e){}
}
function toggleSound(){S.soundOn=!S.soundOn;save();updateSoundUI();}
function toggleSoundSetting(){S.soundOn=!S.soundOn;save();updateSoundUI();}
function updateSoundUI(){
  const si=$('sound-icon');
  if(si){si.innerHTML=S.soundOn
    ?'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M19 5a9 9 0 010 14"/>'
    :'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>';}
  const tog=$('sound-toggle');if(tog)tog.classList.toggle('on',S.soundOn);
  const ind=$('sound-indicator');if(ind){ind.textContent=S.soundOn?'🔊 SOUND ON':'🔇 SOUND OFF';ind.classList.add('show');setTimeout(()=>ind.classList.remove('show'),1400);}
}

// ── MOOD ───────────────────────────────────────────────────
function setMood(val,el){
  document.querySelectorAll('.mood-btn').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');
  const td=todayStr();S.moodLog=S.moodLog||{};S.moodLog[td]=S.moodLog[td]||{};
  S.moodLog[td].mood=val;S.moodLog[td].date=td;
  updateMoodUI();save();
}
function setEnergy(val){
  document.querySelectorAll('.edot').forEach((d,i)=>d.classList.toggle('on',i<val));
  const td=todayStr();S.moodLog=S.moodLog||{};S.moodLog[td]=S.moodLog[td]||{};
  S.moodLog[td].energy=val;S.moodLog[td].date=td;
  updateMoodUI();save();
}
function updateMoodUI(){
  const td=todayStr();const m=S.moodLog&&S.moodLog[td];
  const mc=$('mood-checkin');const badge=$('mood-saved-badge');const lbl=$('mood-label');
  if(m&&(m.mood||m.energy)){
    if(mc)mc.classList.add('done-today');
    if(badge)badge.style.display='block';
    if(lbl)lbl.textContent='Today';
  }
}
function restoreMoodUI(){
  const td=todayStr();const m=S.moodLog&&S.moodLog[td];
  if(m){
    if(m.mood){const btns=document.querySelectorAll('.mood-btn');if(btns[m.mood-1])btns[m.mood-1].classList.add('sel');}
    if(m.energy){document.querySelectorAll('.edot').forEach((d,i)=>d.classList.toggle('on',i<m.energy));}
  }
  updateMoodUI();
  // Restore sleep log display values
  restoreSleepDisplayValues();
  // Restore water cups display
  renderWaterTracker();
  // Restore daily intention
  renderIntention();
}
function restoreSleepDisplayValues(){
  // Restore scheduled time trigger displays from habits
  S.habits.forEach(h=>{
    if(h.scheduledTime){
      const tv=$('time-trigger-val');
      // Only set if modal is for this habit (skip for now)
    }
  });
}

// ── VACATION MODE ──────────────────────────────────────────
function toggleVacation(){
  S.vacationMode=!S.vacationMode;
  const vt=$('vacation-toggle');if(vt)vt.classList.toggle('on',S.vacationMode);
  const ver=$('vacation-end-row');if(ver)ver.style.display=S.vacationMode?'flex':'none';
  if(S.vacationMode){unlockAch('a13');toast('🏖 Vacation mode ON — streaks protected!','info');}
  else{toast('🏋️ Vacation mode OFF — tracking resumed.','success');}
  save();renderAll();
}
function setVacationEnd(val){S.vacationEnd=val;save();}

// ── PWA INSTALL ────────────────────────────────────────────
let _deferredPrompt=null;
let _pwaInstalled=false;

// Deteksi apakah sudah berjalan sebagai installed PWA
if(window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone===true){
  _pwaInstalled=true;
}

window.addEventListener('beforeinstallprompt',e=>{
  e.preventDefault();_deferredPrompt=e;
  // Update semua tombol install (topbar + settings)
  ['pwa-install-btn','pwa-settings-btn'].forEach(id=>{
    const btn=$(id);if(btn)btn.style.display='flex';
  });
  _updatePWASettingsUI();
});

window.addEventListener('appinstalled',()=>{
  _pwaInstalled=true;_deferredPrompt=null;
  ['pwa-install-btn','pwa-settings-btn'].forEach(id=>{
    const btn=$(id);if(btn)btn.style.display='none';
  });
  _updatePWASettingsUI();
  toast('📲 OHT berhasil diinstall!','success');
});

function installPWA(){
  if(!_deferredPrompt){ toast('Gunakan menu browser → "Add to Home Screen"','info'); return; }
  _deferredPrompt.prompt();
  _deferredPrompt.userChoice.then(r=>{
    if(r.outcome==='accepted'){
      toast('📲 Installing OHT...','success');
    } else {
      toast('Install dibatalkan.','info');
    }
    _deferredPrompt=null;
    const btn=$('pwa-install-btn');if(btn)btn.style.display='none';
    _updatePWASettingsUI();
  });
}

function _updatePWASettingsUI(){
  const block=$('pwa-install-block');if(!block)return;
  const isStandalone=window.matchMedia('(display-mode: standalone)').matches||window.navigator.standalone===true;
  if(isStandalone){
    block.innerHTML=`<div style="display:flex;align-items:center;gap:9px;padding:4px 0;">
      <div style="width:8px;height:8px;background:var(--lime);flex-shrink:0;"></div>
      <div><div class="sr-label" style="color:var(--lime);">App Installed</div><div class="sr-desc">OHT berjalan sebagai app native</div></div>
    </div>`;
  } else if(_deferredPrompt){
    block.innerHTML=`<div class="setting-row">
      <div><div class="sr-label">Install sebagai App</div><div class="sr-desc">Tambahkan ke Home Screen untuk akses cepat</div></div>
      <button class="btn btn-sm btn-primary" id="pwa-settings-btn" onclick="installPWA()">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><rect x="5" y="2" width="14" height="20"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        INSTALL
      </button>
    </div>`;
  } else {
    block.innerHTML=`<div class="setting-row">
      <div><div class="sr-label">Install sebagai App</div><div class="sr-desc">Buka menu browser → "Add to Home Screen"</div></div>
      <button class="btn btn-sm" onclick="toast('Gunakan menu browser → Add to Home Screen','info')" style="opacity:.7;">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><rect x="5" y="2" width="14" height="20"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        MANUAL
      </button>
    </div>`;
  }
}

// ── INIT ───────────────────────────────────────────────────
// ── LOADING SCREEN ─────────────────────────────────────────
(function startLoader() {
  const loader  = document.getElementById('oht-loader');
  const fill    = document.getElementById('loader-fill');
  const pctEl   = document.getElementById('loader-pct');
  const statusEl= document.getElementById('loader-status');
  if (!loader || !fill) return;

  const stages = [
    { pct: 15,  label: 'LOADING ASSETS'   },
    { pct: 35,  label: 'RESTORING DATA'   },
    { pct: 58,  label: 'BUILDING HABITS'  },
    { pct: 74,  label: 'SYNCING STREAKS'  },
    { pct: 88,  label: 'ALMOST READY'     },
    { pct: 100, label: 'READY'            },
  ];

  let cur = 0;
  let stageIdx = 0;

  const tick = setInterval(() => {
    const target = stages[stageIdx].pct;
    // Maju 1–3% per tick, melambat saat mendekati target
    const step = Math.max(1, Math.ceil((target - cur) * 0.18));
    cur = Math.min(target, cur + step);

    fill.style.width    = cur + '%';
    pctEl.textContent   = cur + '%';
    statusEl.textContent= stages[stageIdx].label;

    if (cur >= target && stageIdx < stages.length - 1) {
      stageIdx++;
    }
    if (cur >= 100) {
      clearInterval(tick);
    }
  }, 28);

  // Simpan referensi supaya init() bisa dismiss setelah app siap
  window._loaderInterval = tick;
  window._dismissLoader = function() {
    clearInterval(window._loaderInterval);
    if (fill)   fill.style.width    = '100%';
    if (pctEl)  pctEl.textContent   = '100%';
    if (statusEl) statusEl.textContent = 'READY';
    setTimeout(() => {
      loader.style.transition = 'opacity .45s ease';
      loader.style.opacity    = '0';
      setTimeout(() => { loader.style.display = 'none'; }, 460);
    }, 220);
  };
})();

function init(){
  loadState();buildPickers();setTodayDate();setQuote();buildTemplateGrid();
  updateSoundUI();
  // FIX: dark mode icon sync on load
  if(S.darkMode){applyDark(true);}
  const ct=$('confetti-toggle');if(ct)ct.classList.toggle('on',S.confettiOn!==false);
  const vt=$('vacation-toggle');if(vt)vt.classList.toggle('on',!!S.vacationMode);
  const ver=$('vacation-end-row');if(ver)ver.style.display=S.vacationMode?'flex':'none';
  // Ensure only today page is active on start
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  const _initPage = $('page-today');
  if(_initPage) _initPage.classList.add('active');
  
  if(!S.onboardDone)showOnboarding();
  else{
    try{ renderAll(); } catch(e){ console.error('renderAll error:',e); }
    try{ restoreMoodUI(); } catch(e){}
  }
  const sn=$('st-name');if(sn&&S.name&&S.name!=='User')sn.value=S.name;
  // Init new features
  focusState.sessions=(S.focusSessions&&S.focusSessions[todayStr()])||0;
  updateFocusUI();
  setTimeout(checkLoginStreak, 800);
  // Anti-habit: reset failedToday flag on new day load
  if(S.antiHabits){
    const td=todayStr();
    S.antiHabits.forEach(a=>{
      if(a.lastResisted!==td) a.failedToday=false;
    });
  }
  // Init Firebase
  setTimeout(initFirebase, 500);
  // Init date filter labels (tampilkan hari ini)
  if(typeof initAllDateFilterLabels==='function') setTimeout(initAllDateFilterLabels, 100);
  // Dismiss loading screen setelah app siap
  if (typeof window._dismissLoader === 'function') window._dismissLoader();
  // Update PWA install block di settings
  setTimeout(_updatePWASettingsUI, 100);
}

function buildPickers(){
  const ep=$('emoji-picker');
  if(ep)ep.innerHTML=HABIT_ICONS.map((ic,i)=>`<div class="emoji-opt${i===0?' sel':''}" onclick="selEmoji(this,'${ic.id}')" title="${ic.id}"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ic.svg}</svg></div>`).join('');
  const cp=$('color-picker');if(cp)cp.innerHTML=COLORS.map((c,i)=>`<div class="color-opt${i===0?' sel':''}" style="background:${c}" onclick="selColor(this,'${c}')"></div>`).join('');
}

function populateStackPicker(editId){
  const sel=$('inp-stack');if(!sel)return;
  sel.innerHTML='<option value="">— None —</option>';
  S.habits.filter(h=>h.id!==editId).forEach(h=>{sel.innerHTML+=`<option value="${h.id}">${h.icon} ${h.name}</option>`;});
}

function setTodayDate(){
  const n=new Date();
  const days=['SUN','MON','TUE','WED','THU','FRI','SAT'];
  const months=['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
  setTxt('today-num',String(n.getDate()).padStart(2,'0'));
  setTxt('today-month',`${months[n.getMonth()]} ${n.getFullYear()}`);
  setTxt('today-wd',days[n.getDay()]);
}
function setQuote(){
  const q=QUOTES[new Date().getDay()%QUOTES.length];
  setTxt('quote-txt',q.q);setTxt('quote-src',`— ${q.a}`);
}

// ── RENDER ALL ─────────────────────────────────────────────

// ── Page view state (global) ──
let _reportViewDate   = null;
let _gardenViewDate   = null;
let _nutrViewDate     = null;
let _wellnessDate     = null;
let _journalViewDate  = null;
let _wellnessWaterMode = 'cups';

function renderAll(){
  const _r = (fn) => { try{ fn(); }catch(e){ console.error('RENDER ERROR ['+fn.name+']:', e.message); } };
  _r(renderStats);
  _r(renderTodayHabits);
  _r(renderAllHabits);
  _r(renderWeekChart);
  _r(renderStreaks);
  _r(renderInsightFeed);
  if(typeof renderAchievements==='function') _r(renderAchievements);
  if(typeof renderMissions==='function') _r(renderMissions);
  if(typeof renderChallenges==='function') _r(renderChallenges);
  _r(renderCommitments);
  _r(renderHistory);
  if(typeof renderReviewHistory==='function') _r(renderReviewHistory);
  _r(renderReport);
  _r(renderShare);
  _r(renderFreezeLog);
  if(typeof renderArchive==='function') _r(renderArchive);
  // garden rendered via navigate hook only
  if(typeof renderCalendar==='function') _r(renderCalendar);
  _r(renderGoals);
  _r(renderRituals);
  _r(renderAntiHabits);
  _r(renderROI);
  if(typeof renderCapsules==='function') _r(renderCapsules);
  if(typeof renderBestTimeCard==='function') _r(renderBestTimeCard);
  if(typeof renderWeeklySchedule==='function') _r(renderWeeklySchedule);
  if(typeof renderHabitCorrelations==='function') _r(renderHabitCorrelations);
  _r(checkAchievements);
}

// ── STATS ──────────────────────────────────────────────────
let _xpDisp=null;
function renderStats(){
  const total=S.habits.filter(h=>!h.archived).length;
  const done=S.habits.filter(h=>h.completedToday&&!h.archived).length;
  const pct=total>0?Math.round(done/total*100):0;
  const best=S.habits.filter(h=>!h.archived).reduce((m,h)=>Math.max(m,h.bestStreak||0),0);
  setTxt('s-pct',pct+'%');setTxt('s-sub',`${done} of ${total}`);setTxt('s-streak',best);setTxt('s-habits',total);
  setTxt('d-done',done);setTxt('d-total',total);setTxt('d-streak',best);
  const tx=S.xp||0;
  if(_xpDisp===null)_xpDisp=tx;
  if(_xpDisp!==tx){
    const step=Math.max(1,Math.ceil(Math.abs(tx-_xpDisp)/10));const dir=tx>_xpDisp?1:-1;
    const iv=setInterval(()=>{_xpDisp+=dir*step;if(dir>0?_xpDisp>=tx:_xpDisp<=tx){_xpDisp=tx;clearInterval(iv);}setTxt('s-xp',_xpDisp);setTxt('d-xp',_xpDisp);},25);
  } else {setTxt('s-xp',tx);setTxt('d-xp',tx);}
  const circ=125.7,off=circ-(pct/100)*circ;
  const ring=$('ring-circle');if(ring)ring.style.strokeDashoffset=off;
  setTxt('ring-pct',pct+'%');
  const msgs=['Start strong! 💪','Keep going! 🔥','Almost there! ⚡','PERFECT DAY! 🏆'];
  setTxt('daily-msg',msgs[pct<25?0:pct<60?1:pct<100?2:3]);
  const level=Math.max(1,Math.floor(tx/100)+1);const xpIn=tx%100;
  const ln=LVL_NAMES[Math.min(level-1,LVL_NAMES.length-1)];
  const xb=$('xp-bar');if(xb)xb.style.width=xpIn+'%';
  setTxt('xp-cur',xpIn);setTxt('xp-level',`LVL ${level} — ${ln}`);setTxt('xp-name',S.name||'User');
  // avatar is now canvas, rendered by renderHomeAvatar
  setTxt('freeze-count',S.freezes||0);setTxt('freeze-big-count',S.freezes||0);
  // FIX #14: danger state on freeze chip
  const chip=$('freeze-chip');
  const hasBigStreak=S.habits.some(h=>(h.streak||0)>=7);
  if(chip)chip.classList.toggle('danger',(S.freezes||0)===0&&hasBigStreak);
  setTxt('s-login',S.loginStreak||1);
  const badge=$('badge-habits');
  if(badge){if(total>0){badge.style.display='block';badge.textContent=total;}else badge.style.display='none';}
  // FIX: sync vacation toggle
  const vt=$('vacation-toggle');if(vt)vt.classList.toggle('on',!!S.vacationMode);

  if(typeof renderHomeAvatar==='function') setTimeout(renderHomeAvatar, 50);}

// ── DUE CHECK ──────────────────────────────────────────────
function isDueToday(h){ if(isRestDay()) return false;return isDueDateStr(h,todayStr());}
function isDueDateStr(h,ds){
  const f=h.freq||'daily';const d=new Date(ds+'T12:00:00');const day=d.getDay();const date=d.getDate();
  if(f==='daily')return true;if(f==='weekdays')return day>=1&&day<=5;
  if(f==='weekends')return day===0||day===6;if(f==='3x/week')return[1,3,5].includes(day);
  if(f==='weekly')return day===1;if(f==='monthly')return date===1;return true;
}
function isStreakAtRisk(h){
  return(h.streak||0)>=3&&!h.completedToday&&isDueToday(h)&&new Date().getHours()>=18;
}

// ── HABIT CARD ─────────────────────────────────────────────
function habitCard(h,view,pfx){
  pfx=pfx||'hc';
  const done=h.completedToday;const cat=CATS[h.category]||CATS.custom;
  const _hic=HABIT_ICONS.find(x=>x.id===h.icon)||HABIT_ICONS[Math.abs((h.id.charCodeAt(1)||0))%HABIT_ICONS.length]||HABIT_ICONS[0];
  const _hsvg='<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="'+h.color+'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+_hic.svg+'</svg>';
  const _catsvg=cat.svg?('<svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="'+cat.color+'" stroke-width="2" stroke-linecap="round">'+cat.svg+'</svg>'):'';
  const pct=h.target>1?Math.min(100,Math.round(((h.currentProgress||0)/h.target)*100)):100;
  const atRisk=isStreakAtRisk(h);
  const parent=h.stack?S.habits.find(x=>x.id===h.stack):null;
  const stackReady=parent&&parent.completedToday&&!done;
  const notesHtml=h.notes?`<div style="font-size:8px;color:var(--sub);font-style:italic;margin-top:1px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">📝 ${h.notes}</div>`:'';
  const timeHtml=h.scheduledTime?`<span class="time-badge"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${h.scheduledTime}</span>`:'';
  const stackHtml=parent?`<div class="stack-chain"><span style="font-size:9px;color:var(--sub)">⛓</span><span class="stack-badge">after ${parent.icon} ${parent.name}</span></div>`:'';
  const progBadge=h.progressive&&h.progressive!=='none'?`<span class="prog-level-badge"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>+${({slow:'10',medium:'20',fast:'30'})[h.progressive]}%/wk</span>`:'';
  const pausedBadge=h.paused?`<span class="paused-badge"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> PAUSED</span>`:'';
  const vacBadge=S.vacationMode?`<span class="paused-badge"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/></svg> VACATION</span>`:'';
  let extra='';
  if(view==='weekly'){
    const dNames=['S','M','T','W','T','F','S'];const td=new Date().getDay();
    extra=`<div class="weekly-calendar">${dNames.map((dn,i)=>{const wl=(h.weekLog||[])[i];const cls=i<td?(wl?'done':'missed'):(i===td?(h.completedToday?'done':'today'):'future');return `<div class="wc-day"><div class="wdot ${cls}" style="width:12px;height:12px;"></div><span>${dn}</span></div>`;}).join('')}</div>`;
  } else if(view==='monthly'){
    const today=new Date();const dim=new Date(today.getFullYear(),today.getMonth()+1,0).getDate();
    const ml=h.monthLog||{};const doneDays=Object.values(ml).filter(Boolean).length;
    const pctM=Math.round(doneDays/Math.max(1,today.getDate())*100);
    extra=`<div class="monthly-prog-wrap"><div class="monthly-prog-track"><div class="monthly-prog-fill" style="width:${pctM}%;background:${h.color}"></div></div><span style="font-family:'IBM Plex Mono',monospace;font-size:8px;font-weight:700;">${doneDays}/${today.getDate()}d</span></div><div class="monthly-days-grid">${Array.from({length:dim},(_,i)=>{const day=i+1,td2=today.getDate();const cls=day===td2?'today':(day<td2?(ml[day]?'done':'missed'):'future');return `<div class="mday ${cls}"></div>`;}).join('')}</div>`;
  }
  return `<div class="habit-card${done?' completed':''}${stackReady?' stacked-ready':''}" id="${pfx}-${h.id}" draggable="true"
    ondragstart="dragStart(event,'${h.id}','${pfx}')" ondragover="dragOver(event)" ondrop="dragDrop(event,'${h.id}')" ondragleave="dragLeave(event)" ondragend="dragEnd()">
    <div class="habit-color-strip" style="background:${h.color}"></div>
    <div class="habit-swipe-indicator"><span>✓</span></div>
    <div class="habit-check${done?' checked':''}" onclick="${S.vacationMode||h.paused?'':'toggleHabit(\''+h.id+'\',\''+pfx+'\')'}" style="${S.vacationMode||h.paused?'opacity:.3;cursor:not-allowed;':''}">${done?'✓':''}</div>
    <div class="habit-icon" style="color:${h.color}">${_hsvg}</div>
    <div class="habit-info">
      <div class="habit-name" onclick="event.stopPropagation();openHabitDetail('${h.id}')" style="cursor:pointer;" title="${h.name}">${h.name.length>28?h.name.slice(0,27)+'…':h.name}</div>
      <div class="habit-meta">
        <span class="h-tag" style="background:${cat.color}22;border-color:${cat.color}">${_catsvg} ${cat.label}</span>
        <span class="h-streak"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linecap="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-7 7c-1.86 0-3.516-.5-4.862-1.5A7 7 0 012 17"/></svg>${h.streak||0}</span>
        ${atRisk?'<span class="streak-risk"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg> AT RISK</span>':''}
        ${timeHtml}${progBadge}${pausedBadge}${vacBadge}
        ${(!view||view==='daily')?`<div class="week-dots">${weekDots(h)}</div>`:''}
      </div>
      ${notesHtml}${stackHtml}${extra}
    </div>
    ${h.target>1?`<div class="habit-prog"><div class="prog-bar"><div class="prog-fill" style="width:${done?100:pct}%;background:${h.color}"></div></div><div class="prog-lbl">${h.currentProgress||0}/${h.target}</div></div>`:''}
    <div class="habit-expand-btn" onclick="toggleHabitActions(event,'${h.id}','${pfx}')">···</div>
    <div class="habit-actions">
      ${h.target>1&&!done&&!S.vacationMode&&!h.paused?`<button class="btn btn-xs btn-success" onclick="incHabit('${h.id}','${pfx}')">+1</button>`:''}
      ${!done&&!h.skippedToday&&isDueToday(h)?`<button class="btn btn-xs" onclick="skipHabitToday('${h.id}')" title="Skip today (streak safe)" style="font-size:9px;color:var(--orange);">⏭</button>`:h.skippedToday?`<span class="skip-badge"><svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg> SKIP</span>`:''}
      <button class="btn btn-xs" onclick="togglePauseHabit('${h.id}')" title="${h.paused?'Resume':'Pause'}" style="padding:4px 6px;">${h.paused?`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polygon points="5 3 19 12 5 21 5 3"/></svg>`:`<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`}</button>
      <button class="btn btn-xs${h.pinned?' btn-cyan':''}" onclick="togglePinHabit('${h.id}')" title="Pin" style="padding:4px 6px;">${h.pinned?'<svg viewBox="0 0 24 24" width="11" height="11" fill="var(--cyan)" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>':'<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>'}</button>
<button class="btn btn-xs" onclick="editHabit('${h.id}')" title="Edit" style="padding:4px 6px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      ${!h.archived?`<button class="btn btn-xs" onclick="archiveHabit('${h.id}')" title="Archive" style="padding:4px 6px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg></button>`:''}
      <button class="btn btn-xs btn-danger" onclick="confirmDelete('${h.id}')" title="Delete" style="padding:4px 6px;"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg></button>
    </div>
  </div>`;
}

function weekDots(h){
  const td=new Date().getDay();
  return Array.from({length:7},(_,i)=>{const wl=(h.weekLog||[])[i];const cls=i===td?(h.completedToday?'done':'today'):(i<td?(wl?'done':'missed'):'future');return `<div class="wdot ${cls}"></div>`;}).join('');
}

function togglePauseHabit(id){const h=S.habits.find(x=>x.id===id);if(!h)return;h.paused=!h.paused;save();renderAll();toast(h.paused?`⏸ "${h.name}" paused`:`▶ "${h.name}" resumed`,'info');}

// ── RENDER TODAY ────────────────────────────────────────────
function renderTodayHabits(){
  const list=$('today-habits-list');if(!list)return;
  const activeHabits=S.habits.filter(h=>!h.archived);
  if(!activeHabits.length){list.innerHTML=getEmptyState("habits");return;}
  const due=activeHabits.filter(h=>isDueToday(h)&&!h.paused);
  const _due_sorted = [...due].sort((a,b)=>(b.pinned?1:0)-(a.pinned?1:0));
  const show=_due_sorted.filter(h=>S.todayFilter==='done'?h.completedToday:S.todayFilter==='pending'?!h.completedToday:true);
  renderTodayAntiHabitsMini();
  renderTodayGoalsMini();
  renderHabitWeather();
  let html='';
  if(_todayGroupByTime && show.length) {
    const groups = {morning:[],afternoon:[],evening:[],night:[],anytime:[]};
    show.forEach(h => groups[getTimeOfDay(h.scheduledTime||'')].push(h));
    const glabels = {morning:'Morning',afternoon:'Afternoon',evening:'Evening',night:'Night',anytime:'Anytime'};
    const gicons = {morning:'🌅',afternoon:'☀️',evening:'🌙',night:'🌃',anytime:'⚡'};
    Object.entries(groups).forEach(([time, habits]) => {
      if(!habits.length) return;
      html += `<div style="font-family:'IBM Plex Mono',monospace;font-size:7px;text-transform:uppercase;color:var(--sub);letter-spacing:1px;padding:5px 0 3px;">${gicons[time]} ${glabels[time]}</div>`;
      html += habits.map(h=>habitCard(h,'daily','th')).join('');
    });
    if(!html) html = getEmptyState('habits');
  } else {
    html = show.length?show.map(h=>habitCard(h,'daily','th')).join(''):getEmptyState('habits');
  }
  list.innerHTML=html;
}

// ── RENDER HABITS PAGE ──────────────────────────────────────
function renderAllHabits(){
  // Always exclude archived habits
  const active=S.habits.filter(h=>!h.archived);
  const daily=active.filter(h=>DAILY_FREQS.includes(h.freq||'daily'));
  const weekly=active.filter(h=>h.freq==='weekly');
  const monthly=active.filter(h=>h.freq==='monthly');
  setTxt('daily-count-badge',daily.length);setTxt('weekly-count-badge',weekly.length);setTxt('monthly-count-badge',monthly.length);
  const sf=arr=>{
    const cat=S.habitsCatFilter||'all';
    let f=cat==='all'?arr:arr.filter(h=>h.category===cat);
    if(S.habitsSort==='streak')return[...f].sort((a,b)=>(b.streak||0)-(a.streak||0));
    if(S.habitsSort==='name')return[...f].sort((a,b)=>a.name.localeCompare(b.name));
    if(S.habitsSort==='cat')return[...f].sort((a,b)=>(a.category||'').localeCompare(b.category||''));
    return f;
  };
  const rL=(id,arr,view,empty)=>{const el=$(id);if(!el)return;const s=sf(arr);el.innerHTML=s.length?s.map(h=>habitCard(h,view,'hc')).join(''):`<div class="empty"><div class="empty-icon" style="display:flex;justify-content:center;">${empty.i}</div><div class="empty-title">${empty.t}</div></div>`;};
  rL('daily-habits-list',daily,'daily',{i:'<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',t:'NO DAILY HABITS'});
  rL('weekly-habits-list',weekly,'weekly',{i:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#bbb" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="17"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>',t:'NO WEEKLY HABITS'});
  rL('monthly-habits-list',monthly,'monthly',{i:'<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="#bbb" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="3" width="18" height="18"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="3" y1="15" x2="21" y2="15"/><line x1="9" y1="3" x2="9" y2="21"/><line x1="15" y1="3" x2="15" y2="21"/></svg>',t:'NO MONTHLY HABITS'});
}

// ── TOGGLE / INCREMENT ──────────────────────────────────────
function _baseToggleHabit(id,pfx){
  const h=S.habits.find(x=>x.id===id);if(!h||S.vacationMode||h.paused)return;
  window._wasChecked=h.completedToday;
  if(!h.completedToday){
    h.completedToday=true;h.currentProgress=h.target;
    const f=h.freq||'daily';
    // Simpan streak sebelum naik untuk keperluan uncheck yang akurat
    h._streakBefore=h.streak||0;
    if(DAILY_FREQS.includes(f))h.streak=(h.streak||0)+1;
    else if(f==='weekly'){const wk=getWeekMon();if(h.lastWeekChecked!==wk){h.streak=(h.streak||0)+1;h.lastWeekChecked=wk;}}
    else if(f==='monthly'){const mo=getMonthStr();if(h.lastMonthChecked!==mo){h.streak=(h.streak||0)+1;h.lastMonthChecked=mo;}}
    h.bestStreak=Math.max(h.bestStreak||0,h.streak||0);
    h.weekLog=h.weekLog||Array(7).fill(false);h.weekLog[new Date().getDay()]=true;
    S._perfectDayShownToday=null;
    h.monthLog=h.monthLog||{};h.monthLog[new Date().getDate()]=true;
    h.totalDone=(h.totalDone||0)+1;
    // XP berdasarkan frekuensi: daily=10, weekly=70, monthly=300
    const f2=h.freq||'daily';
    const xp=f2==='monthly'?300:f2==='weekly'?70:10;
    h.todayXp=(h.todayXp||0)+xp;S.xp=(S.xp||0)+xp;
    S.history=S.history.filter(e=>!(e.habitId===h.id&&e.date===todayStr()&&!e.locked));
    S.history.unshift({id:'t_'+h.id+'_'+Date.now(),habitId:h.id,habitName:h.name,habitIcon:h.icon,category:h.category,date:todayStr(),status:'done',xp,locked:false});
    playSound('tick');toast(`✅ ${h.name} +${xp} XP`,'success');
    if(S.confettiOn!==false)confetti(4);
    const stacked=S.habits.filter(sh=>sh.stack===h.id&&!sh.completedToday&&!sh.paused);
    if(stacked.length)setTimeout(()=>toast(`⛓ Next: ${stacked[0].icon} ${stacked[0].name}`,'info'),500);
    const dueH=S.habits.filter(x=>isDueToday(x)&&!x.paused&&!x.archived);
    if(dueH.length>0&&dueH.every(x=>x.completedToday)){
      setTimeout(()=>{playSound('perfect');if(S.confettiOn!==false)confetti(30);toast('🏆 PERFECT DAY!','success');},350);
    }
    const prevLvl=Math.max(1,Math.floor((S.xp-xp)/100)+1);const newLvl=Math.max(1,Math.floor(S.xp/100)+1);
    if(newLvl>prevLvl)setTimeout(()=>{playSound('levelup');toast(`🎉 LVL ${newLvl} — ${LVL_NAMES[Math.min(newLvl-1,LVL_NAMES.length-1)]}`,'success');},450);
  } else {
    // FIX 4: kembalikan streak ke nilai sebelum check (bukan sekedar -1)
    const xpBack=h.todayXp||getDifficultyXP(h);
    h.completedToday=false;h.currentProgress=0;
    h.streak=typeof h._streakBefore==='number'?h._streakBefore:Math.max(0,(h.streak||1)-1);
    h._streakBefore=undefined;
    h.weekLog=h.weekLog||Array(7).fill(false);h.weekLog[new Date().getDay()]=false;
    h.monthLog=h.monthLog||{};h.monthLog[new Date().getDate()]=false;
    // Kembalikan lastWeekChecked/lastMonthChecked kalau streak dikembalikan
    const f=h.freq||'daily';
    if(f==='weekly'&&h.streak<(h._streakBefore||0))h.lastWeekChecked=null;
    if(f==='monthly'&&h.streak<(h._streakBefore||0))h.lastMonthChecked=null;
    h.totalDone=Math.max(0,(h.totalDone||1)-1);h.todayXp=0;S.xp=Math.max(0,(S.xp||0)-xpBack);
    S.history=S.history.filter(e=>!(e.habitId===h.id&&e.date===todayStr()&&!e.locked));
    playSound('uncheck');toast(`↩ ${h.name} unchecked`,'info');
  }
  [`hc-${id}`,`th-${id}`].forEach(cid=>{
    const c=$(cid);if(!c)return;
    const chk=c.querySelector('.habit-check');
    c.classList.add('pop');setTimeout(()=>c.classList.remove('pop'),350);
    if(chk){
      const cls=_wasChecked?'just-unchecked':'just-checked';
      chk.classList.add(cls);setTimeout(()=>chk.classList.remove(cls),400);
    }
  });
  _invalidateStrengthCache();
  // Check perfect day
  setTimeout(()=>{ const active=S.habits.filter(h=>!h.archived); const due=active.filter(h=>isDueToday(h)&&!h.paused); if(due.length>0&&due.every(h=>h.completedToday)&&!S._perfectDayShownToday){S._perfectDayShownToday=todayStr();setTimeout(showPerfectDay,400);} },200);
  updateMissions();save();renderAll();
}

function incHabit(id,pfx){const h=S.habits.find(x=>x.id===id);if(!h||h.completedToday)return;h.currentProgress=(h.currentProgress||0)+1;if(h.currentProgress>=h.target)toggleHabit(id,pfx);else{save();renderAll();}}
function completeAll(){
  const p=S.habits.filter(h=>!h.completedToday&&isDueToday(h)&&!h.paused&&!S.vacationMode&&!h.archived);
  if(!p.length){toast('All done!','info');return;}
  const curWeek=getWeekMon();const curMonth=getMonthStr();
  // FIX 5+7: streak logic konsisten dengan _baseToggleHabit, pakai getDifficultyXP
  p.forEach(h=>{
    window._wasChecked=false;
    h.completedToday=true;h.currentProgress=h.target;
    const f=h.freq||'daily';
    h._streakBefore=h.streak||0;
    if(DAILY_FREQS.includes(f)){
      h.streak=(h.streak||0)+1;
    } else if(f==='weekly'){
      const wk=curWeek;
      if(h.lastWeekChecked!==wk){h.streak=(h.streak||0)+1;h.lastWeekChecked=wk;}
    } else if(f==='monthly'){
      const mo=curMonth;
      if(h.lastMonthChecked!==mo){h.streak=(h.streak||0)+1;h.lastMonthChecked=mo;}
    }
    h.bestStreak=Math.max(h.bestStreak||0,h.streak||0);
    h.weekLog=h.weekLog||Array(7).fill(false);h.weekLog[new Date().getDay()]=true;
    h.monthLog=h.monthLog||{};h.monthLog[new Date().getDate()]=true;
    h.totalDone=(h.totalDone||0)+1;
    const f2c=h.freq||'daily';
    const xp=f2c==='monthly'?300:f2c==='weekly'?70:10;
    h.todayXp=(h.todayXp||0)+xp;
    S.xp=(S.xp||0)+xp;
    S.history=S.history||[];
    S.history.unshift({id:'t_'+h.id+'_'+Date.now(),habitId:h.id,habitName:h.name,habitIcon:h.icon,category:h.category,date:todayStr(),status:'done',xp,locked:false});
    haptic('success');
  });
  _invalidateStrengthCache();
  updateMissions();save();
  playSound('perfect');
  if(S.confettiOn!==false)confetti(20);
  toast(`All ${p.length} done!`,'success');
  setTimeout(()=>{
    const al=S.habits.filter(h=>!h.archived);
    if(al.length&&al.every(h=>h.completedToday))saveJournalEntry('');
  },400);
  renderAll();
}

// ── CUSTOM CONFIRM DELETE ───────────────────────────────────
let _pendingDeleteId=null;
function confirmDelete(id){
  const h=S.habits.find(x=>x.id===id);if(!h)return;
  _pendingDeleteId=id;
  setTxt('confirm-habit-name',`${h.icon} ${h.name}`);
  $('confirm-dialog').classList.add('open');
}
function closeConfirm(){$('confirm-dialog').classList.remove('open');_pendingDeleteId=null;}
function executeDelete(){
  if(!_pendingDeleteId)return;
  const id=_pendingDeleteId;closeConfirm();
  const h=S.habits.find(x=>x.id===id);if(!h)return;
  S.habits=S.habits.filter(x=>x.id!==id);
  S.habits.forEach(sh=>{if(sh.stack===id)sh.stack='';});
  S.history=(S.history||[]).filter(e=>e.habitId!==id);
  if(S.lockedDays)Object.keys(S.lockedDays).forEach(d=>{if(S.lockedDays[d])S.lockedDays[d]=S.lockedDays[d].filter(s=>s.habitId!==id);});
  _invalidateStrengthCache();toast(`"${h.name}" deleted`,'error');updateMissions();save();renderAll();
}

// ── FREEZE ─────────────────────────────────────────────────
function earnFreeze(amount,reason){
  S.freezes=(S.freezes||0)+amount;S.freezeLog=S.freezeLog||[];
  S.freezeLog.unshift({date:todayStr(),reason,earned:amount,used:false});
  unlockAch('a8');save();renderStats();renderFreezeLog();
  toast(`❄ +${amount} Freeze${amount>1?'s':''} earned!`,'info');
}
function renderFreezeLog(){
  const el=$('freeze-log-list');if(!el)return;
  const log=S.freezeLog||[];
  if(!log.length){el.innerHTML=`<div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);text-align:center;padding:13px;">No freeze activity yet</div>`;return;}
  el.innerHTML=log.slice(0,30).map(l=>`<div style="display:flex;align-items:center;gap:7px;padding:6px 0;border-bottom:1px solid var(--bg);font-size:10px;"><span style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);flex-shrink:0;min-width:60px;">${l.date}</span><span style="flex:1;">${l.reason}</span><span style="font-weight:700;font-family:'IBM Plex Mono',monospace;font-size:9px;color:${l.earned?'var(--cyan)':'var(--orange)'};">${l.earned?'+'+l.earned+'❄':'-1❄'}</span></div>`).join('');
}

// ── MISSIONS ───────────────────────────────────────────────
function updateMissions(){
  if(!S.missions?.length)S.missions=MISSIONS.map(m=>({...m,progress:0,completed:false}));
  const best=S.habits.reduce((m,h)=>Math.max(m,h.streak||0),0);
  const perfectDays=S.lockedDays?Object.values(S.lockedDays).filter(snap=>snap.length>0&&snap.every(h=>h.completed)).length:0;
  const weeklyBest=Math.max(0,...S.habits.filter(h=>h.freq==='weekly').map(h=>h.streak||0),0);
  S.missions.forEach(m=>{
    if(m.completed)return;
    let prog=0;
    if(m.type==='streak')prog=best;else if(m.type==='perfect_days')prog=perfectDays;
    else if(m.type==='habit_count')prog=S.habits.filter(h=>!h.archived).length;else if(m.type==='xp')prog=S.xp||0;
    else if(m.type==='weekly_streak')prog=weeklyBest;
    m.progress=Math.min(prog,m.goal);
    if(m.progress>=m.goal){m.completed=true;earnFreeze(m.reward,`Mission: ${m.title}`);}
  });
}
function renderMissions(){
  const el=$('missions-list');if(!el)return;
  if(!S.missions?.length)S.missions=MISSIONS.map(m=>({...m,progress:0,completed:false}));
  el.innerHTML=S.missions.map(m=>{const pct=Math.min(100,Math.round(((m.progress||0)/m.goal)*100));return `<div class="mission-card"><div class="mc-header"><div class="mc-icon">${m.icon}</div><div style="flex:1;"><div class="mc-title">${m.title}</div><div class="mc-reward">❄ +${m.reward} Freeze${m.reward>1?'s':''}</div></div>${m.completed?'<div class="mc-status-done">✓ DONE</div>':''}</div><div class="mc-desc">${m.desc}</div>${!m.completed?`<div class="mc-prog-track"><div class="mc-prog-fill" style="width:${pct}%"></div></div><div class="mc-footer"><span>${m.progress||0}/${m.goal}</span><span>${pct}%</span></div>`:`<div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--lime);">✓ ${m.reward} freeze${m.reward>1?'s':''} earned</div>`}</div>`;}).join('');
}

// ── ACHIEVEMENTS ───────────────────────────────────────────
let achQueue=[];
function checkAchievements(){
  if(!S.achievements?.length)S.achievements=ACHIEVEMENTS.map(a=>({...a,unlocked:false}));
  const done=S.habits.filter(h=>h.completedToday).length;
  const best=S.habits.reduce((m,h)=>Math.max(m,h.bestStreak||0),0);
  const perfectDays=S.lockedDays?Object.values(S.lockedDays).filter(snap=>snap.length>0&&snap.every(h=>h.completed)).length:0;
  if(S.habits.length>=1)unlockAch('a1');if(best>=3)unlockAch('a2');if(best>=7)unlockAch('a3');
  if(done===S.habits.filter(h=>!h.archived).length&&S.habits.filter(h=>!h.archived).length>0)unlockAch('a4');if(best>=30)unlockAch('a5');
  if(S.habits.length>=5)unlockAch('a6');if((S.xp||0)>=500)unlockAch('a7');
  if((S.freezes||0)>0)unlockAch('a8');if(perfectDays>=7)unlockAch('a9');
  if(S.habits.some(h=>h.stack))unlockAch('a10');
  if(S.habits.some(h=>h.progressive&&h.progressive!=='none'))unlockAch('a11');
}
function unlockAch(id){
  if(!S.achievements)return;const a=S.achievements.find(x=>x.id===id);
  if(a&&!a.unlocked){a.unlocked=true;S.xp=(S.xp||0)+a.xp;achQueue.push(a);if(achQueue.length===1)displayNextAch();save();}
}
function displayNextAch(){
  if(!achQueue.length)return;const a=achQueue[0];
  setTxt('ach-popup-icon',a.icon);setTxt('ach-popup-title',a.title);setTxt('ach-popup-desc',a.desc);setTxt('ach-popup-xp','+'+a.xp+' XP');
  $('ach-popup').classList.add('open');playSound('ach');if(S.confettiOn!==false)confetti(20);
}
function closeAchPopup(){$('ach-popup').classList.remove('open');achQueue.shift();if(achQueue.length)setTimeout(displayNextAch,400);}
function renderAchievements(){
  const grid=$('ach-grid');if(!grid)return;
  if(!S.achievements)S.achievements=ACHIEVEMENTS.map(a=>({...a,unlocked:false}));
  grid.innerHTML=S.achievements.map(a=>`<div class="ach-card${a.unlocked?'':' locked'}">${a.unlocked?'<div class="ach-unlocked-badge">✓</div>':''}<div class="ach-icon">${a.icon}</div><div class="ach-title">${a.title}</div><div class="ach-desc">${a.desc}</div><div class="ach-xp">+${a.xp} XP</div></div>`).join('');
}

// ── STREAKS ────────────────────────────────────────────────
function getStreakTier(s) {
  // Api TikTok style — perubahan di kelipatan 50
  if(s>=200) return {fire:'🖤',label:'OBSIDIAN',c:'#FFE600',bg:'#1A1A1A',border:'#FFE600'};
  if(s>=150) return {fire:'❤️‍🔥',label:'INFERNO',c:'#FF3636',bg:'#FF363618',border:'#FF3636'};
  if(s>=100) return {fire:'💙',label:'ICE FIRE',c:'#00B4FF',bg:'#00B4FF18',border:'#00B4FF'};
  if(s>=50)  return {fire:'💜',label:'VIOLET',c:'#9B5DE5',bg:'#9B5DE518',border:'#9B5DE5'};
  if(s>=21)  return {fire:'🔥',label:'HOT',c:'#FF6B00',bg:'#FF6B0018',border:'#FF6B00'};
  if(s>=7)   return {fire:'🔥',label:'WARMING',c:'#FFE600',bg:'#FFE60018',border:'#FFE600'};
  if(s>=3)   return {fire:'✨',label:'RISING',c:'#aaa',bg:'transparent',border:'#555'};
  return {fire:'○',label:'STARTING',c:'#666',bg:'transparent',border:'#333'};
}

function makeStreakCard(name, streak, best, label='') {
  const s = streak||0;
  const t = getStreakTier(s);
  return `<div class="streak-card" style="border-color:${t.border};background:color-mix(in srgb,${t.border} 5%,var(--surface));">
    <div class="streak-fire" style="font-size:22px;">${t.fire}</div>
    <div class="streak-num" style="color:${t.c};font-size:32px;">${s}</div>
    <div class="streak-name" style="font-size:10px;">${label||name}</div>
    <div class="streak-badge" style="background:${t.bg};border:1px solid ${t.border};color:${t.c};font-size:7px;padding:2px 7px;margin-top:4px;font-family:'IBM Plex Mono',monospace;">${t.label}</div>
    <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);margin-top:3px;">BEST: ${best||0}</div>
  </div>`;
}

function renderStreaks(){
  const board=$('streak-board');if(!board)return;
  const sorted=[...S.habits].filter(h=>!h.archived).sort((a,b)=>(b.streak||0)-(a.streak||0));

  // Habit streak cards
  let cards = sorted.map(h => makeStreakCard(
    `${h.icon} ${h.name}`, h.streak||0, h.bestStreak||0
  ));

  // Water + Sleep streak masuk di sini juga
  try {
    const ws = JSON.parse(localStorage.getItem('oht_wellness_streaks')||'{}');
    cards.push(makeStreakCard('💧 Water', ws.waterStreak||0, ws.waterBest||0));
    cards.push(makeStreakCard('😴 Sleep', ws.sleepStreak||0, ws.sleepBest||0));
  } catch(e){}

  if(!cards.length){board.innerHTML=getEmptyState("streaks");return;}
  board.innerHTML=cards.join('');
}

// ── CHALLENGES ─────────────────────────────────────────────
function renderChallenges(){
  const el=$('challenges-list');if(!el)return;
  el.innerHTML=CHALLENGES.map(c=>{const pct=Math.round((c.progress||0)/c.goal*100);return `<div class="challenge-card"><div class="cc-header"><div class="cc-icon">${c.icon}</div><div><div class="cc-title">${c.title}</div><div class="cc-meta">${c.progress||0}/${c.goal}d</div></div></div><div class="cc-desc">${c.desc}</div><div class="cc-prog-track"><div class="cc-prog-fill" style="width:${pct}%;background:${c.color}"></div></div><div class="cc-footer"><span>${pct}%</span><span>${c.goal-(c.progress||0)} left</span></div></div>`;}).join('');
}

// ── COMMITMENTS ────────────────────────────────────────────
function renderCommitments(){
  const el=$('commitment-section');if(!el)return;
  const hs=S.habits.filter(h=>h.stake?.trim());
  if(!hs.length){el.innerHTML=`<div style="font-size:10px;color:var(--sub);padding:9px;border:var(--bo);background:var(--bg);">No commitments yet. Add a "Commitment Stake" when creating a habit.</div>`;return;}
  el.innerHTML=hs.map(h=>{
    const cm=getConsecutiveMisses(h.id);const total=(S.history||[]).filter(e=>e.habitId===h.id&&e.status==='missed').length;
    const warn=cm>=3;
    return `<div class="contract-card"${warn?' style="border-color:var(--red);animation:none;"':''}>
      <div class="contract-header"><span style="font-size:18px;">🤝</span><div><div class="contract-title">${h.icon} ${h.name}</div></div>${warn?'<span style="font-family:\'IBM Plex Mono\',monospace;font-size:8px;color:var(--red);font-weight:700;margin-left:auto;">⚠ PAY UP</span>':''}</div>
      <div class="contract-stake">⚠ ${h.stake}</div>
      <div style="display:flex;gap:11px;font-family:\'IBM Plex Mono\',monospace;font-size:8px;"><span>Total missed: <strong style="color:var(--red)">${total}</strong></span><span>Consecutive: <strong style="color:${cm>=3?'var(--red)':'var(--muted)'}">${cm}</strong></span></div>
    </div>`;
  }).join('');
}
function getConsecutiveMisses(habitId){
  let count=0;const today=new Date();
  for(let i=1;i<=30;i++){const d=new Date(today);d.setDate(d.getDate()-i);const ds=d.toISOString().split('T')[0];const snap=S.lockedDays&&S.lockedDays[ds];if(!snap)break;const hs=snap.find(s=>s.habitId===habitId);if(hs&&!hs.completed)count++;else break;}
  return count;
}

// ── INSIGHT FEED ───────────────────────────────────────────
function addInsight(text,source){
  S.insightFeed=S.insightFeed||[];
  S.insightFeed.unshift({date:todayStr(),text,source});
  if(S.insightFeed.length>50)S.insightFeed=S.insightFeed.slice(0,50);
  save();
}
function renderInsightFeed(){
  const el=$('insight-feed');if(!el)return;
  const feed=(S.insightFeed||[]).filter(f=>_insightFilter==='all'||f.source===_insightFilter);
  const allFeed=S.insightFeed||[];
  if(!feed.length){el.innerHTML=getEmptyState("insights");return;}
  el.innerHTML=feed.slice(0,10).map(f=>`<div class="insight-item"><div class="insight-meta">${f.date} · ${f.source||'AI COACH'}</div><div class="insight-text">${f.text}</div></div>`).join('');
}

// ── HISTORY ────────────────────────────────────────────────
function setHistoryFilter(f,el){S.historyFilter=f;document.querySelectorAll('#page-history .ptab').forEach(t=>t.classList.remove('active'));el.classList.add('active');renderHistory();}
function renderHistory(){
  const list=$('history-list');const countEl=$('history-count');if(!list)return;
  const now=new Date();let filtered=S.history||[];
  if(_historyCatFilter&&_historyCatFilter!=='all') filtered=filtered.filter(h=>h.category===_historyCatFilter);
  if(S.historyFilter==='week'){const c=new Date(now);c.setDate(c.getDate()-7);filtered=filtered.filter(h=>new Date(h.date)>=c);}
  else if(S.historyFilter==='month'){const c=new Date(now);c.setDate(c.getDate()-30);filtered=filtered.filter(h=>new Date(h.date)>=c);}
  if(countEl)countEl.textContent=`${filtered.length} entries`;
  list.innerHTML=filtered.slice(0,200).map(e=>`<div class="history-row" style="border-left:3px solid ${e.locked?'var(--lime)':'var(--orange)'};">
    <div class="hrow-date">${e.date}</div><div class="hrow-icon">${e.habitIcon||'note'}</div>
    <div class="hrow-name">${e.habitName||'?'}</div><div class="hrow-status done"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="var(--lime)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><polyline points="20 6 9 17 4 12"/></svg></div><div class="hrow-xp">+${e.xp||10}</div>
  </div>`).join('')||`<div class="empty"><div class="empty-icon"><svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#bbb" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="17"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg></div><div class="empty-title">NO HISTORY</div></div>`;
}
function renderReviewHistory(){
  const el=$('review-history-list');if(!el)return;
  const reviews=S.weeklyReviews||[];
  if(!reviews.length){el.innerHTML=`<div style="font-size:10px;color:var(--sub);padding:9px;border:var(--bo);background:var(--bg);">No reviews yet. Complete your first Weekly Review!</div>`;return;}
  el.innerHTML=reviews.slice(0,10).map(r=>`<div class="review-hist-item">
    <div class="rhi-week">${r.week}</div>
    ${r.win?`<div class="rhi-section"><div class="rhi-label">🏆 Went well</div>${r.win}</div>`:''}
    ${r.hard?`<div class="rhi-section"><div class="rhi-label">⚠ Was hard</div>${r.hard}</div>`:''}
    ${r.change?`<div class="rhi-section"><div class="rhi-label">🎯 To change</div>${r.change}</div>`:''}
  </div>`).join('');
}

// ── REPORT ─────────────────────────────────────────────────
function setReportPeriod(p,el){S.reportPeriod=p;save();document.querySelectorAll('#page-report .ptab').forEach(t=>t.classList.remove('active'));el.classList.add('active');renderReport();}
function renderReport(){
  const today=new Date();
  const todayS=today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0')+'-'+String(today.getDate()).padStart(2,'0');
  const rp=S.reportPeriod||'daily';let label='',dates=[];
  // Jika ada filter tanggal aktif dan mode daily, gunakan tanggal filter
  const filterDate = (typeof _reportViewDate !== 'undefined' && _reportViewDate) ? _reportViewDate : null;
  if(rp==='daily'){label=filterDate?filterDate:'Today';dates=[filterDate||todayS];}
  else if(rp==='weekly'){const d=new Date(today);d.setDate(d.getDate()-6);while(d<=today){dates.push(d.toISOString().split('T')[0]);d.setDate(d.getDate()+1);}label='Last 7 Days';}
  else{const d=new Date(today);d.setDate(d.getDate()-29);while(d<=today){dates.push(d.toISOString().split('T')[0]);d.setDate(d.getDate()+1);}label='Last 30 Days';}
  document.querySelectorAll('#page-report .ptab').forEach(t=>{const oc=t.getAttribute('onclick')||'';t.classList.toggle('active',oc.includes(`'${rp}'`));});
  setTxt('report-period-label',label);
  const hist=S.history||[];const pl=hist.filter(h=>dates.includes(h.date));const dl=pl.filter(h=>h.status==='done');
  const activeHabitsCount=S.habits.filter(h=>!h.archived).length;
  const rate=dates.length>0&&activeHabitsCount>0?Math.round(dl.length/(dates.length*Math.max(1,activeHabitsCount))*100):0;
  const xpE=dl.reduce((s,h)=>s+(h.xp||10),0);const actD=[...new Set(dl.map(h=>h.date))].length;
  const best=S.habits.reduce((m,h)=>Math.max(m,h.bestStreak||0),0);
  const kc=$('report-key-stats');
  if(kc)kc.innerHTML=[{v:dl.length,l:'Done',c:'yellow'},{v:rate+'%',l:'Rate',c:'pink'},{v:xpE,l:'XP',c:'cyan'},{v:actD,l:'Active Days',c:'lime'},{v:activeHabitsCount,l:'Habits',c:'orange'},{v:best,l:'Best Streak',c:'purple'}].map(s=>`<div class="report-stat stat-card ${s.c}"><div class="rs-val">${s.v}</div><div class="rs-lbl">${s.l}</div></div>`).join('');
  const CC=['#0057FF','#7B2FBE','#FF3CAC','#FF6B00','#FFE600','#AAFF00','#00F5D4'];
  const ch=$('report-chart'),chl=$('report-chart-labels');
  if(ch){
    const mx=Math.max(1,S.habits.filter(h=>!h.archived).length);
    ch.innerHTML=dates.map((ds,i)=>{const cnt=hist.filter(h=>h.date===ds&&h.status==='done').length;const ht=Math.max(cnt?3:2,Math.min(88,Math.round(cnt/mx*88)));return `<div class="bar-col"><div class="bar-fill" style="height:${ht}px;max-height:88px;background:${CC[i%CC.length]};"></div></div>`;}).join('');
    if(chl)chl.innerHTML=dates.map(ds=>{const d=new Date(ds);const dl2=['Su','Mo','Tu','We','Th','Fr','Sa'];return `<div class="chart-day-lbl">${rp==='monthly'?d.getDate():dl2[d.getDay()]}</div>`;}).join('');
  }
  const mc=$('mood-correlation-card');
  if(mc){
    const md=S.moodLog||{};const corr=dates.map(ds=>{const m=md[ds];const cnt=hist.filter(h=>h.date===ds&&h.status==='done').length;const mx2=Math.max(1,S.habits.filter(h=>!h.archived).length);return{date:ds,mood:m?.mood||0,energy:m?.energy||0,completion:Math.round(cnt/mx2*100)};}).filter(d=>d.mood>0);
    if(corr.length<2){mc.innerHTML=`<div style="font-size:10px;color:var(--sub);">Complete more mood check-ins to see correlation (${corr.length} day${corr.length!==1?'s':''} so far, need 2+).</div>`;}
    else{
      const hi=corr.filter(d=>d.mood>=4);const lo=corr.filter(d=>d.mood<=2);
      const avgHi=hi.length?Math.round(hi.reduce((s,d)=>s+d.completion,0)/hi.length):0;
      const avgLo=lo.length?Math.round(lo.reduce((s,d)=>s+d.completion,0)/lo.length):0;
      const diff=avgHi-avgLo;
      mc.innerHTML=`<div style="font-family:'Archivo Black',sans-serif;font-size:11px;margin-bottom:8px;">MOOD × COMPLETION <span style="font-size:9px;font-family:'IBM Plex Mono',monospace;color:var(--sub);">(${corr.length} days)</span></div>
      <div style="display:flex;gap:11px;margin-bottom:9px;">
        <div style="flex:1;text-align:center;"><div style="font-family:'Archivo Black',sans-serif;font-size:20px;color:var(--lime)">${avgHi}%</div><div style="font-size:8px;color:var(--sub);">On 😊🔥 days</div></div>
        <div style="flex:1;text-align:center;"><div style="font-family:'Archivo Black',sans-serif;font-size:20px;color:var(--red)">${avgLo}%</div><div style="font-size:8px;color:var(--sub);">On 😫😕 days</div></div>
        <div style="flex:1;text-align:center;"><div style="font-family:'Archivo Black',sans-serif;font-size:20px;color:${diff>0?'var(--lime)':'var(--red)'}">${diff>0?'+':''}${diff}%</div><div style="font-size:8px;color:var(--sub);">Difference</div></div>
      </div>
      <div style="display:flex;gap:2px;align-items:flex-end;height:44px;">${corr.slice(-14).map(d=>`<div style="flex:1;height:${d.completion}%;max-height:44px;min-height:2px;background:${['','#FF1744','#FF6B00','#FFE600','#AAFF00','#00F5D4'][d.mood]||'#eee'};border:1px solid var(--bc);" title="${d.date}: mood ${MOOD_EMOJIS[d.mood]}, ${d.completion}%"></div>`).join('')}</div>`;
    }
  }
  // Habit Performance — dipisah daily/weekly/monthly
  const DAILY_FREQS_RP=['daily','weekdays','weekends','3x/week'];
  const activeH=S.habits.filter(h=>!h.archived);
  const fireHtml=`<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linecap="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-7 7"/></svg>`;
  const starHtml=`<svg viewBox="0 0 24 24" width="10" height="10" fill="var(--yellow)" stroke="var(--yellow)" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
  function buildPerfRow(h) {
    const hl=pl.filter(l=>l.habitId===h.id&&l.status==='done');
    const r=Math.min(100,Math.round(hl.length/Math.max(1,dates.length)*100));
    const ic=HABIT_ICONS.find(x=>x.id===h.icon)||HABIT_ICONS[0];
    const iconHtml=`<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="${h.color}" stroke-width="2" stroke-linecap="round">${ic.svg}</svg>`;
    return `<tr><td style="display:flex;align-items:center;gap:5px;">${iconHtml} ${h.name}</td><td><strong>${r}%</strong></td><td>${hl.length}</td><td style="color:var(--orange)">${fireHtml}${h.streak||0}</td><td>${h.bestStreak||0}</td><td style="color:var(--orange)">${starHtml}${(h.totalDone||0)*10}</td></tr>`;
  }
  const emptyRow=`<tr><td colspan="6" style="text-align:center;color:var(--sub);padding:10px;font-size:9px;">Tidak ada</td></tr>`;
  const pbd=$('perf-body-daily');
  if(pbd){const dh=activeH.filter(h=>DAILY_FREQS_RP.includes(h.freq||'daily'));pbd.innerHTML=dh.map(buildPerfRow).join('')||emptyRow;}
  const pbw=$('perf-body-weekly');
  if(pbw){const wh=activeH.filter(h=>h.freq==='weekly');pbw.innerHTML=wh.map(buildPerfRow).join('')||emptyRow;}
  const pbm=$('perf-body-monthly');
  if(pbm){const mh=activeH.filter(h=>h.freq==='monthly');pbm.innerHTML=mh.map(buildPerfRow).join('')||emptyRow;}
  // legacy fallback if old perf-body still exists
  const pb=$('perf-body');
  if(pb) pb.innerHTML='';
  const cb=$('cat-breakdown');
  if(cb){
    const ah=S.habits.filter(h=>!h.archived);
    const cm={};ah.forEach(h=>{cm[h.category]=(cm[h.category]||0)+1;});
    const tot=ah.length||1;
    const svgIcon=(svgPath,color)=>`<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round">${svgPath}</svg>`;
    cb.innerHTML=Object.entries(cm).map(([cat,cnt])=>{
      const c=CATS[cat]||CATS.custom;
      const p=Math.round(cnt/tot*100);
      const icSvg=c.svg?svgIcon(c.svg,c.color):'';
      return `<div class="cat-bar-row"><div class="cat-bar-meta"><span style="display:flex;align-items:center;gap:4px;">${icSvg} ${c.label}</span><span>${cnt} (${p}%)</span></div><div class="cat-bar-track"><div class="cat-bar-fill" style="width:${p}%;background:${c.color}"></div></div></div>`;
    }).join('')||'<div style="font-size:10px;color:var(--sub);">No habits</div>';
  }
  const hg=$('heatmap-grid');
  if(hg){const tod=new Date();const cells=[];for(let w=25;w>=0;w--){for(let d=0;d<7;d++){const dt=new Date(tod);dt.setDate(dt.getDate()-(w*7+(tod.getDay()-d)));const ds=dt.toISOString().split('T')[0];const cnt=hist.filter(h=>h.date===ds&&h.status==='done').length;const lv=cnt===0?0:cnt<2?1:cnt<4?2:cnt<6?3:4;cells.push(`<div class="hm-cell l${lv}" title="${ds}:${cnt}"></div>`);}}hg.innerHTML=cells.join('');}
}

// ── SHARE + DNA ─────────────────────────────────────────────
function renderShare(){
  setTxt('sc-name',(S.name||'USER').toUpperCase());setTxt('sc-date',todayStr());
  const done=S.habits.filter(h=>h.completedToday&&!h.archived).length;const best=S.habits.filter(h=>!h.archived).reduce((m,h)=>Math.max(m,h.bestStreak||0),0);
  setTxt('sc-done',done);setTxt('sc-streak',best);setTxt('sc-xp-val',S.xp||0);
  const hr=$('sc-habits-row');if(hr)hr.innerHTML=S.habits.filter(h=>h.completedToday&&!h.archived).map(h=>`<div class="sc-habit-chip">${h.icon} ${h.name}</div>`).join('');
}
function copyShareText(){
  const done=S.habits.filter(h=>h.completedToday&&!h.archived).length;const best=S.habits.filter(h=>!h.archived).reduce((m,h)=>Math.max(m,h.bestStreak||0),0);
  const ht=S.habits.filter(h=>h.completedToday).map(h=>`${h.icon} ${h.name}`).join(', ');
  const txt=`🦁 OHT v4 — ${todayStr()}\n👤 ${S.name||'User'}\n✅ ${done}/${S.habits.length} habits\n🔥 ${best} day streak\n⭐ ${S.xp||0} XP${ht?'\n\nDone: '+ht:''}`;
  navigator.clipboard.writeText(txt).then(()=>toast('📤 Copied!','success')).catch(()=>toast('Copy failed','error'));
}
function exportDNA(){
  const cats={};S.habits.forEach(h=>{cats[h.category]=(cats[h.category]||0)+1;});
  const topCat=Object.entries(cats).sort((a,b)=>b[1]-a[1])[0];
  const dna={version:'oht-dna-v1',name:S.name,exportDate:todayStr(),totalXp:S.xp,bestStreak:S.habits.reduce((m,h)=>Math.max(m,h.bestStreak||0),0),totalHabits:S.habits.length,dominantCategory:topCat?topCat[0]:'none',habits:S.habits.map(h=>({name:h.name,icon:h.icon,color:h.color,category:h.category,freq:h.freq,target:h.target,progressive:h.progressive||'none',stack:'',stake:h.stake||'',scheduledTime:h.scheduledTime||'',notes:h.notes||''}))};
  const blob=new Blob([JSON.stringify(dna,null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`oht_dna_${S.name||'user'}_${todayStr()}.json`;a.click();
  unlockAch('a14');toast('🧬 Habit DNA exported!','success');
}

// ── DNA IMPORT ─────────────────────────────────────────────
function dnaFileImport(){
  const inp=document.createElement('input');inp.type='file';inp.accept='.json';
  inp.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{const ta=$('dna-paste-input');if(ta)ta.value=ev.target.result;};r.readAsText(f);};inp.click();
}
function applyDNAImport(){
  const ta=$('dna-paste-input');if(!ta||!ta.value.trim()){toast('Paste DNA JSON first!','error');return;}
  try{
    const dna=JSON.parse(ta.value.trim());
    if(dna.version!=='oht-dna-v1'||!dna.habits){toast('Invalid DNA format!','error');return;}
    dna.habits.forEach(d=>{S.habits.push({id:'h'+Date.now()+Math.floor(Math.random()*9999),...d,completedToday:false,currentProgress:0,streak:0,bestStreak:0,totalDone:0,weekLog:Array(7).fill(false),monthLog:{},todayXp:0,baseTarget:d.target,createdAt:new Date().toISOString()});});
    toast(`🧬 ${dna.habits.length} habits imported from ${dna.name||'someone'}!`,'success');
    ta.value='';updateMissions();save();renderAll();closeModal('modal-dna-import');
  }catch(e){toast('Invalid JSON!','error');}
}

// ── AI COACH (using fetch with CORS proxy workaround) ───────
async function callAI(prompt,maxTokens=200){
  // Try direct Anthropic API (works if CORS is allowed from claude.ai origin)
  try{
    const res=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json','anthropic-dangerous-direct-browser-access':'true'},
      body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:maxTokens,messages:[{role:'user',content:prompt}]})
    });
    if(!res.ok)throw new Error('API error '+res.status);
    const data=await res.json();
    return data.content?.map(c=>c.text||'').join('')||'';
  }catch(e){
    // Fallback: meaningful static response based on stats
    const done=S.habits.filter(h=>h.completedToday).length;const total=S.habits.length;const best=S.habits.reduce((m,h)=>Math.max(m,h.bestStreak||0),0);
    const topH=[...S.habits].sort((a,b)=>(b.streak||0)-(a.streak||0))[0];
    const weakH=S.habits.filter(h=>!h.completedToday&&isDueToday(h))[0];
    const fallbacks=[
      topH?`${topH.icon} ${topH.name} is your strongest habit at ${topH.streak} days. That consistency is real. Now apply the same discipline to ${weakH?weakH.name:'your other habits'}.`:`You have ${total} habits tracked. Consistency beats intensity every time.`,
      `${done}/${total} done today. ${done===total?'Perfect execution.':done>total/2?'Strong effort. Finish the last few.':'The day isn\'t over yet. Pick one habit and do it now.'}`,
      best>0?`Your best streak is ${best} days. Streaks don't build themselves — they're built by not stopping.`:'Start your first streak today. Day 1 is the hardest.',
    ];
    return fallbacks[Math.floor(Math.random()*fallbacks.length)];
  }
}

function typeWriter(el,text,speed=15){
  el.textContent='';let i=0;
  const type=()=>{if(i<text.length){el.textContent+=text[i++];setTimeout(type,speed);}};
  type();
}

async function refreshCoach(){
  const bubble=$('coach-bubble');if(!bubble)return;
  bubble.textContent='';bubble.classList.add('loading');
  unlockAch('a12');
  const done=S.habits.filter(h=>h.completedToday).length;const total=S.habits.length;
  const best=S.habits.reduce((m,h)=>Math.max(m,h.bestStreak||0),0);
  const weakH=S.habits.filter(h=>!h.completedToday&&isDueToday(h))[0];
  const topH=[...S.habits].sort((a,b)=>(b.streak||0)-(a.streak||0))[0];
  const mToday=S.moodLog&&S.moodLog[todayStr()];
  const moodStr=mToday?`Mood: ${MOOD_EMOJIS[mToday.mood]||'?'}, Energy: ${mToday.energy||'?'}/5.`:'No mood check-in yet.';
  const prompt=`You are OHT COACH inside the OHT app. Be direct, specific, tough-love coaching. Max 3 sentences. No fluff.

User: ${S.name||'User'} | Today: ${done}/${total} (${total?Math.round(done/total*100):0}%) | Best streak: ${best}d
Top habit: ${topH?`${topH.icon} ${topH.name} (${topH.streak}d)`:'none'} | At risk: ${weakH?`${weakH.icon} ${weakH.name}`:'none'}
${moodStr} | XP: ${S.xp||0} | Habits: ${S.habits.map(h=>`${h.name}(🔥${h.streak||0})`).slice(0,5).join(', ')||'none'}

Give ONE sharp personalized insight. Reference specific habit names. Tough coach tone.`;
  const text=await callAI(prompt,150);
  bubble.classList.remove('loading');
  typeWriter(bubble,text,16);
  S.coachHistory=S.coachHistory||[];S.coachHistory.unshift({date:todayStr(),text,q:null});
  if(S.coachHistory.length>30)S.coachHistory=S.coachHistory.slice(0,30);
  addInsight(text,'AI COACH');save();
}

async function askCoach(){
  const input=$('coach-input');const bubble=$('coach-bubble');
  if(!input||!bubble||!input.value.trim())return;
  const question=input.value.trim();input.value='';
  bubble.textContent='';bubble.classList.add('loading');unlockAch('a12');
  const ctx=`User ${S.name||'User'}: ${S.habits.length} habits, ${S.xp||0} XP, best streak ${S.habits.reduce((m,h)=>Math.max(m,h.bestStreak||0),0)}d, today ${S.habits.filter(h=>h.completedToday).length}/${S.habits.length} done.`;
  const prompt=`OHT COACH. Direct. Max 3 sentences. ${ctx}\n\nUser asks: "${question}"\n\nAnswer concisely and actionably.`;
  const text=await callAI(prompt,180);
  bubble.classList.remove('loading');
  typeWriter(bubble,text,15);
  S.coachHistory=S.coachHistory||[];S.coachHistory.unshift({date:todayStr(),text,q:question});
  if(S.coachHistory.length>30)S.coachHistory=S.coachHistory.slice(0,30);
  addInsight(`Q: ${question} → ${text}`,'AI COACH');save();
}

// ── WEEKLY REVIEW ──────────────────────────────────────────
function openWeeklyReview(){
  const week=getWeekMon();setTxt('review-week-label',`Week of ${week}`);
  const dates=[];const d=new Date(week);for(let i=0;i<7;i++){dates.push(d.toISOString().split('T')[0]);d.setDate(d.getDate()+1);}
  const wl=(S.history||[]).filter(h=>dates.includes(h.date)&&h.status==='done');
  const actD=[...new Set(wl.map(h=>h.date))].length;
  const perfD=dates.filter(ds=>{const snap=S.lockedDays&&S.lockedDays[ds];return snap&&snap.length>0&&snap.every(h=>h.completed);}).length;
  const weekXp=wl.reduce((s,h)=>s+(h.xp||10),0);
  const rs=$('review-stats');
  if(rs)rs.innerHTML=[{v:wl.length,l:'Done'},{v:actD+'/7',l:'Active'},{v:perfD,l:'Perfect'},{v:weekXp,l:'XP Earned'},{v:S.freezes||0,l:'Freezes'},{v:S.habits.reduce((m,h)=>Math.max(m,h.bestStreak||0),0),l:'Best Streak'}].map(s=>`<div class="review-stat"><div class="rev-val">${s.v}</div><div class="rev-lbl">${s.l}</div></div>`).join('');
  const last=S.weeklyReviews?.find(r=>r.week===week);
  ['review-win','review-hard','review-change'].forEach(id=>{const el=$(id);if(el)el.value=last?last[id.replace('review-','')]||'':'';}); 
  const air=$('review-ai-result');if(air)air.style.display='none';
  $('review-overlay').classList.add('open');
}
function closeReview(){$('review-overlay').classList.remove('open');}
function saveReview(){
  const week=getWeekMon();
  const win=$('review-win')?.value||'';const hard=$('review-hard')?.value||'';const change=$('review-change')?.value||'';
  S.weeklyReviews=S.weeklyReviews||[];S.weeklyReviews=S.weeklyReviews.filter(r=>r.week!==week);
  S.weeklyReviews.unshift({week,date:todayStr(),win,hard,change});
  if(S.weeklyReviews.length>52)S.weeklyReviews=S.weeklyReviews.slice(0,52);
  save();closeReview();toast('📋 Review saved! +1 ❄','success');earnFreeze(1,'Weekly Review completed');
}
async function getAIReviewInsight(){
  const win=$('review-win')?.value||'';const hard=$('review-hard')?.value||'';const change=$('review-change')?.value||'';
  if(!win&&!hard&&!change){toast('Fill at least one field first!','error');return;}
  toast('🦁 Getting AI insight...','info');
  const wl=(S.history||[]).filter(h=>{const diff=(Date.now()-new Date(h.date))/(864e5);return diff<=7&&h.status==='done';});
  const prompt=`OHT COACH doing weekly review for ${S.name||'User'}. Concise. Max 4 sentences.\n\nWeek data: ${wl.length} completions, habits: ${S.habits.map(h=>`${h.name}(🔥${h.streak||0})`).slice(0,6).join(', ')||'none'}\nWent well: "${win}"\nWas hard: "${hard}"\nTo change: "${change}"\n\nOne insight connecting their reflection to their data. One specific next-week action.`;
  const text=await callAI(prompt,200);
  const air=$('review-ai-result');if(air){air.style.display='block';typeWriter(air,text,12);}
  addInsight(`Weekly Review insight: ${text}`,'WEEKLY REVIEW');save();
}

// ── COACH HISTORY MODAL ────────────────────────────────────
function openModal(id){
  const ov=$(id);if(!ov)return;
  ov.classList.add('open');
  if(id==='modal-coach-history')renderCoachHistoryModal();
}
function renderCoachHistoryModal(){
  const el=$('coach-history-body');if(!el)return;
  const hist=S.coachHistory||[];
  if(!hist.length){el.innerHTML=`<div style="font-size:10px;color:var(--sub);text-align:center;padding:18px;">No coach history yet.</div>`;return;}
  el.innerHTML=hist.slice(0,20).map(h=>`<div class="coach-history-item"><div class="chi-date">${h.date}</div>${h.q?`<div class="chi-q">Q: ${h.q}</div>`:''}<div class="chi-text">${h.text}</div></div>`).join('');
}
function closeModal(id){$(id).classList.remove('open');}

// ── WEEK CHART ─────────────────────────────────────────────
function renderWeekChart(){
  const el=$('week-chart');const lel=$('week-labels');if(!el)return;
  const today=new Date();const CC=['#0057FF','#7B2FBE','#FF3CAC','#FF6B00','#FFE600','#AAFF00','#00F5D4'];
  const data=Array.from({length:7},(_,i)=>{const d=new Date(today);d.setDate(d.getDate()-(6-i));const ds=d.toISOString().split('T')[0];const cnt=(S.history||[]).filter(h=>h.date===ds&&h.status==='done').length;const mx=Math.max(1,S.habits.filter(h=>!h.archived).length);return{pct:Math.min(100,Math.round(cnt/mx*100)),color:CC[i],cnt};});
  el.innerHTML=data.map(d=>`<div class="bar-col"><div class="bar-fill" style="height:${Math.max(d.cnt?3:2,d.pct*70/100)}px;max-height:70px;background:${d.color};"></div></div>`).join('');
  if(lel)lel.innerHTML=['MON','TUE','WED','THU','FRI','SAT','SUN'].map(d=>`<div class="chart-day-lbl">${d}</div>`).join('');
}

// ── DRAG & DROP ────────────────────────────────────────────
let dragId=null;
function dragStart(e,id,pfx){dragId=id;e.dataTransfer.effectAllowed='move';setTimeout(()=>{[`hc-${id}`,`th-${id}`].forEach(cid=>{const c=$(cid);if(c)c.classList.add('dragging');});},0);}
function dragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';e.currentTarget.classList.add('drag-over');}
function dragLeave(e){e.currentTarget.classList.remove('drag-over');}
function dragEnd(){document.querySelectorAll('.habit-card').forEach(c=>c.classList.remove('dragging','drag-over'));}
function dragDrop(e,targetId){e.preventDefault();e.currentTarget.classList.remove('drag-over');if(!dragId||dragId===targetId)return;const fi=S.habits.findIndex(h=>h.id===dragId);const ti=S.habits.findIndex(h=>h.id===targetId);if(fi===-1||ti===-1)return;const[moved]=S.habits.splice(fi,1);S.habits.splice(ti,0,moved);dragId=null;save();renderAll();}

// ── ADD/EDIT HABIT ─────────────────────────────────────────
function openAddModal(){resetForm();populateStackPicker('');updateProgDifficultyVisibility();openModal('modal-add');setTimeout(()=>{const n=$('inp-name');if(n)n.focus();},300);}
function resetForm(){
  $('edit-id').value='';$('inp-name').value='';
  const _notes=$('inp-notes');if(_notes)_notes.value='';
  $('inp-target').value='1';
  $('inp-cat').value='health';$('inp-freq').value='daily';
  const _stake=$('inp-stake');if(_stake)_stake.value='';
  const pt=$('inp-time');if(pt)pt.value='';
  const pp=$('inp-prog');if(pp)pp.value='none';
  $('sel-emoji').value='⭐';$('sel-color').value=COLORS[0];
  document.querySelectorAll('.emoji-opt').forEach((e,i)=>e.classList.toggle('sel',i===0));
  document.querySelectorAll('.color-opt').forEach((e,i)=>e.classList.toggle('sel',i===0));
  document.querySelectorAll('.freq-btn').forEach((e,i)=>e.classList.toggle('sel',i===0));
  $('modal-title').textContent='ADD NEW HABIT';
}
function updateProgDifficultyVisibility(){
  const freq=$('inp-freq');const pg=$('prog-difficulty-group');
  if(pg&&freq)pg.style.display=DAILY_FREQS.includes(freq.value)?'block':'none';
}
function saveHabit(){
  const name=$('inp-name').value.trim();if(!name){toast('Enter a habit name!','error');return;}
  const editId=$('edit-id').value;
  const progressive=$('inp-prog')?.value||'none';
  const data={name,icon:$('sel-emoji').value,color:$('sel-color').value,category:$('inp-cat').value,freq:$('inp-freq').value,target:parseInt($('inp-target').value)||1,notes:$('inp-notes').value,progressive,stack:$('inp-stack')?.value||'',stake:$('inp-stake')?.value||'',scheduledTime:$('inp-time')?.value||'',difficulty:$('inp-difficulty')?.value||'medium'};
  if(editId){const h=S.habits.find(x=>x.id===editId);if(h){Object.assign(h,data);if(data.progressive!=='none')h.baseTarget=h.baseTarget||data.target;}toast(`"${name}" updated!`,'info');}
  else{S.habits.push({id:'h'+Date.now(),...data,completedToday:false,currentProgress:0,streak:0,bestStreak:0,totalDone:0,weekLog:Array(7).fill(false),monthLog:{},todayXp:0,baseTarget:data.target,createdAt:new Date().toISOString()});toast(`"${name}" added!`,'success');}
  _invalidateStrengthCache();updateMissions();save();renderAll();closeModal('modal-add');
}
function editHabit(id){
  const h=S.habits.find(x=>x.id===id);if(!h)return;
  populateStackPicker(id);
  $('edit-id').value=id;$('inp-name').value=h.name;$('inp-notes').value=h.notes||'';$('inp-target').value=h.target||1;$('inp-cat').value=h.category||'health';$('inp-freq').value=h.freq||'daily';$('sel-emoji').value=h.icon;$('sel-color').value=h.color;
  if($('inp-stake'))$('inp-stake').value=h.stake||'';if($('inp-prog'))$('inp-prog').value=h.progressive||'none';if($('inp-stack'))$('inp-stack').value=h.stack||'';if($('inp-time'))$('inp-time').value=h.scheduledTime||'';
  // Select emoji by id (SVG-based picker)
  document.querySelectorAll('.emoji-opt').forEach(e=>e.classList.toggle('sel',(e.getAttribute('onclick')||'').includes(`'${h.icon}'`)));
  document.querySelectorAll('.color-opt').forEach(e=>e.classList.toggle('sel',(e.getAttribute('onclick')||'').includes(h.color)));
  document.querySelectorAll('.freq-btn').forEach(e=>e.classList.toggle('sel',(e.getAttribute('onclick')||'').includes(`'${h.freq||'daily'}'`)));
  // Sync SVG triggers
  const catCfg=SELECT_CONFIGS.cat.options.find(o=>o.value===(h.category||'health'));
  const catT=$('trigger-cat');
  if(catT&&catCfg){const i=catT.querySelector('.cst-icon');const l=catT.querySelector('.cst-label');if(i)i.innerHTML=catCfg.svg?`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${catCfg.svg}</svg>`:catCfg.icon||'';if(l)l.textContent=catCfg.label;}
  const progCfg=SELECT_CONFIGS.prog.options.find(o=>o.value===(h.progressive||'none'));
  const progT=$('trigger-prog');
  if(progT&&progCfg){const i=progT.querySelector('.cst-icon');const l=progT.querySelector('.cst-label');if(i)i.innerHTML=progCfg.svg?`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${progCfg.svg}</svg>`:progCfg.icon||'';if(l)l.textContent=progCfg.label;}
  const parent=h.stack?S.habits.find(x=>x.id===h.stack):null;
  const stackT=$('trigger-stack');
  if(stackT){const i=stackT.querySelector('.cst-icon');const l=stackT.querySelector('.cst-label');if(parent){if(i){const pic=HABIT_ICONS.find(x=>x.id===parent.icon);i.innerHTML=pic?`<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${pic.svg}</svg>`:parent.icon;}if(l)l.textContent=parent.name;}else{if(i)i.innerHTML='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>';if(l)l.textContent='— None —';}}
  // Sync time trigger
  const tv=$('time-trigger-val');if(tv)tv.textContent=h.scheduledTime||'Tap to set time';
  $('modal-title').textContent='EDIT HABIT';
  updateProgDifficultyVisibility();openModal('modal-add');
}

// ── PICKERS ────────────────────────────────────────────────
function selEmoji(el,e){document.querySelectorAll('.emoji-opt').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');$('sel-emoji').value=e;}
function selColor(el,c){document.querySelectorAll('.color-opt').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');$('sel-color').value=c;}
function selFreq(el,f){document.querySelectorAll('.freq-btn').forEach(x=>x.classList.remove('sel'));el.classList.add('sel');$('inp-freq').value=f;updateProgDifficultyVisibility();}

// ── TEMPLATES ──────────────────────────────────────────────
function buildTemplateGrid(){const grid=$('template-grid');if(!grid)return;grid.innerHTML=HABIT_TEMPLATES.map(t=>`<div class="template-card" id="tc-${t.id}" onclick="selectTemplate('${t.id}')"><div class="tc-icon">${t.icon}</div><div class="tc-title">${t.title}</div><div class="tc-count">${t.count} habits</div></div>`).join('');}
function selectTemplate(id){S.selTemplate=id;document.querySelectorAll('.template-card').forEach(c=>c.classList.toggle('selected',c.id===`tc-${id}`));const t=HABIT_TEMPLATES.find(x=>x.id===id);const prev=$('template-preview');if(prev&&t){prev.style.display='block';prev.innerHTML=`<div style="font-family:'IBM Plex Mono',monospace;font-size:8px;font-weight:700;text-transform:uppercase;margin-bottom:5px;">INCLUDES:</div>`+t.habits.map(h=>`<div style="display:flex;align-items:center;gap:5px;font-size:10px;padding:2px 0;border-bottom:1px solid var(--bg);">${h.icon} ${h.name}<span style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);margin-left:auto;">${h.freq}</span></div>`).join('');}}
function applyTemplate(){if(!S.selTemplate){toast('Select a template!','error');return;}const t=HABIT_TEMPLATES.find(x=>x.id===S.selTemplate);if(!t)return;t.habits.forEach(d=>{S.habits.push({id:'h'+Date.now()+Math.floor(Math.random()*9999),...d,completedToday:false,currentProgress:0,streak:0,bestStreak:0,totalDone:0,weekLog:Array(7).fill(false),monthLog:{},todayXp:0,baseTarget:d.target,createdAt:new Date().toISOString()});});toast(`✅ ${t.count} habits from "${t.title}" added!`,'success');S.selTemplate=null;document.querySelectorAll('.template-card').forEach(c=>c.classList.remove('selected'));const prev=$('template-preview');if(prev)prev.style.display='none';updateMissions();save();renderAll();closeModal('modal-templates');}

// ── NAVIGATION ─────────────────────────────────────────────
function navigate(page){
  // 1. Set all pages inactive
  document.querySelectorAll('.page').forEach(p=>{
    p.classList.remove('active');
  });
  document.querySelectorAll('.bnav-item').forEach(n=>n.classList.remove('active'));

  // 2. Set target page active
  const pg=$('page-'+page);
  if(!pg){ return; }
  pg.classList.add('active');

  // 3. Nav highlight
  const mainPages=['today','habits','wellness','friends'];
  if(mainPages.includes(page)){
    const nb=$('bnav-'+page);if(nb)nb.classList.add('active');
    const bm=$('bnav-more');if(bm)bm.classList.remove('active');
  } else {
    const bm=$('bnav-more');if(bm)bm.classList.add('active');
  }

  // 4. Scroll reset
  const ms=$('main-scroll');
  if(ms) ms.scrollTop=0;

  // 5. Page-specific extra init
  if(page==='calendar'){calYear=new Date().getFullYear();calMonth=new Date().getMonth();}
  if(page==='focus'){buildFocusHabitPicker();updateFocusUI();if(typeof updateSWDisplay==='function')updateSWDisplay();}
  if(page==='nutrition'){initNutritionPage();}
  if(page==='streaks'){if(typeof renderWellnessStreakCards==='function')renderWellnessStreakCards();}
  if(page==='journal'){initJournalPage();}
  if(page==='report'){_reportViewDate=null;initReportPage();}
  if(page==='wellness'){initWellnessPage();}
  if(page==='garden'){initGardenPage();}
  if(page==='profile'){initProfilePage();}
  if(page==='shop'){initShopPage();}
  if(page==='friends'){initFriendsPage();}
  if(page==='settings'){if(typeof renderSettingsAuth==='function') setTimeout(renderSettingsAuth,100);}
  if(page==='jadwal'){initJadwalPage();}

  // 6. Render - small timeout to ensure DOM paint completes
  setTimeout(function(){
    renderAll();
    if(ms) ms.scrollTop=0;
  }, 0);
}

// ── SORT & FILTER ───────────────────────────────────────────
function setHabitsSort(val,el){S.habitsSort=val;document.querySelectorAll('#habits-sort-tabs .ctab').forEach(t=>t.classList.remove('active'));el.classList.add('active');renderAllHabits();}
function setHabitsCatFilter(val,el){S.habitsCatFilter=val;document.querySelectorAll('#habits-cat-tabs .ctab').forEach(t=>t.classList.remove('active'));el.classList.add('active');renderAllHabits();}
function setTodayFilter(f,el){S.todayFilter=f;document.querySelectorAll('#today-filter-tabs .ctab').forEach(t=>t.classList.remove('active'));el.classList.add('active');renderTodayHabits();}

// ── DARK MODE (FIX: proper icon sync) ──────────────────────
function applyDark(on){
  document.documentElement.setAttribute('data-theme',on?'dark':'light');
  const dt=$('dark-toggle');if(dt)dt.classList.toggle('on',on);
  const ti=$('theme-icon');
  if(ti){ti.innerHTML=on
    ?'<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'
    :'<path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>';}
}
function toggleDark(){S.darkMode=!S.darkMode;applyDark(S.darkMode);save();}

// ── ONBOARDING ─────────────────────────────────────────────
function showOnboarding(){$('onboarding').classList.add('open');}
function obNext(step){if(step<0)return;if(step===2){const n=$('ob-name-input').value.trim();if(n)S.name=n;}document.querySelectorAll('.onboard-step').forEach((s,i)=>s.classList.toggle('active',i===step));document.querySelectorAll('.onboard-dot').forEach((d,i)=>d.classList.toggle('active',i===step));}
function obFinish(){const n=$('ob-name-input').value.trim();if(n)S.name=n;S.onboardDone=true;S.freezes=3;S.freezeLog=[{date:todayStr(),reason:'Welcome gift',earned:3,used:false}];$('onboarding').classList.remove('open');save();seedDemo();renderAll();restoreMoodUI();toast(`🦁 Welcome, ${S.name}! You got 3 ❄ freezes!`,'success');}

// ── SETTINGS ───────────────────────────────────────────────
function saveName(){const n=$('st-name').value.trim();if(!n)return;S.name=n;save();renderStats();toast('👤 Name saved!','success');}
function exportData(){const blob=new Blob([JSON.stringify(S,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`oht_${todayStr()}.json`;a.click();toast('📥 Exported!','success');}
function importData(){const inp=document.createElement('input');inp.type='file';inp.accept='.json';inp.onchange=e=>{const f=e.target.files[0];if(!f)return;const r=new FileReader();r.onload=ev=>{try{const d=JSON.parse(ev.target.result);Object.assign(S,d);save();renderAll();toast('📤 Imported!','success');}catch{toast('❌ Invalid file','error');}};r.readAsText(f);};inp.click();}
function resetAll(){if(!confirm('DELETE ALL DATA?'))return;localStorage.removeItem('hb_v5');location.reload();}

// ── TOAST / CONFETTI ───────────────────────────────────────
function toast(msg,type='info'){const tc=$('toast-container');if(!tc)return;const t=document.createElement('div');t.className=`toast ${type}`;t.innerHTML=typeof msg==='string'?msg:msg;tc.appendChild(t);setTimeout(()=>{t.classList.add('removing');setTimeout(()=>t.remove(),320);},2600);}
function confetti(n){const CC=['#FFE600','#FF3CAC','#00F5D4','#AAFF00','#FF6B00','#0057FF'];for(let i=0;i<n;i++){setTimeout(()=>{const el=document.createElement('div');el.className='confetti-piece';el.style.cssText=`left:${Math.random()*100}vw;top:-10px;background:${CC[i%CC.length]};animation-duration:${.8+Math.random()*.8}s;animation-delay:${Math.random()*.2}s;width:${5+Math.random()*7}px;height:${5+Math.random()*7}px;border-radius:${Math.random()>.5?'50%':'0'};`;document.body.appendChild(el);setTimeout(()=>el.remove(),2000);},i*35);}}

// ── SEED DEMO ──────────────────────────────────────────────
function seedDemo(){
  if(S.habits.length>0)return;
  const demos=[
    {name:'Morning Run',icon:'run',color:'#FF3CAC',category:'health',freq:'daily',target:1,notes:'20 min',progressive:'slow',stack:'',stake:'',scheduledTime:'06:30'},
    {name:'Read 30 min',icon:'book',color:'#0057FF',category:'mind',freq:'daily',target:1,notes:'',progressive:'none',stack:'',stake:'',scheduledTime:'21:00'},
    {name:'Drink 8 Glasses',icon:'water',color:'#00F5D4',category:'wellness',freq:'daily',target:8,notes:'',progressive:'none',stack:'',stake:'',scheduledTime:''},
    {name:'Meditate',icon:'meditate',color:'#7B2FBE',category:'wellness',freq:'daily',target:1,notes:'10 min',progressive:'none',stack:'',stake:'',scheduledTime:'07:00'},
    {name:'Study Code',icon:'code',color:'#FFE600',category:'productivity',freq:'weekdays',target:1,notes:'Deep focus',progressive:'medium',stack:'',stake:'',scheduledTime:''},
    {name:'Deep Clean',icon:'clean',color:'#AAFF00',category:'wellness',freq:'weekly',target:1,notes:'',progressive:'none',stack:'',stake:'',scheduledTime:''},
    {name:'Review Goals',icon:'target',color:'#FF6B00',category:'productivity',freq:'weekly',target:1,notes:'',progressive:'none',stack:'',stake:'',scheduledTime:''},
    {name:'Budget Review',icon:'money',color:'#00BCD4',category:'finance',freq:'monthly',target:1,notes:'',progressive:'none',stack:'',stake:'',scheduledTime:''},
  ];
  demos.forEach(d=>{const streak=Math.floor(Math.random()*9);S.habits.push({id:'hd'+Date.now()+Math.floor(Math.random()*9999),...d,completedToday:false,currentProgress:0,streak,bestStreak:streak+Math.floor(Math.random()*6),totalDone:Math.floor(Math.random()*40),weekLog:Array(7).fill(false).map(()=>Math.random()>.4),monthLog:{},todayXp:0,baseTarget:d.target,paused:false,createdAt:new Date(Date.now()-Math.random()*30*864e5).toISOString()});});
  save();
}

// ── START ──────────────────────────────────────────────────
init();



// ════════════════════════════════════════════════════════════
// GARDEN PAGE
// ════════════════════════════════════════════════════════════

// [plantSVG replaced by PvZ]

function getPlantStage(doneCount, totalHabits) {
  if (totalHabits === 0) return 0;
  const pct = doneCount / totalHabits;
  if (pct === 0) return 0;
  if (pct < 0.2) return 1;
  if (pct < 0.4) return 2;
  if (pct < 0.6) return 3;
  if (pct < 0.85) return 4;
  return 5; // BLOOM = 100% (or ≥85%)
}

function getCompletedForDate(dateStr) {
  const today = todayStr();
  if (dateStr === today) {
    const active = S.habits.filter(h => !h.archived);
    return { done: active.filter(h => h.completedToday).length, total: active.length };
  }
  // Past: use lockedDays or history
  const snap = S.lockedDays && S.lockedDays[dateStr];
  if (snap) {
    return { done: snap.filter(s => s.completed).length, total: snap.length };
  }
  // Fallback: unique habits from history on that date
  const hist = (S.history || []).filter(h => h.date === dateStr && h.status === 'done');
  const unique = [...new Set(hist.map(h => h.habitId))].length;
  return { done: unique, total: Math.max(unique, S.habits.length) };
}

function renderGarden() {
  const grid = $('garden-grid');
  if (!grid) return;
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayDate = now.getDate();
  const months = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE','JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];
  setTxt('garden-month-title', `${months[month]} ${year}`);

  let perfectCount = 0, grownCount = 0;

  // Build all cells
  const cells = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    const isFuture = day > todayDate;
    const isToday = day === todayDate;
    const { done, total } = getCompletedForDate(dateStr);
    const stage = isFuture ? 0 : getPlantStage(done, total);
    const pct = total > 0 ? Math.round(done / total * 100) : 0;
    const isPerfect = !isFuture && total > 0 && done >= total;

    if (!isFuture && stage > 0) grownCount++;
    if (isPerfect) perfectCount++;

    const fillColor = ['#ccc','#AAFF00','#7ec850','#4aab00','#00C853','#FFE600'][stage];

    const _gc = isFuture ? '' : "openDayDetail('" + dateStr + "')";
    return `<div class="plant-cell plant-s${stage}${isToday?' today-cell':''}${isFuture?' future-cell':''}${isPerfect?' perfect-cell':''}"
      onclick="${_gc}" title="${dateStr}: ${done}/${total} habits">
      <div class="plant-date">${day}</div>
      <div class="plant-svg-wrap">${plantSVG(stage, fillColor, pct)}</div>
      <div class="plant-pct-bar"><div class="plant-pct-fill" style="width:${isFuture?0:pct}%;"></div></div>
    </div>`;
  });

  // Layout: 7 per row
  grid.innerHTML = cells.join('');

  setTxt('gstat-perfect', perfectCount);
  setTxt('gstat-grown', grownCount);
  const best = S.habits.reduce((m, h) => Math.max(m, h.bestStreak || 0), 0);
  setTxt('gstat-streak', best);
  // Trigger grow animation on newly grown plants
  setTimeout(() => {
    document.querySelectorAll('.plant-cell:not(.future-cell)').forEach(cell => {
      const prevStage = parseInt(cell.dataset.prevStage || '0');
      const curStage = parseInt(cell.className.match(/plant-s(\d)/)?.[1] || '0');
      if (curStage > prevStage) cell.classList.add('plant-just-grew');
      else cell.classList.remove('plant-just-grew');
      cell.dataset.prevStage = curStage;
    });
  }, 50);
}

// ════════════════════════════════════════════════════════════
// CALENDAR PAGE
// ════════════════════════════════════════════════════════════
var calYear = new Date().getFullYear();
var calMonth = new Date().getMonth();

function renderCalendar() {
  const grid = $('cal-days-grid');
  if (!grid) return;
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  setTxt('cal-month-lbl', `${(months[calMonth]||'JAN').toUpperCase().slice(0,3)} ${calYear}`);

  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const today = new Date();
  const todayY = today.getFullYear(), todayM = today.getMonth(), todayD = today.getDate();
  // Prev month days
  const prevDays = new Date(calYear, calMonth, 0).getDate();

  let html = '';
  // Empty cells before
  for (let i = 0; i < firstDay; i++) {
    html += `<div class="cal-day other-month"><div class="cal-day-num" style="color:#ccc">${prevDays - firstDay + i + 1}</div></div>`;
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${calYear}-${String(calMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = d === todayD && calMonth === todayM && calYear === todayY;
    const isFuture = new Date(calYear, calMonth, d) > today;
    const { done, total } = getCompletedForDate(dateStr);
    const dotClass = isFuture ? 'none' : (total > 0 && done >= total) ? 'perfect' : (done > 0) ? 'partial' : 'none';
    const moodEntry = S.moodLog && S.moodLog[dateStr];
    const MOOD_E = ['','😫','😕','😐','😊','🔥'];
    const moodHtml = (!isFuture && moodEntry?.mood) ? `<div style="font-size:8px;line-height:1;">${MOOD_E[moodEntry.mood]}</div>` : '';
    const _onclick = isFuture ? '' : " openDayDetail('" + dateStr + "')";
    html += `<div class="cal-day${isToday?' today-day':''}" onclick="${_onclick}">
      <div class="cal-day-num">${d}</div>
      <div class="cal-dot ${dotClass}"></div>
      ${moodHtml}
    </div>`;
  }
  // Fill remaining cells
  const totalCells = firstDay + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let i = 1; i <= remaining; i++) {
    html += `<div class="cal-day other-month"><div class="cal-day-num" style="color:#ccc">${i}</div></div>`;
  }
  grid.innerHTML = html;
}

function calPrev() { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); }
function calNext() { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); }

function openDayDetail(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  setTxt('day-detail-title', `${days[d.getDay()]}, ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`);

  const body = $('day-detail-body');
  if (!body) return;

  const today = todayStr();
  let doneHabits = [];

  if (dateStr === today) {
    doneHabits = S.habits.filter(h => h.completedToday).map(h => ({ icon: h.icon, name: h.name, xp: h.todayXp || 10, category: h.category }));
  } else {
    const snap = S.lockedDays && S.lockedDays[dateStr];
    if (snap) {
      doneHabits = snap.filter(s => s.completed).map(s => ({ icon: s.habitIcon || '📌', name: s.habitName, xp: s.xpEarned || 10, category: s.category }));
    } else {
      const hist = (S.history || []).filter(h => h.date === dateStr && h.status === 'done');
      const seen = new Set();
      hist.forEach(h => { if (!seen.has(h.habitId)) { seen.add(h.habitId); doneHabits.push({ icon: h.habitIcon || '📌', name: h.habitName, xp: h.xp || 10, category: h.category }); } });
    }
  }

  const moodEntry = S.moodLog && S.moodLog[dateStr];
  const MOOD_E2 = ['','😫','😕','😐','😊','🔥'];
  const moodSection = moodEntry ? `<div style="display:flex;gap:9px;align-items:center;padding:7px 0;border-bottom:1px solid var(--bg);margin-bottom:7px;">
    <span style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);">MOOD</span>
    <span style="font-size:16px;">${MOOD_E2[moodEntry.mood||0]||'—'}</span>
    <span style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);">ENERGY</span>
    <span style="font-family:'Archivo Black',sans-serif;font-size:13px;color:var(--cyan);">${moodEntry.energy||0}/5</span>
    <div style="display:flex;gap:2px;">${Array.from({length:5},(_,i)=>`<div style="width:6px;height:6px;border:1.5px solid ${i<(moodEntry.energy||0)?'var(--lime)':'#444'};background:${i<(moodEntry.energy||0)?'var(--lime)':'transparent'};"></div>`).join('')}</div>
  </div>` : '';
  if (!doneHabits.length) {
    body.innerHTML = moodSection + `<div class="cal-empty-day">No habits completed on this day.</div>`;
  } else {
    const totalXp = doneHabits.reduce((s, h) => s + (h.xp || 10), 0);
    const ic_fn = (icon, color) => { const ic=HABIT_ICONS.find(x=>x.id===icon)||HABIT_ICONS[0]; return `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${color||'currentColor'}" stroke-width="2" stroke-linecap="round">${ic.svg}</svg>`; };
    body.innerHTML = moodSection + `<div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);margin-bottom:9px;">${doneHabits.length} habit${doneHabits.length!==1?'s':''} · +${totalXp} XP</div>`
      + doneHabits.map(h => `<div class="cal-detail-habit">${ic_fn(h.icon, h.color||'currentColor')}<span class="cdh-name">${h.name}</span><span class="cdh-xp">+${h.xp} XP</span></div>`).join('');
  }

  $('day-detail-overlay').classList.add('open');

  // Also update cal-detail panel if on calendar page
  const cd = $('cal-detail');
  if (cd) {
    if (!doneHabits.length) {
      cd.innerHTML = `<div class="cal-detail-date">${dateStr}</div><div class="cal-empty-day">No habits completed on this day.</div>`;
    } else {
      const totalXp = doneHabits.reduce((s, h) => s + (h.xp || 10), 0);
      cd.innerHTML = `<div class="cal-detail-date">${dateStr}</div><div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);margin-bottom:9px;">${doneHabits.length} habit${doneHabits.length!==1?'s':''} completed · +${totalXp} XP</div>`
        + doneHabits.map(h => `<div class="cal-detail-habit"><span class="cdh-icon">${h.icon}</span><span class="cdh-name">${h.name}</span><span class="cdh-xp">+${h.xp} XP</span></div>`).join('');
    }
  }
}
function closeDayDetail() { $('day-detail-overlay').classList.remove('open'); }

// ════════════════════════════════════════════════════════════
// FOCUS TIMER (Pomodoro)
// ════════════════════════════════════════════════════════════
// focusState declared at top of script

function setFocusDur(mins) { if (focusState.running) return; focusState.workDur = mins * 60; if (!focusState.isBreak) { focusState.remaining = focusState.total = mins * 60; } updateFocusUI(); }
function setFocusBreak(mins) { focusState.breakDur = mins * 60; }
function linkFocusHabit(id) { focusState.linkedHabit = id; }

// FIX: input bebas H:MM:SS untuk focus timer
function applyFocusDurInput() {
  if (focusState.running) return;
  const h = parseInt($('focus-inp-hours')?.value) || 0;
  const m = parseInt($('focus-inp-mins')?.value)  || 0;
  const s = parseInt($('focus-inp-secs')?.value)  || 0;
  const total = h * 3600 + m * 60 + s;
  if (total <= 0) return;
  focusState.workDur = total;
  if (!focusState.isBreak) { focusState.remaining = focusState.total = total; }
  // Update ring dan display tanpa menyentuh input (hindari loop)
  const timerEl = $('focus-timer');
  if (timerEl) {
    const hrs2 = Math.floor(total/3600), mins2 = Math.floor((total%3600)/60), secs2 = total%60;
    timerEl.textContent = hrs2 > 0
      ? `${hrs2}:${String(mins2).padStart(2,'0')}:${String(secs2).padStart(2,'0')}`
      : `${String(mins2).padStart(2,'0')}:${String(secs2).padStart(2,'0')}`;
  }
  const ring = $('focus-ring-circle');
  if (ring) { ring.style.strokeDashoffset = 0; ring.style.stroke = 'var(--yellow)'; }
}
function buildFocusHabitPicker() {
  const sel = $('focus-habit-link'); if (!sel) return;
  sel.innerHTML = '<option value="">— none —</option>' + S.habits.map(h => `<option value="${h.id}">${h.name}</option>`).join('');
}
function openFocusHabitPicker() {
  // Build custom dropdown for focus habit link
  SELECT_CONFIGS._focus = {
    title: 'LINK TO HABIT',
    options: [
      {value:'', svg:'<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>', label:'— None —', sub:'No habit linked'},
      ...S.habits.filter(h=>!h.archived&&!h.paused).map(h=>{
        const ic = HABIT_ICONS.find(x=>x.id===h.icon)||HABIT_ICONS[0];
        return {value:h.id, svg:ic.svg, label:h.name, sub:`${h.freq} · 🔥${h.streak||0} streak`};
      })
    ]
  };
  const curVal = $('focus-habit-link')?.value||'';
  setTxt('csd-title','LINK HABIT TO FOCUS');
  const opts=$('csd-options');
  if(opts){
    opts.innerHTML = SELECT_CONFIGS._focus.options.map((o,idx)=>{
      const svgHtml=`<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${o.svg}</svg>`;
      return `<div class="csd-option${o.value===curVal?' selected':''}" data-fhi="${idx}" onclick="selectFocusHabitByIdx(this)">
        <div class="csd-option-icon">${svgHtml}</div>
        <div style="flex:1;"><div class="csd-option-label">${o.label}</div><div class="csd-option-sub">${o.sub}</div></div>
        <div class="csd-check"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="20 6 9 17 4 12"/></svg></div>
      </div>`;
    }).join('');;
  }
  const bd=$('csd-backdrop');const dd=$('custom-select-dropdown');
  if(bd)bd.style.display='block';
  if(dd)setTimeout(()=>dd.classList.add('open'),10);
}
function selectFocusHabitByIdx(el) {
  const idx = parseInt(el.dataset.fhi);
  const o = (SELECT_CONFIGS._focus?.options||[])[idx]; if(!o) return;
  selectFocusHabit(o.value, o.svg, o.label);
}
function selectFocusHabit(id, svg, label) {
  const sel=$('focus-habit-link');if(sel)sel.value=id;
  focusState.linkedHabit=id;
  const trigger=$('focus-habit-trigger');
  if(trigger){
    const ico=trigger.querySelector('.cst-icon');
    const lbl=trigger.querySelector('#focus-habit-label');
    if(ico)ico.innerHTML=svg?`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round">${svg}</svg>`:'';
    if(lbl)lbl.textContent=label||'— none —';
  }
  closeCustomSelect();
}
function toggleFocus() {
  if (focusState.running) {
    clearInterval(focusState.interval); focusState.running = false;
  } else {
    focusState.running = true;
    focusState.interval = setInterval(focusTick, 1000);
  }
  updateFocusUI();
}
function focusTick() {
  focusState.remaining--;
  if (focusState.remaining <= 0) {
    clearInterval(focusState.interval); focusState.running = false;
    if (!focusState.isBreak) {
      focusState.sessions++;
      playSound('perfect');
      toast(`⏱ Focus session done! ${focusState.sessions} today 🔥`, 'success');
      if (focusState.sessions % 4 === 0) {
        toast('💪 4 sessions! Take a long break.', 'info');
      }
      // Save to state
      S.focusSessions = S.focusSessions || {};
      S.focusSessions[todayStr()] = (S.focusSessions[todayStr()] || 0) + 1;
      save();
      // Start break
      focusState.isBreak = true;
      focusState.remaining = focusState.total = focusState.breakDur;
    } else {
      focusState.isBreak = false;
      focusState.remaining = focusState.total = focusState.workDur;
      playSound('tick');
    }
    focusState.interval = setInterval(focusTick, 1000);
    focusState.running = true;
  }
  updateFocusUI();
}
function resetFocus() {
  clearInterval(focusState.interval); focusState.running = false; focusState.isBreak = false;
  focusState.remaining = focusState.total = focusState.workDur;
  updateFocusUI();
}

// Pause focus timer when app goes to background
document.addEventListener('visibilitychange', () => {
  if (document.hidden && focusState.running) {
    focusState._pausedAt = Date.now();
  } else if (!document.hidden && focusState.running && focusState._pausedAt) {
    const elapsed = Math.floor((Date.now() - focusState._pausedAt) / 1000);
    focusState.remaining = Math.max(0, focusState.remaining - elapsed);
    focusState._pausedAt = null;
    updateFocusUI();
    if (focusState.remaining <= 0) { clearInterval(focusState.interval); focusTick(); }
  }
});
function updateFocusUI() {
  const totalSecs = focusState.remaining;
  const hrs  = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  // Tampilkan H:MM:SS kalau ada jam, MM:SS kalau tidak
  const disp = hrs > 0
    ? `${hrs}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`
    : `${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
  const timerEl = $('focus-timer');
  if (timerEl) {
    timerEl.textContent = disp;
    timerEl.className = 'focus-timer-display' + (focusState.running ? (focusState.isBreak ? ' break' : ' running') : '');
  }
  const lbl = $('focus-mode-lbl');
  if (lbl) lbl.textContent = focusState.isBreak ? '☕ BREAK TIME' : 'FOCUS SESSION';
  const btn = $('focus-start-btn');
  if (btn) btn.textContent = focusState.running ? '⏸ PAUSE' : '▶ START';
  // Ring — idle pakai var(--yellow) supaya ikut accent theme
  const ring = $('focus-ring-circle');
  if (ring) {
    const pct = focusState.remaining / focusState.total;
    const circ = 2 * Math.PI * 70;
    ring.style.strokeDashoffset = circ * (1 - pct);
    ring.style.stroke = focusState.isBreak ? 'var(--orange)' : focusState.running ? 'var(--lime)' : 'var(--yellow)';
  }
  const sc = $('focus-sessions');
  const todaySessions = (S.focusSessions && S.focusSessions[todayStr()]) || focusState.sessions;
  if (sc) sc.textContent = `${todaySessions} session${todaySessions !== 1 ? 's' : ''} today`;
  // Sync input fields saat tidak running (supaya input selalu terbaca akurat)
  if (!focusState.running) {
    const ih = $('focus-inp-hours'); const im = $('focus-inp-mins'); const is_ = $('focus-inp-secs');
    if (ih) ih.value = hrs;
    if (im) im.value = mins;
    if (is_) is_.value = secs;
  }
}

// ════════════════════════════════════════════════════════════
// WATER TRACKER
// ════════════════════════════════════════════════════════════
function renderWaterTracker() {
  const cups = $('water-cups'); if (!cups) return;
  const today = todayStr();
  S.waterLog = S.waterLog || {};
  const count = S.waterLog[today] || 0;
  cups.innerHTML = Array.from({ length: 8 }, (_, i) => {
    const filled = i < count;
    return `<div class="water-cup ${filled ? 'full' : ''}" onclick="toggleCup(${i})">
      <div class="water-cup-fill" style="height:${filled ? '100%' : '0%'};"></div>
    </div>`;
  }).join('');
  setTxt('water-count', count);
  const msgs = ['Start drinking! 💧', 'Good start! 💧', 'Quarter way! 💧', 'Halfway there! 🌊', 'Almost! 🌊', 'Nearly done! 🌊', 'Almost full! 💦', 'One more! 💦', '🏆 Hydrated! '];
  setTxt('water-msg', msgs[Math.min(count, 8)]);
}
function toggleCup(index) {
  const today = todayStr();
  S.waterLog = S.waterLog || {};
  const current = S.waterLog[today] || 0;
  S.waterLog[today] = index < current ? index : index + 1;
  save(); renderWaterTracker();
  playSound('tick');
}
function resetWater() { S.waterLog = S.waterLog || {}; S.waterLog[todayStr()] = 0; save(); renderWaterTracker(); }

// ════════════════════════════════════════════════════════════
// SLEEP LOG
// ════════════════════════════════════════════════════════════
function logSleep() {
  const bed = $('sleep-bed')?.value;
  const wake = $('sleep-wake')?.value;
  if (!bed || !wake) { toast('Enter both bedtime and wake time!', 'error'); return; }
  // Calculate duration
  const [bh, bm] = bed.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let dur = (wh * 60 + wm) - (bh * 60 + bm);
  if (dur < 0) dur += 24 * 60;
  const hrs = (dur / 60).toFixed(1);
  S.sleepLog = S.sleepLog || [];
  S.sleepLog.unshift({ date: todayStr(), bed, wake, hours: parseFloat(hrs) });
  if (S.sleepLog.length > 30) S.sleepLog = S.sleepLog.slice(0, 30);
  save(); renderSleepLog();
  toast(`😴 ${hrs}h sleep logged!`, 'success');
}
function renderSleepLog() {
  const el = $('sleep-log-list'); if (!el) return;
  const log = S.sleepLog || [];
  if (!log.length) { el.innerHTML = `<div style="font-size:10px;color:var(--sub);padding:5px;">No sleep logs yet.</div>`; return; }
  el.innerHTML = log.slice(0, 7).map(l => {
    const quality = l.hours >= 8 ? '🟢' : l.hours >= 6 ? '🟡' : '🔴';
    const pct = Math.min(100, Math.round(l.hours / 9 * 100));
    return `<div class="sleep-entry">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);min-width:55px;">${l.date}</div>
      <div style="font-size:9px;">${l.bed}→${l.wake}</div>
      <div class="sleep-bar-wrap"><div class="sleep-bar-fill" style="width:${pct}%"></div></div>
      <div style="font-family:'Archivo Black',sans-serif;font-size:11px;flex-shrink:0;">${l.hours}h ${quality}</div>
    </div>`;
  }).join('');
}

// ════════════════════════════════════════════════════════════
// GRATITUDE JOURNAL
// ════════════════════════════════════════════════════════════
function addGratitude() {
  const inp = $('gratitude-input'); if (!inp || !inp.value.trim()) return;
  S.gratitudeLog = S.gratitudeLog || [];
  S.gratitudeLog.unshift({ date: todayStr(), text: inp.value.trim() });
  if (S.gratitudeLog.length > 100) S.gratitudeLog = S.gratitudeLog.slice(0, 100);
  inp.value = '';
  save(); renderGratitudeList();
  playSound('tick');
  toast('🙏 Gratitude logged!', 'success');
}
function renderGratitudeList() {
  const el = $('gratitude-list'); if (!el) return;
  const log = S.gratitudeLog || [];
  if (!log.length) { el.innerHTML = getEmptyState("gratitude"); return; }
  el.innerHTML = log.slice(0, 10).map(e => `<div class="gratitude-entry"><div class="ge-date">${e.date}</div><div class="ge-text">🙏 ${e.text}</div></div>`).join('');
}

// ════════════════════════════════════════════════════════════
// DAILY INTENTION
// ════════════════════════════════════════════════════════════
function saveIntention() {
  const inp = $('intention-input'); if (!inp || !inp.value.trim()) return;
  S.intentions = S.intentions || {};
  S.intentions[todayStr()] = inp.value.trim();
  inp.value = '';
  save(); renderIntention();
  toast('🎯 Intention set!', 'success');
}
function renderIntention() {
  const el = $('intention-display'); if (!el) return;
  const today = todayStr();
  const intent = S.intentions && S.intentions[today];
  if (intent) {
    el.innerHTML = `<div style="background:var(--black);border:2px solid var(--yellow);padding:9px 11px;font-family:'Archivo Black',sans-serif;font-size:12px;color:var(--yellow);">🎯 ${intent}</div>`;
  } else {
    el.innerHTML = `<div style="font-size:10px;color:var(--sub);">No intention set yet today.</div>`;
  }
}


// ════════════════════════════════════════════════════════════
// CUSTOM SELECT PICKER
// ════════════════════════════════════════════════════════════
const SELECT_CONFIGS = {
  cat: {
    title: 'SELECT CATEGORY',
    options: [
      {value:'health', svg:'<path d="M6 4v6"/><path d="M18 4v6"/><path d="M3 7h18"/><path d="M6 10c0 4 2 6 6 6s6-2 6-6"/>', label:'Health', sub:'Physical fitness & body'},
      {value:'mind', svg:'<path d="M9.5 2a4.5 4.5 0 014.5 4.5c0 1.5-.5 2.5-1.5 3.5h3a4.5 4.5 0 010 9H9a4.5 4.5 0 010-9h.5C8 9 7.5 8 7.5 6.5A4.5 4.5 0 019.5 2z"/>', label:'Mind', sub:'Mental & cognitive'},
      {value:'productivity', svg:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', label:'Work', sub:'Career & productivity'},
      {value:'wellness', svg:'<path d="M17 8C8 10 5.9 16.17 3.82 19.97"/><path d="M3.82 19.97A10 10 0 0122 12c0-8.5-6-12-6-12C13 4 9 6 9 12a6 6 0 006 6c3 0 5-2 5-2"/>', label:'Wellness', sub:'Self-care & balance'},
      {value:'social', svg:'<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>', label:'Social', sub:'Relationships & community'},
      {value:'finance', svg:'<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>', label:'Finance', sub:'Money & budgeting'},
      {value:'creativity', svg:'<circle cx="13.5" cy="6.5" r=".5"/><circle cx="17.5" cy="10.5" r=".5"/><circle cx="8.5" cy="7.5" r=".5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125A1.64 1.64 0 0115.296 19h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/>', label:'Creative', sub:'Arts & creative work'},
      {value:'custom', svg:'<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>', label:'Custom', sub:'Your own category'},
    ]
  },
  prog: {
    title: 'DIFFICULTY CURVE',
    options: [
      {value:'none', svg:'<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>', label:'None', sub:'Fixed target, no changes'},
      {value:'slow', svg:'<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>', label:'Slow +10%/wk', sub:'Gradual increase weekly'},
      {value:'medium', svg:'<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>', label:'Medium +20%/wk', sub:'Moderate weekly push'},
      {value:'fast', svg:'<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>', label:'Fast +30%/wk', sub:'Aggressive escalation'},
    ]
  },
  stack: {
    title: 'STACK AFTER HABIT',
    options: [] // populated dynamically
  }
};

var _currentSelectId = null;

function openCustomSelect(id) {
  _currentSelectId = id;
  const cfg = SELECT_CONFIGS[id];
  if (!cfg) return;

  // Populate stack dynamically
  if (id === 'stack') {
    const editId = $('edit-id')?.value || '';
    cfg.options = [{value:'', icon:'🚫', label:'— None —', sub:'No chaining'}];
    S.habits.filter(h => h.id !== editId).forEach(h => {
      cfg.options.push({value: h.id, icon: h.icon, label: h.name, sub: `${h.freq} · 🔥${h.streak||0}`});
    });
  }

  const curVal = $('inp-' + id)?.value || '';
  setTxt('csd-title', cfg.title);

  const opts = $('csd-options');
  if (opts) {
    opts.innerHTML = cfg.options.map(o => {
    const svgHtml = o.svg ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${o.svg}</svg>` : (o.icon||'');
    const safeLabel = o.label.replace(/'/g,"\\'");
    const safeSvg = (o.svg||'').replace(/'/g,"\\'").replace(/"/g,'&quot;');
    return `<div class="csd-option${o.value === curVal ? ' selected' : ''}" onclick="selectCustomOption('${id}','${o.value}','${safeSvg}','${safeLabel}')">
        <div class="csd-option-icon">${svgHtml}</div>
        <div style="flex:1;"><div class="csd-option-label">${o.label}</div><div class="csd-option-sub">${o.sub}</div></div>
        <div class="csd-check"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="20 6 9 17 4 12"/></svg></div>
      </div>`;
  }).join('');
  }

  const backdrop = $('csd-backdrop');
  const dropdown = $('custom-select-dropdown');
  if (backdrop) backdrop.style.display = 'block';
  if (dropdown) setTimeout(() => dropdown.classList.add('open'), 10);

  const trigger = $('trigger-' + id);
  if (trigger) trigger.classList.add('open');
}

function selectCustomOption(id, value, svgOrIcon, label) {
  const inp = $('inp-' + id);
  if (inp) inp.value = value;

  const trigger = $('trigger-' + id);
  if (trigger) {
    const ico = trigger.querySelector('.cst-icon');
    const lbl = trigger.querySelector('.cst-label');
    if (ico) {
      // If it looks like SVG path data, wrap it
      if (svgOrIcon && (svgOrIcon.startsWith('<') || svgOrIcon.includes('path') || svgOrIcon.includes('circle') || svgOrIcon.includes('line') || svgOrIcon.includes('polygon'))) {
        ico.innerHTML = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${svgOrIcon.replace(/&quot;/g,'"')}</svg>`;
      } else {
        ico.textContent = svgOrIcon;
      }
    }
    if (lbl) lbl.textContent = label;
  }

  // Special handling
  if (id === 'cat') {/* no extra action */}
  if (id === 'prog') updateProgDifficultyVisibility();

  closeCustomSelect();
}

function closeCustomSelect() {
  const backdrop = $('csd-backdrop');
  const dropdown = $('custom-select-dropdown');
  if (dropdown) dropdown.classList.remove('open');
  if (backdrop) setTimeout(() => backdrop.style.display = 'none', 250);
  if (_currentSelectId) {
    const trigger = $('trigger-' + _currentSelectId);
    if (trigger) trigger.classList.remove('open');
  }
  _currentSelectId = null;
}

// [merged into original function]

// [merged into original function]

// [merged into original function]

// ════════════════════════════════════════════════════════════
// CUSTOM TIME PICKER
// ════════════════════════════════════════════════════════════
var _tpTarget = 'inp-time'; // which input to fill
var _tpHour = 12, _tpMin = 0, _tpAmPm = 'AM';

function openTimePicker(targetId) {
  _tpTarget = targetId || 'inp-time';
  const cur = $(_tpTarget)?.value || '';
  if (cur) {
    const [hStr, mStr] = cur.split(':');
    _tpHour = parseInt(hStr) || 0;
    _tpMin  = Math.round((parseInt(mStr)||0)/5)*5;
  } else {
    const now = new Date();
    _tpHour = now.getHours();
    _tpMin  = Math.round(now.getMinutes()/5)*5;
  }
  buildTimeScrollers();
  updateTPDisplay();
  $('time-picker-overlay').classList.add('open');
}

function buildTimeScrollers() {
  const hs = $('tp-hour-scroll');
  const ms = $('tp-min-scroll');
  if (!hs || !ms) return;

  const pad = '<div class="tp-item" style="opacity:0;pointer-events:none;height:40px;">--</div>';
  // 24h: 0-23
  hs.innerHTML = pad + Array.from({length:24},(_,i)=>{
    return `<div class="tp-item${i===_tpHour?' active':''}" onclick="setTPHour(${i})" style="height:40px;line-height:40px;">${String(i).padStart(2,'0')}</div>`;
  }).join('') + pad;

  // Minutes: 0,5,10,...,55
  ms.innerHTML = pad + Array.from({length:12},(_,i)=>{
    const m=i*5;
    return `<div class="tp-item${m===_tpMin?' active':''}" onclick="setTPMin(${m})" style="height:40px;line-height:40px;">${String(m).padStart(2,'0')}</div>`;
  }).join('') + pad;

  setTimeout(() => {
    const activeH = hs.querySelector('.active');
    if (activeH) hs.scrollTop = activeH.offsetTop - hs.offsetHeight/2 + 20;
    const activeM = ms.querySelector('.active');
    if (activeM) ms.scrollTop = activeM.offsetTop - ms.offsetHeight/2 + 20;
  }, 60);
}

function setTPHour(h) {
  _tpHour = h;
  document.querySelectorAll('#tp-hour-scroll .tp-item').forEach(el => {
    el.classList.toggle('active', parseInt(el.textContent) === h);
  });
  updateTPDisplay();
  // Auto scroll to center
  const hs = $('tp-hour-scroll');
  const active = hs?.querySelector('.active');
  if(active && hs) hs.scrollTop = active.offsetTop - hs.offsetHeight/2 + 20;
}
function setTPMin(m) {
  _tpMin = m;
  document.querySelectorAll('#tp-min-scroll .tp-item').forEach(el => {
    el.classList.toggle('active', parseInt(el.textContent) === m);
  });
  updateTPDisplay();
}
function setTPAmPm(ap) {
  _tpAmPm = ap;
  const am = $('tp-am-btn'); const pm = $('tp-pm-btn');
  if (am) am.classList.toggle('sel', ap === 'AM');
  if (pm) pm.classList.toggle('sel', ap === 'PM');
  updateTPDisplay();
}
function updateTPDisplay() {
  setTxt('tp-h', String(_tpHour).padStart(2,'0'));
  setTxt('tp-m', String(_tpMin).padStart(2,'0'));
}
function confirmTimePicker() {
  const val = `${String(_tpHour).padStart(2,'0')}:${String(_tpMin).padStart(2,'0')}`;
  const inp = $(_tpTarget);
  if (inp) inp.value = val;
  // Update display labels
  if (_tpTarget === 'inp-time') {
    const tv = $('time-trigger-val'); if (tv) tv.textContent = val;
  } else if (_tpTarget === 'sleep-bed') {
    const sv = $('sleep-bed-val'); if (sv) sv.textContent = val;
  } else if (_tpTarget === 'sleep-wake') {
    const sv = $('sleep-wake-val'); if (sv) sv.textContent = val;
  }
  closeTimePicker();
}
function clearTimePicker() {
  const inp = $(_tpTarget); if (inp) inp.value = '';
  if (_tpTarget === 'inp-time') { const tv=$('time-trigger-val'); if(tv) tv.textContent='--:--'; }
  else if (_tpTarget === 'sleep-bed') { const sv=$('sleep-bed-val'); if(sv) sv.textContent='--:--'; }
  else if (_tpTarget === 'sleep-wake') { const sv=$('sleep-wake-val'); if(sv) sv.textContent='--:--'; }
  closeTimePicker();
}
function closeTimePicker() {
  $('time-picker-overlay').classList.remove('open');
}

// ════════════════════════════════════════════════════════════
// PLANT ANIMATIONS (PvZ style)
// ════════════════════════════════════════════════════════════
// [plant anims replaced by PvZ system]


// ════════════════════════════════════════════════════════════
// SEARCH HABITS
// ════════════════════════════════════════════════════════════
// [// [_searchQuery declared at top]
// [let _searchDebounce moved to top]
function setHabitSearch(val) {
  _searchQuery = val.toLowerCase().trim();
  const clearBtn = document.querySelector('.search-clear');
  if (clearBtn) clearBtn.style.display = _searchQuery ? 'block' : 'none';
  clearTimeout(_searchDebounce);
  _searchDebounce = setTimeout(() => {
    renderTodayHabits();
    if (_searchQuery) renderAllHabitsFiltered();
    else renderAllHabits();
  }, 180);
}
function renderAllHabitsFiltered() {
  // Filter all lists by search query
  const q = _searchQuery;
  const active = S.habits.filter(h=>!h.archived);
  const filtered = active.filter(h=>
    h.name.toLowerCase().includes(q) ||
    (h.notes||'').toLowerCase().includes(q) ||
    (h.category||'').toLowerCase().includes(q)
  );
  ['daily-habits-list','weekly-habits-list','monthly-habits-list'].forEach(id=>{
    const el=$(id); if(!el) return;
    const subset = id==='daily-habits-list' ? filtered.filter(h=>DAILY_FREQS.includes(h.freq||'daily'))
      : id==='weekly-habits-list' ? filtered.filter(h=>h.freq==='weekly')
      : filtered.filter(h=>h.freq==='monthly');
    el.innerHTML = subset.length ? subset.map(h=>habitCard(h,'daily','hc')).join('')
      : `<div style="font-size:10px;color:var(--sub);padding:9px;">No results for "${q}"</div>`;
  });
}
function clearSearch() {
  const sb = document.querySelector('.search-bar');
  if (sb) sb.value = '';
  setHabitSearch('');
}
// [merged into original function]

// ════════════════════════════════════════════════════════════
// IN-APP NOTIFICATION SYSTEM
// ════════════════════════════════════════════════════════════
var _notifQueue = [], _notifShowing = false;
function notify(msg, icon='<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>', duration=3500) {
  _notifQueue.push({msg, icon, duration});
  if (!_notifShowing) showNextNotif();
}
function showNextNotif() {
  if (!_notifQueue.length) { _notifShowing = false; return; }
  _notifShowing = true;
  const {msg, icon, duration} = _notifQueue.shift();
  let el = $('ian-el');
  if (!el) {
    el = document.createElement('div');
    el.id = 'ian-el';
    el.className = 'in-app-notif';
    el.innerHTML = `<div class="ian-icon" id="ian-icon"></div><div class="ian-text" id="ian-text"></div><div class="ian-close" onclick="dismissNotif()">✕</div>`;
    document.body.appendChild(el);
  }
  setTxt('ian-icon', icon); setTxt('ian-text', msg);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => dismissNotif(), duration);
}
function dismissNotif() {
  const el = $('ian-el');
  if (el) { el.classList.remove('show'); setTimeout(() => { _notifShowing = false; showNextNotif(); }, 350); }
}

// Browser push notification request
function requestNotifPermission() {
  if (!('Notification' in window)) { toast('Notifications not supported', 'error'); return; }
  Notification.requestPermission().then(perm => {
    if (perm === 'granted') { toast('<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg> Notifications enabled!', 'success'); scheduleReminders(); }
    else toast('Notifications blocked by browser', 'error');
  });
}
function scheduleReminders() {
  // Check for upcoming habits every minute
  if (S._reminderInterval) clearInterval(S._reminderInterval);
  setInterval(() => {
    const now = new Date();
    const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    S.habits.forEach(h => {
      if (h.scheduledTime && h.scheduledTime === hhmm && !h.completedToday && isDueToday(h)) {
        const msg = `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="var(--orange)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> Time for: ${h.icon} ${h.name}`;
        notify(msg, h.icon, 5000);
        if (Notification.permission === 'granted') {
          new Notification('OHT Reminder', { body: `${h.icon} ${h.name}`, icon: '🦁' });
        }
      }
    });
    // Evening at-risk warning 6PM
    if (now.getHours() === 18 && now.getMinutes() === 0) {
      const atRisk = S.habits.filter(h => isStreakAtRisk(h));
      if (atRisk.length) notify(`⚠ ${atRisk.length} streak(s) at risk! Do them now.`, '⚠', 6000);
    }
  }, 60000);
}

// ════════════════════════════════════════════════════════════
// ARCHIVE HABITS
// ════════════════════════════════════════════════════════════
function archiveHabit(id) {
  const h = S.habits.find(x => x.id === id); if (!h) return;
  h.archived = true; h.archivedAt = todayStr();
  save(); renderAll();
  toast(`📦 "${h.name}" archived`, 'info');
}
function unarchiveHabit(id) {
  const h = S.habits.find(x => x.id === id); if (!h) return;
  h.archived = false; delete h.archivedAt;
  save(); renderAll();
  toast(`↩ "${h.name}" restored`, 'success');
}
function renderArchive() {
  const el = $('archive-list'); if (!el) return;
  const archived = S.habits.filter(h => h.archived);
  if (!archived.length) { el.innerHTML = `<div style="font-size:10px;color:var(--sub);padding:9px;">No archived habits.</div>`; return; }
  el.innerHTML = archived.map(h => `<div class="archive-card">
    <span style="font-size:16px;">${h.icon}</span>
    <div style="flex:1;"><div style="font-size:11px;font-weight:700;">${h.name}</div>
    <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">Archived ${h.archivedAt||'?'} · 🔥 best ${h.bestStreak||0}</div></div>
    <button class="btn btn-xs btn-success" onclick="unarchiveHabit('${h.id}')">↩</button>
    <button class="btn btn-xs btn-danger" onclick="confirmDelete('${h.id}')">🗑</button>
  </div>`).join('');
}
// [merged into original function]

// ════════════════════════════════════════════════════════════
// SKIP DAY (planned skip — no streak penalty)
// ════════════════════════════════════════════════════════════
function skipHabitToday(id) {
  const h = S.habits.find(x => x.id === id); if (!h) return;
  h.skippedToday = true;
  S.skips = S.skips || {};
  S.skips[todayStr()] = S.skips[todayStr()] || [];
  if (!S.skips[todayStr()].includes(id)) S.skips[todayStr()].push(id);
  save(); renderAll();
  toast(`⏭ "${h.name}" skipped today (streak safe)`, 'info');
}

// ════════════════════════════════════════════════════════════
// LEVEL UP CINEMATIC
// ════════════════════════════════════════════════════════════
function showLevelUp(level, name) {
  let ov = $('levelup-overlay');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'levelup-overlay';
    ov.className = 'levelup-overlay';
    // Rays
    let rays = '<div class="levelup-rays">';
    for (let i = 0; i < 12; i++) rays += `<div class="levelup-ray" style="height:${150+Math.random()*80}px;transform:rotate(${i*30}deg);opacity:${0.15+Math.random()*0.2};animation-delay:${Math.random()*2}s;"></div>`;
    rays += '</div>';
    ov.innerHTML = rays + `<div class="levelup-content">
      <div class="levelup-lbl">LEVEL UP!</div>
      <div class="levelup-num" id="levelup-num">${level}</div>
      <div class="levelup-name" id="levelup-name">${name}</div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:#888;margin-top:7px;">TAP TO CONTINUE</div>
    </div>`;
    ov.onclick = () => { ov.classList.remove('show'); };
    document.body.appendChild(ov);
  } else {
    setTxt('levelup-num', level);
    setTxt('levelup-name', name);
  }
  playSound('levelup');
  if (S.confettiOn !== false) confetti(40);
  ov.classList.add('show');
}
// [merged into original function]

// ════════════════════════════════════════════════════════════
// DAILY JOURNAL (auto-generated + manual)
// ════════════════════════════════════════════════════════════
function saveJournalEntry(text) {
  const today = todayStr();
  S.journalEntries = S.journalEntries || {};
  const mood = S.moodLog && S.moodLog[today];
  const doneHabits = S.habits.filter(h => h.completedToday).map(h => `${h.icon} ${h.name}`);
  S.journalEntries[today] = {
    date: today, text: text || '',
    mood: mood?.mood || 0, energy: mood?.energy || 0,
    doneHabits, xp: S.xp || 0,
    autoGenerated: !text
  };
  save(); renderJournal();
  if (text) toast('📝 Journal saved!', 'success');
}
function renderJournal() {
  const el = $('journal-list'); if (!el) return;
  S.journalEntries = S.journalEntries || {};
  const entries = Object.values(S.journalEntries).sort((a,b) => b.date.localeCompare(a.date));
  if (!entries.length) { el.innerHTML = `<div style="font-size:10px;color:var(--sub);">No journal entries yet. Complete habits to auto-generate entries.</div>`; return; }
  const MOOD_E = ['','😫','😕','😐','😊','🔥'];
  el.innerHTML = entries.slice(0, 14).map(e => `<div class="journal-entry">
    <div class="je-date">${e.date} ${e.mood ? MOOD_E[e.mood] : ''} ${e.energy ? '⚡'.repeat(e.energy) : ''}</div>
    ${e.text ? `<div class="je-text">${e.text}</div>` : `<div class="je-text" style="color:var(--sub);font-style:italic;">📊 Completed ${e.doneHabits?.length||0} habits</div>`}
    ${e.doneHabits?.length ? `<div class="je-habit-chips">${e.doneHabits.slice(0,6).map(h=>`<div class="je-chip">${h}</div>`).join('')}</div>` : ''}
  </div>`).join('');
}
// [completeAll merged]

// ════════════════════════════════════════════════════════════
// STOPWATCH
// ════════════════════════════════════════════════════════════
var swState = { running: false, elapsed: 0, lapStart: 0, laps: [], interval: null };
function toggleStopwatch() {
  if (swState.running) {
    clearInterval(swState.interval); swState.running = false;
  } else {
    const now = Date.now();
    swState.lapStart = swState.lapStart || now;
    swState.running = true;
    swState.interval = setInterval(() => {
      swState.elapsed = Date.now() - (swState._startTime || Date.now());
      updateSWDisplay();
    }, 100);
    swState._startTime = swState._startTime || (Date.now() - swState.elapsed);
  }
  const btn = $('sw-btn');
  if (btn) btn.textContent = swState.running ? '⏸ PAUSE' : '▶ START';
}
function lapStopwatch() {
  if (!swState.running) return;
  const lapTime = swState.elapsed - (swState.laps.reduce((s,l) => s + l, 0));
  swState.laps.push(lapTime);
  renderSWLaps();
}
function resetStopwatch() {
  clearInterval(swState.interval);
  swState = { running: false, elapsed: 0, lapStart: 0, laps: [], interval: null, _startTime: null };
  updateSWDisplay(); renderSWLaps();
  const btn = $('sw-btn'); if (btn) btn.textContent = '▶ START';
}
function updateSWDisplay() {
  const el = $('sw-display'); if (!el) return;
  const ms = swState.elapsed;
  const mm = Math.floor(ms / 60000);
  const ss = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10);
  el.textContent = `${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}
function renderSWLaps() {
  const el = $('sw-laps'); if (!el) return;
  if (!swState.laps.length) { el.innerHTML = ''; return; }
  el.innerHTML = swState.laps.map((l, i) => {
    const mm = Math.floor(l/60000), ss = Math.floor((l%60000)/1000), cs = Math.floor((l%1000)/10);
    return `<div class="lap-row"><span>LAP ${i+1}</span><span>${String(mm).padStart(2,'0')}:${String(ss).padStart(2,'0')}.${String(cs).padStart(2,'0')}</span></div>`;
  }).reverse().join('');
}

// ════════════════════════════════════════════════════════════
// CUSTOM ACCENT COLOR THEMES
// ════════════════════════════════════════════════════════════
function setAccentTheme(theme) {
  S.accentTheme = theme;
  document.documentElement.setAttribute('data-accent', theme);
  save();
  document.querySelectorAll('.accent-opt').forEach(el => {
    el.classList.toggle('sel', el.dataset.accent === theme);
  });
  toast('🎨 Theme updated!', 'success');
}

// ════════════════════════════════════════════════════════════
// SWIPE TO COMPLETE (touch gesture on habit cards)
// ════════════════════════════════════════════════════════════
var _touchStart = null;
document.addEventListener('touchstart', e => {
  const card = e.target.closest('.habit-card');
  if (card) _touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY, card };
}, { passive: true });
document.addEventListener('touchmove', e => {
  if (!_touchStart) return;
  const dx = e.touches[0].clientX - _touchStart.x;
  const dy = Math.abs(e.touches[0].clientY - _touchStart.y);
  if (dy > 20) { _touchStart = null; return; } // vertical scroll
  const ind = _touchStart.card.querySelector('.habit-swipe-indicator');
  if (ind && dx > 15) ind.classList.add('show');
  if (ind && dx <= 15) ind.classList.remove('show');
}, { passive: true });
document.addEventListener('touchend', e => {
  if (!_touchStart) return;
  const dx = e.changedTouches[0].clientX - _touchStart.x;
  const card = _touchStart.card;
  const ind = card?.querySelector('.habit-swipe-indicator');
  if (ind) ind.classList.remove('show');
  if (dx > 65 && card) {
    // Extract habit id from card
    const idMatch = card.id?.match(/(?:hc|th)-(.+)/);
    if (idMatch) {
      const h = S.habits.find(x => x.id === idMatch[1]);
      if (h && !h.completedToday && !h.paused && !S.vacationMode) {
        toggleHabit(h.id, card.id.startsWith('th') ? 'th' : 'hc');
      }
    }
  }
  _touchStart = null;
});

// ════════════════════════════════════════════════════════════
// HABIT QUICK NOTES EXPAND
// ════════════════════════════════════════════════════════════
function toggleHabitNotes(id) {
  const card = $(`th-${id}`) || $(`hc-${id}`);
  if (card) card.classList.toggle('notes-open');
}

// ════════════════════════════════════════════════════════════
// AUTO JOURNAL ON DAY END
// ════════════════════════════════════════════════════════════
// [merged into original function]

// [merged into original function]

// ════════════════════════════════════════════════════════════
// SVG ICON SYSTEM — replaces emoji in UI chrome
// ════════════════════════════════════════════════════════════
const SVG = {
  home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M3 10L12 3l9 7v11H15v-5H9v5H3V10z"/></svg>`,
  habits: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><rect x="3" y="4" width="18" height="3"/><rect x="3" y="10" width="18" height="3"/><rect x="3" y="16" width="12" height="3"/><polyline points="17 17 20 20 23 15"/></svg>`,
  garden: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><line x1="12" y1="22" x2="12" y2="11"/><path d="M12 11C12 11 8 8 8 5a4 4 0 018 0c0 3-4 6-4 6z"/><path d="M12 13C12 13 15 11 18 12s1 4-6 1"/><line x1="5" y1="22" x2="19" y2="22"/></svg>`,
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><rect x="3" y="4" width="18" height="17"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg>`,
  focus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 15"/></svg>`,
  streak: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M13 2C13 2 7 8 7 13a5 5 0 0010 0c0-3-2-6-2-6"/><line x1="12" y1="2" x2="12" y2="7"/></svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/></svg>`,
  sound_on: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 010 7"/><path d="M19 5a9 9 0 010 14"/></svg>`,
  sound_off: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
  moon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>`,
  sun: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`,
  add: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="20 6 9 17 4 12"/></svg>`,
  freeze: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 7l-5 5-5-5"/><path d="M17 17l-5-5-5 5"/><path d="M2 12l5-2.5L2 7"/><path d="M22 12l-5 2.5L22 17"/></svg>`,
  trophy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M6 9H4a2 2 0 01-2-2V5h4"/><path d="M18 9h2a2 2 0 002-2V5h-4"/><path d="M12 17v4"/><path d="M8 21h8"/><path d="M6 5h12v5a6 6 0 01-12 0V5z"/></svg>`,
  coach: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><path d="M15 11l2 3-2 1"/></svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><polyline points="23 4 23 10 17 10"/><path d="M20.5 15a9 9 0 11-2.8-9.6L23 10"/></svg>`,
  history: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/><polyline points="2 12 5 12"/><polyline points="12 2 12 5"/></svg>`,
  dna: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M2 2c4 0 8 2 8 6s-4 6-4 10 4 4 8 4"/><path d="M22 22c-4 0-8-2-8-6s4-6 4-10-4-4-8-4"/><line x1="6" y1="7" x2="18" y2="7"/><line x1="4" y1="12" x2="12" y2="12"/><line x1="6" y1="17" x2="18" y2="17"/></svg>`,
  water: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0c0-5-7-13-7-13z"/></svg>`,
  sleep: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/><line x1="8" y1="14" x2="8" y2="14.01"/></svg>`,
  journal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/><line x1="8" y1="7" x2="16" y2="7"/><line x1="8" y1="11" x2="16" y2="11"/><line x1="8" y1="15" x2="12" y2="15"/></svg>`,
  target: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>`,
  timer: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 14 15"/><line x1="9" y1="2" x2="15" y2="2"/><line x1="12" y1="2" x2="12" y2="5"/></svg>`,
  stopwatch: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><circle cx="12" cy="13" r="8"/><polyline points="12 9 12 13 15 15"/><line x1="9" y1="2" x2="15" y2="2"/><line x1="19" y1="5" x2="21" y2="3"/></svg>`,
  report: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><rect x="3" y="3" width="18" height="18"/><polyline points="7 17 10 13 13 15 17 9"/></svg>`,
  mission: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  lock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><rect x="3" y="11" width="18" height="11"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>`,
  share: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>`,
  edit: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
  trash: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>`,
  archive: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
  skip: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/></svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
  play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><polygon points="5 3 19 12 5 21 5 3"/></svg>`,
  chain: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
  chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>`,
  bell: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>`,
  pwa: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><rect x="5" y="2" width="14" height="20" rx="0"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>`,
  insight: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="square"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
};

// Helper: create inline SVG button icon
function svgIcon(name, size=16, color='currentColor') {
  const s = SVG[name];
  if (!s) return '';
  return s.replace('<svg ', `<svg width="${size}" height="${size}" style="flex-shrink:0;color:${color};" `);
}


// ════════════════════════════════════════════════════════════
// PvZ PLANT SYSTEM — proper animated plants
// ════════════════════════════════════════════════════════════

// Inject PvZ-style keyframe animations
(function injectPvZAnims() {
  const style = document.createElement('style');
  style.textContent = `
    /* ── PvZ Snake/Sway motion ── */
    @keyframes pvzSway {
      0%   { transform: rotate(0deg) translateY(0px); }
      15%  { transform: rotate(-4deg) translateY(-1px); }
      30%  { transform: rotate(3deg) translateY(0px); }
      45%  { transform: rotate(-3deg) translateY(-2px); }
      60%  { transform: rotate(4deg) translateY(0px); }
      75%  { transform: rotate(-2deg) translateY(-1px); }
      90%  { transform: rotate(2deg) translateY(0px); }
      100% { transform: rotate(0deg) translateY(0px); }
    }
    @keyframes pvzSnake {
      0%   { d: path("M14 62 Q10 50 14 40 Q18 30 13 20 Q10 12 14 6"); }
      25%  { d: path("M14 62 Q18 50 13 40 Q10 30 15 20 Q18 12 14 6"); }
      50%  { d: path("M14 62 Q10 50 15 40 Q19 30 12 20 Q9 12 14 6"); }
      75%  { d: path("M14 62 Q17 50 12 40 Q9 30 16 20 Q19 12 14 6"); }
      100% { d: path("M14 62 Q10 50 14 40 Q18 30 13 20 Q10 12 14 6"); }
    }
    @keyframes pvzLeafL {
      0%,100% { transform: rotate(-35deg) scaleX(1); }
      40%  { transform: rotate(-25deg) scaleX(1.07); }
      70%  { transform: rotate(-42deg) scaleX(0.95); }
    }
    @keyframes pvzLeafR {
      0%,100% { transform: rotate(35deg) scaleX(1); }
      40%  { transform: rotate(25deg) scaleX(1.07); }
      70%  { transform: rotate(42deg) scaleX(0.95); }
    }
    @keyframes pvzHeadBob {
      0%,100% { transform: translateY(0) rotate(0deg); }
      25%  { transform: translateY(-3px) rotate(-5deg); }
      50%  { transform: translateY(-1px) rotate(3deg); }
      75%  { transform: translateY(-4px) rotate(-3deg); }
    }
    @keyframes pvzBloom {
      0%,100% { transform: scale(1) rotate(0deg); }
      25%  { transform: scale(1.06) rotate(8deg); }
      50%  { transform: scale(1.03) rotate(-5deg); }
      75%  { transform: scale(1.07) rotate(6deg); }
    }
    @keyframes pvzSeed {
      0%,100% { transform: translateY(0) rotate(0deg); }
      30%  { transform: translateY(-5px) rotate(-8deg); }
      60%  { transform: translateY(-2px) rotate(6deg); }
    }
    @keyframes pvzSunPetal {
      0%,100% { transform: rotate(0deg) scaleY(1); }
      50%  { transform: rotate(15deg) scaleY(1.1); }
    }
    @keyframes pvzGlow {
      0%,100% { filter: drop-shadow(0 0 2px rgba(255,230,0,0.3)); }
      50%  { filter: drop-shadow(0 0 8px rgba(255,230,0,0.7)); }
    }
    @keyframes pvzGrow {
      0%   { transform: scaleY(0) translateY(20px); opacity:0; }
      60%  { transform: scaleY(1.08) translateY(-2px); opacity:1; }
      100% { transform: scaleY(1) translateY(0); opacity:1; }
    }
    @keyframes pvzPop {
      0%   { transform: scale(0); opacity:0; }
      60%  { transform: scale(1.15); opacity:1; }
      100% { transform: scale(1); opacity:1; }
    }

    /* Apply to plant cells */
    .plant-cell:not(.future-cell) .pvz-stem {
      animation: pvzSway 2.5s ease-in-out infinite;
      transform-origin: bottom center;
    }
    .plant-cell:not(.future-cell) .pvz-leaf-l {
      animation: pvzLeafL 2.1s ease-in-out infinite;
      transform-origin: right bottom;
    }
    .plant-cell:not(.future-cell) .pvz-leaf-r {
      animation: pvzLeafR 2.3s ease-in-out infinite;
      transform-origin: left bottom;
    }
    .plant-cell:not(.future-cell) .pvz-head {
      animation: pvzHeadBob 2s ease-in-out infinite;
      transform-origin: bottom center;
    }
    .plant-cell:not(.future-cell) .pvz-bloom {
      animation: pvzBloom 1.8s ease-in-out infinite;
      transform-origin: center;
    }
    .plant-s0:not(.future-cell) .pvz-seed {
      animation: pvzSeed 2s ease-in-out infinite;
    }
    .plant-cell:not(.future-cell) .pvz-sun {
      animation: pvzBloom 2.2s ease-in-out infinite, pvzGlow 2.2s ease-in-out infinite;
      transform-origin: center;
    }
    .plant-cell:not(.future-cell) .pvz-petal {
      animation: pvzSunPetal 1.8s ease-in-out infinite;
      transform-origin: center bottom;
    }
    .plant-s5:not(.future-cell) .pvz-stem {
      animation: pvzSway 1.6s ease-in-out infinite;
    }
    .plant-cell.future-cell * { animation: none !important; }
    .plant-just-grew .pvz-stem { animation: pvzGrow 0.5s ease-out forwards, pvzSway 2.5s ease-in-out 0.5s infinite !important; }
    .plant-just-grew .pvz-head { animation: pvzPop 0.4s 0.3s ease-out forwards, pvzHeadBob 2s 0.7s ease-in-out infinite !important; }

    /* Stagger animations between cells */
    .plant-cell:nth-child(odd) .pvz-stem { animation-delay: -0.4s; }
    .plant-cell:nth-child(3n) .pvz-stem { animation-delay: -0.9s; }
    .plant-cell:nth-child(4n) .pvz-head { animation-delay: -0.6s; }
    .plant-cell:nth-child(2n) .pvz-leaf-l { animation-delay: -0.3s; }
    .plant-cell:nth-child(5n) .pvz-leaf-r { animation-delay: -0.7s; }
  `;
  document.head.appendChild(style);
})();

// ── NEW plantSVG — proper PvZ style with CSS classes ──
function plantSVG(stage) {
  if (stage === 0) {
    // Seed in soil — bouncing
    return `<svg class="plant-svg" width="28" height="44" viewBox="0 0 32 64" overflow="visible">
      <ellipse cx="16" cy="61" rx="8" ry="2.5" fill="#7a5c2e" opacity=".5"/>
      <g class="pvz-seed">
        <ellipse cx="16" cy="55" rx="5.5" ry="5" fill="#c8a03c" stroke="#6b4c1a" stroke-width="1.5"/>
        <path d="M16 51 Q18 48 16 46 Q14 48 16 51" fill="#5a9e30" stroke="#2d5a14" stroke-width="1"/>
        <ellipse cx="14.5" cy="54.5" rx="1.5" ry="1" fill="#a07030" opacity=".6"/>
        <ellipse cx="17.5" cy="56" rx="1.5" ry="1" fill="#a07030" opacity=".4"/>
      </g>
    </svg>`;
  }

  if (stage === 1) {
    // Tiny sprout — single wobbly stem + 2 small leaves
    return `<svg class="plant-svg" width="28" height="44" viewBox="0 0 32 64" overflow="visible">
      <ellipse cx="16" cy="62" rx="7" ry="2" fill="#7a5c2e" opacity=".4"/>
      <g class="pvz-stem" style="transform-origin:16px 62px">
        <path d="M16 62 Q12 54 15 46 Q17 40 15 34" fill="none" stroke="#3d7a20" stroke-width="2.5" stroke-linecap="round"/>
        <g class="pvz-leaf-l" style="transform-origin:15px 46px; transform:rotate(-35deg)">
          <ellipse cx="9" cy="43" rx="8" ry="4" fill="#6aba38" stroke="#2d6010" stroke-width="1"/>
          <path d="M15 46 Q9 43 7 40" fill="none" stroke="#2d6010" stroke-width=".8" opacity=".5"/>
        </g>
        <g class="pvz-leaf-r" style="transform-origin:15px 40px; transform:rotate(35deg)">
          <ellipse cx="21" cy="37" rx="7" ry="3.5" fill="#5eb030" stroke="#2d6010" stroke-width="1"/>
        </g>
        <g class="pvz-head" style="transform-origin:15px 34px">
          <ellipse cx="15" cy="31" rx="6" ry="5" fill="#7aca40" stroke="#2d6010" stroke-width="1.2"/>
          <path d="M12 29 Q15 27 18 29" fill="none" stroke="#2d6010" stroke-width=".9"/>
        </g>
      </g>
    </svg>`;
  }

  if (stage === 2) {
    // Small plant — taller, more leaves
    return `<svg class="plant-svg" width="28" height="44" viewBox="0 0 32 64" overflow="visible">
      <ellipse cx="16" cy="63" rx="8" ry="2.2" fill="#7a5c2e" opacity=".45"/>
      <g class="pvz-stem" style="transform-origin:16px 63px">
        <path d="M16 63 Q11 55 15 46 Q18 38 14 30 Q12 24 16 18" fill="none" stroke="#2d6010" stroke-width="3" stroke-linecap="round"/>
        <g class="pvz-leaf-l" style="transform-origin:15px 50px; transform:rotate(-40deg)">
          <ellipse cx="8" cy="47" rx="9" ry="4.5" fill="#6aba38" stroke="#1e5010" stroke-width="1.2"/>
          <path d="M15 50 Q8 47 5 43" fill="none" stroke="#1e5010" stroke-width=".9" opacity=".5"/>
        </g>
        <g class="pvz-leaf-r" style="transform-origin:14px 43px; transform:rotate(40deg)">
          <ellipse cx="22" cy="40" rx="8.5" ry="4" fill="#5ab030" stroke="#1e5010" stroke-width="1.2"/>
        </g>
        <g class="pvz-leaf-l" style="transform-origin:14px 34px; transform:rotate(-30deg); animation-delay:-0.5s">
          <ellipse cx="8" cy="32" rx="7" ry="3.5" fill="#72c838" stroke="#1e5010" stroke-width="1"/>
        </g>
        <g class="pvz-leaf-r" style="transform-origin:16px 28px; transform:rotate(30deg); animation-delay:-0.8s">
          <ellipse cx="22" cy="26" rx="7" ry="3.5" fill="#5ab030" stroke="#1e5010" stroke-width="1"/>
        </g>
        <g class="pvz-head" style="transform-origin:16px 18px">
          <ellipse cx="16" cy="15" rx="7" ry="6" fill="#80d040" stroke="#1e5010" stroke-width="1.5"/>
          <path d="M12 13 Q16 10 20 13" fill="none" stroke="#1e5010" stroke-width="1"/>
          <circle cx="14" cy="15" r="1.2" fill="#1e5010" opacity=".4"/>
          <circle cx="18" cy="15" r="1.2" fill="#1e5010" opacity=".4"/>
        </g>
      </g>
    </svg>`;
  }

  if (stage === 3) {
    // Medium — prominent head, full leaves
    return `<svg class="plant-svg" width="28" height="44" viewBox="0 0 32 64" overflow="visible">
      <ellipse cx="16" cy="63" rx="9" ry="2.5" fill="#6b4c1a" opacity=".5"/>
      <g class="pvz-stem" style="transform-origin:16px 63px">
        <path d="M16 63 Q10 54 15 44 Q19 36 13 26 Q11 19 16 13" fill="none" stroke="#1a5008" stroke-width="3.5" stroke-linecap="round"/>
        <g class="pvz-leaf-l" style="transform-origin:15px 50px; transform:rotate(-45deg)">
          <ellipse cx="6" cy="46" rx="11" ry="5" fill="#5ab028" stroke="#1a5008" stroke-width="1.3"/>
          <path d="M15 50 Q6 46 3 41" fill="none" stroke="#1a5008" stroke-width="1" opacity=".5"/>
        </g>
        <g class="pvz-leaf-r" style="transform-origin:14px 42px; transform:rotate(42deg)">
          <ellipse cx="24" cy="38" rx="10" ry="4.5" fill="#4da020" stroke="#1a5008" stroke-width="1.3"/>
        </g>
        <g class="pvz-leaf-l" style="transform-origin:13px 32px; transform:rotate(-30deg); animation-delay:-0.6s">
          <ellipse cx="6" cy="29" rx="9" ry="4" fill="#5ab028" stroke="#1a5008" stroke-width="1"/>
        </g>
        <g class="pvz-leaf-r" style="transform-origin:15px 25px; transform:rotate(28deg); animation-delay:-1s">
          <ellipse cx="23" cy="22" rx="8.5" ry="4" fill="#4da020" stroke="#1a5008" stroke-width="1"/>
        </g>
        <g class="pvz-head" style="transform-origin:16px 13px">
          <ellipse cx="16" cy="10" rx="9" ry="8" fill="#88d840" stroke="#1a5008" stroke-width="1.8"/>
          <path d="M11 8 Q16 5 21 8" fill="none" stroke="#1a5008" stroke-width="1.2"/>
          <circle cx="13.5" cy="10.5" r="1.5" fill="#1a5008" opacity=".5"/>
          <circle cx="18.5" cy="10.5" r="1.5" fill="#1a5008" opacity=".5"/>
          <path d="M13 13 Q16 15 19 13" fill="none" stroke="#1a5008" stroke-width="1" opacity=".7"/>
        </g>
      </g>
    </svg>`;
  }

  if (stage === 4) {
    // Full grown — PvZ Peashooter style
    return `<svg class="plant-svg" width="34" height="64" viewBox="0 0 34 64" overflow="visible">
      <ellipse cx="17" cy="63" rx="10" ry="2.5" fill="#5a3e10" opacity=".6"/>
      <g class="pvz-stem" style="transform-origin:17px 63px">
        <path d="M17 63 Q10 52 16 42 Q21 33 14 23 Q11 16 17 9" fill="none" stroke="#145008" stroke-width="4" stroke-linecap="round"/>
        <g class="pvz-leaf-l" style="transform-origin:16px 50px; transform:rotate(-45deg)">
          <path d="M16 50 Q4 44 2 36 Q6 38 16 50z" fill="#4a9818" stroke="#145008" stroke-width="1.2"/>
        </g>
        <g class="pvz-leaf-r" style="transform-origin:15px 42px; transform:rotate(44deg)">
          <path d="M15 42 Q27 36 29 28 Q24 31 15 42z" fill="#429018" stroke="#145008" stroke-width="1.2"/>
        </g>
        <g class="pvz-leaf-l" style="transform-origin:14px 31px; transform:rotate(-32deg); animation-delay:-0.7s">
          <path d="M14 31 Q3 26 2 19 Q6 22 14 31z" fill="#4a9818" stroke="#145008" stroke-width="1"/>
        </g>
        <g class="pvz-leaf-r" style="transform-origin:16px 24px; transform:rotate(30deg); animation-delay:-1.1s">
          <path d="M16 24 Q28 19 29 13 Q24 16 16 24z" fill="#429018" stroke="#145008" stroke-width="1"/>
        </g>
        <g class="pvz-head" style="transform-origin:17px 9px">
          <!-- Peashooter head -->
          <ellipse cx="17" cy="7" rx="11" ry="9.5" fill="#90e040" stroke="#145008" stroke-width="2"/>
          <ellipse cx="17" cy="4" rx="7" ry="5" fill="#aaee60" stroke="#145008" stroke-width="1.5"/>
          <!-- eyes -->
          <circle cx="13.5" cy="6.5" r="2" fill="white" stroke="#145008" stroke-width="1"/>
          <circle cx="20.5" cy="6.5" r="2" fill="white" stroke="#145008" stroke-width="1"/>
          <circle cx="14" cy="7" r="1.1" fill="#1a1a1a"/>
          <circle cx="21" cy="7" r="1.1" fill="#1a1a1a"/>
          <circle cx="14.4" cy="6.6" r="0.4" fill="white"/>
          <circle cx="21.4" cy="6.6" r="0.4" fill="white"/>
          <!-- mouth -->
          <path d="M14 10 Q17 12.5 20 10" fill="none" stroke="#145008" stroke-width="1.2"/>
          <!-- shooter opening -->
          <ellipse cx="17" cy="1.5" rx="4.5" ry="3" fill="#60b820" stroke="#145008" stroke-width="1.2"/>
          <ellipse cx="17" cy="1" rx="3" ry="1.8" fill="#1a1a1a" opacity=".5"/>
        </g>
      </g>
    </svg>`;
  }

  // stage 5 = SUNFLOWER — full PvZ sunflower
  return `<svg class="plant-svg" width="34" height="64" viewBox="0 0 34 64" overflow="visible">
    <ellipse cx="17" cy="63" rx="10" ry="2.5" fill="#5a3e10" opacity=".6"/>
    <g class="pvz-stem" style="transform-origin:17px 63px">
      <path d="M17 63 Q11 53 16 43 Q21 34 15 23 Q12 16 17 9" fill="none" stroke="#145008" stroke-width="3.8" stroke-linecap="round"/>
      <g class="pvz-leaf-l" style="transform-origin:16px 49px; transform:rotate(-45deg)">
        <path d="M16 49 Q4 43 2 35 Q6 38 16 49z" fill="#4a9818" stroke="#145008" stroke-width="1.2"/>
      </g>
      <g class="pvz-leaf-r" style="transform-origin:15px 41px; transform:rotate(44deg)">
        <path d="M15 41 Q27 35 29 27 Q24 30 15 41z" fill="#429018" stroke="#145008" stroke-width="1.2"/>
      </g>
      <g class="pvz-leaf-l" style="transform-origin:14px 30px; transform:rotate(-30deg); animation-delay:-0.6s">
        <path d="M14 30 Q3 25 2 18 Q6 21 14 30z" fill="#4a9818" stroke="#145008" stroke-width="1"/>
      </g>
    </g>
    <!-- Sunflower head — separate animation -->
    <g class="pvz-sun" style="transform-origin:17px 9px">
      <!-- Petals -->
      ${Array.from({length:12},(_,i)=>{
        const a = i * 30 * Math.PI / 180;
        const px = 17 + 11 * Math.cos(a);
        const py = 9 + 11 * Math.sin(a);
        return `<ellipse class="pvz-petal" cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="4" ry="2.5" fill="#FFE600" stroke="#c8a000" stroke-width=".8" transform="rotate(${i*30} ${px.toFixed(1)} ${py.toFixed(1)})" style="animation-delay:${(i*0.15).toFixed(2)}s"/>`;
      }).join('')}
      <!-- Outer petals -->
      ${Array.from({length:8},(_,i)=>{
        const a = (i * 45 + 22.5) * Math.PI / 180;
        const px = 17 + 13.5 * Math.cos(a);
        const py = 9 + 13.5 * Math.sin(a);
        return `<ellipse cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" rx="3.5" ry="2" fill="#FFC800" stroke="#a08000" stroke-width=".7" transform="rotate(${i*45+22.5} ${px.toFixed(1)} ${py.toFixed(1)})" opacity=".8"/>`;
      }).join('')}
      <!-- Center disc -->
      <circle cx="17" cy="9" r="7.5" fill="#5c3d00" stroke="#2d1a00" stroke-width="1.5"/>
      <circle cx="17" cy="9" r="5.5" fill="#3d2800"/>
      <!-- Face -->
      <circle cx="14.5" cy="7.5" r="1.8" fill="white" stroke="#2d1a00" stroke-width=".8"/>
      <circle cx="19.5" cy="7.5" r="1.8" fill="white" stroke="#2d1a00" stroke-width=".8"/>
      <circle cx="14.9" cy="7.9" r="1" fill="#1a0800"/>
      <circle cx="19.9" cy="7.9" r="1" fill="#1a0800"/>
      <circle cx="15.2" cy="7.5" r="0.35" fill="white"/>
      <circle cx="20.2" cy="7.5" r="0.35" fill="white"/>
      <path d="M14.5 10.5 Q17 12.5 19.5 10.5" fill="none" stroke="#8B6914" stroke-width=".9"/>
      <!-- Sun rays glow effect -->
      <circle cx="17" cy="9" r="14" fill="none" stroke="#FFE600" stroke-width=".5" opacity=".3"/>
    </g>
  </svg>`;
}

// ════════════════════════════════════════════════════════════
// HABIT STRENGTH SCORE (0–100%)
// ════════════════════════════════════════════════════════════
// Strength cache: invalidated when habits change or day changes
// [// [_strengthCache declared at top]
// [// [_strengthCacheDate declared at top]
function _invalidateStrengthCache() { _strengthCache = {}; }

function getHabitStrength(h) {
  const td = todayStr();
  // Invalidate cache on new day
  if (_strengthCacheDate !== td) { _strengthCache = {}; _strengthCacheDate = td; }
  const cacheKey = h.id + ':' + (h.streak||0) + ':' + (h.completedToday?1:0) + ':' + (h.totalDone||0);
  if (_strengthCache[cacheKey] !== undefined) return _strengthCache[cacheKey];

  const today = new Date();
  const days30 = Array.from({length:30}, (_,i) => {
    const d = new Date(today); d.setDate(d.getDate()-i);
    return d.toISOString().split('T')[0];
  });
  const histDone = new Set((S.history||[]).filter(e=>e.habitId===h.id&&e.status==='done').map(e=>e.date));
  let due = 0, done = 0;
  days30.forEach(ds => {
    if (!isDueDateStr(h, ds)) return;
    due++;
    const snap = S.lockedDays && S.lockedDays[ds];
    if (snap) {
      if (snap.find(s => s.habitId === h.id && s.completed)) done++;
    } else if (ds === td) {
      if (h.completedToday) done++;
    } else if (histDone.has(ds)) {
      done++;
    }
  });
  let result;
  if (due === 0) {
    const ageDays = Math.max(1, Math.ceil((Date.now()-new Date(h.createdAt||Date.now()))/(864e5)));
    const dueDays = Math.ceil(ageDays * (h.freq==='daily'?1:h.freq==='weekdays'?5/7:h.freq==='weekends'?2/7:h.freq==='3x/week'?3/7:h.freq==='weekly'?1/7:1/30));
    if (dueDays===0) { _strengthCache[cacheKey]=0; return 0; }
    const raw = Math.min(100,Math.round((h.totalDone||0)/dueDays*100));
    result = Math.min(100, raw + Math.min(15,Math.floor((h.streak||0)/7)*5));
  } else {
    const raw = Math.round(done / due * 100);
    result = Math.min(100, raw + Math.min(15, Math.floor((h.streak||0)/7)*5));
  }
  _strengthCache[cacheKey] = result;
  return result;
}

function strengthColor(score) {
  if (score >= 85) return 'var(--lime)';
  if (score >= 65) return 'var(--cyan)';
  if (score >= 40) return 'var(--yellow)';
  if (score >= 20) return 'var(--orange)';
  return 'var(--red)';
}

// ════════════════════════════════════════════════════════════
// <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ANTI-HABIT TRACKER
// ════════════════════════════════════════════════════════════
function addAntiHabit(name, icon, trigger) {
  S.antiHabits = S.antiHabits || [];
  S.antiHabits.push({
    id: 'a' + Date.now(),
    name, icon: icon || 'fire', trigger: trigger || '',
    streak: 0, bestStreak: 0, totalResisted: 0,
    lastResisted: null, failedToday: false,
    createdAt: todayStr()
  });
  save(); renderAntiHabits();
  toast('🚫 Anti-habit added!', 'success');
}

function resistAntiHabit(id) {
  const a = (S.antiHabits||[]).find(x => x.id === id); if (!a) return;
  const today = todayStr();
  if (a.lastResisted === today) { toast('Already logged today!', 'info'); return; }

  // FIX 5: cek apakah streak harus break karena gap hari (miss kemarin)
  if (a.lastResisted) {
    const last = new Date(a.lastResisted + 'T12:00:00');
    const now = new Date(today + 'T12:00:00');
    const diffDays = Math.round((now - last) / 864e5);
    if (diffDays > 1) {
      // Ada gap — streak break dulu sebelum mulai lagi
      a.streak = 0;
    }
  }

  a.streak = (a.streak||0) + 1;
  a.bestStreak = Math.max(a.bestStreak||0, a.streak);
  a.totalResisted = (a.totalResisted||0) + 1;
  a.lastResisted = today; a.failedToday = false;
  a._resistedXpToday = 15; // simpan untuk reverse jika fail hari yang sama
  S.xp = (S.xp||0) + 15;
  save(); renderAntiHabits(); renderStats();
  playSound('tick');
  toast(`💪 Resisted "${a.name}"! +15 XP`, 'success');
  if (S.confettiOn !== false) confetti(6);
}

function failAntiHabit(id) {
  const a = (S.antiHabits||[]).find(x => x.id === id); if (!a) return;
  const today = todayStr();
  // FIX 6: reverse XP kalau sudah resist hari yang sama
  if (a.lastResisted === today && a._resistedXpToday) {
    S.xp = Math.max(0, (S.xp||0) - a._resistedXpToday);
    a._resistedXpToday = 0;
  }
  a.streak = 0; a.failedToday = true; a.lastResisted = today;
  save(); renderAntiHabits(); renderStats();
  toast(`📉 "${a.name}" streak reset. Tomorrow is a new day!`, 'error');
}

function deleteAntiHabit(id) {
  S.antiHabits = (S.antiHabits||[]).filter(x => x.id !== id);
  save(); renderAntiHabits();
}

function renderAntiHabits() {
  const el = $('anti-habits-list');
  if (!el) return;
  S.antiHabits = S.antiHabits || [];
  if (!S.antiHabits.length) {
    el.innerHTML = getEmptyState("anti");
    return;
  }
  const today = todayStr();
  el.innerHTML = S.antiHabits.map(a => {
    const loggedToday = a.lastResisted === today;
    const pct = Math.min(100, Math.round((a.streak||0) / Math.max(1, 30) * 100));
    const ic = HABIT_ICONS.find(x => x.id === a.icon) || HABIT_ICONS[0];
    const iconSvg = ic ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ic.svg}</svg>` : '🚫';
    return `<div class="anti-habit-card">
      <div style="width:36px;height:36px;background:var(--red);display:flex;align-items:center;justify-content:center;border:var(--bo);flex-shrink:0;color:white;">${iconSvg}</div>
      <div style="flex:1;min-width:0;">
        <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px;">
          <div style="font-weight:700;font-size:11px;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${a.name}</div>
          <span class="anti-badge"><svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg> ANTI</span>
        </div>
        ${a.trigger ? `<div style="font-size:9px;color:var(--sub);margin-bottom:3px;">Trigger: ${a.trigger}</div>` : ''}
        <div class="anti-progress"><div class="anti-fill" style="width:${pct}%"></div></div>
        <div style="display:flex;justify-content:space-between;font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);margin-top:2px;">
          <span>🔥 ${a.streak||0} days clean</span><span>Best: ${a.bestStreak||0}</span>
        </div>
      </div>
      <div style="display:flex;flex-direction:column;gap:4px;flex-shrink:0;">
        <div class="anti-streak">${a.streak||0}</div>
        ${!loggedToday ? `
          <button class="anti-resist-btn" onclick="resistAntiHabit('${a.id}')">✓ CLEAN</button>
          <button class="anti-resist-btn failed" onclick="failAntiHabit('${a.id}')">✗ FAILED</button>
        ` : `<div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--lime);text-align:center;">${a.failedToday?'FAILED':'CLEAN ✓'}</div>`}
        <button class="btn btn-xs btn-danger" onclick="deleteAntiHabit('${a.id}')"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="square"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg></button>
      </div>
    </div>`;
  }).join('');
}

// ════════════════════════════════════════════════════════════
// RITUAL BUNDLES
// ════════════════════════════════════════════════════════════
function openAddRitual() {
  const cl = $('ritual-habit-checklist'); if (!cl) return;
  cl.innerHTML = S.habits.filter(h => !h.archived).map(h => {
    const ic = HABIT_ICONS.find(x => x.id === h.icon);
    const svg = ic ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ic.svg}</svg>` : '';
    return `<label style="display:flex;align-items:center;gap:7px;padding:6px 0;cursor:pointer;border-bottom:1px solid var(--bg);">
      <input type="checkbox" value="${h.id}" style="width:16px;height:16px;accent-color:var(--yellow);">
      <span style="display:flex;align-items:center;gap:5px;">${svg} <span style="font-size:11px;">${h.name}</span></span>
    </label>`;
  }).join('');
  $('ritual-inp-name').value = '';
  $('ritual-inp-time').value = 'morning';
  document.querySelectorAll('#modal-ritual .freq-btn').forEach((b,i) => b.classList.toggle('sel', i===0));
  openModal('modal-ritual');
}

function selRitualTime(el, val) {
  document.querySelectorAll('#modal-ritual .freq-btn').forEach(b => b.classList.remove('sel'));
  el.classList.add('sel'); $('ritual-inp-time').value = val;
}

function saveRitual() {
  const name = $('ritual-inp-name')?.value.trim();
  if (!name) { toast('Enter ritual name!', 'error'); return; }
  const habitIds = [...document.querySelectorAll('#ritual-habit-checklist input:checked')].map(i => i.value);
  if (!habitIds.length) { toast('Select at least 1 habit!', 'error'); return; }
  S.rituals = S.rituals || [];
  S.rituals.push({
    id: 'r' + Date.now(), name,
    time: $('ritual-inp-time')?.value || 'morning',
    habitIds, createdAt: todayStr()
  });
  save(); renderRituals();
  closeModal('modal-ritual');
  toast(`⚡ "${name}" ritual created!`, 'success');
}

function deleteRitual(id) {
  S.rituals = (S.rituals||[]).filter(r => r.id !== id);
  save(); renderRituals();
}

const RITUAL_TIME_ICONS = { morning:'🌅', afternoon:'☀️', evening:'🌙', anytime:'⚡' };
const RITUAL_COLORS = { morning:'#FF6B00', afternoon:'#FFE600', evening:'#7B2FBE', anytime:'#00F5D4' };

function renderRituals() {
  const el = $('rituals-list'); if (!el) return;
  S.rituals = S.rituals || [];
  if (!S.rituals.length) {
    el.innerHTML = getEmptyState("rituals");
    return;
  }
  el.innerHTML = S.rituals.map(r => {
    const habits = r.habitIds.map(id => S.habits.find(h => h.id === id)).filter(Boolean);
    const done = habits.filter(h => h?.completedToday).length;
    const total = habits.length;
    const pct = total ? Math.round(done/total*100) : 0;
    const color = RITUAL_COLORS[r.time] || 'var(--cyan)';
    const tIcon = RITUAL_TIME_ICONS[r.time] || '⚡';
    return `<div class="ritual-card" data-rid="${r.id}">
      <div class="ritual-header" onclick="toggleRitualExpand('${r.id}')">
        <div class="ritual-icon-wrap" style="background:${color}22;border-color:${color};">
          <span style="font-size:18px;">${tIcon}</span>
        </div>
        <div style="flex:1;">
          <div class="ritual-title">${r.name}</div>
          <div class="ritual-meta">${(r.time||"").toUpperCase()} · ${done}/${total} done</div>
        </div>
        <div style="font-family:'Archivo Black',sans-serif;font-size:16px;color:${pct===100?'var(--lime)':color}">${pct}%</div>
        <button class="btn btn-xs btn-danger" onclick="event.stopPropagation();deleteRitual('${r.id}')" style="margin-left:5px;padding:3px 6px;">×</button>
      </div>
      <div class="ritual-prog-wrap">
        <div class="ritual-prog-track"><div class="ritual-prog-fill" style="width:${pct}%;background:${color};"></div></div>
      </div>
      <div class="ritual-habits-list" id="ritual-habits-${r.id}">
        ${habits.map(h => {
          if (!h) return '';
          const ic = HABIT_ICONS.find(x => x.id === h.icon);
          const svg = ic ? `<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ic.svg}</svg>` : '';
          return `<div class="ritual-habit-row">
            <div class="rhc${h.completedToday?' done':''}" onclick="toggleHabit('${h.id}','th');setTimeout(()=>renderRituals(),100);">${h.completedToday?'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--black)" stroke-width="2.5" stroke-linecap="square"><polyline points="20 6 9 17 4 12"/></svg>':''}</div>
            <span style="display:flex;align-items:center;gap:5px;flex:1;">${svg}<span style="font-size:11px;font-weight:600;${h.completedToday?'text-decoration:line-through;opacity:.6;':''}">${h.name}</span></span>
            ${h.scheduledTime?`<span class="ritual-time-badge">${h.scheduledTime}</span>`:''}
            <span style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--orange);">🔥${h.streak||0}</span>
          </div>`;
        }).join('')}
      </div>
      ${pct<100?`<button class="start-ritual-btn" onclick="startRitual('${r.id}')"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><polygon points="5 3 19 12 5 21 5 3"/></svg> START RITUAL</button>`:`<div style="background:var(--lime);padding:8px;text-align:center;font-family:'Archivo Black',sans-serif;font-size:10px;color:var(--black);">✓ RITUAL COMPLETE</div>`}
    </div>`;
  }).join('');
}

function startRitual(id) {
  const r = (S.rituals||[]).find(x => x.id === id); if (!r) return;
  const pending = r.habitIds.map(id => S.habits.find(h => h.id === id)).filter(h => h && !h.completedToday && !h.paused);
  if (!pending.length) { toast('All done!', 'info'); return; }
  toast(`⚡ Starting "${r.name}" — ${pending.length} habits`, 'info');
}

// ════════════════════════════════════════════════════════════
// HABIT DETAIL PAGE
// ════════════════════════════════════════════════════════════
function openHabitDetail(id) {
  const h = S.habits.find(x => x.id === id); if (!h) return;
  setTxt('hd-title', h.name);
  const cat = CATS[h.category] || CATS.custom;
  setTxt('hd-cat', `${cat.label} · ${h.freq}`);
  setTxt('hd-streak-num', (h.streak||0));

  const strength = getHabitStrength(h);
  const sc = strengthColor(strength);
  const totalXp = (h.totalDone||0) * 10;
  const totalHours = Math.round((h.totalDone||0) * 0.5 * 10) / 10;

  // Build 30-day history
  const today = new Date();
  const days30 = Array.from({length:30}, (_,i) => {
    const d = new Date(today); d.setDate(d.getDate()-(29-i));
    return d.toISOString().split('T')[0];
  });

  // Completion notes for this habit
  const notes = (S.completionNotes||{})[id] || {};

  const body = $('hd-body'); if (!body) return;
  body.innerHTML = `
    <!-- Strength + Stats -->
    <div style="display:flex;gap:9px;align-items:center;background:var(--surface);border:var(--bo-t);padding:11px;margin-bottom:11px;box-shadow:var(--sha-sm);">
      <div style="flex:1;">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);text-transform:uppercase;margin-bottom:3px;">Habit Strength</div>
        <div style="font-family:'Archivo Black',sans-serif;font-size:32px;color:${sc};line-height:1;">${strength}%</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:${sc};">${strength>=85?'EXCELLENT':strength>=65?'STRONG':strength>=40?'BUILDING':strength>=20?'WEAK':'JUST STARTING'}</div>
      </div>
      <div style="flex:1;height:8px;background:#eee;border:var(--bo);overflow:hidden;align-self:flex-end;margin-bottom:12px;">
        <div style="height:100%;width:${strength}%;background:${sc};transition:width .6s;"></div>
      </div>
    </div>
    <div class="hd-stats-row">
      <div class="hd-stat"><div class="hd-stat-val">${h.streak||0}</div><div class="hd-stat-lbl">Streak</div></div>
      <div class="hd-stat"><div class="hd-stat-val">${h.bestStreak||0}</div><div class="hd-stat-lbl">Best</div></div>
      <div class="hd-stat"><div class="hd-stat-val">${h.totalDone||0}</div><div class="hd-stat-lbl">Total Done</div></div>
      <div class="hd-stat"><div class="hd-stat-val">${totalXp}</div><div class="hd-stat-lbl">XP Earned</div></div>
      <div class="hd-stat"><div class="hd-stat-val">${totalHours}h</div><div class="hd-stat-lbl">Est. Hours</div></div>
      <div class="hd-stat"><div class="hd-stat-val">${Math.round(strength)}%</div><div class="hd-stat-lbl">Consistency</div></div>
    </div>
    <!-- 30-day trend -->
    <div style="font-family:'Archivo Black',sans-serif;font-size:10px;text-transform:uppercase;margin-bottom:7px;display:flex;align-items:center;gap:6px;">
      <div style="width:9px;height:9px;background:var(--text);"></div><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg> 30-Day Trend
    </div>
    <div class="hd-trend-chart">
      ${days30.map(ds => {
        const snap = S.lockedDays && S.lockedDays[ds];
        let done = false;
        if (snap) done = !!snap.find(s => s.habitId === h.id && s.completed);
        else if (ds === todayStr()) done = !!h.completedToday;
        const isDue = isDueDateStr(h, ds);
        const ht = isDue ? (done ? 38 : 12) : 4;
        const color = !isDue ? '#e0e0d0' : done ? h.color : '#ffcccc';
        return `<div class="hd-bar" style="height:${ht}px;background:${color};"></div>`;
      }).join('')}
    </div>
    <!-- Mini calendar -->
    <div style="font-family:'Archivo Black',sans-serif;font-size:10px;text-transform:uppercase;margin-bottom:7px;display:flex;align-items:center;gap:6px;">
      <div style="width:9px;height:9px;background:var(--text);"></div><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><rect x="3" y="4" width="18" height="17"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg> Last 4 Weeks
    </div>
    <div class="hd-mini-cal">
      ${days30.map(ds => {
        const snap = S.lockedDays && S.lockedDays[ds];
        let done = false;
        if (snap) done = !!snap.find(s => s.habitId === h.id && s.completed);
        else if (ds === todayStr()) done = !!h.completedToday;
        const isDue = isDueDateStr(h, ds);
        const color = !isDue ? 'var(--bg)' : done ? h.color : '#ffeeee';
        const border = ds === todayStr() ? 'border:2px solid var(--pink)' : '';
        return `<div class="hd-cal-cell" style="background:${color};${border}" title="${ds}"></div>`;
      }).join('')}
    </div>
    <!-- Perfect badges -->
    ${(()=>{
      const wDone = days30.slice(-7).every(ds => { const snap=S.lockedDays&&S.lockedDays[ds]; return !isDueDateStr(h,ds)||(snap?!!snap.find(s=>s.habitId===h.id&&s.completed):(ds===todayStr()&&h.completedToday)); });
      const mDone = days30.every(ds => { const snap=S.lockedDays&&S.lockedDays[ds]; return !isDueDateStr(h,ds)||(snap?!!snap.find(s=>s.habitId===h.id&&s.completed):(ds===todayStr()&&h.completedToday)); });
      return (wDone||mDone)?`<div style="display:flex;gap:5px;margin-bottom:11px;">${wDone?'<div class="perfect-week-badge">🏆 PERFECT WEEK</div>':''}${mDone?'<div class="perfect-month-badge">🌟 PERFECT MONTH</div>':''}</div>`:'';
    })()}
    <!-- Completion notes -->
    <div style="font-family:'Archivo Black',sans-serif;font-size:10px;text-transform:uppercase;margin-bottom:7px;display:flex;align-items:center;gap:6px;">
      <div style="width:9px;height:9px;background:var(--text);"></div>Completion Notes
    </div>
    ${Object.entries(notes).length ? Object.entries(notes).sort((a,b)=>b[0].localeCompare(a[0])).slice(0,10).map(([date,note])=>`<div class="hd-note-row"><div class="hd-note-date">${date}</div><div>${note}</div></div>`).join('') : `<div style="font-size:10px;color:var(--sub);padding:7px;">No notes yet. Add notes when completing habits.</div>`}
    <!-- Science Tip -->
    <div style="background:rgba(123,47,190,.1);border:1.5px solid var(--purple);padding:9px 11px;margin-bottom:11px;">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--purple);text-transform:uppercase;margin-bottom:4px;"><svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="var(--purple)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><path d="M12 2a7 7 0 017 7c0 3.87-3 5-3 9H8c0-4-3-5.13-3-9a7 7 0 017-7z"/><line x1="8" y1="22" x2="16" y2="22"/><line x1="12" y1="18" x2="12" y2="22"/></svg> SCIENCE TIP</div>
      <div style="font-size:10px;line-height:1.5;">${getHabitTip(h.category||'custom')}</div>
    </div>
    <!-- <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> Milestone Badges -->
    <div style="font-family:'Archivo Black',sans-serif;font-size:10px;text-transform:uppercase;margin-bottom:7px;display:flex;align-items:center;gap:6px;">
      <div style="width:9px;height:9px;background:var(--text);"></div><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg> Milestone Badges
    </div>
    <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:11px;">
      ${MILESTONE_BADGES.map(b=>{const earned=(h.bestStreak||0)>=b.days;return `<div style="padding:4px 8px;border:1.5px solid ${earned?b.color:'#444'};font-family:'IBM Plex Mono',monospace;font-size:8px;font-weight:700;color:${earned?b.color:'#444'};${earned?`background:${b.color}22;`:''}">${b.icon} ${b.label}</div>`;}).join('')}
    </div>
    <!-- Next Badge -->
    ${(()=>{const next=getNextBadge(h);return next?`<div style="font-size:10px;color:var(--sub);margin-bottom:11px;">Next: <strong style="color:${next.color}">${next.icon} ${next.label}</strong> at ${next.days} day streak (${next.days-(h.bestStreak||0)} to go)</div>`:'<div style="font-size:10px;color:var(--lime);margin-bottom:11px;">🏆 All badges earned!</div>';})()}
    <!-- Actions -->
    <div style="display:flex;gap:6px;margin-top:13px;flex-wrap:wrap;">
      <button class="btn btn-sm" onclick="editHabit('${h.id}');closeHabitDetail();"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit</button>
      <button class="btn btn-sm" onclick="openModal('modal-backfill')"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><rect x="3" y="4" width="18" height="17"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="16" y1="2" x2="16" y2="6"/></svg> Backfill</button>
      ${!h.archived?`<button class="btn btn-sm" onclick="archiveHabit('${h.id}');closeHabitDetail();"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg> Archive</button>`:''}
      <button class="btn btn-sm btn-danger" onclick="closeHabitDetail();confirmDelete('${h.id}');"><svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg> Delete</button>
    </div>
  `;
  $('habit-detail-overlay').classList.add('open');
}
function closeHabitDetail() { $('habit-detail-overlay').classList.remove('open'); }

// ════════════════════════════════════════════════════════════
// GOAL TREE
// ════════════════════════════════════════════════════════════
function openAddGoal() {
  const cl = $('goal-habit-checklist'); if (!cl) return;
  cl.innerHTML = S.habits.filter(h=>!h.archived).map(h => {
    const ic = HABIT_ICONS.find(x=>x.id===h.icon);
    const svg = ic?`<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ic.svg}</svg>`:'';
    return `<label style="display:flex;align-items:center;gap:7px;padding:6px 0;cursor:pointer;border-bottom:1px solid var(--bg);">
      <input type="checkbox" value="${h.id}" style="width:16px;height:16px;accent-color:var(--yellow);">
      <span style="display:flex;align-items:center;gap:5px;">${svg}<span style="font-size:11px;">${h.name}</span></span>
    </label>`;
  }).join('');
  $('goal-inp-name').value = ''; $('goal-inp-date').value = '';
  openModal('modal-goal');
}

function saveGoal() {
  const name = $('goal-inp-name')?.value.trim();
  if (!name) { toast('Enter goal name!', 'error'); return; }
  const habitIds = [...document.querySelectorAll('#goal-habit-checklist input:checked')].map(i=>i.value);
  S.goals = S.goals || [];
  S.goals.push({ id: 'g'+Date.now(), name, targetDate: $('goal-inp-date')?.value||'', habitIds, createdAt: todayStr() });
  save(); renderGoals();
  closeModal('modal-goal');
  toast(`🎯 "${name}" goal created!`, 'success');
}

function deleteGoal(id) { S.goals=(S.goals||[]).filter(g=>g.id!==id); save(); renderGoals(); }

function renderGoals() {
  const el = $('goals-list'); 
  if (!el) return;
  S.goals = S.goals || [];
  if (!S.goals.length) {
    el.innerHTML = getEmptyState("goals");
    return;
  }
  el.innerHTML = S.goals.map(g => {
    const habits = (g.habitIds||[]).map(id=>S.habits.find(h=>h.id===id)).filter(Boolean);
    const done = habits.filter(h=>h?.completedToday).length;
    const total = habits.length;
    const pct = total ? Math.round(done/total*100) : 0;
    const daysLeft = g.targetDate ? Math.max(0, Math.ceil((new Date(g.targetDate)-new Date())/(864e5))) : null;
    return `<div class="goal-card">
      <div class="goal-header">
        <div class="goal-icon" style="background:rgba(0,245,212,.1);border-color:var(--cyan);">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="var(--cyan)" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
        </div>
        <div style="flex:1;">
          <div class="goal-title">${g.name}</div>
          ${daysLeft!==null?`<div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);">${daysLeft} days left · ${g.targetDate}</div>`:''}
        </div>
        <div class="goal-prog">${done}/${total}</div>
        <button class="btn btn-xs" onclick="deleteGoal('${g.id}')" style="margin-left:5px;padding:3px 6px;color:var(--red);">×</button>
      </div>
      <div class="goal-bar-wrap"><div class="goal-bar-track"><div class="goal-bar-fill" style="width:${pct}%;"></div></div></div>
      <div class="goal-habits">
        ${habits.map(h => {
          if (!h) return '';
          const ic = HABIT_ICONS.find(x=>x.id===h.icon);
          const svg = (ic && ic.svg)?`<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ic.svg}</svg>`:'';
          return `<div class="gh-row"><div class="gh-dot${h.completedToday?' done':''}"></div>${svg}<span style="flex:1;${h.completedToday?'text-decoration:line-through;opacity:.5;':''}">${h.name}</span><span style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--orange);">🔥${h.streak||0}</span></div>`;
        }).join('')}
      </div>
    </div>`;
  }).join('');
}

// ════════════════════════════════════════════════════════════
// AI HABIT SUGGESTIONS
// ════════════════════════════════════════════════════════════
function selAITime(el, val) {
  document.querySelectorAll('#modal-ai-suggest .freq-btn').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel'); $('ai-time-input').value = val;
}

async function generateHabitSuggestions() {
  const goal = $('ai-goal-input')?.value.trim();
  if (!goal) { toast('Enter your goal first!', 'error'); return; }
  const time = $('ai-time-input')?.value || '30min';
  const btn = $('ai-gen-btn');
  const result = $('ai-suggestions-result');
  if (!result) return;

  if (btn) { btn.textContent = '⏳ THINKING...'; btn.disabled = true; }
  result.innerHTML = `<div style="font-size:10px;color:var(--sub);padding:11px;text-align:center;">🦁 Building your habit system...</div>`;

  const existing = S.habits.map(h=>h.name).slice(0,8).join(', ');
  const prompt = `You are OHT AI Coach. User goal: "${goal}". Available time: ${time}/day. Existing habits: ${existing||'none'}.

Create 4-5 specific, actionable habit suggestions. Respond ONLY in this exact JSON format, no other text:
{"habits":[{"name":"Habit Name","icon":"run","category":"health","freq":"daily","target":1,"why":"1 sentence reason","time":"morning"}]}

Icon must be one of: run,book,water,meditate,target,write,music,brain,pill,leaf,bike,art,money,people,clean,phone,clock,fire,bolt,heart,coffee,swim,check2,code,yoga,star,strong,food,sleep,lift
Category: health,mind,productivity,wellness,social,finance,creativity
Freq: daily,weekdays,weekends,3x/week,weekly`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
      body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 800, messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    const text = data.content?.map(c=>c.text||'').join('') || '';
    const clean = text.replace(/```json|```/g,'').trim();
    const parsed = JSON.parse(clean);
    renderAISuggestions(parsed.habits || [], goal);
  } catch(e) {
    // Fallback suggestions
    const fallbacks = {
      fit: [{name:'Morning Exercise',icon:'run',category:'health',freq:'daily',target:1,why:'Builds base fitness fast',time:'morning'},{name:'Drink 8 Glasses',icon:'water',category:'wellness',freq:'daily',target:8,why:'Hydration accelerates results',time:'anytime'},{name:'Sleep 8 Hours',icon:'sleep',category:'wellness',freq:'daily',target:1,why:'Recovery is 50% of fitness',time:'evening'}],
      read: [{name:'Read 20 Pages',icon:'book',category:'mind',freq:'daily',target:1,why:'20 pages = 1 book/month',time:'evening'},{name:'Take Notes',icon:'write',category:'mind',freq:'daily',target:1,why:'Retention jumps 40% with notes',time:'evening'}],
      default: [{name:'Daily Focus Session',icon:'target',category:'productivity',freq:'daily',target:1,why:'Consistent daily action beats sporadic effort',time:'morning'},{name:'Reflect & Plan',icon:'write',category:'mind',freq:'daily',target:1,why:'5 min planning saves 1 hour',time:'evening'},{name:'Learn Something New',icon:'brain',category:'mind',freq:'daily',target:1,why:'Compound knowledge over time',time:'anytime'}]
    };
    const key = goal.toLowerCase().includes('fit')||goal.toLowerCase().includes('weight')||goal.toLowerCase().includes('exercise') ? 'fit' : goal.toLowerCase().includes('read')||goal.toLowerCase().includes('book') ? 'read' : 'default';
    renderAISuggestions(fallbacks[key], goal);
  }
  if (btn) { btn.textContent = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><path d="M12 2a7 7 0 017 7c0 3.87-3 5-3 9H8c0-4-3-5.13-3-9a7 7 0 017-7z"/><line x1="8" y1="22" x2="16" y2="22"/><line x1="12" y1="18" x2="12" y2="22"/></svg> GENERATE'; btn.disabled = false; }
}

function renderAISuggestions(habits, goal) {
  const result = $('ai-suggestions-result'); if (!result) return;
  if (!habits.length) { result.innerHTML = `<div style="font-size:10px;color:var(--red);">Could not generate suggestions. Try again.</div>`; return; }
  result.innerHTML = `<div style="font-family:'Archivo Black',sans-serif;font-size:10px;color:var(--cyan);margin:9px 0 7px;text-transform:uppercase;">For: "${goal}"</div>` +
    habits.map((h,i) => {
      const ic = HABIT_ICONS.find(x=>x.id===h.icon) || HABIT_ICONS[0] || {svg:''};
      const svg = ic.svg ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="white" stroke-width="2" stroke-linecap="round">${ic.svg}</svg>` : '';
      const cat = CATS[h.category] || CATS.custom;
      return `<div class="ai-suggest-item">
        <div class="asi-icon">${svg}</div>
        <div style="flex:1;">
          <div class="asi-name">${h.name}</div>
          <div class="asi-why">${h.why}</div>
          <div class="asi-meta">
            <span class="asi-tag">${h.freq}</span>
            <span class="asi-tag">${cat.label}</span>
            <span class="asi-tag">${h.time||'anytime'}</span>
          </div>
        </div>
        <button class="btn btn-xs btn-success" onclick="addSuggestedHabit(${i})" data-idx="${i}" style="flex-shrink:0;">+ ADD</button>
      </div>`;
    }).join('');
  // Store for adding
  window._aiSuggestions = habits;
}

function addSuggestedHabit(idx) {
  const h = (window._aiSuggestions||[])[idx]; if (!h) return;
  const colors = { health:'#FF3CAC', mind:'#0057FF', productivity:'#FFE600', wellness:'#00F5D4', social:'#FF6B00', finance:'#AAFF00', creativity:'#7B2FBE', custom:'#888' };
  S.habits.push({
    id: 'h'+Date.now()+Math.floor(Math.random()*9999),
    name: h.name, icon: h.icon||'target', color: colors[h.category]||'#00F5D4',
    category: h.category||'productivity', freq: h.freq||'daily', target: h.target||1,
    notes: h.why||'', progressive: 'none', stack: '', stake: '',
    scheduledTime: '', completedToday: false, currentProgress: 0,
    streak: 0, bestStreak: 0, totalDone: 0,
    weekLog: Array(7).fill(false), monthLog: {}, todayXp: 0,
    baseTarget: h.target||1, createdAt: new Date().toISOString()
  });
  // Disable button
  document.querySelectorAll(`[data-idx="${idx}"]`).forEach(b => { b.textContent = '✓'; b.disabled = true; b.style.background = 'var(--lime)'; });
  updateMissions(); save(); renderAll();
  toast(`✅ "${h.name}" added!`, 'success');
}

// ════════════════════════════════════════════════════════════
// TIME CAPSULE
// ════════════════════════════════════════════════════════════
function sealCapsule() {
  const letter = $('capsule-letter')?.value.trim();
  const openDate = $('capsule-open-date')?.value;
  if (!letter) { toast('Write your letter first!', 'error'); return; }
  if (!openDate || openDate <= todayStr()) { toast('Choose a future date!', 'error'); return; }
  S.capsules = S.capsules || [];
  S.capsules.push({
    id: 'cap'+Date.now(), letter, openDate,
    sealedDate: todayStr(),
    statsAtSealing: { xp: S.xp||0, habits: S.habits.length, bestStreak: S.habits.reduce((m,h)=>Math.max(m,h.bestStreak||0),0) },
    opened: false
  });
  save(); renderCapsules();
  closeModal('modal-capsule');
  playSound('ach');
  toast('🔒 Time capsule sealed! See you in the future!', 'success');
  if (S.confettiOn !== false) confetti(20);
}

function renderCapsules() {
  const el = $('capsules-list'); if (!el) return;
  S.capsules = S.capsules || [];
  if (!S.capsules.length) {
    el.innerHTML = `<div style="font-size:10px;color:var(--sub);padding:9px;border:var(--bo);">No time capsules yet. Write a letter to your future self!</div>`;
    return;
  }
  const today = todayStr();
  el.innerHTML = S.capsules.map(c => {
    const canOpen = c.openDate <= today;
    if (canOpen && !c.opened) {
      c.opened = true; save();
      setTimeout(() => { toast(`📬 Time capsule from ${c.sealedDate} is ready!`, 'success'); playSound('levelup'); }, 500);
    }
    return `<div class="capsule-card">
      <div class="capsule-sealed ${c.opened?'open':''}">${c.opened?'✉ OPEN':'🔒 SEALED'}</div>
      <div class="capsule-date">📬 ${c.opened?'Opened':'Opens'}: ${c.openDate}</div>
      <div class="capsule-preview">Sealed on ${c.sealedDate} · ${c.statsAtSealing?.habits||0} habits · ${c.statsAtSealing?.xp||0} XP at time of writing</div>
      ${c.opened ? `<div class="capsule-reveal"><div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);text-transform:uppercase;margin-bottom:5px;">Dear Future Me...</div><div class="capsule-reveal-text">${c.letter}</div></div>` : `<div style="font-size:10px;color:#666;font-style:italic;padding:7px;border:1px dashed #444;">Your letter is sealed until ${c.openDate}</div>`}
      <button class="btn btn-xs btn-danger" onclick="deleteCapsule('${c.id}')" style="margin-top:7px;">Delete</button>
    </div>`;
  }).join('');
}
function deleteCapsule(id) { S.capsules=(S.capsules||[]).filter(c=>c.id!==id); save(); renderCapsules(); }

// ════════════════════════════════════════════════════════════
// HABIT ROI DASHBOARD
// ════════════════════════════════════════════════════════════
function renderROI() {
  const el = $('roi-list');
  if (!el) return;
  if (!S.habits.length) { el.innerHTML = `<div style="font-size:10px;color:var(--sub);">No habits yet.</div>`; return; }

  const ah=S.habits.filter(h=>!h.archived);
  const totalDone = ah.reduce((s,h)=>s+(h.totalDone||0),0);
  const totalHours = (totalDone * 0.5).toFixed(0);
  const totalXp = S.xp || 0;
  const longestStreak = ah.reduce((m,h)=>Math.max(m,h.bestStreak||0),0);
  const activeDays = Object.keys(S.lockedDays||{}).filter(d=>(S.lockedDays[d]||[]).some(s=>s.completed)).length;

  el.innerHTML = `
    <div class="roi-grid">
      <div class="roi-card"><div class="roi-lbl">Total Completions</div><div class="roi-big">${totalDone}</div></div>
      <div class="roi-card"><div class="roi-lbl">Hours Invested</div><div class="roi-big">${totalHours}h</div></div>
      <div class="roi-card"><div class="roi-lbl">Active Days</div><div class="roi-big">${activeDays}</div></div>
      <div class="roi-card"><div class="roi-lbl">Total XP</div><div class="roi-big">${totalXp}</div></div>
    </div>
    <div style="font-family:'Archivo Black',sans-serif;font-size:10px;text-transform:uppercase;margin-bottom:9px;">Per Habit ROI</div>
    ${[...ah].sort((a,b)=>(b.totalDone||0)-(a.totalDone||0)).slice(0,8).map(h => {
      const hrs = ((h.totalDone||0)*0.5).toFixed(1);
      const consistency = getHabitStrength(h);
      const sc = strengthColor(consistency);
      const ic = HABIT_ICONS.find(x=>x.id===h.icon) || HABIT_ICONS[0] || {svg:''};
      const svg = ic.svg ? `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="${h.color}" stroke-width="2" stroke-linecap="round">${ic.svg}</svg>` : '';
      return `<div class="roi-card" style="display:flex;align-items:center;gap:9px;padding:9px 11px;">
        <div style="width:34px;height:34px;background:${h.color}22;border:2px solid ${h.color};display:flex;align-items:center;justify-content:center;flex-shrink:0;">${svg}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:700;font-size:11px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${h.name}</div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">${h.totalDone||0} done · ~${hrs}h · 🔥${h.bestStreak||0} best</div>
          <div style="height:4px;background:#eee;border:1px solid #ccc;overflow:hidden;margin-top:3px;"><div style="height:100%;width:${consistency}%;background:${sc};"></div></div>
        </div>
        <div style="font-family:'Archivo Black',sans-serif;font-size:16px;color:${sc};flex-shrink:0;">${consistency}%</div>
      </div>`;
    }).join('')}`;
}

// ════════════════════════════════════════════════════════════
// COMPLETION NOTE
// ════════════════════════════════════════════════════════════
// [// [_pendingNoteHabitId declared at top]
function promptCompletionNote(id) {
  _pendingNoteHabitId = id;
  const h = S.habits.find(x=>x.id===id);
  setTxt('cn-title', `📝 Note for: ${h?.name||'Habit'}`);
  $('cn-input').value = '';
  $('completion-note-overlay').classList.add('open');
  setTimeout(() => $('cn-input')?.focus(), 300);
}
function confirmCompletionNote(save_note) {
  $('completion-note-overlay').classList.remove('open');
  if (save_note && _pendingNoteHabitId) {
    const note = $('cn-input')?.value.trim();
    if (note) {
      S.completionNotes = S.completionNotes || {};
      S.completionNotes[_pendingNoteHabitId] = S.completionNotes[_pendingNoteHabitId] || {};
      S.completionNotes[_pendingNoteHabitId][todayStr()] = note;
      save();
      toast('📝 Note saved!', 'success');
    }
  }
  _pendingNoteHabitId = null;
}

// ════════════════════════════════════════════════════════════
// BACKFILL (fill past days)
// ════════════════════════════════════════════════════════════
// [// [_backfillData declared at top]
function openBackfill() {
  _backfillData = {};
  const el = $('backfill-content'); if (!el) return;
  const today = new Date();
  const days = Array.from({length:7},(_,i)=>{
    const d = new Date(today); d.setDate(d.getDate()-(i+1));
    return d.toISOString().split('T')[0];
  });
  el.innerHTML = days.map(ds => {
    const d = new Date(ds+'T12:00:00');
    const dn = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
    return `<div style="margin-bottom:11px;">
      <div style="font-family:'Archivo Black',sans-serif;font-size:10px;color:var(--yellow);margin-bottom:5px;">${dn}, ${ds}</div>
      ${S.habits.filter(h=>isDueDateStr(h,ds)).map(h=>{
        const snap = S.lockedDays&&S.lockedDays[ds];
        const alreadyDone = snap?!!snap.find(s=>s.habitId===h.id&&s.completed):false;
        const ic = HABIT_ICONS.find(x=>x.id===h.icon);
        const svg = ic?`<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">${ic.svg}</svg>`:'';
        return `<div class="backfill-day">
          <div class="backfill-check${alreadyDone?' done':''}" id="bf-${ds}-${h.id}" onclick="toggleBackfill('${ds}','${h.id}',this)">${alreadyDone?'✓':''}</div>
          ${svg}<span style="flex:1;font-size:11px;">${h.name}</span>
          ${alreadyDone?'<span style="font-family:\'IBM Plex Mono\',monospace;font-size:7px;color:var(--lime);">already logged</span>':''}
        </div>`;
      }).join('')}
    </div>`;
  }).join('');
  openModal('modal-backfill');
}
function toggleBackfill(date, habitId, el) {
  const key = `${date}-${habitId}`;
  _backfillData[key] = !_backfillData[key];
  el.classList.toggle('done', _backfillData[key]);
  el.textContent = _backfillData[key] ? '✓' : '';
}
function saveBackfill() {
  let count = 0;
  const updatedHabits = new Set();
  Object.entries(_backfillData).forEach(([key, done]) => {
    if (!done) return;
    const dashIdx = key.indexOf('-', 8); // after YYYY-MM-DD
    const date = key.slice(0, 10);
    const habitId = key.slice(11);
    const h = S.habits.find(x=>x.id===habitId); if (!h) return;
    S.lockedDays = S.lockedDays || {};
    S.lockedDays[date] = S.lockedDays[date] || [];
    if (!S.lockedDays[date].find(s=>s.habitId===habitId)) {
      S.lockedDays[date].push({ habitId, habitName:h.name, habitIcon:h.icon, category:h.category, completed:true, xpEarned:5 });
      S.history = S.history || [];
      S.history.unshift({ id:'bf_'+habitId+'_'+date, habitId, habitName:h.name, habitIcon:h.icon, category:h.category, date, status:'done', xp:5, locked:true, backfilled:true });
      h.totalDone = (h.totalDone||0) + 1;
      updatedHabits.add(habitId);
      count++;
    }
  });
  // Recalculate streak for updated habits
  updatedHabits.forEach(hId => {
    const h = S.habits.find(x=>x.id===hId); if(!h) return;
    const doneDates = new Set([
      ...(S.history||[]).filter(e=>e.habitId===hId&&e.status==='done').map(e=>e.date),
      ...Object.entries(S.lockedDays||{}).filter(([,snaps])=>snaps.some(s=>s.habitId===hId&&s.completed)).map(([d])=>d)
    ]);
    let streak=0;
    const today=new Date();
    for(let i=0;i<365;i++){
      const d=new Date(today);d.setDate(d.getDate()-i);
      const ds=d.toISOString().split('T')[0];
      if(!isDueDateStr(h,ds)) continue;
      if(doneDates.has(ds)) streak++;
      else break;
    }
    h.streak=streak; h.bestStreak=Math.max(h.bestStreak||0,streak);
  });
  _invalidateStrengthCache();
  if (count) { save(); renderAll(); toast(`${count} habit${count!==1?'s':''} backfilled + streaks updated!`, 'success'); }
  else toast('No new entries to backfill', 'info');
  closeModal('modal-backfill');
}

// ════════════════════════════════════════════════════════════
// AMBIENT SOUND (Pomodoro)
// ════════════════════════════════════════════════════════════
// [declared at top]
function toggleAmbient(type) {
  if (_ambientNodes.length) {
    _ambientNodes.forEach(n => { try { n.stop(); } catch(e){} });
    _ambientNodes = [];
    document.querySelectorAll('.ambient-btn').forEach(b=>b.classList.remove('active'));
    return;
  }
  try {
    _ambientCtx = _ambientCtx || new (window.AudioContext||window.webkitAudioContext)();
    const ctx = _ambientCtx;
    if (type === 'rain') {
      for (let i = 0; i < 5; i++) {
        const buf = ctx.createBuffer(1, ctx.sampleRate*2, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let j=0; j<d.length; j++) d[j] = (Math.random()*2-1)*0.15;
        const src = ctx.createBufferSource(); src.buffer=buf; src.loop=true;
        const f = ctx.createBiquadFilter(); f.type='bandpass'; f.frequency.value=800+i*200;
        const g = ctx.createGain(); g.gain.value=0.08;
        src.connect(f); f.connect(g); g.connect(ctx.destination);
        src.start(); _ambientNodes.push(src);
      }
    } else if (type === 'white') {
      const buf = ctx.createBuffer(1, ctx.sampleRate*3, ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let j=0; j<d.length; j++) d[j] = (Math.random()*2-1)*0.12;
      const src = ctx.createBufferSource(); src.buffer=buf; src.loop=true;
      const g = ctx.createGain(); g.gain.value=0.5;
      src.connect(g); g.connect(ctx.destination); src.start(); _ambientNodes.push(src);
    } else if (type === 'focus') {
      [40, 80].forEach(freq => {
        const osc = ctx.createOscillator(); const g = ctx.createGain();
        osc.frequency.value = freq; osc.type = 'sine'; g.gain.value = 0.04;
        osc.connect(g); g.connect(ctx.destination); osc.start(); _ambientNodes.push(osc);
      });
    }
    document.querySelectorAll('.ambient-btn').forEach(b=>b.classList.toggle('active', b.dataset.type===type));
    toast(`🎵 ${type} sound on`, 'info');
  } catch(e) { toast('Audio not supported', 'error'); }
}

// ════════════════════════════════════════════════════════════
// CSV EXPORT
// ════════════════════════════════════════════════════════════
function exportCSV() {
  const rows = [['Date','Habit','Category','Status','XP','Streak']];
  (S.history||[]).forEach(h => {
    rows.push([h.date, h.habitName, h.category||'', h.status||'done', h.xp||10, '']);
  });
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
  a.download = `oht_data_${todayStr()}.csv`; a.click();
  toast('<svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg> CSV exported!', 'success');
}

// [habitCard patch merged into original]

// ════════════════════════════════════════════════════════════
// RENDER NEW PAGES
// ════════════════════════════════════════════════════════════
function renderNewPages() {
  renderAntiHabits();
  renderRituals();
  renderGoals();
  renderCapsules();
  renderROI();
  renderJournal();
}


function openAntiHabitForm() {
  const f = $('anti-add-form');
  if (f) { f.style.display = f.style.display==='none'?'block':'none'; }
}
function saveAntiHabit() {
  const name = $('anti-inp-name')?.value.trim();
  if (!name) { toast('Enter habit name to break!', 'error'); return; }
  const trigger = $('anti-inp-trigger')?.value.trim();
  addAntiHabit(name, 'fire', trigger);
  $('anti-inp-name').value = ''; $('anti-inp-trigger').value = '';
  $('anti-add-form').style.display = 'none';
}

// ════════════════════════════════════════════════════════════
// MORE MENU
// ════════════════════════════════════════════════════════════
// [// [_moreMenuOpen declared at top]

function toggleMoreMenu() {
  _moreMenuOpen ? closeMoreMenu() : openMoreMenu();
}

function openMoreMenu() {
  _moreMenuOpen = true;
  const overlay = $('more-menu-overlay');
  const menu = $('more-menu');
  // Reset inline styles yang di-set oleh closeMoreMenu
  if(overlay) { overlay.style.opacity = ''; overlay.style.pointerEvents = ''; overlay.classList.add('open'); }
  if(menu) { menu.style.opacity = ''; menu.style.pointerEvents = ''; menu.classList.add('open'); }
  const bn = $('bnav-more'); if(bn) bn.classList.add('active');
  // Highlight active page in menu
  const activePg = document.querySelector('.page.active');
  const activePgId = activePg?.id?.replace('page-','');
  document.querySelectorAll('.mm-item').forEach(el => {
    const onclick = el.getAttribute('onclick') || '';
    const match = onclick.match(/'(\w+)'/);
    el.classList.toggle('active-page', match && match[1] === activePgId);
  });
}

function closeMoreMenu() {
  _moreMenuOpen = false;
  const overlay = $('more-menu-overlay');
  const menu = $('more-menu');
  // Immediately hide - no transition delay
  if(overlay) { overlay.style.opacity = '0'; overlay.style.pointerEvents = 'none'; overlay.classList.remove('open'); }
  if(menu) { menu.style.opacity = '0'; menu.style.pointerEvents = 'none'; menu.classList.remove('open'); }
  const activePg = document.querySelector('.page.active')?.id?.replace('page-','');
  const mainPages = ['today','habits','garden','focus'];
  if (mainPages.includes(activePg)) {
    $('bnav-more')?.classList.remove('active');
  }
}

function navigateMore(page) {
  closeMoreMenu();
  navigate(page);
  if(page==='settings' && typeof renderSettingsAuth==='function') setTimeout(renderSettingsAuth,150);
}

// [navigate more-menu logic merged into original]

// ════════════════════════════════════════════════════════════
// 1. HAPTIC FEEDBACK
// ════════════════════════════════════════════════════════════
function haptic(type='light') {
  if (!navigator.vibrate) return;
  const patterns = { light:[10], medium:[20], heavy:[30,10,30], success:[10,50,10], error:[50,30,50], levelup:[30,50,30,50,100] };
  navigator.vibrate(patterns[type]||patterns.light);
}

// ════════════════════════════════════════════════════════════
// 2. HABIT MILESTONE BADGES
// ════════════════════════════════════════════════════════════
const MILESTONE_BADGES = [
  { days:3,   icon:'<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--lime)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><path d="M12 3v1M12 20v1M4.22 4.22l.7.7M19.07 19.07l.71.71M1 12h2M21 12h2M4.22 19.78l.7-.7M19.07 4.93l.71-.71"/><circle cx="12" cy="12" r="4"/></svg>', label:'SEEDLING',  color:'#7ec850' },
  { days:7,   icon:'🥉', label:'7 DAYS',    color:'#cd7f32' },
  { days:14,  icon:'⚡', label:'2 WEEKS',   color:'#FFE600' },
  { days:21,  icon:'💪', label:'21 DAYS',   color:'#FF6B00' },
  { days:30,  icon:'🥈', label:'30 DAYS',   color:'#aaa' },
  { days:50,  icon:'🔥', label:'50 DAYS',   color:'#FF3CAC' },
  { days:66,  icon:'🧠', label:'66 DAYS',   color:'#7B2FBE' },
  { days:100, icon:'🥇', label:'100 DAYS',  color:'#FFD700' },
  { days:180, icon:'💎', label:'180 DAYS',  color:'#00F5D4' },
  { days:365, icon:'👑', label:'1 YEAR',    color:'#FF3CAC' },
];

function getHabitBadges(h) {
  return MILESTONE_BADGES.filter(b => (h.bestStreak||0) >= b.days);
}

function getNextBadge(h) {
  return MILESTONE_BADGES.find(b => (h.bestStreak||0) < b.days);
}

function renderHabitBadges(h) {
  const earned = getHabitBadges(h);
  if (!earned.length) return '';
  return earned.slice(-2).map(b =>
    `<span style="font-size:10px;padding:1px 4px;border:1px solid ${b.color};color:${b.color};font-family:'IBM Plex Mono',monospace;font-size:7px;font-weight:700;">${b.icon} ${b.label}</span>`
  ).join('');
}

// ════════════════════════════════════════════════════════════
// 3. DAILY LOGIN STREAK
// ════════════════════════════════════════════════════════════
function checkLoginStreak() {
  const today = todayStr();
  if (S.lastLoginDate === today) return;
  const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
  const yStr = yesterday.toISOString().split('T')[0];
  if (S.lastLoginDate === yStr) {
    S.loginStreak = (S.loginStreak||0) + 1;
  } else if (S.lastLoginDate && S.lastLoginDate < yStr) {
    S.loginStreak = 1;
  } else {
    S.loginStreak = (S.loginStreak||0) + 1;
  }
  S.lastLoginDate = today;
  const xpBonus = Math.min(25, 5 + Math.floor((S.loginStreak||1)/7)*5);
  S.xp = (S.xp||0) + xpBonus;
  save();
  if ((S.loginStreak||1) > 1) {
    setTimeout(() => notify(`<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--yellow)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> Day ${S.loginStreak} login streak! +${xpBonus} XP`, '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="var(--yellow)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>', 3000), 1500);
  }
  // Milestone notifs
  if ([7,14,30,50,100].includes(S.loginStreak)) {
    setTimeout(() => { playSound('ach'); notify(`🏆 ${S.loginStreak} day login streak! Legend.`, '👑', 4000); }, 2000);
  }
}

// ════════════════════════════════════════════════════════════
// 4. UNDO LAST ACTION
// ════════════════════════════════════════════════════════════
// [// [_undoStack declared at top]
function pushUndo(label, fn) {
  _undoStack.push({ label, fn, time: Date.now() });
  if (_undoStack.length > 5) _undoStack.shift();
  showUndoToast(label, fn);
}
function showUndoToast(label, fn) {
  // Remove existing undo toast
  document.querySelectorAll('.undo-toast').forEach(t => t.remove());
  const tc = $('toast-container'); if (!tc) return;
  const t = document.createElement('div');
  t.className = 'toast info undo-toast';
  t.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:9px;max-width:300px;';
  t.innerHTML = `<span style="flex:1;font-size:10px;">${label}</span>
    <button onclick="doUndo(this)" style="background:var(--black);color:var(--yellow);border:1.5px solid var(--yellow);padding:3px 8px;font-family:'IBM Plex Mono',monospace;font-size:9px;font-weight:700;cursor:pointer;">UNDO</button>`;
  t._undoFn = fn;
  tc.appendChild(t);
  const timer = setTimeout(() => { if (t.parentNode) t.remove(); }, 4500);
  t._timer = timer;
}
function doUndo(btn) {
  const t = btn.closest('.undo-toast');
  if (t?._undoFn) { clearTimeout(t._timer); t._undoFn(); t.remove(); toast('↩ Undone!', 'info'); }
}

// ════════════════════════════════════════════════════════════
// 5. BEST TIME OF DAY ANALYSIS
// ════════════════════════════════════════════════════════════
function getBestTimeAnalysis() {
  // Group completions by hour from history
  const hourCounts = Array(24).fill(0);
  (S.history||[]).forEach(h => {
    if (!h.completedAt) return;
    const hr = new Date(h.completedAt).getHours();
    hourCounts[hr]++;
  });
  const max = Math.max(...hourCounts);
  if (max === 0) return null;
  const bestHour = hourCounts.indexOf(max);
  const periods = { morning: [5,6,7,8,9,10,11], afternoon: [12,13,14,15,16,17], evening: [18,19,20,21], night: [22,23,0,1,2,3,4] };
  let period = 'anytime';
  for (const [p, hours] of Object.entries(periods)) { if (hours.includes(bestHour)) { period = p; break; } }
  const ampm = bestHour < 12 ? 'AM' : 'PM';
  const h12 = bestHour % 12 || 12;
  return { hour: bestHour, display: `${h12}:00 ${ampm}`, period, count: max };
}

function renderBestTimeCard() {
  const el = $('best-time-card'); if (!el) return;
  const analysis = getBestTimeAnalysis();
  const periodIcons = { morning:'🌅', afternoon:'☀️', evening:'🌙', night:'🌃', anytime:'⚡' };
  if (!analysis) {
    el.innerHTML = `<div style="font-size:10px;color:var(--sub);">Complete more habits with timestamps to see your peak performance time.</div>`;
    return;
  }
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:11px;">
      <div style="font-size:36px;">${periodIcons[analysis.period]}</div>
      <div>
        <div style="font-family:'Archivo Black',sans-serif;font-size:22px;color:var(--yellow);line-height:1;">${analysis.display}</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);text-transform:uppercase;margin-top:2px;">Peak ${analysis.period} · ${analysis.count} completions</div>
        <div style="font-size:10px;color:var(--muted);margin-top:3px;">Schedule your hardest habits around this time.</div>
      </div>
    </div>`;
}

// ════════════════════════════════════════════════════════════
// 6. HABIT SCIENCE TIPS
// ════════════════════════════════════════════════════════════
const HABIT_TIPS = {
  health: ["Cue-routine-reward loop makes habits automatic in 66 days on average.", "Exercise increases BDNF — the brain's growth hormone — by up to 2x.", "Morning workouts boost metabolism for 14 hours after."],
  mind: ["Reading 20 pages/day = 24 books/year.", "Meditation rewires the amygdala, reducing stress response in 8 weeks.", "Writing by hand activates memory consolidation 40% better than typing."],
  productivity: ["The 2-minute rule: if it takes less than 2 min, do it now.", "Deep work blocks of 90 min align with your ultradian rhythm.", "Batching similar tasks reduces context-switching cost by 40%."],
  wellness: ["Drinking water first thing in the morning boosts energy by 8%.", "7-9 hours of sleep is when 70% of emotional memory processing occurs.", "Cold exposure for 2 min increases dopamine by 250%."],
  social: ["Strong social bonds are the #1 predictor of longevity — more than exercise.", "Expressing gratitude to others releases oxytocin in both people.", "Regular check-ins with friends reduce cortisol levels significantly."],
  finance: ["Automating savings removes willpower from the equation entirely.", "Tracking expenses reduces unnecessary spending by 15-20% on average.", "The 24-hour rule prevents 80% of impulse purchases."],
  creativity: ["Creativity peaks in unfocused states — daydreaming is productive.", "Constraints breed creativity: limits force novel solutions.", "Sleep consolidates creative insights — problems often solve overnight."],
  custom: ["Habits stack on existing behaviors. Attach new habits to old ones.", "Implementation intentions (when/where/how) triple habit success rates.", "Missing once is human. Missing twice is a new habit forming."],
};

function getHabitTip(category) {
  const tips = HABIT_TIPS[category] || HABIT_TIPS.custom;
  return tips[Math.floor(Math.random() * tips.length)];
}

// ════════════════════════════════════════════════════════════
// 7. MONTHLY AI RETROSPECTIVE
// ════════════════════════════════════════════════════════════
async function generateMonthlyRetro() {
  const btn = $('monthly-retro-btn');
  if (btn) { btn.textContent = '⏳ GENERATING...'; btn.disabled = true; }
  const el = $('monthly-retro-result'); if (!el) return;

  const now = new Date();
  const monthStr = now.toLocaleString('default', { month: 'long', year: 'numeric' });
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const hist = (S.history||[]).filter(h => h.date >= monthStart && h.status === 'done');
  const uniqueDays = [...new Set(hist.map(h=>h.date))].length;
  const topHabit = [...ah].sort((a,b)=>(b.totalDone||0)-(a.totalDone||0))[0];
  const weakHabit = [...S.habits].filter(h=>getHabitStrength(h)<40)[0];
  const totalXpMonth = hist.reduce((s,h)=>s+(h.xp||10),0);

  const prompt = `You are OHT AI Coach. Write a monthly retrospective for ${monthStr}.
User: ${S.name||'User'} | Level ${Math.max(1,Math.floor((S.xp||0)/100)+1)} | ${S.habits.length} habits
Month stats: ${hist.length} completions, ${uniqueDays} active days, ${totalXpMonth} XP earned
Strongest: ${topHabit?`${topHabit.name} (🔥${topHabit.streak})`:'-'}
Needs work: ${weakHabit?`${weakHabit.name} (${getHabitStrength(weakHabit)}% strength)`:'-'}

Write 3 short paragraphs: (1) What went well, (2) Pattern you noticed, (3) One focus for next month.
Be specific, direct, encouraging but honest. Max 120 words total.`;

  el.innerHTML = `<div style="font-size:10px;color:var(--sub);">🦁 Analyzing your month...</div>`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json','anthropic-dangerous-direct-browser-access':'true'},
      body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:300, messages:[{role:'user',content:prompt}]})
    });
    const data = await res.json();
    const text = data.content?.map(c=>c.text||'').join('') || '';
    S.monthlyRetros = S.monthlyRetros || [];
    S.monthlyRetros.unshift({ month: monthStr, text, date: todayStr() });
    if (S.monthlyRetros.length > 12) S.monthlyRetros = S.monthlyRetros.slice(0,12);
    save();
    el.innerHTML = `<div style="font-size:11px;line-height:1.6;color:var(--text);">${text.replace(/\n\n/g,'</div><div style="font-size:11px;line-height:1.6;color:var(--text);margin-top:7px;">')}</div>`;
  } catch(e) {
    const fallback = `${monthStr} showed ${uniqueDays} active days out of ${now.getDate()} possible — that's ${Math.round(uniqueDays/now.getDate()*100)}% consistency. ${topHabit?`${topHabit.name} was your strongest habit this month.`:''} ${weakHabit?`Focus on ${weakHabit.name} next month — it needs the most attention.`:'Keep the momentum going next month.'}`;
    el.innerHTML = `<div style="font-size:11px;line-height:1.6;color:var(--text);">${fallback}</div>`;
  }
  if (btn) { btn.textContent = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;vertical-align:middle;"><path d="M12 2a7 7 0 017 7c0 3.87-3 5-3 9H8c0-4-3-5.13-3-9a7 7 0 017-7z"/><line x1="8" y1="22" x2="16" y2="22"/><line x1="12" y1="18" x2="12" y2="22"/></svg> GENERATE'; btn.disabled = false; }
}

// ════════════════════════════════════════════════════════════
// 8. LONG-PRESS CONTEXT MENU
// ════════════════════════════════════════════════════════════
// [// [_longPressTimer declared at top]
// [// [_contextMenuHabitId declared at top]

document.addEventListener('touchstart', e => {
  const card = e.target.closest('.habit-card');
  if (!card) return;
  const idMatch = card.id?.match(/(?:hc|th)-(.+)/);
  if (!idMatch) return;
  _longPressTimer = setTimeout(() => {
    haptic('medium');
    showContextMenu(idMatch[1], e.touches[0].clientX, e.touches[0].clientY);
  }, 500);
}, { passive: true });

document.addEventListener('touchend', () => {
  if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
}, { passive: true });

document.addEventListener('touchmove', () => {
  if (_longPressTimer) { clearTimeout(_longPressTimer); _longPressTimer = null; }
}, { passive: true });

function showContextMenu(habitId, x, y) {
  const h = S.habits.find(x => x.id === habitId); if (!h) return;
  _contextMenuHabitId = habitId;
  let menu = $('context-menu');
  if (!menu) {
    menu = document.createElement('div');
    menu.id = 'context-menu';
    menu.style.cssText = `position:fixed;background:var(--black);border:2.5px solid var(--yellow);box-shadow:4px 4px 0 var(--black);z-index:9000;min-width:180px;`;
    document.body.appendChild(menu);
    // Backdrop
    const bd = document.createElement('div');
    bd.id = 'context-backdrop';
    bd.style.cssText = 'position:fixed;inset:0;z-index:8999;';
    bd.onclick = closeContextMenu;
    document.body.appendChild(bd);
  }
  const items = [
    { icon:'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>', label:'Edit', fn:`editHabit('${habitId}');closeContextMenu();` },
    { icon:'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>', label:'Skip Today', fn:`skipHabitToday('${habitId}');closeContextMenu();` },
    { icon:'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>', label: h.paused?'Resume':'Pause', fn:`togglePauseHabit('${habitId}');closeContextMenu();` },
    { icon:'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', label:'View Detail', fn:`openHabitDetail('${habitId}');closeContextMenu();` },
    { icon:'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>', label:'Archive', fn:`archiveHabit('${habitId}');closeContextMenu();` },
    { icon:'<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#FF1744" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>', label:'Delete', fn:`closeContextMenu();confirmDelete('${habitId}');`, color:'var(--red)' },
  ];
  menu.innerHTML = `<div style="padding:7px 11px;border-bottom:1px solid #333;font-family:'Archivo Black',sans-serif;font-size:10px;color:var(--yellow);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${h.icon?'':''} ${h.name}</div>`
    + items.map(it => `<div onclick="${it.fn}" style="display:flex;align-items:center;gap:9px;padding:11px 13px;cursor:pointer;border-bottom:1px solid #1a1a1a;color:${it.color||'var(--text)'};" onmouseenter="this.style.background='rgba(255,230,0,.1)'" onmouseleave="this.style.background=''">${it.icon}<span style="font-size:11px;font-weight:600;">${it.label}</span></div>`).join('');

  // Position: ensure on screen
  const vw = window.innerWidth, vh = window.innerHeight;
  const mw = 200, mh = items.length * 44 + 40;
  let left = Math.min(x, vw - mw - 10);
  let top = Math.min(y, vh - mh - 10);
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';
  menu.style.display = 'block';
}

function closeContextMenu() {
  const m = $('context-menu'); if (m) m.style.display = 'none';
  const bd = $('context-backdrop'); if (bd) bd.remove();
  const newBd = document.createElement('div');
  newBd.id = 'context-backdrop';
  // Don't re-add — just remove backdrop
}

// ════════════════════════════════════════════════════════════
// 9. SHARE AS IMAGE (Canvas)
// ════════════════════════════════════════════════════════════
function shareAsImage() {
  const canvas = document.createElement('canvas');
  canvas.width = 540; canvas.height = 960;
  const ctx = canvas.getContext('2d');
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  const bg = isDark ? '#0a0a0a' : '#FFF9E6';
  const surface = isDark ? '#141414' : '#FFFFF0';
  const text = isDark ? '#F0F0F0' : '#0a0a0a';
  const accent = '#FFE600';
  const cyan = '#00F5D4';

  // Background
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 540, 960);

  // Header
  ctx.fillStyle = '#0a0a0a';
  ctx.fillRect(0, 0, 540, 80);
  ctx.fillStyle = accent;
  ctx.font = 'bold 32px Arial';
  ctx.fillText('OHT', 24, 52);
  ctx.fillStyle = '#FF3CAC';
  ctx.font = 'bold 32px Arial';
  ctx.fillText('●', 96, 52);

  // Date
  const now = new Date();
  ctx.fillStyle = '#888';
  ctx.font = '14px Arial';
  ctx.fillText(now.toLocaleDateString('en-US', {weekday:'long', month:'long', day:'numeric', year:'numeric'}), 24, 100);

  // Stats row
  const done = S.habits.filter(h=>h.completedToday).length;
  const total = S.habits.length;
  const pct = total > 0 ? Math.round(done/total*100) : 0;
  const best = S.habits.reduce((m,h)=>Math.max(m,h.bestStreak||0),0);

  const stats = [{v:`${pct}%`, l:'TODAY'},{v:`${best}d`, l:'STREAK'},{v:`${S.xp||0}`, l:'XP'},{v:`${S.habits.length}`, l:'HABITS'}];
  stats.forEach((s,i) => {
    const x = 24 + i * 124;
    ctx.fillStyle = surface;
    ctx.fillRect(x, 120, 115, 70);
    ctx.strokeStyle = i===0?accent:cyan;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, 120, 115, 70);
    ctx.fillStyle = i===0?accent:text;
    ctx.font = 'bold 28px Arial';
    ctx.fillText(s.v, x+10, 158);
    ctx.fillStyle = '#888';
    ctx.font = '11px Arial';
    ctx.fillText(s.l, x+10, 178);
  });

  // User + level
  const lvl = Math.max(1,Math.floor((S.xp||0)/100)+1);
  ctx.fillStyle = text;
  ctx.font = 'bold 22px Arial';
  ctx.fillText(S.name||'User', 24, 230);
  ctx.fillStyle = cyan;
  ctx.font = '14px Arial';
  ctx.fillText(`LVL ${lvl} — ${LVL_NAMES[Math.min(lvl-1,LVL_NAMES.length-1)]}`, 24, 252);

  // Habits done today
  ctx.fillStyle = text;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('COMPLETED TODAY', 24, 290);
  ctx.fillStyle = '#333';
  ctx.fillRect(24, 298, 492, 1);

  const doneHabits = S.habits.filter(h=>h.completedToday).slice(0,6);
  doneHabits.forEach((h,i) => {
    const row = Math.floor(i/2), col = i%2;
    const x = 24 + col*250, y = 315 + row*50;
    ctx.fillStyle = h.color + '22';
    ctx.fillRect(x, y, 235, 42);
    ctx.strokeStyle = h.color;
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y, 235, 42);
    ctx.fillStyle = accent;
    ctx.font = 'bold 20px Arial';
    ctx.fillText('✓', x+10, y+27);
    ctx.fillStyle = text;
    ctx.font = 'bold 13px Arial';
    const name = h.name.length > 16 ? h.name.slice(0,15)+'…' : h.name;
    ctx.fillText(name, x+36, y+27);
  });

  // Progress bar
  const barY = 520;
  ctx.fillStyle = '#333';
  ctx.fillRect(24, barY, 492, 12);
  ctx.fillStyle = pct===100?'#AAFF00':accent;
  ctx.fillRect(24, barY, Math.round(492*pct/100), 12);
  ctx.fillStyle = text;
  ctx.font = 'bold 14px Arial';
  ctx.fillText(`${done}/${total} habits · ${pct}% complete`, 24, barY+32);

  // Footer
  ctx.fillStyle = '#333';
  ctx.fillRect(0, 900, 540, 60);
  ctx.fillStyle = accent;
  ctx.font = 'bold 16px Arial';
  ctx.fillText('OHT — Orias Habit Tracker', 24, 938);
  ctx.fillStyle = '#555';
  ctx.font = '12px Arial';
  ctx.fillText(todayStr(), 400, 938);

  // Download
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `oht_progress_${todayStr()}.png`; a.click();
    URL.revokeObjectURL(url);
    toast('📸 Progress image saved!', 'success');
  }, 'image/png');
}

// ════════════════════════════════════════════════════════════
// PATCH INIT: add login streak + haptic to toggleHabit
// ════════════════════════════════════════════════════════════
// toggleHabit — final with haptic + undo + level-up + xp pulse + badges
const _origToggleHabitBatch = _baseToggleHabit;
function toggleHabit(id, pfx) {
  const h = S.habits.find(x=>x.id===id); if (!h) return;
  const wasChecked = h.completedToday;
  const prevXp = S.xp || 0;
  const prevLvl = Math.max(1, Math.floor(prevXp/100)+1);
  _origToggleHabitBatch(id, pfx);
  haptic(wasChecked ? 'light' : 'success');
  // XP bar pulse
  const xb = $('xp-bar');
  if (xb) { xb.classList.remove('pulse'); void xb.offsetWidth; xb.classList.add('pulse'); setTimeout(()=>xb.classList.remove('pulse'),700); }
  // Level up cinematic
  const newLvl = Math.max(1, Math.floor((S.xp||0)/100)+1);
  if (newLvl > prevLvl) setTimeout(()=>showLevelUp(newLvl, LVL_NAMES[Math.min(newLvl-1,LVL_NAMES.length-1)]), 500);
  if (!wasChecked) {
    // Save completion timestamp
    S.history = S.history || [];
    const entry = S.history.find(e=>e.habitId===id&&e.date===todayStr()&&!e.locked);
    if (entry) entry.completedAt = new Date().toISOString();
    // Undo support
    pushUndo(`↩ Uncheck "${h.name}"`, () => { _origToggleHabitBatch(id, pfx); });
    // Check milestone badges
    const newBadge = MILESTONE_BADGES.find(b => (h.bestStreak||0) === b.days);
    if (newBadge) setTimeout(()=>notify(`${newBadge.icon} ${newBadge.label} badge on "${h.name}"!`, newBadge.icon, 4000), 600);
  }
}

// [login streak check added to original init]


function toggleHabitActions(e, id, pfx) {
  e.stopPropagation();
  const card = $(`${pfx}-${id}`);
  if (!card) return;
  // Close all other open cards first
  document.querySelectorAll('.habit-card.actions-open').forEach(c => {
    if (c !== card) c.classList.remove('actions-open');
  });
  card.classList.toggle('actions-open');
}
// Close actions when tapping elsewhere
document.addEventListener('touchstart', e => {
  if (!e.target.closest('.habit-expand-btn') && !e.target.closest('.habit-actions')) {
    document.querySelectorAll('.habit-card.actions-open').forEach(c => c.classList.remove('actions-open'));
  }
}, { passive: true });


// [let _historyCatFilter moved to top]
function setHistoryCatFilter(cat, el) {
  _historyCatFilter = cat;
  document.querySelectorAll('#history-cat-tabs .ctab').forEach(t => t.classList.remove('active'));
  if(el) el.classList.add('active');
  renderHistory();
}


function togglePinHabit(id) {
  const h = S.habits.find(x=>x.id===id); if(!h) return;
  h.pinned = !h.pinned;
  save(); renderAll();
  toast(h.pinned ? 'Pinned to top!' : 'Unpinned', 'info');
}


function renderTodayAntiHabitsMini() {
  const el = $('today-antihabits-mini'); if (!el) return;
  const anti = S.antiHabits || [];
  if (!anti.length) { el.style.display = 'none'; return; }
  const today = todayStr();
  el.style.display = 'block';
  el.innerHTML = `<div style="background:var(--black);border:var(--bo-t);border-color:var(--red);padding:8px 11px;margin-bottom:0;">
    <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--red);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">RESIST TODAY</div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;">
      ${anti.map(a => {
        const logged = a.lastResisted === today;
        return `<div style="display:flex;align-items:center;gap:5px;padding:4px 8px;border:1.5px solid ${logged?'var(--lime)':'var(--red)'};background:${logged?'rgba(170,255,0,.1)':'rgba(255,23,68,.08)'};">
          <span style="font-family:'Archivo Black',sans-serif;font-size:11px;color:${logged?'var(--lime)':'var(--red)'};">${a.streak||0}</span>
          <span style="font-size:10px;font-weight:700;">${a.name.length>12?a.name.slice(0,11)+'…':a.name}</span>
          ${!logged?`<button onclick="resistAntiHabit('${a.id}');renderTodayAntiHabitsMini();" style="background:var(--lime);border:var(--bo);padding:2px 5px;font-size:8px;font-weight:700;cursor:pointer;color:var(--black);">CLEAN</button>`:'<span style="font-size:9px;color:var(--lime);">✓</span>'}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}


function renderTodayGoalsMini() {
  const gel = $('today-goals-mini');
  const rel = $('today-rituals-mini');
  // Goals mini
  const goals = S.goals || [];
  if (gel) {
    if (!goals.length) { gel.style.display = 'none'; }
    else {
      gel.style.display = 'block';
      gel.innerHTML = `<div style="background:var(--surface);border:var(--bo-t);border-color:var(--cyan);padding:8px 11px;">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--cyan);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">GOALS</div>
        ${goals.slice(0,3).map(g => {
          const habits = (g.habitIds||[]).map(id=>S.habits.find(h=>h.id===id)).filter(Boolean);
          const done = habits.filter(h=>h?.completedToday).length;
          const pct = habits.length ? Math.round(done/habits.length*100) : 0;
          return `<div style="display:flex;align-items:center;gap:7px;margin-bottom:4px;">
            <span style="flex:1;font-size:10px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${g.name}</span>
            <span style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:${pct===100?'var(--lime)':'var(--cyan)'};">${done}/${habits.length}</span>
            <div style="width:50px;height:5px;background:#eee;border:1px solid #ccc;overflow:hidden;"><div style="height:100%;width:${pct}%;background:${pct===100?'var(--lime)':'var(--cyan)'};"></div></div>
          </div>`;
        }).join('')}
      </div>`;
    }
  }
  // Rituals mini
  const rituals = S.rituals || [];
  if (rel) {
    if (!rituals.length) { rel.style.display = 'none'; }
    else {
      rel.style.display = 'block';
      const RITUAL_TIME_ICONS2 = {morning:'🌅',afternoon:'☀️',evening:'🌙',anytime:'⚡'};
      rel.innerHTML = `<div style="background:var(--surface);border:var(--bo-t);border-color:var(--orange);padding:8px 11px;">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--orange);text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">RITUALS</div>
        <div style="display:flex;gap:5px;flex-wrap:wrap;">
          ${rituals.slice(0,4).map(r => {
            const habits = r.habitIds.map(id=>S.habits.find(h=>h.id===id)).filter(Boolean);
            const done = habits.filter(h=>h?.completedToday).length;
            const pct = habits.length ? Math.round(done/habits.length*100) : 0;
            const color = {morning:'#FF6B00',afternoon:'#FFE600',evening:'#7B2FBE',anytime:'#00F5D4'}[r.time]||'var(--cyan)';
            return `<div onclick="navigate('goals')" style="padding:4px 9px;border:1.5px solid ${color};cursor:pointer;display:flex;align-items:center;gap:5px;">
              <span style="font-size:10px;font-weight:700;">${r.name.length>10?r.name.slice(0,9)+'…':r.name}</span>
              <span style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:${pct===100?'var(--lime)':color};">${pct}%</span>
            </div>`;
          }).join('')}
        </div>
      </div>`;
    }
  }
}


// [let _todayGroupByTime moved to top]
function toggleTodayTimeGroup() {
  _todayGroupByTime = !_todayGroupByTime;
  const btn = $('today-time-group-btn');
  if (btn) btn.classList.toggle('btn-cyan', _todayGroupByTime);
  renderTodayHabits();
}
function getTimeOfDay(scheduledTime) {
  if (!scheduledTime) return 'anytime';
  const h = parseInt(scheduledTime.split(':')[0]);
  if (h >= 5 && h < 12) return 'morning';
  if (h >= 12 && h < 17) return 'afternoon';
  if (h >= 17 && h < 22) return 'evening';
  return 'night';
}


// [let _insightFilter moved to top]
function setInsightFilter(src, el) {
  _insightFilter = src;
  document.querySelectorAll('#page-streaks .btn-xs').forEach(b => b.classList.remove('btn-primary'));
  if (el) el.classList.add('btn-primary');
  renderInsightFeed();
}


function setFocusTab(tab, el) {
  if (!tab) tab = 'timer';
  ['timer','wellness','journal'].forEach(t => {
    const s = $('focus-section-'+t);
    if (s) s.style.display = t===tab ? 'block' : 'none';
    const btn = $('focus-tab-'+t);
    if (btn) btn.classList.toggle('active', t===tab);
  });
  if (tab==='wellness') { renderWaterTracker(); renderSleepLog(); renderIntention(); }
  if (tab==='journal') { renderGratitudeList(); renderJournal(); }
  if (tab==='timer') { buildFocusHabitPicker(); updateFocusUI(); }
}


function filterSettings(q) {
  q = q.toLowerCase().trim();
  document.querySelectorAll('.settings-block').forEach(block => {
    if (!q) { block.style.display = 'block'; return; }
    const text = block.textContent.toLowerCase();
    block.style.display = text.includes(q) ? 'block' : 'none';
  });
}


// Handle keyboard on mobile — shrink modals
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', () => {
    const ratio = window.visualViewport.height / window.innerHeight;
    document.querySelectorAll('.modal').forEach(m => {
      m.style.maxHeight = ratio < 0.8 ? (window.visualViewport.height * 0.88) + 'px' : '';
    });
  });
}


function saveHabitAndAddAnother() {
  const name = $('inp-name')?.value.trim();
  if (!name) { toast('Enter a habit name!', 'error'); return; }
  saveHabit();
  setTimeout(() => { openAddModal(); }, 200);
}


// Swipe right to close habit detail overlay
(function() {
  let _detailSwipeStart = null;
  const overlay = () => $('habit-detail-overlay');
  document.addEventListener('touchstart', e => {
    const ov = overlay();
    if (ov?.classList.contains('open') && e.touches[0].clientX < 30) {
      _detailSwipeStart = e.touches[0].clientX;
    }
  }, { passive: true });
  document.addEventListener('touchend', e => {
    if (_detailSwipeStart !== null) {
      const dx = e.changedTouches[0].clientX - _detailSwipeStart;
      if (dx > 60) closeHabitDetail();
      _detailSwipeStart = null;
    }
  }, { passive: true });
})();


function setStreaksTab(tab, el) {
  ['achievements','missions','challenges'].forEach(t => {
    const s = $('streaks-section-'+t);
    if (s) s.style.display = t===tab ? 'block' : 'none';
    const btn = $('stab-'+t);
    if (btn) btn.classList.toggle('active', t===tab);
  });
  if (tab==='missions') renderMissions();
  if (tab==='challenges') renderChallenges();
  if (tab==='achievements') renderAchievements();
}


function getEmptyState(type) {
  const states = {
    habits: {
      icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--yellow)" stroke-width="1.5" stroke-linecap="round"><path d="M12 2C12 2 5 10 5 15a7 7 0 0014 0c0-5-7-13-7-13z"/><line x1="12" y1="15" x2="12" y2="19"/><line x1="9" y1="22" x2="15" y2="22"/></svg>',
      title: "PLANT YOUR FIRST SEED",
      sub: "Every legend started with one habit. What's yours?",
      cta: { label: "CREATE FIRST HABIT", fn: 'openAddModal()' }
    },
    streaks: {
      icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--orange)" stroke-width="1.5" stroke-linecap="round"><path d="M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 01-7 7"/></svg>',
      title: "NO STREAKS YET",
      sub: "Complete a habit today to start your first streak.",
      cta: null
    },
    anti: {
      icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--red)" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg>',
      title: "NOTHING TO BREAK YET",
      sub: "Add a bad habit you want to eliminate. Every day you resist = 1 streak day.",
      cta: { label: "+ ADD BAD HABIT", fn: 'openAntiHabitForm()' }
    },
    goals: {
      icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--cyan)" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>',
      title: "NO GOALS YET",
      sub: "Set a big goal, link your habits to it, and watch progress happen automatically.",
      cta: { label: "+ SET A GOAL", fn: 'openAddGoal()' }
    },
    rituals: {
      icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--orange)" stroke-width="1.5" stroke-linecap="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
      title: "NO RITUALS YET",
      sub: "Bundle habits into morning, evening, or custom ritual sequences.",
      cta: { label: "+ CREATE RITUAL", fn: 'openAddRitual()' }
    },
    insights: {
      icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--purple)" stroke-width="1.5" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
      title: "NO INSIGHTS YET",
      sub: "Chat with the AI Coach or complete a Weekly Review to generate insights.",
      cta: { label: "ASK COACH", fn: "navigate('today')" }
    },
    gratitude: {
      icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--pink)" stroke-width="1.5" stroke-linecap="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>',
      title: "START WITH GRATITUDE",
      sub: "What's one thing you're grateful for right now?",
      cta: null
    },
    coach: {
      icon: '<svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="var(--purple)" stroke-width="1.5" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
      title: "YOUR COACH IS READY",
      sub: "Tap REFRESH for your first personalized insight, or ask anything.",
      cta: null
    },
  };
  const s = states[type] || states.habits;
  return `<div class="empty" style="text-align:center;padding:24px 16px;">
    <div style="display:flex;justify-content:center;margin-bottom:11px;">${s.icon}</div>
    <div class="empty-title" style="font-size:13px;margin-bottom:6px;">${s.title}</div>
    <div class="empty-sub" style="font-size:10px;line-height:1.5;margin-bottom:${s.cta?'13px':'0'};">${s.sub}</div>
    ${s.cta?`<button class="btn btn-sm btn-primary" onclick="${s.cta.fn}" style="margin:0 auto;">${s.cta.label}</button>`:''}
  </div>`;
}


const FREQ_DESCS = {
  'daily': 'Every single day — no excuses.',
  'weekdays': 'Mon–Fri. Weekend is your rest time.',
  'weekends': 'Sat & Sun only. Weekend warrior mode.',
  '3x/week': 'Mon, Wed, Fri. Consistent spacing.',
  'weekly': 'Once per week. Usually Monday.',
  'monthly': 'Once per month. Monthly milestone.'
};
// [selFreq merged]


function toggleRitualExpand(id) {
  const card = document.querySelector('.ritual-card[data-rid="' + id + '"]');
  if (!card) return;
  card.classList.toggle('collapsed');
  const list = card.querySelector('.ritual-habits-list');
  if (list) list.style.display = card.classList.contains('collapsed') ? 'none' : '';
}

// ════════════════════════════════════════════════════════════
// BATCH ALPHA
// ════════════════════════════════════════════════════════════

// ── 1. PERFECT DAY CELEBRATION ──────────────────────────────
function showPerfectDay() {
  if ($('perfect-day-overlay')) return;
  const el = document.createElement('div');
  el.id = 'perfect-day-overlay';
  el.style.cssText = 'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;background:rgba(0,0,0,.85);animation:pdFadeIn .3s ease;';
  const done = S.habits.filter(h=>h.completedToday&&!h.archived).length;
  const total = S.habits.filter(h=>!h.archived&&isDueToday(h)).length;
  el.innerHTML = `
    <div style="text-align:center;padding:24px;max-width:320px;">
      <div style="font-size:64px;animation:pdBounce .6s ease;">🏆</div>
      <div style="font-family:'Archivo Black',sans-serif;font-size:28px;color:var(--yellow);margin:11px 0 5px;text-transform:uppercase;letter-spacing:2px;">PERFECT DAY!</div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:var(--cyan);margin-bottom:11px;">${done}/${total} HABITS COMPLETE</div>
      <div style="font-family:'Space Grotesk',sans-serif;font-size:13px;color:#ccc;line-height:1.5;margin-bottom:18px;">"You do not rise to the level of your goals. You fall to the level of your systems."</div>
      <div style="display:flex;gap:9px;justify-content:center;flex-wrap:wrap;">
        <div style="padding:7px 14px;border:2px solid var(--yellow);font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--yellow);">+${done*10} XP EARNED</div>
        <div style="padding:7px 14px;border:2px solid var(--lime);font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--lime);">STREAK PROTECTED</div>
      </div>
      <button onclick="this.closest('#perfect-day-overlay').remove()" style="margin-top:18px;background:var(--yellow);border:none;padding:11px 28px;font-family:'Archivo Black',sans-serif;font-size:12px;cursor:pointer;color:var(--black);letter-spacing:1px;">LET'S GO →</button>
    </div>`;
  document.body.appendChild(el);
  haptic('levelup');
  playSound('perfect');
  if(S.confettiOn!==false) { confetti(40); setTimeout(()=>confetti(30),600); setTimeout(()=>confetti(20),1200); }
  setTimeout(()=>{ if(el.parentNode) el.remove(); }, 6000);
}

// ── 2. HABIT DIFFICULTY ─────────────────────────────────────
const DIFFICULTY_CONFIG = {
  easy:   { label:'EASY',   color:'#00F5D4', xp:5,  icon:'◎' },
  medium: { label:'MEDIUM', color:'#FFE600', xp:10, icon:'◉' },
  hard:   { label:'HARD',   color:'#FF3CAC', xp:20, icon:'⬤' },
  epic:   { label:'EPIC',   color:'#7B2FBE', xp:35, icon:'★' },
};

function getDifficultyXP(h) {
  return DIFFICULTY_CONFIG[h.difficulty||'medium']?.xp || 10;
}

// ── 3. MODAL ANIMATIONS ─────────────────────────────────────
// [openModalAnimated removed]

// [closeModalAnimated removed]

// ── 4. STATS COUNTER ANIMATION ──────────────────────────────
function animateCounter(el, from, to, suffix='', duration=600) {
  if (!el) return;
  const start = Date.now();
  const range = to - from;
  function tick() {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = Math.round(from + range * ease);
    el.textContent = current + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// [renderStatsWithAnimation disabled - caused missing element errors]
function renderStatsWithAnimation() { renderStats(); }

function checkProactiveCoach() {
  // Trigger if any habit missed 2+ days in a row
  const today = new Date();
  const yesterday = new Date(today); yesterday.setDate(today.getDate()-1);
  const y2 = new Date(today); y2.setDate(today.getDate()-2);
  const yd = yesterday.toISOString().split('T')[0];
  const y2d = y2.toISOString().split('T')[0];
  
  const atRiskHabits = S.habits.filter(h => {
    if (h.archived || h.paused || (h.streak||0) < 3) return false;
    const ydSnap = S.lockedDays?.[yd];
    const y2Snap = S.lockedDays?.[y2d];
    const missedYd = ydSnap ? !ydSnap.find(s=>s.habitId===h.id&&s.completed) : true;
    const missedY2 = y2Snap ? !y2Snap.find(s=>s.habitId===h.id&&s.completed) : true;
    return missedYd && missedY2 && isDueDateStr(h,yd);
  });
  
  if (atRiskHabits.length > 0 && !S._lastProactiveCoach !== todayStr()) {
    S._lastProactiveCoach = todayStr();
    const names = atRiskHabits.slice(0,2).map(h=>h.name).join(' & ');
    setTimeout(() => {
      notify(`Coach: "${names}" streak at risk! Tap to get back on track.`, '🦁', 5000);
    }, 3000);
  }
}

// ── 7. WEEKLY SCHEDULE VIEW ──────────────────────────────────
function renderWeeklySchedule() {
  const el = $('weekly-schedule-grid');
  if (!el) return;
  const active = S.habits.filter(h=>!h.archived);
  if (!active.length) { el.innerHTML = getEmptyState('habits'); return; }
  
  const days = ['MON','TUE','WED','THU','FRI','SAT','SUN'];
  const today = new Date().getDay(); // 0=Sun
  const todayIdx = today === 0 ? 6 : today - 1;
  
  // For each day, get habits due
  const dayHabits = days.map((d, i) => {
    const jsDay = i === 6 ? 0 : i + 1; // convert to JS day (0=Sun)
    return active.filter(h => {
      const f = h.freq || 'daily';
      if (f==='daily') return true;
      if (f==='weekdays') return jsDay >= 1 && jsDay <= 5;
      if (f==='weekends') return jsDay === 0 || jsDay === 6;
      if (f==='3x/week') return [1,3,5].includes(jsDay);
      if (f==='weekly') return jsDay === 1;
      return false;
    });
  });
  
  el.innerHTML = `
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;margin-bottom:9px;">
      ${days.map((d,i) => `
        <div style="text-align:center;font-family:'IBM Plex Mono',monospace;font-size:7px;font-weight:700;padding:4px 2px;background:${i===todayIdx?'var(--yellow)':'var(--surface)'};color:${i===todayIdx?'var(--black)':'var(--sub)'};border:var(--bo);">
          ${d}<br><span style="font-size:8px;font-weight:400;">${dayHabits[i].length}</span>
        </div>
      `).join('')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:3px;">
      ${days.map((d,i) => `
        <div style="display:flex;flex-direction:column;gap:2px;">
          ${dayHabits[i].slice(0,6).map(h => {
            const ic = HABIT_ICONS.find(x=>x.id===h.icon)||HABIT_ICONS[0];
            const svg = `<svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="${h.color}" stroke-width="2" stroke-linecap="round">${ic.svg}</svg>`;
            return `<div style="padding:2px 3px;background:${h.color}22;border-left:2px solid ${h.color};display:flex;align-items:center;gap:2px;overflow:hidden;" title="${h.name}">${svg}<span style="font-size:7px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">${h.name}</span></div>`;
          }).join('')}
          ${dayHabits[i].length > 6 ? `<div style="font-size:7px;color:var(--sub);text-align:center;">+${dayHabits[i].length-6}</div>` : ''}
        </div>
      `).join('')}
    </div>`;
}

// ── 8. HABIT CORRELATION ─────────────────────────────────────
function getHabitCorrelations() {
  // Find habits that are often completed together
  const active = S.habits.filter(h=>!h.archived);
  if (active.length < 2) return [];
  
  const correlations = [];
  const history = S.history || [];
  
  for (let i = 0; i < active.length; i++) {
    for (let j = i+1; j < active.length; j++) {
      const h1 = active[i], h2 = active[j];
      // Find days where both were completed
      const h1Dates = new Set(history.filter(e=>e.habitId===h1.id&&e.status==='done').map(e=>e.date));
      const h2Dates = new Set(history.filter(e=>e.habitId===h2.id&&e.status==='done').map(e=>e.date));
      const both = [...h1Dates].filter(d=>h2Dates.has(d)).length;
      const either = new Set([...h1Dates,...h2Dates]).size;
      if (either < 5) continue;
      const correlation = Math.round(both/either*100);
      if (correlation >= 60) {
        correlations.push({ h1: h1.name, h2: h2.name, pct: correlation, both });
      }
    }
  }
  return correlations.sort((a,b)=>b.pct-a.pct).slice(0,5);
}

function renderHabitCorrelations() {
  const el = $('habit-correlations');
  if (!el) return;
  const corrs = getHabitCorrelations();
  if (!corrs.length) {
    el.innerHTML = '<div style="font-size:10px;color:var(--sub);">Complete more habits over time to see correlations.</div>';
    return;
  }
  el.innerHTML = corrs.map(c => `
    <div style="display:flex;align-items:center;gap:9px;padding:8px 11px;background:var(--surface);border:var(--bo-t);margin-bottom:5px;">
      <div style="flex:1;min-width:0;">
        <div style="font-size:10px;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${c.h1} <span style="color:var(--cyan)">↔</span> ${c.h2}</div>
        <div style="font-size:8px;color:var(--sub);margin-top:2px;">Done together ${c.both} times</div>
      </div>
      <div style="font-family:'Archivo Black',sans-serif;font-size:18px;color:${c.pct>=80?'var(--lime)':c.pct>=60?'var(--cyan)':'var(--yellow)'};">${c.pct}%</div>
    </div>
  `).join('');
}

// ── 9. HABIT WEATHER ─────────────────────────────────────────
function getHabitWeather() {
  const active = S.habits.filter(h=>!h.archived&&isDueToday(h));
  if (!active.length) return { icon:'☀️', label:'Clear', desc:'No habits due today.', color:'var(--yellow)' };
  
  const avgStrength = active.reduce((s,h)=>s+getHabitStrength(h),0) / active.length;
  const todayDow = new Date().getDay();
  
  // Check historical performance on this day of week
  const sameDay = (S.history||[]).filter(e => {
    if (!e.date) return false;
    return new Date(e.date+'T12:00:00').getDay() === todayDow;
  });
  const uniqueDayDates = [...new Set(sameDay.map(e=>e.date))];
  const avgCompletionOnDay = uniqueDayDates.length > 0 
    ? sameDay.length / (uniqueDayDates.length * Math.max(1, active.length)) 
    : 0.5;
  
  const score = (avgStrength / 100 * 0.6) + (avgCompletionOnDay * 0.4);
  
  if (score >= 0.8) return { icon:'⚡', label:'BEAST MODE', desc:`${Math.round(score*100)}% predicted success. Your strongest day.`, color:'var(--lime)' };
  if (score >= 0.65) return { icon:'☀️', label:'STRONG DAY', desc:`${Math.round(score*100)}% predicted. Good momentum.`, color:'var(--yellow)' };
  if (score >= 0.45) return { icon:'⛅', label:'MODERATE', desc:`${Math.round(score*100)}% predicted. Stay consistent.`, color:'var(--cyan)' };
  if (score >= 0.3) return { icon:'🌥️', label:'CHALLENGING', desc:`${Math.round(score*100)}% predicted. Push through.`, color:'var(--orange)' };
  return { icon:'⛈️', label:'ROUGH DAY', desc:`${Math.round(score*100)}% predicted. Every rep counts.`, color:'var(--red)' };
}

function renderHabitWeather() {
  const el = $('habit-weather');
  if (!el) return;
  const w = getHabitWeather();
  el.innerHTML = `
    <div style="display:flex;align-items:center;gap:13px;padding:9px 13px;background:var(--black);border:2px solid ${w.color};">
      <div style="font-size:32px;">${w.icon}</div>
      <div>
        <div style="font-family:'Archivo Black',sans-serif;font-size:14px;color:${w.color};">${w.label}</div>
        <div style="font-size:10px;color:#aaa;margin-top:2px;">${w.desc}</div>
      </div>
    </div>`;
}

// ── 10. REST DAY ─────────────────────────────────────────────
function toggleRestDay() {
  const today = todayStr();
  S.restDays = S.restDays || {};
  if (S.restDays[today]) {
    delete S.restDays[today];
    toast('Rest day cancelled. Back to it!', 'info');
  } else {
    S.restDays[today] = true;
    toast('Rest day set. Streaks protected. Recharge!', 'success');
    haptic('medium');
  }
  save(); renderAll();
}

function isRestDay(dateStr) {
  return !!(S.restDays && S.restDays[dateStr||todayStr()]);
}

// ── 11. COLLAPSIBLE SETTINGS ─────────────────────────────────
function toggleSettingsBlock(el) {
  const block = el.closest('.settings-block');
  if (!block) return;
  const body = block.querySelector('.settings-block-body');
  if (!body) return;
  const isOpen = body.style.display !== 'none';
  body.style.display = isOpen ? 'none' : 'block';
  const chevron = el.querySelector('.sb-chevron');
  if (chevron) chevron.style.transform = isOpen ? 'rotate(-90deg)' : 'rotate(0deg)';
}

// ── 12. COMPACT CARD MODE ────────────────────────────────────
function toggleCompactMode() {
  _compactMode = !_compactMode;
  document.body.classList.toggle('compact-mode', _compactMode);
  const btn = $('compact-mode-btn');
  if (btn) btn.classList.toggle('btn-cyan', _compactMode);
  renderAll();
  toast(_compactMode ? 'Compact mode ON' : 'Full mode ON', 'info');
}

// Patch init to check perfect day and proactive coach
// [init proactive merged]

// Patch renderStats to use animated version
// [renderStats → renderStatsWithAnimation]

// Check perfect day after every toggle
// [_baseToggleHabit perfect day merged]

// Reset perfect day flag on new day


const DIFF_DESCS = {
  easy:   'Simple habit. 5 XP per completion. Great for building consistency.',
  medium: 'Balanced challenge. 10 XP per completion.',
  hard:   'Serious effort required. 20 XP. Builds real discipline.',
  epic:   'Maximum challenge. 35 XP. Only for true warriors.',
};
function selDifficulty(el, val) {
  document.querySelectorAll('#modal-add .freq-btn[onclick*="selDifficulty"]').forEach(b=>b.classList.remove('sel'));
  el.classList.add('sel');
  $('inp-difficulty').value = val;
  const d=$('diff-desc'); if(d) d.textContent=DIFF_DESCS[val]||'';
}


// [renderStats → see _renderStatsBase below]


// ── SERVICE WORKER ──────────────────────────────────────────
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('[OHT] SW registered, scope:', reg.scope))
      .catch(err => console.warn('[OHT] SW registration failed:', err));
  });

  // SW baru aktif setelah deploy → auto reload tab supaya user langsung dapat versi terbaru
  navigator.serviceWorker.addEventListener('message', e => {
    if (e.data && e.data.type === 'SW_UPDATED') {
      console.log('[OHT] New SW activated, reloading...');
      window.location.reload();
    }
  });
}


// [closeCustomSelect defined above]



// ════════════════════════════════════════════════════════════
// NUTRITION MODULE
// ════════════════════════════════════════════════════════════

// ── DEFAULT TARGETS (WHO) ──
const NUTR_DEFAULTS = { kcal:2000, protein:50, carbs:300, fat:65, fiber:25, sugar:50, sodium:2300 };
const NUTR_UNITS    = { kcal:'kkal', protein:'g', carbs:'g', fat:'g', fiber:'g', sugar:'g', sodium:'mg' };
const NUTR_LABELS   = { kcal:'Kalori', protein:'Protein', carbs:'Karbo', fat:'Lemak', fiber:'Serat', sugar:'Gula', sodium:'Sodium' };
const NUTR_COLORS   = { kcal:'#FF6B00', protein:'#00F5D4', carbs:'#FFE600', fat:'#FF3CAC', fiber:'#AAFF00', sugar:'#7B2FBE', sodium:'#0057FF' };
const NUTR_ICONS    = ['🍽️','🥗','🍖','🥤','🥕','🍜','🍳','🥩','🍱','🥙','🥪','🍝'];

let _nutrImg = null;        // base64 dari foto yang dipilih
let _nutrResult = null;     // hasil analisa terakhir
let _nutrPortion = 1.0;     // multiplier porsi

// ── STORAGE HELPERS ──
function getNutrTargets() {
  try {
    const saved = localStorage.getItem('oht_nutr_targets');
    return saved ? {...NUTR_DEFAULTS, ...JSON.parse(saved)} : {...NUTR_DEFAULTS};
  } catch(e) { return {...NUTR_DEFAULTS}; }
}

function getNutrLog() {
  // { 'YYYY-MM-DD': [ { name, emoji, kcal, protein, carbs, fat, fiber, sugar, sodium, portion, time } ] }
  try {
    const raw = localStorage.getItem('oht_nutr_log');
    return raw ? JSON.parse(raw) : {};
  } catch(e) { return {}; }
}

function saveNutrLog(log) {
  try { localStorage.setItem('oht_nutr_log', JSON.stringify(log)); } catch(e) {}
}

function getTodayNutrLog() {
  const log = getNutrLog();
  return log[todayStr()] || [];
}

function getTodayTotals() {
  const meals = getTodayNutrLog();
  const t = { kcal:0, protein:0, carbs:0, fat:0, fiber:0, sugar:0, sodium:0 };
  meals.forEach(m => { Object.keys(t).forEach(k => { t[k] += (m[k]||0); }); });
  return t;
}

// ── SETTINGS SAVE/LOAD ──
function saveNutrSettings() {
  const targets = {
    kcal:    +($('nset-kcal')?.value   || 2000),
    protein: +($('nset-protein')?.value || 50),
    carbs:   +($('nset-carbs')?.value   || 300),
    fat:     +($('nset-fat')?.value     || 65),
    fiber:   +($('nset-fiber')?.value   || 25),
    sugar:   +($('nset-sugar')?.value   || 50),
    sodium:  +($('nset-sodium')?.value  || 2300),
  };
  try { localStorage.setItem('oht_nutr_targets', JSON.stringify(targets)); } catch(e) {}
  renderNutrHeader();
  toast('Target nutrisi disimpan!', 'success');
}

function loadNutrSettingsUI() {
  const t = getNutrTargets();
  ['kcal','protein','carbs','fat','fiber','sugar','sodium'].forEach(k => {
    const el = $('nset-'+k); if(el) el.value = t[k];
  });
}

// ── RENDER HEADER (rings + macro bars) ──
function renderNutrHeader() {
  const targets = getNutrTargets();
  const totals  = getTodayTotals();
  const keys    = ['kcal','protein','carbs','fat'];
  const miniKeys= ['fiber','sugar','sodium'];

  // Date label
  const dl = $('nutr-date-lbl');
  if(dl) { const d=new Date(); dl.textContent = d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long'}); }

  // Rings (4 utama)
  const ringsEl = $('nutr-rings');
  if(ringsEl) {
    const R=28, C=2*Math.PI*R;
    ringsEl.innerHTML = keys.map(k => {
      const pct = Math.min(1, totals[k] / (targets[k]||1));
      const over = totals[k] > targets[k];
      const color = over ? 'var(--red)' : NUTR_COLORS[k];
      const dash = C - pct * C;
      // rotate hanya circle arc via transform, bukan seluruh SVG
      // sehingga text tetap tegak lurus
      return `<div class="nutr-ring-wrap">
        <svg width="70" height="70" viewBox="0 0 70 70">
          <circle cx="35" cy="35" r="${R}" fill="none" stroke="#222" stroke-width="6"/>
          <circle cx="35" cy="35" r="${R}" fill="none" stroke="${color}" stroke-width="6"
            stroke-dasharray="${C.toFixed(1)}" stroke-dashoffset="${dash.toFixed(1)}"
            stroke-linecap="square"
            transform="rotate(-90 35 35)"
            style="transition:stroke-dashoffset .5s;"/>
          <text x="35" y="31" text-anchor="middle" font-family="'Archivo Black',sans-serif" font-size="10" fill="${over?'var(--red)':'var(--text)'}">${Math.round(totals[k])}</text>
          <text x="35" y="42" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="6.5" fill="var(--sub)">/${targets[k]}</text>
          <text x="35" y="52" text-anchor="middle" font-family="'IBM Plex Mono',monospace" font-size="5.5" fill="var(--sub)">${NUTR_UNITS[k]}</text>
        </svg>
        <div class="nutr-ring-lbl">${NUTR_LABELS[k]}</div>
      </div>`;
    }).join('');
  }

  // Macro mini bars (3 bawah)
  const macroEl = $('nutr-macros-row');
  if(macroEl) {
    macroEl.innerHTML = miniKeys.map(k => {
      const pct = Math.min(100, Math.round(totals[k] / (targets[k]||1) * 100));
      const over = totals[k] > targets[k];
      return `<div class="nutr-macro-cell">
        <div class="nutr-macro-name">${NUTR_LABELS[k]}</div>
        <div class="nutr-macro-vals${over?' nutr-macro-over':''}">${Math.round(totals[k])}<span>/${targets[k]}${NUTR_UNITS[k]}</span></div>
        <div class="nutr-macro-bar"><div class="nutr-macro-fill" style="width:${pct}%;background:${over?'var(--red)':NUTR_COLORS[k]};"></div></div>
      </div>`;
    }).join('');
  }

  // Kcal badge di log header
  const badge = $('nutr-kcal-badge');
  if(badge) badge.textContent = `${Math.round(totals.kcal)} / ${targets.kcal} kkal`;

  // Render meal log
  renderNutrMealLog();
}

// ── RENDER MEAL LOG ──
function renderNutrMealLog() {
  const el = $('nutr-meal-log'); if(!el) return;
  const meals = getTodayNutrLog();
  if(!meals.length) {
    el.innerHTML = `<div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);text-align:center;padding:18px;">Belum ada makanan yang diconsume hari ini.</div>`;
    return;
  }
  el.innerHTML = meals.map((m,i) => `
    <div class="nutr-meal-item">
      <div class="nutr-meal-icon">${m.emoji||'🍽️'}</div>
      <div class="nutr-meal-info">
        <div class="nutr-meal-name">${m.name}${m.portion&&m.portion!==1?' <span style="font-size:8px;opacity:.6;">×'+m.portion+'</span>':''}</div>
        <div class="nutr-meal-meta">P:${m.protein}g · K:${m.carbs}g · L:${m.fat}g · ${m.time||''}</div>
      </div>
      <div class="nutr-meal-kcal">${m.kcal}<span style="font-family:'IBM Plex Mono',monospace;font-size:7px;font-weight:400;"> kkal</span></div>
      <div class="nutr-meal-del" onclick="deleteNutrMeal(${i})" title="Hapus">×</div>
    </div>`).join('');
}

// ── DELETE MEAL ──
function deleteNutrMeal(idx) {
  const log = getNutrLog();
  const today = todayStr();
  if(!log[today]) return;
  log[today].splice(idx, 1);
  saveNutrLog(log);
  renderNutrHeader();
}

// ── IMAGE SELECTION ──
function onNutrImgSelected(input) {
  const file = input.files?.[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    _nutrImg = e.target.result; // full data URL
    const preview = $('nutr-preview-img');
    const inner = $('nutr-upload-inner');
    const zone = $('nutr-upload-zone');
    if(preview) { preview.src = _nutrImg; preview.style.display = 'block'; }
    if(inner) inner.style.display = 'none';
    if(zone) zone.classList.add('has-img');
    const btn = $('nutr-scan-btn'); if(btn) btn.style.display = 'block';
    // Sembunyikan result sebelumnya
    const rw = $('nutr-result-wrap'); if(rw) rw.style.display = 'none';
  };
  reader.readAsDataURL(file);
}

// ── DO SCAN (Claude Vision) ──
async function doNutrScan() {
  if(!_nutrImg) return;
  const btn = $('nutr-scan-btn');
  const card = $('nutr-scan-card');
  if(btn) btn.style.display = 'none';

  // Loading state
  const loadingEl = document.createElement('div');
  loadingEl.className = 'nutr-scan-loading';
  loadingEl.id = 'nutr-loading';
  loadingEl.innerHTML = `
    <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--yellow);letter-spacing:1px;">MENGANALISA MAKANAN...</div>
    <div class="nutr-scan-loading-bar"><div class="nutr-scan-loading-fill"></div></div>
    <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">Claude Vision sedang memproses foto</div>`;
  card.appendChild(loadingEl);

  const targets = getNutrTargets();
  const totals  = getTodayTotals();

  // Hitung sisa kuota hari ini untuk warning prompt
  const remaining = {};
  Object.keys(targets).forEach(k => { remaining[k] = Math.max(0, targets[k] - (totals[k]||0)); });

  const base64Data = _nutrImg.split(',')[1];
  const mediaType  = _nutrImg.match(/data:(image\/\w+);/)?.[1] || 'image/jpeg';

  const systemPrompt = `Kamu adalah ahli gizi. Analisa foto makanan dan hasilkan data nutrisi estimasi yang akurat.
Respond HANYA dengan JSON valid, tanpa markdown, tanpa penjelasan, langsung JSON saja.
Format:
{
  "name": "nama makanan (Indonesia)",
  "emoji": "1 emoji relevan",
  "description": "deskripsi singkat 1 baris",
  "serving": "estimasi porsi (mis: 1 mangkok, 1 piring)",
  "kcal": angka,
  "protein": angka_gram,
  "carbs": angka_gram,
  "fat": angka_gram,
  "fiber": angka_gram,
  "sugar": angka_gram,
  "sodium": angka_mg,
  "confidence": "high/medium/low"
}
Semua angka adalah bilangan bulat tanpa satuan. Estimasi untuk 1 porsi standar yang terlihat di foto.`;

  const userPrompt = `Analisa makanan dalam foto ini. Target harian user: kalori ${targets.kcal}kkal, protein ${targets.protein}g, karbo ${targets.carbs}g, lemak ${targets.fat}g.
Sudah dikonsumsi hari ini: kalori ${Math.round(totals.kcal)}kkal, protein ${Math.round(totals.protein)}g, karbo ${Math.round(totals.carbs)}g, lemak ${Math.round(totals.fat)}g.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64Data } },
            { type: 'text', text: userPrompt }
          ]
        }]
      })
    });

    const data = await res.json();
    const raw = data.content?.map(b => b.text||'').join('').trim();
    const clean = raw.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);

    // Hapus loading
    const ld = $('nutr-loading'); if(ld) ld.remove();

    _nutrResult = result;
    _nutrPortion = 1.0;
    renderNutrResult(result, totals, targets);

  } catch(err) {
    const ld = $('nutr-loading'); if(ld) ld.remove();
    if(btn) btn.style.display = 'block';
    toast('Gagal analisa: '+err.message, 'error');
  }
}

// ── RENDER RESULT CARD ──
function renderNutrResult(result, totals, targets) {
  const keys = ['kcal','protein','carbs','fat','fiber','sugar','sodium'];

  // Hitung dengan porsi
  const p = _nutrPortion;
  const scaled = {};
  keys.forEach(k => { scaled[k] = Math.round((result[k]||0) * p); });

  // Cek apa yang akan melebihi limit setelah consume
  const overKeys = keys.filter(k => (totals[k]||0) + scaled[k] > (targets[k]||Infinity));

  let warningHtml = '';
  if(overKeys.length) {
    const labels = overKeys.map(k => {
      const after = Math.round((totals[k]||0) + scaled[k]);
      const lim = targets[k];
      return `${NUTR_LABELS[k]} (${after}/${lim}${NUTR_UNITS[k]})`;
    }).join(', ');
    warningHtml = `<div class="nutr-over-warning">
      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" style="flex-shrink:0;margin-top:1px;"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>Akan melewati batas: <strong>${labels}</strong></span>
    </div>`;
  }

  const confBadge = result.confidence === 'high' ? '🟢 High' : result.confidence === 'medium' ? '🟡 Medium' : '🔴 Low';

  const cellsHtml = keys.map(k => {
    const isOver = overKeys.includes(k);
    const alreadyConsumed = Math.round(totals[k]||0);
    const afterConsume = alreadyConsumed + scaled[k];
    const lim = targets[k];
    return `<div class="nutr-result-cell${isOver?' over-limit':''}">
      <div class="nutr-result-cell-name">${NUTR_LABELS[k]}</div>
      <div class="nutr-result-cell-val">${scaled[k]}<span style="font-family:'IBM Plex Mono',monospace;font-size:7px;font-weight:400;"> ${NUTR_UNITS[k]}</span></div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:6.5px;color:${isOver?'var(--red)':'var(--sub)'};margin-top:2px;">sdh: ${alreadyConsumed} → ${afterConsume}/${lim}</div>
    </div>`;
  }).join('');

  const rc = $('nutr-result-card');
  if(!rc) return;
  rc.innerHTML = `
    <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:6px;">
      <div>
        <div class="nutr-result-name">${result.emoji||'🍽️'} ${result.name||'Makanan'}</div>
        <div class="nutr-result-desc">${result.description||''} · ${result.serving||'1 porsi'}</div>
      </div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);text-align:right;">${confBadge}<br>estimasi</div>
    </div>
    <div class="nutr-result-kcal">${scaled.kcal}</div>
    <div class="nutr-result-kcal-lbl">kkal per ${result.serving||'porsi'}</div>
    <div class="nutr-portion-row">
      <span class="nutr-portion-lbl">PORSI</span>
      <div class="nutr-portion-btn" onclick="adjustPortion(-0.5)">−</div>
      <div class="nutr-portion-val" id="nutr-portion-disp">×${_nutrPortion}</div>
      <div class="nutr-portion-btn" onclick="adjustPortion(0.5)">+</div>
      <span style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">(0.5 = setengah porsi)</span>
    </div>
    ${warningHtml}
    <div class="nutr-result-grid">${cellsHtml}</div>`;

  const rw = $('nutr-result-wrap'); if(rw) rw.style.display = 'block';
}

// ── ADJUST PORTION ──
function adjustPortion(delta) {
  _nutrPortion = Math.max(0.5, Math.min(5, _nutrPortion + delta));
  _nutrPortion = Math.round(_nutrPortion * 2) / 2; // snap ke 0.5
  const disp = $('nutr-portion-disp'); if(disp) disp.textContent = '×'+_nutrPortion;
  if(_nutrResult) renderNutrResult(_nutrResult, getTodayTotals(), getNutrTargets());
}

// ── CONSUME ──
function consumeMeal() {
  if(!_nutrResult) return;
  const p = _nutrPortion;
  const keys = ['kcal','protein','carbs','fat','fiber','sugar','sodium'];
  const meal = { name: _nutrResult.name, emoji: _nutrResult.emoji||'🍽️', portion: p };
  keys.forEach(k => { meal[k] = Math.round((_nutrResult[k]||0)*p); });
  const now = new Date();
  meal.time = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');

  const log = getNutrLog();
  const today = todayStr();
  if(!log[today]) log[today] = [];
  log[today].push(meal);
  saveNutrLog(log);

  clearNutrScan();
  toast(`✅ ${meal.emoji} ${meal.name} dicatat! +${meal.kcal}kkal`, 'success');
  setTimeout(() => navigateMore('report'), 800);
}

// ── CLEAR SCAN ──
function clearNutrScan() {
  _nutrImg = null;
  _nutrResult = null;
  _nutrPortion = 1.0;
  const preview = $('nutr-preview-img');
  const inner = $('nutr-upload-inner');
  const zone = $('nutr-upload-zone');
  const btn = $('nutr-scan-btn');
  const rw = $('nutr-result-wrap');
  const inp = $('nutr-img-input');
  if(preview) { preview.style.display='none'; preview.src=''; }
  if(inner) inner.style.display = 'flex';
  if(zone) zone.classList.remove('has-img');
  if(btn) btn.style.display = 'none';
  if(rw) rw.style.display = 'none';
  if(inp) inp.value = '';
}

// ── RESET DAY (manual) ──
function resetNutritionDay() {
  if(!confirm('Reset log nutrisi hari ini?')) return;
  const log = getNutrLog();
  delete log[todayStr()];
  saveNutrLog(log);
  renderNutrHeader();
  toast('Log nutrisi hari ini di-reset.', 'info');
}

// ── PAGE INIT (dipanggil saat navigate ke nutrition) ──
function initNutritionPage() {
  loadNutrSettingsUI();
  renderNutrHeader();
  clearNutrScan();
}

// ── NAVBAR TOGGLE ──────────────────────────────────────────
let _navVisible = true;
function toggleNavBar() {
  _navVisible = !_navVisible;
  document.body.classList.toggle('nav-hidden', !_navVisible);
  // Update icon: down arrow = nav visible (klik = hide), up arrow = nav hidden (klik = show)
  const icon = $('nav-toggle-icon');
  if(icon) {
    icon.innerHTML = _navVisible
      ? '<polyline points="6 9 12 15 18 9"/>'   // arrow down = "klik untuk hide"
      : '<polyline points="18 15 12 9 6 15"/>'; // arrow up   = "klik untuk show"
  }
  // Warna tombol sedikit berubah saat nav hidden (accent lebih soft)
  const btn = $('nav-toggle-btn');
  if(btn) btn.style.opacity = _navVisible ? '1' : '0.85';
}

// ════════════════════════════════════════════════════════════
// JOURNAL MODULE — full page, click-to-edit, date filter
// ════════════════════════════════════════════════════════════
let _journalEditMode = false; // null = today

function initJournalPage() {
  _journalViewDate = null;
  const inp = $('journal-date-filter');
  if(inp) inp.value = '';
  loadJournalDate(null);
}

function loadJournalDate(dateStr) {
  _journalViewDate = dateStr || null;
  const lblJ = $('journal-date-filter-label');
  if(lblJ) lblJ.textContent = dateStr ? odpFormatLabel(dateStr) : odpTodayLabel();
  const targetDate = _journalViewDate || todayStr();
  const lbl = $('journal-viewing-date');
  if(lbl) {
    const d = new Date(targetDate + 'T12:00:00');
    lbl.textContent = d.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }
  // Load text for that date
  const entries = getJournalLog();
  const text = entries[targetDate] || '';
  const textEl = $('journal-main-text');
  if(textEl) {
    textEl.innerHTML = text
      ? text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\n/g,'<br>')
      : '<span style="color:var(--sub);font-style:italic;font-size:11px;">Tap untuk menulis jurnal hari ini...</span>';
  }
  cancelJournalEdit();
  // Render prev entries (all other dates)
  renderJournalPrev(targetDate);
}

function getJournalLog() {
  try { return JSON.parse(localStorage.getItem('oht_journal_log')||'{}'); } catch(e){return{};}
}
function saveJournalLog(log) {
  try { localStorage.setItem('oht_journal_log', JSON.stringify(log)); } catch(e){}
}

function startJournalEdit() {
  if(_journalEditMode) return;
  _journalEditMode = true;
  const targetDate = _journalViewDate || todayStr();
  // Only allow editing today
  if(targetDate !== todayStr()) {
    toast('Hanya jurnal hari ini yang bisa diedit.', 'info');
    return;
  }
  const entries = getJournalLog();
  const text = entries[targetDate] || '';
  const textEl = $('journal-main-text');
  const taEl = $('journal-main-textarea');
  const actEl = $('journal-main-actions');
  if(textEl) textEl.style.display = 'none';
  if(taEl) { taEl.style.display = 'block'; taEl.value = text; taEl.focus(); }
  if(actEl) actEl.style.display = 'flex';
}

function saveJournalMain() {
  const taEl = $('journal-main-textarea');
  if(!taEl) return;
  const text = taEl.value.trim();
  const log = getJournalLog();
  log[todayStr()] = text;
  saveJournalLog(log);
  _journalEditMode = false;
  loadJournalDate(_journalViewDate);
  toast('Jurnal disimpan ✓', 'success');
}

function cancelJournalEdit() {
  _journalEditMode = false;
  const textEl = $('journal-main-text');
  const taEl = $('journal-main-textarea');
  const actEl = $('journal-main-actions');
  if(textEl) textEl.style.display = 'block';
  if(taEl) taEl.style.display = 'none';
  if(actEl) actEl.style.display = 'none';
}

function renderJournalPrev(currentDate) {
  const el = $('journal-prev-entries'); if(!el) return;
  const log = getJournalLog();
  const dates = Object.keys(log).filter(d => d !== currentDate && log[d]).sort((a,b)=>b.localeCompare(a));
  if(!dates.length) { el.innerHTML=''; return; }
  el.innerHTML = '<div style="font-family:\'IBM Plex Mono\',monospace;font-size:8px;color:var(--sub);margin:14px 0 7px;text-transform:uppercase;letter-spacing:1px;">Entri Sebelumnya</div>'
    + dates.slice(0,20).map(d => {
      const dt = new Date(d+'T12:00:00');
      const label = dt.toLocaleDateString('id-ID',{weekday:'short',day:'numeric',month:'short',year:'numeric'});
      const preview = (log[d]||'').slice(0,120).replace(/\n/g,' ');
      return `<div class="journal-prev-card" onclick="loadJournalDate('${d}');$('journal-date-filter').value='${d}'">
        <div class="journal-prev-date">${label}</div>
        <div class="journal-prev-text">${preview}${(log[d]||'').length>120?'…':''}</div>
      </div>`;
    }).join('');
}

// ════════════════════════════════════════════════════════════
// REPORT DATE FILTER + GARDEN/NUTRITION/OTHER in Report
// ════════════════════════════════════════════════════════════

function initReportPage() {
  _reportViewDate = null;
  const inp = $('report-date-filter');
  if(inp) inp.value = '';
  renderReportDateLabel();
  renderReportGardenSnap();
  renderReportNutritionLog();
  if(typeof renderReportWaterDisplay==='function') renderReportWaterDisplay();
  if(typeof renderReportSleepDisplay==='function') renderReportSleepDisplay();
  // Juga render habit report dengan date hari ini
  if(typeof renderReport==='function') renderReport();
}

function renderReportWaterDisplay() {
  const el = $('water-record-display'); if(!el) return;
  const d = _reportViewDate || todayStr();
  try {
    const log = JSON.parse(localStorage.getItem('oht_water_log') || '{}');
    const data = log[d];
    if(!data) {
      el.innerHTML = `<div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);">Belum ada data water. Input di tab Habits.</div>`;
      return;
    }
    if(data.mode === 'ml') {
      const pct = Math.min(100, Math.round((data.ml||0) / 2000 * 100));
      el.innerHTML = `<div style="display:flex;align-items:center;gap:9px;margin-bottom:5px;">
        <div style="font-family:'Archivo Black',sans-serif;font-size:20px;color:var(--yellow);">${data.ml||0}</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);">/ 2000 ml</div>
      </div>
      <div style="width:100%;height:8px;background:#222;border:1px solid var(--bc);overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:var(--yellow);transition:width .4s;"></div>
      </div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);margin-top:4px;">${pct}% dari target harian</div>`;
    } else {
      const g = data.glasses || 0;
      const target = 8;
      const pct = Math.min(100, Math.round(g / target * 100));
      const cups = Array.from({length: target}, (_, i) => {
        const filled = i < g;
        return `<div style="width:26px;height:32px;border:2px solid ${filled ? 'var(--yellow)' : 'var(--bc)'};background:${filled ? 'color-mix(in srgb,var(--yellow) 25%,transparent)' : 'transparent'};display:flex;align-items:center;justify-content:center;font-size:12px;">${filled ? '💧' : ''}</div>`;
      }).join('');
      el.innerHTML = `<div style="display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px;">${cups}</div>
        <div style="display:flex;align-items:center;gap:9px;">
          <div style="flex:1;height:4px;background:#222;overflow:hidden;"><div style="height:100%;width:${pct}%;background:var(--yellow);"></div></div>
          <div style="font-family:'Archivo Black',sans-serif;font-size:11px;color:var(--yellow);">${g}/${target}</div>
        </div>`;
    }
  } catch(e) { el.innerHTML = '<div style="color:var(--sub);font-size:9px;">Error.</div>'; }
}

function renderReportSleepDisplay() {
  const el = $('report-sleep-display'); if(!el) return;
  const d = _reportViewDate || todayStr();
  try {
    const log = JSON.parse(localStorage.getItem('oht_sleep_log') || '{}');
    const entries = log[d] || [];
    if(!entries.length) {
      el.innerHTML = `<div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);">Belum ada data water. Input di tab Habits.</div>`;
      return;
    }
    el.innerHTML = entries.map(e => {
      const dur = e.duration ? `<span style="font-family:'Archivo Black',sans-serif;font-size:16px;color:var(--yellow);">${e.duration}h</span>` : '';
      return `<div style="display:flex;align-items:center;gap:9px;padding:5px 0;border-bottom:1px solid var(--bc);">
        <span style="font-size:16px;">🌙</span>
        <div style="flex:1;font-family:'IBM Plex Mono',monospace;font-size:9px;">Tidur ${e.bed||'?'} → Bangun ${e.wake||'?'}</div>
        ${dur}
      </div>`;
    }).join('');
  } catch(e) { el.innerHTML = '<div style="color:var(--sub);font-size:9px;">Error.</div>'; }
}

function setReportDate(dateStr) {
  _reportViewDate = dateStr || null;
  // Update label tombol
  const lbl = $('report-date-filter-label');
  if(lbl) lbl.textContent = dateStr ? odpFormatLabel(dateStr) : odpTodayLabel();
  renderReportDateLabel();
  renderReportGardenSnap();
  renderReportNutritionLog();
  if(typeof renderReportWaterDisplay==='function') renderReportWaterDisplay();
  if(typeof renderReportSleepDisplay==='function') renderReportSleepDisplay();
  // Re-render habit performance for selected date
  if(typeof renderReport==='function') renderReport();
}

function renderReportDateLabel() {
  const el = $('report-viewing-date'); if(!el) return;
  const d = _reportViewDate || todayStr();
  const dt = new Date(d+'T12:00:00');
  el.textContent = '▸ ' + dt.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
}

function renderReportGardenSnap() {
  const el = $('report-garden-snap'); if(!el) return;
  const d = _reportViewDate || todayStr();
  // Check lockedDays for that date
  const snap = S.lockedDays && S.lockedDays[d];
  if(!snap) {
    el.innerHTML = `<div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);text-align:center;padding:12px;">Belum ada data garden untuk tanggal ini.</div>`;
    return;
  }
  const done = snap.filter(s=>s.completed).length;
  const total = snap.length;
  const pct = total>0?Math.round(done/total*100):0;
  el.innerHTML = `<div style="display:flex;align-items:center;gap:11px;">
    <div style="font-size:28px;">${pct===100?'🌳':pct>=60?'🌿':pct>=30?'🌱':'🌰'}</div>
    <div>
      <div style="font-family:'Archivo Black',sans-serif;font-size:16px;color:var(--yellow);">${pct}%</div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);">${done}/${total} habits selesai</div>
    </div>
    <div style="flex:1;height:6px;background:#222;border:1px solid var(--bc);overflow:hidden;">
      <div style="height:100%;width:${pct}%;background:var(--lime);transition:width .5s;"></div>
    </div>
  </div>`;
}

function renderReportNutritionLog() {
  const el = $('report-nutrition-log'); if(!el) return;
  const d = _reportViewDate || todayStr();
  try {
    const log = JSON.parse(localStorage.getItem('oht_nutr_log')||'{}');
    const meals = log[d] || [];
    if(!meals.length) {
      el.innerHTML = `<div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);text-align:center;padding:8px;">Tidak ada data nutrisi.</div>`;
      return;
    }
    const totKcal = meals.reduce((s,m)=>s+(m.kcal||0),0);
    const totP = meals.reduce((s,m)=>s+(m.protein||0),0);
    const totC = meals.reduce((s,m)=>s+(m.carbs||0),0);
    const totF = meals.reduce((s,m)=>s+(m.fat||0),0);
    el.innerHTML = `<div style="display:flex;gap:11px;flex-wrap:wrap;margin-bottom:9px;">
      <div><div style="font-family:'Archivo Black',sans-serif;font-size:16px;color:var(--yellow);">${totKcal}</div><div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">kkal</div></div>
      <div><div style="font-family:'Archivo Black',sans-serif;font-size:16px;">${totP}g</div><div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">protein</div></div>
      <div><div style="font-family:'Archivo Black',sans-serif;font-size:16px;">${totC}g</div><div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">karbo</div></div>
      <div><div style="font-family:'Archivo Black',sans-serif;font-size:16px;">${totF}g</div><div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">lemak</div></div>
    </div>
    ${meals.map(m=>`<div style="display:flex;align-items:center;gap:7px;padding:4px 0;border-bottom:1px solid var(--bc);">
      <span style="font-size:16px;">${m.emoji||'🍽️'}</span>
      <div style="flex:1;"><div style="font-family:'Archivo Black',sans-serif;font-size:10px;">${m.name}</div><div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">${m.time||''} · P:${m.protein}g K:${m.carbs}g L:${m.fat}g</div></div>
      <div style="font-family:'Archivo Black',sans-serif;font-size:11px;color:var(--yellow);">${m.kcal}kkal</div>
    </div>`).join('')}`;
  } catch(e) {
    el.innerHTML = '<div style="color:var(--sub);font-size:9px;padding:8px;">Error loading nutrition data.</div>';
  }
}

function saveReportOther(val) {
  const d = _reportViewDate || todayStr();
  if(d !== todayStr()) return; // only save today
  try {
    const log = JSON.parse(localStorage.getItem('oht_report_other')||'{}');
    log[d] = val;
    localStorage.setItem('oht_report_other', JSON.stringify(log));
  } catch(e){}
}

function loadReportOther() {
  const d = _reportViewDate || todayStr();
  const ta = $('report-other-input'); if(!ta) return;
  try {
    const log = JSON.parse(localStorage.getItem('oht_report_other')||'{}');
    ta.value = log[d] || '';
    ta.readOnly = d !== todayStr();
    ta.style.opacity = d !== todayStr() ? '0.6' : '1';
  } catch(e){}
}

// ════════════════════════════════════════════════════════════
// WELLNESS PAGE — Water + Sleep dengan date filter
// ════════════════════════════════════════════════════════════

function initWellnessPage() {
  _wellnessDate = null;
  const inp = $('wellness-date-filter');
  if(inp) inp.value = '';
  loadWellnessDate(null);
}

function loadWellnessDate(dateStr) {
  _wellnessDate = dateStr || null;
  const lbl2 = $('wellness-date-filter-label');
  if(lbl2) lbl2.textContent = dateStr ? odpFormatLabel(dateStr) : odpTodayLabel();
  const d = _wellnessDate || todayStr();
  const isToday = d === todayStr();

  const lbl = $('wellness-viewing-date');
  if(lbl) {
    const dt = new Date(d + 'T12:00:00');
    lbl.textContent = dt.toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
  }

  // Water: pakai S.waterLog (per-date object)
  S.waterLog = S.waterLog || {};
  const wCount = S.waterLog[d] || 0;

  const countEl = $('water-count'); if(countEl) countEl.textContent = wCount;
  const msgs = ['Mulai minum! 💧','Bagus! 💧','Seperempat! 💧','Setengah! 🌊','Hampir! 🌊','Sebentar lagi! 🌊','Hampir penuh! 💦','Satu lagi! 💦','🏆 Terhidrasi!'];
  const msgEl = $('water-msg'); if(msgEl) msgEl.textContent = msgs[Math.min(wCount, 8)];

  // Render cups — clickable hanya hari ini
  const cups = $('water-cups');
  if(cups) {
    cups.innerHTML = Array.from({length: 8}, (_, i) => {
      const filled = i < wCount;
      const clickable = isToday;
      return `<div class="water-cup ${filled?'full':''}" ${clickable ? `onclick="wellnessCupTap(${i},'${d}')"` : 'style="cursor:default;"'}>
        <div class="water-cup-fill" style="height:${filled?'100%':'0%'};"></div>
      </div>`;
    }).join('');
  }

  // Add/Reset btn — hanya hari ini
  const addBtn = $('water-add-btn');
  if(addBtn) addBtn.style.display = isToday ? 'flex' : 'none';

  // Render ML section juga (sync dengan mode aktif)
  if(typeof renderWellnessWater === 'function') renderWellnessWater();

  // Sleep log — filter by date
  renderWellnessSleepLog(d, isToday);
}

function wellnessCupTap(index, date) {
  S.waterLog = S.waterLog || {};
  const current = S.waterLog[date] || 0;
  S.waterLog[date] = index < current ? index : index + 1;
  save();
  loadWellnessDate(_wellnessDate);
  playSound('tick');
}

function toggleCupAdd() {
  // legacy compat
  wellnessCupTap(S.waterLog && S.waterLog[todayStr()] || 0, todayStr());
}

// Override resetWater untuk wellness page
function resetWater() {
  const d = _wellnessDate || todayStr();
  if(d !== todayStr()) return;
  S.waterLog = S.waterLog || {};
  S.waterLog[d] = 0;
  save();
  loadWellnessDate(_wellnessDate);
}

function renderWellnessSleepLog(d, isToday) {
  const el = $('sleep-log-list'); if(!el) return;
  const inputWrap = $('wellness-sleep-input-wrap');
  if(inputWrap) inputWrap.style.display = isToday ? 'block' : 'none';

  const log = S.sleepLog || [];
  const entries = log.filter(l => l.date === d);
  if(!entries.length) {
    el.innerHTML = `<div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);padding:9px;">Belum ada log tidur${isToday ? '.' : ' untuk tanggal ini.'}</div>`;
    return;
  }
  el.innerHTML = entries.map(l => {
    const quality = l.hours >= 8 ? '🟢' : l.hours >= 6 ? '🟡' : '🔴';
    const pct = Math.min(100, Math.round(l.hours / 9 * 100));
    return `<div class="sleep-entry">
      <div style="font-size:9px;color:var(--sub);">🌙 ${l.bed} → ☀️ ${l.wake}</div>
      <div class="sleep-bar-wrap"><div class="sleep-bar-fill" style="width:${pct}%"></div></div>
      <div style="font-family:'Archivo Black',sans-serif;font-size:12px;flex-shrink:0;">${l.hours}h ${quality}</div>
    </div>`;
  }).join('');
}

// ════════════════════════════════════════════════════════════
// NUTRITION — date filter + daily tracker + modal target
// ════════════════════════════════════════════════════════════

function initNutritionPage() {
  _nutrViewDate = null;
  const inp = $('nutr-date-filter');
  if(inp) inp.value = '';
  loadNutrSettingsUI();
  loadNutrDate(null);
}

function loadNutrDate(dateStr) {
  _nutrViewDate = dateStr || null;
  const lblN = $('nutr-date-filter-label');
  if(lblN) lblN.textContent = dateStr ? odpFormatLabel(dateStr) : odpTodayLabel();
  const d = _nutrViewDate || todayStr();
  const isToday = d === todayStr();

  // Date label
  const lbl = $('nutr-viewing-date');
  if(lbl) {
    const dt = new Date(d + 'T12:00:00');
    lbl.textContent = dt.toLocaleDateString('id-ID', {weekday:'long', day:'numeric', month:'long', year:'numeric'});
  }

  // Scan area — hanya hari ini
  const scanWrap = $('nutr-scan-wrap');
  if(scanWrap) scanWrap.style.display = isToday ? 'block' : 'none';

  // Render daily tracker (nutrisi consumed vs target)
  renderNutrDailyTracker(d);

  // Render meal log
  renderNutrMealLog(d);
}

function renderNutrDailyTracker(date) {
  const el = $('nutr-daily-tracker'); if(!el) return;
  const targets = getNutrTargets();
  const log = getNutrLog();
  const meals = log[date] || [];

  if(!meals.length) {
    el.innerHTML = `<div class="analytics-card" style="text-align:center;padding:14px;">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);">Belum ada makanan yang dicatat hari ini.</div>
    </div>`;
    return;
  }

  // Hitung totals
  const keys = ['kcal','protein','carbs','fat','fiber','sugar','sodium'];
  const units = {kcal:'kkal',protein:'g',carbs:'g',fat:'g',fiber:'g',sugar:'g',sodium:'mg'};
  const labels = {kcal:'Kalori',protein:'Protein',carbs:'Karbo',fat:'Lemak',fiber:'Serat',sugar:'Gula',sodium:'Sodium'};
  const colors = {kcal:'#FF6B00',protein:'#00F5D4',carbs:'#FFE600',fat:'#FF3CAC',fiber:'#AAFF00',sugar:'#7B2FBE',sodium:'#0057FF'};

  const totals = {};
  keys.forEach(k => { totals[k] = meals.reduce((s,m) => s+(m[k]||0), 0); });

  const mainKeys = ['kcal','protein','carbs','fat'];
  const miniKeys = ['fiber','sugar','sodium'];

  // Main 4 bars
  const mainBars = mainKeys.map(k => {
    const pct = Math.min(100, Math.round(totals[k]/(targets[k]||1)*100));
    const over = totals[k] > targets[k];
    return `<div style="margin-bottom:8px;">
      <div style="display:flex;justify-content:space-between;font-family:'IBM Plex Mono',monospace;font-size:8px;margin-bottom:3px;">
        <span style="color:${over?'var(--red)':'var(--sub)'};">${labels[k]}</span>
        <span style="color:${over?'var(--red)':'var(--text)'};">${Math.round(totals[k])} / ${targets[k]} ${units[k]}</span>
      </div>
      <div style="height:6px;background:#222;border:1px solid var(--bc);overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:${over?'var(--red)':colors[k]};transition:width .4s;"></div>
      </div>
    </div>`;
  }).join('');

  // Mini 3
  const miniCells = miniKeys.map(k => {
    const pct = Math.min(100, Math.round(totals[k]/(targets[k]||1)*100));
    const over = totals[k] > targets[k];
    return `<div style="flex:1;background:var(--bg);border:var(--bo);padding:6px 8px;">
      <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:${over?'var(--red)':'var(--sub)'};">${labels[k]}</div>
      <div style="font-family:'Archivo Black',sans-serif;font-size:11px;color:${over?'var(--red)':'var(--text)'};">${Math.round(totals[k])}<span style="font-size:7px;font-weight:400;"> ${units[k]}</span></div>
      <div style="height:3px;background:#222;margin-top:3px;"><div style="height:100%;width:${pct}%;background:${over?'var(--red)':colors[k]};"></div></div>
    </div>`;
  }).join('');

  el.innerHTML = `<div class="analytics-card" style="margin-bottom:9px;">
    <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);margin-bottom:9px;text-transform:uppercase;letter-spacing:1px;">Progress Nutrisi Harian</div>
    ${mainBars}
    <div style="display:flex;gap:5px;margin-top:5px;">${miniCells}</div>
  </div>`;
}

function renderNutrMealLog(date) {
  const el = $('nutr-meal-log'); if(!el) return;
  const log = getNutrLog();
  const meals = log[date] || [];
  if(!meals.length) {
    el.innerHTML = `<div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);text-align:center;padding:14px;">Belum ada makanan yang dicatat.</div>`;
    return;
  }
  el.innerHTML = meals.map((m,i) => `
    <div class="nutr-meal-item">
      <div class="nutr-meal-icon">${m.emoji||'🍽️'}</div>
      <div class="nutr-meal-info">
        <div class="nutr-meal-name">${m.name}${m.portion&&m.portion!==1?` <span style="font-size:8px;opacity:.6;">×${m.portion}</span>`:''}</div>
        <div class="nutr-meal-meta">P:${m.protein}g · K:${m.carbs}g · L:${m.fat}g${m.time?' · '+m.time:''}</div>
      </div>
      <div class="nutr-meal-kcal">${m.kcal}<span style="font-family:'IBM Plex Mono',monospace;font-size:7px;font-weight:400;"> kkal</span></div>
      ${date===todayStr()?`<div class="nutr-meal-del" onclick="deleteNutrMeal(${i},'${date}')">×</div>`:''}
    </div>`).join('');
}

function deleteNutrMeal(idx, date) {
  const log = getNutrLog();
  if(!log[date]) return;
  log[date].splice(idx, 1);
  saveNutrLog(log);
  loadNutrDate(_nutrViewDate);
}

// Modal target
function openNutrTargetModal() {
  loadNutrSettingsUI();
  openModal('modal-nutr-target');
}
function closeNutrTargetModal() {
  closeModal('modal-nutr-target');
}

function saveNutrSettings() {
  const targets = {
    kcal:    +($('nset-kcal')?.value   || 2000),
    protein: +($('nset-protein')?.value || 50),
    carbs:   +($('nset-carbs')?.value   || 300),
    fat:     +($('nset-fat')?.value     || 65),
    fiber:   +($('nset-fiber')?.value   || 25),
    sugar:   +($('nset-sugar')?.value   || 50),
    sodium:  +($('nset-sodium')?.value  || 2300),
    waterMl: +($('nset-water-ml')?.value || 2000),
  };
  try { localStorage.setItem('oht_nutr_targets', JSON.stringify(targets)); } catch(e){}
  closeModal('modal-nutr-target');
  loadNutrDate(_nutrViewDate);
  if(typeof initWellnessPage === 'function') initWellnessPage();
  toast('Target disimpan!', 'success');
}

// consumeMeal — setelah consume refresh nutrition page
function consumeMeal() {
  if(!_nutrResult) return;
  const p = _nutrPortion;
  const keys = ['kcal','protein','carbs','fat','fiber','sugar','sodium'];
  const meal = { name: _nutrResult.name, emoji: _nutrResult.emoji||'🍽️', portion: p };
  keys.forEach(k => { meal[k] = Math.round((_nutrResult[k]||0)*p); });
  const now = new Date();
  meal.time = now.getHours().toString().padStart(2,'0')+':'+now.getMinutes().toString().padStart(2,'0');
  const log = getNutrLog();
  const today = todayStr();
  if(!log[today]) log[today] = [];
  log[today].push(meal);
  saveNutrLog(log);
  clearNutrScan();
  toast(`✅ ${meal.emoji} ${meal.name} +${meal.kcal}kkal`, 'success');
  // Refresh nutrition page (tidak pindah ke report)
  loadNutrDate(null);
}

// ════════════════════════════════════════════════════════
// WELLNESS WATER — ML mode + GELAS mode
// ════════════════════════════════════════════════════════

function setWellnessWaterMode(mode) {
  _wellnessWaterMode = mode;
  const tabCups = $('water-tab-cups');
  const tabMl = $('water-tab-ml');
  const secCups = $('water-section-cups');
  const secMl = $('water-section-ml');
  if(tabCups) tabCups.classList.toggle('active', mode === 'cups');
  if(tabMl) tabMl.classList.toggle('active', mode === 'ml');
  if(secCups) secCups.style.display = mode === 'cups' ? 'block' : 'none';
  if(secMl) secMl.style.display = mode === 'ml' ? 'block' : 'none';
  renderWellnessWater();
}

function getWaterMlData() {
  try {
    const raw = localStorage.getItem('oht_water_ml_log');
    return raw ? JSON.parse(raw) : {};
  } catch(e) { return {}; }
}
function saveWaterMlData(log) {
  try { localStorage.setItem('oht_water_ml_log', JSON.stringify(log)); } catch(e) {}
}

function wellnessAddCup() {
  const d = _wellnessDate || todayStr();
  if(d !== todayStr()) return;
  S.waterLog = S.waterLog || {};
  const cur = S.waterLog[d] || 0;
  if(cur >= 12) return;
  S.waterLog[d] = cur + 1;
  save();
  renderWellnessWater();
  playSound('tick');
}

function wellnessAddMl(ml) {
  const d = _wellnessDate || todayStr();
  if(d !== todayStr()) return;
  const log = getWaterMlData();
  log[d] = (log[d] || 0) + ml;
  saveWaterMlData(log);
  renderWellnessWater();
  toast(`+${ml}ml 💧`, 'success');
}

function wellnessAddCustomMl() {
  const inp = $('water-custom-ml');
  const ml = parseInt(inp?.value || 0);
  if(!ml || ml <= 0) { toast('Masukkan jumlah ml', 'error'); return; }
  wellnessAddMl(ml);
  if(inp) inp.value = '';
}

function renderWellnessWater() {
  const d = _wellnessDate || todayStr();
  const isToday = d === todayStr();
  const targets = getNutrTargets();
  const waterMlTarget = targets.waterMl || 2000;

  if(_wellnessWaterMode === 'cups') {
    S.waterLog = S.waterLog || {};
    const wCount = S.waterLog[d] || 0;
    const countEl = $('water-count'); if(countEl) countEl.textContent = wCount;
    const msgs = ['Mulai minum! 💧','Bagus! 💧','Seperempat! 💧','Setengah! 🌊','Hampir! 🌊','Sebentar lagi! 🌊','Hampir penuh! 💦','Satu lagi! 💦','🏆 Terhidrasi!'];
    const msgEl = $('water-msg'); if(msgEl) msgEl.textContent = msgs[Math.min(wCount, 8)];
    const cups = $('water-cups');
    if(cups) {
      cups.innerHTML = Array.from({length: 8}, (_, i) => {
        const filled = i < wCount;
        return `<div class="water-cup ${filled?'full':''}" ${isToday?`onclick="wellnessCupTap(${i},'${d}')"`:'style="cursor:default;"'}>
          <div class="water-cup-fill" style="height:${filled?'100%':'0%'};"></div>
        </div>`;
      }).join('');
    }
    const addBtn = $('water-add-btn');
    if(addBtn) addBtn.style.display = isToday ? '' : 'none';
  } else {
    // ML mode
    const log = getWaterMlData();
    const total = log[d] || 0;
    const pct = Math.min(100, Math.round(total / waterMlTarget * 100));
    const totalEl = $('water-ml-total'); if(totalEl) totalEl.textContent = total;
    const targetLbl = $('water-ml-target-lbl'); if(targetLbl) targetLbl.textContent = waterMlTarget;
    const bar = $('water-ml-bar'); if(bar) bar.style.width = pct + '%';
    const pctLbl = $('water-ml-pct-lbl');
    if(pctLbl) pctLbl.textContent = `${pct}% dari target ${waterMlTarget}ml`;
    // Sembunyikan input kalau bukan hari ini
    const customRow = $('water-custom-ml');
    if(customRow) customRow.parentElement.style.display = isToday ? 'flex' : 'none';
  }
}

// Override resetWater untuk wellness
function resetWater() {
  const d = _wellnessDate || todayStr();
  if(d !== todayStr()) return;
  if(_wellnessWaterMode === 'cups') {
    S.waterLog = S.waterLog || {};
    S.waterLog[d] = 0;
    save();
  } else {
    const log = getWaterMlData();
    log[d] = 0;
    saveWaterMlData(log);
  }
  renderWellnessWater();
}

// Override initWellnessPage untuk include water mode

// initWellnessPage override removed

function saveWellnessConfig(cfg) {
  try { localStorage.setItem('oht_wellness_config', JSON.stringify(cfg)); } catch(e) {}
}
function getWellnessStreaks() {
  try {
    const raw = localStorage.getItem('oht_wellness_streaks');
    return raw ? JSON.parse(raw) : {waterStreak:0, waterBest:0, sleepStreak:0, sleepBest:0, waterLastDate:'', sleepLastDate:''};
  } catch(e) { return {waterStreak:0, waterBest:0, sleepStreak:0, sleepBest:0, waterLastDate:'', sleepLastDate:''}; }
}
function saveWellnessStreaks(ws) {
  try { localStorage.setItem('oht_wellness_streaks', JSON.stringify(ws)); } catch(e) {}
}

// ── Modal: Water Target ──
function openWaterTargetModal() {
  const cfg = getWellnessConfig();
  // Set UI values
  const modeEl = cfg.waterMode === 'ml' ? $('wt-mode-ml') : $('wt-mode-cups');
  if(modeEl) setWaterTargetMode(cfg.waterMode, modeEl);
  const cupsInp = $('wt-cups-val'); if(cupsInp) cupsInp.value = cfg.waterCups;
  const mlInp = $('wt-ml-val'); if(mlInp) mlInp.value = cfg.waterMl;
  openModal('modal-water-target');
}
function setWaterTargetMode(mode, el) {
  document.querySelectorAll('[id^="wt-mode-"]').forEach(b => b.classList.remove('active'));
  if(el) el.classList.add('active');
  const cupsRow = $('wt-cups-row'); if(cupsRow) cupsRow.style.display = mode === 'cups' ? 'block' : 'none';
  const mlRow = $('wt-ml-row'); if(mlRow) mlRow.style.display = mode === 'ml' ? 'block' : 'none';
}
function saveWaterTarget() {
  const cfg = getWellnessConfig();
  const modeCups = $('wt-mode-cups')?.classList.contains('active');
  cfg.waterMode = modeCups ? 'cups' : 'ml';
  cfg.waterCups = parseInt($('wt-cups-val')?.value || 8);
  cfg.waterMl   = parseInt($('wt-ml-val')?.value   || 2000);
  saveWellnessConfig(cfg);
  // Sync wellness water mode
  setWellnessWaterMode(cfg.waterMode);
  closeModal('modal-water-target');
  renderWellnessWater();
  renderWaterTargetStrip();
  toast('Target air disimpan! 💧', 'success');
}

// ── Modal: Sleep Target ──
function openSleepTargetModal() {
  const cfg = getWellnessConfig();
  const inp = $('sleep-target-hours'); if(inp) inp.value = cfg.sleepHours;
  openModal('modal-sleep-target');
}
function saveSleepTarget() {
  const cfg = getWellnessConfig();
  cfg.sleepHours = parseFloat($('sleep-target-hours')?.value || 7);
  saveWellnessConfig(cfg);
  closeModal('modal-sleep-target');
  renderSleepTargetStrip();
  toast(`Target tidur: ${cfg.sleepHours} jam 😴`, 'success');
}

// ── Strip info target (tampil di bawah header) ──
function renderWaterTargetStrip() {
  const el = $('water-target-strip'); if(!el) return;
  const cfg = getWellnessConfig();
  const ws = getWellnessStreaks();
  const mode = cfg.waterMode === 'ml' ? `${cfg.waterMl}ml` : `${cfg.waterCups} gelas`;
  const streak = ws.waterStreak || 0;
  const streakBadge = streak > 0 ? ` · 🔥 ${streak} hari berturut` : '';
  el.innerHTML = `Target: <strong style="color:var(--yellow);">${mode}/hari</strong>${streakBadge} · Best: ${ws.waterBest||0} hari`;
}

function renderSleepTargetStrip() {
  const el = $('sleep-target-strip'); if(!el) return;
  const cfg = getWellnessConfig();
  const ws = getWellnessStreaks();
  const streak = ws.sleepStreak || 0;
  const streakBadge = streak > 0 ? ` · 🔥 ${streak} hari berturut` : '';
  el.innerHTML = `Target: <strong style="color:var(--yellow);">${cfg.sleepHours} jam/malam</strong>${streakBadge} · Best: ${ws.sleepBest||0} hari`;
}

// ── logSleepWellness — menggantikan logSleep, dengan XP + streak check ──
function logSleepWellness() {
  const bed  = $('sleep-bed')?.value;
  const wake = $('sleep-wake')?.value;
  if(!bed || !wake) { toast('Isi waktu tidur dan bangun!', 'error'); return; }

  const [bh, bm] = bed.split(':').map(Number);
  const [wh, wm] = wake.split(':').map(Number);
  let dur = (wh * 60 + wm) - (bh * 60 + bm);
  if(dur < 0) dur += 24 * 60;
  const hrs = parseFloat((dur / 60).toFixed(1));

  S.sleepLog = S.sleepLog || [];
  S.sleepLog.unshift({ date: todayStr(), bed, wake, hours: hrs });
  if(S.sleepLog.length > 60) S.sleepLog = S.sleepLog.slice(0, 60);
  save();

  // XP + streak check
  const cfg = getWellnessConfig();
  const ws = getWellnessStreaks();
  const target = cfg.sleepHours || 7;

  if(hrs >= target) {
    // XP
    let xp = 25;
    // Streak update
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const yd = yesterday.getFullYear()+'-'+String(yesterday.getMonth()+1).padStart(2,'0')+'-'+String(yesterday.getDate()).padStart(2,'0');
    if(ws.sleepLastDate === yd || ws.sleepLastDate === todayStr()) {
      if(ws.sleepLastDate !== todayStr()) ws.sleepStreak = (ws.sleepStreak||0) + 1;
    } else {
      ws.sleepStreak = 1;
    }
    ws.sleepLastDate = todayStr();
    ws.sleepBest = Math.max(ws.sleepBest||0, ws.sleepStreak);
    // Streak bonus XP
    if(ws.sleepStreak % 7 === 0) xp += 50;
    saveWellnessStreaks(ws);
    S.xp = (S.xp||0) + xp; save();
    if(typeof awardWellnessXP==='function') awardWellnessXP('sleep');
  else toast(`😴 ${hrs}h logged! Target tercapai! +20 XP 🎉`, 'success');
    if(ws.sleepStreak % 7 === 0) confetti(30);
  } else {
    ws.sleepStreak = 0; ws.sleepLastDate = todayStr();
    saveWellnessStreaks(ws);
    toast(`😴 ${hrs}h logged (target ${target}h belum tercapai)`, 'info');
  }

  renderSleepTargetStrip();
  renderWellnessSleepLog(_wellnessDate || todayStr(), true);
  renderWellnessStreakCards();
  if(typeof renderStats === 'function') renderStats();
}

// ── Check water target setiap kali update (dipanggil dari renderWellnessWater) ──
function checkWaterTargetMet() {
  const d = todayStr();
  const cfg = getWellnessConfig();
  const ws = getWellnessStreaks();
  if(ws.waterLastDate === d) return; // sudah dicek hari ini

  let met = false;
  if(cfg.waterMode === 'cups') {
    S.waterLog = S.waterLog || {};
    const count = S.waterLog[d] || 0;
    met = count >= (cfg.waterCups || 8);
  } else {
    const log = getWaterMlData();
    const total = log[d] || 0;
    met = total >= (cfg.waterMl || 2000);
  }

  if(met) {
    let xp = 20;
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate()-1);
    const yd = yesterday.getFullYear()+'-'+String(yesterday.getMonth()+1).padStart(2,'0')+'-'+String(yesterday.getDate()).padStart(2,'0');
    if(ws.waterLastDate === yd) {
      ws.waterStreak = (ws.waterStreak||0) + 1;
    } else if(ws.waterLastDate !== d) {
      ws.waterStreak = 1;
    }
    ws.waterLastDate = d;
    ws.waterBest = Math.max(ws.waterBest||0, ws.waterStreak);
    if(ws.waterStreak % 7 === 0) { xp += 35; confetti(20); }
    saveWellnessStreaks(ws);
    S.xp = (S.xp||0) + xp; save();
    if(typeof awardWellnessXP!=='function') toast(`💧 Target air tercapai! +${xp} XP`, 'success');
    else awardWellnessXP('water');
    renderWaterTargetStrip();
    renderWellnessStreakCards();
    if(typeof renderStats === 'function') renderStats();
  }
}

// ── Render streak cards di Streaks page ──
function renderWellnessStreakCards() {
  const ws = getWellnessStreaks();
  const cfg = getWellnessConfig();

  // Water streak card
  const wCard = $('wellness-water-streak-card');
  if(wCard) {
    const s = ws.waterStreak || 0;
    const best = ws.waterBest || 0;
    const badge = s >= 30 ? '🏆 LEGENDARY' : s >= 14 ? '⚡ ON FIRE' : s >= 7 ? '🔥 HOT' : s >= 3 ? '✨ WARMING' : '🌱 STARTING';
    const targetLabel = cfg.waterMode === 'ml' ? `${cfg.waterMl}ml/hari` : `${cfg.waterCups} gelas/hari`;
    wCard.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="font-size:36px;">💧</div>
        <div style="flex:1;">
          <div style="font-family:'Archivo Black',sans-serif;font-size:28px;color:var(--yellow);">${s}</div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);">HARI BERTURUT-TURUT</div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);margin-top:2px;">Target: ${targetLabel} · Best: ${best} hari</div>
        </div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--yellow);text-align:right;">${badge}</div>
      </div>`;
  }

  // Sleep streak card
  const sCard = $('wellness-sleep-streak-card');
  if(sCard) {
    const s = ws.sleepStreak || 0;
    const best = ws.sleepBest || 0;
    const badge = s >= 30 ? '🏆 LEGENDARY' : s >= 14 ? '⚡ ON FIRE' : s >= 7 ? '🔥 HOT' : s >= 3 ? '✨ WARMING' : '🌱 STARTING';
    sCard.innerHTML = `
      <div style="display:flex;align-items:center;gap:14px;">
        <div style="font-size:36px;">😴</div>
        <div style="flex:1;">
          <div style="font-family:'Archivo Black',sans-serif;font-size:28px;color:var(--yellow);">${s}</div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);">HARI BERTURUT-TURUT</div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);margin-top:2px;">Target: ≥${cfg.sleepHours}h/malam · Best: ${best} hari</div>
        </div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--yellow);text-align:right;">${badge}</div>
      </div>`;
  }
}

// ── Hook setStreaksTab untuk wellness ──

// setStreaksTab override removed


// ── Override initWellnessPage final version ──
// initWellnessPage (duplicate removed)


// ── Override renderWellnessWater to also check target ──
function renderWellnessWater() {
  const cfg = getWellnessConfig();
  const d = _wellnessDate || todayStr();
  const isToday = d === todayStr();

  // Update target label di ML mode
  const mlTargetLbl = $('water-ml-target-lbl');
  if(mlTargetLbl) mlTargetLbl.textContent = cfg.waterMl || 2000;

  if(_wellnessWaterMode === 'cups') {
    S.waterLog = S.waterLog || {};
    const wCount = S.waterLog[d] || 0;
    const target = cfg.waterCups || 8;
    const countEl = $('water-count'); if(countEl) countEl.textContent = wCount;
    const msgs = ['Mulai minum! 💧','Bagus! 💧','Seperempat! 💧','Setengah! 🌊','Hampir! 🌊','Sebentar lagi! 🌊','Hampir penuh! 💦','Satu lagi! 💦','🏆 Terhidrasi!'];
    const msgEl = $('water-msg'); if(msgEl) msgEl.textContent = msgs[Math.min(wCount, target)];
    const cups = $('water-cups');
    if(cups) {
      cups.innerHTML = Array.from({length: target}, (_, i) => {
        const filled = i < wCount;
        return `<div class="water-cup ${filled?'full':''}" ${isToday?`onclick="wellnessCupTap(${i},'${d}')"`:'style="cursor:default;"'}>
          <div class="water-cup-fill" style="height:${filled?'100%':'0%'};"></div>
        </div>`;
      }).join('');
    }
    // Update count label dengan target custom
    const countSpan = document.querySelector('#water-section-cups span[style*="sub"]');
    if(countSpan) countSpan.textContent = ` / ${target} gelas`;
  } else {
    const log = getWaterMlData();
    const total = log[d] || 0;
    const target = cfg.waterMl || 2000;
    const pct = Math.min(100, Math.round(total / target * 100));
    const totalEl = $('water-ml-total'); if(totalEl) totalEl.textContent = total;
    if(mlTargetLbl) mlTargetLbl.textContent = target;
    const bar = $('water-ml-bar'); if(bar) bar.style.width = pct + '%';
    const pctLbl = $('water-ml-pct-lbl');
    if(pctLbl) pctLbl.textContent = `${pct}% dari target ${target}ml`;
    // Sembunyikan input kalau bukan hari ini
    const customRow = $('water-custom-ml');
    if(customRow) {
      const parent = customRow.closest('div[style*="display:flex"]') || customRow.parentElement;
      if(parent) parent.style.display = isToday ? 'flex' : 'none';
    }
    // Quick add buttons juga
    const quickBtns = document.querySelectorAll('#water-section-ml .btn-primary');
    quickBtns.forEach(b => b.style.display = isToday ? '' : 'none');
  }

  const addBtn = $('water-add-btn');
  if(addBtn) addBtn.style.display = (isToday && _wellnessWaterMode==='cups') ? '' : 'none';

  // Check target met hanya hari ini
  if(isToday) setTimeout(checkWaterTargetMet, 100);
}

// ── Garden date filter ──
function loadGardenDate(dateStr) {
  _gardenViewDate = dateStr || null;
  const lblG = $('garden-date-filter-label');
  if(lblG) lblG.textContent = dateStr ? odpFormatLabel(dateStr) : odpTodayLabel();
  const d = _gardenViewDate || todayStr();
  const lbl = $('garden-viewing-date');
  if(lbl) {
    const dt = new Date(d+'T12:00:00');
    lbl.textContent = dt.toLocaleDateString('id-ID',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
  }
  if(typeof renderGarden==='function') renderGarden(_gardenViewDate);
}

// ════════════════════════════════════════════════════════════
// CUSTOM DATE PICKER
// ════════════════════════════════════════════════════════════
let _odpTarget   = null;
let _odpCallback = null;
let _odpYear     = 0;
let _odpMonth    = 0;
let _odpSelected = null;

const ODP_MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const ODP_DAYS   = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

// Format tanggal untuk label tombol
function odpFormatLabel(dateStr) {
  if(!dateStr) return odpTodayLabel();
  const today = todayStr();
  if(dateStr === today) return odpTodayLabel();
  const dt = new Date(dateStr + 'T12:00:00');
  const day = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'][dt.getDay()];
  return `${day}, ${dt.getDate()} ${ODP_MONTHS[dt.getMonth()].slice(0,3)} ${dt.getFullYear()}`;
}

function odpTodayLabel() {
  const now = new Date();
  const day = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'][now.getDay()];
  return `${day}, ${now.getDate()} ${ODP_MONTHS[now.getMonth()].slice(0,3)} ${now.getFullYear()}`;
}

// Inisialisasi semua label tombol ke "Hari ini" saat load
function initAllDateFilterLabels() {
  const ids = ['report-date-filter','wellness-date-filter','nutr-date-filter','journal-date-filter','garden-date-filter'];
  ids.forEach(id => {
    const lbl = $(id + '-label');
    if(lbl) lbl.textContent = odpTodayLabel();
  });
}

function openDatePicker(targetId, callbackFn) {
  _odpTarget   = targetId;
  _odpCallback = callbackFn;

  const now = new Date();
  // Kalau ada tanggal terpilih, buka bulan itu
  if(_odpSelected && _odpTarget === targetId) {
    const d = new Date(_odpSelected + 'T12:00:00');
    _odpYear  = d.getFullYear();
    _odpMonth = d.getMonth();
  } else {
    _odpYear  = now.getFullYear();
    _odpMonth = now.getMonth();
  }

  const popup   = $('oht-datepicker-popup');
  const overlay = $('oht-datepicker-overlay');
  if(!popup) return;

  // Posisi: di bawah/atas tombol
  const btn = document.querySelector(`#wrap-${targetId} button`);
  popup.style.display   = 'block';
  overlay.style.display = 'block';

  if(btn) {
    const rect     = btn.getBoundingClientRect();
    const popupH   = 300;
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const top = spaceBelow >= popupH
      ? rect.bottom + 6
      : Math.max(8, rect.top - popupH - 6);
    const left = Math.min(Math.max(8, rect.left), window.innerWidth - 272);
    popup.style.top  = top  + 'px';
    popup.style.left = left + 'px';
  }

  buildDatePickerGrid();
}

function closeDatePicker() {
  const p = $('oht-datepicker-popup');
  const o = $('oht-datepicker-overlay');
  if(p) p.style.display = 'none';
  if(o) o.style.display = 'none';
}

function odpNav(dir) {
  _odpMonth += dir;
  if(_odpMonth < 0)  { _odpMonth = 11; _odpYear--; }
  if(_odpMonth > 11) { _odpMonth = 0;  _odpYear++; }
  buildDatePickerGrid();
}

function buildDatePickerGrid() {
  const monthLbl = $('odp-month-label');
  if(monthLbl) monthLbl.textContent = `${ODP_MONTHS[_odpMonth]} ${_odpYear}`;

  const grid = $('odp-days-grid');
  if(!grid) return;

  const today    = todayStr();
  const firstDay = new Date(_odpYear, _odpMonth, 1).getDay(); // 0=Sun
  const daysInMonth = new Date(_odpYear, _odpMonth + 1, 0).getDate();
  const daysInPrev  = new Date(_odpYear, _odpMonth, 0).getDate();

  // Header hari (Min Sen Sel ...)
  let html = ODP_DAYS.map(d => `<div class="odp-dow">${d}</div>`).join('');

  // Pad kiri dari bulan sebelumnya
  for(let i = firstDay - 1; i >= 0; i--) {
    html += `<div class="odp-day other-month">${daysInPrev - i}</div>`;
  }

  // Hari bulan ini
  for(let d = 1; d <= daysInMonth; d++) {
    const ds = `${_odpYear}-${String(_odpMonth+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const isToday = ds === today;
    const isSel   = ds === _odpSelected;
    html += `<div class="odp-day${isToday?' today':''}${isSel?' selected':''}" onclick="odpSelect('${ds}')">${d}</div>`;
  }

  // Pad kanan
  const total    = Math.ceil((firstDay + daysInMonth) / 7) * 7;
  const trailing = total - firstDay - daysInMonth;
  for(let d = 1; d <= trailing; d++) {
    html += `<div class="odp-day other-month">${d}</div>`;
  }

  grid.innerHTML = html;
}

function odpSelect(dateStr) {
  _odpSelected = dateStr;
  // Update label tombol
  const lbl = $(_odpTarget + '-label');
  if(lbl) lbl.textContent = odpFormatLabel(dateStr);
  // Callback
  if(_odpCallback && typeof window[_odpCallback] === 'function') {
    window[_odpCallback](dateStr);
  }
  closeDatePicker();
}

function odpToday() {
  _odpSelected = null;
  const today = todayStr();
  // Update label
  const lbl = $(_odpTarget + '-label');
  if(lbl) lbl.textContent = odpTodayLabel();
  // Callback dengan string kosong = hari ini
  if(_odpCallback && typeof window[_odpCallback] === 'function') {
    window[_odpCallback]('');
  }
  closeDatePicker();
}

function odpClear() {
  odpToday();
}


// ════════════════════════════════════════════════════════════
// GARDEN FARMING — Organic Canvas Scene v3
// ════════════════════════════════════════════════════════════

const GDN_PLANTS = [
  { id:'daisy',     name:'Bunga Daisy',    price:1, waterNeeded:3, maxStage:3,
    harvestXp:15,  harvestHours:2,  harvestEmoji:'🌸',
    stages:['🌱','🌿','🌼'], colors:['#4a7','#3a6','#ffe135'] },
  { id:'sunflower', name:'Bunga Matahari', price:2, waterNeeded:4, maxStage:4,
    harvestXp:25,  harvestHours:4,  harvestEmoji:'🌻',
    stages:['🌱','🌿','🌾','🌻'], colors:['#4a7','#3a6','#c8a','#ffd700'] },
  { id:'rose',      name:'Mawar Merah',    price:2, waterNeeded:5, maxStage:4,
    harvestXp:30,  harvestHours:6,  harvestEmoji:'🌹',
    stages:['🌱','🌿','🥀','🌹'], colors:['#4a7','#3a6','#844','#e83'] },
  { id:'bamboo',    name:'Bambu',          price:3, waterNeeded:6, maxStage:5,
    harvestXp:50,  harvestHours:10, harvestEmoji:'🎋',
    stages:['🌱','🌿','🪴','🎍','🎋'], colors:['#4a7','#3a6','#3a6','#2a5','#1a4'] },
  { id:'cactus',    name:'Kaktus Emas',    price:3, waterNeeded:2, maxStage:3,
    harvestXp:45,  harvestHours:8,  harvestEmoji:'🌵',
    stages:['🌱','🌵','🌵'], colors:['#4a7','#2a5','#3d7'] },
];

const GDN_BACKGROUNDS = [
  { id:'default', name:'Lahan Biasa',   price:0, skyTop:'#1a2d4a', skyBot:'#2d4a6a', groundTop:'#3d2b1f', groundBot:'#2a1d12', grassColor:'#2d5a1a' },
  { id:'sunset',  name:'Senja Emas',    price:2, skyTop:'#c44a00', skyBot:'#8b1a00', groundTop:'#3d2000', groundBot:'#1a0d00', grassColor:'#4a3000' },
  { id:'night',   name:'Malam Bintang', price:2, skyTop:'#050b1a', skyBot:'#0a1428', groundTop:'#1a1a2e', groundBot:'#0d0d1e', grassColor:'#1a2a0a' },
  { id:'spring',  name:'Musim Semi',    price:3, skyTop:'#87d4ef', skyBot:'#b8eecc', groundTop:'#3d5a1a', groundBot:'#2a3d12', grassColor:'#4a8a2a' },
  { id:'aurora',  name:'Aurora',        price:4, skyTop:'#0a1a0f', skyBot:'#1a0a2f', groundTop:'#0d1a0d', groundBot:'#060d06', grassColor:'#1a4a1a' },
];

// Storage
function getGardenData() {
  try { const r = localStorage.getItem('oht_gdn3'); if(r) return JSON.parse(r); } catch(e){}
  return {
    coins:0, waterCount:0, hoeCount:3, hoeLastRegen:Date.now(),
    currentLand:0,
    lands:[
      { id:0, bgId:'default', unlocked:true,  plots:Array(16).fill(null).map((_,i)=>makePlot(i)) },
      { id:1, bgId:'default', unlocked:false, plots:Array(16).fill(null).map((_,i)=>makePlot(i)) },
      { id:2, bgId:'default', unlocked:false, plots:Array(16).fill(null).map((_,i)=>makePlot(i)) },
    ],
    ownedBgs:['default'], inventory:[],
  };
}
function makePlot(i) { return {idx:i, plant:null, stage:0, water:0, wilted:false, plantedAt:null, lastWatered:null}; }
function saveGardenData(g) { try { localStorage.setItem('oht_gdn3', JSON.stringify(g)); } catch(e){} }

let _gdnCurrentLand = 0;
let _gdnTool = null;       // 'water' | 'hoe' | null
let _gdnSeedMode = null;   // plantId to plant
let _gdnTooltip = null;    // current tooltip element
let _gdnShopTab = 'seeds';
let _gdnRafId = null;

// ── Hoe regen + wilt ──────────────────────────────────────
function gdnMaintenance(g) {
  const now = Date.now();
  const elapsed = now - (g.hoeLastRegen||now);
  const regens = Math.floor(elapsed / 86400000);
  if(regens>0){ g.hoeCount=Math.min(5,(g.hoeCount||0)+regens); g.hoeLastRegen+=regens*86400000; }
  g.lands.forEach(land=>{ if(!land.unlocked) return;
    land.plots.forEach(p=>{ if(!p.plant||p.wilted) return;
      if(p.lastWatered && (now-p.lastWatered)>=86400000) p.wilted=true;
      // Set harvest timer saat full grown
      if(typeof setHarvestTimer==='function') setHarvestTimer(p);
    }); });
  return g;
}

// ── Canvas renderer ───────────────────────────────────────
function getPlotLayout(canvasW, canvasH) {
  // 4 cols × 4 rows, arranged naturally on ground half
  const cols=4, rows=4, total=16;
  const groundY = canvasH * 0.52; // where ground starts
  const padX = canvasW * 0.06;
  const usableW = canvasW - padX*2;
  const usableH = canvasH - groundY - 20;
  const cellW = usableW / cols;
  const cellH = usableH / rows;
  return Array.from({length:total},(_,i)=>{
    const col=i%cols, row=Math.floor(i/cols);
    return {
      x: padX + col*cellW + cellW*0.5,
      y: groundY + 20 + row*cellH + cellH*0.75,
      w: cellW * 0.82,
      h: cellH * 0.7,
      hitX: padX + col*cellW, hitY: groundY + row*cellH,
      hitW: cellW, hitH: cellH
    };
  });
}

function drawGardenScene(canvas, land, bgDef) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  // Sky gradient
  const sky = ctx.createLinearGradient(0,0,0,H*0.55);
  sky.addColorStop(0, bgDef.skyTop);
  sky.addColorStop(1, bgDef.skyBot);
  ctx.fillStyle = sky;
  ctx.fillRect(0,0,W,H);

  // Stars (night only)
  if(bgDef.id==='night'||bgDef.id==='aurora') {
    ctx.fillStyle='rgba(255,255,255,.7)';
    for(let s=0;s<60;s++){
      const sx=(s*137.508)%W, sy=(s*73.1)%(H*0.45);
      ctx.fillRect(sx,sy,1,1);
    }
  }

  // Aurora effect
  if(bgDef.id==='aurora') {
    const t = Date.now()/4000;
    for(let a=0;a<3;a++){
      const ag=ctx.createLinearGradient(0,H*0.1,0,H*0.5);
      const hue=[120,160,200][a];
      ag.addColorStop(0,'transparent');
      ag.addColorStop(0.5,`hsla(${hue+Math.sin(t+a)*20},100%,50%,.12)`);
      ag.addColorStop(1,'transparent');
      ctx.fillStyle=ag;
      ctx.beginPath();
      ctx.moveTo(0,H*0.15);
      for(let x=0;x<=W;x+=30){
        ctx.lineTo(x, H*0.2+Math.sin(x/80+t+a)*H*0.08);
      }
      ctx.lineTo(W,0); ctx.lineTo(0,0); ctx.closePath();
      ctx.fill();
    }
  }

  // Celestial body (sun/moon)
  const now2=new Date(); const h=now2.getHours()+now2.getMinutes()/60;
  const isDaytime = h>=6&&h<18;
  if(isDaytime) {
    const t=(h-6)/12;
    const cx=W*0.1+W*0.8*t, cy=H*0.45-Math.sin(Math.PI*t)*H*0.35;
    // Sun glow
    const grd=ctx.createRadialGradient(cx,cy,0,cx,cy,55);
    grd.addColorStop(0,'rgba(255,220,60,.35)');
    grd.addColorStop(1,'transparent');
    ctx.fillStyle=grd; ctx.beginPath(); ctx.arc(cx,cy,55,0,Math.PI*2); ctx.fill();
    // Sun body
    ctx.fillStyle='#ffd700'; ctx.beginPath(); ctx.arc(cx,cy,16,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(255,255,200,.6)'; ctx.beginPath(); ctx.arc(cx,cy,10,0,Math.PI*2); ctx.fill();
  } else {
    const tM=h>=18?(h-18)/12:(h+6)/12;
    const mx=W*0.1+W*0.8*tM, my=H*0.42-Math.sin(Math.PI*tM)*H*0.32;
    const mgrd=ctx.createRadialGradient(mx,my,0,mx,my,35);
    mgrd.addColorStop(0,'rgba(200,210,255,.25)');
    mgrd.addColorStop(1,'transparent');
    ctx.fillStyle=mgrd; ctx.beginPath(); ctx.arc(mx,my,35,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#ccd5ff'; ctx.beginPath(); ctx.arc(mx,my,12,0,Math.PI*2); ctx.fill();
    // Crater
    ctx.fillStyle='rgba(0,0,0,.15)'; ctx.beginPath(); ctx.arc(mx+4,my-2,4,0,Math.PI*2); ctx.fill();
  }

  // Ground
  const groundY = H*0.52;
  const gnd=ctx.createLinearGradient(0,groundY,0,H);
  gnd.addColorStop(0,bgDef.groundTop);
  gnd.addColorStop(1,bgDef.groundBot);
  ctx.fillStyle=gnd; ctx.fillRect(0,groundY,W,H-groundY);

  // Ground texture — subtle dirt lines
  ctx.strokeStyle='rgba(0,0,0,.15)'; ctx.lineWidth=1;
  for(let y=groundY+8;y<H;y+=16){
    ctx.beginPath(); ctx.moveTo(0,y);
    for(let x=0;x<=W;x+=20) ctx.lineTo(x,y+(Math.sin(x*0.3+y*0.1))*2);
    ctx.stroke();
  }

  // Grass strip at ground edge
  const grassC = bgDef.grassColor;
  ctx.fillStyle=grassC;
  for(let x=0;x<W;x+=8){
    const gh=6+Math.sin(x*0.7)*3;
    ctx.fillRect(x,groundY-gh,3,gh+4);
  }
  // Solid grass base
  ctx.fillStyle=grassC;
  ctx.fillRect(0,groundY,W,6);

  // Plot dig marks (darker soil patches)
  const layout = getPlotLayout(W,H);
  layout.forEach((p,i)=>{
    const plot=land.plots[i];
    // Soil patch
    ctx.fillStyle=plot.wilted?'rgba(80,20,0,.5)':'rgba(0,0,0,.35)';
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.w*0.48, p.h*0.22, 0, 0, Math.PI*2);
    ctx.fill();
    // Tilled soil detail
    ctx.strokeStyle='rgba(0,0,0,.2)'; ctx.lineWidth=1;
    for(let l=-1;l<=1;l++){
      ctx.beginPath();
      ctx.ellipse(p.x, p.y+l*4, p.w*0.4, p.h*0.12, 0, 0, Math.PI*2);
      ctx.stroke();
    }
  });

  // Plants
  layout.forEach((pos,i)=>{
    const plot = land.plots[i];
    if(!plot.plant) return;
    const pdef = GDN_PLANTS.find(p=>p.id===plot.plant);
    if(!pdef) return;
    const stageIdx = Math.min(plot.stage, pdef.stages.length-1);
    const emoji = pdef.stages[stageIdx];
    const size = [18,26,34,44,56][stageIdx] || 34;
    // Wilt effect
    if(plot.wilted) ctx.globalAlpha=0.4;
    // Draw emoji as plant
    ctx.font=`${size}px serif`;
    ctx.textAlign='center';
    ctx.textBaseline='bottom';
    // Gentle sway animation
    const sway = Math.sin(Date.now()/1200+i)*1.5;
    ctx.save();
    ctx.translate(pos.x, pos.y-pos.h*0.25);
    ctx.rotate(sway*Math.PI/180);
    ctx.fillText(emoji,0,0);
    ctx.restore();
    ctx.globalAlpha=1;
    // Water droplet indicator
    if(plot.water>0&&!plot.wilted){
      ctx.font='10px serif'; ctx.textAlign='left';
      ctx.fillText('💧',pos.x+size*0.4,pos.y-pos.h*0.55);
    }
    if(plot.wilted){
      ctx.font='10px serif'; ctx.textAlign='center';
      ctx.fillText('⚠️',pos.x,pos.y-size*0.5-5);
    }
  });

  // Harvest-ready indicator (inline)
  if(land.unlocked) {
    layout.forEach((pos, i) => {
      const plot = land.plots[i]; if(!plot || !plot.plant) return;
      const pd2 = GDN_PLANTS.find(p => p.id === plot.plant);
      if(typeof checkHarvestReady === 'function' && checkHarvestReady(plot)) {
        const pulse2 = 0.7 + Math.sin(Date.now() / 300) * 0.3;
        ctx.globalAlpha = pulse2;
        ctx.font='15px serif'; ctx.textAlign='center';
        ctx.fillText('🧺', pos.x, pos.y - pos.h * 0.8);
        ctx.font='bold 7px "IBM Plex Mono",monospace';
        ctx.fillStyle='#FFE600';
        ctx.fillText('PANEN!', pos.x, pos.y - pos.h * 0.6);
        ctx.globalAlpha = 1;
      } else if(plot.readyAt && plot.stage >= (pd2?.maxStage||3)-1) {
        const rem2 = Math.ceil((plot.readyAt - Date.now()) / 3600000);
        if(rem2 > 0) {
          ctx.font='7px "IBM Plex Mono",monospace'; ctx.textAlign='center';
          ctx.fillStyle='rgba(255,255,200,0.75)'; ctx.globalAlpha=0.9;
          ctx.fillText(`⏱${rem2}j`, pos.x, pos.y - pos.h*0.6);
          ctx.globalAlpha=1;
        }
      }
    });
  }

  // Locked overlay
  if(!land.unlocked){
    ctx.fillStyle='rgba(0,0,0,.65)';
    ctx.fillRect(0,groundY,W,H-groundY);
    ctx.fillStyle='#fff'; ctx.font='bold 36px serif'; ctx.textAlign='center';
    ctx.fillText('🔒',W/2,groundY+(H-groundY)*0.4);
    ctx.fillStyle='rgba(255,204,0,.9)';
    ctx.font='bold 13px "Archivo Black",sans-serif';
    ctx.fillText('BELI 5🪙 DI SHOP',W/2,groundY+(H-groundY)*0.58);
  }
}

// ── Main render ────────────────────────────────────────────
function renderGardenFull() {
  let g = getGardenData();
  g = gdnMaintenance(g);
  saveGardenData(g);

  // HUD
  if($('gdn-coins')) $('gdn-coins').textContent=g.coins||0;
  if($('gdn-water-count')) $('gdn-water-count').textContent=g.waterCount||0;
  if($('gdn-hoe-count')) $('gdn-hoe-count').textContent=g.hoeCount||0;

  const slider = $('gdn-lands-slider');
  const dots   = $('gdn-land-dots');
  if(!slider) return;

  // Build land scenes
  slider.innerHTML = g.lands.map((land,li)=>{
    return `<div class="gdn-land-scene" id="gdn-scene-${li}">
      <canvas class="gdn-land-canvas" id="gdn-canvas-${li}"></canvas>
    </div>`;
  }).join('');

  // Draw each canvas
  g.lands.forEach((land,li)=>{
    const canvas = $(`gdn-canvas-${li}`);
    if(!canvas) return;
    const scene = $(`gdn-scene-${li}`);
    canvas.width  = scene.offsetWidth  || window.innerWidth;
    canvas.height = scene.offsetHeight || 420;
    const bgDef = GDN_BACKGROUNDS.find(b=>b.id===land.bgId)||GDN_BACKGROUNDS[0];
    drawGardenScene(canvas, land, bgDef);
    // Hit detection
    canvas.onclick = (e)=>onCanvasClick(e,canvas,land,li,g);
  });

  // Dots
  if(dots) {
    dots.innerHTML = g.lands.map((_,i)=>
      `<div class="gdn-land-dot${i===_gdnCurrentLand?' active':''}" onclick="switchGardenLand(${i})"></div>`
    ).join('');
  }

  // Arrow visibility
  const al=$('gdn-arrow-l'), ar=$('gdn-arrow-r');
  if(al) al.style.opacity=_gdnCurrentLand>0?'1':'0.2';
  if(ar) ar.style.opacity=_gdnCurrentLand<g.lands.length-1?'1':'0.2';

  // Restore position
  slider.style.transition='none';
  slider.style.transform=`translateX(-${_gdnCurrentLand*100}%)`;
  setTimeout(()=>{slider.style.transition='transform .4s cubic-bezier(.4,0,.2,1)';},30);

  gdnAddSwipe(slider, g);
  gdnUpdateTime();
  // Animation loop
  startGardenAnimation(g);
}

function onCanvasClick(e, canvas, land, landIdx, g) {
  const rect = canvas.getBoundingClientRect();
  const cx = (e.clientX-rect.left)*(canvas.width/rect.width);
  const cy = (e.clientY-rect.top)*(canvas.height/rect.height);
  const layout = getPlotLayout(canvas.width, canvas.height);

  // Find which plot was clicked
  let hit = -1;
  layout.forEach((p,i)=>{
    if(cx>=p.hitX && cx<=p.hitX+p.hitW && cy>=p.hitY && cy<=p.hitY+p.hitH) hit=i;
  });
  if(hit<0) return;
  const plot = land.plots[hit];
  const screenX = e.clientX, screenY = e.clientY;

  if(!land.unlocked){ openGardenShop(); return; }

  // Move char to plot first, then act
  if(hit >= 0 && (CHAR_STATE || typeof CHAR_STATE !== 'undefined')) {
    const pos2 = layout[hit];
    const destY2 = pos2.y - pos2.h * 0.2;
    if(_gdnTool === 'water' || _gdnTool === 'hoe') {
      CHAR_STATE.tool = _gdnTool;
      if(typeof moveCharTo === 'function') moveCharTo(pos2.x, destY2, _gdnTool, _gdnTool);
    } else if(typeof checkHarvestReady === 'function' && checkHarvestReady(land.plots[hit])) {
      CHAR_STATE.tool = 'harvest';
      if(typeof moveCharTo === 'function') moveCharTo(pos2.x, destY2, 'harvest', 'harvest');
      const _li2 = landIdx, _pi2 = hit;
      setTimeout(()=>harvestPlot(_li2,_pi2), 800);
      return;
    }
  }

  if(_gdnSeedMode) {
    // Plant seed
    if(plot.plant){ toast('Plot sudah ada tanaman!','error'); return; }
    const inv = g.inventory||[];
    const si = inv.indexOf(_gdnSeedMode);
    if(si<0){ toast('Bibit tidak ditemukan!','error'); _gdnSeedMode=null; updateGardenHint(); return; }
    inv.splice(si,1);
    plot.plant=_gdnSeedMode; plot.stage=0; plot.water=0; plot.wilted=false;
    plot.plantedAt=Date.now(); plot.lastWatered=Date.now();
    g.inventory=inv;
    const pn=GDN_PLANTS.find(p=>p.id===_gdnSeedMode)?.name||'Tanaman';
    _gdnSeedMode=null; updateGardenHint();
    saveGardenData(g); renderGardenFull();
    toast(`🌱 ${pn} ditanam!`,'success');
    return;
  }

  if(_gdnTool==='water'){
    if(!plot.plant){ toast('Tidak ada tanaman!','error'); return; }
    if(plot.wilted){ toast('Tanaman layu! Cangkul dulu.','error'); return; }
    if((g.waterCount||0)<=0){ toast('Tidak ada jatah siram! Selesaikan habit.','error'); return; }
    const pd=GDN_PLANTS.find(p=>p.id===plot.plant);
    g.waterCount--;
    plot.water=(plot.water||0)+1;
    plot.lastWatered=Date.now();
    if(plot.water>=(pd?.waterNeeded||3)&&plot.stage<(pd?.maxStage||3)-1){
      plot.stage++; plot.water=0;
      toast(`🌱 ${pd?.name} tumbuh ke tahap ${plot.stage+1}!`,'success');
    } else { toast(`💧 Disiram (${plot.water}/${pd?.waterNeeded})!`,'success'); }
    saveGardenData(g); renderGardenFull(); return;
  }

  if(_gdnTool==='hoe'){
    if(!plot.wilted){ toast('Tanaman ini tidak layu!','error'); return; }
    if((g.hoeCount||0)<=0){ toast('Cangkul habis! Tunggu 24 jam.','error'); return; }
    g.hoeCount--; plot.wilted=false; plot.lastWatered=Date.now();
    saveGardenData(g); renderGardenFull();
    toast('⛏️ Tanaman dipulihkan!','success'); return;
  }

  // Show tooltip
  showPlotTooltip(screenX, screenY, plot, landIdx, hit, g);
}

function showPlotTooltip(x, y, plot, landIdx, plotIdx, g) {
  hideTooltip();
  const tt = document.createElement('div');
  tt.className='gdn-plant-tooltip'; tt.id='gdn-tooltip';
  let content='';
  if(!plot.plant){
    const inv=(g.inventory||[]);
    const seeds=[...new Set(inv.filter(x=>!x.startsWith('item_')))];
    content=`<div class="gdn-tooltip-name">🪨 Tanah Kosong</div>
      <div class="gdn-tooltip-info">Beli bibit di Shop lalu tap tanah untuk menanam.</div>
      ${seeds.length?`<div class="gdn-tooltip-btns">${seeds.map(sid=>{
        const p=GDN_PLANTS.find(x=>x.id===sid);
        const cnt=inv.filter(x=>x===sid).length;
        return `<button class="btn-plant" onclick="plantFromTooltip('${sid}',${landIdx},${plotIdx})">🌱${p?.name} (×${cnt})</button>`;
      }).join('')}</div>`:
      `<div class="gdn-tooltip-btns"><button class="btn-plant" onclick="hideTooltip();openGardenShop()">🛒 Buka Shop</button></div>`}`;
  } else {
    const pd=GDN_PLANTS.find(p=>p.id===plot.plant);
    const stages=pd?.stages||['🌱'];
    const em=stages[Math.min(plot.stage,stages.length-1)];
    const done=plot.stage>=(pd?.maxStage||3)-1;
    content=`<div class="gdn-tooltip-name">${em} ${pd?.name}</div>
      <div class="gdn-tooltip-info">
        Tahap ${plot.stage+1}/${pd?.maxStage} · Air ${plot.water}/${pd?.waterNeeded}
        ${plot.wilted?'<br>⚠️ LAYU — butuh cangkul':''}
        ${done?'<br>✨ Sudah mekar penuh!':''}
      </div>
      <div class="gdn-tooltip-btns">
        ${!plot.wilted&&!done?`<button class="btn-water" onclick="quickAction('water',${landIdx},${plotIdx})">💧 Siram</button>`:''}
        ${plot.wilted?`<button class="btn-hoe" onclick="quickAction('hoe',${landIdx},${plotIdx})">⛏️ Cangkul</button>`:''}
        <button class="btn-remove" onclick="quickAction('remove',${landIdx},${plotIdx})">🗑️</button>
        <button class="btn-plant" style="font-size:9px;padding:3px;" onclick="hideTooltip()">✕</button>
      </div>`;
  }
  tt.innerHTML=content;
  // Position
  const vw=window.innerWidth, vh=window.innerHeight;
  tt.style.left=Math.min(x+10,vw-280)+'px';
  tt.style.top=Math.min(y-20,vh-180)+'px';
  document.body.appendChild(tt);
  _gdnTooltip=tt;
  // Close on outside click
  setTimeout(()=>document.addEventListener('click',hideTooltipOutside,{once:true,capture:true}),50);
}

function hideTooltipOutside(e){ if(!e.target.closest('#gdn-tooltip')) hideTooltip(); }
function hideTooltip(){ if(_gdnTooltip){ _gdnTooltip.remove(); _gdnTooltip=null; } }

function plantFromTooltip(seedId, landIdx, plotIdx){
  hideTooltip();
  const g=getGardenData();
  const inv=g.inventory||[]; const si=inv.indexOf(seedId);
  if(si<0){ toast('Bibit tidak ada!','error'); return; }
  inv.splice(si,1);
  const plot=g.lands[landIdx].plots[plotIdx];
  plot.plant=seedId; plot.stage=0; plot.water=0; plot.wilted=false;
  plot.plantedAt=Date.now(); plot.lastWatered=Date.now();
  g.inventory=inv; saveGardenData(g); renderGardenFull();
  toast(`🌱 ${GDN_PLANTS.find(p=>p.id===seedId)?.name} ditanam!`,'success');
}

function quickAction(action, landIdx, plotIdx){
  hideTooltip();
  const g=getGardenData();
  const plot=g.lands[landIdx].plots[plotIdx];
  if(action==='water'){
    if((g.waterCount||0)<=0){toast('Tidak ada jatah siram!','error');return;}
    const pd=GDN_PLANTS.find(p=>p.id===plot.plant);
    g.waterCount--; plot.water=(plot.water||0)+1; plot.lastWatered=Date.now();
    if(plot.water>=(pd?.waterNeeded||3)&&plot.stage<(pd?.maxStage||3)-1){plot.stage++;plot.water=0;toast(`🌻 ${pd?.name} tumbuh!`,'success');}
    else toast(`💧 Disiram!`,'success');
  } else if(action==='hoe'){
    if((g.hoeCount||0)<=0){toast('Cangkul habis!','error');return;}
    g.hoeCount--; plot.wilted=false; plot.lastWatered=Date.now();
    toast('⛏️ Dipulihkan!','success');
  } else if(action==='remove'){
    if(!confirm('Cabut tanaman?')) return;
    plot.plant=null;plot.stage=0;plot.water=0;plot.wilted=false;plot.plantedAt=null;plot.lastWatered=null;
    toast('🗑️ Dicabut','info');
  }
  saveGardenData(g); renderGardenFull();
}

// ── Animation loop (aurora + sway) ────────────────────────
function startGardenAnimation(g) {
  if(_gdnRafId) cancelAnimationFrame(_gdnRafId);
  // Hanya animate kalau ada aurora atau malam
  const land = g.lands[_gdnCurrentLand];
  const bgId = land?.bgId||'default';
  const needsAnim = bgId==='aurora'||bgId==='night';
  if(!needsAnim) return;
  function frame() {
    const g2=getGardenData();
    const canvas=$(`gdn-canvas-${_gdnCurrentLand}`);
    const scene=$(`gdn-scene-${_gdnCurrentLand}`);
    if(!canvas||!scene) return;
    canvas.width=scene.offsetWidth||window.innerWidth;
    canvas.height=scene.offsetHeight||420;
    const bgDef=GDN_BACKGROUNDS.find(b=>b.id===g2.lands[_gdnCurrentLand]?.bgId)||GDN_BACKGROUNDS[0];
    drawGardenScene(canvas, g2.lands[_gdnCurrentLand], bgDef);
    _gdnRafId=requestAnimationFrame(frame);
  }
  _gdnRafId=requestAnimationFrame(frame);
}

// ── Land switch ────────────────────────────────────────────
function switchGardenLand(idx) {
  const g=getGardenData();
  if(idx<0||idx>=g.lands.length) return;
  if(_gdnRafId){cancelAnimationFrame(_gdnRafId);_gdnRafId=null;}
  if(_charAnimFrame){cancelAnimationFrame(_charAnimFrame);_charAnimFrame=null;}
  _gdnCurrentLand=idx;
  const s=$('gdn-lands-slider');
  if(s) s.style.transform=`translateX(-${idx*100}%)`;
  document.querySelectorAll('.gdn-land-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
  const al=$('gdn-arrow-l'),ar=$('gdn-arrow-r');
  if(al) al.style.opacity=idx>0?'1':'0.2';
  if(ar) ar.style.opacity=idx<g.lands.length-1?'1':'0.2';
  startGardenAnimation(g);
}

// ── Swipe ──────────────────────────────────────────────────
let _gdnSx=0;
function gdnAddSwipe(slider, g){
  if(slider._swipe) return; slider._swipe=true;
  slider.addEventListener('touchstart',e=>{_gdnSx=e.touches[0].clientX;},{passive:true});
  slider.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-_gdnSx;
    if(Math.abs(dx)>45){
      if(dx<0&&_gdnCurrentLand<g.lands.length-1) switchGardenLand(_gdnCurrentLand+1);
      if(dx>0&&_gdnCurrentLand>0) switchGardenLand(_gdnCurrentLand-1);
    }
  },{passive:true});
}

// ── Tool select ────────────────────────────────────────────
function selectGardenTool(tool){
  _gdnTool=_gdnTool===tool?null:tool;
  _gdnSeedMode=null;
  ['water','hoe'].forEach(t=>{
    const el=$('gdn-pill-'+t);
    if(el) el.classList.toggle('active',_gdnTool===t);
  });
  updateGardenHint();
}
function updateGardenHint(){
  const h=$('gdn-hint'); if(!h) return;
  if(_gdnTool==='water') h.textContent='💧 Tap tanaman untuk menyiram';
  else if(_gdnTool==='hoe') h.textContent='⛏️ Tap tanaman layu untuk mencangkul';
  else if(_gdnSeedMode) h.textContent=`🌱 Tap tanah kosong untuk menanam ${GDN_PLANTS.find(p=>p.id===_gdnSeedMode)?.name}`;
  else h.textContent='Tap tanaman/tanah untuk interaksi · pilih alat 💧⛏️';
}

// ── Time display ───────────────────────────────────────────
function gdnUpdateTime(){
  const el=$('gdn-time-display'); if(!el) return;
  const n=new Date(); const h=n.getHours(); const m=String(n.getMinutes()).padStart(2,'0');
  el.textContent=`${h>=6&&h<18?'☀️':'🌙'} ${String(h).padStart(2,'0')}:${m}`;
}

// ── Shop ──────────────────────────────────────────────────
function openGardenShop(){
  const g=getGardenData();
  if($('shop-coins-display')) $('shop-coins-display').textContent=g.coins||0;
  setShopTab('seeds',$('shop-tab-seeds'));
  openModal('modal-garden-shop');
}
function setShopTab(tab,el){
  _gdnShopTab=tab;
  document.querySelectorAll('[id^="shop-tab-"]').forEach(b=>b.classList.remove('active'));
  if(el) el.classList.add('active');
  renderShopContent();
}
function renderShopContent(){
  const g=getGardenData(); const coins=g.coins||0; const el=$('shop-content'); if(!el) return;
  if(_gdnShopTab==='seeds'){
    el.innerHTML=GDN_PLANTS.map(p=>{
      const has=(g.inventory||[]).filter(x=>x===p.id).length;
      return `<div class="shop-item${coins<p.price?' cant-afford':''}" onclick="buySeed('${p.id}')">
        <div class="shop-item-icon">${p.stages[p.stages.length-1]}</div>
        <div class="shop-item-info"><div class="shop-item-name">${p.name}</div>
        <div class="shop-item-desc">Butuh ${p.waterNeeded}x siram · ${p.maxStage} tahap${has?' · inventory: '+has:''}</div></div>
        <div class="shop-item-price">🪙${p.price}</div></div>`;
    }).join('');
  } else if(_gdnShopTab==='items'){
    const items=[{id:'medicine',name:'Obat Tanaman',emoji:'💊',price:1,desc:'Pulihkan layu tanpa cangkul'},{id:'fertilizer',name:'Pupuk Kilat',emoji:'⚡',price:2,desc:'Kurangi kebutuhan air -1 sesi ini'}];
    el.innerHTML=items.map(it=>`<div class="shop-item${coins<it.price?' cant-afford':''}" onclick="buyItem('${it.id}')">
      <div class="shop-item-icon">${it.emoji}</div>
      <div class="shop-item-info"><div class="shop-item-name">${it.name}</div><div class="shop-item-desc">${it.desc}</div></div>
      <div class="shop-item-price">🪙${it.price}</div></div>`).join('');
  } else if(_gdnShopTab==='bg'){
    el.innerHTML=GDN_BACKGROUNDS.map(bg=>{
      const owned=(g.ownedBgs||[]).includes(bg.id);
      const active=g.lands[_gdnCurrentLand]?.bgId===bg.id;
      return `<div class="shop-item${owned?' owned':(coins<bg.price?' cant-afford':'')}" onclick="${owned?`applyBg('${bg.id}')`:`buyBg('${bg.id}')`}">
        <div class="shop-item-icon" style="width:38px;height:38px;background:linear-gradient(${bg.skyTop},${bg.groundTop});"></div>
        <div class="shop-item-info"><div class="shop-item-name">${bg.name}</div><div class="shop-item-desc">${owned?'Sudah dimiliki':'Latar eksklusif'}</div></div>
        <div class="shop-item-price">${owned?(active?'✅':'TERAPKAN'):`🪙${bg.price}`}</div></div>`;
    }).join('');
  } else if(_gdnShopTab==='land'){
    el.innerHTML=g.lands.map((land,i)=>`<div class="shop-item${land.unlocked?' owned':(coins<5?' cant-afford':'')}}" onclick="${land.unlocked?'':(`buyLand(${i})`)}">
      <div class="shop-item-icon">${land.unlocked?'🌾':'🔒'}</div>
      <div class="shop-item-info"><div class="shop-item-name">Lahan ${i+1}</div><div class="shop-item-desc">${land.unlocked?'Sudah dibuka · 16 plot':'16 plot baru · geser untuk lihat'}</div></div>
      <div class="shop-item-price">${land.unlocked?'✅':'🪙5'}</div></div>`).join('');
  }
}
function buySeed(id){
  const g=getGardenData(); const p=GDN_PLANTS.find(x=>x.id===id);
  if(!p||(g.coins||0)<p.price){toast('Koin tidak cukup!','error');return;}
  g.coins-=p.price; g.inventory=g.inventory||[]; g.inventory.push(id);
  saveGardenData(g);
  if($('shop-coins-display')) $('shop-coins-display').textContent=g.coins;
  if($('gdn-coins')) $('gdn-coins').textContent=g.coins;
  renderShopContent();
  _gdnSeedMode=id; updateGardenHint();
  toast(`🌱 ${p.name} dibeli! Tutup shop → tap tanah untuk menanam.`,'success');
  closeModal('modal-garden-shop');
}
function buyItem(id){
  const g=getGardenData(); const prices={medicine:1,fertilizer:2};
  const price=prices[id]||1;
  if((g.coins||0)<price){toast('Koin tidak cukup!','error');return;}
  g.coins-=price; g.inventory.push('item_'+id); saveGardenData(g);
  if($('gdn-coins')) $('gdn-coins').textContent=g.coins;
  if($('shop-coins-display')) $('shop-coins-display').textContent=g.coins;
  renderShopContent(); toast('✅ Item dibeli!','success');
}
function buyBg(id){
  const g=getGardenData(); const bg=GDN_BACKGROUNDS.find(x=>x.id===id);
  if(!bg||(g.coins||0)<bg.price){toast('Koin tidak cukup!','error');return;}
  g.coins-=bg.price; g.ownedBgs=g.ownedBgs||['default'];
  if(!g.ownedBgs.includes(id)) g.ownedBgs.push(id);
  g.lands[_gdnCurrentLand].bgId=id; saveGardenData(g);
  if($('gdn-coins')) $('gdn-coins').textContent=g.coins;
  renderShopContent(); renderGardenFull(); toast(`🎨 ${bg.name} diterapkan!`,'success');
}
function applyBg(id){
  const g=getGardenData(); g.lands[_gdnCurrentLand].bgId=id; saveGardenData(g);
  renderShopContent(); renderGardenFull(); toast('✅ Background diterapkan!','success');
}
function buyLand(idx){
  const g=getGardenData();
  if((g.coins||0)<5){toast('Butuh 5 koin!','error');return;}
  g.coins-=5; g.lands[idx].unlocked=true; saveGardenData(g);
  if($('gdn-coins')) $('gdn-coins').textContent=g.coins;
  renderShopContent(); renderGardenFull();
  setTimeout(()=>switchGardenLand(idx),300);
  toast(`🎉 Lahan ${idx+1} dibuka!`,'success');
}

// ── Coin awards ────────────────────────────────────────────
function awardGardenCoin(n=1, reason=''){
  const g=getGardenData(); g.coins=(g.coins||0)+n; saveGardenData(g);
  if($('gdn-coins')) $('gdn-coins').textContent=g.coins;
  toast(`🪙 +${n} coin${reason?' ('+reason+')':''}!`,'success');
}
function awardGardenWater(n=1){
  const g=getGardenData(); g.waterCount=(g.waterCount||0)+n; saveGardenData(g);
  if($('gdn-water-count')) $('gdn-water-count').textContent=g.waterCount;
}
function awardWellnessXP(type='water'){
  const xp=20;
  S.xp=(S.xp||0)+xp; save();
  if(typeof renderStats==='function') renderStats();
  const prevLvl=Math.max(1,Math.floor((S.xp-xp)/100)+1);
  const newLvl=Math.max(1,Math.floor(S.xp/100)+1);
  if(newLvl>prevLvl){
    if(typeof playSound==='function') playSound('levelup');
    if(typeof toast==='function') toast(`🎉 LVL ${newLvl}!`,'success');
    if(typeof checkGardenCoinFromLevel==='function') checkGardenCoinFromLevel(prevLvl,newLvl);
  }
  toast(`${type==='water'?'💧':'😴'} Target tercapai! +${xp} XP`,'success');
}
function checkGardenCoinFromStreak(habit){
  if((habit.streak||0)>0&&habit.streak%7===0) awardGardenCoin(1,`streak ${habit.streak}hr`);
}
function checkGardenCoinFromLevel(oldLv,newLv){ if(newLv>oldLv) awardGardenCoin(1,`level ${newLv}`); }

// ── Init ───────────────────────────────────────────────────
function initGardenPage(){
  hideTooltip();
  if(_gdnRafId){cancelAnimationFrame(_gdnRafId);_gdnRafId=null;}
  if(_charAnimFrame){cancelAnimationFrame(_charAnimFrame);_charAnimFrame=null;}
  _gdnTool=null; _gdnSeedMode=null;
  renderGardenFull();
  // Init char position
  setTimeout(()=>{
    const scene=$('gdn-scene-0');
    const w=scene?.offsetWidth||window.innerWidth;
    const h=scene?.offsetHeight||420;
    if(typeof CHAR_STATE!=='undefined'){
      CHAR_STATE.x=w*0.5; CHAR_STATE.y=h*0.72;
      CHAR_STATE.facing=1; CHAR_STATE.action='idle'; CHAR_STATE.tool=null;
    }
    if(typeof startCharAnimation==='function') startCharAnimation(_gdnCurrentLand);
  },100);
  // Time updater
  if(window._gdnTimeInt) clearInterval(window._gdnTimeInt);
  window._gdnTimeInt=setInterval(gdnUpdateTime,30000);
}

// ════════════════════════════════════════════════════════════
// HARVEST SYSTEM
// ════════════════════════════════════════════════════════════
// Saat tanaman mencapai maxStage, timer panen mulai.
// Setelah harvestHours, muncul tombol 🧺 panen → +XP

function checkHarvestReady(plot) {
  const pd = GDN_PLANTS.find(p => p.id === plot.plant);
  if(!pd || !plot.plant) return false;
  if(plot.stage < pd.maxStage - 1) return false; // belum full grown
  if(plot.wilted) return false;
  if(!plot.readyAt) return false; // belum ada timer
  return Date.now() >= plot.readyAt;
}

function setHarvestTimer(plot) {
  const pd = GDN_PLANTS.find(p => p.id === plot.plant);
  if(!pd) return;
  if(plot.stage >= pd.maxStage - 1 && !plot.readyAt && !plot.wilted) {
    plot.readyAt = Date.now() + (pd.harvestHours || 4) * 3600000;
  }
}

function harvestPlot(landIdx, plotIdx) {
  const g = getGardenData();
  const plot = g.lands[landIdx]?.plots[plotIdx];
  if(!plot) return;
  const pd = GDN_PLANTS.find(p => p.id === plot.plant);
  if(!pd || !checkHarvestReady(plot)) { toast('Belum siap panen!', 'error'); return; }

  // Award XP
  const xp = pd.harvestXp || 15;
  S.xp = (S.xp || 0) + xp; save();
  if(typeof renderStats === 'function') renderStats();

  // Level up check
  const prevLvl = Math.max(1, Math.floor((S.xp - xp) / 100) + 1);
  const newLvl  = Math.max(1, Math.floor(S.xp / 100) + 1);
  if(newLvl > prevLvl) {
    if(typeof playSound === 'function') playSound('levelup');
    toast(`🎉 Level Up! LVL ${newLvl}`, 'success');
    if(typeof checkGardenCoinFromLevel === 'function') checkGardenCoinFromLevel(prevLvl, newLvl);
  }

  // Reset plot setelah panen
  plot.plant = null; plot.stage = 0; plot.water = 0;
  plot.wilted = false; plot.plantedAt = null; plot.lastWatered = null; plot.readyAt = null;
  saveGardenData(g);
  hideTooltip();
  renderGardenFull();
  toast(`🧺 ${pd.harvestEmoji} ${pd.name} dipanen! +${xp} XP`, 'success');
  if(S.confettiOn !== false && typeof confetti === 'function') confetti(12);
}

// harvest timer check merged into gdnMaintenance directly

// ════════════════════════════════════════════════════════════
// CHIBI CHARACTER SYSTEM
// ════════════════════════════════════════════════════════════

// Character state
const CHAR_STATE = {
  x: 0, y: 0,          // current canvas position
  targetX: 0, targetY: 0,
  moving: false,
  facing: 1,            // 1=right, -1=left
  action: 'idle',       // 'idle' | 'walk' | 'water' | 'hoe' | 'harvest'
  actionTimer: 0,
  tool: null,           // 'water' | 'hoe' | 'harvest' | null
  frame: 0,             // animation frame
  walkFrame: 0,
};

// Character appearance (loaded from profile)
function getCharConfig() {
  try {
    const r = localStorage.getItem('oht_char');
    return r ? JSON.parse(r) : getDefaultChar();
  } catch(e) { return getDefaultChar(); }
}
function saveCharConfig(c) {
  try { localStorage.setItem('oht_char', JSON.stringify(c)); } catch(e){}
}
function getDefaultChar() {
  return {
    hairColor: '#3a2000',
    hairStyle: 'short',    // 'short' | 'long' | 'bun'
    skinColor: '#f5c5a3',
    shirtColor: '#4a90d9',
    pantsColor: '#2d4a8a',
    shoeColor:  '#3a2000',
    accessory:  'none',    // 'none' | 'hat' | 'glasses' | 'scarf'
    accColor:   '#e83',
  };
}

// Draw chibi character on canvas
function drawChibiChar(ctx, x, y, facing, action, frame, cfg) {
  ctx.save();
  ctx.translate(x, y);
  if(facing < 0) { ctx.scale(-1, 1); } // flip for direction

  const s = 1; // scale multiplier
  const walkBob = action === 'walk' ? Math.sin(frame * 0.3) * 2 : 0;
  const bodyY = walkBob;

  // ── Shadow ──
  ctx.fillStyle = 'rgba(0,0,0,0.18)';
  ctx.beginPath();
  ctx.ellipse(0, 2, 10, 3, 0, 0, Math.PI*2);
  ctx.fill();

  // ── Legs ──
  const legSwing = action === 'walk' ? Math.sin(frame * 0.3) * 8 : 0;
  // Left leg
  ctx.fillStyle = cfg.pantsColor;
  ctx.fillRect(-7 + legSwing, bodyY + 14, 5, 12);
  // Right leg
  ctx.fillRect(2 - legSwing, bodyY + 14, 5, 12);
  // Shoes
  ctx.fillStyle = cfg.shoeColor;
  ctx.fillRect(-9 + legSwing, bodyY + 24, 7, 4);
  ctx.fillRect(0 - legSwing, bodyY + 24, 7, 4);

  // ── Arms ──
  const armSwing = action === 'walk' ? Math.sin(frame * 0.3 + Math.PI) * 8 : 0;
  const armRaise = (action === 'water' || action === 'hoe') ? -10 : 0;
  ctx.fillStyle = cfg.shirtColor;
  // Left arm
  ctx.save();
  ctx.translate(-10, bodyY + 4);
  ctx.rotate((-15 + armSwing + armRaise) * Math.PI/180);
  ctx.fillRect(-3, 0, 5, 12);
  ctx.restore();
  // Right arm
  ctx.save();
  ctx.translate(10, bodyY + 4);
  ctx.rotate((15 - armSwing + armRaise) * Math.PI/180);
  ctx.fillRect(-2, 0, 5, 12);
  ctx.restore();

  // ── Body / Shirt ──
  ctx.fillStyle = cfg.shirtColor;
  ctx.fillRect(-8, bodyY + 0, 16, 16);
  // Collar
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.fillRect(-3, bodyY, 6, 3);

  // ── Head ──
  ctx.fillStyle = cfg.skinColor;
  ctx.beginPath();
  ctx.ellipse(0, bodyY - 12, 10, 11, 0, 0, Math.PI*2);
  ctx.fill();

  // ── Eyes ──
  const blinkH = (frame % 60 > 57) ? 1 : 5; // blink effect
  ctx.fillStyle = '#1a0a00';
  ctx.beginPath(); ctx.ellipse(-3.5, bodyY - 13, 2, blinkH/2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(3.5,  bodyY - 13, 2, blinkH/2, 0, 0, Math.PI*2); ctx.fill();
  // Eye shine
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(-3, bodyY - 14, 0.8, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(4,  bodyY - 14, 0.8, 0, Math.PI*2); ctx.fill();

  // ── Mouth ──
  ctx.strokeStyle = '#a05030';
  ctx.lineWidth = 1;
  ctx.beginPath();
  if(action === 'water' || action === 'harvest') {
    ctx.arc(0, bodyY - 9, 3, 0, Math.PI); // happy mouth
  } else {
    ctx.moveTo(-2, bodyY - 8); ctx.lineTo(2, bodyY - 8);
  }
  ctx.stroke();

  // ── Cheeks ──
  ctx.fillStyle = 'rgba(255,120,100,0.25)';
  ctx.beginPath(); ctx.ellipse(-5, bodyY - 10, 3, 2, 0, 0, Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(5,  bodyY - 10, 3, 2, 0, 0, Math.PI*2); ctx.fill();

  // ── Hair ──
  ctx.fillStyle = cfg.hairColor;
  if(cfg.hairStyle === 'long') {
    // Long hair — sides + back
    ctx.beginPath();
    ctx.ellipse(0, bodyY - 18, 11, 8, 0, 0, Math.PI*2); ctx.fill();
    ctx.fillRect(-11, bodyY - 16, 5, 18); // left long
    ctx.fillRect(6,   bodyY - 16, 5, 18); // right long
    ctx.beginPath(); ctx.arc(0, bodyY - 20, 10, Math.PI, 0); ctx.fill();
  } else if(cfg.hairStyle === 'bun') {
    ctx.beginPath(); ctx.arc(0, bodyY - 20, 10, Math.PI, 0); ctx.fill();
    ctx.fillRect(-10, bodyY - 20, 20, 8);
    ctx.beginPath(); ctx.arc(0, bodyY - 26, 5, 0, Math.PI*2); ctx.fill(); // bun
  } else {
    // Short
    ctx.beginPath(); ctx.arc(0, bodyY - 20, 10, Math.PI, 0); ctx.fill();
    ctx.fillRect(-10, bodyY - 20, 20, 8);
    // Side tufts
    ctx.beginPath(); ctx.arc(-8, bodyY - 15, 4, 0, Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(8,  bodyY - 15, 4, 0, Math.PI*2); ctx.fill();
  }

  // ── Accessory ──
  if(cfg.accessory === 'hat') {
    ctx.fillStyle = cfg.accColor;
    ctx.fillRect(-10, bodyY - 32, 20, 6);
    ctx.fillRect(-6,  bodyY - 38, 12, 10);
    ctx.fillStyle = 'rgba(255,255,255,0.3)';
    ctx.fillRect(-5, bodyY - 37, 10, 2);
  } else if(cfg.accessory === 'glasses') {
    ctx.strokeStyle = cfg.accColor; ctx.lineWidth = 1.5;
    ctx.strokeRect(-7, bodyY - 15, 5, 4);
    ctx.strokeRect(2,  bodyY - 15, 5, 4);
    ctx.beginPath(); ctx.moveTo(-2, bodyY - 13); ctx.lineTo(2, bodyY - 13); ctx.stroke();
  } else if(cfg.accessory === 'scarf') {
    ctx.fillStyle = cfg.accColor;
    ctx.fillRect(-9, bodyY - 1, 18, 4);
    ctx.beginPath(); ctx.arc(0, bodyY + 2, 4, 0, Math.PI); ctx.fill();
  }

  // ── Tool in hand ──
  if(CHAR_STATE.tool === 'water') {
    ctx.strokeStyle = '#4af'; ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, bodyY + 4);
    ctx.lineTo(18, bodyY - 4);
    ctx.stroke();
    // Watering can
    ctx.fillStyle = '#4af';
    ctx.fillRect(16, bodyY - 8, 8, 6);
    ctx.fillStyle = '#2af';
    ctx.fillRect(22, bodyY - 10, 2, 4);
    // Water drops
    if(action === 'water') {
      for(let d = 0; d < 3; d++) {
        const t = (frame * 0.1 + d * 0.3) % 1;
        ctx.fillStyle = `rgba(100,200,255,${1-t})`;
        ctx.beginPath();
        ctx.arc(24 + d * 2, bodyY - 8 + t * 12, 1.5, 0, Math.PI*2);
        ctx.fill();
      }
    }
  } else if(CHAR_STATE.tool === 'hoe') {
    ctx.strokeStyle = '#a84'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(10, bodyY + 4); ctx.lineTo(20, bodyY - 12); ctx.stroke();
    ctx.fillStyle = '#876';
    ctx.fillRect(17, bodyY - 16, 8, 4);
  } else if(CHAR_STATE.tool === 'harvest') {
    ctx.fillStyle = '#c84'; ctx.strokeStyle = '#a63'; ctx.lineWidth = 1;
    // Basket
    ctx.beginPath();
    ctx.arc(16, bodyY + 6, 7, 0, Math.PI*2);
    ctx.fillStyle = '#c84'; ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#a63';
    ctx.fillRect(10, bodyY + 2, 12, 2);
  }

  ctx.restore();
}

// Character movement & animation
let _charAnimFrame = null;

function updateCharacter(canvas, land, bgDef) {
  const cs = CHAR_STATE;
  cs.frame++;

  if(cs.moving) {
    const dx = cs.targetX - cs.x;
    const dy = cs.targetY - cs.y;
    const dist = Math.sqrt(dx*dx + dy*dy);
    const speed = 2.5;
    if(dist < speed + 1) {
      cs.x = cs.targetX; cs.y = cs.targetY;
      cs.moving = false;
      cs.action = cs.pendingAction || 'idle';
      cs.actionTimer = 60; // frames to do action animation
      cs.walkFrame = 0;
    } else {
      cs.x += (dx/dist)*speed;
      cs.y += (dy/dist)*speed;
      cs.facing = dx > 0 ? 1 : -1;
      cs.action = 'walk';
      cs.walkFrame++;
    }
  } else if(cs.actionTimer > 0) {
    cs.actionTimer--;
    if(cs.actionTimer === 0) {
      cs.action = 'idle';
      cs.tool = null;
    }
  }

  // Redraw canvas
  const ctx = canvas.getContext('2d');
  canvas.width = canvas.width; // clear
  const g = getGardenData();
  drawGardenScene(canvas, land, bgDef);

  // Draw character
  const cfg = getCharConfig();
  drawChibiChar(ctx, cs.x, cs.y, cs.facing, cs.action, cs.frame, cfg);
}

function moveCharTo(targetX, targetY, action, tool) {
  CHAR_STATE.targetX = targetX;
  CHAR_STATE.targetY = targetY;
  CHAR_STATE.moving  = true;
  CHAR_STATE.pendingAction = action;
  CHAR_STATE.tool = tool;
}

// Start char animation loop for a specific land
function startCharAnimation(landIdx) {
  if(_charAnimFrame) cancelAnimationFrame(_charAnimFrame);
  const g = getGardenData();
  const land = g.lands[landIdx];
  const bgDef = GDN_BACKGROUNDS.find(b => b.id === (land?.bgId||'default')) || GDN_BACKGROUNDS[0];

  function loop() {
    const canvas = $(`gdn-canvas-${landIdx}`);
    const scene  = $(`gdn-scene-${landIdx}`);
    if(!canvas || !scene) { _charAnimFrame = null; return; }
    canvas.width  = scene.offsetWidth  || window.innerWidth;
    canvas.height = scene.offsetHeight || 420;
    const g2 = getGardenData();
    updateCharacter(canvas, g2.lands[landIdx], bgDef);
    _charAnimFrame = requestAnimationFrame(loop);
  }
  _charAnimFrame = requestAnimationFrame(loop);
}


// onCanvasClick enhanced inline

// initGardenPage char init merged directly

// switchGardenLand char anim merged

// drawGardenScene — tambah harvest-ready indicator

// ════════════════════════════════════════════════════════════
// PROFILE PAGE
// ════════════════════════════════════════════════════════════

function initProfilePage() {
  setProfileMode('view');
  if(typeof renderProfileSocialSection==='function') setTimeout(renderProfileSocialSection,100);
}

function setProfileMode(mode) {
  const viewEl = $('profile-view-mode');
  const editEl = $('profile-edit-mode');
  if(viewEl) viewEl.style.display = mode === 'view' ? 'block' : 'none';
  if(editEl) editEl.style.display = mode === 'edit' ? 'block' : 'none';
  if(mode === 'view') {renderProfilePage(); setTimeout(()=>{ const c=$('profile-char-canvas'); if(c && typeof drawChibiChar==='function') {/* redrawn by renderProfilePage */}},100);}
  else {renderProfileEdit(); setTimeout(drawEditPreview, 80);}
}

function renderProfileView() {
  const el = $('profile-canvas-wrap'); if(!el) return;
  renderProfilePage(); // uses existing canvas render
}

function renderProfilePage() {
  const el = $('profile-canvas-wrap'); if(!el) return;
  const cfg = getCharConfig();
  const xp = S.xp || 0;
  const lvl = Math.max(1, Math.floor(xp / 100) + 1);
  const xpInLevel = xp % 100;
  const coins = getGardenData().coins || 0;

  // Canvas full viewport width (bleed ke edge)
  const pageEl = $('profile-page-content') || document.querySelector('#page-profile .page-content');
  const pageW = pageEl ? pageEl.offsetWidth : Math.min(window.innerWidth, 600);
  const canvasH = Math.round(pageW * 0.58);

  el.innerHTML = `
    <div style="position:relative;width:100%;cursor:pointer;margin-bottom:0;" onclick="rotateProfileChar()" title="Tap untuk rotasi">
      <canvas id="profile-char-canvas" width="${pageW}" height="${canvasH}"
        style="display:block;width:100%;height:auto;"></canvas>
      <div style="position:absolute;bottom:11px;right:11px;font-family:'IBM Plex Mono',monospace;font-size:8px;color:rgba(255,255,255,.6);">↺ Tap rotasi</div>
    </div>
    <!-- Stats panel -->
    <div style="background:var(--surface);border:var(--bo-t);padding:14px;margin-bottom:11px;">
      <div style="display:flex;align-items:center;gap:9px;margin-bottom:9px;">
        <div style="flex:1;">
          <div style="font-family:'Archivo Black',sans-serif;font-size:20px;color:var(--yellow);">${S.name||'User'}</div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);">Level ${lvl} · ${LVL_NAMES?LVL_NAMES[Math.min(lvl-1,LVL_NAMES.length-1)]:'Starter'}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-family:'Archivo Black',sans-serif;font-size:22px;color:var(--yellow);">🪙 ${coins}</div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">COIN</div>
        </div>
      </div>
      <!-- XP bar -->
      <div style="display:flex;justify-content:space-between;font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);margin-bottom:4px;">
        <span>XP</span><span>${xpInLevel}/100</span>
      </div>
      <div style="height:8px;background:#222;border:1px solid var(--bc);overflow:hidden;margin-bottom:4px;">
        <div style="height:100%;width:${xpInLevel}%;background:var(--yellow);transition:width .6s;"></div>
      </div>
      <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">${xp} XP total · menuju level ${lvl+1}</div>
    </div>
    <!-- Stats grid -->
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-bottom:11px;">
      <div style="background:var(--surface);border:var(--bo);padding:9px;text-align:center;">
        <div style="font-family:'Archivo Black',sans-serif;font-size:16px;color:var(--yellow);">${S.habits?.filter(h=>!h.archived).length||0}</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">HABITS</div>
      </div>
      <div style="background:var(--surface);border:var(--bo);padding:9px;text-align:center;">
        <div style="font-family:'Archivo Black',sans-serif;font-size:16px;color:var(--yellow);">${S.habits?.reduce((m,h)=>Math.max(m,h.bestStreak||0),0)||0}</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">BEST STREAK</div>
      </div>
      <div style="background:var(--surface);border:var(--bo);padding:9px;text-align:center;">
        <div style="font-family:'Archivo Black',sans-serif;font-size:16px;color:var(--yellow);">${S.habits?.reduce((s,h)=>s+(h.totalDone||0),0)||0}</div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">TOTAL SELESAI</div>
      </div>
    </div>`;

  // Draw full scene on profile canvas
  setTimeout(() => {
    const canvas = $('profile-char-canvas');
    if(!canvas) return;
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, W, H);

    const bg = typeof getProfileBgConfig==='function' ? getProfileBgConfig() : {top:'#1a2d4a',bot:'#2d4a6a',grass:'#2d5a1a'};

    // Sky gradient
    const skyGrd = ctx.createLinearGradient(0,0,0,H*0.7);
    skyGrd.addColorStop(0, bg.top); skyGrd.addColorStop(1, bg.bot);
    ctx.fillStyle = skyGrd; ctx.fillRect(0,0,W,H);

    // Stars
    if(bg.top.startsWith('#0')||bg.top.startsWith('#05')||bg.top.startsWith('#0a')) {
      ctx.fillStyle='rgba(255,255,255,.7)';
      for(let s=0;s<50;s++) {
        ctx.fillRect((s*137.508)%W, (s*73.1)%(H*0.55), 1.5, 1.5);
      }
    }

    // Celestial body
    const now2=new Date(); const h2=now2.getHours()+now2.getMinutes()/60;
    const isDaytime=h2>=6&&h2<18;
    if(isDaytime) {
      const t=(h2-6)/12;
      const cx=W*0.1+W*0.8*t, cy=H*0.35-Math.sin(Math.PI*t)*H*0.28;
      const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,W*0.08);
      glow.addColorStop(0,'rgba(255,220,60,.4)'); glow.addColorStop(1,'transparent');
      ctx.fillStyle=glow; ctx.beginPath(); ctx.arc(cx,cy,W*0.08,0,Math.PI*2); ctx.fill();
      ctx.fillStyle='#ffd700'; ctx.beginPath(); ctx.arc(cx,cy,W*0.025,0,Math.PI*2); ctx.fill();
    } else {
      const tM=h2>=18?(h2-18)/12:(h2+6)/12;
      const mx=W*0.1+W*0.8*tM, my=H*0.32-Math.sin(Math.PI*tM)*H*0.22;
      ctx.fillStyle='#ccd5ff'; ctx.beginPath(); ctx.arc(mx,my,W*0.018,0,Math.PI*2); ctx.fill();
    }

    // Ground
    const groundY = H*0.62;
    const gndGrd=ctx.createLinearGradient(0,groundY,0,H);
    gndGrd.addColorStop(0, bg.grass||'#2d5a1a'); gndGrd.addColorStop(1,'#1a3a0a');
    ctx.fillStyle=gndGrd; ctx.fillRect(0,groundY,W,H-groundY);

    // Grass tufts
    ctx.fillStyle=bg.grass||'#2d5a1a';
    for(let x=0;x<W;x+=6) {
      const gh=4+Math.sin(x*0.5)*2;
      ctx.fillRect(x,groundY-gh,3,gh+3);
    }

    // Decorative flowers/elements in background
    const decors=['🌸','🌼','🌿','🌱'];
    decors.forEach((_,i) => {
      const dx = W*(0.1 + i*0.22);
      ctx.font=`${W*0.04}px serif`; ctx.textAlign='center';
      ctx.fillText(decors[i], dx, groundY+3);
    });

    // Character — game-style proportional, not too large
    const charScale = Math.min(H / 380, 1.4); // max 1.4x
    ctx.save();
    ctx.translate(W/2, groundY - 5);
    ctx.scale(charScale, charScale);
    if(typeof drawChibiChar==='function') drawChibiChar(ctx, 0, 0, _profileFacing||1, 'idle', Math.floor(Date.now()/100), cfg);
    ctx.restore();

    // Name label overlay at bottom
    ctx.fillStyle='rgba(0,0,0,0.45)';
    ctx.fillRect(0,H-36,W,36);
    ctx.fillStyle='#FFE600';
    ctx.font='bold '+Math.round(W*0.05)+'px "Archivo Black",sans-serif';
    ctx.textAlign='center';
    ctx.fillText(S.name||'User', W/2, H-14);
  }, 50);

  // Customization sections — rendered separately in edit mode
  renderProfileEdit();
}

function renderProfileEdit() {
  const custEl = $('profile-customizer'); if(!custEl) return;
  const cfg = getCharConfig();

  custEl.innerHTML = `
    <!-- Preview karakter (sticky di atas) -->
    <div style="position:sticky;top:0;z-index:5;background:var(--bg);padding:9px 0 7px;border-bottom:2px solid var(--yellow);margin-bottom:11px;">
      <canvas id="profile-edit-preview" width="280" height="140"
        style="display:block;margin:0 auto;width:100%;max-width:280px;height:auto;"></canvas>
    </div>

    <!-- Kulit (terpisah) -->
    <div class="sec-hdr" style="margin-top:4px;"><div class="sec-title">Warna Kulit</div></div>
    <div style="margin-bottom:11px;">${renderColorPicker('skinColor','',cfg.skinColor)}</div>

    <!-- Rambut -->
    <div class="sec-hdr"><div class="sec-title">Rambut</div></div>
    <div style="display:flex;gap:6px;margin-bottom:7px;">
      ${['short','long','bun'].map(s=>`<button class="btn btn-sm${cfg.hairStyle===s?' btn-primary':''}"
        onclick="setCharStyle('hairStyle','${s}')">${s==='short'?'Pendek':s==='long'?'Panjang':'Sanggul'}</button>`).join('')}
    </div>
    ${renderColorPicker('hairColor','Warna Rambut',cfg.hairColor)}

    <!-- Baju -->
    <div class="sec-hdr"><div class="sec-title">Baju</div></div>
    ${renderColorPicker('shirtColor','Warna Baju',cfg.shirtColor)}

    <!-- Celana -->
    <div class="sec-hdr"><div class="sec-title">Celana</div></div>
    ${renderColorPicker('pantsColor','Warna Celana',cfg.pantsColor)}

    <!-- Sepatu -->
    <div class="sec-hdr"><div class="sec-title">Sepatu</div></div>
    ${renderColorPicker('shoeColor','Warna Sepatu',cfg.shoeColor)}

    <!-- Aksesoris -->
    <div class="sec-hdr"><div class="sec-title">Aksesoris</div></div>
    <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:7px;">
      ${['none','hat','glasses','scarf'].map(a=>`<button class="btn btn-sm${cfg.accessory===a?' btn-primary':''}"
        onclick="setCharStyle('accessory','${a}')">${a==='none'?'Tidak ada':a==='hat'?'Topi':a==='glasses'?'Kacamata':'Syal'}</button>`).join('')}
    </div>
    ${cfg.accessory !== 'none' ? renderColorPicker('accColor','Warna Aksesoris',cfg.accColor) : ''}

    <div style="padding-bottom:80px;"></div>
    `;

  // Draw preview
  drawEditPreview();
}

function drawEditPreview() {
  const canvas = $('profile-edit-preview'); if(!canvas) return;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  const cfg = getCharConfig();
  const bg = typeof getProfileBgConfig==='function' ? getProfileBgConfig() : {top:'#1a2d4a',bot:'#2d4a6a',grass:'#2d5a1a'};

  // Sky
  const skyG = ctx.createLinearGradient(0,0,0,H);
  skyG.addColorStop(0,bg.top); skyG.addColorStop(1,bg.bot);
  ctx.fillStyle=skyG; ctx.fillRect(0,0,W,H);

  // Ground
  const gy = H*0.65;
  ctx.fillStyle=bg.grass||'#2d5a1a'; ctx.fillRect(0,gy,W,H-gy);

  // Char — centered, scaled
  const scale = W / 140;
  ctx.save();
  ctx.translate(W/2, gy);
  ctx.scale(scale, scale);
  if(typeof drawChibiChar==='function') drawChibiChar(ctx, 0, 0, _profileFacing||1, 'idle', Math.floor(Date.now()/100), cfg);
  ctx.restore();

  // Label
  ctx.fillStyle='rgba(255,204,0,0.9)';
  ctx.font='bold 9px "IBM Plex Mono",monospace';
  ctx.textAlign='center';
  ctx.fillText('PREVIEW', W/2, H-4);
}

let _profileFacing = 1;
let _profileRotInterval = null;

function rotateProfileChar() {
  _profileFacing *= -1;
  renderProfilePage();
}

function renderColorPicker(key, label, currentVal) {
  const colors = ['#3a2000','#f5c5a3','#d4a070','#c8855a','#5c3a1e','#4a90d9','#e83535','#2d4a8a','#4aaa55','#aa44aa','#f5a623','#1a1a1a','#ffffff','#888888'];
  return `<div style="margin-bottom:7px;width:100%;">
    <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);margin-bottom:4px;text-transform:uppercase;">${label}</div>
    <div style="display:flex;gap:5px;flex-wrap:wrap;">
      ${colors.map(c=>`<div onclick="setCharColor('${key}','${c}')"
        style="width:22px;height:22px;background:${c};border:2px solid ${c===currentVal?'var(--yellow)':'var(--bc)'};cursor:pointer;"></div>`).join('')}
    </div>
  </div>`;
}

function setCharColor(key, val) {
  const cfg = getCharConfig(); cfg[key] = val; saveCharConfig(cfg);
  // Update color picker highlights without full re-render
  document.querySelectorAll(`[onclick*="setCharColor('${key}'"]`).forEach(el=>{
    const elColor = el.getAttribute('onclick').match(/'([^']+)'\)$/)?.[1];
    el.style.border = elColor===val ? '2px solid var(--text)' : '2px solid var(--bc)';
  });
  drawEditPreview();
  renderProfilePage();
  renderHomeAvatar();
}
function setCharStyle(key, val) {
  const cfg = getCharConfig(); cfg[key] = val; saveCharConfig(cfg);
  renderProfileEdit();
  renderProfilePage();
  renderHomeAvatar();
}

function getProfileBgConfig() {
  try {
    const r = localStorage.getItem('oht_profile_bg');
    return r ? JSON.parse(r) : {id:'default', top:'#1a2d4a', bot:'#2d4a6a', grass:'#2d5a1a'};
  } catch(e) { return {id:'default', top:'#1a2d4a', bot:'#2d4a6a', grass:'#2d5a1a'}; }
}

// ════════════════════════════════════════════════════════════
// SHOP SYSTEM (MORE MENU)
// ════════════════════════════════════════════════════════════

function getShopItems() {
  return [
    // ── AKSESORIS KARAKTER (bentuk, bukan warna) ──
    { id:'acc_hat_classic', name:'Topi Klasik', category:'character', price:3,
      preview:'hat', previewColor:'#8B4513',
      desc:'Topi cokelat klasik untuk petualang',
      apply:()=>{ const c=getCharConfig(); c.accessory='hat'; c.accColor='#8B4513'; saveCharConfig(c); } },
    { id:'acc_hat_cool',    name:'Topi Keren',  category:'character', price:3,
      preview:'hat', previewColor:'#1a1a2e',
      desc:'Topi hitam misterius',
      apply:()=>{ const c=getCharConfig(); c.accessory='hat'; c.accColor='#1a1a2e'; saveCharConfig(c); } },
    { id:'acc_hat_chef',    name:'Topi Chef',   category:'character', price:4,
      preview:'hat', previewColor:'#ffffff',
      desc:'Topi koki profesional, putih bersih',
      apply:()=>{ const c=getCharConfig(); c.accessory='hat'; c.accColor='#f5f5f5'; saveCharConfig(c); } },
    { id:'acc_glasses_round', name:'Kacamata Bulat', category:'character', price:3,
      preview:'glasses', previewColor:'#1a1a1a',
      desc:'Kacamata bulat klasik bergaya retro',
      apply:()=>{ const c=getCharConfig(); c.accessory='glasses'; c.accColor='#1a1a1a'; saveCharConfig(c); } },
    { id:'acc_glasses_gold',  name:'Kacamata Emas',  category:'character', price:4,
      preview:'glasses', previewColor:'#ffd700',
      desc:'Kacamata mewah frame emas',
      apply:()=>{ const c=getCharConfig(); c.accessory='glasses'; c.accColor='#ffd700'; saveCharConfig(c); } },
    { id:'acc_scarf_wool',  name:'Syal Wol', category:'character', price:3,
      preview:'scarf', previewColor:'#c0392b',
      desc:'Syal wol hangat berwarna merah',
      apply:()=>{ const c=getCharConfig(); c.accessory='scarf'; c.accColor='#c0392b'; saveCharConfig(c); } },
    { id:'acc_scarf_stripe',name:'Syal Strip', category:'character', price:3,
      preview:'scarf', previewColor:'#2980b9',
      desc:'Syal bergaris biru dan putih',
      apply:()=>{ const c=getCharConfig(); c.accessory='scarf'; c.accColor='#2980b9'; saveCharConfig(c); } },
    { id:'hair_long',  name:'Rambut Panjang', category:'character', price:2,
      preview:'hair_long', previewColor:'#3a2000',
      desc:'Rambut panjang terurai elegan',
      apply:()=>{ const c=getCharConfig(); c.hairStyle='long'; saveCharConfig(c); } },
    { id:'hair_bun',   name:'Gaya Sanggul',   category:'character', price:2,
      preview:'hair_bun', previewColor:'#3a2000',
      desc:'Sanggul rapi dan anggun',
      apply:()=>{ const c=getCharConfig(); c.hairStyle='bun'; saveCharConfig(c); } },

    // ── BACKGROUND PROFIL ──
    { id:'pbg_default', name:'Lahan Biasa', category:'profile_bg', price:0,
      bgDef:{top:'#1a2d4a',bot:'#2d4a6a',grass:'#2d5a1a'},
      desc:'Background default, selalu tersedia',
      apply:()=>{ localStorage.setItem('oht_profile_bg', JSON.stringify({id:'pbg_default',top:'#1a2d4a',bot:'#2d4a6a',grass:'#2d5a1a'})); } },
    { id:'pbg_sunset',  name:'Senja Emas',  category:'profile_bg', price:3,
      bgDef:{top:'#ff6b35',bot:'#c0392b',grass:'#4a3000'},
      desc:'Langit jingga hangat kala senja',
      apply:()=>{ localStorage.setItem('oht_profile_bg', JSON.stringify({id:'pbg_sunset',top:'#ff6b35',bot:'#c0392b',grass:'#4a3000'})); } },
    { id:'pbg_night',   name:'Malam Bintang', category:'profile_bg', price:3,
      bgDef:{top:'#050b1a',bot:'#0a1428',grass:'#1a2a0a'},
      desc:'Malam gelap bertabur bintang',
      apply:()=>{ localStorage.setItem('oht_profile_bg', JSON.stringify({id:'pbg_night',top:'#050b1a',bot:'#0a1428',grass:'#1a2a0a'})); } },
    { id:'pbg_spring',  name:'Musim Semi',    category:'profile_bg', price:4,
      bgDef:{top:'#87d4ef',bot:'#b8eecc',grass:'#4a8a2a'},
      desc:'Langit cerah segar musim bunga',
      apply:()=>{ localStorage.setItem('oht_profile_bg', JSON.stringify({id:'pbg_spring',top:'#87d4ef',bot:'#b8eecc',grass:'#4a8a2a'})); } },
    { id:'pbg_cherry',  name:'Sakura Pink',   category:'profile_bg', price:5,
      bgDef:{top:'#ffb7c5',bot:'#ff69b4',grass:'#8a4a6a'},
      desc:'Langit merah muda penuh bunga sakura',
      apply:()=>{ localStorage.setItem('oht_profile_bg', JSON.stringify({id:'pbg_cherry',top:'#ffb7c5',bot:'#ff69b4',grass:'#8a4a6a'})); } },
    { id:'pbg_storm',   name:'Badai Abu',     category:'profile_bg', price:4,
      bgDef:{top:'#2c3e50',bot:'#4a4a4a',grass:'#2d3a1a'},
      desc:'Langit mendung dramatis',
      apply:()=>{ localStorage.setItem('oht_profile_bg', JSON.stringify({id:'pbg_storm',top:'#2c3e50',bot:'#4a4a4a',grass:'#2d3a1a'})); } },
    { id:'pbg_aurora',  name:'Aurora Borealis', category:'profile_bg', price:6,
      bgDef:{top:'#0a1a0f',bot:'#1a0a2f',grass:'#1a4a1a'},
      desc:'Cahaya utara yang memukau',
      apply:()=>{ localStorage.setItem('oht_profile_bg', JSON.stringify({id:'pbg_aurora',top:'#0a1a0f',bot:'#1a0a2f',grass:'#1a4a1a'})); } },

    // ── GARDEN ──
    { id:'boost_water', name:'Jatah Siram +3', category:'garden', price:2,
      preview:'💧', desc:'Tambah 3 jatah siram sekarang',
      apply:()=>{ const g=getGardenData(); g.waterCount=(g.waterCount||0)+3; saveGardenData(g); if($("gdn-water-count"))$("gdn-water-count").textContent=g.waterCount; } },
    { id:'boost_hoe',   name:'Cangkul +2',     category:'garden', price:2,
      preview:'⛏️', desc:'Tambah 2 cangkul (max 5)',
      apply:()=>{ const g=getGardenData(); g.hoeCount=Math.min(5,(g.hoeCount||0)+2); saveGardenData(g); if($("gdn-hoe-count"))$("gdn-hoe-count").textContent=g.hoeCount; } },
    { id:'fertilizer',  name:'Pupuk Kilat',    category:'garden', price:4,
      preview:'⚡', desc:'Percepat panen semua tanaman 4 jam',
      apply:()=>{ const g=getGardenData(); g.lands.forEach(l=>l.plots.forEach(p=>{ if(p.readyAt) p.readyAt=Math.max(Date.now(),p.readyAt-14400000); })); saveGardenData(g); } },
    { id:'medicine',    name:'Obat Tanaman',   category:'garden', price:3,
      preview:'💊', desc:'Pulihkan semua tanaman layu sekarang',
      apply:()=>{ const g=getGardenData(); g.lands.forEach(l=>l.plots.forEach(p=>{ if(p.wilted){p.wilted=false;p.lastWatered=Date.now();} })); saveGardenData(g); } },
    { id:'land_slot',   name:'Lahan Baru',     category:'garden', price:5,
      preview:'🌾', desc:'Buka lahan baru dengan 16 plot tambahan',
      apply:()=>{ const g=getGardenData(); const locked=g.lands.find(l=>!l.unlocked); if(locked){locked.unlocked=true;saveGardenData(g);toast("🎉 Lahan baru terbuka!",'success');} else toast("Semua lahan sudah terbuka!",'info'); } },
  ];
}

function openMainShop() {
  renderMainShopContent('character');
  openModal('modal-main-shop');
}

function setMainShopTab(tab, el) {
  document.querySelectorAll('[id^="mshop-tab-"]').forEach(b=>b.classList.remove('active'));
  if(el) el.classList.add('active');
  renderMainShopContent(tab);
}

function renderMainShopContent(tab) {
  const el = $('main-shop-content'); if(!el) return;
  const g = getGardenData();
  const coins = g.coins || 0;
  const owned = JSON.parse(localStorage.getItem('oht_shop_owned') || '[]');

  // Update coin displays
  ['mshop-coins','shop-page-coins'].forEach(id=>{ const e=$(id); if(e) e.textContent=coins; });

  const items = getShopItems().filter(it => it.category === tab);
  if(!items.length) {
    el.innerHTML = `<div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);padding:24px;text-align:center;">Belum ada item.</div>`;
    return;
  }

  el.innerHTML = items.map(it => {
    const isOwned = owned.includes(it.id) || it.price === 0;
    const canAfford = coins >= it.price;

    // Preview visual
    let prevHtml = '';
    if(it.bgDef) {
      // BG preview box
      const hasStars = it.bgDef.top < '#3';
      prevHtml = `<div style="width:80px;height:60px;flex-shrink:0;position:relative;overflow:hidden;border:1.5px solid var(--bc);">
        <div style="position:absolute;inset:0;background:linear-gradient(${it.bgDef.top},${it.bgDef.bot});"></div>
        <div style="position:absolute;bottom:0;left:0;right:0;height:20px;background:${it.bgDef.grass};"></div>
        ${hasStars?`<div style="position:absolute;top:5px;left:8px;width:2px;height:2px;background:#fff;border-radius:50%;"></div>
          <div style="position:absolute;top:10px;left:35px;width:1.5px;height:1.5px;background:#fff;border-radius:50%;"></div>
          <div style="position:absolute;top:7px;right:12px;width:2px;height:2px;background:#fff;border-radius:50%;"></div>`:''}
        ${it.id==='pbg_sunset'?`<div style="position:absolute;top:8px;left:50%;transform:translateX(-50%);width:14px;height:14px;background:#ffd700;border-radius:50%;box-shadow:0 0 8px #ff9900;"></div>`:''}
        ${it.id==='pbg_spring'?`<div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);width:12px;height:12px;background:#ffe66d;border-radius:50%;box-shadow:0 0 6px #fff;"></div>`:''}
        ${it.id==='pbg_cherry'?`<div style="position:absolute;top:4px;left:12px;font-size:9px;">🌸</div><div style="position:absolute;top:12px;right:10px;font-size:8px;">🌸</div>`:''}
        ${it.id==='pbg_aurora'?`<div style="position:absolute;inset:0;background:linear-gradient(transparent 20%,rgba(0,255,120,.18),rgba(120,0,255,.12),transparent);"></div>`:''}
        ${it.id==='pbg_night'?`<div style="position:absolute;top:5px;right:10px;font-size:8px;">🌙</div>`:''}
        ${it.id==='pbg_storm'?`<div style="position:absolute;top:4px;left:20px;font-size:8px;">⛈️</div>`:''}
      </div>`;
    } else if(it.preview && /hat|glasses|scarf|hair/.test(it.preview)) {
      prevHtml = `<canvas id="prev_${it.id.replace(/[^a-z0-9]/gi,'_')}" width="60" height="60"
        style="flex-shrink:0;border:1.5px solid var(--bc);background:var(--surface);"></canvas>`;
    } else if(it.preview) {
      prevHtml = `<div style="width:60px;height:60px;flex-shrink:0;border:1.5px solid var(--bc);background:var(--surface);display:flex;align-items:center;justify-content:center;font-size:26px;">${it.preview}</div>`;
    }

    const btnLabel = isOwned ? '✅ TERAPKAN' : canAfford ? `🪙 ${it.price}` : `🪙 ${it.price} ✗`;
    const cardClass = isOwned ? 'owned' : !canAfford ? 'cant-afford' : '';

    return `<div class="shop-item-card ${cardClass}"
      onclick="${isOwned||canAfford?`shopAction('${it.id}',${isOwned})`:''}">
      ${prevHtml}
      <div class="shop-item-info" style="flex:1;min-width:0;">
        <div class="shop-item-name">${it.name}</div>
        <div class="shop-item-desc">${it.desc||''}</div>
      </div>
      <div style="flex-shrink:0;font-family:'Archivo Black',sans-serif;font-size:12px;
        color:${isOwned?'var(--lime)':canAfford?'var(--yellow)':'#666'};text-align:right;min-width:60px;">
        ${btnLabel}
      </div>
    </div>`;
  }).join('');

  // Draw char previews on mini canvas
  setTimeout(() => {
    items.forEach(it => {
      if(!it.preview || !/hat|glasses|scarf|hair/.test(it.preview)) return;
      const cvs = $('prev_' + it.id.replace(/[^a-z0-9]/gi,'_')); if(!cvs) return;
      const ctx = cvs.getContext('2d');
      ctx.clearRect(0,0,60,60);
      const previewCfg = {...getCharConfig()};
      if(it.preview==='hat'||it.preview==='glasses'||it.preview==='scarf') {
        previewCfg.accessory=it.preview; previewCfg.accColor=it.previewColor||'#888';
      } else if(it.preview==='hair_long') { previewCfg.hairStyle='long'; }
      else if(it.preview==='hair_bun')  { previewCfg.hairStyle='bun'; }
      ctx.save();
      ctx.translate(30, 52);
      ctx.scale(0.62, 0.62);
      drawChibiChar(ctx, 0, 0, 1, 'idle', 0, previewCfg);
      ctx.restore();
    });
  }, 80);
}

function buyShopItem(id) {
  const g = getGardenData();
  const it = getShopItems().find(x => x.id === id);
  if(!it) return;
  if((g.coins||0) < it.price) { toast('Koin tidak cukup!', 'error'); return; }
  g.coins -= it.price;
  saveGardenData(g);
  const owned = JSON.parse(localStorage.getItem('oht_shop_owned') || '[]');
  if(!owned.includes(id)) { owned.push(id); localStorage.setItem('oht_shop_owned', JSON.stringify(owned)); }
  it.apply();
  const _sc2=$('mshop-coins')||$('shop-page-coins'); if(_sc2) _sc2.textContent=g.coins;
  if($('gdn-coins')) $('gdn-coins').textContent = g.coins;
  const activTab = document.querySelector('[id^="mshop-tab-"].active');
  if(activTab) renderMainShopContent(activTab.id.replace('mshop-tab-',''));
  else renderMainShopContent(it.category);
  toast(`✅ ${it.name} dibeli!`, 'success');
  if(typeof renderProfilePage === 'function') renderProfilePage();
}

function applyShopItem(id) {
  const it = getShopItems().find(x => x.id === id);
  if(it) { it.apply(); toast(`✅ ${it.name} diterapkan!`, 'success'); renderProfilePage(); }
}

// ── Shop page init ──────────────────────────────────────
function initShopPage() {
  const g = getGardenData();
  const el = $('shop-page-coins'); if(el) el.textContent = g.coins||0;
  setMainShopTab('character', $('mshop-tab-character'));
}

// Fix openMainShop — navigate ke page shop bukan modal
function openMainShop() {
  navigateMore('shop');
}

// ════════════════════════════════════════════════════════════
// MINI AVATAR di HOME (canvas xp-avatar)
// ════════════════════════════════════════════════════════════
function renderHomeAvatar() {
  const canvas = $('xp-avatar-canvas'); if(!canvas) return;
  const W = canvas.width, H = canvas.height;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  if(typeof drawChibiChar !== 'function' || typeof getCharConfig !== 'function') return;
  const cfg = getCharConfig();
  const bg  = typeof getProfileBgConfig === 'function' ? getProfileBgConfig() : {top:'#1a2d4a',bot:'#2d4a6a'};

  // Save clean state, clip to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(W/2, H/2, W/2-1, 0, Math.PI*2);
  ctx.clip();

  // Sky gradient
  const grd = ctx.createLinearGradient(0,0,0,H);
  grd.addColorStop(0, bg.top || '#1a2d4a');
  grd.addColorStop(1, bg.bot || '#2d4a6a');
  ctx.fillStyle = grd;
  ctx.fillRect(0,0,W,H);

  // Grass strip
  ctx.fillStyle = bg.grass || '#2d5a1a';
  ctx.fillRect(0, H*0.65, W, H*0.35);

  // Draw char — positioned at center-bottom of circle
  const scale = W / 100;
  ctx.save();
  ctx.translate(W/2, H*0.82);
  ctx.scale(scale, scale);
  drawChibiChar(ctx, 0, 0, 1, 'idle', 0, cfg);
  ctx.restore();

  ctx.restore(); // end clip

  // Yellow border
  ctx.strokeStyle = '#FFE600';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(W/2, H/2, W/2-1.5, 0, Math.PI*2);
  ctx.stroke();
}

// Hook renderHomeAvatar ke renderStats
// renderHomeAvatar hook merged into renderStats directly

// ════════════════════════════════════════════════════════════
// JADWAL & PENGINGAT SYSTEM
// ════════════════════════════════════════════════════════════

function getJadwalData() {
  try { const r=localStorage.getItem('oht_jadwal'); return r?JSON.parse(r):[]; } catch(e){return [];}
}
function saveJadwalData(d) { try{localStorage.setItem('oht_jadwal',JSON.stringify(d));}catch(e){} }

let _jadwalEditId = null;
let _jadwalTimes = ['08:00'];
const JADWAL_COLORS = ['#FFE600','#FF6B00','#FF3CAC','#00F5D4','#AAFF00','#9B5DE5','#4af','#e83','#fff'];

function initJadwalPage() {
  _jadwalEditId = null;
  renderJadwalList();
  requestNotifPermission();
  scheduleAllJadwal();
}

function requestNotifPermission() {
  if('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(p => {
      if(p === 'granted') toast('✅ Notifikasi diaktifkan!','success');
    });
  }
}

function renderJadwalList() {
  const el = $('jadwal-list'); if(!el) return;
  const jadwals = getJadwalData();
  if(!jadwals.length) {
    el.innerHTML = `<div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);text-align:center;padding:24px;">
      Belum ada jadwal. Tap + TAMBAH untuk mulai.
    </div>`; return;
  }

  el.innerHTML = jadwals.map(j => {
    const dayNames=['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    const activeDays = (j.days||[0,1,2,3,4,5,6]).map(d=>dayNames[d]).join(' ');
    return `<div class="jadwal-card" style="border-left:3px solid ${j.color||'var(--yellow)'};">
      <div class="jadwal-card-main">
        <div class="jadwal-emoji">${j.emoji||'📅'}</div>
        <div class="jadwal-info">
          <div class="jadwal-name" style="color:${j.color||'var(--yellow)'};">${j.name}</div>
          <div class="jadwal-times">${(j.times||[]).map(t=>`<span class="jadwal-time-chip">⏰ ${t}</span>`).join('')}</div>
          <div class="jadwal-days">${activeDays}</div>
        </div>
        <div class="jadwal-actions">
          <button class="btn btn-xs" onclick="editJadwal('${j.id}')">✏️</button>
          <button class="btn btn-xs btn-danger" onclick="deleteJadwal('${j.id}')">🗑️</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

function openAddJadwalModal() {
  _jadwalEditId = null;
  _jadwalTimes = ['08:00'];
  const nameEl=$('jadwal-inp-name'); if(nameEl) nameEl.value='';
  $('jadwal-modal-title').textContent='TAMBAH JADWAL';
  $('jadwal-inp-emoji').value='💧';
  $('jadwal-inp-color').value='#FFE600';
  // Reset emoji picker
  buildJadwalEmojiPicker();
  buildJadwalColorPicker();
  buildJadwalTimesList();
  // Reset days — semua aktif
  document.querySelectorAll('#jadwal-days-picker .freq-btn').forEach(b=>b.classList.add('sel'));
  openModal('modal-jadwal');
}

function editJadwal(id) {
  const j = getJadwalData().find(x=>x.id===id); if(!j) return;
  _jadwalEditId = id;
  _jadwalTimes = [...(j.times||['08:00'])];
  $('jadwal-modal-title').textContent='EDIT JADWAL';
  const nameEl=$('jadwal-inp-name'); if(nameEl) nameEl.value=j.name;
  $('jadwal-inp-emoji').value=j.emoji||'💧';
  $('jadwal-inp-color').value=j.color||'#FFE600';
  buildJadwalEmojiPicker(j.emoji);
  buildJadwalColorPicker(j.color);
  buildJadwalTimesList();
  // Days
  const days=j.days||[0,1,2,3,4,5,6];
  document.querySelectorAll('#jadwal-days-picker .freq-btn').forEach(b=>{
    const d=parseInt(b.dataset.day);
    b.classList.toggle('sel',days.includes(d));
  });
  openModal('modal-jadwal');
}

function buildJadwalEmojiPicker(selected='💧') {
  const emojis='💧🎯📚💪😴🍎🧘‍♀️💊🏃‍♂️💼📝🎵🌿☕🏋️🎨🚿🍵'.split('').filter(Boolean);
  const container=$('jadwal-emoji-picker'); if(!container) return;
  // Split into individual emojis properly
  const emojiList=['💧','🎯','📚','💪','😴','🍎','🧘','💊','🏃','💼','📝','🎵','🌿','☕','🏋','🎨','🚿','🍵'];
  const cur=$('jadwal-inp-emoji')?.value||'💧';
  container.innerHTML=emojiList.map(e=>`<div onclick="selectJadwalEmoji('${e}')"
    style="font-size:22px;cursor:pointer;padding:4px;border:2px solid ${e===cur?'var(--yellow)':'transparent'};
    -webkit-tap-highlight-color:transparent;">${e}</div>`).join('');
}

function selectJadwalEmoji(e) {
  const el=$('jadwal-inp-emoji'); if(el) el.value=e;
  buildJadwalEmojiPicker(e);
}

function buildJadwalColorPicker(selected='#FFE600') {
  const container=$('jadwal-color-picker'); if(!container) return;
  const cur=$('jadwal-inp-color')?.value||'#FFE600';
  container.innerHTML=JADWAL_COLORS.map(c=>`<div onclick="selectJadwalColor('${c}')"
    style="width:26px;height:26px;background:${c};border:2px solid ${c===cur?'var(--text)':'var(--bc)'};cursor:pointer;"></div>`).join('');
}

function selectJadwalColor(c) {
  const el=$('jadwal-inp-color'); if(el) el.value=c;
  buildJadwalColorPicker(c);
}

function buildJadwalTimesList() {
  const container=$('jadwal-times-list'); if(!container) return;
  container.innerHTML=_jadwalTimes.map((t,i)=>`
    <div style="display:flex;align-items:center;gap:7px;">
      <input type="time" value="${t}" onchange="updateJadwalTime(${i},this.value)"
        style="flex:1;font-family:'Archivo Black',sans-serif;font-size:14px;background:var(--surface);border:var(--bo-t);color:var(--text);padding:6px 9px;">
      ${_jadwalTimes.length>1?`<button class="btn btn-xs btn-danger" onclick="removeJadwalTime(${i})">✕</button>`:''}
    </div>`).join('');
}

function addJadwalTimeSlot() {
  _jadwalTimes.push('12:00');
  buildJadwalTimesList();
}

function updateJadwalTime(idx, val) { _jadwalTimes[idx]=val; }

function removeJadwalTime(idx) {
  _jadwalTimes.splice(idx,1);
  buildJadwalTimesList();
}

function saveJadwal() {
  const name=($('jadwal-inp-name')?.value||'').trim();
  if(!name){toast('Isi nama jadwal!','error');return;}
  const emoji=$('jadwal-inp-emoji')?.value||'📅';
  const color=$('jadwal-inp-color')?.value||'#FFE600';
  const days=[...document.querySelectorAll('#jadwal-days-picker .freq-btn.sel')].map(b=>parseInt(b.dataset.day));
  if(!days.length){toast('Pilih minimal 1 hari!','error');return;}
  const times=_jadwalTimes.filter(Boolean);
  if(!times.length){toast('Tambah minimal 1 waktu!','error');return;}

  const jadwals=getJadwalData();
  if(_jadwalEditId) {
    const idx=jadwals.findIndex(j=>j.id===_jadwalEditId);
    if(idx>=0) jadwals[idx]={...jadwals[idx],name,emoji,color,times,days};
  } else {
    jadwals.push({id:'j'+Date.now(),name,emoji,color,times,days,createdAt:Date.now()});
  }
  saveJadwalData(jadwals);
  scheduleAllJadwal();
  closeModal('modal-jadwal');
  renderJadwalList();
  toast(`✅ Jadwal "${name}" disimpan!`,'success');
}

function deleteJadwal(id) {
  if(!confirm('Hapus jadwal ini?')) return;
  const jadwals=getJadwalData().filter(j=>j.id!==id);
  saveJadwalData(jadwals);
  renderJadwalList();
  toast('Jadwal dihapus','info');
}

// ── Notification scheduler ──────────────────────────────
let _jadwalTimers=[];

function scheduleAllJadwal() {
  // Clear existing timers
  _jadwalTimers.forEach(t=>clearTimeout(t));
  _jadwalTimers=[];
  if(!('Notification' in window) || Notification.permission !== 'granted') return;

  const jadwals=getJadwalData();
  const now=new Date();
  const todayDay=now.getDay();

  jadwals.forEach(j=>{
    if(!(j.days||[0,1,2,3,4,5,6]).includes(todayDay)) return;
    (j.times||[]).forEach(timeStr=>{
      const [hh,mm]=timeStr.split(':').map(Number);
      const target=new Date(now); target.setHours(hh,mm,0,0);
      const ms=target-now;
      if(ms>0 && ms<86400000) { // within next 24h
        const timer=setTimeout(()=>{
          new Notification(`${j.emoji} ${j.name}`, {
            body:`Waktunya: ${timeStr}`,
            icon:'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="%23FFE600"/><text y="24" font-size="22" x="4">🔔</text></svg>'
          });
          // Reschedule for next day
          scheduleJadwalNext(j, timeStr);
        }, ms);
        _jadwalTimers.push(timer);
      }
    });
  });
}

function scheduleJadwalNext(j, timeStr) {
  // Schedule for same time tomorrow if day matches
  const [hh,mm]=timeStr.split(':').map(Number);
  const tomorrow=new Date(); tomorrow.setDate(tomorrow.getDate()+1); tomorrow.setHours(hh,mm,0,0);
  const tomorrowDay=tomorrow.getDay();
  if((j.days||[0,1,2,3,4,5,6]).includes(tomorrowDay)) {
    const ms=tomorrow-new Date();
    const timer=setTimeout(()=>{
      new Notification(`${j.emoji} ${j.name}`, {body:`Waktunya: ${timeStr}`});
      scheduleJadwalNext(j, timeStr);
    }, ms);
    _jadwalTimers.push(timer);
  }
}

// Schedule on app init
setTimeout(scheduleAllJadwal, 2000);

function shopAction(id, isOwned) {
  if(isOwned) applyShopItem(id);
  else buyShopItem(id);
}

// ════════════════════════════════════════════════════════════
// FIREBASE — Friends & Chat System
// ════════════════════════════════════════════════════════════

const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCUSfLU3VCsCOhj1UAO8CFkHwsfWbk16RM",
  authDomain: "oriashabittracker.firebaseapp.com",
  projectId: "oriashabittracker",
  storageBucket: "oriashabittracker.firebasestorage.app",
  messagingSenderId: "115962126068",
  appId: "1:115962126068:web:7934d7e91a66645e5048a1",
  measurementId: "G-76M1KP4SQ3",
  databaseURL: "https://oriashabittracker-default-rtdb.asia-southeast1.firebasedatabase.app"
};

let _fbApp = null, _fbAuth = null, _fbDb = null;
let _fbUser = null;         // current Firebase user
let _fbProfile = null;      // { username, xp, level, charConfig }
let _chatFriendId = null;   // username sedang dichat
let _chatListener = null;   // Firebase listener aktif
let _friendsListener = null;

function initFirebase() {
  if(_fbApp) return;
  try {
    _fbApp  = firebase.initializeApp(FIREBASE_CONFIG);
    _fbAuth = firebase.auth();
    _fbDb   = firebase.database();
    _fbAuth.onAuthStateChanged(fbOnAuthChanged);
    console.log('[Firebase] initialized');
  } catch(e) {
    console.error('[Firebase] init error:', e);
  }
}

function fbOnAuthChanged(user) {
  _fbUser = user;
  if(user) {
    // Load profile
    _fbDb.ref('users/' + user.uid).once('value').then(snap => {
      _fbProfile = snap.val();
      if(!_fbProfile) {
        // New user — create profile
        const username = user.email.split('@')[0];
        _fbProfile = { username, xp: S.xp||0, level: Math.max(1,Math.floor((S.xp||0)/100)+1), uid: user.uid };
        _fbDb.ref('users/' + user.uid).set(_fbProfile);
        _fbDb.ref('usernames/' + username).set(user.uid);
      }
      // Set online status
      const presenceRef = _fbDb.ref('presence/' + _fbProfile.username);
      presenceRef.set({ online: true, lastSeen: firebase.database.ServerValue.TIMESTAMP });
      presenceRef.onDisconnect().set({ online: false, lastSeen: firebase.database.ServerValue.TIMESTAMP });

      // Sync XP to Firebase
      _fbDb.ref('users/' + user.uid + '/xp').set(S.xp||0);
      _fbDb.ref('users/' + user.uid + '/level').set(Math.max(1,Math.floor((S.xp||0)/100)+1));

      renderFriendsMain();
      renderSettingsAuth();
      renderProfileSocialSection();
    });
  } else {
    renderFriendsLogin();
  }
}

// ── Auth ──────────────────────────────────────────────────
function fbLoginGoogle() {
  if(!_fbAuth) { toast('Firebase belum siap','error'); return; }
  const provider = new firebase.auth.GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  _fbAuth.signInWithPopup(provider)
    .then(result => {
      // Google user — username dari displayName atau email prefix
      const user = result.user;
      return _fbDb.ref('users/' + user.uid).once('value').then(snap => {
        if(!snap.exists()) {
          // First time Google login — buat profile
          let username = (user.displayName || user.email.split('@')[0])
            .toLowerCase().replace(/[^a-z0-9_]/g,'').slice(0,20);
          // Pastikan username unik
          return _fbDb.ref('usernames/' + username).once('value').then(usnap => {
            if(usnap.exists()) username = username + '_' + Math.floor(Math.random()*999);
            const profile = {
              username, uid: user.uid,
              xp: S.xp||0,
              level: Math.max(1,Math.floor((S.xp||0)/100)+1),
              displayName: user.displayName||username,
              photoURL: user.photoURL||null
            };
            return Promise.all([
              _fbDb.ref('users/' + user.uid).set(profile),
              _fbDb.ref('usernames/' + username).set(user.uid)
            ]);
          });
        }
      });
    })
    .catch(e => {
      const errEl = $('fb-auth-error');
      if(errEl) errEl.textContent = e.message;
      toast('Login gagal: ' + e.message, 'error');
    });
}

function fbRegister() {
  const username = ($('fb-username')?.value||'').trim().toLowerCase();
  const pass = $('fb-password')?.value||'';
  const errEl = $('fb-auth-error');

  if(username.length < 3) { if(errEl) errEl.textContent='Username min 3 karakter'; return; }
  if(pass.length < 6) { if(errEl) errEl.textContent='Password min 6 karakter'; return; }
  if(errEl) errEl.textContent='';

  // Check username availability
  _fbDb.ref('usernames/' + username).once('value').then(snap => {
    if(snap.exists()) {
      if(errEl) errEl.textContent = 'Username sudah dipakai, coba yang lain';
      return;
    }
    const email = username + '@oht.user';
    _fbAuth.createUserWithEmailAndPassword(email, pass)
      .then(() => { toast('✅ Akun dibuat!', 'success'); })
      .catch(e => { if(errEl) errEl.textContent = fbErrMsg(e.code); });
  });
}

function fbLogin() {
  const username = ($('fb-username')?.value||'').trim().toLowerCase();
  const pass = $('fb-password')?.value||'';
  const errEl = $('fb-auth-error');
  if(!username || !pass) { if(errEl) errEl.textContent='Isi username dan password'; return; }
  if(errEl) errEl.textContent = '';
  const email = username + '@oht.user';
  _fbAuth.signInWithEmailAndPassword(email, pass)
    .then(() => toast('✅ Masuk!', 'success'))
    .catch(e => { if(errEl) errEl.textContent = fbErrMsg(e.code); });
}

function fbLogout() {
  if(_fbProfile) {
    _fbDb.ref('presence/' + _fbProfile.username).set({ online: false, lastSeen: firebase.database.ServerValue.TIMESTAMP });
  }
  _fbAuth.signOut();
  if(_chatListener) _chatListener(); // detach
  if(_friendsListener) _friendsListener();
}

function fbErrMsg(code) {
  const map = {
    'auth/email-already-in-use': 'Username sudah dipakai',
    'auth/wrong-password': 'Password salah',
    'auth/user-not-found': 'Username tidak ditemukan',
    'auth/too-many-requests': 'Terlalu banyak percobaan, coba lagi nanti',
  };
  return map[code] || 'Error: ' + code;
}

// ── UI Renders ────────────────────────────────────────────
function renderFriendsLogin() {
  const main = $('friends-main-section'); if(main) main.style.display='none';
  const login = $('friends-auth-section'); if(login) login.style.display='block';
}

function renderFriendsMain() {
  if(!_fbProfile) return;
  const login = $('friends-auth-section'); if(login) login.style.display='block';
  const main = $('friends-main-section'); if(main) main.style.display='block';
  const loginForm = $('friends-login-form'); if(loginForm) loginForm.style.display='none';

  const nameEl = $('fb-display-name');
  if(nameEl) {
    const displayName = _fbProfile.displayName || _fbProfile.username;
    nameEl.textContent = displayName;
  }
  const idEl = $('fb-my-id'); if(idEl) idEl.textContent = _fbProfile.username;

  loadFriendsList();
}

// ── Friends ───────────────────────────────────────────────
function fbAddFriend() {
  const targetUsername = ($('fb-add-id')?.value||'').trim().toLowerCase();
  if(!targetUsername) return;
  if(targetUsername === _fbProfile?.username) { toast('Itu kamu sendiri 😅','error'); return; }

  // Check if username exists
  _fbDb.ref('usernames/' + targetUsername).once('value').then(snap => {
    if(!snap.exists()) { toast('User tidak ditemukan','error'); return; }
    const targetUid = snap.val();
    // Add to my friends list
    _fbDb.ref('friends/' + _fbUser.uid + '/' + targetUid).set({
      username: targetUsername, addedAt: firebase.database.ServerValue.TIMESTAMP
    });
    // Add me to their friends list
    _fbDb.ref('friends/' + targetUid + '/' + _fbUser.uid).set({
      username: _fbProfile.username, addedAt: firebase.database.ServerValue.TIMESTAMP
    });
    toast('✅ ' + targetUsername + ' ditambahkan!', 'success');
    const inp = $('fb-add-id'); if(inp) inp.value='';
    loadFriendsList();
  });
}

function loadFriendsList() {
  if(!_fbUser) return;
  if(_friendsListener) _friendsListener(); // detach old

  const ref = _fbDb.ref('friends/' + _fbUser.uid);
  const handler = ref.on('value', snap => {
    const friends = snap.val() || {};
    renderFriendsList(friends);
  });
  _friendsListener = () => ref.off('value', handler);
}

function renderFriendsList(friends) {
  const el = $('friends-list'); if(!el) return;
  const entries = Object.values(friends);
  if(!entries.length) {
    el.innerHTML = `<div class="chat-empty">Belum ada teman.<br>Tambah teman dengan username mereka.</div>`;
    return;
  }

  // Check online + unread for each
  let html = '';
  let pending = entries.length;
  const results = [];

  entries.forEach((f, i) => {
    results[i] = { ...f, online: false, xp: 0, unread: 0 };
  });

  const renderAll = () => {
    el.innerHTML = results.map(f => {
      const xpBadge = f.xp ? `LVL ${Math.max(1,Math.floor(f.xp/100)+1)} · ${f.xp} XP` : '';
      return `<div class="friend-card" onclick="openChat('${f.username}')">
        <div class="friend-online-dot${f.online?' active':''}"></div>
        <div class="friend-info">
          <div class="friend-name">${f.username}</div>
          <div class="friend-sub">${f.online?'🟢 Online':'⚫ Offline'}${xpBadge?' · '+xpBadge:''}</div>
        </div>
        ${f.unread>0?`<div class="friend-unread">${f.unread}</div>`:''}
        <div style="font-family:'IBM Plex Mono',monospace;font-size:9px;color:var(--sub);">chat ›</div>
      </div>`;
    }).join('');
  };

  entries.forEach((f, i) => {
    // Online status
    _fbDb.ref('presence/' + f.username).once('value').then(snap => {
      results[i].online = snap.val()?.online === true;
      // XP
      _fbDb.ref('usernames/' + f.username).once('value').then(usnap => {
        const uid = usnap.val();
        if(uid) {
          _fbDb.ref('users/' + uid + '/xp').once('value').then(xsnap => {
            results[i].xp = xsnap.val()||0;
            pending--;
            if(pending<=0) renderAll();
          });
        } else { pending--; if(pending<=0) renderAll(); }
      });
    });
  });
}

// ── Chat ──────────────────────────────────────────────────
function openChat(friendUsername) {
  _chatFriendId = friendUsername;

  const chatArea = $('chat-area');
  const friendsList = $('friends-list');
  if(chatArea) chatArea.style.display='block';
  if(friendsList) friendsList.style.display='none';

  const nameEl = $('chat-friend-name'); if(nameEl) nameEl.textContent = friendUsername;

  // Check online status
  _fbDb.ref('presence/' + friendUsername).once('value').then(snap => {
    const online = snap.val()?.online === true;
    const dot = $('chat-friend-status');
    if(dot) dot.className = 'friend-online-dot' + (online?' active':'');
  });

  // Load friend XP
  _fbDb.ref('usernames/' + friendUsername).once('value').then(snap => {
    const uid = snap.val();
    if(uid) _fbDb.ref('users/'+uid+'/xp').once('value').then(xsnap => {
      const xp = xsnap.val()||0;
      const lvl = Math.max(1,Math.floor(xp/100)+1);
      const el=$('chat-friend-xp'); if(el) el.textContent=`LVL ${lvl} · ${xp} XP`;
    });
  });

  loadChatMessages();
}

function closeChat() {
  _chatFriendId = null;
  if(_chatListener) { _chatListener(); _chatListener=null; }
  const chatArea = $('chat-area');
  const friendsList = $('friends-list');
  if(chatArea) chatArea.style.display='none';
  if(friendsList) friendsList.style.display='block';
}

function getChatId(a, b) {
  // Deterministic chat room ID dari dua username
  return [a,b].sort().join('__');
}

function loadChatMessages() {
  if(!_chatFriendId || !_fbProfile) return;
  if(_chatListener) { _chatListener(); _chatListener=null; }

  const chatId = getChatId(_fbProfile.username, _chatFriendId);
  const ref = _fbDb.ref('chats/' + chatId).limitToLast(60);

  const handler = ref.on('value', snap => {
    const msgs = snap.val() || {};
    renderChatMessages(Object.values(msgs));
  });
  _chatListener = () => ref.off('value', handler);
}

function renderChatMessages(msgs) {
  const el = $('chat-messages'); if(!el) return;
  if(!msgs.length) {
    el.innerHTML = '<div class="chat-empty">Mulai percakapan! 👋</div>';
    return;
  }

  el.innerHTML = msgs.sort((a,b)=>a.ts-b.ts).map(m => {
    const isMine = m.from === _fbProfile?.username;
    const time = m.ts ? new Date(m.ts).toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'}) : '';
    return `<div class="chat-bubble ${isMine?'mine':'theirs'}">
      ${!isMine?`<span style="font-size:7px;font-weight:700;display:block;margin-bottom:2px;">${m.from}</span>`:''}
      ${escapeHtml(m.text)}
      <span class="chat-time">${time}</span>
    </div>`;
  }).join('');

  // Scroll to bottom
  el.scrollTop = el.scrollHeight;
}

function sendChatMsg() {
  const inp = $('chat-input-text');
  const text = (inp?.value||'').trim();
  if(!text || !_chatFriendId || !_fbProfile) return;

  const chatId = getChatId(_fbProfile.username, _chatFriendId);
  _fbDb.ref('chats/' + chatId).push({
    from: _fbProfile.username,
    text: text,
    ts: firebase.database.ServerValue.TIMESTAMP
  });
  inp.value = '';
}

function copyMyId() {
  const id = _fbProfile?.username || '';
  if(navigator.clipboard) {
    navigator.clipboard.writeText(id).then(()=>toast('ID disalin!','success'));
  } else {
    toast(id,'info');
  }
}

function escapeHtml(str) {
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ── Init friends page ──────────────────────────────────────
function initFriendsPage() {
  initFirebase();
  closeChat();
  if(_fbUser && _fbProfile) {
    renderFriendsMain();
  } else if(_fbUser) {
    // Auth but no profile yet
  } else {
    renderFriendsLogin();
  }
}

// ════════════════════════════════════════════════════════════
// FIREBASE — Numeric ID, Settings Auth, Profile Visitors
// ════════════════════════════════════════════════════════════

// Generate 6-digit numeric ID unik
function generateNumericId() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Render auth block di Settings page
function renderSettingsAuth() {
  const el = $('settings-auth-block'); if(!el) return;

  if(_fbUser && _fbProfile) {
    // Logged in
    const numId = _fbProfile.numId || '------';
    el.innerHTML = `
      <div style="background:var(--surface);border:var(--bo);padding:14px;">
        <div style="display:flex;align-items:center;gap:11px;margin-bottom:11px;">
          <div class="friend-online-dot active"></div>
          <div>
            <div style="font-family:'Archivo Black',sans-serif;font-size:13px;">${_fbProfile.displayName||_fbProfile.username}</div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);">@${_fbProfile.username}</div>
          </div>
        </div>
        <div style="background:var(--bg);border:var(--bo);padding:9px;margin-bottom:9px;display:flex;align-items:center;justify-content:space-between;">
          <div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);margin-bottom:2px;">ID TEMAN</div>
            <div style="font-family:'Archivo Black',sans-serif;font-size:22px;color:var(--yellow);letter-spacing:4px;">${numId}</div>
          </div>
          <button class="btn btn-xs" onclick="copyFriendId('${numId}')">📋 COPY</button>
        </div>
        <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);margin-bottom:11px;">
          Bagikan ID ini ke teman untuk bisa saling terhubung.
        </div>
        <button class="btn" style="width:100%;justify-content:center;" onclick="fbLogout()">🚪 Keluar dari Akun</button>
      </div>`;
  } else {
    // Not logged in
    el.innerHTML = `
      <div style="background:var(--surface);border:var(--bo);padding:14px;">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);margin-bottom:11px;line-height:1.6;">
          Login untuk terhubung dengan teman menggunakan ID numerik 6 digit.
        </div>
        <button onclick="fbLoginGoogle()" style="
          width:100%;display:flex;align-items:center;justify-content:center;gap:10px;
          padding:11px;border:2px solid var(--bc);background:var(--bg);cursor:pointer;
          font-family:'Archivo Black',sans-serif;font-size:12px;color:var(--text);
          margin-bottom:9px;-webkit-tap-highlight-color:transparent;
        ">
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 32.6 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8.9 20-20 0-1.3-.1-2.7-.4-4z"/>
            <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.8 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4c-7.8 0-14.5 4.4-18.1 10.7z"/>
            <path fill="#4CAF50" d="M24 44c5.2 0 10-1.9 13.6-5.1l-6.3-5.2C29.5 35.6 26.9 36 24 36c-5.1 0-9.5-3.3-11.2-8L6.1 33.1C9.6 39.5 16.3 44 24 44z"/>
            <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.5-2.6 4.6-4.8 6l6.3 5.2C41 35.4 44 30.1 44 24c0-1.3-.1-2.7-.4-4z"/>
          </svg>
          Masuk dengan Google
        </button>
        <div style="display:flex;align-items:center;gap:9px;margin-bottom:9px;">
          <div style="flex:1;height:1px;background:var(--bc);"></div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">atau username</div>
          <div style="flex:1;height:1px;background:var(--bc);"></div>
        </div>
        <div class="form-group">
          <label class="form-label">USERNAME</label>
          <input type="text" id="fb-username" class="form-input" placeholder="huruf/angka"
            oninput="this.value=this.value.toLowerCase().replace(/[^a-z0-9_]/g,'')">
        </div>
        <div class="form-group">
          <label class="form-label">PASSWORD</label>
          <input type="password" id="fb-password" class="form-input" placeholder="min 6 karakter">
        </div>
        <div style="display:flex;gap:7px;">
          <button class="btn btn-primary" style="flex:1;justify-content:center;" onclick="fbRegister()">DAFTAR</button>
          <button class="btn" style="flex:1;justify-content:center;" onclick="fbLogin()">MASUK</button>
        </div>
        <div id="fb-auth-error" style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:#f44;margin-top:7px;"></div>
      </div>`;
  }
}

function copyFriendId(id) {
  if(navigator.clipboard) {
    navigator.clipboard.writeText(id).then(()=>toast('ID '+id+' disalin!','success'));
  } else toast('ID: '+id,'info');
}

// ── Update fbOnAuthChanged untuk numeric ID + render settings ──
// Override fbOnAuthChanged tambah numId dan settings render
// fbOnAuthChanged override replaced with inline merge

// ── Add friend by numeric ID ──
function fbAddFriendByNumId(numId) {
  if(!numId || !_fbProfile) return;
  numId = numId.trim();
  if(numId === _fbProfile.numId) { toast('Itu ID kamu sendiri 😅','error'); return; }
  _fbDb.ref('numIds/' + numId).once('value').then(snap => {
    if(!snap.exists()) { toast('ID tidak ditemukan','error'); return; }
    const targetUid = snap.val();
    _fbDb.ref('users/' + targetUid + '/username').once('value').then(usnap => {
      const targetUsername = usnap.val();
      _fbDb.ref('friends/' + _fbUser.uid + '/' + targetUid).set({
        username: targetUsername, numId, addedAt: firebase.database.ServerValue.TIMESTAMP
      });
      _fbDb.ref('friends/' + targetUid + '/' + _fbUser.uid).set({
        username: _fbProfile.username, numId: _fbProfile.numId,
        addedAt: firebase.database.ServerValue.TIMESTAMP
      });
      toast('✅ Teman ditambahkan!', 'success');
      loadFriendsList();
    });
  });
}

// ── Profile: ID display + visitors ──
function renderProfileSocialSection() {
  const el = $('profile-social-section'); if(!el) return;

  if(!_fbUser || !_fbProfile) {
    el.innerHTML = `
      <div style="background:var(--surface);border:var(--bo);padding:11px;text-align:center;">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);">
          Login di Setelan untuk mendapatkan ID teman
        </div>
      </div>`;
    return;
  }

  const numId = _fbProfile.numId || '------';

  // Record kunjungan ke profil sendiri (skip)
  // Load 3 pengunjung terakhir
  _fbDb.ref('visitors/' + _fbUser.uid).orderByChild('ts').limitToLast(3).once('value').then(snap => {
    const visitors = [];
    snap.forEach(child => visitors.unshift(child.val()));

    el.innerHTML = `
      <!-- ID Card -->
      <div style="background:var(--surface);border:var(--bo);padding:11px;margin-bottom:7px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);margin-bottom:3px;">ID TEMAN</div>
          <div style="font-family:'Archivo Black',sans-serif;font-size:20px;color:var(--yellow);letter-spacing:4px;">${numId}</div>
        </div>
        <button class="btn btn-xs" onclick="copyFriendId('${numId}')">📋 COPY</button>
      </div>
      <!-- Visitors -->
      <div style="background:var(--surface);border:var(--bo);padding:11px;">
        <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);margin-bottom:7px;text-transform:uppercase;letter-spacing:1px;">👀 Pengunjung Terakhir</div>
        ${visitors.length ? visitors.map(v => `
          <div style="display:flex;align-items:center;gap:9px;margin-bottom:5px;">
            <div style="font-family:'IBM Plex Mono',monospace;font-size:10px;">@${v.username}</div>
            <div style="font-family:'IBM Plex Mono',monospace;font-size:7px;color:var(--sub);">${timeAgo(v.ts)}</div>
          </div>`).join('') :
          `<div style="font-family:'IBM Plex Mono',monospace;font-size:8px;color:var(--sub);">Belum ada pengunjung</div>`}
      </div>`;
  });
}

function timeAgo(ts) {
  if(!ts) return '';
  const diff = Date.now() - ts;
  const m = Math.floor(diff/60000);
  const h = Math.floor(diff/3600000);
  const d = Math.floor(diff/86400000);
  if(d>0) return d+'h lalu';
  if(h>0) return h+'j lalu';
  if(m>0) return m+'m lalu';
  return 'baru saja';
}

// Record visitor saat buka profile page
function recordProfileVisit(ownerUid) {
  if(!_fbUser || !_fbProfile || ownerUid === _fbUser.uid) return;
  _fbDb.ref('visitors/' + ownerUid).push({
    username: _fbProfile.username,
    numId: _fbProfile.numId||'',
    ts: firebase.database.ServerValue.TIMESTAMP
  });
}

// initProfilePage override removed

// navigate hook removed (merged inline)

// renderFriendsMain duplicate removed

// Override copyMyId untuk numId
function copyMyId() {
  const id = _fbProfile?.numId || _fbProfile?.username || '';
  if(navigator.clipboard) {
    navigator.clipboard.writeText(id).then(()=>toast('ID '+id+' disalin!','success'));
  } else toast('ID: '+id, 'info');
}

// Override fbAddFriend untuk coba numId dulu, fallback ke username
function fbAddFriend() {
  const input = ($('fb-add-id')?.value||'').trim();
  if(!input) return;
  // Jika input 6 digit angka → pakai numId
  if(/^\d{6}$/.test(input)) {
    fbAddFriendByNumId(input);
  } else {
    // Coba sebagai username
    const targetUsername = input.toLowerCase().replace(/[^a-z0-9_]/g,'');
    if(targetUsername === _fbProfile?.username) { toast('Itu kamu sendiri 😅','error'); return; }
    _fbDb.ref('usernames/' + targetUsername).once('value').then(snap => {
      if(!snap.exists()) { toast('User tidak ditemukan. Coba pakai ID 6 digit.','error'); return; }
      const targetUid = snap.val();
      _fbDb.ref('friends/' + _fbUser.uid + '/' + targetUid).set({
        username: targetUsername, addedAt: firebase.database.ServerValue.TIMESTAMP
      });
      _fbDb.ref('friends/' + targetUid + '/' + _fbUser.uid).set({
        username: _fbProfile.username, addedAt: firebase.database.ServerValue.TIMESTAMP
      });
      toast('✅ '+targetUsername+' ditambahkan!','success');
      const inp=$('fb-add-id'); if(inp)inp.value='';
      loadFriendsList();
    });
  }
}

// navigateMore hook removed (merged inline)
