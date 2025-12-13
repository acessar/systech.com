/* =========================================
   SYSTECH - SCRIPT COMPLETO
   ========================================= */

document.addEventListener('DOMContentLoaded', () => {
    // ============================================
    // 1. LOADER - Remove a tela preta de carregamento
    // ============================================
    const loaderContainer = document.querySelector('.loader-container');
    if (loaderContainer) {
        setTimeout(() => {
            loaderContainer.classList.add('hidden');
        }, 1000); // Espera 1 segundo para mostrar a animação
    }

    // ============================================
    // 2. ANIMAÇÕES FADE-IN NO SCROLL (Scroll Observer)
    // ============================================
    const fadeElements = document.querySelectorAll('.fade-in-element');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Para de observar depois que apareceu
            }
        });
    }, observerOptions);

    fadeElements.forEach(el => observer.observe(el));

    // ============================================
    // 3. EFEITO PARALLAX SUAVE
    // ============================================
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const banner = document.querySelector('.hero-banner');
        if (banner) {
            const rate = scrolled * -0.3;
            banner.style.transform = `translateY(${rate}px)`;
        }
    });

    // ============================================
    // 4. CARROSSEL / ACCORDION HORIZONTAL
    // ============================================
    const carousel = document.getElementById('servicesCarousel');
    
    // Se não houver carrossel na página, encerra a função
    if (!carousel) return;

    let currentIndex = 0;
    const cards = carousel.querySelectorAll('.service-card');
    const totalCards = cards.length;
    let isScrolling = false;
    let autoScrollInterval;
    
    // Variáveis para Drag (Arrastar)
    let isDragging = false;
    let startX = 0;
    let scrollLeft = 0;
    let startScrollLeft = 0;
    
    // Função global para parar auto-scroll (acessível de qualquer lugar)
    function stopAutoScroll() {
        clearInterval(autoScrollInterval);
    }
    
    // ============================================
    // CARROSSEL (TODOS OS DISPOSITIVOS)
    // ============================================
    // >>> CORREÇÃO PRINCIPAL: Forçar o início no zero <<<
    carousel.scrollLeft = 0;

    // Função para mover o scroll até um card específico
    function scrollToCard(index) {
        if (isScrolling || isDragging) return;
        
        // Proteção: verifica se o card existe
        if (!cards[index]) return;

        isScrolling = true;
        
        const card = cards[index];
        const cardWidth = card.offsetWidth;
        const carouselWidth = carousel.offsetWidth;
        
        // Centraliza o card
        const scrollPosition = card.offsetLeft - (carouselWidth - cardWidth) / 2;
        
        carousel.scrollTo({
            left: scrollPosition,
            behavior: 'smooth'
        });
        
        setTimeout(() => {
            isScrolling = false;
        }, 500);
    }
    
    // Função para ir ao próximo card
    function nextCard() {
        if (isDragging) return;
        currentIndex = (currentIndex + 1) % totalCards;
        scrollToCard(currentIndex);
    }
    
    // Função para ir ao card anterior
    function prevCard() {
        if (isDragging) return;
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        scrollToCard(currentIndex);
    }
    
    // Iniciar rolagem automática
    function startAutoScroll() {
        if (isDragging) return;
        clearInterval(autoScrollInterval); // Limpa para evitar duplicidade
        autoScrollInterval = setInterval(nextCard, 4000); // 4 segundos
    }
    
    // Resetar timer de inatividade (volta a rolar se o usuário parar de mexer)
    let inactivityTimer;
    function resetAutoScroll() {
        stopAutoScroll();
        clearTimeout(inactivityTimer);
        inactivityTimer = setTimeout(() => {
            if (!isDragging) {
                startAutoScroll();
            }
        }, 5000);
    }

    // --- Eventos de Mouse ---
    carousel.addEventListener('mousedown', function(e) {
        isDragging = true;
        carousel.style.cursor = 'grabbing';
        startX = e.pageX - carousel.offsetLeft;
        startScrollLeft = carousel.scrollLeft;
        resetAutoScroll();
        e.preventDefault();
    });
    
    carousel.addEventListener('mouseleave', function() {
        if (isDragging) {
            isDragging = false;
            carousel.style.cursor = 'grab';
        }
    });
    
    carousel.addEventListener('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            carousel.style.cursor = 'grab';
            resetAutoScroll();
        }
    });
    
    carousel.addEventListener('mousemove', function(e) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - carousel.offsetLeft;
        const walk = (x - startX) * 2; // Velocidade do arrasto
        carousel.scrollLeft = startScrollLeft - walk;
    });
    
    // --- Eventos de Touch (Celular) ---
    let touchStartX = 0;
    let touchStartScrollLeft = 0;
    
    carousel.addEventListener('touchstart', function(e) {
        isDragging = true;
        touchStartX = e.touches[0].pageX - carousel.offsetLeft;
        touchStartScrollLeft = carousel.scrollLeft;
        resetAutoScroll();
    }, { passive: true });
    
    carousel.addEventListener('touchmove', function(e) {
        if (!isDragging) return;
        const x = e.touches[0].pageX - carousel.offsetLeft;
        const walk = (x - touchStartX) * 2;
        carousel.scrollLeft = touchStartScrollLeft - walk;
    }, { passive: true });
    
    carousel.addEventListener('touchend', function() {
        if (isDragging) {
            isDragging = false;
            resetAutoScroll();
        }
    });
    
    // Detectar scroll manual para atualizar o índice atual
    let scrollTimeout;
    carousel.addEventListener('scroll', function() {
        // Pausa o automático se o usuário scrollar
        resetAutoScroll();
        
        // Atualiza qual é o card "ativo"
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            // Encontra o card mais próximo do centro
            const carouselCenter = carousel.scrollLeft + carousel.offsetWidth / 2;
            let closestIndex = 0;
            let closestDistance = Infinity;
            
            cards.forEach((card, index) => {
                const cardCenter = card.offsetLeft + card.offsetWidth / 2;
                const distance = Math.abs(carouselCenter - cardCenter);
                if (distance < closestDistance) {
                    closestDistance = distance;
                    closestIndex = index;
                }
            });
            currentIndex = closestIndex;
        }, 100);
    });
    
    // Botões de navegação
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');
    
    if (prevBtn && nextBtn) {
        // Tamanho do scroll baseado na largura do card + gap
        // Calcula dinamicamente baseado no primeiro card visível
        function getScrollAmount() {
            if (cards.length === 0) return 320;
            const firstCard = cards[0];
            const cardWidth = firstCard.offsetWidth;
            const gap = parseInt(window.getComputedStyle(carousel).gap) || 16;
            return cardWidth + gap;
        }
        
        nextBtn.addEventListener('click', () => {
            const scrollAmount = getScrollAmount();
            carousel.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
            resetAutoScroll();
        });

        prevBtn.addEventListener('click', () => {
            const scrollAmount = getScrollAmount();
            carousel.scrollBy({
                left: -scrollAmount,
                behavior: 'smooth'
            });
            resetAutoScroll();
        });
    }
    
    // Inicialização final do carrossel
    setTimeout(() => {
        carousel.scrollLeft = 0; // Garante mais uma vez que começa do início
        startAutoScroll();
    }, 1000);

    // ============================================
    // 5. BOTÃO AGENDAR CHATBOT
    // ============================================
    function openChatbot() {
        if (window.Chatling) {
            window.Chatling.open();
        } else {
            console.error('Chatling object not found. Make sure the embed script is loaded.');
            alert('O chatbot não está disponível no momento. Tente novamente mais tarde.');
        }
    }

    // Botão Agendar
    const agendarBtn = document.getElementById('agendar-chatbot-btn');
    if (agendarBtn) {
        agendarBtn.addEventListener('click', function(e) {
            e.preventDefault();
            openChatbot();
        });
    }
    
    // Cards do carrossel - Abrir chatbot ao clicar
    cards.forEach(card => {
        card.addEventListener('click', function(e) {
            e.preventDefault();
            openChatbot();
        });
    });
});

// ============================================
// FUNÇÕES GLOBAIS ADICIONAIS
// ============================================

// Smooth scroll para links internos (caso adicione menu no futuro)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Detecção de Touch Device
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}
