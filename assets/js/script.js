const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let melhorPontuacao = 0; // Variável para armazenar a melhor pontuação
let score = 0;
let gameOver = false;
let speedMultiplier = 0.5; // Multiplicador inicial de velocidade dos projéteis

// Chance e nome do jogador
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
    // Pega o placar existente do localStorage ou inicializa como um array vazio
    let placar = JSON.parse(localStorage.getItem('placar')) || [];
    
    // Verifica se o jogador já está no placar
    const jogadorExistente = placar.find(jogador => jogador.nome === nome);
    
    if (jogadorExistente) {
        // Atualiza a pontuação apenas se a nova for maior
        jogadorExistente.pontuacao = Math.max(jogadorExistente.pontuacao, pontuacao);
    } else {
        // Se o jogador não existir no placar, adiciona como novo
        placar.push({ nome: nome, pontuacao: pontuacao });
    }
    
    // Ordena o placar pela pontuação (do maior para o menor)
    placar.sort((a, b) => b.pontuacao - a.pontuacao);
    
    // Mantém apenas os 5 melhores
    placar = placar.slice(0, 10);
    
    // Salva o placar atualizado no localStorage
    localStorage.setItem('placar', JSON.stringify(placar));
}


// Exibir placar
function exibirPlacar() {
    const placar = JSON.parse(localStorage.getItem('placar')) || [];
    const placarElement = document.getElementById('placar');
    
    // Limpa o conteúdo anterior do placar
    placarElement.innerHTML = "<h2>Top 5 Jogadores</h2>";
    
    // Exibe os jogadores no placar
    placar.forEach((jogador, index) => {
        placarElement.innerHTML += `<p>${index + 1}. ${jogador.nome}: ${jogador.pontuacao} pontos</p>`;
    });
    
    // Certifique-se de que o placar está visível
    placarElement.style.display = "block"; // Faz o placar aparecer, caso esteja oculto
}
// Verificar tentativas
function verificarTentativas() {
    chancesRestantes--;
    if (chancesRestantes >= 0) {
        // Atualiza a melhor pontuação entre todas as tentativas
        melhorPontuacao = Math.max(melhorPontuacao, score);

        if (chancesRestantes > 0) {
            alert(`Você tem ${chancesRestantes} tentativas restantes.`);
            resetarJogo(); // Reseta o jogo para uma nova tentativa
        } else {
            // Solicita o nome e salva a melhor pontuação após todas as tentativas
            solicitarNome();
            salvarPontuacao(nome, melhorPontuacao); // Salva a melhor pontuação obtida entre as tentativas
            exibirPlacar();
            alert("Fim do jogo! Suas tentativas acabaram.");
            window.location.reload(); // Recarrega o jogo para iniciar novamente
        }
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

    // Reinicialize as variáveis de controle das teclas
    keys.ArrowRight = false;
    keys.ArrowLeft = false;
    keys.ArrowUp = false;
    keys.ArrowDown = false;

    // Reinicie o GIF do foguete para centralizar
    fogueteGif.style.left = foguete.x + 'px';
    fogueteGif.style.top = foguete.y + 'px';
}

// Configurações do foguete (foguete), sem depender da gameBox
const foguete = {
    x: canvas.width / 2 - 50, // Centro do canvas
    y: canvas.height / 2 - 50, // Centro do canvas
    width: 100,
    height: 100,
    speed: 6,
};


// Adiciona o GIF animado diretamente sobre o canvas
const fogueteGif = document.createElement('img');
fogueteGif.src = 'assets/imgs/foguete2.gif'; // Caminho do GIF
fogueteGif.style.position = 'absolute';
fogueteGif.style.width = foguete.width + 'px';
fogueteGif.style.height = foguete.height + 'px';
document.body.appendChild(fogueteGif);

// Lista de projéteis e moedas
const projectiles = [];
const coins = [];

// Carregar a imagem da moeda
const coinImage = new Image();
coinImage.src = 'assets/imgs/senai1.png'; // Caminho da imagem da moeda

// Carregar a imagem do projétil
const projectileImage = new Image();
projectileImage.src = 'assets/imgs/meteorito.png'; // Caminho da imagem do projétil

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
// Variáveis para controlar a cor de transição e progresso
let currentGradientStart = '#000000';
let currentGradientEnd = '#1E1E50';
let targetGradientStart = '#000000';
let targetGradientEnd = '#1E1E50';
let transitionProgress = 0; // Progresso de 0 (início) a 1 (final)

// Função para desenhar o fundo com transição
function drawBackground() {
    // Define o gradiente alvo com base na pontuação
    if (score >= 15) {
        targetGradientStart = '#B8860B';
        targetGradientEnd = '#1E1E50';
    } else if (score >= 10) {
        targetGradientStart = '#800000';
        targetGradientEnd = '#1E1E50';
    } else if (score >= 5) {
        targetGradientStart = '#9389';
        targetGradientEnd = '#150';
    } else {
        targetGradientStart = '#000000';
        targetGradientEnd = '#1E1E50';
    }

    // Incrementa o progresso da transição até o máximo de 1
    transitionProgress = Math.min(transitionProgress + 0.01, 1);

    // Interpola a cor do gradiente para uma transição suave
    const interpolatedStart = interpolateColor(currentGradientStart, targetGradientStart, transitionProgress);
    const interpolatedEnd = interpolateColor(currentGradientEnd, targetGradientEnd, transitionProgress);

    // Desenha o gradiente interpolado no fundo
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, interpolatedStart);
    gradient.addColorStop(1, interpolatedEnd);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Desenhar estrelas
    ctx.fillStyle = 'white';
    for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
    }

    // Atualiza as cores do gradiente atual quando a transição completa
    if (transitionProgress >= 1) {
        currentGradientStart = targetGradientStart;
        currentGradientEnd = targetGradientEnd;
        transitionProgress = 0; // Reseta o progresso para a próxima transição
    }
}

