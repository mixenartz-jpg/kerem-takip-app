import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = 'gemini-3.1-flash-lite-preview';

let genAI = null;
let model = null;

function getModel() {
  if (!API_KEY || API_KEY === 'BURAYA_YENI_KEY_YAPISTIR') {
    throw new Error('Gemini API key ayarlanmamış. .env.local dosyasına VITE_GEMINI_API_KEY ekleyin.');
  }
  if (!genAI) {
    genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: MODEL_NAME });
  }
  return model;
}

/* ── Single prompt ── */
export async function askGemini(prompt, systemContext = '') {
  const m = getModel();
  const fullPrompt = systemContext
    ? `${systemContext}\n\nKullanıcı: ${prompt}`
    : prompt;
  const result = await m.generateContent(fullPrompt);
  return result.response.text();
}

/* ── Chat session ── */
export function createChatSession(history = []) {
  const m = getModel();
  return m.startChat({
    history: history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }],
    })),
    generationConfig: {
      maxOutputTokens: 2048,
      temperature: 0.7,
    },
  });
}

export async function sendChatMessage(chatSession, message) {
  const result = await chatSession.sendMessage(message);
  return result.response.text();
}

/* ── YKS Analysis ── */
export async function analyzeYKSPerformance(yksData, trials) {
  const m = getModel();

  const lastTrials = trials.slice(-5);
  const trialSummary = lastTrials.map((t, i) =>
    `Deneme ${i + 1} (${t.date}): TYT Türkçe:${t.tyt?.turkce?.net ?? '-'}, Mat:${t.tyt?.mat?.net ?? '-'}, Fen:${t.tyt?.fen?.net ?? '-'}, Sosyal:${t.tyt?.sosyal?.net ?? '-'}`
  ).join('\n');

  const examDate = yksData.examDate
    ? `YKS tarihi: ${yksData.examDate} (${Math.ceil((new Date(yksData.examDate) - new Date()) / 86400000)} gün kaldı)`
    : 'YKS tarihi belirtilmemiş';

  const prompt = `Sen bir YKS koçusun. Aşağıdaki verilere dayanarak kısa ve pratik bir analiz yap.

${examDate}

Son denemeler:
${trialSummary || 'Henüz deneme girilmemiş.'}

Hedef netler:
TYT Türkçe: ${yksData.targetNets?.tyt_turkce ?? 35}, Mat: ${yksData.targetNets?.tyt_mat ?? 35}, Fen: ${yksData.targetNets?.tyt_fen ?? 17}, Sosyal: ${yksData.targetNets?.tyt_sosyal ?? 17}

Şunları söyle:
1. Hangi derste en çok ilerleme var?
2. En acil çalışılması gereken 2 ders
3. Bu haftaki çalışma önerisi (3 madde)

Türkçe cevap ver, maksimum 200 kelime, madde madde.`;

  const result = await m.generateContent(prompt);
  return result.response.text();
}

/* ── Study Plan Generator ── */
export async function generateStudyPlan(yksData, weakSubjects) {
  const m = getModel();

  const daysLeft = yksData.examDate
    ? Math.ceil((new Date(yksData.examDate) - new Date()) / 86400000)
    : 90;

  const prompt = `Sen bir YKS koçusun. ${daysLeft} günlük YKS sürecinde haftalık çalışma programı öner.

Zayıf dersler: ${weakSubjects.join(', ') || 'belirtilmemiş'}

Şunu yap:
- Her gün için hangi dersin çalışılacağını söyle (Pazartesi-Pazar)
- Her ders için kaç pomodoro (25 dk) öner
- Günde max 6 saat ders çalışmasını varsay

Türkçe cevap ver, tablo formatında.`;

  const result = await m.generateContent(prompt);
  return result.response.text();
}

