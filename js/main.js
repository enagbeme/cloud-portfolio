document.addEventListener('DOMContentLoaded', () => {

    // ========== Particle Network ==========
    const canvas = document.getElementById('particles');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let w, h, particles;
        const PARTICLE_COUNT = 60;
        const CONNECTION_DIST = 120;
        const MOUSE_DIST = 150;
        let mouse = { x: -999, y: -999 };

        function resize() {
            const hero = canvas.parentElement;
            w = canvas.width = hero.offsetWidth;
            h = canvas.height = hero.offsetHeight;
        }

        function createParticles() {
            particles = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                particles.push({
                    x: Math.random() * w,
                    y: Math.random() * h,
                    vx: (Math.random() - 0.5) * 0.4,
                    vy: (Math.random() - 0.5) * 0.4,
                    r: Math.random() * 1.5 + 0.5,
                    glow: Math.random() > 0.85
                });
            }
        }

        function draw() {
            ctx.clearRect(0, 0, w, h);

            // Draw connections
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < CONNECTION_DIST) {
                        const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
                        ctx.strokeStyle = `rgba(201, 163, 95, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw particles & mouse connections
            particles.forEach(p => {
                // Mouse proximity glow
                const mdx = p.x - mouse.x;
                const mdy = p.y - mouse.y;
                const mDist = Math.sqrt(mdx * mdx + mdy * mdy);
                if (mDist < MOUSE_DIST) {
                    const alpha = (1 - mDist / MOUSE_DIST) * 0.3;
                    ctx.strokeStyle = `rgba(201, 163, 95, ${alpha})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }

                // Draw dot
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                if (p.glow) {
                    ctx.fillStyle = 'rgba(201, 163, 95, 0.8)';
                    ctx.shadowColor = 'rgba(201, 163, 95, 0.5)';
                    ctx.shadowBlur = 8;
                } else {
                    ctx.fillStyle = 'rgba(201, 163, 95, 0.25)';
                    ctx.shadowBlur = 0;
                }
                ctx.fill();
                ctx.shadowBlur = 0;

                // Move
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
            });

            requestAnimationFrame(draw);
        }

        canvas.parentElement.addEventListener('mousemove', e => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        canvas.parentElement.addEventListener('mouseleave', () => {
            mouse.x = -999;
            mouse.y = -999;
        });

        resize();
        createParticles();
        draw();
        window.addEventListener('resize', () => { resize(); createParticles(); });
    }

    // ========== Terminal Typing Effect ==========
    const termBody = document.querySelector('.terminal-body');
    if (termBody) {
        const lines = termBody.querySelectorAll('.term-line');
        const lineData = [];

        lines.forEach(line => {
            lineData.push({
                html: line.innerHTML,
                classes: line.className
            });
            line.innerHTML = '';
            line.style.visibility = 'hidden';
        });

        let lineIdx = 0;
        let charIdx = 0;
        let currentText = '';

        function getPlainText(html) {
            const div = document.createElement('div');
            div.innerHTML = html;
            return div.textContent || div.innerText;
        }

        function typeNext() {
            if (lineIdx >= lineData.length) return;

            const line = lines[lineIdx];
            const data = lineData[lineIdx];
            line.style.visibility = 'visible';

            const plainText = getPlainText(data.html);
            const isCommand = data.html.includes('term-prompt');
            const isOutput = data.classes.includes('out') || data.classes.includes('dim');

            if (isOutput) {
                // Output lines appear instantly with a fade
                line.innerHTML = data.html;
                line.style.opacity = '0';
                line.style.transform = 'translateY(4px)';
                line.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
                requestAnimationFrame(() => {
                    line.style.opacity = '1';
                    line.style.transform = 'translateY(0)';
                });
                lineIdx++;
                charIdx = 0;
                setTimeout(typeNext, 80);
            } else if (isCommand) {
                // Type character by character
                if (charIdx === 0) {
                    line.innerHTML = '<span class="term-prompt">$</span> ';
                    charIdx = 2; // skip "$ "
                }
                const textAfterPrompt = plainText.substring(2); // skip "$ "
                const typedSoFar = textAfterPrompt.substring(0, charIdx - 2);

                line.innerHTML = '<span class="term-prompt">$</span> ' + typedSoFar + '<span class="term-cursor">|</span>';

                if (charIdx - 2 < textAfterPrompt.length) {
                    charIdx++;
                    setTimeout(typeNext, 30 + Math.random() * 40);
                } else {
                    // Done typing this command
                    line.innerHTML = data.html;
                    lineIdx++;
                    charIdx = 0;
                    setTimeout(typeNext, 200);
                }
            } else {
                line.innerHTML = data.html;
                line.style.opacity = '0';
                line.style.transition = 'opacity 0.3s ease';
                requestAnimationFrame(() => { line.style.opacity = '1'; });
                lineIdx++;
                charIdx = 0;
                setTimeout(typeNext, 300);
            }
        }

        setTimeout(typeNext, 600);
    }

    // ========== Scroll Reveal ==========
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.08 });

    document.querySelectorAll('.project, .about-left, .about-right, .skill-block, .contact-inner').forEach(el => {
        observer.observe(el);
    });

    // ========== Tilt Effect on Project Cards ==========
    document.querySelectorAll('.project').forEach(card => {
        card.addEventListener('mousemove', e => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = (y - centerY) / centerY * -2;
            const rotateY = (x - centerX) / centerX * 2;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ========== Smooth Scroll for Nav ==========
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(link.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
});
