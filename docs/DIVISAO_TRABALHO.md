# Divisao de Trabalho - TP2 Phaser

## Branches
- `main`: branch estavel, so recebe merge de funcionalidades testadas.
- `feature-gameplay-core-francisco`: mecanicas principais e loop de jogo.
- `feature-ui-i18n-audio-afonso`: interface, internacionalizacao e multimédia.

## Pessoa A (Francisco) - Gameplay/Core
1. Refinar mapa/jogabilidade top-down da masmorra.
2. Implementar obstaculos/colisores e inimigos com padroes.
3. Sistema de objetivo (chaves, portas, vitoria/derrota).
4. Balanceamento de dificuldade e reinicio.

## Pessoa B (Afonso) - UI/i18n/Audio
1. Melhorar HUD e ecra de menu/game over/vitoria.
2. Completar i18n PT/EN (e opcional terceira lingua).
3. Integrar efeitos sonoros reais comprimidos (MP3/OGG).
4. Organizar assets e validar peso/tamanho.

## Regras de colaboracao
1. Cada pessoa faz commits na sua branch.
2. Pull request para `main` com descricao do que foi feito.
3. Revisao cruzada obrigatoria antes de merge.
4. Nao commitar `node_modules` nem assets nao usados.

## Checklist antes da entrega
1. Jogo corre localmente sem erros.
2. UI 100% traduzida nas 2 linguas.
3. Pelo menos 1 som funcional no jogo.
4. README final completo com nomes e numeros.
5. Criar tag `1.0` no commit final.
