# SINGULAR — campanha v13

| Setor | Introdução | Acesso |
| --- | --- | --- |
| 1. Doca de manutenção | Sucata e Vigia | Banco de dados |
| 2. Pontes da fundição | Gume e torretas | Criptografia elevada |
| 3. Arquivo em camadas | Forja | Dois bancos de dados |
| 4. Drenagem contaminada | Prisma e Gume corrompido | Chave do corrompido |
| 5. Antecâmara de ECO | Âncora e Vigia corrompido | Banco + chave |
| 6. O corpo que falta | ECO | Perseguição, três condutores, duelo e cápsula |

Há elevadores verticais nas seis salas; nos cinco primeiros setores, vapor intermitente sinaliza sua área antes de causar dano. Os espinhos foram posicionados sobre piso exposto e validados contra o volume das paredes. Os espaços entre plataformas permitem rotas superiores e inferiores.

## IA e custo

Um grafo pequeno é construído uma vez por sala. A busca em largura escolhe o próximo trecho de plataforma; as decisões ocorrem a cada 0,20–0,27 s por autômato ativo. Unidades distantes ficam sem processamento de perseguição. Gume avança até o alcance da lâmina, sobe obstáculos, salta e desce passarelas; tiros verificam a linha de visão. Isso não equivale a navegação perfeita em qualquer mapa: os limites de salto são ajustados aos mapas desta campanha.

Na arena, há no máximo três reforços hostis ativos. Corpos descartados são removidos após suas animações, evitando acúmulo durante uma luta longa. Não foi medido desempenho em dispositivos móveis de baixo custo.

Referências técnicas: [Red Blob Games — otimização de grafos](https://www.redblobgames.com/pathfinding/grids/algorithms.html), [Game Programming Patterns — State](https://gameprogrammingpatterns.com/state.html). Aplicação: estados simples de alerta/perseguição e grafo de plataformas em lugar de uma grade por pixel.

## Menu e arte

Menu central, ECO ao fundo em uma sala escura, cabos e iluminação discreta; ambiência sintetizada localmente com WebAudio. Referências de composição: [Holmik — tela de título de Blasphemous](https://pixeljoint.com/pixelart/130413.htm) e [Andrey Gogiya — animações de menu](https://andrey_gogiya.artstation.com/projects/6LRbGV). A arte original e os prompts estão em ARTE.md.

## Verificação

Simulações verificam acesso aos cinco setores, transição para o sexto, escudo, condutores, dano e morte de ECO, final, checkpoint, posse e limpeza dos enxertos, armas, colisões, dash, configurações, pausa, elevadores e perseguição de Gume sobre um obstáculo sólido. Os seis conjuntos de espinhos têm suporte e não intersectam maquinaria sólida. Inspeção visual no navegador cobre menu, sprites e arena. Não foi realizada uma partida humana completa das seis fases: duração e dificuldade ainda podem precisar de ajuste.

## Validação v12

Testes cobrem os oito caminhos em cinco níveis, impedimento de troca de caminho e resgate duplicado, todos os efeitos numéricos, pausa/reinício do EMP, posse após expiração, golpe EMP fatal, invulnerabilidade, alcance do pulso, aviso de Prisma e os cinco ataques de ECO. O painel de melhorias e o novo sprite de ECO foram conferidos no navegador. Dificuldade e duração da campanha ainda precisam de avaliação em uma partida humana completa.

## Verificação v13

Regressão de combate, progressão, melhorias, EMP, checkpoint, colisões e controles. Testes de 30 buffers sonoros verificam amostras finitas, amplitude, término suave, cache, volume zero, pausa, distância, limite de vozes e liberação. Limpeza dos 32 quadros detalhados do prólogo validada com pixels reais; inspeção visual da cena de recaptura sem rebarbas. A avaliação automatizada de áudio não substitui uma avaliação auditiva em diferentes caixas e fones.
