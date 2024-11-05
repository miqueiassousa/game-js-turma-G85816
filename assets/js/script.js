let score = 0;
let gameOver = false;
let chancesRestantes = 3;
let nome = null;

// Solicitar o nome do jogador
function solicitarNome() {
    while (!nome || nome.trim() === "") {
        nome = prompt("Digite seu nome para salvar sua pontuação:");
        if (!nome) {
            alert("Você precisa digitar um nome para continuar!");
        }
    }
}

// Salvar pontuação
function salvarPontuacao(nome, pontuacao) {
    let placar = JSON.parse(localStorage.getItem('placar')) || [];
    placar.push({ nome: nome, pontuacao: pontuacao });
    placar.sort((a, b) => b.pontuacao - a.pontuacao);
    placar = placar.slice(0, 5); // Mantém apenas os 5 melhores
    localStorage.setItem('placar', JSON.stringify(placar));
}

// Exibir placar
function exibirPlacar() {
    const placar = JSON.parse(localStorage.getItem('placar')) || [];
    const placarElement = document.getElementById('placar');
    placarElement.innerHTML = "<h2>Top 5 Jogadores</h2>";
    placar.forEach((jogador, index) => {
        placarElement.innerHTML += '<p>${index + 1}. ${jogador.nome}: ${jogador.pontuacao} pontos</p>';
    });
}

// Verificar tentativas
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

// Resetar jogo
function resetarJogo() {
    gameOver = false;
    score = 0;
    projectiles.length = 0;
    coins.length = 0;
    foguete.x = canvas.width / 2 - 50; // Reiniciar posição do foguete
    foguete.y = canvas.height / 2 - 50; // Reiniciar posição do foguete
}

// Configurações do foguete
const foguete = {
    x: canvas.width / 2 - 50,
    y: canvas.height / 2 - 50,
    width: 100,
    height: 100,
    speed: 6,
};

// Carregar imagens
const fogueteImage = new Image();
fogueteImage.src = 'assets/imgs/foguete2.gif'; // Verifique se o GIF está nesse caminho
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

// Atualização do jogo
function update() {
    if (gameOver) return;

    // Movimenta o foguete
    if (keys.ArrowRight && foguete.x + foguete.width < canvas.width) foguete.x += foguete.speed;
    if (keys.ArrowLeft && foguete.x > 0) foguete.x -= foguete.speed;
    if (keys.ArrowDown && foguete.y + foguete.height < canvas.height) foguete.y += foguete.speed;
    if (keys.ArrowUp && foguete.y > 0) foguete.y -= foguete.speed;

    // Movimenta projéteis e verifica colisões
    for (let projectile of projectiles) {
        projectile.y += projectile.speedY;

        if (checkCollision(foguete, projectile)) {
            gameOver = true;
            verificarTentativas();
            return;
        }

        if (projectile.y > canvas.height) {
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
            document.getElementById('score').innerText = 'Pontuação: ' + score; // Atualiza a pontuação na tela
        }
    }

    // Gera novos projéteis a cada 2 segundos
    if (Math.random() < 0.02) spawnProjectile();
}

// Desenha o jogo
function draw() {
    if (gameOver) return;

    // Limpa o canvas
    ctx.fillStyle = "black";
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

    // Exibe tentativas restantes
    document.getElementById('tentativas').innerText = 'Tentativas Restantes: ' + chancesRestantes;
}

// Verifica colisão
function checkCollision(a, b) {
    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}

// Adiciona projéteis ao jogo
function spawnProjectile() {
    const projectile = {
        x: Math.random() * (canvas.width - 50), // Gera no limite da tela
        y: 0, // Começa do topo
        width: 50,
        height: 50,
        speedY: 5,
    };
    projectiles.push(projectile);
}

// Adiciona moedas ao jogo
function spawnCoin() {
    const coin = {
        x: Math.random() * (canvas.width - 30), // Gera no limite da tela
        y: Math.random() * (canvas.height - 30), // Gera no limite da tela
        width: 30,
        height: 30,
    };
    coins.push(coin);
}

// Loop do jogo
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Inicializa o jogo
solicitarNome(); // Solicita o nome do jogador
exibirPlacar(); // Exibe placar no início
gameLoop(); // Inicia o loop do jogo