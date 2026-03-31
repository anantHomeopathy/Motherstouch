let currentLang = localStorage.getItem('lang') || 'en';

function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;

    const t = translations[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key] !== undefined) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        if (t[key] !== undefined) el.innerHTML = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key] !== undefined) el.placeholder = t[key];
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });

    if (typeof blogPostsData !== 'undefined' && blogPostsData.length > 0) {
        renderBlogPosts();
    }
}

function getCurrentLang() {
    return currentLang;
}

document.addEventListener('DOMContentLoaded', () => {
    const langSwitch = document.getElementById('langSwitch');
    if (langSwitch) {
        langSwitch.addEventListener('click', (e) => {
            const btn = e.target.closest('.lang-btn');
            if (btn) {
                const lang = btn.getAttribute('data-lang');
                setLanguage(lang);
            }
        });
    }

    setLanguage(currentLang);

    const mobileToggle = document.getElementById('mobileToggle');
    const navbar = document.getElementById('navbar');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navbar.classList.toggle('open');
        });
    }

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            if(mobileToggle) mobileToggle.classList.remove('active');
            if(navbar) navbar.classList.remove('open');
        });
    });

    const header = document.getElementById('header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            if(header) header.classList.add('scrolled');
        } else {
            if(header) header.classList.remove('scrolled');
        }
    });

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    });

    const scrollTopBtn = document.getElementById('scrollTop');
    if(scrollTopBtn) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 400) {
                scrollTopBtn.classList.add('visible');
            } else {
                scrollTopBtn.classList.remove('visible');
            }
        });
        scrollTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('patientName').value.trim();
            const phone = document.getElementById('patientPhone').value.trim();
            const email = document.getElementById('patientEmail').value.trim();
            const message = document.getElementById('patientMessage').value.trim();
            const t = translations[getCurrentLang()];

            if (!name || !phone) {
                alert(t.form_validation_alert || "Please fill in the required fields.");
                return;
            }

            let text = `${t.wa_greeting || "Hello Dr. Bhoomi,"}\n\n`;
            text += `${t.wa_appointment || "I would like to book a consultation."}\n\n`;
            text += `*${t.wa_name || "Mother's Name:"}* ${name}\n`;
            text += `*${t.wa_phone || "Phone:"}* ${phone}\n`;
            if (email) text += `*${t.wa_email || "Baby's Age:"}* ${email}\n`;
            if (message) text += `*${t.wa_problem || "Concern:"}* ${message}\n`;
            text += `\n${t.wa_thanks || "Thank you!"}`;

            const encoded = encodeURIComponent(text);
            window.open(`https://wa.me/919274284078?text=${encoded}`, '_blank');
        });
    }

    const blogModalClose = document.getElementById('blogModalClose');
    const blogModal = document.getElementById('blogModal');
    if (blogModalClose) {
        blogModalClose.addEventListener('click', () => {
            if(blogModal) blogModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }

    const revealElements = document.querySelectorAll('.service-card, .why-card, .testimonial-card, .blog-card, .video-card, .reel-card, .contact-card, .about-content, .about-img-frame, .appointment-info, .appointment-form-wrapper');
    revealElements.forEach(el => el.classList.add('reveal'));

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    if(typeof loadBlogPosts === 'function') loadBlogPosts();
    if(typeof loadVideos === 'function') loadVideos();
    if(typeof loadReels === 'function') loadReels();
});

let blogPostsData = []; 
function getBlogField(post, field) {
    const lang = getCurrentLang();
    if (lang === 'en' && post[field + '_en']) return post[field + '_en'];
    return post[field] || '';
}

async function loadBlogPosts() {
    const grid = document.getElementById('blogGrid');
    const empty = document.getElementById('blogEmpty');
    try {
        const response = await fetch('blog/posts.json');
        if (!response.ok) throw new Error('No posts file');
        const posts = await response.json();
        blogPostsData = posts;
        if (!posts || posts.length === 0) {
            if(grid) grid.style.display = 'none';
            if(empty) empty.style.display = 'block';
            return;
        }
        renderBlogPosts();
    } catch {
        if(!grid) return;
        const t = translations && translations[getCurrentLang()] ? translations[getCurrentLang()] : {};
        grid.innerHTML = `<div class="blog-card reveal active"><img src="assets/images/logo.jpeg" alt="Blog" class="blog-card-img" loading="lazy"><div class="blog-card-body"><p class="blog-card-date">${t.blog_coming_soon || "Coming Soon"}</p><h4>${t.blog_fallback_title || "New Articles on the Way"}</h4><p>${t.blog_fallback_desc || "Stay tuned for helpful tips and advice on breastfeeding and baby care."}</p><span class="blog-read-more">${t.blog_coming_soon || "Coming Soon"} &rarr;</span></div></div>`;
    }
}

