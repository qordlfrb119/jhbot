const chat = document.getElementById('chat');
const input = document.getElementById('input');
const send = document.getElementById('send');

// 오늘의 글 출력
fetch('https://jhbot-nx5b.onrender.com/api/daily')
  .then(res => res.json())
  .then(data => {
    document.getElementById('daily-quote').textContent =
      `오늘의 글: "${data.quote.text}" (📘 ${data.quote.page}쪽)`;
  })
  .catch(() => {
    document.getElementById('daily-quote').textContent = '오늘의 글을 불러올 수 없어요.';
  });

function appendMessage(role, text) {
  const message = document.createElement('div');
  message.classList.add('message', role);
  message.textContent = text;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

// 메시지 전송
send.addEventListener('click', () => {
  const userText = input.value.trim();
  if (!userText) return;
  appendMessage('user', userText);
  input.value = '';

  fetch('https://jhbot-nx5b.onrender.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userText })
  })
    .then(res => res.json())
    .then(data => {
      // ✅ GPT의 응답 출력
      let replyText = '';

      if (typeof data.reply === 'string') {
        replyText = data.reply;
      } else if (data.reply && typeof data.reply.text === 'string') {
        replyText = data.reply.text;
      } else {
        replyText = '죄송해요. 회일쌤의 문장을 찾지 못했어요.';
      }

      appendMessage('bot', replyText);

      // ✅ 함께 전송된 원문 인용 문장 출력
      if (data.sources && Array.isArray(data.sources)) {
        const sourcesText = data.sources
          .map(q => `📖 "${q.text}" (📘 ${q.page}쪽)`)
          .join('\n\n');
        appendMessage('bot', sourcesText);
      }
    })
    .catch(() => {
      appendMessage('bot', '죄송해요. 서버와 연결할 수 없어요.');
    });
});

// 엔터 키로도 전송
input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') send.click();
});




