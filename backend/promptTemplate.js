export default function createPrompt(userInput, quoteText) {
  return `
사용자가 이렇게 말했어요:
"${userInput}"

회일쌤도 그런 시간을 겪으셨다고 해요. 그때 이렇게 말하셨어요:

${quoteText}

이 문장들에 담긴 의미를 회일쌤 책의 맥락 안에서만 설명해줘.
추가 위로나 새로운 멘트 없이, 회일쌤이 실제로 했던 말이나 그 흐름 안에서만 해석해줘.
`;
}
