# Artes dos templates

Os 15 templates do sistema foram refeitos a partir das referências em
`docs/referencias/`. **O renderizador já produz esse visual** — as artes abaixo
são opcionais, só para a vitrine ficar com foto de verdade (prato, pessoa,
veículo), que a miniatura ao vivo não tem.

---

## Como usar

1. Cole o **prompt base** no ChatGPT uma vez.
2. Depois cole **um template por vez**, montando o bloco com a linha da tabela.
3. Salve como `<key>.png` em `public/templates/`.
4. Marque `art: true` naquele template em `lib/templates.ts`.

---

## Prompt base

```
Vou pedir uma série de imagens para a galeria de templates de um sistema
brasileiro que cria páginas digitais para placas NFC. Cada imagem é a
miniatura de um template.

REGRAS PARA TODAS:

1. Retrato, proporção 3:4 exata (1080 x 1440 px).
2. É a tela em si, sangrando até as bordas. NÃO desenhe moldura de celular,
   NÃO coloque sobre mesa, NÃO mostre barra de status nem relógio.
3. Nada de texto legível: use barras arredondadas cinzas no lugar das frases.
4. Sem marcas reais, sem logotipos de empresas existentes.
5. Estrutura vertical: foto/logo no topo, barra larga do nome, linha fina de
   descrição, e 4 a 5 LINHAS de link empilhadas.
6. Cada linha de link é assim: um quadrado arredondado colorido à esquerda
   com um ícone branco dentro, uma barra cinza no meio, e uma setinha ">" na
   ponta direita. A cor forte fica só nesse quadradinho — a linha em si é
   neutra (branca no claro, cinza-escura no escuro).
7. Acabamento de produto comercial: espaçamento generoso, alinhamento
   perfeito, sombra sutil. Nada saturado.

Confirme e aguarde o primeiro template.
```

---

## Os 15 templates

Monte cada pedido assim:

```
Arquivo: <key>.png
Fundo: <fundo>
Decoração: <decoração>
Cor dos ícones: <destaque>
Foto: <foto>
Tipografia: <fonte>
```

| key | fundo | decoração | destaque | foto | fonte |
|---|---|---|---|---|---|
| `corporate-blue` | azul bem claro `#EAF1FD` | ondas azuis no topo e no rodapé | `#1B54B0` | homem de camisa social | Inter |
| `executive` | branco | fita diagonal azul no canto superior esquerdo | `#1E7BE8` | escritório moderno desfocado | Inter |
| `gourmet-dark` | quase preto `#141210` | nenhuma — foto de prato ocupa o topo | dourado `#C9972B` | prato servido visto de cima | Playfair |
| `bistro` | bege `#F3E6D6` | ondas marrons suaves | marrom café `#8B5E3C` | xícara de café, luz quente | Playfair |
| `professional` | degradê azul `#1E5FD6` | manchas difusas verdes | verde `#34D399` | pessoa sorrindo, traje social | Inter |
| `consultant` | foto cinza esmaecida `#2B3238` | nenhuma | cinza claro `#D7DCE2` | montanhas em preto e branco | Playfair |
| `power-gym` | roxo escuro `#150F2E` | brilho roxo difuso atrás do centro | `#7B5BFF` | ícone de foguete, sem foto | Poppins |
| `barber-classic` | grafite `#121212` | riscos dourados finos nos cantos | dourado `#C9A227` | emblema circular dourado | Poppins |
| `beauty-soft` | lilás claro `#F6EAF7` | manchas difusas lilás | `#B45FD1` | mulher sorrindo, luz suave | Poppins |
| `realty` | azul-noite `#14263F` | nenhuma — paisagem ocupa o topo | `#2B6CB0` | montanha ao amanhecer | Inter |
| `shop` | azul-quase-preto `#10141F` | nenhuma | `#4F7FFF` | cubo 3D flutuante | Poppins |
| `care-clinic` | creme `#F3F1E9` | folhas verdes nos cantos | verde `#2E9E6B` | planta em vaso | Inter |
| `concessionaria` | preto `#121418` | barras vermelhas anguladas nos cantos | vermelho `#E11D2E` | vendedor ao lado de uma moto, concessionária ao fundo | Poppins |
| `minimal` | branco | onda verde suave na lateral direita | verde `#22A45D` | suculenta em vaso branco | Inter |
| `midnight` | violeta escuro `#16122B` | lascas diagonais violeta no canto superior direito | `#7C5CFF` | sem foto, só inicial | Inter |

---

## Sobre marcas

As referências de concessionária vieram com logo da Honda e da Yamaha. O
template `concessionaria` reproduz **o layout**, não as marcas: o cliente sobe
o logo dele. Se for uma concessionária Honda de verdade, ela usa a própria
marca — e aí é dela, no material dela. O sistema nunca distribui a marca de
terceiros.

---

## O que a arte substitui

Só a miniatura da vitrine. O botão "Ver exemplo" e a página real continuam
sendo o renderizador de verdade, sempre. Se mudar as cores de um template
depois, gere a arte dele de novo — senão a vitrine mostra o visual antigo.
