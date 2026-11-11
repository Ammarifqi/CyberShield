const $ = (id) => document.getElementById(id);

// Navigation
function showPage(page) {
  document.querySelectorAll('.page-panel').forEach(el => el.classList.toggle('active', el.id === `page-${page}`));
  document.querySelectorAll('[data-page]').forEach(el => el.classList.toggle('active', el.dataset.page === page));
  document.querySelector('.desktop-nav').classList.remove('open');
  $('menuToggle').setAttribute('aria-expanded', 'false');
  $('menuToggle').setAttribute('aria-label', 'Open navigation');
  $('appSection').scrollIntoView({behavior:'smooth', block:'start'});
}
document.querySelectorAll('[data-page]').forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.page)));
document.querySelectorAll('[data-go]').forEach(btn => btn.addEventListener('click', () => showPage(btn.dataset.go)));
$('menuToggle').addEventListener('click', () => {
  const nav = document.querySelector('.desktop-nav');
  nav.classList.toggle('open');
  const isOpen = nav.classList.contains('open');
  $('menuToggle').setAttribute('aria-expanded', isOpen);
  $('menuToggle').setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
});

// Scam scanner: transparent, illustrative rule-based scoring.
const suspiciousRules = [
  {name:'Urgent or pressure language', points:15, pattern:/urgent|immediately|act now|within \d+\s*(minutes?|hours?|days?)|today only|right away|final warning|action required|segera|sekarang juga|dengan segera/i},
  {name:'Threat of account suspension or closure', points:20, pattern:/account.{0,35}(will be|is|has been)?\s*(suspended|blocked|closed|locked|restricted|deactivated)|(?:suspend|block|close|lock|restrict|deactivat)(ed|ing)? your account|akaun anda akan (disekat|digantung)|akaun.{0,25}disekat/i},
  {name:'Request for sensitive information', points:25, pattern:/verify (your )?(account|identity|card)|confirm (your )?(password|account|identity)|send (your )?(password|otp|pin|one.time code)|enter (your )?(password|otp|pin|card number|cvv|security code)|share (your )?(otp|password|pin|one.time code)|bank login|login credentials|sahkan akaun|kata laluan|nombor otp/i},
  {name:'Bank or payment-service impersonation', points:20, pattern:/\b(?:your\s+)?(?:bank|credit union|credit card provider|payment app|e-?wallet|paypal|wise|venmo|cash app)\b.{0,60}\b(?:account|card|payment|transaction|security|verification|locked|blocked|suspended|refund|transfer|alert|notification|activity|suspicious|unusual|verify|confirm)\b|\b(?:account|card|payment|transaction|alert|notification|activity|verification)\b.{0,60}\b(?:bank|credit union|credit card|e-?wallet|paypal|wise)\b/i},
  {name:'Government or authority impersonation', points:15, pattern:/\b(?:tax authority|revenue department|customs|immigration|police|government|social security|inland revenue|LHDN|JPJ|PDRM)\b.{0,70}\b(?:fine|refund|tax|grant|arrest|warrant|verify|payment|claim|urgent|account)\b|\b(?:fine|tax refund|warrant|arrest)\b.{0,50}\b(?:government|police|authority|customs|LHDN|JPJ|PDRM)\b/i},
  {name:'Delivery, toll or unpaid-fee scam', points:15, pattern:/\b(?:parcel|package|delivery|courier|shipment|toll)\b.{0,60}\b(?:fee|customs|payment|failed|held|redeliver|reschedule|tracking)\b|\b(?:pay|settle)\b.{0,35}\b(?:delivery|customs|toll|redelivery)\s*(?:fee|charge|payment)?\b/i},
  {name:'Tech-support or device-security impersonation', points:15, pattern:/\b(?:microsoft|apple|google|antivirus|technical support|tech support|helpdesk)\b.{0,60}\b(?:virus|infected|security alert|locked|call|support|remote access)\b|\b(?:call|contact)\b.{0,35}\b(?:support|helpdesk|security team)\b.{0,35}\b(?:virus|infected|account|device)\b/i},
  {name:'Prize, reward or unexpected money claim', points:15, pattern:/you (have|won) (won|a prize|a reward)|claim your (prize|reward)|free gift|congratulations.*winner|unexpected (payment|refund|inheritance)|menang hadiah|tuntut hadiah/i},
  {name:'Job, task or guaranteed-income offer', points:15, pattern:/\b(?:easy|guaranteed|daily|passive)\s+(?:income|profit|earnings|money)\b|\b(?:job|task|work)\b.{0,50}\b(?:deposit|recharge|fee|commission|earn|payment)\b|\bearn\s+(?:up to\s+)?\$?\d+.{0,25}(?:daily|per day|a day)\b/i},
  {name:'Investment or cryptocurrency promise', points:20, pattern:/\b(?:guaranteed|risk.free|no risk)\b.{0,35}\b(?:profit|return|investment|crypto|bitcoin)\b|\b(?:double|triple)\s+your\s+(?:money|investment|crypto)\b|\b(?:crypto|bitcoin|investment)\b.{0,50}\b(?:guaranteed|profit|returns|double)\b/i},
  {name:'Pressure to pay through hard-to-reverse methods', points:25, pattern:/\b(?:gift cards?|crypto(?:currency)?|bitcoin|wire transfer|money transfer|western union|moneygram)\b.{0,50}\b(?:pay|send|transfer|fee|payment)\b|\b(?:pay|send|transfer)\b.{0,50}\b(?:gift cards?|crypto(?:currency)?|bitcoin|wire transfer|western union|moneygram)\b|\b(?:safe|secure|protected)\s+account\b/i},
  {name:'Suspicious link or shortened URL', points:20, pattern:/(https?:\/\/)?(bit\.ly|tinyurl\.com|t\.co|rb\.gy)\//i},
  {name:'Unusual or insecure link format', points:15, pattern:/http:\/\/|[a-z0-9-]+\.(xyz|top|click|zip|work)\b/i},
  {name:'Impersonation or payment pressure', points:20, pattern:/pretend|impersonat|pay (a fee|now)|transfer (money|funds)|bank details|urgent payment|payment required|avoid (a )?(fine|arrest|suspension)|buat bayaran segera|pindahan wang/i}
];
function scanMessage() {
  const text = $('messageInput').value.trim();
  if (!text) { $('messageInput').focus(); $('messageInput').placeholder = 'Please paste a message before analysing.'; return; }
  const matches = suspiciousRules.filter(rule => rule.pattern.test(text));
  let score = Math.min(100, matches.reduce((sum, item) => sum + item.points, 0));
  const label = score >= 50 ? 'High risk indicators' : score >= 25 ? 'Moderate risk indicators' : 'Low risk indicators';
  const summary = score >= 50
    ? 'Several warning signs were detected. Do not click links or share personal information until you verify the sender through an official channel.'
    : score >= 25
    ? 'Some warning signs were detected. Check the sender and verify the request independently before taking action.'
    : matches.length
    ? 'A small number of warning signs were detected. Treat the message carefully and verify unexpected requests.'
    : 'The rules did not detect common warning signs. This does not prove the message is genuine.';
  $('riskLabel').textContent = label;
  $('riskScore').textContent = score;
  $('scoreRing').style.borderColor = score >= 50 ? 'var(--red)' : score >= 25 ? 'var(--orange)' : 'var(--green)';
  $('scoreMeter').style.width = score + '%';
  $('resultSummary').textContent = summary;
  $('indicatorList').innerHTML = matches.length
    ? matches.map(item => `<li>${escapeHTML(item.name)} <span style="color:#8e9db5">(+${item.points})</span></li>`).join('')
    : '<li>No indicators from this prototype rule set were detected.</li>';
  $('nextStep').textContent = score >= 50
    ? 'Do not reply, open attachments or use the provided link. Contact the organisation using its official app, website or phone number.'
    : 'Check the sender address carefully. If the message claims to be from an organisation, contact it using details you find independently.';
  $('scanResult').classList.remove('hidden');
  $('scanResult').scrollIntoView({behavior:'smooth',block:'nearest'});
}
function escapeHTML(str) { return str.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
$('scanButton').addEventListener('click', scanMessage);
$('messageInput').addEventListener('input', () => $('charCount').textContent = `${$('messageInput').value.length} characters`);
const phishingSample = 'URGENT: Your bank account will be suspended today. Verify your account immediately using this link: http://bank-secure-login.xyz/verify and enter your password to prevent account closure.';
function loadMessageSample(message) {
  $('messageInput').value = message;
  $('charCount').textContent = `${$('messageInput').value.length} characters`;
  $('scanResult').classList.add('hidden');
}
$('samplePhishing').addEventListener('click', () => loadMessageSample(phishingSample));
$('sampleLegit').addEventListener('click', () => loadMessageSample('Hi Aina, our study group meeting is scheduled for Thursday at 3:00 PM in the library. Please bring your notes. Thank you.'));
$('heroSample').addEventListener('click', () => {
  showPage('scanner');
  loadMessageSample(phishingSample);
});

// Password checker
const passwordChecks = [
  {key:'length', test:p=>p.length>=8},
  {key:'lower', test:p=>/[a-z]/.test(p)},
  {key:'upper', test:p=>/[A-Z]/.test(p)},
  {key:'number', test:p=>/[0-9]/.test(p)},
  {key:'symbol', test:p=>/[^A-Za-z0-9\s]/.test(p)}
];
function updatePassword() {
  const p = $('passwordInput').value;
  let score = 0;
  passwordChecks.forEach(item => {
    const passed = item.test(p);
    if (passed) score++;
    const el = document.querySelector(`[data-check="${item.key}"]`);
    el.classList.toggle('pass', passed);
    el.querySelector('span').textContent = passed ? '✓' : '○';
  });
  const isWeak = p.length < 8 || score <= 1;
  $('strengthScore').textContent = `${score} / 5 checks`;
  $('passwordMeter').style.width = (score * 20) + '%';
  $('passwordMeter').style.background = isWeak ? 'var(--red)' : score <= 3 ? 'var(--orange)' : 'var(--green)';
  $('strengthText').textContent = !p ? 'Waiting for input' : isWeak ? 'Weak' : score <= 3 ? 'Fair' : score === 4 ? 'Good' : 'Strong';
  $('passwordAdvice').textContent = !p
    ? 'Enter a sample password to see suggestions.'
    : p.length < 8
    ? 'Try using at least 8 characters.'
    : score < 4
    ? 'Try mixing uppercase and lowercase letters, numbers, and symbols.'
    : 'Nice work. Use a different password for each account.';
}
$('passwordInput').addEventListener('input', updatePassword);
$('togglePassword').addEventListener('click', () => {
  const input = $('passwordInput');
  input.type = input.type === 'password' ? 'text' : 'password';
  $('togglePassword').textContent = input.type === 'password' ? 'Show' : 'Hide';
});

// Device compromise scenario: a fixed educational demo with no device access.
const deviceStageIds = ['deviceStageAlert', 'deviceStageActivity', 'deviceStageResponse'];
const deviceTimeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: 'numeric',
  minute: '2-digit'
});
function updateDeviceTimelineTime() {
  const now = new Date();
  const eventTimes = document.querySelectorAll('[data-device-time]');
  eventTimes.forEach((element, index) => {
    const eventTime = new Date(now.getTime() - (eventTimes.length - index - 1) * 2 * 60 * 1000);
    element.textContent = deviceTimeFormatter.format(eventTime);
    element.dateTime = `${String(eventTime.getHours()).padStart(2, '0')}:${String(eventTime.getMinutes()).padStart(2, '0')}`;
  });
  $('deviceLocalTime').textContent = deviceTimeFormatter.format(now);
  $('deviceLocalTime').dateTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}
