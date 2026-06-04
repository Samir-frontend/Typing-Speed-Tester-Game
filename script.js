// Selecting DOM elements
const textToTypeEl = document.getElementById('text-to-type');
const inputFieldEl = document.getElementById('input-field');
const timerEl = document.getElementById('timer');
const wpmEl = document.getElementById('wpm');
const accuracyEl = document.getElementById('accuracy');
const startBtn = document.getElementById('start-btn');
const resetBtn = document.getElementById('reset-btn');

// Mixed paragraph pool with short, medium, and long dynamic texts
const paragraphs = [
    // --- SHORT TEXTS (Quick Warmups) ---
    "Frontend development is the art of building beautiful user interfaces.",
    "JavaScript brings web pages to life with interactive components and features.",
    "Clean code is simple, readable, and easy to maintain over time.",
    "Cascading Style Sheets, or CSS, controls the visual design of a website.",
    
    // --- MEDIUM TEXTS (Balanced Challenge) ---
    "A responsive web design ensures that a website looks great on all screens, including mobile phones, tablets, and desktop computers. Developers use media queries and flexible layouts to achieve this seamless experience.",
    "Version control systems like Git are essential for modern software engineers. It allows multiple developers to collaborate on the same codebase, track changes efficiently, and revert to previous versions if errors occur.",
    "React is a popular component-based JavaScript library used for building rapid user interfaces. By creating reusable UI blocks, developers can build complex web applications much faster and with fewer bugs.",

    // --- LONG TEXTS (Comprehensive Speed Testing) ---
    "The rise of artificial intelligence and machine learning is rapidly transforming global industries, automating routine operations, and restructuring the modern workforce. While these advanced technological innovations create unprecedented opportunities for economic growth and efficiency, they also raise critical ethical questions regarding data privacy, structural unemployment, and the future of human creativity in a digital age.",
    "The modern startup ecosystem thrives on continuous digital innovation, technological scalability, and agile business strategies that systematically disrupt traditional markets worldwide. Entrepreneurs must successfully navigate complex venture capital funding rounds, intense global market competition, and evolving consumer behaviors while building highly resilient organizational cultures capable of adapting to rapid economic changes.",
    "Remote work environments and global digital collaboration tools have permanently redefined the traditional corporate office paradigm across multiple sectors. Organizations are now dynamically leveraging cloud infrastructure, virtual meeting spaces, and decentralized workflows to access top-tier international talent pools, thereby significantly increasing operational flexibility while fundamentally reducing long-term commercial real estate overheads.",
    "Cybersecurity has rapidly evolved into a top strategic priority for modern enterprises, national governments, and global financial networks fighting sophisticated digital threats. As malicious cyber attacks, corporate data breaches, and institutional ransomware operations grow increasingly complex, implementing robust zero-trust network architectures and comprehensive employee awareness programs becomes absolutely essential to protect critical digital infrastructure."
];

// Configuration variables
let timeLeft = 60;
let timer = null;
let totalCharactersTyped = 0;
let errors = 0;

// Function to generate game over sound dynamically using Web Audio API
function playGameOverSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // First tone (High beep)
        const osc1 = audioCtx.createOscillator();
        const gain1 = audioCtx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(300, audioCtx.currentTime);
        osc1.connect(gain1);
        gain1.connect(audioCtx.destination);
        gain1.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        osc1.start();
        osc1.stop(audioCtx.currentTime + 0.3);

        // Second tone (Low drone for dramatic game over effect)
        setTimeout(() => {
            const osc2 = audioCtx.createOscillator();
            const gain2 = audioCtx.createGain();
            osc2.type = 'sawtooth';
            osc2.frequency.setValueAtTime(150, audioCtx.currentTime);
            osc2.connect(gain2);
            gain2.connect(audioCtx.destination);
            gain2.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
            osc2.start();
            osc2.stop(audioCtx.currentTime + 0.5);
        }, 150);

    } catch (e) {
        console.log("AudioContext is not supported or blocked by browser policies.");
    }
}

// AudioContext function to play a professional, cheerful winner melody
function playWinnerSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        
        // Short arpeggio melody to sound like a victory chime
        const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 notes
        const durations = [0.1, 0.1, 0.1, 0.4];
        let startTime = audioCtx.currentTime;

        notes.forEach((freq, index) => {
            const osc = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            osc.type = 'triangle'; // Smoother, pleasant sound for winning
            osc.frequency.setValueAtTime(freq, startTime);
            
            gainNode.gain.setValueAtTime(0.15, startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + durations[index]);
            
            osc.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            osc.start(startTime);
            osc.stop(startTime + durations[index]);
            
            startTime += 0.12; // Gap between notes
        });

    } catch (e) {
        console.log("AudioContext is not supported or blocked by browser policies.");
    }
}

