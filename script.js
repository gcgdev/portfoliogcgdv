/* ==========================================================================
   GABRIEL C. GONÇALVES — PORTFÓLIO SCRIPT ENGINE
   100% Client-Side Engine para GitHub Pages (Tema, Filtro, Accordions, Modais)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Inicializar Ícones Lucide
    if (window.lucide) {
        lucide.createIcons();
    }

    // ----------------------------------------------------------------------
    // 1. Tema Claro / Escuro (Preserva Azul & Lavanda sem Elementos Sumidos)
    // ----------------------------------------------------------------------
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem('gabriel_portfolio_theme');
    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    } else {
        htmlElement.setAttribute('data-theme', 'light');
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('gabriel_portfolio_theme', newTheme);
            if (window.lucide) lucide.createIcons();
        });
    }

    // ----------------------------------------------------------------------
    // 2. Menu Mobile Drawer
    // ----------------------------------------------------------------------
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => navMenu.classList.remove('active'));
        });
    }

    // Filtro de Portfólio Removido (Transformado em Carrossel único)

    // ----------------------------------------------------------------------
    // 4. Accordions (Cases & FAQ)
    // ----------------------------------------------------------------------
    const accTriggers = document.querySelectorAll('.acc-trigger');
    accTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const item = trigger.closest('.acc-item');
            item.classList.toggle('active');
        });
    });

    // ----------------------------------------------------------------------
    // 5. Lógica do Carrossel de Portfólio (Botões de Navegação)
    // ----------------------------------------------------------------------
    const carousel = document.getElementById('estampas-carousel');
    const btnPrev = document.getElementById('btn-prev');
    const btnNext = document.getElementById('btn-next');

    if (carousel && btnPrev && btnNext) {
        // A largura de rolagem será a largura da imagem (aprox 320px) + gap (aprox 24px)
        const scrollAmount = 344;

        btnNext.addEventListener('click', () => {
            carousel.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });

        btnPrev.addEventListener('click', () => {
            carousel.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });
    }

    // ----------------------------------------------------------------------
    // 6. Formulário Serverless com Fallback WhatsApp
    // ----------------------------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData);

            formFeedback.style.color = 'var(--brand-blue)';
            formFeedback.textContent = 'Enviando...';

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    formFeedback.style.color = '#10B981';
                    formFeedback.textContent = '✓ Mensagem enviada com sucesso! Gabriel responderá em breve.';
                    contactForm.reset();
                } else {
                    throw new Error('Erro no servidor.');
                }
            } catch (err) {
                formFeedback.style.color = '#EF4444';
                formFeedback.textContent = 'Redirecionando para o WhatsApp...';
                setTimeout(() => {
                    const msg = encodeURIComponent(`Olá Gabriel! Meu nome é ${data.name}. Tenho interesse em ${data.service}. Mensagem: ${data.message}`);
                    window.open(`https://wa.me/5512997321701?text=${msg}`, '_blank');
                }, 1000);
            }
        });
    }

    // ----------------------------------------------------------------------
    // 7. Leitor de ePub Interativo (epubjs)
    // ----------------------------------------------------------------------
    const epubLoading = document.getElementById('epub-loading');
    const epubViewer = document.getElementById('epub-viewer');
    const epubError = document.getElementById('epub-error');
    const prevBtn = document.getElementById('epub-prev');
    const nextBtn = document.getElementById('epub-next');
    const progressText = document.getElementById('epub-progress');

    if (epubViewer) {
        let currentRendition = null;

        function configureRendition(rendition) {
            currentRendition = rendition;

            // Carrega e renderiza o livro
            rendition.display().then(() => {
                if (epubLoading) epubLoading.style.display = 'none';
                
                // Customização do layout interno da página do e-book (Tema de Leitura Premium)
                rendition.themes.default({
                    'body': { 
                        'background-color': '#FAF9F6 !important', 
                        'color': '#111111 !important',
                        'font-family': '"Plus Jakarta Sans", sans-serif !important',
                        'font-size': '15px !important',
                        'line-height': '1.6 !important',
                        'padding': '0 10px !important'
                    },
                    'p': { 
                        'margin-bottom': '1rem !important' 
                    },
                    'h1, h2, h3, h4': {
                        'font-family': '"Montserrat", sans-serif !important',
                        'color': '#111111 !important',
                        'margin-bottom': '1.2rem !important',
                        'font-weight': '700 !important'
                    }
                });
            }).catch(err => {
                console.error("Erro ao exibir livro:", err);
                showReaderError();
            });

            // Controles de Navegação de Página
            if (prevBtn) {
                prevBtn.replaceWith(prevBtn.cloneNode(true)); // Limpa listeners antigos
                document.getElementById('epub-prev').addEventListener('click', (e) => {
                    e.preventDefault();
                    rendition.prev();
                });
            }

            if (nextBtn) {
                nextBtn.replaceWith(nextBtn.cloneNode(true)); // Limpa listeners antigos
                document.getElementById('epub-next').addEventListener('click', (e) => {
                    e.preventDefault();
                    rendition.next();
                });
            }

            // Monitorar progresso de leitura
            rendition.on("relocated", (location) => {
                if (progressText && location.start) {
                    const percentage = Math.round((location.start.percentage || 0) * 100);
                    progressText.textContent = percentage > 0 ? `Lido: ${percentage}%` : 'Amostra';
                }
            });
        }

        function loadEpub(path) {
            try {
                const book = ePub(path);
                let hasTimedOut = false;

                // Timeout de segurança: se o ePubJS travar (ex: bloqueio de CORS em file://)
                const timeoutId = setTimeout(() => {
                    hasTimedOut = true;
                    if (path === 'amostra.epub') {
                        console.log("Timeout na raiz, tentando pasta public...");
                        loadEpub('public/amostra.epub');
                    } else {
                        showReaderError(true);
                    }
                }, 5000);

                book.ready.then(() => {
                    if (hasTimedOut) return;
                    clearTimeout(timeoutId);

                    const viewer = document.getElementById("epub-viewer");
                    if (viewer) viewer.innerHTML = ""; // Limpa iframes anteriores

                    const rendition = book.renderTo("epub-viewer", {
                        width: "100%",
                        height: "100%",
                        spread: "none",
                        flow: "paginated"
                    });

                    configureRendition(rendition);
                }).catch(err => {
                    if (hasTimedOut) return;
                    clearTimeout(timeoutId);

                    if (path === 'amostra.epub') {
                        loadEpub('public/amostra.epub');
                    } else {
                        showReaderError();
                    }
                });
            } catch (e) {
                if (path === 'amostra.epub') {
                    loadEpub('public/amostra.epub');
                } else {
                    showReaderError();
                }
            }
        }

        // Tenta carregar primeiro da raiz do projeto, depois de public/
        if (typeof ePub !== 'undefined') {
            loadEpub('amostra.epub');

            // Ajustar layout no redimensionamento da janela (Responsividade)
            window.addEventListener('resize', () => {
                if (currentRendition) {
                    currentRendition.resize();
                }
            });
        } else {
            showReaderError();
        }
    }

    function showReaderError(isTimeout = false) {
        if (epubLoading) epubLoading.style.display = 'none';
        if (epubViewer) epubViewer.style.display = 'none';
        if (epubError) {
            epubError.style.display = 'flex';
            
            // Se foi erro por timeout, geralmente é bloqueio CORS do navegador em arquivos locais (file://)
            if (isTimeout) {
                const msgEl = epubError.querySelectorAll('p')[1];
                if (msgEl) {
                    msgEl.innerHTML = 'Carregamento bloqueado pelo navegador. Se estiver testando localmente (file://), abra o projeto usando uma extensão de <strong>Live Server</strong> ou publique no <strong>GitHub Pages</strong>.';
                }
            }
            
            if (window.lucide) lucide.createIcons();
        }
    }
});
