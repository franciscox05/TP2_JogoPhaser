export class GameScene extends Phaser.Scene {
  constructor() { super("GameScene"); }

  create() {
    this.createTextures();
    this.drawBackground();

    this.physics.world.setBounds(20, 40, 920, 460);

    this.roomStates = [
      { solved: false, answer: "4791" },
      { solved: false, answer: "vida" },
      { solved: false, answer: "1234" }
    ];

    this.player = this.physics.add.sprite(90, 270, "playerTex").setDepth(8);
    this.player.setCollideWorldBounds(true);

    this.walls = this.physics.add.staticGroup();
    this.keys = this.physics.add.staticGroup();

    this.createDungeonLayout();
    this.createInteractables();
    this.createEnemies();

    this.physics.add.collider(this.player, this.walls);
    this.physics.add.collider(this.enemies, this.walls);
    this.physics.add.collider(this.enemies, this.enemies);
    this.physics.add.overlap(this.player, this.keys, this.onCollectKey, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.onEnemyHit, null, this);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys("W,A,S,D");
    this.interactKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.langKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.L);
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.backspaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.BACKSPACE);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.typeKeys = this.input.keyboard.addKeys("ZERO,ONE,TWO,THREE,FOUR,FIVE,SIX,SEVEN,EIGHT,NINE,V,I,D,A");

    this.lives = 3;
    this.timeLeft = 180;
    this.collectedKeys = 0;
    this.hitCooldown = false;

    this.activePuzzle = null;
    this.puzzleInput = "";

    this.createHud();
    this.createPuzzleOverlay();
    this.refreshHud();

    this.time.addEvent({ delay: 1000, loop: true, callback: () => {
      if (this.activePuzzle) return;
      this.timeLeft -= 1;
      this.refreshHud();
      if (this.timeLeft <= 0) this.endGame(false);
    }});
  }

  createTextures() {
    const g = this.add.graphics();
    g.fillStyle(0x5b402d, 1); g.fillRoundedRect(0, 0, 40, 40, 3); g.fillStyle(0x7a5638, 1); g.fillRect(0, 0, 40, 5); g.fillRect(0, 20, 40, 4); g.generateTexture("wallTex", 40, 40); g.clear();
    g.fillStyle(0xf2b46f, 1); g.fillCircle(14, 14, 14); g.fillStyle(0x6d3a1f, 1); g.fillCircle(14, 14, 5); g.generateTexture("playerTex", 28, 28); g.clear();
    g.fillStyle(0x5f1f1f, 1); g.fillRoundedRect(0, 0, 28, 28, 6); g.fillStyle(0xc05858, 1); g.fillRoundedRect(4, 4, 20, 20, 4); g.generateTexture("enemyTex", 28, 28); g.clear();
    g.fillStyle(0xd6ab3d, 1); g.fillCircle(11, 11, 11); g.fillStyle(0x6b4e1a, 1); g.fillRect(10, 4, 12, 4); g.generateTexture("keyTex", 24, 24); g.clear();
    g.fillStyle(0x5e3f2a, 1); g.fillRoundedRect(0, 0, 34, 88, 5); g.fillStyle(0x8b633d, 1); g.fillRect(15, 24, 4, 44); g.generateTexture("doorTex", 34, 88); g.clear();
    g.fillStyle(0x2f5d2f, 1); g.fillRoundedRect(0, 0, 40, 92, 6); g.fillStyle(0x9aca6d, 1); g.fillRect(18, 32, 4, 24); g.generateTexture("finalDoorTex", 40, 92); g.clear();
    g.fillStyle(0x7a4b25, 1); g.fillRoundedRect(0, 0, 48, 30, 4); g.fillStyle(0x3d2412, 1); g.fillRect(0, 22, 48, 8); g.generateTexture("chestTex", 48, 30); g.clear();
    g.fillStyle(0x8a8a8a, 1); g.fillRoundedRect(0, 0, 30, 30, 3); g.fillStyle(0x404040, 1); g.fillCircle(15, 15, 6); g.generateTexture("riddleTex", 30, 30); g.clear();
    g.fillStyle(0xff3ad8, 1); g.fillCircle(16, 16, 14); g.fillStyle(0x2d1a2c, 1); g.fillCircle(16, 16, 7); g.generateTexture("symbolTex", 32, 32); g.clear();
    g.fillStyle(0x734726, 1); g.fillRoundedRect(0, 0, 56, 26, 5); g.generateTexture("tableTex", 56, 26); g.clear();
    g.fillStyle(0x8f5f34, 1); g.fillCircle(14, 14, 14); g.fillStyle(0xc8a167, 1); g.fillRect(0, 2, 28, 4); g.fillRect(0, 22, 28, 4); g.generateTexture("barrelTex", 28, 28); g.destroy();
  }

  drawBackground() {
    const g = this.add.graphics();
    g.fillGradientStyle(0x2f1f16, 0x2f1f16, 0x4a3021, 0x4a3021, 1); g.fillRect(0, 0, 960, 540);
    g.fillStyle(0x6c4a31, 0.85);
    for (let y = 45; y < 500; y += 40) for (let x = 20; x < 940; x += 40) g.fillRect(x, y, 38, 38);
    g.fillStyle(0x090706, 0.22); g.fillRect(20, 40, 920, 460);
    g.fillStyle(0x0f0a08, 0.24); g.fillRect(320, 40, 8, 460); g.fillRect(620, 40, 8, 460);

    [90, 280, 390, 580, 690, 880].forEach((x) => {
      const glow = this.add.circle(x, 80, 60, 0xff8f2c, 0.2).setDepth(2);
      this.add.circle(x, 80, 9, 0xff4df0, 0.8).setDepth(3);
      this.tweens.add({ targets: glow, alpha: { from: 0.25, to: 0.11 }, duration: 400, yoyo: true, repeat: -1 });
    });
  }

  createDungeonLayout() {
    for (let x = 40; x <= 920; x += 40) { this.walls.create(x, 40, "wallTex"); this.walls.create(x, 500, "wallTex"); }
    for (let y = 80; y <= 460; y += 40) { this.walls.create(20, y, "wallTex"); this.walls.create(940, y, "wallTex"); }

    this.midDoor1 = this.physics.add.staticSprite(320, 270, "doorTex").setDepth(7);
    this.midDoor2 = this.physics.add.staticSprite(620, 270, "doorTex").setDepth(7);
    this.finalDoor = this.physics.add.staticSprite(900, 270, "finalDoorTex").setDepth(7);
    this.walls.add(this.midDoor1); this.walls.add(this.midDoor2);

    [[120,130],[240,430],[410,120],[535,430],[730,130],[855,430]].forEach(([x,y])=>this.add.image(x,y,"barrelTex").setDepth(4).setAlpha(0.95));
    [[160,90],[460,90],[760,90]].forEach(([x,y])=>this.add.image(x,y,"tableTex").setDepth(4));
  }

  createInteractables() {
    this.obj1 = this.physics.add.staticSprite(180, 270, "chestTex").setDepth(7);
    this.obj2 = this.physics.add.staticSprite(470, 270, "riddleTex").setDepth(7);
    this.obj3 = this.physics.add.staticSprite(770, 270, "symbolTex").setDepth(7);
    this.interactables = [this.obj1, this.obj2, this.obj3];

    this.marker = this.add.text(0, 0, "", { fontSize: "16px", color: "#ffe8be", backgroundColor: "#3f2a1a", padding: { left: 6, right: 6, top: 3, bottom: 3 } })
      .setOrigin(0.5).setDepth(40).setVisible(false);
  }

  createEnemies() {
    this.enemies = this.physics.add.group();
    const e1 = this.enemies.create(120, 180, "enemyTex");
    const e2 = this.enemies.create(450, 380, "enemyTex");
    const e3 = this.enemies.create(820, 170, "enemyTex");
    e1.setVelocityX(90).setBounce(1, 1).setCollideWorldBounds(true);
    e2.setVelocityY(100).setBounce(1, 1).setCollideWorldBounds(true);
    e3.setVelocityX(-120).setBounce(1, 1).setCollideWorldBounds(true);
  }

  createHud() {
    const panel = this.add.rectangle(260, 38, 500, 54, 0x100c09, 0.68).setDepth(30); panel.setStrokeStyle(1, 0xb67a32, 0.9);
    const rightPanel = this.add.rectangle(820, 70, 250, 120, 0x100c09, 0.7).setDepth(30); rightPanel.setStrokeStyle(1, 0xb67a32, 0.9);
    this.hudText = this.add.text(18, 20, "", { fontSize: "19px", color: "#f2e6d8" }).setDepth(31);
    this.infoText = this.add.text(18, 50, "", { fontSize: "15px", color: "#e0b884" }).setDepth(31);
    this.objectiveText = this.add.text(705, 28, "", { fontSize: "15px", color: "#f2e6d8", lineSpacing: 4 }).setDepth(31);
    this.hintText = this.add.text(480, 510, "", { fontSize: "18px", color: "#f6ddb4", backgroundColor: "#3f2a1a", padding: { left: 10, right: 10, top: 4, bottom: 4 } }).setOrigin(0.5).setDepth(31);
  }

  createPuzzleOverlay() {
    this.ovBg = this.add.rectangle(480, 270, 620, 330, 0x060504, 0.88).setDepth(50).setVisible(false); this.ovBg.setStrokeStyle(2, 0xc68542, 1);
    this.ovTitle = this.add.text(480, 170, "", { fontSize: "34px", color: "#f2d2a2", fontStyle: "bold" }).setOrigin(0.5).setDepth(51).setVisible(false);
    this.ovPrompt = this.add.text(480, 225, "", { fontSize: "22px", color: "#f2e6d8", align: "center", wordWrap: { width: 540 } }).setOrigin(0.5).setDepth(51).setVisible(false);
    this.ovInput = this.add.text(480, 285, "", { fontSize: "32px", color: "#ffd38a", backgroundColor: "#291c12", padding: { left: 12, right: 12, top: 8, bottom: 8 } }).setOrigin(0.5).setDepth(51).setVisible(false);
    this.ovFeedback = this.add.text(480, 335, "", { fontSize: "20px", color: "#b6f09b" }).setOrigin(0.5).setDepth(51).setVisible(false);
    this.ovClose = this.add.text(480, 385, "", { fontSize: "16px", color: "#d4c5aa" }).setOrigin(0.5).setDepth(51).setVisible(false);
  }

  t(k) { const l = this.registry.get("lang") || "pt"; return (this.registry.get("i18n")[l] || {})[k] ?? k; }
  room() { if (this.player.x < 320) return 1; if (this.player.x < 620) return 2; return 3; }

  refreshHud() {
    this.hudText.setText(`${this.t("hudLives")}: ${this.lives}   ${this.t("hudTime")}: ${this.timeLeft}   ${this.t("hudRoom")}: ${this.room()}   ${this.t("hudKeys")}: ${this.collectedKeys}/3`);
    this.infoText.setText("WASD/Setas mover | E interagir | L idioma");
    const c = (ok) => ok ? "[OK]" : "[  ]";
    this.objectiveText.setText(`Objetivos\n${c(this.roomStates[0].solved)} Sala 1\n${c(this.roomStates[1].solved)} Sala 2\n${c(this.roomStates[2].solved)} Sala 3\n${c(this.collectedKeys>=3)} Saida final`);
  }

  showHint(msg) { this.hintText.setText(msg); this.time.delayedCall(1500, ()=>{ if(!this.activePuzzle) this.hintText.setText(""); }); }

  openPuzzle(i) {
    if (this.roomStates[i].solved) return this.showHint(this.t("puzzleSuccess"));
    this.activePuzzle = i; this.puzzleInput = "";
    const titles = [this.t("puzzleCodeTitle"), this.t("puzzleWordTitle"), this.t("puzzleSymbolTitle")];
    const prompts = [this.t("puzzleCodePrompt"), this.t("puzzleWordPrompt"), this.t("puzzleSymbolPrompt")];
    this.ovTitle.setText(titles[i]); this.ovPrompt.setText(prompts[i]); this.ovInput.setText(`${this.t("puzzleInput")}: _`); this.ovFeedback.setText(""); this.ovClose.setText(this.t("closePuzzle"));
    [this.ovBg,this.ovTitle,this.ovPrompt,this.ovInput,this.ovFeedback,this.ovClose].forEach(el=>el.setVisible(true));
  }

  closePuzzle() { this.activePuzzle=null; [this.ovBg,this.ovTitle,this.ovPrompt,this.ovInput,this.ovFeedback,this.ovClose].forEach(el=>el.setVisible(false)); this.hintText.setText(""); }

  unlockDoor(i) {
    if (i===0 && this.midDoor1.active) { this.midDoor1.disableBody(true,true); this.showHint(this.t("doorOpen")); }
    if (i===1 && this.midDoor2.active) { this.midDoor2.disableBody(true,true); this.showHint(this.t("doorOpen")); }
    if (i===2) this.showHint(this.t("finalDoorOpen"));
  }

  spawnKey(i) {
    const pos=[[250,330],[540,330],[840,330]][i];
    this.keys.create(pos[0], pos[1], "keyTex").setDepth(8);
    this.cameras.main.shake(120,0.0025);
  }

  submitPuzzle() {
    const i=this.activePuzzle; if(i===null) return;
    if(this.puzzleInput.toLowerCase()===this.roomStates[i].answer){
      this.roomStates[i].solved=true; this.ovFeedback.setColor("#b6f09b"); this.ovFeedback.setText(this.t("puzzleSuccess"));
      this.spawnKey(i); this.unlockDoor(i); this.refreshHud(); this.time.delayedCall(650,()=>this.closePuzzle());
    } else { this.ovFeedback.setColor("#ff9d9d"); this.ovFeedback.setText(this.t("puzzleFail")); }
  }

  onCollectKey(_p,k){ k.disableBody(true,true); this.collectedKeys+=1; this.refreshHud(); }

  onEnemyHit(){
    if(this.hitCooldown||this.activePuzzle) return;
    this.hitCooldown=true; this.lives-=1; this.player.setPosition(90,270); this.player.setTint(0xff0000); this.cameras.main.shake(140,0.005); this.refreshHud();
    this.time.delayedCall(250,()=>{ this.player.clearTint(); this.hitCooldown=false; });
    if(this.lives<=0) this.endGame(false);
  }

  nearestInteractable() {
    const arr=[{i:0,o:this.obj1},{i:1,o:this.obj2},{i:2,o:this.obj3}];
    let best=null; let d=9999;
    arr.forEach((x)=>{ const dist=Phaser.Math.Distance.Between(this.player.x,this.player.y,x.o.x,x.o.y); if(dist<d){d=dist; best={...x,d};}});
    return best;
  }

  tryInteract(){
    const near=this.nearestInteractable();
    if(near && near.d<70) return this.openPuzzle(near.i);
    if(Phaser.Math.Distance.Between(this.player.x,this.player.y,900,270)<60){ if(this.collectedKeys>=3) return this.endGame(true); return this.showHint(this.t("finalDoorLocked")); }
    if(this.midDoor1.active && Phaser.Math.Distance.Between(this.player.x,this.player.y,320,270)<65) return this.showHint(this.t("doorLocked"));
    if(this.midDoor2.active && Phaser.Math.Distance.Between(this.player.x,this.player.y,620,270)<65) return this.showHint(this.t("doorLocked"));
  }

  typePuzzle(){
    const map={ZERO:"0",ONE:"1",TWO:"2",THREE:"3",FOUR:"4",FIVE:"5",SIX:"6",SEVEN:"7",EIGHT:"8",NINE:"9",V:"v",I:"i",D:"d",A:"a"};
    Object.entries(map).forEach(([k,v])=>{ if(Phaser.Input.Keyboard.JustDown(this.typeKeys[k]) && this.puzzleInput.length<8) this.puzzleInput+=v; });
  }

  endGame(v){ this.scene.start("EndScene", { victory:v }); }

  update(){
    if(Phaser.Input.Keyboard.JustDown(this.langKey)){ const c=this.registry.get("lang")||"pt"; this.registry.set("lang",c==="pt"?"en":"pt"); this.refreshHud(); }

    if(this.activePuzzle!==null){
      if(Phaser.Input.Keyboard.JustDown(this.escapeKey)) this.closePuzzle();
      if(Phaser.Input.Keyboard.JustDown(this.enterKey)) this.submitPuzzle();
      if(Phaser.Input.Keyboard.JustDown(this.backspaceKey)) this.puzzleInput=this.puzzleInput.slice(0,-1);
      this.typePuzzle();
      this.ovInput.setText(`${this.t("puzzleInput")}: ${this.puzzleInput || "_"}`);
      this.player.setVelocity(0,0);
      return;
    }

    if(Phaser.Input.Keyboard.JustDown(this.interactKey)) this.tryInteract();

    const near=this.nearestInteractable();
    if(near && near.d<70){ this.marker.setPosition(near.o.x, near.o.y-40).setText(this.t("interactHint")).setVisible(true); }
    else this.marker.setVisible(false);

    const speed=180; let vx=0, vy=0;
    if(this.cursors.left.isDown||this.wasd.A.isDown) vx=-speed; else if(this.cursors.right.isDown||this.wasd.D.isDown) vx=speed;
    if(this.cursors.up.isDown||this.wasd.W.isDown) vy=-speed; else if(this.cursors.down.isDown||this.wasd.S.isDown) vy=speed;
    this.player.setVelocity(vx,vy);
  }
}