function showDeviceStage(activeIndex) {
  deviceStageIds.forEach((id, index) => {
    $(id).classList.toggle('hidden', index !== activeIndex);
  });
  document.querySelectorAll('[data-device-step]').forEach((step, index) => {
    step.classList.toggle('active', index === activeIndex);
    step.classList.toggle('complete', index < activeIndex);
    if (index === activeIndex) step.setAttribute('aria-current', 'step');
    else step.removeAttribute('aria-current');
  });
  $(deviceStageIds[activeIndex]).focus();
}
function resetDeviceFlow() {
  document.querySelectorAll('[data-device-choice]').forEach(button => {
    button.disabled = false;
    button.classList.remove('selected');
  });
  $('deviceChoiceFeedback').textContent = '';
  $('deviceChoiceFeedback').classList.add('hidden');
  $('deviceChoiceFeedback').classList.remove('is-correct', 'is-caution');
  $('continueToActivity').classList.add('hidden');
  showDeviceStage(0);
}
document.querySelectorAll('[data-device-choice]').forEach(button => {
  button.addEventListener('click', () => {
    const choseTrustedDevice = button.dataset.deviceChoice === 'trusted';
    document.querySelectorAll('[data-device-choice]').forEach(choice => {
      choice.classList.toggle('selected', choice === button);
    });
    $('deviceChoiceFeedback').textContent = choseTrustedDevice
      ? 'Good choice. Verify through the service using a separate trusted device.'
      : 'Ignoring an unexpected alert can leave an issue unchecked. Verify it independently using a trusted device.';
    $('deviceChoiceFeedback').classList.toggle('is-correct', choseTrustedDevice);
    $('deviceChoiceFeedback').classList.toggle('is-caution', !choseTrustedDevice);
    $('deviceChoiceFeedback').classList.remove('hidden');
    $('continueToActivity').classList.remove('hidden');
  });
});
$('startDeviceDemo').addEventListener('click', () => {
  $('deviceDemoIntro').classList.add('hidden');
  $('deviceDemoResult').classList.remove('hidden');
  resetDeviceFlow();
  $('deviceDemoResult').scrollIntoView({behavior:'smooth',block:'start'});
});
$('continueToActivity').addEventListener('click', () => {
  updateDeviceTimelineTime();
  showDeviceStage(1);
});
$('backToAlert').addEventListener('click', () => showDeviceStage(0));
$('continueToResponse').addEventListener('click', () => showDeviceStage(2));
$('backToActivity').addEventListener('click', () => showDeviceStage(1));
$('resetDeviceDemo').addEventListener('click', () => {
  $('deviceDemoResult').classList.add('hidden');
  $('deviceDemoIntro').classList.remove('hidden');
  resetDeviceFlow();
  $('startDeviceDemo').focus();
});