/* ── Daily Study Plan Generator (Günlük YKS Planı) ── */
export async function generateDailyStudyPlan({ name, targetDept, targetUni, daysLeft, dailyHours, studyLogs, examResults, weakTopics }) {
  const m = getModel();

  const prompt = `Sen bir YKS hazırlık koçusun. Aşağıdaki öğrenci verisine göre BUGÜN için detaylı günlük çalışma planı üret.

ÖĞRENCİ PROFİLİ:
- İsim: ${name}
- Hedef: ${targetDept} (${targetUni})
- YKS'ye kalan gün: ${daysLeft}
- Çalışma kapasitesi: ${dailyHours} saat/gün

SON 7 GÜN ÇALIŞMA VERİSİ:
${JSON.stringify(studyLogs, null, 2)}

SON 3 DENEME NETLERİ:
${JSON.stringify(examResults, null, 2)}

ZAYIF KONULAR (yanlış sıklığına göre):
${JSON.stringify(weakTopics, null, 2)}

KURALLAR:
- Toplam süre ${dailyHours} saati geçmesin
- Sınav ağırlığı yüksek konulara öncelik ver
- Aynı konuyu 3 günde bir tekrar et (spaced repetition)
- Motivasyonunu yüksek tutan kısa bir not ekle
- burnoutRisk: low/medium/high olarak değerlendir

SADECE JSON döndür, başka açıklama yapma.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/);
  return jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(text);
}

/* ── Vision: Soru Çözüm ── */
export async function solveQuestionWithVision(base64Data, mimeType = 'image/jpeg') {
  const m = getModel();
  const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
  const imagePart = { inlineData: { data: cleanBase64, mimeType } };
  const prompt = `Bu soruyu adım adım çöz. Her adımı açıkla ve neden o yolu izlediğini belirt. Formülleri açıkça yaz. Türkçe cevap ver.`;
  const result = await m.generateContent([imagePart, { text: prompt }]);
  return result.response.text();
}

/* ── Burnout Dedektörü ── */
export async function detectBurnout({ pomodoroWorkSessions, habitCompletionRate, taskCompletionRate, daysLeft }) {
  const m = getModel();
  const prompt = `Sen bir öğrenci danışmanısın. Bu verilere göre öğrencinin burnout (tükenme) riskini değerlendir.

SON 7 GÜN:
- Pomodoro seansı: ${pomodoroWorkSessions}
- Alışkanlık tamamlama: %${Math.round(habitCompletionRate)}
- Görev tamamlama: %${Math.round(taskCompletionRate)}
${daysLeft ? `- YKS'ye kalan gün: ${daysLeft}` : ''}

SADECE bu JSON formatında cevap ver, başka hiçbir şey yazma:
{"risk":"low","riskTr":"Düşük","message":"Empati dolu kısa mesaj","recommendations":["Öneri 1","Öneri 2","Öneri 3"]}`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*?\})/);
  return jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(text);
}

/* ── Haftalık Retrospektif ── */
export async function generateWeeklyRetrospective({ pomodoroSessions, taskCompleted, taskTotal, habitNames, examScores, userName }) {
  const m = getModel();
  const prompt = `Sen bir YKS koçusun. ${userName || 'Öğrenci'} için bu haftanın retrospektifini yaz.

BU HAFTA:
- Pomodoro: ${pomodoroSessions} seans
- Görev: ${taskCompleted}/${taskTotal} tamamlandı
- Takip edilen alışkanlıklar: ${habitNames?.join(', ') || '-'}
- Deneme sonuçları: ${JSON.stringify(examScores || [])}

Şunları içer:
1. Bu hafta neyi iyi yaptın (2 madde)
2. Geliştirilebilecek alan (2 madde)
3. Gelecek hafta önerisi (3 madde)

Türkçe, pozitif ve motive edici dille yaz. 250 kelimeyi geçme.`;

  const result = await m.generateContent(prompt);
  return result.response.text();
}

/* ── Plan Değerlendirmesi (Haftalık/Aylık) ── */
export async function evaluatePlansWithAI({ plans, period, userName }) {
  const m = getModel();
  const planList = plans.map(p => `- ${p.text} (Durum: ${p.completed ? 'Tamamlandı' : 'Bekliyor'})`).join('\n');
  const completedCount = plans.filter(p => p.completed).length;
  
  const prompt = `Sen bir üretkenlik asistanısın. ${userName || 'Kullanıcı'} için ${period} değerlendirmesi yap.

PLANLAR:
${planList}

Bu verilere dayanarak kısa, samimi ve motive edici bir değerlendirme yap.
Kullanıcının ${plans.length} hedeften ${completedCount} tanesini tamamladığını dikkate al.
1 paragraf özet, 2 madde başarı/gelişim alanı ve 10 üzerinden bir puanlama yap.

SADECE BU JSON FORMATINDA DÖN:
{
  "summary": "Analiz paragrafı",
  "points": ["Madde 1", "Madde 2"],
  "score": 8
}`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/);
  try { return jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(text); }
  catch { return { summary: text, points: [], score: 5 }; }
}

/* ── Hata Defteri: Otomatik Etiket ── */
export async function autoTagErrorNote(questionDescription) {
  const m = getModel();
  const prompt = `Bu soru açıklamasını analiz et ve hangi ders/konuya ait olduğunu belirle.

Soru: ${questionDescription}

SADECE bu JSON formatında cevap ver:
{"subject":"TYT Matematik","topic":"Trigonometri"}

subject şunlardan biri olmalı: TYT Türkçe, TYT Matematik, TYT Fen Bilimleri, TYT Sosyal Bilimler, AYT Matematik, AYT Fizik, AYT Kimya, AYT Biyoloji, AYT Edebiyat, AYT Tarih, AYT Coğrafya`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/(\{[\s\S]*?\})/);
  try { return jsonMatch ? JSON.parse(jsonMatch[1]) : { subject: 'Belirsiz', topic: 'Belirsiz' }; }
  catch { return { subject: 'Belirsiz', topic: 'Belirsiz' }; }
}

/* ── Öz-Analiz Paneli (Veli Gözüyle) ── */
export async function generateSelfReview({ studyHours, taskCompleted, taskTotal, habitCompletionRate, pomodoroSessions, examTrials, userName }) {
  const m = getModel();
  const prompt = `Bir veli gözünden ${userName || 'öğrenci'} için bu haftanın değerlendirmesini yaz. Sanki çocuğunun gelişimini izleyen bir veli olarak konuş — sıcak, anlayışlı ama dürüst.

VERİLER:
- Çalışma saati: ${studyHours}h
- Görev: ${taskCompleted}/${taskTotal}
- Alışkanlık: %${Math.round(habitCompletionRate)}
- Pomodoro: ${pomodoroSessions}
- Son denemeler: ${JSON.stringify(examTrials?.slice(-2) || [])}

İçer:
- Genel performans (1 paragraf)
- Güçlü yönler (2 madde)
- Gelişim alanları (2 madde)
- Veliden tavsiye (1 paragraf)

Türkçe yaz, 300 kelimeyi geçme.`;

  const result = await m.generateContent(prompt);
  return result.response.text();
}

/* ── Hata mesajı çözümleyici ── */
export function parseGeminiError(err) {
  const msg = err?.message || String(err);
  if (msg.includes('503') || msg.includes('high demand') || msg.includes('overloaded')) {
    return 'Sunucu şu an meşgul, birkaç saniye bekleyip tekrar dene.';
  }
  if (msg.includes('429') || msg.includes('quota') || msg.includes('rate limit')) {
    return 'Günlük istek limiti doldu, biraz sonra tekrar dene.';
  }
  if (msg.includes('API key') || msg.includes('ayarlanmamış') || msg.includes('BURAYA')) {
    return 'Gemini API anahtarı ayarlanmamış. .env.local dosyasını kontrol et.';
  }
  if (msg.includes('400') || msg.includes('invalid')) {
    return 'Geçersiz istek. Lütfen tekrar dene.';
  }
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('Failed to fetch')) {
    return 'İnternet bağlantısı sorunu. Bağlantını kontrol et.';
  }
  return 'Bir hata oluştu, lütfen tekrar dene.';
}

/* ── App-wide assistant context builder ── */
export function buildAppContext(appState) {
  const today = new Date().toISOString().slice(0, 10);

  // Tasks
  const pendingTasks = (appState.tasks || []).filter(t => !t.completed);
  const topTasks = pendingTasks
    .sort((a, b) => ({ high: 0, medium: 1, low: 2 }[a.priority] ?? 1) - ({ high: 0, medium: 1, low: 2 }[b.priority] ?? 1))
    .slice(0, 5)
    .map(t => `• ${t.title}${t.priority === 'high' ? ' (öncelikli)' : ''}`)
    .join('\n');

  // Habits
  const habits = appState.habits || [];
  const todayHabits = habits.map(h => ({
    name: h.name,
    done: (h.completions || []).includes(today),
  }));
  const habitSummary = todayHabits.length
    ? todayHabits.map(h => `${h.done ? '✓' : '○'} ${h.name}`).join(', ')
    : 'Alışkanlık yok';

  // Exams
  const upcomingExams = (appState.exams || [])
    .filter(e => e.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)
    .map(e => `• ${e.name} (${e.date})`)
    .join('\n');

  // Goals
  const activeGoals = (appState.goals || [])
    .filter(g => !g.completed)
    .slice(0, 3)
    .map(g => `• ${g.title}`)
    .join('\n');

  // YKS
  const yks = appState.yks || {};
  const daysToYKS = yks.examDate
    ? Math.ceil((new Date(yks.examDate) - new Date()) / 86400000)
    : null;
  const trials = yks.trials || [];
  const lastTrials = trials.slice(-2).map((t, i) => {
    const tyt = (t.tyt?.turkce || 0) + (t.tyt?.mat || 0) + (t.tyt?.fen || 0) + (t.tyt?.sosyal || 0);
    const ayt = (t.ayt?.mat || 0) + (t.ayt?.fizik || 0) + (t.ayt?.kimya || 0) + (t.ayt?.biyoloji || 0);
    return `Deneme ${i + 1}: TYT=${tyt} net, AYT=${ayt} net`;
  }).join(' | ');

  // Hata defteri — en sık tekrarlanan konular
  const hataDefteriItems = appState.hataDefteriItems || [];
  const subjectCounts = {};
  hataDefteriItems.forEach(h => {
    if (h.subject) subjectCounts[h.subject] = (subjectCounts[h.subject] || 0) + 1;
  });
  const weakTopics = Object.entries(subjectCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([s, c]) => `${s} (${c} hata)`)
    .join(', ');

  // Pomodoro — bu hafta
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
  const pomodoroCount = (appState.pomodoro?.sessions || [])
    .filter(s => s.date >= weekAgo && s.type === 'work').length;

  // Profile
  const profile = appState.profile || {};
  const targetInfo = yks.targetUni
    ? `Hedef: ${yks.targetDept || ''} @ ${yks.targetUni}`
    : '';

  return `Sen "Günlük Takip" uygulamasının yapay zeka asistanısın. Kullanıcının tüm verilerine erişimin var.

${targetInfo}
${daysToYKS !== null ? `YKS'ye ${daysToYKS} gün kaldı` : ''}
Günlük çalışma hedefi: ${profile.dailyStudyHours || 6} saat

BEKLEYEN GÖREVLER (en önemli 5):
${topTasks || 'Görev yok'}

BUGÜNKÜ ALIŞKANLIKLAR:
${habitSummary}

YAKLAŞAN SINAVLAR:
${upcomingExams || 'Sınav yok'}

AKTİF HEDEFLER:
${activeGoals || 'Hedef yok'}

SON YKS DENEMELERİ:
${lastTrials || 'Deneme yok'}

ZAYIF KONULAR (hata defterinden):
${weakTopics || 'Veri yok'}

BU HAFTA POMODORO: ${pomodoroCount} seans

UYGULAMA SAYFALARI (kullanıcıyı yönlendirmek için kullan):
/tasks → Görevler | /habits → Alışkanlıklar | /yks → YKS Merkezi
/ai → AI Merkezi | /goals → Hedefler | /daily-todos → Günlük Yapılacaklar
/video-summarizer → Video Özetleyici | /leaderboard → Sıralama
/notes → Notlar | /pomodoro → Pomodoro | /calendar → Takvim
/stats → İstatistikler | /lessons → Dersler | /exams → Sınav Takvimi

Kullanıcıya ilgili sayfayı göstermek istediğinde cevabına [NAVIGATE:/path] ekle.
Türkçe konuş. Kısa, pratik ve motive edici ol. Markdown formatını kullan (kalın için **metin**).

DAVRANIŞ KURALLARI (KESİN):
- Sadece Günlük Takip uygulamasıyla ilgili konularda yanıt ver: görev/alışkanlık/hedef
  yönetimi, çalışma planlama, YKS koçluğu, motivasyon, uygulama içi yönlendirme.
- Uygulamayla ilgisi olmayan soru gelirse (hava durumu, genel bilgi, kod yazma, haber,
  ünlüler vb.) kibarca reddet: "Bu konuda yardımcı olamam, ama çalışma planın için
  buradayım. Bugün ne yapmak istiyorsun?"
- Kesin bilmediğin bir şey için tahmin etme, uydurma. "Bu konuda verim yok, ama..."
  diyerek yönlendir.
- Cevapların kısa, eyleme dönük, Türkçe olsun. Gereksiz dolgu cümlesi kurma.
- Kullanıcıya ait verilerin dışına çıkma: "Başkasının istatistiği ne" gibi sorulara
  "Sadece senin verilerine erişimim var" de.`;
}

/* ── Planner context builder ── */
export function buildPlannerContext(appState) {
  const today = new Date().toISOString().slice(0, 10);
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const weekNo = Math.ceil(((now - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  const weekStr = `${now.getFullYear()}-W${String(weekNo).padStart(2, '0')}`;

  const pendingTasks = (appState.tasks || []).filter(t => !t.completed).slice(0, 5).map(t => `• ${t.title}`).join('\n');
  const habits = (appState.habits || []).map(h => `• ${h.name}`).join('\n');
  const activeGoals = (appState.goals || []).filter(g => !g.completed).slice(0, 3).map(g => `• ${g.title}`).join('\n');
  const yks = appState.yks || {};
  const daysToYKS = yks.examDate ? Math.ceil((new Date(yks.examDate) - now) / 86400000) : null;
  const userMode = appState.userMode || 'yks';

  return `Sen "Günlük Takip" uygulamasının AI Planlayıcısısın. Kullanıcı doğal dille günlük/haftalık plan yazar, sen bu cümleyi ayrıştırıp yapısal eylemler üretirsin.

Bugünün tarihi: ${today}
Bu haftanın kodu: ${weekStr}
${daysToYKS !== null ? `YKS'ye ${daysToYKS} gün kaldı` : ''}
Kullanıcı modu: ${userMode}
Günlük çalışma hedefi: ${appState.profile?.dailyStudyHours || 6} saat

MEVCUT GÖREVLER:
${pendingTasks || 'Yok'}

ALIŞKANLIKLAR:
${habits || 'Yok'}

AKTİF HEDEFLER:
${activeGoals || 'Yok'}

GÖREVİN: Kullanıcı doğal dille günlük/haftalık plan yazar. Sen bu cümleyi ayrıştır ve yapısal eylemler üret. Cevabına DAİMA iki parça eklersin:

1) Kısa Türkçe özet (1-3 cümle, madde değil): ne eklediğini söyle.
2) Tek bir JSON blok:

