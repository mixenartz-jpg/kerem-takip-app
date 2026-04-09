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

/* ── App-wide assistant context builder ── */
export function buildAppContext(appState) {
  const taskCount = appState.tasks?.filter(t => !t.completed).length ?? 0;
  const habitCount = appState.habits?.length ?? 0;
  const studyHours = appState.lessons?.reduce((sum, l) => sum + (l.studyHours || 0), 0) ?? 0;
  const yks = appState.yks;
  const daysToYKS = yks?.examDate
    ? Math.ceil((new Date(yks.examDate) - new Date()) / 86400000)
    : null;

  return `Sen "Günlük Takip" uygulamasının yapay zeka asistanısın. Kullanıcının kişisel verimlilik ve YKS hazırlık verilerine erişimin var.

Mevcut durum:
- Bekleyen görev: ${taskCount}
- Takip edilen alışkanlık: ${habitCount}
- Toplam çalışma saati: ${studyHours}
${daysToYKS !== null ? `- YKS'ye ${daysToYKS} gün kaldı` : ''}

Türkçe konuş. Kısa, pratik ve motive edici ol.`;
}
