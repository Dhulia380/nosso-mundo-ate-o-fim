// main.js - protótipo RPG do amor (Phaser 3)
const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  width: 960,
  height: 640,
  backgroundColor: '#6fb3ff',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: {
    preload,
    create,
    update
  }
};

const game = new Phaser.Game(config);

let player;
let cursors;
let hotspots = [];
let speed = 160;
let uiOverlay, uiContent, uiClose;

function preload() {
  // placeholders: você pode substituir por imagens em /assets
  // ex: this.load.image('tiles', 'assets/tiles.png');
  this.load.image('bg', 'https://i.imgur.com/8Km9tLL.png'); // sky placeholder
  // small icons for hotspots (placeholder circles)
  this.load.image('home', 'https://i.imgur.com/H6Q8Yy6.png');
  this.load.image('card', 'https://i.imgur.com/3ZQNe0x.png');
  this.load.image('beach', 'https://i.imgur.com/4AiXzf8.png');
  this.load.image('bridge', 'https://i.imgur.com/2yAf6Ne.png');
  this.load.image('mirante', 'https://i.imgur.com/7yUvePI.png');

  // simple player (small square)
  this.load.image('player', 'https://i.imgur.com/TkU2f7M.png');
}

function create() {
  const scene = this;

  // background simple
  this.add.rectangle(480, 320, 960, 640, 0x88c0ff);

  // map ground rectangles (city look)
  for (let i = 0; i < 8; i++) {
    this.add.rectangle(120 + i * 120, 520, 100, 200, 0x7fb3e6).setAlpha(0.25);
  }

  // hotspots config: x,y,key,title,contentType
  const mapHotspots = [
    { x: 170, y: 380, key: 'home', id: 'casa', title: 'Casa do Casal', type: 'home' },
    { x: 420, y: 220, key: 'card', id: 'cartas', title: 'Sala das Cartas', type: 'cards' },
    { x: 750, y: 180, key: 'beach', id: 'praia', title: 'Praia dos Sonhos', type: 'beach' },
    { x: 680, y: 430, key: 'bridge', id: 'ponte', title: 'Ponte da Separação', type: 'bridge' },
    { x: 260, y: 120, key: 'mirante', id: 'mirante', title: 'Mirante dos Planos', type: 'mirante' }
  ];

  // create hotspot images & interactive zones
  mapHotspots.forEach(h => {
    const img = this.add.image(h.x, h.y, h.key).setInteractive({ cursor: 'pointer' }).setScale(0.9);
    img.on('pointerdown', () => {
      openLocationUI(h);
    });
    hotspots.push({ ...h, img });
    // subtle label
    this.add.text(h.x - 50, h.y + 40, h.title, { font: '14px Arial', fill: '#fff', stroke:'#000', strokeThickness:2 });
  });

  // player
  player = this.physics.add.image(170, 430, 'player').setScale(0.65);
  player.setCollideWorldBounds(true);
  player.body.setSize(28,28);

  // pointer movement
  this.input.on('pointerdown', function (pointer) {
    // move player to pointer smoothly
    scene.physics.moveTo(player, pointer.x, pointer.y, speed);
  });

  // stop when close to pointer
  player.reached = false;

  // keyboard cursors (optional)
  cursors = this.input.keyboard.createCursorKeys();

  // UI overlay elements
  uiOverlay = document.getElementById('ui-overlay');
  uiContent = document.getElementById('ui-content');
  uiClose = document.getElementById('ui-close');
  uiClose.addEventListener('click', () => { uiOverlay.classList.add('hidden'); });
}

// update loop
function update(time, delta) {
  // stop player when velocity small (reached destination)
  if (player.body.speed > 10) {
    // check if player is near any hotspot (radius 40)
    hotspots.forEach(h => {
      const dist = Phaser.Math.Distance.Between(player.x, player.y, h.x, h.y);
      if (dist < 48) {
        player.body.setVelocity(0,0);
        showNearbyHint(h);
      }
    });
  } else {
    player.body.setVelocity(0,0);
  }

  // allow arrow keys movement
  let vx = 0, vy = 0;
  if (cursors.left.isDown) vx = -speed;
  if (cursors.right.isDown) vx = speed;
  if (cursors.up.isDown) vy = -speed;
  if (cursors.down.isDown) vy = speed;
  if (vx || vy) player.setVelocity(vx, vy);
}