// 2FA demo
const demoCode = '482916';
$('sendCode').addEventListener('click', () => {
  if (!$('demoUser').value.trim()) { $('demoUser').focus(); return; }
  $('loginStep').classList.add('hidden'); $('otpStep').classList.remove('hidden');
  $('stepOne').classList.remove('active'); $('stepTwo').classList.add('active');
});
$('backToLogin').addEventListener('click', () => {
  $('otpStep').classList.add('hidden'); $('loginStep').classList.remove('hidden');
  $('stepTwo').classList.remove('active'); $('stepOne').classList.add('active');
});
$('verifyCode').addEventListener('click', () => {
  const ok = $('otpInput').value.replace(/\s/g,'') === demoCode;
  $('otpStep').classList.add('hidden'); $('otpResult').classList.remove('hidden');
  $('stepTwo').classList.remove('active'); $('stepThree').classList.add('active');
  $('otpResult').innerHTML = ok
    ? '<div class="success-result"><div class="success-icon">✓</div><h4>Verification successful</h4><p>The demo sign-in completed because the correct code was entered.</p><button class="primary-btn" id="restart2fa">Try again</button></div>'
    : '<div class="success-result"><div class="success-icon" style="color:var(--red)">!</div><h4>Verification failed</h4><p>The code did not match. In a real service, never share your one-time code with anyone.</p><button class="primary-btn" id="restart2fa">Try again</button></div>';
  $('restart2fa').addEventListener('click', reset2fa);
});
function reset2fa() {
  $('otpResult').classList.add('hidden'); $('loginStep').classList.remove('hidden');
  $('demoUser').value=''; $('otpInput').value='';
  ['stepOne','stepTwo','stepThree'].forEach(id=>$(id).classList.remove('active'));
  $('stepOne').classList.add('active');
}

