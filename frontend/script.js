const chat = document.getElementById('chat');
const input = document.getElementById('input');
const send = document.getElementById('send');

// 오늘의 글 불러오기
fetch('https://너의-render-url.onrender.com/api/daily')
  .then(res => res.json())
  .then(data => {
    document.getElementById('daily-quote').textContent = `오늘의 글: "${data.quote}"`;
  })
  .catch(() => {
    document.getElementById('daily-quote').textContent = "오늘의 글을 불러오지 못했어요.";
  });

function appendMessage(role, text) {
  const message = document.createElement('div');
  message.classList.add('message', role);
  message.textContent = text;
  chat.appendChild(message);
  chat.scrollTop = chat.scrollHeight;
}

send.addEventListener('click', () => {
  const userText = input.value.trim();
  if (!userText) return;
  appendMessage('user', userText);
  input.value = '';

  fetch('https://너의-render-url.onrender.com/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userText })
  })
    .then(res => res.json())
    .then(data => {
      appendMessage('bot', data.reply);
    })
    .catch(() => {
      appendMessage('bot', '죄송해요. 서버와 연결할 수 없어요. 나중에 다시 시도해 주세요.');
    });
});

input.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') send.click();
});
