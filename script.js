// Portfolio JavaScript - Centralized functionality
// ================================================

// Page transition functionality
const timeoutDelayMs = 25;

function pageTransition() {
    return {
        isLoading: false,
        isLoaded: false,
        
        init() {
            // Initialize page load animation
            this.isLoading = true;
            this.isLoaded = false;
            
            // Simulate loading time for smooth transition
            setTimeout(() => {
                this.isLoading = false;
                this.isLoaded = true;
            }, timeoutDelayMs);
            
            // Initialize Lucide icons
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }
        },
        
        navigateToPage(event) {
            const link = event.currentTarget;
            const href = link.getAttribute('href');
            
            // Only handle internal navigation
            if (href && href.endsWith('.html')) {
                event.preventDefault();
                
                // Add exit animation
                document.body.classList.add('page-transition-exit');
                
                // Navigate after animation
                setTimeout(() => {
                    window.location.href = href;
                }, timeoutDelayMs);
            }
        }
    }
}


// Scroll progress functionality
function scrollProgress() {
    return {
        scrollProgress: 0,
        
        init() {
            // Update scroll progress on scroll
            window.addEventListener('scroll', () => {
                this.scrollProgress = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
            });
        }
    }
}

// Header scroll functionality
function headerScroll() {
    return {
        init() {
            window.addEventListener('scroll', () => {
                const header = document.querySelector('header');
                if (window.scrollY > 100) {
                    header.style.background = 'rgba(17, 24, 39, 0.98)';
                } else {
                    header.style.background = 'rgba(17, 24, 39, 0.95)';
                }
            });
        }
    }
}

// Tech card hover functionality
function techCardHover() {
    return {
        hoveredCard: null,
        
        setHoveredCard(cardName) {
            this.hoveredCard = cardName;
        },
        
        clearHoveredCard() {
            this.hoveredCard = null;
        }
    }
}

// Dynamic year functionality
function dynamicYear() {
    return {
        getCurrentYear() {
            return new Date().getFullYear();
        }
    }
}

// RSS Feed functionality
function rssFeed() {
    return {
        articles: [],
        loading: true,
        error: null,
        
        async fetchFeed() {
            this.loading = true;
            this.error = null;
            
            // Check if we're running on file:// protocol
            if (window.location.protocol === 'file:') {
                this.loading = false;
                this.error = 'Please serve this page through a web server (like Live Server) to load articles. File:// protocol has CORS restrictions.';
                return;
            }
            
            try {
                // Medium RSS feed URL
                const feedUrl = 'https://medium.com/@dilettante_mode/feed';
                
                // Use CORS proxy to bypass Medium's restrictions
                const proxyUrl = 'https://api.allorigins.win/get?url=';
                const response = await fetch(`${proxyUrl}${encodeURIComponent(feedUrl)}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Parse the RSS feed
                const parser = new RSSParser();
                const feed = await parser.parseString(data.contents);
                
                // Debug logging
                console.log('RSS Feed parsed:', feed);
                console.log('Feed items:', feed.items);
                
                // Process articles with better error handling
                this.articles = feed.items.slice(0, 6).map((item, index) => {
                    try {
                        return {
                            title: this.cleanTitle(item.title || 'Untitled'),
                            excerpt: this.cleanExcerpt(item.contentSnippet || item.content || ''),
                            content: item.content || item.contentSnippet || '',
                            link: item.link || '#',
                            pubDate: item.pubDate || new Date().toISOString()
                        };
                    } catch (itemError) {
                        console.error(`Error processing article ${index}:`, itemError, item);
                        return {
                            title: 'Error loading article',
                            excerpt: 'Unable to load article content.',
                            content: '',
                            link: '#',
                            pubDate: new Date().toISOString()
                        };
                    }
                });
                
            } catch (error) {
                console.error('Error fetching RSS feed:', error);
                this.error = 'Failed to load articles. Please try again later.';
                this.articles = [];
            } finally {
                this.loading = false;
            }
        },
        
        cleanTitle(title) {
            // Handle undefined/null titles and remove Medium-specific prefixes
            if (!title || typeof title !== 'string') {
                return 'Untitled Article';
            }
            
            return title
                .replace(/^.*?:\s*/, '') // Remove author prefix
                .replace(/\s+/g, ' ')
                .trim();
        },
        
        cleanExcerpt(excerpt) {
            // Handle undefined/null excerpts
            if (!excerpt || typeof excerpt !== 'string') {
                return 'No excerpt available for this article.';
            }
            
            // Clean and truncate excerpt
            const cleaned = excerpt
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/\s+/g, ' ')
                .trim();
            
            return cleaned.length > 150 ? cleaned.substring(0, 150) + '...' : cleaned;
        },
        
        formatDate(dateString) {
            const date = new Date(dateString);
            const now = new Date();
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
                return 'Yesterday';
            } else if (diffDays < 7) {
                return `${diffDays} days ago`;
            } else if (diffDays < 30) {
                const weeks = Math.floor(diffDays / 7);
                return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
            } else {
                return date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
                });
            }
        },
        
        estimateReadTime(content) {
            // Handle undefined/null content
            if (!content || typeof content !== 'string') {
                return '1 min read';
            }
            
            // Estimate reading time based on word count
            const wordsPerMinute = 200;
            const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
            const minutes = Math.ceil(wordCount / wordsPerMinute);
            return `${minutes} min read`;
        }
    }
}

// Smooth scrolling for anchor links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Scroll reveal animation
function initScrollReveal() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);

    document.querySelectorAll('.scroll-reveal').forEach(el => {
        observer.observe(el);
    });
}

// Navigation link transitions
function initNavigationTransitions() {
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.endsWith('.html')) {
                e.preventDefault();
                
                // Add exit animation
                document.body.classList.add('page-transition-exit');
                
                // Navigate after animation
                setTimeout(() => {
                    window.location.href = href;
                }, timeoutDelayMs);
            }
        });
    });
}

// Initialize Lucide icons
function initLucideIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

// Main initialization function
function initPortfolio() {
    // Initialize all functionality
    initLucideIcons();
    initSmoothScrolling();
    initScrollReveal();
    initNavigationTransitions();
    
    // Initialize header scroll
    const headerScrollInstance = headerScroll();
    headerScrollInstance.init();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initPortfolio);

// Export functions for Alpine.js components
window.pageTransition = pageTransition;
window.scrollProgress = scrollProgress;
window.techCardHover = techCardHover;
window.dynamicYear = dynamicYear;
window.rssFeed = rssFeed;