// Quiz
const questions = [
  {q:'You receive a message saying your bank account will close unless you click a link immediately. What should you do?',a:['Click quickly to avoid losing access','Contact your bank through its official app or phone number','Reply with your account details'],correct:1,why:'Urgent threats are a common pressure tactic. Verify the request through a separate official channel.'},
  {q:'Which password practice is safest?',a:['Use the same password everywhere','Use your birthday','Use a long, unique password for each account'],correct:2,why:'Unique passwords reduce the impact if one service is breached. A password manager can help.'},
  {q:'What should you do if someone asks for your one-time password (OTP)?',a:['Share it if they know your name','Never share it with another person','Post it in a support chat'],correct:1,why:'An OTP is a security credential. Legitimate support staff should not ask you to disclose it.'},
  {q:'A link uses a shortened URL and you do not know the sender. What is the safer choice?',a:['Open it to see where it goes','Forward it to friends','Avoid opening it and verify the sender'],correct:2,why:'Shortened links hide the destination. Verify unexpected links before opening them.'},
  {q:'What does two-factor authentication add?',a:['A second verification step','A shorter password','Automatic protection from every scam'],correct:0,why:'2FA adds another proof of identity. It improves account security but does not stop every attack.'}
];
let quizIndex=0, quizScore=0, answered=false;
function renderQuiz() {
  answered=false;
  $('quizResult').classList.add('hidden');
  $('quizContent').classList.remove('hidden');
  const item=questions[quizIndex];
  $('quizProgressText').textContent=`QUESTION ${quizIndex+1} OF ${questions.length}`;
  $('quizProgress').style.width=((quizIndex)/questions.length*100)+'%';
  $('quizContent').innerHTML=`<div class="question">${item.q}</div><div class="answer-list">${item.a.map((a,i)=>`<button class="answer-option" data-answer="${i}">${String.fromCharCode(65+i)}. ${a}</button>`).join('')}</div><div id="quizFeedback" class="quiz-feedback"></div><button id="quizNext" class="primary-btn quiz-next hidden">${quizIndex===questions.length-1?'See my result':'Next question'} →</button>`;
  document.querySelectorAll('[data-answer]').forEach(btn=>btn.addEventListener('click',()=>chooseAnswer(Number(btn.dataset.answer))));
  $('quizNext').addEventListener('click',()=>{
    if(quizIndex<questions.length-1){quizIndex++;renderQuiz()}else showQuizResult();
  });
}
function chooseAnswer(index) {
  if(answered)return; answered=true;
  const item=questions[quizIndex];
  if(index===item.correct)quizScore++;
  document.querySelectorAll('[data-answer]').forEach(btn=>{
    btn.disabled=true;
    const val=Number(btn.dataset.answer);
    if(val===item.correct)btn.classList.add('correct');
    else if(val===index)btn.classList.add('wrong');
  });
  $('quizFeedback').textContent=(index===item.correct?'Correct. ':'Not quite. ')+item.why;
  $('quizNext').classList.remove('hidden');
}
function showQuizResult() {
  $('quizContent').classList.add('hidden');$('quizResult').classList.remove('hidden');
  $('quizProgress').style.width='100%';$('quizProgressText').textContent='QUIZ COMPLETED';
  $('quizResult').innerHTML=`<div class="quiz-final"><div class="eyebrow">YOUR RESULT</div><strong>${quizScore}/${questions.length}</strong><h3>${quizScore===5?'Excellent work!':quizScore>=3?'Good effort!':'Keep practising!'}</h3><p>You answered ${quizScore} out of ${questions.length} questions correctly.</p><button class="primary-btn" id="retryQuiz">Try again →</button></div>`;
  $('retryQuiz').addEventListener('click',()=>{quizIndex=0;quizScore=0;renderQuiz()});
}
renderQuiz();
