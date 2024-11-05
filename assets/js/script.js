const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let score = 0;
let gameOver = false;
let chancesRestantes = 3;
let nome = null;

// Função para solicitar o nome do jogador e garantir que o jogador insira algo
function solicitarNome() {
    while (!nome || nome.trim() === "") {
        nome = prompt("Digite seu nome para salvar sua pontuação:");
        if (!nome) {
            alert("Você precisa digitar um nome para continuar!");
        }
    }
}

// Função para salvar a pontuação no localStorage
function salvarPontuacao(nome, pontuacao) {
    let placar = JSON.parse(localStorage.getItem('placar')) || [];
    placar.push({ nome: nome, pontuacao: pontuacao });
    placar.sort((a, b) => b.pontuacao - a.pontuacao);
    placar = placar.slice(0, 5); // Mantém apenas os 5 melhores
    localStorage.setItem('placar', JSON.stringify(placar));
}

// Função para exibir o placar na tela
function exibirPlacar() {
    const placar = JSON.parse(localStorage.getItem('placar')) || [];
    const placarElement = document.getElementById('placar');
    placarElement.innerHTML = "<h2>Top 5 Jogadores</h2>";
    placar.forEach((jogador, index) => {
        placarElement.innerHTML += `<p>${index + 1}. ${jogador.nome}: ${jogador.pontuacao} pontos</p>`;
    });
}

// Função para verificar tentativas e tratar game over
function verificarTentativas() {
    chancesRestantes--;
    if (chancesRestantes > 0) {
        alert(`Você tem ${chancesRestantes} tentativas restantes.`);
        resetarJogo(); // Reseta o jogo para uma nova tentativa
    } else {
        solicitarNome();
        salvarPontuacao(nome, score);
        exibirPlacar();
        alert("Fim do jogo! Suas tentativas acabaram.");
        window.location.reload(); // Recarrega o jogo para iniciar novamente
    }
}

// Função para resetar o jogo após uma tentativa sem perder o placar e chances
function resetarJogo() {
    gameOver = false;
    score = 0;
    projectiles.length = 0;
    coins.length = 0;
    foguete.x = canvas.width / 2 - 50;
    foguete.y = canvas.height / 2 - 50;
}

// Configurações do foguete
const foguete = {
    x: canvas.width / 2 - 50,
    y: canvas.height / 2 - 50,
    width: 100,
    height: 100,
    speed: 6,
};

// Carregar a imagem do foguete, da moeda e do projétil
const fogueteImage = new Image();
fogueteImage.src = 'assets/imgs/foguete2.gif';
fogueteImage.onload = function() {
    console.log("Imagem do foguete carregada com sucesso.");
}
fogueteImage.onerror = function() {
    console.error("Erro ao carregar a imagem do foguete. Verifique o caminho.");
}

const coinImage = new Image();
coinImage.src = 'assets/imgs/senai1.png';
coinImage.onload = function() {
    console.log("Imagem da moeda carregada com sucesso.");
}
coinImage.onerror = function() {
    console.error("Erro ao carregar a imagem da moeda. Verifique o caminho.");
}

const projectileImage = new Image();
projectileImage.src = 'assets/imgs/meteorito.png';
projectileImage.onload = function() {
    console.log("Imagem do projétil carregada com sucesso.");
}
projectileImage.onerror = function() {
    console.error("Erro ao carregar a imagem do projétil. Verifique o caminho.");
}

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

document.addEventListener('keydown', (e) => {
    if (e.code in keys) keys[e.code] = true;
});
document.addEventListener('keyup', (e) => {
    if (e.code in keys) keys[e.code] = false;
});

function update() {
    if (gameOver) return;

    // Movimenta o foguete
    if (keys.ArrowRight && foguete.x + foguete.width < canvas.width) foguete.x += foguete.speed;
    if (keys.ArrowLeft && foguete.x > 0) foguete.x -= foguete.speed;
    if (keys.ArrowDown && foguete.y + foguete.height < canvas.height) foguete.y += foguete.speed;
    if (keys.ArrowUp && foguete.y > 0) foguete.y -= foguete.speed;

    // Movimenta projéteis e verifica colisões
    for (let projectile of projectiles) {
        projectile.x += projectile.speedX;
        projectile.y += projectile.speedY;

        if (checkCollision(foguete, projectile)) {
            gameOver = true;
            verificarTentativas();
            return;
        }

        if (projectile.x < 0 || projectile.x > canvas.width || projectile.y < 0 || projectile.y > canvas.height) {
            projectiles.splice(projectiles.indexOf(projectile), 1);
        }
    }

    // Verifica colisão com moedas
    for (let i = 0; i < coins.length; i++) {
        const coin = coins[i];
        if (checkCollision(foguete, coin)) {
            score += 1;
            coins.splice(i, 1);
            i--;
        }
    }
}

function draw() {
    if (gameOver) return;

    // Limpa o canvas
    ctx.fillStyle = "black"; // Cor de fundo do jogo
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenha o foguete
    ctx.drawImage(fogueteImage, foguete.x, foguete.y, foguete.width, foguete.height);

    // Desenha projéteis e moedas
    for (let projectile of projectiles) {
        ctx.drawImage(projectileImage, projectile.x, projectile.y, projectile.width, projectile.height);
    }

    for (let coin of coins) {
        ctx.drawImage(coinImage, coin.x, coin.y, coin.width, coin.height);
    }

    // Exibe a pontuação e as tentativas restantes
    document.getElementById('score').innerText = 'Pontuação: ' + score;
    document.getElementById('tentativas').innerText = 'Tentativas Restantes: ' + chancesRestantes;
}

// Função para verificar colisão
function checkCollision(a, b) {
    const collisionOffset = 30;
    return (
        a.x < b.x + b.width - collisionOffset &&
        a.x + a.width - collisionOffset > b.x &&
        a.y < b.y + b.height - collisionOffset &&
        a.y + a.height - collisionOffset > b.y
    );
}

// Função para gerar projéteis de maneira aleatória
function spawnProjectile() {
    const side = Math.floor(Math.random() * 4);
    let projectile = { x: 0, y: 0, width: 30, height: 30, speedX: 0, speedY: 0 };

    switch (side) {
        case 0: projectile.x = 0; projectile.y = Math.random() * canvas.height; projectile.speedX = 2; break;
        case 1: projectile.x = canvas.width; projectile.y = Math.random() * canvas.height; projectile.speedX = -2; break;
        case 2: projectile.x = Math.random() * canvas.width; projectile.y = 0; projectile.speedY = 2; break;
        case 3: projectile.x = Math.random() * canvas.width; projectile.y = canvas.height; projectile.speedY = -2; break;
    }

    projectiles.push(projectile);
}

// Função para gerar moedas de maneira aleatória
function spawnCoin() {
    const coin = { x: Math.random() * canvas.width, y: Math.random() * canvas.height, width: 30, height: 30 };
    coins.push(coin);
}

// Função principal do jogo
function gameLoop() {
    update();
    draw();
    if (!gameOver) {
        requestAnimationFrame(gameLoop);
    }
}

// Função para iniciar o jogo e gerar projéteis e moedas
function iniciarJogo() {
    solicitarNome(); // Solicita o nome do jogador no início
    setInterval(spawnProjectile, 2000);
    setInterval(spawnCoin, 5000);
    exibirPlacar();
}

iniciarJogo();
gameLoop();