function showNearbyHint(hotspot) {
  // small tooltip or automatically open UI
  // (we leave tooltip optional; clicking is primary)
}

// Content for locations (replace texts and images as you like)
const locationContents = {
  casa: {
    title: "Casa do Casal",
    html: `
      <div class="location-card">
        <h2>Casa do Casal</h2>
        <p>Bem-vindo ao lugar onde toda a história começa. Aqui ficam as portas para as cartas, memórias e o cofre do futuro.</p>
        <p><strong>Destaques:</strong></p>
        <ul>
          <li>Sala das Cartas</li>
          <li>Sala das Memórias</li>
          <li>Cofre do Futuro (desbloqueia em 6 meses)</li>
        </ul>
        <a class="button" onclick="openLocationUI({id:'cartas'})">Ir para Sala das Cartas</a>
        <a class="button" style="background:#a7ffeb" onclick="openLocationUI({id:'memorias'})">Ir para Sala das Memórias</a>
      </div>`
  },
  cartas: {
    title: "Sala das Cartas",
    html: `<div class="location-card"><h2>Sala das Cartas</h2>
      <p>Aqui estão as cartas secretas que você escreveu para ele. Toque para abrir cada envelope.</p>
      <div>
        <button class="button" onclick="openCard(1)">Carta do 1º mês</button>
        <button class="button" onclick="openCard(2)">Carta da Reconciliação</button>
        <button class="button" onclick="openCard(3)">Carta do 2 meses</button>
      </div>
    </div>`
  },
  memorias: {
    title: "Sala das Memórias",
    html: `<div class="location-card"><h2>Sala das Memórias</h2>
      <p>Galeria com fotos, prints e frases marcantes.</p>
      <p>(Você pode substituir por imagens reais nas pastas /assets e inserir aqui)</p>
    </div>`
  },
  cofrefuturo: {
    title: "Cofre do Futuro",
    html: `<div class="location-card"><h2>Cofre do Futuro</h2>
      <p>Mensagens que abrem com o tempo: 6 meses, 1 ano. Atualmente: <strong id="cofre-status"></strong></p>
      <button class="button" onclick="tryOpenCofre()">Tentar abrir</button>
    </div>`
  },
  ponte: {
    title: "Ponte da Separação",
    html: `<div class="location-card"><h2>Ponte da Separação</h2>
      <p>Os dois dias mais difíceis. Aqui contamos a história com carinho — fala sobre como o restart fortaleceu vocês.</p>
      <p><em>“Foram os piores dois dias, mas o recomeço trouxe coragem e mais amor.”</em></p>
    </div>`
  },
  praia: {
    title: "Praia dos Sonhos",
    html: `<div class="location-card"><h2>Praia dos Sonhos</h2>
      <p>Um quadro para sonhos e planos. Escreva algo que deseja realizar junto com ele — isso fica salvo.</p>
      <textarea id="praia-input" style="width:100%;height:80px;border-radius:8px;padding:8px;"></textarea>
      <br><button class="button" onclick="savePraia()">Salvar sonho</button>
    </div>`
  },
  mirante: {
    title: "Mirante dos Planos",
    html: `<div class="location-card"><h2>Mirante dos Planos</h2>
      <p>Lista de metas do casal. Você pode adicionar metas e marcar como concluídas.</p>
      <input id="meta-text" placeholder="Nova meta..." style="width:70%;padding:8px;border-radius:6px;margin-right:8px;" />
      <button class="button" onclick="addMeta()">Adicionar</button>
      <div id="metas-list" style="margin-top:10px"></div>
    </div>`
  }
};

