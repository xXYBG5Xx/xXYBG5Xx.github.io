/**
 * Zeus Dashboard JavaScript
 * Handles interactions and dynamic functionality for the Zeus Dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Language translation functions
    function updateLanguageToArabic() {
        document.documentElement.setAttribute('dir', 'rtl');
        document.documentElement.setAttribute('lang', 'ar');
        
        // Update displayed language
        const currentLang = document.getElementById('currentLang');
        if (currentLang) {
            currentLang.textContent = 'العربية';
        }
        
        // Update language on all elements with data-lang attribute
        const translations = {
            'overview': 'نظرة عامة',
            'servers': 'الخوادم',
            'settings': 'الإعدادات',
            'commands': 'الأوامر',
            'analytics': 'التحليلات',
            'logout': 'تسجيل الخروج',
            'dashboard': 'لوحة التحكم',
            'refresh': 'تحديث',
            'add-server': 'إضافة إلى خادم',
            'loading-servers': 'جاري تحميل الخوادم...',
            'managed-servers': 'الخوادم المُدارة',
            'total-users': 'إجمالي المستخدمين',
            'commands-used': 'الأوامر المستخدمة',
            'uptime': 'وقت التشغيل',
            'recent-activity': 'النشاط الحديث',
            'resources': 'الموارد',
            'company': 'الشركة',
            'legal': 'قانوني'
        };
        
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
        
        // Save preference
        localStorage.setItem('zeus-language', 'ar');
    }
    
    function updateLanguageToEnglish() {
        document.documentElement.setAttribute('dir', 'ltr');
        document.documentElement.setAttribute('lang', 'en');
        
        // Update displayed language
        const currentLang = document.getElementById('currentLang');
        if (currentLang) {
            currentLang.textContent = 'English';
        }
        
        // Update language on all elements with data-lang attribute
        const translations = {
            'overview': 'Overview',
            'servers': 'Servers',
            'settings': 'Settings',
            'commands': 'Commands',
            'analytics': 'Analytics',
            'logout': 'Logout',
            'dashboard': 'Dashboard',
            'refresh': 'Refresh',
            'add-server': 'Add to Server',
            'loading-servers': 'Loading your servers...',
            'managed-servers': 'Managed Servers',
            'total-users': 'Total Users',
            'commands-used': 'Commands Used',
            'uptime': 'Uptime',
            'recent-activity': 'Recent Activity',
            'resources': 'Resources',
            'company': 'Company',
            'legal': 'Legal'
        };
        
        document.querySelectorAll('[data-lang]').forEach(element => {
            const key = element.getAttribute('data-lang');
            if (translations[key]) {
                element.textContent = translations[key];
            }
        });
        
        // Save preference
        localStorage.setItem('zeus-language', 'en');
    }
    
    // Language toggle
    const langToggle = document.getElementById('langToggle');
    const langDropdown = document.querySelector('.language-dropdown');
    
    if (langToggle) {
        langToggle.addEventListener('click', function() {
            langDropdown.classList.toggle('show');
        });
        
        // Close dropdown when clicking outside
        window.addEventListener('click', function(e) {
            if (!langToggle.contains(e.target)) {
                langDropdown.classList.remove('show');
            }
        });
    }
    
    // Language selection
    const langEn = document.getElementById('lang-en');
    const langAr = document.getElementById('lang-ar');
    
    if (langEn) {
        langEn.addEventListener('click', function(e) {
            e.preventDefault();
            updateLanguageToEnglish();
            langDropdown.classList.remove('show');
        });
    }
    
    if (langAr) {
        langAr.addEventListener('click', function(e) {
            e.preventDefault();
            updateLanguageToArabic();
            langDropdown.classList.remove('show');
        });
    }
    
    // Load saved language preference
    const savedLanguage = localStorage.getItem('zeus-language');
    if (savedLanguage === 'ar') {
        updateLanguageToArabic();
    } else {
        updateLanguageToEnglish();
    }
    
    // Function to check if element is in viewport for animation
    function checkSlide() {
        const cards = document.querySelectorAll('.server-card, .stat-card, .activity-item');
        
        cards.forEach(card => {
            // Half way through the card
            const slideInAt = (window.scrollY + window.innerHeight) - card.clientHeight / 2;
            // Bottom of the card
            const cardBottom = card.offsetTop + card.clientHeight;
            // Check if we've scrolled past the card
            const isHalfShown = slideInAt > card.offsetTop;
            // Check if we haven't scrolled past the card
            const isNotScrolledPast = window.scrollY < cardBottom;
            
            if (isHalfShown && isNotScrolledPast) {
                card.classList.add('animate');
            }
        });
    }
    
    // Check for elements in view on load
    checkSlide();
    
    // Listen for scroll events
    window.addEventListener('scroll', checkSlide);
    
    // Authentication status check
    const loginBtn = document.getElementById('loginBtn');
    
    if (loginBtn) {
        // First, check with the server if the user is logged in
        fetch('/api/user')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Not logged in');
            })
            .then(userData => {
                // Update user information in dashboard
                updateDashboardUserInfo(userData);
                
                // Update servers list
                fetchUserServers();
            })
            .catch(error => {
                console.error('Authentication error:', error);
                // Redirect to login if not authenticated
                window.location.href = '/auth/discord?redirect=/dashboard';
            });
    }
    
    // Function to update user information in dashboard
    function updateDashboardUserInfo(userData) {
        const userAvatar = document.getElementById('userAvatar');
        const userName = document.getElementById('userName');
        const userTag = document.getElementById('userTag');
        
        if (userAvatar && userData.avatar) {
            userAvatar.src = `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128`;
        }
        
        if (userName) {
            userName.textContent = userData.username;
        }
        
        if (userTag) {
            const discriminator = userData.discriminator && userData.discriminator !== '0' 
                ? `#${userData.discriminator}` 
                : '';
            userTag.textContent = `@${userData.username}${discriminator}`;
        }
    }
    
    // Function to fetch user's servers
    function fetchUserServers() {
        const serversGrid = document.getElementById('serversGrid');
        
        if (!serversGrid) return;
        
        fetch('/api/guilds')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to fetch servers');
            })
            .then(guilds => {
                updateServersList(guilds);
                
                // Update stats
                if (guilds && guilds.length) {
                    const serverCount = document.getElementById('serverCount');
                    if (serverCount) {
                        serverCount.textContent = guilds.length;
                    }
                }
            })
            .catch(error => {
                console.error('Error fetching servers:', error);
                // Show error or load demo data for presentation
                loadDemoServerData();
            });
    }
    
    // Function to update servers list
    function updateServersList(guilds) {
        const serversGrid = document.getElementById('serversGrid');
        
        if (!serversGrid) return;
        
        // Clear loading state
        serversGrid.innerHTML = '';
        
        if (!guilds || guilds.length === 0) {
            serversGrid.innerHTML = `
                <div class="no-servers">
                    <p data-lang="no-servers">You don't have any servers yet or you don't have the right permissions.</p>
                    <button class="btn primary">
                        <i class="fas fa-plus"></i> 
                        <span data-lang="add-zeus">Add Zeus to a Server</span>
                    </button>
                </div>
            `;
            return;
        }
        
        // Add server cards
        guilds.forEach(guild => {
            const card = document.createElement('div');
            card.className = 'server-card';
            
            const guildIcon = guild.icon 
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png?size=128` 
                : '../assets/default-server-icon.png';
            
            card.innerHTML = `
                <div class="server-banner" style="background-color: #5865f2;">
                    <div class="server-icon">
                        <img src="${guildIcon}" alt="${guild.name}">
                    </div>
                </div>
                <div class="server-info">
                    <h3>${guild.name}</h3>
                    <p>${guild.id}</p>
                    <div class="server-stats">
                        <div class="server-stat">
                            <i class="fas fa-users"></i>
                            <span>Unknown</span>
                        </div>
                        <div class="server-stat">
                            <i class="fas fa-terminal"></i>
                            <span>Unknown</span>
                        </div>
                    </div>
                </div>
                <div class="server-actions">
                    <button class="server-btn secondary">
                        <i class="fas fa-cog"></i> Settings
                    </button>
                    <button class="server-btn">
                        <i class="fas fa-chart-line"></i> Dashboard
                    </button>
                </div>
            `;
            
            serversGrid.appendChild(card);
        });
        
        // Check for animation
        checkSlide();
    }
    
    // Function to load demo server data
    function loadDemoServerData() {
        const serversGrid = document.getElementById('serversGrid');
        
        if (!serversGrid) return;
        
        serversGrid.innerHTML = '';
        
        // Demo data
        const demoGuilds = [
            { 
                id: '123456789012345678', 
                name: 'Zeus Community', 
                icon: null 
            },
            { 
                id: '876543210987654321', 
                name: 'Gaming Server', 
                icon: null 
            },
            { 
                id: '567891234567891234', 
                name: 'Developers Hub', 
                icon: null 
            }
        ];
        
        updateServersList(demoGuilds);
        
        // Update stats with demo data
        const serverCount = document.getElementById('serverCount');
        const userCount = document.getElementById('userCount');
        const commandCount = document.getElementById('commandCount');
        const uptime = document.getElementById('uptime');
        
        if (serverCount) serverCount.textContent = demoGuilds.length;
        if (userCount) userCount.textContent = '1,234';
        if (commandCount) commandCount.textContent = '5,678';
        if (uptime) uptime.textContent = '99.9%';
    }
    
    // Add Server button click handler
    const addServerBtn = document.querySelector('.dashboard-actions .primary');
    if (addServerBtn) {
        addServerBtn.addEventListener('click', function() {
            // Redirect to Discord OAuth2 with bots scope to add the bot to a server
            window.location.href = 'https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot%20applications.commands';
        });
    }
    
    // Refresh button click handler
    const refreshBtn = document.querySelector('.dashboard-actions .secondary');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            fetchUserServers();
        });
    }
});