// Função auxiliar para interpolar entre duas cores hexadecimais
function interpolateColor(color1, color2, factor) {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);

    return `rgb(${r}, ${g}, ${b})`;
}

// Função auxiliar para converter hexadecimal em RGB
function hexToRgb(hex) {
    const bigint = parseInt(hex.slice(1), 16);
    return {
        r: (bigint >> 16) & 255,
        g: (bigint >> 8) & 255,
        b: bigint & 255,
    };
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

    // Movimento do foguete, sem limitar à caixa
    if (keys.ArrowRight && foguete.x + foguete.width < canvas.width) foguete.x += foguete.speed;
    if (keys.ArrowLeft && foguete.x > 0) foguete.x -= foguete.speed;
    if (keys.ArrowDown && foguete.y + foguete.height < canvas.height) foguete.y += foguete.speed;
    if (keys.ArrowUp && foguete.y > 0) foguete.y -= foguete.speed;

    // Atualiza a posição do GIF para coincidir com a posição do foguete
    fogueteGif.style.left = foguete.x + 'px';
    fogueteGif.style.top = foguete.y + 'px';

    // Atualiza posição dos projéteis
    for (let projectile of projectiles) {
        projectile.x += projectile.speedX;
        projectile.y += projectile.speedY;

        // Verifica colisão com o foguete
        if (checkCollision(foguete, projectile)) {
            gameOver = true;
            verificarTentativas();
            return;
        }

        // Remove projéteis que saem da tela
        if (projectile.x < 0 || projectile.x > canvas.width || projectile.y < 0 || projectile.y > canvas.height) {
            projectiles.splice(projectiles.indexOf(projectile), 1);
        }
    }

        // **Remover projéteis quando houver muitos**
    if (projectiles.length > 10) { // Limite de 10 projéteis na tela
        projectiles.splice(0, projectiles.length - 10); // Remove projéteis extras
    }

    // if (projectiles.length > 10) {
    //     // Aplica a redução de opacidade aos projéteis extras
    //     projectiles.forEach((projectile, index) => {
    //         if (projectiles.length > 10) {
    //             projectile.opacity -= 0.01; // Reduz a opacidade gradualmente
    //             if (projectile.opacity <= 0) {
    //                 // Remove projéteis quando a opacidade atingir zero
    //                 projectiles.splice(index, 1);
    //             }
    //         }
    //     });
    // }
    

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
    if (Math.random() < 0.03) spawnProjectile();
}

// Função de desenhar o jogo
function draw() {
    if (gameOver) return;

    // Limpa o canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenhar fundo
    drawBackground();

    // Desenha os projéteis
    // for (let projectile of projectiles) {
    //     ctx.drawImage(projectileImage, projectile.x, projectile.y, projectile.width, projectile.height); // Desenha a imagem do projétil
    // }
    for (let projectile of projectiles) {
        ctx.globalAlpha = projectile.opacity; // Define a opacidade do projétil
        ctx.drawImage(projectileImage, projectile.x, projectile.y, projectile.width, projectile.height); // Desenha o projétil
        ctx.globalAlpha = 1; // Restaura a opacidade global para o padrão (totalmente opaco)
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

// Função para criar novos projéteis com direção ao foguete
function spawnProjectile() {
    const side = Math.floor(Math.random() * 3);
    let projectile = {
        x: 0,
        y: 0,
        width: 30,
        height: 30,
        speedX: 0,
        speedY: 0,
        opacity: 1,
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

    // Calcula a direção para o foguete
    const angle = Math.atan2(foguete.y - projectile.y, foguete.x - projectile.x);
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
    if (!gameOver) {
        update();
        draw();
    }
    requestAnimationFrame(gameLoop);
}

// Inicia o jogo


setInterval(spawnProjectile, 2000); // Cria novos projéteis a cada segundo
setInterval(spawnCoin, 800); // Cria novas moedas a cada 3 segundos

console.log("Nome do jogador:", nome);
console.log("Pontuação:", score);
console.log("Placar atual:", JSON.parse(localStorage.getItem('placar')));
console.log(`Tentativas restantes: ${chancesRestantes}, Game Over: ${gameOver}`);


// Chama a função para iniciar o jogo
solicitarNome(); // Solicita o nome do jogador
exibirPlacar(); // Exibe placar no início
gameLoop(); 
