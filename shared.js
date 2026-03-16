/* ══════════════════════════════════════════════════
   SHARED — Dark mode toggle & utilities for all pages
   ══════════════════════════════════════════════════ */
(() => {
    'use strict';

    // Mark loader as played so navigating back to Home skips it
    // Only set on non-home pages; script.js sets it after the loader plays on home
    if (!document.getElementById('loading-screen')) {
        sessionStorage.setItem('loaderPlayed', 'true');
    }

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
    // ─── Mobile Drawer Nav Toggle ───
    const drawerToggle = document.getElementById('nav-drawer-toggle');
    const bottomNav = document.getElementById('bottom-nav');

    if (drawerToggle && bottomNav) {
        drawerToggle.addEventListener('click', () => {
            bottomNav.classList.toggle('open');
        });

        // Close drawer when clicking outside
        document.addEventListener('click', (e) => {
            if (bottomNav.classList.contains('open') &&
                !bottomNav.contains(e.target)) {
                bottomNav.classList.remove('open');
            }
        });
    }

    // ─── Top-utils scroll background (mobile only) ───
    const topUtils = document.querySelector('.top-utils');
    if (topUtils) {
        // Pages with fixed iframes (like My Work) never scroll,
        // so always show the header background on those pages.
        const hasFixedIframe = document.querySelector('.iframe-container');

        if (hasFixedIframe) {
            if (window.innerWidth <= 768) {
                topUtils.classList.add('scrolled');
            }
            window.addEventListener('resize', () => {
                topUtils.classList.toggle('scrolled', window.innerWidth <= 768);
            }, { passive: true });
        } else {
            const onScroll = () => {
                if (window.innerWidth <= 768) {
                    topUtils.classList.toggle('scrolled', window.scrollY > 10);
                }
            };
            window.addEventListener('scroll', onScroll, { passive: true });
            window.addEventListener('resize', onScroll, { passive: true });
        }
    }
})();