[ACTIONS:
{
  "tasks": [{"title": "...", "priority": "high|medium|low", "due": "YYYY-MM-DD"}],
  "habits": [{"name": "...", "icon": "📖", "color": "#7c3aed", "frequency": "daily"}],
  "goals": [{"title": "...", "category": "yks|genel"}],
  "dailyTodos": [{"text": "...", "date": "YYYY-MM-DD"}],
  "weeklyPlans": [{"text": "...", "weekStr": "YYYY-Www"}],
  "events": [{"title": "...", "date": "YYYY-MM-DD", "time": "HH:MM"}],
  "navigate": "/tasks"
}
]

UYGULAMA SAYFALARI (interaktif link olarak kullanabilirsin):
- Görevler: /tasks
- Takvim: /calendar
- Notlar: /notes
- Alışkanlıklar: /habits
- Hedefler: /goals
- Günlük Yapılacaklar: /daily-todos
- Pomodoro: /pomodoro
- Projeler: /projects
- YKS / Dersler: /yks
- İstatistikler: /stats
- Hatırlatıcılar: /reminders

İÇ LİNK KURALI: Kullanıcıyı bir sayfaya yönlendirmek istersen özet cümlende Markdown link kullan: [Görevler Sayfası](/tasks)
Bu linkler uygulamada tıklanabilir buton olarak gösterilir. navigate alanını da doldur.

