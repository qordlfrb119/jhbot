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
  origin: 'https://jhbot-bay.vercel.app', // 프론트 주소
  methods: ['GET', 'POST'],
  credentials: true
}));
app.use(express.json());

let allText = '';

const loadPDF = async () => {
  const filePath = path.join(__dirname, 'start.pdf'); // start.pdf는 backend 폴더에 있어야 함
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  allText = data.text;

  // 확인용 로그
  console.log("✅ PDF 로딩 완료");
  console.log("✂️ 텍스트 미리보기:", allText.slice(0, 300));
};

function findRelevantSentence(question) {
  const lines = allText.split('\n').map(line => line.trim()).filter(line => line.length > 10);
  const qWords = question.toLowerCase().split(/[^가-힣a-zA-Z0-9]+/).filter(Boolean);

  let bestMatch = null;

  for (const line of lines) {
    const lowerLine = line.toLowerCase();

    const score = qWords.filter(word => lowerLine.includes(word)).length;

    if (score >= 1) return line; // 하나라도 포함되면 바로 반환
    if (!bestMatch || score > bestMatch.score) {
      bestMatch = { text: line, score };
    }
  }

  if (bestMatch && bestMatch.score >= 1) return bestMatch.text;
  return null;
}

app.get('/api/daily', (req, res) => {
  res.json({ quote: "책 원문에서 실시간으로 검색해 답해드릴게요." });
});

app.post('/api/chat', (req, res) => {
  const question = req.body.message?.trim();

  if (!question) {
    return res.json({ reply: '질문이 비어있어요. 다시 입력해주세요.' });
  }

  const result = findRelevantSentence(question);

  if (result) {
    return res.json({ reply: `“${result}”` });
  } else {
    return res.json({ reply: '죄송해요. 관련 정보를 책에서 찾을 수 없었어요.' });
  }
});

app.listen(port, async () => {
  await loadPDF();
  console.log(`✅ PDF 원문 기반 챗봇 서버 실행 중! 포트: ${port}`);
});



