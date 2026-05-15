# TP2 - Masmorra Escape (Phaser 3)

## Elementos do Grupo
- Nome 1 - N.º 1
- Nome 2 - N.º 2

## Phaser
- Versão: 3.90.0
- Inclusão: CDN em `index.html`

## Descrição do Jogo
Jogo 2D top-down com tema de masmorra. O jogador deve recolher a chave e alcançar a saída antes do tempo acabar, evitando inimigos.

## Regras
- Recolher 1 chave para desbloquear a saída.
- Evitar inimigos patrulha.
- Vence ao entrar na saída com a chave.
- Perde ao ficar sem vidas ou sem tempo.

## Controles
- `WASD` ou `Setas`: mover
- `E`: alternar idioma (PT/EN)
- `R`: reiniciar após Game Over/Vitória

## Como Executar
1. Na raiz do projeto, correr:
```bash
npm install
npm start
```
2. Abrir: `http://localhost:5173`

## Aspetos Multimédia
- Imagens: primitivas gráficas geradas no Phaser (temporário) e futuros sprites em PNG otimizados.
- Som: integrado `assets/audio/pickup.mp3` (placeholder para substituir por asset final comprimido).
- Otimização: evitar assets sobredimensionados e remover assets não usados antes da entrega.

## Roadmap
- [ ] Mapa final da masmorra com tileset.
- [ ] Inimigos com padrões distintos.
- [ ] Mais puzzles/chaves.
- [ ] Polimento visual e áudio completo.
