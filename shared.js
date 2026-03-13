/* ══════════════════════════════════════════════════
   SHARED — Dark mode toggle & utilities for all pages
   ══════════════════════════════════════════════════ */
(() => {
    'use strict';

    // Mark loader as played so navigating back to Home skips it
    sessionStorage.setItem('loaderPlayed', 'true');

    // ─── Theme Toggle (Light / Dark) ───
    const themeGroup = document.getElementById('theme-toggle-group');
    const themeBtns = document.querySelectorAll('.theme-btn');

    function applyTheme(theme) {
        const isDark = theme === 'dark';
        if (isDark) {
            document.body.classList.add('dark-mode');
            document.documentElement.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
            document.documentElement.classList.remove('dark-mode');
        }

        if (themeGroup) {
            themeGroup.setAttribute('data-active', theme);
            themeBtns.forEach(btn => {
                if (btn.getAttribute('data-theme') === theme) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    }

    // Determine initial theme fallback to old 'darkMode' key if present
    let currentTheme = localStorage.getItem('theme');
    if (!currentTheme) {
        currentTheme = localStorage.getItem('darkMode') === 'true' ? 'dark' : 'light';
        localStorage.setItem('theme', currentTheme);
    }
    
    // Initial run
    applyTheme(currentTheme);

    if (themeBtns.length > 0) {
        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const selectedTheme = btn.getAttribute('data-theme');
                localStorage.setItem('theme', selectedTheme);
                applyTheme(selectedTheme);
            });
        });
    }
})();
