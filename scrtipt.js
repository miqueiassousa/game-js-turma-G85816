const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
let speedMultiplier = 1; // Multiplicador inicial de velocidade dos projéteis

// Configurações do Mario (foguete), sem depender da gameBox
const mario = {
    x: canvas.width / 2 - 50, // Centro do canvas
    y: canvas.height / 2 - 50, // Centro do canvas
    width: 100,
    height: 100,
    speed: 6,
};


// Adiciona o GIF animado diretamente sobre o canvas
const marioGif = document.createElement('img');
marioGif.src = 'foguete2.gif'; // Caminho do GIF
marioGif.style.position = 'absolute';
marioGif.style.width = mario.width + 'px';
marioGif.style.height = mario.height + 'px';
document.body.appendChild(marioGif);

// Lista de projéteis e moedas
const projectiles = [];
const coins = [];

// Carregar a imagem da moeda
const coinImage = new Image();
coinImage.src = 'senai1.png'; // Caminho da imagem da moeda

// Carregar a imagem do projétil
const projectileImage = new Image();
projectileImage.src = 'meteorito.png'; // Caminho da imagem do projétil

// Configurações das estrelas
const stars = [];
const NUM_STARS = 100; // Número de estrelas

for (let i = 0; i < NUM_STARS; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 2, // Raio aleatório para estrelas
        speed: Math.random() * 0.5 + 0.1 // Velocidade de movimento lenta
    });
}

// Controles de teclas
let keys = {
    ArrowRight: false,
    ArrowLeft: false,
    ArrowUp: false,
    ArrowDown: false,
};

// Event listeners para movimento
document.addEventListener('keydown', (e) => {
    if (e.code in keys) keys[e.code] = true;
});

document.addEventListener('keyup', (e) => {
    if (e.code in keys) keys[e.code] = false;
});

// Função para desenhar o fundo
function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#000000'); // Preto no topo
    gradient.addColorStop(1, '#1E1E50'); // Azul escuro na parte inferior

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar estrelas
    ctx.fillStyle = 'white';
    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2); // Desenha as estrelas
        ctx.fill();
    }
}

// Função de atualização do jogo
function update() {
    if (gameOver) return;

    // Atualiza a posição das estrelas
    for (const star of stars) {
        star.y += star.speed; // Movimento lento para baixo
        if (star.y > canvas.height) { // Reposiciona quando sai da tela
            star.y = 0;
            star.x = Math.random() * canvas.width; // Nova posição horizontal
        }
    }

    // Movimento do Mario, sem limitar à caixa
    if (keys.ArrowRight && mario.x + mario.width < canvas.width) mario.x += mario.speed;
    if (keys.ArrowLeft && mario.x > 0) mario.x -= mario.speed;
    if (keys.ArrowDown && mario.y + mario.height < canvas.height) mario.y += mario.speed;
    if (keys.ArrowUp && mario.y > 0) mario.y -= mario.speed;


    // Atualiza a posição do GIF para coincidir com a posição do Mario
    marioGif.style.left = mario.x + 'px';
    marioGif.style.top = mario.y + 'px';

    // Atualiza posição dos projéteis
    for (let projectile of projectiles) {
        projectile.x += projectile.speedX;
        projectile.y += projectile.speedY;

        // Verifica colisão com o Mario
        if (checkCollision(mario, projectile)) {
            gameOver = true;
            // alert('Game Over! Sua pontuação: ' + score);
            window.location.reload();
        }

        // Remove projéteis que saem da tela
        if (projectile.x < 0 || projectile.x > canvas.width || projectile.y < 0 || projectile.y > canvas.height) {
            projectiles.splice(projectiles.indexOf(projectile), 1);
        }
    }

    // Verifica colisão com moedas
    for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        if (checkCollision(mario, coin)) {
            score += 1;
            coins.splice(i, 1); // Remove a moeda coletada
            i--; // Ajusta índice após remoção
        }
    }
}

// Função de desenhar o jogo
function draw() {
    if (gameOver) return;

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar fundo
    drawBackground();

    // Desenha os projéteis
    for (let projectile of projectiles) {
        ctx.drawImage(projectileImage, projectile.x, projectile.y, projectile.width, projectile.height); // Desenha a imagem do projétil
    }

    // Desenha as moedas
    for (let coin of coins) {
        ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height); // Desenha a imagem da moeda
    }

    // Atualiza pontuação
    document.querySelector('.score').innerText = 'Pontuação: ' + score;
}

// Função para verificar colisão com uma área de "segurança"
function checkCollision(a, b) {
    const collisionOffset = 30; // Área de "segurança" para detecção de colisão
    return (
        a.x < b.x + b.width - collisionOffset &&
        a.x + a.width - collisionOffset > b.x &&
        a.y < b.y + b.height - collisionOffset &&
        a.y + a.height - collisionOffset > b.y
    );
}

// Função para criar novos projéteis com direção ao Mario
function spawnProjectile() {
    const side = Math.floor(Math.random() * 4);
    let projectile = {
        x: 0,
        y: 0,
        width: 30,
        height: 30,
        speedX: 0,
        speedY: 0,
    };

    // Define a posição inicial do projétil em um dos lados da tela
    switch (side) {
        case 0: // Esquerda
            projectile.x = 0;
            projectile.y = Math.random() * canvas.height;
            break;
        case 1: // Direita
            projectile.x = canvas.width;
            projectile.y = Math.random() * canvas.height;
            break;
        case 2: // Topo
            projectile.x = Math.random() * canvas.width;
            projectile.y = 0;
            break;
        case 3: // Base
            projectile.x = Math.random() * canvas.width;
            projectile.y = canvas.height;
            break;
    }

    // Calcula a direção para o Mario
    const angle = Math.atan2(mario.y - projectile.y, mario.x - projectile.x);
    const speed = (Math.random() * 3 + 2) * speedMultiplier; // Ajusta velocidade com o multiplicador
    projectile.speedX = Math.cos(angle) * speed;
    projectile.speedY = Math.sin(angle) * speed;

    projectiles.push(projectile);
}

// Função para criar moedas dentro da área do canvas, limitada a 5 moedas na tela
function spawnCoin() {
    if (coins.length < 5) { // Limita a criação de moedas a 4
        const coin = {
            x: Math.random() * (canvas.width - 20), // Altera para usar canvas.width
            y: Math.random() * (canvas.height - 20), // Altera para usar canvas.height
            width: 70,
            height: 30,
        };
        coins.push(coin);
    }
}


// Loop do jogo
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Inicia o jogo
setInterval(spawnProjectile, 1000); // Cria novos projéteis a cada segundo
setInterval(spawnCoin, 1000); // Cria novas moedas a cada 3 segundos
gameLoop(); // Começa o loop do jogo
