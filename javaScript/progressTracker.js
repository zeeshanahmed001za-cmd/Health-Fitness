document.addEventListener('DOMContentLoaded', () => {
    // Chart Filter Interaction
    const filterButtons = document.querySelectorAll('.filterBtn');
    
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');
            
            // Here you would typically trigger a chart data update
            console.log(`Filtering chart for: ${btn.textContent}`);
            
            // Visual feedback: briefly fade chart
            const chart = document.querySelector('.chartSvg');
            chart.style.opacity = '0.3';
            setTimeout(() => {
                chart.style.opacity = '1';
            }, 300);
        });
    });

    // Animate Progress Bars on Load
    const progressBars = document.querySelectorAll('.mBar, .fill');
    progressBars.forEach(bar => {
        const width = bar.style.width;
        bar.style.width = '0';
        setTimeout(() => {
            bar.style.transition = 'width 1s ease-out';
            bar.style.width = width;
        }, 100);
    });

    // Radial Progress Animation
    const radialMeter = document.querySelector('.radialSvg .meter');
    if (radialMeter) {
        const offset = radialMeter.style.strokeDashoffset;
        radialMeter.style.strokeDashoffset = '283'; // Full circle offset
        setTimeout(() => {
            radialMeter.style.strokeDashoffset = offset;
        }, 500);
    }
});
