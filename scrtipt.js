
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
let speedMultiplier = 1; // Multiplicador inicial de velocidade dos projéteis

// Configurações da caixa de jogo
const gameBox = {
    x: canvas.width / 4,
    y: canvas.height / 4,
    width: canvas.width / 2,
    height: canvas.height / 2,
};

// Configurações do Mario dentro da caixa
const mario = {
    x: gameBox.x + gameBox.width / 2 - 25,
    y: gameBox.y + gameBox.height / 2 - 25,
    width: 50,
    height: 50,
    speed: 5,
};

// Lista de projéteis e moedas
const projectiles = [];
const coins = [];

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

// Função de atualização do jogo
function update() {
    if (gameOver) return;

    // Aumenta o multiplicador de velocidade a cada 50 pontos
    if (score > 0 && score % 50 === 0) {
        speedMultiplier *= 1.5;
        score += 1; // Incremento para evitar loop ao atingir o múltiplo de 50
    }

    // Movimento do Mario, limitado à caixa
    if (keys.ArrowRight && mario.x + mario.width < gameBox.x + gameBox.width) mario.x += mario.speed;
    if (keys.ArrowLeft && mario.x > gameBox.x) mario.x -= mario.speed;
    if (keys.ArrowDown && mario.y + mario.height < gameBox.y + gameBox.height) mario.y += mario.speed;
    if (keys.ArrowUp && mario.y > gameBox.y) mario.y -= mario.speed;

    // Atualiza posição dos projéteis
    for (let projectile of projectiles) {
        projectile.x += projectile.speedX;
        projectile.y += projectile.speedY;

        // Verifica colisão com o Mario
        if (checkCollision(mario, projectile)) {
            gameOver = true;
            alert('Game Over! Sua pontuação: ' + score);
            window.location.reload();
        }

        // Remove projéteis que saem da tela
        if (
            projectile.x < 0 ||
            projectile.x > canvas.width ||
            projectile.y < 0 ||
            projectile.y > canvas.height
        ) {
            projectiles.splice(projectiles.indexOf(projectile), 1);
        }
    }

    // Verifica colisão com moedas
    for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        if (checkCollision(mario, coin)) {
            score += 10;
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

    // Desenha a caixa de jogo
    ctx.strokeStyle = 'black';
    ctx.strokeRect(gameBox.x, gameBox.y, gameBox.width, gameBox.height);

    // Desenha o Mario
    ctx.fillStyle = 'red';
    ctx.fillRect(mario.x, mario.y, mario.width, mario.height);

    // Desenha os projéteis
    ctx.fillStyle = 'purple';
    for (let projectile of projectiles) {
        ctx.fillRect(
            projectile.x,
            projectile.y,
            projectile.width,
            projectile.height
        );
    }

    // Desenha as moedas
    ctx.fillStyle = 'gold';
    for (let coin of coins) {
        ctx.beginPath();
        ctx.arc(
            coin.x + coin.width / 2,
            coin.y + coin.height / 2,
            coin.width / 2,
            0,
            Math.PI * 2
        );
        ctx.fill();
    }

    // Atualiza pontuação
    document.querySelector('.score').innerText = 'Pontuação: ' + score;
}

// Função para verificar colisão
function checkCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

function addScore() {
    return score += 1;
}
// Função para criar novos projéteis com direção ao Mario
function spawnProjectile() {
    const side = Math.floor(Math.random() * 4);
    let projectile = {
        x: 0,
        y: 0,
        width: 10,
        height: 10,
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
    const angle = Math.atan2(
        mario.y - projectile.y,
        mario.x - projectile.x
    );
    const speed = (Math.random() * 3 + 2) * speedMultiplier; // Ajusta velocidade com o multiplicador
    projectile.speedX = Math.cos(angle) * speed;
    projectile.speedY = Math.sin(angle) * speed;

    projectiles.push(projectile);
}

// Função para criar moedas dentro da caixa de jogo, limitada a 4 moedas na tela
function spawnCoin() {
    if (coins.length < 4) {
        // Limita a criação de moedas a 4
        const coin = {
            x: Math.random() * (gameBox.width - 20) + gameBox.x,
            y: Math.random() * (gameBox.height - 20) + gameBox.y,
            width: 20,
            height: 20,
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
setInterval(spawnCoin, 3000); // Cria novas moedas a cada 3 segundos
setInterval(addScore, 1000); // Adiciona 1 ponto a cada 1 segundo
gameLoop();