// ---------- UI / Interaction helpers ----------
function openLocationUI(h) {
  // h may be hotspot object or an id
  let id = h.id || h;
  let contentObj = null;
  if (id === 'cartas') contentObj = locationContents.cartas;
  else if (id === 'memorias' || id === 'memorias') contentObj = locationContents.memorias;
  else if (id === 'cofre' || id === 'cofrefuturo') contentObj = locationContents.cofrefuturo;
  else if (id === 'ponte') contentObj = locationContents.ponte;
  else if (id === 'praia') contentObj = locationContents.praia;
  else if (id === 'mirante') contentObj = locationContents.mirante;
  else if (id === 'casa') contentObj = locationContents.casa;
  else contentObj = { title: 'Lugar', html: '<div class="location-card"><p>Conteúdo em construção.</p></div>' };

  uiContent.innerHTML = `<h2>${contentObj.title}</h2>${contentObj.html}`;
  uiOverlay.classList.remove('hidden');

  // update cofre status
  const cofreStatus = document.getElementById('cofre-status');
  if (cofreStatus) {
    const unlocked6 = localStorage.getItem('unlocked_6m') === '1';
    const unlocked1y = localStorage.getItem('unlocked_1y') === '1';
    cofreStatus.innerText = unlocked6 ? 'Desbloqueado 6 meses' : 'Bloqueado (6 meses)';
    if (unlocked1y) cofreStatus.innerText = 'Desbloqueado 1 ano';
  }

  // populate metas
  const metasList = document.getElementById('metas-list');
  if (metasList) {
    const metas = JSON.parse(localStorage.getItem('nossomundo_metas')||'[]');
    metasList.innerHTML = metas.map((m,i)=>`<div style="margin-bottom:6px"><input type="checkbox" onchange="toggleMeta(${i})" ${m.done? 'checked':''}/> ${m.text}</div>`).join('');
  }
}

function openCard(n) {
  uiContent.innerHTML = `<h2>Carta ${n}</h2>
    <div class="location-card"><p><em>Querido amor,</em></p><p>Essa é a carta número ${n} — coloque aqui a sua mensagem real para ele. (Edite o HTML em main.js)</p></div>`;
}

function tryOpenCofre() {
  const unlocked6 = localStorage.getItem('unlocked_6m') === '1';
  const unlocked1y = localStorage.getItem('unlocked_1y') === '1';
  if (unlocked1y) {
    uiContent.innerHTML += `<div class="location-card"><h3>Surpresa do 1 ano</h3><p>Parabéns! Você encontrou uma mensagem do futuro: ...</p></div>`;
  } else if (unlocked6) {
    uiContent.innerHTML += `<div class="location-card"><h3>Surpresa dos 6 meses</h3><p>Você desbloqueou a mensagem de 6 meses: ...</p></div>`;
  } else {
    uiContent.innerHTML += `<div class="location-card"><p>O cofre ainda está trancado. Volte quando completar a data.</p></div>`;
  }
}

function savePraia() {
  const val = document.getElementById('praia-input').value;
  if (!val) return alert('Escreva um sonho antes de salvar.');
  const list = JSON.parse(localStorage.getItem('nossomundo_sonhos') || '[]');
  list.push({ text: val, date: Date.now() });
  localStorage.setItem('nossomundo_sonhos', JSON.stringify(list));
  alert('Sonho salvo no mural da Praia dos Sonhos 💖');
}

function addMeta() {
  const txt = document.getElementById('meta-text').value.trim();
  if (!txt) return;
  const metas = JSON.parse(localStorage.getItem('nossomundo_metas') || '[]');
  metas.push({ text: txt, done: false });
  localStorage.setItem('nossomundo_metas', JSON.stringify(metas));
  openLocationUI({id:'mirante'});
}

function toggleMeta(i) {
  const metas = JSON.parse(localStorage.getItem('nossomundo_metas') || '[]');
  metas[i].done = !metas[i].done;
  localStorage.setItem('nossomundo_metas', JSON.stringify(metas));
  openLocationUI({id:'mirante'});
}

// Helper to unlock cofre (simulate reaching 6 months)
function simulateUnlock6Months() {
  localStorage.setItem('unlocked_6m', '1');
  alert('Simulado: cofre 6 meses desbloqueado (use com cuidado).');
}
// Expose simulate function in console if you want
window.simulateUnlock6Months = simulateUnlock6Months;