// Function to load a random paragraph
function loadNewParagraph() {
    const randomIndex = Math.floor(Math.random() * paragraphs.length);
    textToTypeEl.innerHTML = "";
    
    paragraphs[randomIndex].split("").forEach(char => {
        let span = document.createElement("span");
        span.innerText = char;
        textToTypeEl.appendChild(span);
    });
}

// Function to start the game
function startGame() {
    loadNewParagraph();
    inputFieldEl.disabled = false; 
    inputFieldEl.focus();        
    startBtn.classList.add('hide'); 
    
    // Start countdown timer
    timer = setInterval(startTimer, 1000);
}

// Function to start the countdown timer
function startTimer() {
    if (timeLeft > 0) {
        timeLeft--;
        timerEl.innerText = timeLeft;
        calculateMetrics();
    } else {
        endGame(true); // Game over because time ran out
    }
}

// Function to calculate WPM and Accuracy in real-time
function calculateMetrics() {
    const timeElapsed = 60 - timeLeft;
    if (timeElapsed <= 0) return;

    const wordsTyped = (totalCharactersTyped / 5);
    const wpm = Math.round((wordsTyped / timeElapsed) * 60);
    wpmEl.innerText = wpm >= 0 && wpm !== Infinity ? wpm : 0;

    const accuracy = Math.round(((totalCharactersTyped - errors) / totalCharactersTyped) * 100);
    accuracyEl.innerText = accuracy >= 0 ? accuracy : 100;
}

// Event listener for user input tracking
inputFieldEl.addEventListener('input', () => {
    const charactersSpans = textToTypeEl.querySelectorAll('span');
    const inputValues = inputFieldEl.value.split('');
    
    errors = 0;
    totalCharactersTyped = inputValues.length;

    charactersSpans.forEach((charSpan, index) => {
        const typedChar = inputValues[index];

        if (typedChar == null) {
            charSpan.classList.remove('correct', 'incorrect');
        } else if (typedChar === charSpan.innerText) {
            charSpan.classList.add('correct');
            charSpan.classList.remove('incorrect');
        } else {
            charSpan.classList.add('incorrect');
            charSpan.classList.remove('correct');
            errors++;
        }
    });

    calculateMetrics();

    // Instant stop logic if paragraph completed perfectly
    const totalLength = charactersSpans.length;
    const correctChars = textToTypeEl.querySelectorAll('span.correct').length;

    // Only trigger win condition if it is 100% correct and text matches full length
    if (correctChars === totalLength && totalCharactersTyped === totalLength) {
        endGame(false); // Game over because user won (time did not run out)
    }
});

// Function to handle game over scenario
function endGame(isTimeUp) {
    clearInterval(timer);
    inputFieldEl.disabled = true; 
    resetBtn.classList.remove('hide'); 

    if (isTimeUp) {
        inputFieldEl.classList.add('time-up');
        inputFieldEl.value = "⚠️ TIME'S UP! Better luck next time.";
        timerEl.parentElement.classList.add('flash-red');
        playGameOverSound(); // Trigger the buzzer sound
    } else {
        // UPGRADED FEATURE: Direct Inline Green Styling for Input Box
        inputFieldEl.style.backgroundColor = "#dcfce7"; // Smooth light green background
        inputFieldEl.style.color = "#15803d";           // Dark green text color
        inputFieldEl.style.borderColor = "#22c55e";     // Sharp green border
        inputFieldEl.style.fontWeight = "bold";
        inputFieldEl.style.textAlign = "center";
        
        inputFieldEl.value = "🎉 Congratulations! You finished before time! 🎉";
        timerEl.parentElement.classList.add('flash-green'); 
        playWinnerSound(); // Trigger the bright victory melody
    }
}

// Function to reset the game state
function resetGame() {
    timeLeft = 60;
    timer = null;
    totalCharactersTyped = 0;
    errors = 0;
    
    // Clean up temporary style modifications
    inputFieldEl.classList.remove('time-up', 'winner-state');
    timerEl.parentElement.classList.remove('flash-red', 'flash-green');
    
    inputFieldEl.value = "";
    timerEl.innerText = timeLeft;
    wpmEl.innerText = "0";
    accuracyEl.innerText = "100";
    
    resetBtn.classList.add('hide'); 
    startBtn.classList.remove('hide'); 
    inputFieldEl.disabled = true; 
    
    loadNewParagraph();
}

// Event listeners for buttons
startBtn.addEventListener('click', startGame);
resetBtn.addEventListener('click', resetGame);

// Initialize paragraph on page load
loadNewParagraph();