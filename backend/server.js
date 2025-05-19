const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const path = require('path');

dotenv.config();

const app = express();
const port = process.env.PORT || 5001;

app.use(cors({
  origin: 'https://jhbot-bay.vercel.app',
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

let pdfPages = [];

const loadPDF = async () => {
  const filePath = path.join(__dirname, '이제시작해도괜찮아.pdf');
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  pdfPages = data.text.split(/\f/).map((text, index) => ({
    page: index + 1,
    text: text.trim()
  }));
};

const pdfKeywords = [
  "포기", "시작", "성장", "꿈", "아픔", "고통", "감정", "감사",
  "시간", "죽음", "도전", "희망", "회복", "절망", "노력", "자기계발",
  "자신감", "응원", "동기부여", "삶", "버팀", "멘토", "실수", "실패", "겸손"
];

function isRelatedQuestion(text) {
  return pdfKeywords.some(keyword => text.includes(keyword));
}

function findMatchingQuote(question) {
  const qWords = question.toLowerCase().split(/[^가-힣a-zA-Z0-9]+/).filter(Boolean);

  let bestMatch = null;

  for (const { page, text } of pdfPages) {
    const lines = text.split('\n').map(line => line.trim()).filter(Boolean);

    for (const line of lines) {
      const lineWords = line.toLowerCase().split(/[^가-힣a-zA-Z0-9]+/);
      const common = qWords.filter(q => lineWords.includes(q));

      if (common.length >= 2) {
        return { quote: line, page };
      }

      if (!bestMatch || common.length > bestMatch.score) {
        bestMatch = { quote: line, page, score: common.length };
      }
    }
  }

  if (bestMatch && bestMatch.score >= 1) {
    return { quote: bestMatch.quote, page: bestMatch.page };
  }

  return null;
}

app.get('/api/daily', (req, res) => {
  res.json({ quote: "이제는 책 원문 기반으로만 답변합니다." });
});

app.post('/api/chat', (req, res) => {
  const question = req.body.message?.trim();

  if (!question) {
    return res.json({ reply: '질문이 비어있어요. 다시 입력해주세요.' });
  }

  const result = findMatchingQuote(question);
  const isRelated = isRelatedQuestion(question);

  if (result) {
    const formatted = `> “${result.quote}”\n\n출처 : (이제시작해도괜찮아.pdf - ${result.page})`;
    return res.json({ reply: formatted });
  } else if (isRelated) {
    return res.json({ reply: '죄송해요. 관련 정보를 가지고 있지 않아요' });
  } else {
    return res.json({ reply: "저는 '이제 시작해도 괜찮아'에 관한 안내만 가능합니다" });
  }
});

app.listen(port, async () => {
  await loadPDF();
  console.log(`✅ PDF 기반 챗봇 서버 실행 중! 포트: ${port}`);
});



