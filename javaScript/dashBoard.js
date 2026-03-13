    document.addEventListener('DOMContentLoaded', () => {
        const sidebar = document.getElementById('sidebar');
        const toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
        const closeSidebarBtn = document.getElementById('closeSidebarBtn');
        const sidebarOverlay = document.getElementById('sidebarOverlay');

        // Desktop Toggle (Collapse/Expand)
        const toggleSidebarDesktop = () => {
            if (window.innerWidth > 768) {
                sidebar.classList.toggle('collapsed');
            } else {
                // Mobile: Slide in
                sidebar.classList.add('mobile-open');
                sidebarOverlay.classList.add('active');
            }
        };

        // Mobile Close
        const closeSidebarMobile = () => {
            sidebar.classList.remove('mobile-open');
            sidebarOverlay.classList.remove('active');
        };

        toggleSidebarBtn.addEventListener('click', toggleSidebarDesktop);
        closeSidebarBtn.addEventListener('click', closeSidebarMobile);
        sidebarOverlay.addEventListener('click', closeSidebarMobile);

        // Handle window resize to reset classes if necessary
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                sidebar.classList.remove('mobile-open');
                sidebarOverlay.classList.remove('active');
            } else {
                // switch to mobile mode
                sidebar.classList.remove('collapsed');
            }
        });
    });
