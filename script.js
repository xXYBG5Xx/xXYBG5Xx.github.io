/**
 * Zeus Dashboard JavaScript
 * Handles interactions and dynamic functionality for the Zeus Dashboard
 */

document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const menuBtn = document.getElementById('menuBtn');
    const navMenu = document.getElementById('navMenu');
    
    if (menuBtn && navMenu) {
        menuBtn.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            menuBtn.classList.toggle('change');
        });
    }
    
    // Scroll to top button
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    
    if (scrollToTopBtn) {
        // Show/hide the button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                scrollToTopBtn.classList.add('visible');
            } else {
                scrollToTopBtn.classList.remove('visible');
            }
        });
        
        // Scroll to top when clicked
        scrollToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
    
    // Scroll animations for sliding elements
    function checkSlide() {
        const slidingElements = document.querySelectorAll('.sliding-element');
        const triggerBottom = window.innerHeight * 0.8;
        
        slidingElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            if (elementTop < triggerBottom) {
                element.style.opacity = '1';
                element.style.transform = 'translateX(0)';
            }
        });
    }
    
    // Initial check for elements already in view
    checkSlide();
    
    // Listen for scroll events
    window.addEventListener('scroll', checkSlide);
    
    // Language dropdown was removed
    
    // Login/logout button
    let loginBtn = document.getElementById('loginBtn');
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
                // Display user avatar in login button
                const userAvatar = userData.avatar 
                    ? `https://cdn.discordapp.com/avatars/${userData.id}/${userData.avatar}.png?size=128`
                    : 'https://cdn.discordapp.com/embed/avatars/0.png';
                
                // Save user data to localStorage for persistence
                const userDataToStore = {
                    id: userData.id,
                    username: userData.username,
                    discriminator: userData.discriminator,
                    tag: userData.username + '#' + userData.discriminator,
                    avatar: userAvatar
                };
                localStorage.setItem('discord_user', JSON.stringify(userDataToStore));
                
                // Create button with user avatar and name
                loginBtn.innerHTML = `
                    <img src="${userAvatar}" alt="${userData.username}" class="user-avatar">
                    <span class="user-name">${userData.username}</span>
                `;
                loginBtn.classList.add('logged-in');
                loginBtn.classList.add('user-profile-btn');
                
                loginBtn.addEventListener('click', function() {
                    // Click takes user to dashboard
                    window.location.href = '/dashboard';
                });
            })
            .catch(error => {
                // User is not logged in - show login button
                loginBtn.innerHTML = '<i class="fab fa-discord"></i> Login';
                
                loginBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    // Direct redirect to Discord auth
                    window.location.href = '/auth/discord?redirect=/dashboard';
                });
            });
    }
    
    // Dashboard buttons
    const headerDashboardBtn = document.getElementById('headerDashboardBtn');
    const heroDashboardBtn = document.getElementById('heroDashboardBtn');
    
    // All buttons will redirect to login directly with dashboard redirect after completion
    if (headerDashboardBtn) {
        headerDashboardBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Direct redirect to Discord auth
            window.location.href = '/auth/discord?redirect=/dashboard';
        });
    }
    
    if (heroDashboardBtn) {
        heroDashboardBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Direct redirect to Discord auth
            window.location.href = '/auth/discord?redirect=/dashboard';
        });
    }
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetSelector = this.getAttribute('href');
            // Skip empty links or just '#'
            if (targetSelector === '' || targetSelector === '#') {
                return;
            }
            
            try {
                const targetElement = document.querySelector(targetSelector);
                if (targetElement) {
                    e.preventDefault();
                    targetElement.scrollIntoView({
                        behavior: 'smooth'
                    });
                    
                    // Close mobile menu if open
                    if (navMenu && navMenu.classList.contains('active')) {
                        navMenu.classList.remove('active');
                        if (menuBtn) menuBtn.classList.remove('change');
                    }
                }
            } catch (error) {
                console.log('Invalid selector:', targetSelector);
            }
        });
    });

    // Animate elements when they come into view
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-card, .command-category');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.2;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate-in');
            }
        });
    };
    
    // Initial check and then on scroll
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll();
    
    // Dashboard-specific functions
    
    // Update user info in dashboard if we're on the dashboard page
    if (window.location.pathname === '/dashboard') {
        // Check if user is logged in from localStorage
        const storedUser = localStorage.getItem('discord_user');
        
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                updateDashboardUserInfo(userData);
            } catch (e) {
                console.error('Error parsing stored user data:', e);
            }
        }
    }
    
    // Update user information in dashboard
    function updateDashboardUserInfo(userData) {
        const usernameElement = document.getElementById('dashboard-username');
        const userTagElement = document.getElementById('dashboard-user-tag');
        const userAvatarElement = document.getElementById('dashboard-user-avatar');
        
        if (usernameElement) {
            usernameElement.textContent = userData.username;
        }
        
        if (userTagElement) {
            userTagElement.textContent = userData.tag || userData.username;
        }
        
        if (userAvatarElement && userData.avatar) {
            userAvatarElement.src = userData.avatar;
        }
        
        // Update server statistics if available
        fetch('/api/guilds')
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Failed to fetch guilds');
            })
            .then(guilds => {
                // Update server count
                const serverCountElement = document.getElementById('server-count');
                if (serverCountElement) {
                    serverCountElement.textContent = guilds.length;
                }
                
                // Estimate total member count (sum of server members)
                let totalMembers = 0;
                guilds.forEach(guild => {
                    if (guild.memberCount) {
                        totalMembers += guild.memberCount;
                    }
                });
                
                const memberCountElement = document.getElementById('member-count');
                if (memberCountElement) {
                    memberCountElement.textContent = totalMembers > 0 
                        ? totalMembers.toLocaleString() 
                        : '???';
                }
                
                // Update server display
                updateServersList(guilds);
            })
            .catch(error => {
                console.error('Error fetching guilds:', error);
                
                // For demo, load sample display data
                loadDemoServerData();
            });
    }
    
    // Update server list in dashboard
    function updateServersList(guilds) {
        const serversGrid = document.getElementById('servers-grid');
        const noServersMessage = document.getElementById('no-servers-message');
        
        if (serversGrid && noServersMessage) {
            if (guilds && guilds.length > 0) {
                // Show server list and hide "No servers" message
                serversGrid.style.display = 'grid';
                noServersMessage.style.display = 'none';
                
                serversGrid.innerHTML = ''; // Clear previous content
                
                guilds.forEach(guild => {
                    const serverCard = document.createElement('div');
                    serverCard.className = 'server-card';
                    serverCard.dataset.name = guild.name; // For search
                    
                    // Set server icon
                    const iconURL = guild.icon 
                        ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png` 
                        : 'https://cdn.discordapp.com/embed/avatars/0.png';
                    
                    serverCard.innerHTML = `
                        <img src="${iconURL}" alt="${guild.name}" class="server-icon">
                        <h4 class="server-name">${guild.name}</h4>
                        <div class="server-stats">
                            <div class="server-stat">
                                <i class="fas fa-user"></i> ${guild.memberCount || '?'}
                            </div>
                            <div class="server-stat">
                                <i class="fas fa-hashtag"></i> ${guild.channels?.length || '?'}
                            </div>
                        </div>
                        <div class="server-actions">
                            <a href="/dashboard/${guild.id}" class="dashboard-btn dashboard-btn-primary">
                                <i class="fas fa-cog"></i> Settings
                            </a>
                            <button class="dashboard-btn">
                                <i class="fas fa-chart-bar"></i> Stats
                            </button>
                        </div>
                    `;
                    
                    serversGrid.appendChild(serverCard);
                });
            } else {
                // Hide server list and show "No servers" message
                serversGrid.style.display = 'none';
                noServersMessage.style.display = 'block';
            }
        }
    }
    
    // Function to load demo server data for display
    function loadDemoServerData() {
        const serverCountElement = document.getElementById('server-count');
        const memberCountElement = document.getElementById('member-count');
        const commandCountElement = document.getElementById('command-count');
        
        if (serverCountElement) serverCountElement.textContent = '5';
        if (memberCountElement) memberCountElement.textContent = '8,234';
        if (commandCountElement) commandCountElement.textContent = '12,490';
        
        const serversGrid = document.getElementById('servers-grid');
        const noServersMessage = document.getElementById('no-servers-message');
        
        if (serversGrid && noServersMessage) {
            // Show demo server list
            serversGrid.style.display = 'grid';
            noServersMessage.style.display = 'none';
            
            // Demo server data
            const demoServers = [
                {
                    name: 'Gaming Community',
                    icon: 'https://cdn.discordapp.com/embed/avatars/1.png',
                    members: 1240,
                    channels: 35
                },
                {
                    name: 'Programming Server',
                    icon: 'https://cdn.discordapp.com/embed/avatars/2.png',
                    members: 3762,
                    channels: 48
                },
                {
                    name: 'Book Club',
                    icon: 'https://cdn.discordapp.com/embed/avatars/3.png',
                    members: 567,
                    channels: 24
                },
                {
                    name: 'Art Community',
                    icon: 'https://cdn.discordapp.com/embed/avatars/4.png',
                    members: 1839,
                    channels: 32
                },
                {
                    name: 'Music Server',
                    icon: 'https://cdn.discordapp.com/embed/avatars/5.png',
                    members: 826,
                    channels: 28
                }
            ];
            
            serversGrid.innerHTML = ''; // Clear previous content
            
            demoServers.forEach(server => {
                const serverCard = document.createElement('div');
                serverCard.className = 'server-card';
                serverCard.dataset.name = server.name; // For search
                
                serverCard.innerHTML = `
                    <img src="${server.icon}" alt="${server.name}" class="server-icon">
                    <h4 class="server-name">${server.name}</h4>
                    <div class="server-stats">
                        <div class="server-stat">
                            <i class="fas fa-user"></i> ${server.members}
                        </div>
                        <div class="server-stat">
                            <i class="fas fa-hashtag"></i> ${server.channels}
                        </div>
                    </div>
                    <div class="server-actions">
                        <button class="dashboard-btn dashboard-btn-primary">
                            <i class="fas fa-cog"></i> Settings
                        </button>
                        <button class="dashboard-btn">
                            <i class="fas fa-chart-bar"></i> Stats
                        </button>
                    </div>
                `;
                
                serversGrid.appendChild(serverCard);
            });
        }
    }
    
    // Activate server search function if on dashboard page
    const serverSearchInput = document.getElementById('server-search-input');
    if (serverSearchInput) {
        serverSearchInput.addEventListener('input', function() {
            searchServers(this.value);
        });
    }
    
    // Function for searching servers
    function searchServers(query) {
        const serverCards = document.querySelectorAll('.server-card');
        const normalizedQuery = query.trim().toLowerCase();
        
        serverCards.forEach(card => {
            const serverName = card.dataset.name.toLowerCase();
            
            if (serverName.includes(normalizedQuery) || normalizedQuery === '') {
                card.style.display = 'flex';
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show "No results" message when there are no search results
        let visibleCount = 0;
        serverCards.forEach(card => {
            if (card.style.display !== 'none') {
                visibleCount++;
            }
        });
        
        const noServersMessage = document.getElementById('no-servers-message');
        const serversGrid = document.getElementById('servers-grid');
        
        if (visibleCount === 0 && normalizedQuery !== '') {
            noServersMessage.style.display = 'block';
            noServersMessage.querySelector('h4').textContent = 'No Search Results';
            noServersMessage.querySelector('p').textContent = `No servers found matching "${query}"`;
            serversGrid.style.display = 'none';
        } else {
            if (visibleCount > 0) {
                noServersMessage.style.display = 'none';
                serversGrid.style.display = 'grid';
            }
        }
    }
    
    // التحقق من حالة تسجيل الدخول
    function checkLoginStatus() {
        const token = localStorage.getItem('discord_token');
        const loginBtn = document.getElementById('loginBtn');
        
        if (token) {
            // إذا كان المستخدم مسجل الدخول
            fetch('https://discord.com/api/users/@me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(user => {
                loginBtn.innerHTML = `
                    <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" class="user-avatar">
                    <span class="user-name">${user.username}</span>
                `;
                loginBtn.classList.add('user-profile-btn');
                loginBtn.href = '/dashboard';
            })
            .catch(() => {
                localStorage.removeItem('discord_token');
                window.location.reload();
            });
        }
    }
    
    // معالجة الرد من Discord OAuth
    function handleAuth() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        
        if (code) {
            // تبديل الكود بالتوكن
            fetch('YOUR_BACKEND_AUTH_ENDPOINT', {
                method: 'POST',
                body: JSON.stringify({ code })
            })
            .then(res => res.json())
            .then(data => {
                localStorage.setItem('discord_token', data.access_token);
                window.location.href = '/dashboard';
            });
        }
    }
    
    // تشغيل الدوال عند تحميل الصفحة
    document.addEventListener('DOMContentLoaded', () => {
        checkLoginStatus();
        handleAuth();
    });
    
    // Language switching functionality has been removed

    // Discord OAuth Configuration
    const DISCORD_CLIENT_ID = '1353340921831493714';
    const REDIRECT_URI = 'https://xxybg5xx.github.io/dashboard.html';

    function redirectToDiscordLogin() {
        const params = new URLSearchParams({
            client_id: DISCORD_CLIENT_ID,
            redirect_uri: REDIRECT_URI,
            response_type: 'code',
            scope: 'identify guilds',
            prompt: 'consent'
        });
        
        window.location.href = `https://discord.com/oauth2/authorize?${params}`;
    }

    // Add function to handle callback
    window.onload = function() {
        // Check if we're on the callback page
        if (window.location.pathname === '/callback') {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            if (code) {
                handleAuthCallback(code);
            }
        }
    }

    function handleAuthCallback(code) {
        // Store the code temporarily
        sessionStorage.setItem('discord_auth_code', code);
        // Redirect to dashboard
        window.location.href = '/dashboard';
    }

    // Update checkLoginStatus function
    function checkLoginStatus() {
        const token = localStorage.getItem('discord_token');
        const loginBtn = document.getElementById('loginBtn');
        
        if (token) {
            fetch('https://discord.com/api/users/@me', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            .then(res => res.json())
            .then(user => {
                if (user.id) {
                    loginBtn.innerHTML = `
                        <img src="https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png" class="user-avatar">
                        <span class="user-name">${user.username}</span>
                    `;
                    loginBtn.classList.add('user-profile-btn');
                    loginBtn.href = '/dashboard';
                } else {
                    throw new Error('Invalid token');
                }
            })
            .catch(() => {
                localStorage.removeItem('discord_token');
                redirectToDiscordLogin();
            });
        } else {
            loginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                redirectToDiscordLogin();
            });
        }
    }

    // Update handleAuth function
    function handleAuth() {
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');
        
        if (error) {
            console.error('Auth error:', error);
            return;
        }
        
        if (code) {
            exchangeCodeForToken(code);
        }
    }

    // Add function to exchange code for token
    async function exchangeCodeForToken(code) {
        try {
            const response = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: DISCORD_CLIENT_ID,
                    client_secret: 'YOUR_CLIENT_SECRET', // This should be handled server-side
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: REDIRECT_URI
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

            const data = await response.json();
            if (data.access_token) {
                localStorage.setItem('discord_token', data.access_token);
                window.location.href = '/dashboard';
            }
        } catch (err) {
            console.error('Error exchanging code for token:', err);
        }
    }
}());
