# TP2 - Road Escape (Phaser 3)

## Elementos do Grupo
- Francisco (...) - N. (...) 
- Afonso (...) - N. (...)

## Phaser
- Versao: 3.90.0
- Inclusao: CDN em `index.html`

## Descricao do Jogo
`Road Escape` e um jogo 2D de desvio e sobrevivencia em 3 pistas. O jogador controla um carro, evita taxis, recolhe combustivel e tenta completar 3 niveis com dificuldade progressiva.

## Regras e Progressao
- Existem 3 niveis, cada um com uma meta de score.
- Em cada nivel, a velocidade e o spawn de obstaculos aumentam nas fases internas 1, 2 e 3.
- O jogador perde uma vida ao colidir com obstaculos.
- O combustivel desce continuamente e aumenta ao apanhar pickups.
- Pickups de vida extra aparecem apenas quando o jogador esta com 1 vida.
- Pickups de escudo aparecem em situacoes de maior risco e bloqueiam uma colisao.
- Passagens arriscadas junto a taxis em pistas adjacentes dao bonus de "quase" e aumentam o combo.
- O HUD mostra vidas, escudo, score, fase, nivel, combustivel e progresso do objetivo.
- O ecran final atribui medalha, mostra estatisticas da corrida e guarda o melhor score local.
- Vitoria: completar o ultimo nivel.
- Derrota: ficar sem vidas ou sem combustivel.

## Controles
- `A / LEFT`: mudar para a pista da esquerda
- `D / RIGHT`: mudar para a pista da direita
- Botoes `<` e `>` no ecran: controlo por toque/click
- `P`: pausa, com opcoes Continuar / Reiniciar / Menu
- `L`: alternar idioma PT/EN durante o jogo
- `E`: alternar idioma no menu
- `ENTER` ou clique no botao inicial: iniciar jogo
- `R`: reiniciar no ecran de fim

## Como Executar
1. Na raiz do projeto:
```bash
npm install
npm start
```
2. Abrir no browser:
- `http://localhost:5173`

## Aspetos Multimedia
- Imagens: SVG para carro, taxi, combustivel e meta em `assets/images/`.
- Audio: som em `assets/audio/start.mp3`, usado no menu e como loop de fundo durante a corrida.
- UI/HUD e cenario: elementos gerados no Phaser, incluindo barras, paineis, pickups e efeitos visuais.

## i18n
- Suporte multilingue implementado em:
  - `src/data/pt.json`
  - `src/data/en.json`
- Selecao rapida de idioma por tecla `L` durante o jogo e `E` no menu.

## Estrutura Principal
- `src/scenes/BootScene.js` - preload e setup global
- `src/scenes/MenuScene.js` - menu inicial
- `src/scenes/BaseRoomScene.js` - logica base de corrida
- `src/scenes/Room1Scene.js` - nivel 1
- `src/scenes/Room2Scene.js` - nivel 2
- `src/scenes/Room3Scene.js` - nivel 3
- `src/scenes/EndScene.js` - ecran de fim

## Estado para Entrega
- Projeto executa localmente por HTTP.
- Branch `main` sincronizada com `origin/main` antes desta ronda de melhorias.
- Melhorias recentes: escudo, barra de progresso, recorde local, menu clicavel, escala responsiva, bonus de near miss/combo, estatisticas finais e documentacao corrigida.
