# Arte dos novos corpos

As três folhas foram produzidas com a ferramenta integrada de geração de imagens, em PNG com transparência. Não foi usado o fluxo CLI/API. Os sprites originais foram preservados; `atlas.js` prepara os recortes no carregamento.

## forja

Arquivo: [forja-simple.png](assets/forja-simple.png)

Especificação do prompt (reconstituída a partir do registro da geração):

Transparent PNG sprite sheet, 4 by 4 equal cells, 16 right-facing poses: idle, walk, jump and attack rows. Simplified chunky pixel art, dark outlines, tiny cyan core. Squat orange furnace robot with a shoulder mortar. Keep the body within 55% of cell width and 65% of cell height, generous transparent gutters. No text, grid, shadows, detached effects or neighbouring sprite fragments.

## prisma

Arquivo: [prisma-simple.png](assets/prisma-simple.png)

Especificação do prompt (reconstituída a partir do registro da geração):

Transparent PNG sprite sheet, 4 by 4 equal cells, 16 right-facing poses: idle, walk, jump and attack rows. Simplified chunky pixel art, dark outlines, tiny cyan core. Slim ivory and purple robot with a triangular head and a long laser rifle. Keep the body within 55% of cell width and 65% of cell height, generous transparent gutters. No text, grid, shadows, detached effects or neighbouring sprite fragments.

## ancora

Arquivo: [ancora-simple.png](assets/ancora-simple.png)

Especificação do prompt (reconstituída a partir do registro da geração):

Transparent PNG sprite sheet, 4 by 4 equal cells, 16 right-facing poses: idle, walk, jump and attack rows. Simplified chunky pixel art, dark outlines, tiny cyan core. Heavy teal robot with broad armour, a yellow monocular visor, a giant hammer and a shield forearm. Keep the body within 55% of cell width and 65% of cell height, generous transparent gutters. No text, grid, shadows, detached effects or neighbouring sprite fragments.

## Torreta — versão 10

Ferramenta integrada de geração de imagens. Arquivo: [turret-simple.png](assets/turret-simple.png). Fundo transparente, 16 quadros. Prompt exato:

Create an original game-ready transparent PNG sprite sheet for a fixed industrial security turret in a dark sci-fi 2D pixel-art platformer. 4 columns by 4 rows, exactly 16 equally spaced poses, every pose centered in its own cell with very wide fully transparent gutters. Side view facing RIGHT. Compact squat dark slate steel base bolted to floor, ivory-grey angular armour, short amber warning stripe, a red monocular sensor, one short thick barrel projecting right. Simple chunky pixel art, crisp dark outlines, restrained 3 shade palette, low detail, readable at 44 pixels tall. No legs, no humanoid silhouette. Row1 idle slight sensor blink, row2 scanning subtle barrel movement, row3 charging red sensor brightness, row4 firing recoil only (no detached muzzle flashes). All poses same base position and scale, each drawing occupies at most 65 percent cell width and 55 percent cell height. All parts connected to main body. True transparent background. No text, labels, grid, scenery, floor, shadows, effects outside silhouette. No borrowed characters or franchise designs.


Escala: agora calculada uma vez por folha, preservando a variação real de cada pose. Alturas máximas em tela: Sucata/Forja 51 px; Vigia/Gume 54 px; Prisma 55,5 px; Âncora 57 px; torreta 40,5 px. Corpos largos podem ficar menores para respeitar a largura de 57 px (67,5 px para o martelo da Âncora).

## SINGULAR v11 — formas corrompidas e ECO

Três PNGs originais gerados pela ferramenta integrada, com transparência real e grade 4 × 4. Os arquivos completos foram preservados; `atlas.js` isola cada célula e normaliza a escala durante o carregamento. Gume/Vigia corrompidos usam a mesma altura máxima das formas normais; ECO usa escala de boss (até 152 px de altura).

- `assets/gume-corrupt-simple.png`: base Gume; máscara cerâmica incompleta, tendões sintéticos e núcleo vermelho.
- `assets/vigia-corrupt-simple.png`: base Vigia; preserva ombro amarelo e canhão, com os enxertos de ECO.
- `assets/eco-simple.png`: forma própria, metade de rosto humano cerâmico, costelas metálicas e membro industrial assimétrico. Referência de lore: tentativa fracassada de se tornar humana.

