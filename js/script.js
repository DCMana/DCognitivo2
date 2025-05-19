// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    console.log('Sitio cargado y listo para la nueva aventura cognitiva!');

    // --- 0. NAVEGACIÓN MÓVIL (MENÚ HAMBURGUESA) ---
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('header nav');

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('active');
            navToggle.classList.toggle('active');
            const isExpanded = mainNav.classList.contains('active');
            navToggle.setAttribute('aria-expanded', isExpanded);
        });

        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth < 769 && mainNav.classList.contains('active')) { // Cerrar solo en vista móvil
                    mainNav.classList.remove('active');
                    navToggle.classList.remove('active');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }

    // --- 1. FUNCIONALIDAD DE ACORDEONES ---
    const accordionHeaders = document.querySelectorAll('.accordion-header');

    // SVG para el icono del acordeón (+ y se transforma en x o - con CSS)
    const accordionIconSVG = `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <line class="horizontal-line" x1="4" y1="12" x2="20" y2="12"/>
            <line class="vertical-line" x1="12" y1="4" x2="12" y2="20"/>
        </svg>`;

    accordionHeaders.forEach(header => {
        const iconContainer = header.querySelector('.accordion-icon');
        if (iconContainer) {
            iconContainer.innerHTML = accordionIconSVG; // Insertar el SVG del icono
        }

        header.addEventListener('click', () => {
            const content = header.parentElement.querySelector('.accordion-content');
            const isActive = header.classList.contains('active');

            // Cerrar otros acordeones (si se desea que solo uno esté abierto)
            // accordionHeaders.forEach(otherHeader => {
            //     if (otherHeader !== header && otherHeader.classList.contains('active')) {
            //         otherHeader.classList.remove('active');
            //         const otherContent = otherHeader.parentElement.querySelector('.accordion-content');
            //         otherContent.style.maxHeight = null;
            //         otherContent.style.paddingTop = '0';
            //         otherContent.style.paddingBottom = '0';
            //     }
            // });

            header.classList.toggle('active');

            if (isActive) {
                content.style.maxHeight = null;
                content.style.paddingTop = '0';
                content.style.paddingBottom = '0';
            } else {
                content.style.maxHeight = content.scrollHeight + 30 + 'px';
                content.style.paddingTop = '1rem'; // Usar rem para consistencia
                content.style.paddingBottom = '1rem';
                // Opcional: scroll al acordeón abierto
                // setTimeout(() => {
                //    header.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                // }, 350);
            }
        });
    });


    // --- 2. CONTROL BÁSICO DE REPRODUCCIÓN DE AUDIO ---
    const audioPlayers = document.querySelectorAll('audio');
    if (audioPlayers.length > 0) {
        audioPlayers.forEach(player => {
            player.addEventListener('play', () => {
                audioPlayers.forEach(otherPlayer => {
                    if (otherPlayer !== player && !otherPlayer.paused) {
                        otherPlayer.pause();
                    }
                });
            });
        });
    }

    // --- 3. SMOOTH SCROLL PARA ENLACES INTERNOS (href="#seccion") ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            // Asegurarse que es un enlace a un ID en la página actual y no solo "#"
            if (href.length > 1 && href.startsWith('#')) {
                const targetId = href.substring(1);
                const targetElement = document.getElementById(targetId);

                if (targetElement) {
                    e.preventDefault();
                    const headerOffset = document.querySelector('header')?.offsetHeight || 80; // Altura del header fijo
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                    window.scrollTo({
                        top: offsetPosition,
                        behavior: "smooth"
                    });
                }
            }
        });
    });


    // --- 4. JUEGO DE MEMORIA (en memoria.html) ---
    const memoryGameContainer = document.getElementById('memoryGame');
    const resetGameButton = document.getElementById('resetMemoryGame');

    if (memoryGameContainer && resetGameButton) {
        // Nuevos nombres para las imágenes del juego, más semánticos
        // Estas serán las imágenes que se mostrarán EN LA CARA VISIBLE de la tarjeta.
        // Asegúrate de tener estos archivos en la carpeta images/ con extensión .png o .svg
        const cardImageFiles = [
            'mem-brain.svg', 'mem-book.svg', 'mem-puzzle.svg',
            'mem-lightbulb.svg', 'mem-gears.svg', 'mem-star.svg'
            // Puedes añadir más, solo asegúrate de tener los archivos correspondientes
        ];
        let cardsData = [...cardImageFiles, ...cardImageFiles]; // Duplicar para crear parejas

        let firstCard = null;
        let secondCard = null;
        let lockBoard = false;
        let matchesFound = 0;

        // SVG para el patrón de la parte trasera de la tarjeta
        const cardBackPatternSVG = `
            <svg class="card-pattern-svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                <circle cx="20" cy="20" r="5" />
                <circle cx="50" cy="20" r="5" />
                <circle cx="80" cy="20" r="5" />
                <circle cx="20" cy="50" r="5" />
                <circle cx="50" cy="50" r="5" />
                <circle cx="80" cy="50" r="5" />
                <circle cx="20" cy="80" r="5" />
                <circle cx="50" cy="80" r="5" />
                <circle cx="80" cy="80" r="5" />
            </svg>`;

        function shuffle(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
            return array;
        }

        function createBoard() {
            memoryGameContainer.innerHTML = '';
            matchesFound = 0;

            shuffle(cardsData).forEach(imageName => {
                const card = document.createElement('div');
                card.classList.add('memory-card');
                card.dataset.cardName = imageName; // Guardar el nombre de la imagen para comparar

                const frontFace = document.createElement('div');
                frontFace.classList.add('front-face');
                frontFace.innerHTML = cardBackPatternSVG; // Usar el patrón SVG

                const backFace = document.createElement('div');
                backFace.classList.add('back-face');
                const imgElement = document.createElement('img');
                imgElement.src = `images/${imageName}`; // ej: images/mem-brain.svg
                // Extraer el nombre sin extensión para el alt
                const altText = imageName.substring(0, imageName.lastIndexOf('.')).replace('mem-', '');
                imgElement.alt = `Icono de ${altText}`;
                backFace.appendChild(imgElement);

                card.appendChild(frontFace);
                card.appendChild(backFace);
                card.addEventListener('click', flipCard);
                memoryGameContainer.appendChild(card);
            });
        }

        function flipCard() {
            if (lockBoard || this.classList.contains('flip') || this.classList.contains('match')) {
                return;
            }
            this.classList.add('flip');

            if (!firstCard) {
                firstCard = this;
            } else {
                secondCard = this;
                lockBoard = true;
                checkForMatch();
            }
        }

        function checkForMatch() {
            const isMatch = firstCard.dataset.cardName === secondCard.dataset.cardName;
            isMatch ? disableCards() : unflipCards();
        }

        function disableCards() {
            firstCard.removeEventListener('click', flipCard);
            secondCard.removeEventListener('click', flipCard);
            firstCard.classList.add('match');
            secondCard.classList.add('match');
            matchesFound++;
            if (matchesFound === cardImageFiles.length) {
                setTimeout(() => {
                    // Podrías reemplazar el alert con un modal más bonito
                    alert('¡Felicidades! Encontraste todas las parejas. ¡Tu memoria es genial!');
                }, 700);
            }
            resetBoard();
        }

        function unflipCards() {
            setTimeout(() => {
                firstCard.classList.remove('flip');
                secondCard.classList.remove('flip');
                resetBoard();
            }, 1200); // Un poco más de tiempo para ver la segunda tarjeta
        }

        function resetBoard() {
            [firstCard, secondCard, lockBoard] = [null, null, false];
        }

        function startGame() {
            resetBoard();
            // Asegurarse que todas las tarjetas estén boca abajo y sin la clase 'match'
             document.querySelectorAll('.memory-card.flip').forEach(card => card.classList.remove('flip'));
             document.querySelectorAll('.memory-card.match').forEach(card => card.classList.remove('match'));
            createBoard();
        }

        resetGameButton.addEventListener('click', startGame);
        startGame(); // Iniciar el juego al cargar
    }

}); // Fin del DOMContentLoaded listener