function renderBlogPosts() {
    const grid = document.getElementById('blogGrid');
    if (!grid || blogPostsData.length === 0) return;
    const t = translations[getCurrentLang()];
    grid.innerHTML = '';
    blogPostsData.forEach((post, index) => {
        const card = document.createElement('div');
        card.className = 'blog-card reveal';
        const imgSrc = post.image || 'assets/images/logo.jpeg';
        const title = getBlogField(post, 'title');
        const excerpt = getBlogField(post, 'excerpt');
        const date = getBlogField(post, 'date');
        card.innerHTML = `<img src="${imgSrc}" alt="${title}" class="blog-card-img" loading="lazy"><div class="blog-card-body"><p class="blog-card-date">${date}</p><h4>${title}</h4><p>${excerpt}</p><a href="#" class="blog-read-more" data-index="${index}">${t.blog_read_more || "Read More"} &rarr;</a></div>`;
        card.querySelector('.blog-read-more').addEventListener('click', (e) => {
            e.preventDefault();
            openBlogModal(post);
        });
        grid.appendChild(card);
    });
}

function openBlogModal(post) {
    const modal = document.getElementById('blogModal');
    if(!modal) return;
    document.getElementById('blogModalImg').src = post.image || 'assets/images/logo.jpeg';
    document.getElementById('blogModalDate').textContent = getBlogField(post, 'date');
    document.getElementById('blogModalTitle').textContent = getBlogField(post, 'title');
    document.getElementById('blogModalText').textContent = getBlogField(post, 'content') || getBlogField(post, 'excerpt');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

async function loadVideos() {
    const grid = document.getElementById('videosGrid');
    if(!grid) return;
    try {
        const response = await fetch('js/videos.json');
        if (!response.ok) throw new Error('No videos file');
        const videos = await response.json();
        if (!videos || videos.length === 0) {
            grid.style.display = 'none';
            return;
        }
        grid.innerHTML = '';
        videos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'video-card reveal';
            let embedUrl = video.url;
            let match = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/);
            if (match) embedUrl = `https://www.youtube.com/embed/${match[1]}`;
            card.innerHTML = `<iframe src="${embedUrl}" title="${video.title}" allowfullscreen loading="lazy"></iframe><div class="video-card-body"><h4>${video.title}</h4></div>`;
            grid.appendChild(card);
        });
    } catch {
        const t = translations && translations[getCurrentLang()] ? translations[getCurrentLang()] : {};
        grid.innerHTML = `<div class="video-card reveal active"><div style="width:100%;aspect-ratio:16/9;background:var(--primary-bg);display:flex;align-items:center;justify-content:center;color:var(--text-muted);font-size:1rem;">${t.videos_fallback || "Videos coming soon"}</div><div class="video-card-body"><h4>${t.videos_fallback_title || "Educational Videos"}</h4></div></div>`;
    }
}

async function loadReels() {
    const grid = document.getElementById('reelsGrid');
    if(!grid) return;
    try {
        const response = await fetch('js/reels.json');
        if (!response.ok) throw new Error('No reels file');
        const reels = await response.json();
        if (!reels || reels.length === 0) {
            grid.style.display = 'none';
            return;
        }
        grid.innerHTML = '';
        reels.forEach(reel => {
            const card = document.createElement('div');
            card.className = 'reel-card reveal';
            card.innerHTML = `<iframe src="${reel.url}embed" title="${reel.title}" allowfullscreen loading="lazy" scrolling="no"></iframe><div class="reel-card-body"><h4>${reel.title}</h4></div>`;
            grid.appendChild(card);
        });
    } catch {
        const t = translations && translations[getCurrentLang()] ? translations[getCurrentLang()] : {};
        grid.innerHTML = `<div class="reel-card reveal active" style="text-align:center;padding:40px;"><p style="color:var(--text-muted);">${t.reels_fallback || "More content is on the way!"}</p><a href="#" target="_blank" rel="noopener" class="btn btn-primary" style="margin-top:16px;">${t.reels_follow || "Follow Us"}</a></div>`;
    }
}
