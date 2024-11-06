

















































































































































































































































function update() {
    if (gameOver) return;

    // Atualiza a posição das estrelas
    for (const star of stars) {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    }

    // Movimento do foguete
    if (keys.ArrowRight && foguete.x + foguete.width < canvas.width) foguete.x += foguete.speed;
    if (keys.ArrowLeft && foguete.x > 0) foguete.x -= foguete.speed;
    if (keys.ArrowDown && foguete.y + foguete.height < canvas.height) foguete.y += foguete.speed;
    if (keys.ArrowUp && foguete.y > 0) foguete.y -= foguete.speed;

    fogueteGif.style.left = foguete.x + 'px';
    fogueteGif.style.top = foguete.y + 'px';

    // Atualiza posição dos projéteis
    for (let i = projectiles.length - 1; i >= 0; i--) {
        const projectile = projectiles[i];
        projectile.x += projectile.speedX;
        projectile.y += projectile.speedY;

        const distToRocket = Math.hypot(foguete.x - projectile.x, foguete.y - projectile.y);

        if (distToRocket > 300) {
            projectile.opacity -= 0.05; // Reduz opacidade dos projéteis distantes
            if (projectile.opacity <= 0) {
                projectiles.splice(i, 1); // Remove projétil se estiver completamente transparente
            }
        } else {
            projectile.opacity = 1; // Totalmente opaco se próximo ao foguete
        }

        if (checkCollision(foguete, projectile)) {
            gameOver = true;
            verificarTentativas();
            return;
        }
    }

    if (projectiles.length > 10) {
        projectiles.splice(0, projectiles.length - 10);
    }

    for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        if (checkCollision(foguete, coin)) {
            score += 1;
            coins.splice(i, 1);
            i--;
            document.getElementById('score').innerText = 'Pontuação: ' + score;
        }
    }

    if (Math.random() < 0.03) spawnProjectile();
}