Prompts enviados (inglês):

Gume: Edit the supplied robot sprite sheet into an original ECO-corrupted form for the game Singular. Preserve the recognizable original robot chassis, weapon, silhouette, colors and simplified chunky pixel style. Add an incomplete ivory human-like ceramic half-mask over the visor, dusty rose synthetic tendon cables woven tightly over limbs and torso, and a small red pulsating chest core. No gore. Keep all features physically attached. Transparent PNG, exactly 4 by 4 equal cells, 16 poses arranged idle/walk/jump/attack rows facing RIGHT. Every entire pose fits within central 65% of cell width and 70% height; large transparent gutters, NO neighbouring fragments, no detached weapon effects, no text or background.

Vigia: Edit this Vigia robot sprite sheet into its ECO-corrupted form for Singular. Preserve yellow shoulder armour, grey chassis, cannon arm and original poses. Add an incomplete ivory human ceramic half-mask, muted rose synthetic tendons physically woven over limbs and chest, red chest core. Original robot must remain recognizable. Transparent background PNG with real alpha. Exactly 4 by 4 equal cells, 16 complete poses, rows idle/walk/jump/shoot facing right. Wide transparent gutters, each complete pose fits 65% width 70% height of cell. Crisp simple chunky pixel art, no background, text, grid, detached particles or muzzle flashes. All body parts connected. No gore.

ECO: Original final boss ECO for the game SINGULAR: a production AI that tried to become human, now a tragic incomplete machine-organism hybrid. Game-ready transparent pixel-art sprite sheet, exactly 4x4 equal cells and 16 poses. Full body in every cell, centered, facing slightly LEFT, 65% cell width 70% height maximum with wide transparent gutters. Tall ominous asymmetrical ivory ceramic human half-face, exposed dark metal opposite half, one tiny red eye, segmented rib-like steel torso with ruby core, dusty rose synthetic tendons tightly woven along thin arms, angular broad shoulders, long articulate claw hand and a thick industrial cannon forearm, mechanical digitigrade legs. No human nudity or gore. Consistent original design, dark charcoal, muted ivory and burgundy colors, coarse crisp pixel art with bold outline and restrained shading, readable at 130px tall. Row1 four idle breathing poses, row2 four forward stalking steps, row3 four charging core poses, row4 four hurt/collapse poses. All pieces connected, no floating particles. No scenery, shadows, typography, grid or copied franchise character. Preserve true transparent alpha.

## ECO v12 — simplificação visual

A folha anterior foi substituída a pedido do autor. O original detalhado está preservado em `work/eco-v11-original.png` no workspace, fora do pacote de jogo. A folha atual `assets/eco-simple.png` mantém máscara incompleta, núcleo vermelho e canhão, mas reduz o design a massas de cor e poucos tendões. A escala em jogo passou de 1,9 para 1,3. Menu e combate usam o mesmo design.

Prompt exato, com ECO v11 como referência de identidade e Vigia como referência de estilo:

Redesign image 1 ECO boss sprite sheet to EXACTLY match the chunky simple low-detail pixel art style of image 2 Vigia. Image1 is design identity only; image2 is strict style reference. ECO must no longer look realistic: compact toy-like blocky industrial robot, big head, thick short legs, giant block fist and block cannon, flat 2-tone color areas and thick near-black pixel outline. Keep ivory incomplete human half-mask, red eye and red core, charcoal armor, ONLY TWO broad burgundy synthetic tendon bands. NO ribs detailing, no fine cables, no texture, no realistic muscles, no gradients or anti-aliasing. Pixel shapes readable at 48 pixels tall. Original character. EXACTLY 4x4 sprite grid 16 poses, transparent true alpha PNG background, generous transparent gutters all poses completely inside their cell. Face LEFT. Row1 4 idle poses; row2 4 walking poses; row3 distinct attacks: raised fist, fist striking ground, core charging with arms open, cannon firing stance WITHOUT projectile; row4 4 collapse/death poses. Each frame central 65% cell width and 70% height. No text, no scenery, no particles, no detached effects. Match image2 extreme simplicity and proportions, ECO only slightly taller in game.
