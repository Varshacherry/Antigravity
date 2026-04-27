document.addEventListener('DOMContentLoaded', () => {
    // --- Clock and Date Sync ---
    function updateClock() {
        const now = new Date();
        
        // Update Time
        let hours = now.getHours();
        let minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        
        document.getElementById('current-time').textContent = `${hours}:${minutes} ${ampm}`;
        
        // Update Date
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        document.getElementById('current-date').textContent = now.toLocaleDateString(undefined, options);

        // Update Greeting
        let greeting = 'Good Evening!';
        const h24 = now.getHours();
        if(h24 < 12) greeting = 'Good Morning!';
        else if (h24 < 18) greeting = 'Good Afternoon!';
        document.getElementById('greeting').textContent = greeting;

        updateTimeline(h24, now.getMinutes());
    }

    // --- Timeline Sync ---
    function updateTimeline(currentHour, currentMin) {
        const timelineItems = document.querySelectorAll('.timeline-item');
        const currentTimeVal = currentHour + (currentMin / 60);

        timelineItems.forEach(item => {
            const timeStr = item.getAttribute('data-time'); // format "HH:MM"
            const [h, m] = timeStr.split(':').map(Number);
            const itemTimeVal = h + (m / 60);
            
            // If current time is past the item time + some threshold, it might be "done"
            // Let's just highlight the current active block
            // A block is active until the next block starts
            item.classList.remove('active');
        });

        // Find the active segment
        let activeItemIndex = -1;
        for(let i = 0; i < timelineItems.length; i++) {
            const timeStr = timelineItems[i].getAttribute('data-time');
            const [h, m] = timeStr.split(':').map(Number);
            const itemTimeVal = h + (m / 60);

            if(currentTimeVal >= itemTimeVal) {
                activeItemIndex = i;
            } else {
                break;
            }
        }
        
        if(activeItemIndex !== -1) {
            timelineItems[activeItemIndex].classList.add('active');
        }
    }

    setInterval(updateClock, 1000);
    updateClock();

    // --- Water Tracker ---
    const MAX_WATER = 8;
    let currentWater = parseInt(localStorage.getItem('waterCount')) || 0;
    
    const waterAddBtn = document.getElementById('water-add-btn');
    const waterCountDisplay = document.getElementById('water-count');
    const waterFillLevel = document.getElementById('water-fill-level');
    const waterResetBtn = document.getElementById('water-reset');

    function updateWaterUI() {
        waterCountDisplay.textContent = currentWater;
        const fillPercentage = Math.min((currentWater / MAX_WATER) * 100, 100);
        waterFillLevel.style.height = `${fillPercentage}%`;
        
        if (currentWater >= MAX_WATER) {
            waterFillLevel.style.background = 'linear-gradient(to top, #10b981, #34d399)'; // Turn green when goal met
        } else {
            waterFillLevel.style.background = 'linear-gradient(to top, #0ea5e9, #38bdf8)';
        }
    }

    waterAddBtn.addEventListener('click', () => {
        if (currentWater < MAX_WATER) {
            currentWater++;
            localStorage.setItem('waterCount', currentWater);
            updateWaterUI();
            if (currentWater === MAX_WATER) {
                showToast('Hydration Goal Reached! 🎉');
            }
        }
    });

    waterResetBtn.addEventListener('click', () => {
        currentWater = 0;
        localStorage.setItem('waterCount', currentWater);
        updateWaterUI();
    });

    updateWaterUI();

    // --- Sleep Tracker ---
    const sleepInput = document.getElementById('sleep-hours');
    const saveSleepBtn = document.getElementById('save-sleep');
    const sleepFeedback = document.getElementById('sleep-feedback');

    // Load saved sleep
    const savedSleep = localStorage.getItem('sleepHours');
    if (savedSleep) {
        sleepInput.value = savedSleep;
        evalSleep(savedSleep);
    }

    function evalSleep(hours) {
        hours = parseFloat(hours);
        if (isNaN(hours)) return;

        if (hours < 6) {
            sleepFeedback.textContent = 'You need more rest! Try for 7-8 hours.';
            sleepFeedback.style.color = 'var(--danger-red)';
        } else if (hours >= 7 && hours <= 9) {
            sleepFeedback.textContent = 'Perfect amount of sleep! 🌟';
            sleepFeedback.style.color = 'var(--success-green)';
        } else {
            sleepFeedback.textContent = 'Oversleeping? Aim for 8 hours.';
            sleepFeedback.style.color = 'var(--vibrant-orange)';
        }
    }

    saveSleepBtn.addEventListener('click', () => {
        const h = sleepInput.value;
        if(h) {
            localStorage.setItem('sleepHours', h);
            evalSleep(h);
            showToast('Sleep data saved!');
        }
    });

    // --- Toast Notification ---
    function showToast(msg) {
        const toast = document.getElementById('toast');
        toast.textContent = msg;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
});
