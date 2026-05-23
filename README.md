# TP2 - Road Escape (Phaser 3)

## Elementos do Grupo
- Francisco (...) - N.? (...)
- Afonso (...) - N.? (...)

## Phaser
- Vers?o: 3.90.0
- Inclus?o: CDN em `index.html`

## Descri??o do Jogo
`Road Escape` ? um jogo 2D de desvio e sobreviv?ncia em 3 pistas.
O jogador controla um carro, desvia-se de t?xis, apanha combust?vel/moedas e tenta completar 3 n?veis com dificuldade progressiva.

## Regras e Progress?o
- Existem 3 n?veis (fases maiores), cada um com meta de score.
- Em cada n?vel, a velocidade e o spawn de obst?culos aumentam por fases internas (Fase 1, 2 e 3).
- O jogador perde vida ao colidir com obst?culos.
- O combust?vel desce continuamente e aumenta ao apanhar pickups.
- H? vida extra condicional: s? pode aparecer quando o jogador est? com 1 vida, apenas 1 de cada vez e com cooldown.
- Vit?ria: completar o ?ltimo n?vel.
- Derrota: ficar sem vidas ou sem combust?vel.

## Controles
- `A / LEFT`: mudar para a pista da esquerda
- `D / RIGHT`: mudar para a pista da direita
- `P`: pausa (Continuar / Reiniciar / Menu)
- `L`: alternar idioma PT/EN
- `R`: reiniciar no ecr? de fim

## Como Executar
1. Na raiz do projeto:
```bash
npm install
npm start
```
2. Abrir no browser:
- `http://localhost:5173`

## Aspetos Multim?dia
- Imagens: SVG para carro, t?xi, combust?vel e meta em `assets/images/`.
- ?udio: som integrado em `assets/audio/start.mp3` (usado no menu e como loop de fundo durante corrida).
- UI/HUD e cen?rio: elementos gerados no Phaser (barras, pain?is e efeitos visuais).

## i18n
- Suporte multil?ngue implementado em:
  - `src/data/pt.json`
  - `src/data/en.json`
- Sele??o r?pida de idioma por tecla `L` durante o jogo e `E` no menu.

## Estrutura Principal
- `src/scenes/BootScene.js` - preload e setup global
- `src/scenes/MenuScene.js` - menu inicial
- `src/scenes/BaseRoomScene.js` - l?gica base de corrida
- `src/scenes/Room1Scene.js` - n?vel 1
- `src/scenes/Room2Scene.js` - n?vel 2
- `src/scenes/Room3Scene.js` - n?vel 3
- `src/scenes/EndScene.js` - ecr? de fim

## Notas Finais para Entrega
- Projeto executa localmente por HTTP.
- Hist?rico Git e tags ser?o finalizados antes da entrega (`1.0`).
- Demonstra??o presencial obrigat?ria no dia da entrega.