KURALLAR:
- Kullanıcı "yarın" derse bugünün tarihinden +1 gün hesapla (bugün: ${today}).
- "Haftalık" istekte 5-7 günlük parça tasks'a ve özet weeklyPlans'e yaz.
- Belirsizse 1 soru sor, JSON yazma.
- Uygulamayla alakasız istek (film önerisi, genel sohbet) → JSON yok, kibar ret: "Bu konuda yardımcı olamam, ama çalışma planın için buradayım."
- Uydurma: Kullanıcı "spor yapacağım" dediyse sadece "Spor" diye kaydet, süre uydurma.
- Hangi alanları doldurmayacaksan o anahtarı JSON'dan çıkar veya boş dizi bırak.
- Cevap Türkçe, kısa ve eyleme dönük olsun.
- Görevler eklendiğinde özet cümlede [Görevler Sayfası](/tasks) linkini ver.`;
}

export async function sendPlannerMessage(chatSession, text) {
  const result = await chatSession.sendMessage(text);
  return result.response.text();
}

/* ── Quiz Soru Üretici ── */
export async function generateQuizQuestions(subject, topic, previousHashes = []) {
  const m = getModel();

  const hashNote = previousHashes.length > 0
    ? `Aşağıdaki hash değerlerine sahip sorularla AYNI veya ÇOK BENZER sorular üretme (önceki oturumlardan):\n${previousHashes.slice(0, 50).join(', ')}`
    : '';

  const prompt = `Sen bir YKS ve genel lise soru üreticisisin.
