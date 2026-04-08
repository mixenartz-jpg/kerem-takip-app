import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = 'gemini-2.0-flash-lite';

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
