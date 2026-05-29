document.addEventListener('DOMContentLoaded', () => {
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

    // Terminal typing effect
    const lines = document.querySelectorAll('.term-line');
    lines.forEach((line, i) => {
        line.style.opacity = '0';
        line.style.transform = 'translateY(4px)';
        line.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        setTimeout(() => {
            line.style.opacity = '1';
            line.style.transform = 'translateY(0)';
        }, 400 + i * 150);
    });
});