Ders: ${subject}
Konu: ${topic}
${hashNote}

Tam olarak 5 soru üret. Her soru için uygun tipi seç:
- Hesaplama, tanımlama, şık gerektiren → "multiple_choice" (A/B/C/D)
- Kısa açıklama, kavram, yorum → "open_ended"

SADECE aşağıdaki JSON formatında döndür, başka hiçbir metin yazma:
[
  {
    "question": "Soru metni",
    "type": "multiple_choice",
    "options": {"A": "...", "B": "...", "C": "...", "D": "..."},
    "answer": "A",
    "explanation": "Neden A doğru, kısa açıklama"
  },
  {
    "question": "Soru metni",
    "type": "open_ended",
    "answer": "Beklenen cevap veya anahtar kelimeler",
    "explanation": "Açıklama"
  }
]`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const match = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\[[\s\S]*\])/);
  try {
    return match ? JSON.parse(match[1]) : JSON.parse(text);
  } catch {
    throw new Error('Soru formatı ayrıştırılamadı. Lütfen tekrar dene.');
  }
}

/* ── Open-ended Cevap Değerlendirici ── */
export async function evaluateOpenAnswer(question, expectedAnswer, userAnswer) {
  const m = getModel();
  const prompt = `Bir öğrencinin cevabını değerlendir.

