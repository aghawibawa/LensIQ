document.addEventListener('DOMContentLoaded', () => {
    initFeedTabs();
    initFeedInteractions();
});

function initFeedTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const tab = button.dataset.tab;
            loadFeedContent(tab);
        });
    });
}

function loadFeedContent(tab) {
    const feedGrid = document.querySelector('.feed-grid');

    feedGrid.style.opacity = '0.5';

    setTimeout(() => {
        feedGrid.style.opacity = '1';
    }, 300);
}

function initFeedInteractions() {
    const actionButtons = document.querySelectorAll('.action-btn');

    actionButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();

            const currentColor = button.style.color;
            if (currentColor === 'rgb(57, 208, 197)' || currentColor === '#39d0c5') {
                button.style.color = '';
            } else {
                button.style.color = '#39d0c5';
            }

            const span = button.querySelector('span');
            if (span) {
                let count = parseInt(span.textContent);
                if (button.style.color === 'rgb(57, 208, 197)' || button.style.color === '#39d0c5') {
                    count++;
                } else {
                    count--;
                }

                if (count >= 1000) {
                    span.textContent = (count / 1000).toFixed(1) + 'K';
                } else {
                    span.textContent = count;
                }
            }
        });
    });
}
