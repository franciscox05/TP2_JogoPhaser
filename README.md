# Road Escape - Phaser 3

## Autores

- **Afonso Barbosa** - Nº 33157
- **Francisco Gomes** - Nº 33400

## Versao e Tecnologias

- **Motor:** Phaser 3.90.0
- **Inclusao do Phaser:** CDN em `index.html`
- **Fisica:** Arcade Physics
- **Linguagem:** JavaScript ES6+ com modulos
- **Execucao local:** servidor HTTP estatico via `npm start` ou Live Server

## Descricao do Jogo

**Road Escape** e um jogo 2D de avoidance/corrida em tres pistas. O jogador controla um carro e tem de sobreviver ao transito, recolher combustivel, evitar colisoes e atingir a meta de pontuacao de cada nivel.

O jogo tem tres niveis com dificuldade progressiva. Cada nivel aumenta a velocidade, a frequencia de obstaculos, a probabilidade de ondas com duas pistas bloqueadas e o consumo de combustivel. A partida termina em vitoria quando o jogador completa o terceiro nivel, ou em derrota se ficar sem vidas ou sem combustivel.

## Funcionalidades Implementadas

- Menu principal com seletor de idioma.
- Tres niveis jogaveis com progressao por pontuacao.
- Sistema de score, vidas, combustivel, escudo, combos e quase-colisoes.
- Obstaculos dinamicos com taxis e camioes raros.
- Ondas de obstaculos justas: podem bloquear uma ou duas pistas, mas deixam sempre uma rota possivel.
- Pickups de combustivel, vida extra e escudo.
- Dificuldade progressiva por nivel e fase.
- HUD com informacao de vidas, escudo, combo, score, nivel, objetivo e combustivel.
- Menu de pausa com continuar, reiniciar, voltar ao menu, volume e mute.
- Ecra final de vitoria/derrota com estatisticas, medalha e recorde local.
- Suporte multilingue PT/EN/ES com ficheiros JSON.
- Musica de fundo e efeitos sonoros por evento.
- Controlo por teclado e botoes tacteis no ecra.

## Controlos

| Acao | Teclas / Input |
| --- | --- |
| Iniciar jogo | `ENTER` ou botao do menu |
| Mudar de pista | `A` / `LEFT` e `D` / `RIGHT` |
| Controlos tacteis | Botoes `<` e `>` no ecra |
| Pausa | `P` |
| Mudar idioma no menu | `E` |
| Mudar idioma durante o jogo | `L` |
| Reiniciar/voltar no fim | `R` ou botoes do ecra final |

## Como Executar

### Opcao recomendada com Node.js

1. Instalar dependencias:

   ```bash
   npm install
   ```

2. Iniciar o servidor local:

   ```bash
   npm start
   ```

3. Abrir o endereco indicado no terminal, normalmente:

   ```text
   http://localhost:5173
   ```

### Opcao com VS Code Live Server

1. Abrir a pasta raiz do projeto no VS Code.
2. Clicar com o botao direito em `index.html`.
3. Escolher **Open with Live Server**.

> O jogo deve ser servido por HTTP local para evitar bloqueios de CORS no carregamento de modulos, JSON, imagens e audio.

## Estrutura do Projeto

```text
.
|-- index.html
|-- package.json
|-- src/
|   |-- main.js
|   |-- data/
|   |   |-- pt.json
|   |   |-- en.json
|   |   `-- es.json
|   `-- scenes/
|       |-- BootScene.js
|       |-- MenuScene.js
|       |-- BaseRoomScene.js
|       |-- Room1Scene.js
|       |-- Room2Scene.js
|       |-- Room3Scene.js
|       `-- EndScene.js
|-- assets/
|   |-- images/
|   `-- audio/
`-- docs/
    |-- screenshots/
    `-- TP2_Phaser_2025.pdf
```

## Aspetos Multimedia

### Elementos Graficos

| Asset | Formato | Dimensoes / Tipo | Origem / Criacao | Justificacao |
| --- | --- | --- | --- | --- |
| `carro_anim.png` | PNG spritesheet | 2790 x 1556 px, frames 465 x 518 px | Edicao / criacao propria | Spritesheet do carro do jogador com animacao de luzes. E redimensionado no jogo com `setScale(0.15)` para manter boa nitidez. |
| `taxi_anim.png` | PNG | 400 x 400 px | OpenGameArt / editado | Obstaculo principal. Foi editado para transparência e usado em escala reduzida (`setScale(0.22)`). |
| `gazolina.svg` | SVG | Vetorial | Criacao propria | Pickup de combustivel leve e escalavel. |
| `meta.svg` | SVG | Vetorial | Criacao propria | Usado como textura auxiliar para limites/objetivo, mantendo baixo peso. |
| Texturas geradas em runtime | Phaser Graphics | Vetorial/runtime | Criacao propria | Particulas, vida extra e escudo sao gerados por codigo para evitar assets desnecessarios. |

### Elementos Sonoros

Todos os sons estao em **MP3**, um formato comprimido e compativel com browsers modernos.

| Asset | Uso | Origem |
| --- | --- | --- |
| `start.mp3` | Inicio do jogo | Freesound.org |
| `engine_loop.mp3` | Motor em loop | Freesound.org |
| `bgmusic.mp3` | Musica de fundo | OpenGameArt.org |
| `collision.mp3` | Colisao | Freesound.org |
| `coin.mp3` | Recolha de pickup | Freesound.org |
| `phase_up.mp3` | Subida de fase | Freesound.org |
| `level_clear.mp3` | Nivel concluido | Freesound.org |
| `win.mp3` | Vitoria | Freesound.org |
| `lose.mp3` | Derrota | Freesound.org |

## Capturas e Demonstracao

### Menu Principal

![Menu Principal](docs/screenshots/menu.png)

### Gameplay

![Gameplay](docs/screenshots/corrida.png)

### Menu de Pausa

![Menu de Pausa](docs/screenshots/pausa.png)

### Ecras Finais

![Ecra Final](docs/screenshots/ecra_final.png)

![Ecra de Derrota](docs/screenshots/derrota.png)

### GIF de Gameplay

![Animacao do Gameplay](docs/screenshots/gameplay.gif)

## Demonstracao Online Opcional

GitHub Pages:

https://franciscox05.github.io/TP2_JogoPhaser/

## Entrega

- Data de entrega: 19 de junho de 2026
- Tag final esperada: `1.0`
- Repositorio: https://github.com/franciscox05/TP2_JogoPhaser