Soru: ${question}
Beklenen cevap: ${expectedAnswer}
Öğrencinin cevabı: ${userAnswer}

SADECE bu JSON formatında döndür:
{"correct": true, "feedback": "Kısa geri bildirim (1-2 cümle)"}

Cevap tam doğru olmasa bile anahtar kavramları içeriyorsa correct: true kabul et.`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const jsonMatch = text.match(/(\{[\s\S]*?\})/);
  try {
    return jsonMatch ? JSON.parse(jsonMatch[1]) : { correct: false, feedback: 'Değerlendirme yapılamadı.' };
  } catch {
    return { correct: false, feedback: 'Değerlendirme yapılamadı.' };
  }
}

/* ── Daily Todo Suggestions ── */
export async function buildDailyTodoSuggestions({ tasks, habits, yks }) {
  const m = getModel();
  const pendingTasks = (tasks || []).filter(t => !t.completed).slice(0, 5).map(t => t.title).join(', ');
  const habitNames = (habits || []).map(h => h.name).join(', ');
  const daysToYKS = yks?.examDate
    ? Math.ceil((new Date(yks.examDate) - new Date()) / 86400000)
    : null;

  const prompt = `Öğrenci için bugün yapılması gereken 4-5 maddelik günlük yapılacaklar listesi oluştur.

