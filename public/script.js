document.addEventListener('DOMContentLoaded', () => {
    const chatWindow = document.getElementById('chatWindow');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const modeOptions = document.querySelectorAll('.mode-option');
    const modeDesc = document.getElementById('modeDesc');
    const healthLine = document.getElementById('healthLine');
    const statusVal = document.getElementById('statusVal');
    const latencyVal = document.getElementById('latencyVal');
    const uptimeVal = document.getElementById('uptimeVal');

    let currentMode = 'agent';

    async function monitorHealth() {
        try {
            const res = await fetch('/api/status');
            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }
            const data = await res.json();
            
            statusVal.innerText = data.status.toUpperCase();
            latencyVal.innerText = data.latency;
            uptimeVal.innerText = Math.floor(data.uptime) + 's';

            if (data.status === 'healthy') {
                healthLine.classList.remove('degraded');
            } else {
                healthLine.classList.add('degraded');
            }
        } catch (e) {
            statusVal.innerText = 'DOWN';
            healthLine.classList.add('degraded');
        }
    }
    setInterval(monitorHealth, 5000);
    monitorHealth();

    modeOptions.forEach(option => {
        option.addEventListener('click', () => {
            modeOptions.forEach(o => o.classList.remove('active'));
            option.classList.add('active');
            currentMode = option.dataset.mode;
            
            if (currentMode === 'agent') {
                modeDesc.innerText = "Agent mode uses 3 AI cores and web search for professional results.";
            } else {
                modeDesc.innerText = "Daily mode uses 1 AI core and web search for instant daily tasks.";
            }
        });
    });

    async function sendRequest() {
        const prompt = userInput.value.trim();
        if (!prompt) return;

        appendMessage('user', prompt);
        userInput.value = '';

        const aiMsgDiv = appendMessage('ai', 'Trinity is thinking...');

        try {
            const res = await fetch('/api/agent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt, mode: currentMode })
            });
            
            if (res.status === 401) {
                window.location.href = '/login';
                return;
            }
            
            const data = await res.json();
            aiMsgDiv.innerHTML = `<div>${data.answer}</div><button class="copy-btn" onclick="copyText(this)">Copy</button>`;
            chatWindow.scrollTop = chatWindow.scrollHeight;
        } catch (e) {
            aiMsgDiv.innerText = 'Connection Error. Please try again.';
        }
    }

    function appendMessage(role, text) {
        const msg = document.createElement('div');
        msg.className = `message ${role === 'user' ? 'user-msg' : 'ai-msg'}`;
        msg.innerText = text;
        chatWindow.appendChild(msg);
        chatWindow.scrollTop = chatWindow.scrollHeight;
        return msg;
    }

    window.copyText = (btn) => {
        const text = btn.parentElement.innerText.replace('Copy', '').trim();
        navigator.clipboard.writeText(text);
        btn.innerText = 'Copied!';
        setTimeout(() => btn.innerText = 'Copy', 2000);
    };

    userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendRequest(); });
    sendBtn.addEventListener('click', sendRequest);
});
