let voices = [];
let isPaused = false;
let isStopped = false;

function loadVoices() {
    voices = speechSynthesis.getVoices();
    const voiceSelect = document.getElementById('voiceSelect');

    voiceSelect.innerHTML = '';

    voices.forEach((voice, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${voice.name} (${voice.lang})`;
        voiceSelect.appendChild(option);
    });
}

speechSynthesis.onvoiceschanged = loadVoices;

async function startSpeech() {
    isStopped = false;

    const text = document.getElementById('textInput').value;
    const wordsPerGroup = parseInt(document.getElementById('wordsPerGroup').value);
    const pauseTime = parseFloat(document.getElementById('pauseTime').value) * 1000;
    const speed = parseFloat(document.getElementById('speed').value);
    const selectedVoice = voices[document.getElementById('voiceSelect').value];

    const words = text.split(' ');
    const groups = [];

    for (let i = 0; i < words.length; i += wordsPerGroup) {
        groups.push(words.slice(i, i + wordsPerGroup).join(' '));
    }

    const startTime = Date.now();

    for (let i = 0; i < groups.length; i++) {
        if (isStopped) {
            break;
        }

        while (isPaused) {
            await pause(200);
        }

        document.getElementById('currentWords').innerText = groups[i];

        const progress = ((i + 1) / groups.length) * 100;
        document.getElementById('progressBar').style.width = progress + '%';

        await speakGroup(groups[i], selectedVoice, speed);
        await pause(pauseTime);
    }

    const endTime = Date.now();
    const totalTime = ((endTime - startTime) / 1000).toFixed(2);

    document.getElementById('sessionInfo').innerText =
        `Session Complete. Total Time: ${totalTime} seconds`;
}
function pauseSpeech() {
    isPaused = true;
    speechSynthesis.pause();
}

function resumeSpeech() {
    isPaused = false;
    speechSynthesis.resume();
}

function stopSpeech() {
    isStopped = true;
    speechSynthesis.cancel();
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function speakGroup(text, voice, speed) {
    return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.voice = voice;
        utterance.rate = speed;

        utterance.onend = () => {
            resolve();
        };

        speechSynthesis.speak(utterance);
    });
}

function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}