Bekleyen görevler: ${pendingTasks || 'yok'}
Alışkanlıklar: ${habitNames || 'yok'}
${daysToYKS ? `YKS'ye ${daysToYKS} gün kaldı` : ''}

Kısa, eyleme dönük maddeler yaz (her biri max 8 kelime).
SADECE JSON array döndür: ["Madde 1", "Madde 2", ...]`;

  const result = await m.generateContent(prompt);
  const text = result.response.text();
  const match = text.match(/\[[\s\S]*?\]/);
  try { return match ? JSON.parse(match[0]) : []; }
  catch { return []; }
}

/* ── YouTube Video Summarizer ── */
export async function summarizeYouTubeVideo(youtubeUrl) {
  if (!API_KEY || API_KEY === 'BURAYA_YENI_KEY_YAPISTIR') {
    throw new Error('Gemini API key ayarlanmamış.');
  }

  // Step 1: Get real video title via YouTube oEmbed (CORS-safe public API)
  let videoTitle = '';
  let videoAuthor = '';
  try {
    const oembedUrl = `https://www.youtube-nocookie.com/oembed?url=${encodeURIComponent(youtubeUrl)}&format=json`;
    const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(youtubeUrl)}`);
    if (res.ok) {
      const meta = await res.json();
      videoTitle = meta.title || '';
      videoAuthor = meta.author_name || '';
    }
  } catch {
    // fallback: continue without title
  }

  // Step 2: Extract video ID for additional context
  const vidIdMatch = youtubeUrl.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  const videoId = vidIdMatch ? vidIdMatch[1] : '';

  const videoGenAI = new GoogleGenerativeAI(API_KEY);
  const videoModel = videoGenAI.getGenerativeModel({ model: MODEL_NAME });

  // Step 3: Send real metadata to Gemini so it's grounded in the actual video
  const summaryPrompt = `YouTube videosunu analiz et ve Türkçe detaylı özet çıkar.

Video Bilgileri:
- Başlık: ${videoTitle || '(bilinmiyor)'}
- Kanal: ${videoAuthor || '(bilinmiyor)'}
- Video ID: ${videoId}
- URL: ${youtubeUrl}

Bu video başlığına ve kanalına bakarak:
1. Konuyu tanımla (ders mi, tutorial mı, vlog mu, vs.)
2. "${videoTitle}" başlıklı bu videoyu analiz et; muhtemelen hangi konuları işliyor?
3. Türkçe eğitim içeriği ise YKS/sınav ile ilgisini belirt

SADECE şu JSON formatında yanıt ver, fazladan metin YAZMA:
{"title":"${videoTitle || 'Video Özeti'}","summary":"Bu videodan beklenen içerik ve konu özeti (3-4 cümle)","keyPoints":["Ana nokta 1","Ana nokta 2","Ana nokta 3","Ana nokta 4"],"formulas":"Varsa formüller veya null","yksRelevance":"YKS/sınav açısından önemi"}`;

  const result = await videoModel.generateContent(summaryPrompt);
  const text = result.response.text();
  const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/(\{[\s\S]*\})/);
  return jsonMatch ? JSON.parse(jsonMatch[1]) : JSON.parse(text);
}

