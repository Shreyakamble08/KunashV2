// footer.js - Safe version with error handling
(function() {
    // Wait for DOM to be ready
    function initFooter() {
        const footerContainer = document.getElementById('footer');
        
        // If footer element doesn't exist, exit
        if (!footerContainer) {
            console.warn('Footer container not found - skipping footer load');
            return;
        }
        
        // Check if footer is already loaded (prevent duplicate)
        if (footerContainer.dataset.loaded === 'true') {
            return;
        }
        
        // Fetch footer HTML
        fetch("/footer/footer.html")
            .then(res => {
                if (!res.ok) {
                    throw new Error(`Failed to load footer: ${res.status}`);
                }
                return res.text();
            })
            .then(data => {
                footerContainer.innerHTML = data;
                footerContainer.dataset.loaded = 'true';
                
                // Update year in footer if element exists
                const yearElement = document.getElementById("year");
                if (yearElement) {
                    yearElement.textContent = new Date().getFullYear();
                }
            })
            .catch(error => {
                console.error('Error loading footer:', error);
                // Show fallback footer
                footerContainer.innerHTML = `
                    <footer class="bg-[#0a0a0a] border-t border-white/10 py-8 mt-12">
                        <div class="max-w-7xl mx-auto px-4 text-center">
                            <p class="text-gray-400 text-sm">
                                &copy; ${new Date().getFullYear()} Kunash Media. All rights reserved.
                            </p>
                        </div>
                    </footer>
                `;
            });
    }
    
    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFooter);
    } else {
        initFooter();
    }
})();