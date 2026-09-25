# SINGULAR — prévia de game jam (v13)

Abra **JOGAR.html** no navegador para jogar sem instalar nada e sem servidor. O ZIP também inclui o projeto HTML/CSS/JavaScript, sprites e Phaser 4.2.1 com licença MIT.

## Conteúdo

- Seis fases: Doca de manutenção, Pontes da fundição, Arquivo em camadas, Drenagem contaminada, Antecâmara de ECO e O corpo que falta.
- Prólogo linear de 67 segundos, legendado, com pausa e opção de pular.
- Seis corpos possuíveis, apresentados gradualmente: Sucata, Vigia, Gume, Forja, Prisma e Âncora.
- Gume e Vigia corrompidos com folhas próprias de 16 quadros. A posse limpa os enxertos de ECO, conserva a proporção da vida e restaura armas normais.
- ECO com sprite original e confronto em três etapas: perseguição, três condutores e duelo. Checkpoint na entrada da arena; recuperação do corpo encerra a campanha.
- Oito caminhos de melhoria. A escolha após a primeira fase é definitiva na campanha; depois, somente o mesmo caminho evolui até o nível 5.
- Menu central com ECO ao fundo e ambiência procedural original. Clique em ATIVAR AMBIÊNCIA para iniciar o áudio; o volume geral também controla essa trilha.
- Elevadores, saídas de vapor com aviso, espinhos expostos e IA que busca rotas entre plataformas.

## Comandos

A/D movem; Espaço salta; S desce de passarelas; Shift dá dash, inclusive uma vez no ar; E interage. Mouse esquerdo ataca, cursor mira; ataques corpo a corpo seguem a direção predominante da mira (frente, cima ou baixo). J é alternativa ao mouse. Esc pausa; R reinicia. Volume, resolução e teclas podem ser alterados em Configurações.

Um golpe fatal de um autômato vivo transfere sua consciência para ele, com a vida que resta. A recarga do núcleo impede outra transferência imediata. Torretas, ECO e perigos ambientais não oferecem um corpo compatível. Preserve inimigos como oportunidades de troca.

As portas exigem a permissão indicada no HUD: bancos de dados, criptografia ou chave de um corrompido. Arquivos âmbar são opcionais. Na sexta fase, fuja para a direita; na arena, rompa os três condutores elevados, enfrente ECO e interaja com a cápsula à direita. Os ataques têm aviso: saia da linha de mira e salte a varredura baixa.

O checkpoint da arena restaura a vida do corpo de entrada, ECO e os três condutores. Reiniciar mantém melhorias da campanha. Voltar ao menu ou recarregar a página reinicia o progresso; preferências ficam salvas quando o navegador permite armazenamento local.

## Desenvolvimento e verificação

`resonance.js`: ataques de ECO, EMP e integração da evolução única. `singular.js`: sexta fase, checkpoint, elevadores, vapor e integração. `navigation.js`: grafo de plataformas e busca de rota. `menu.js`: cenário do menu e áudio. `expedition.js`: cinco mapas anteriores, objetivos, armas e corrupção. `atlas.js`: isolamento e escala dos sprites. `cinematic.js`: prólogo. `game.js`: física e combate.

Testes automatizados cobrem progressão, posse, armas, dash aéreo, configurações, morte, objetivos, obstáculos, armadilhas e etapas do boss. Menu, arena e forma corrompida foram inspecionados no navegador. O balanceamento ainda merece uma partida humana completa antes da apresentação definitiva.

## Apenas um — evolução v12

| Caminho | Por nível | No nível 5 |
| --- | --- | --- |
| Potência | +5% de dano | +25% |
| Blindagem | −4% de dano recebido | −20% |
| Cadência | −4% no intervalo de ataques | −20% |
| Impulso | −8% na recarga do dash | −40% |
| Reparo | +5 HP após posse | +25 HP, limitado à vida máxima |
| Reator | −0,35 s na recarga do núcleo | 2,25 s de recarga |
| Proteção | +0,2 s de invulnerabilidade após posse | 2,1 s |
| Isolamento | −15% na duração do EMP | 1 s de bloqueio |

Você recebe cinco recompensas, ao terminar as fases 1 a 5. A primeira define o caminho; as seguintes reforçam a mesma escolha. O bônus acompanha todos os corpos. Reiniciar o setor mantém a evolução; voltar ao menu a apaga.

ECO possui cinco ataques: rajada direcionada, pancada no chão com duas ondas de choque, pulso radial de energia, varredura baixa e pulso EMP. Prisma também pode carregar um EMP especial. O círculo violeta anuncia o alcance; o pulso precisa atingir o jogador para bloquear a posse por quatro segundos. O contador aparece no HUD. O golpe fatal durante o bloqueio encerra a tentativa, inclusive se for o próprio EMP. Invulnerabilidade e o dash fantasma de Gume evitam o impacto. Isolamento reduz a duração, mas não torna imune ao golpe fatal imediato.

O novo ECO usa formas simples e contornos grossos compatíveis com os demais sprites. A pancada, a carga de energia e o canhão usam poses próprias. O projeto continua em Phaser 4.2.1, com cena, ciclo de atualização, entrada, câmera, sprites e efeitos renderizados pelo Phaser.

## Áudio e revisão v13

Efeitos originais sintetizados localmente: tiros de Vigia e torreta, laser de Prisma, lançamento e explosão de granadas, lâmina, soco, martelo, dano, colapso e explosão de corpos, salto, pouso, passos, dash, transferência, recarga pronta, criptografia, terminais, evolução, portas, vitória/derrota, EMP, pulsos, carga, impacto e vapor. A abertura possui efeitos sincronizados com seus eventos. O volume geral controla os efeitos; o botão de ambiência mantém o controle separado da música de menu.

Os buffers de som ficam em cache, com limite de 20 vozes, atenuação por distância, estéreo e compressor. O áudio é liberado pela primeira interação com o jogo. Pausar, sair da aba ou abrir configurações interrompe os efeitos em andamento. Os sons estão incluídos no código de `sound.js` e no arquivo único JOGAR.html; não precisam de downloads externos.

A cinemática agora isola e limpa cada quadro detalhado antes de desenhá-lo. As margens impedem vazamento de sprites vizinhos; largura e altura da folha são tratadas separadamente. Foram corrigidos também o bloqueio EMP durante o dash de refração e o dano residual de ondas de choque sem chão.
