# Gravando a primeira placa

Guia de bancada. Siga na ordem — a parte que não dá para desfazer está
sinalizada.

---

## Antes de começar

**Esta primeira gravação é de teste.** A URL que entra no chip é permanente:
o chip não aponta para outro lugar depois. Enquanto o sistema estiver em
`solutecnfc.vercel.app`, toda placa gravada fica amarrada a esse endereço.

Serve para aprender o processo e mostrar para cliente. **Não grave placa de
cliente pagante ainda** — quando tiver o domínio definitivo, a gente troca o
`NEXT_PUBLIC_APP_URL` e aí sim as placas valem para sempre.

O que você precisa ter na mesa:

- Uma tag NFC em branco (NTAG213, 215 ou 216 — as mais comuns)
- Um celular com NFC ligado
- O app **NFC Tools** (Android na Play Store, iPhone na App Store, iPhone 7
  ou mais novo)

---

## 1. Cadastrar o cliente

No painel: **Clientes → Novo cliente**.

Para o teste, cadastre a própria Solutec ou você mesmo. Só o nome é
obrigatório; o resto ajuda depois, na hora de achar quem é quem.

Salve.

---

## 2. Criar a placa

**Minhas Placas → Criar placa.** São 5 etapas:

**Etapa 1 — Cliente.** Escolha o que você acabou de cadastrar.

**Etapa 2 — Template.** Escolha um dos 15. O botão *Ver exemplo* mostra a
página inteira antes de decidir. Para teste, `corporate-blue` ou `minimal`
são os mais fáceis de avaliar.

**Etapa 3 — Design.** Nome que aparece na página, foto, logo, cores. O
celular do lado direito atualiza enquanto você digita — é a página de
verdade, não um desenho.

**Etapa 4 — Links.** Adicione pelo menos um (WhatsApp é o mais útil). Pode
arrastar para reordenar e desligar sem apagar.

> Linha que você adicionou e deixou vazia é descartada sozinha. Não trava o
> salvamento.

**Etapa 5 — Finalizar.** Confira e crie.

---

## 3. Pegar a URL

Ao criar, o sistema leva você para a página da placa, com uma tarja chamando
atenção para a URL. É algo como:

```
https://solutecnfc.vercel.app/p/nome-da-empresa
```

**Essa é a URL que vai no chip.** Copie com o botão ao lado — digitar à mão é
pedir para errar uma letra e descobrir só depois de gravar.

Nessa mesma página você também encontra o QR Code, para quem não tem NFC no
celular.

### A regra que não muda

Editar o design, trocar o template, acrescentar link, desativar a placa —
**nada disso muda a URL**. O chip gravado continua valendo. É esse o ponto do
sistema: a placa é física e permanente, o conteúdo é editável.

Placa desativada não dá erro: ela abre uma página dizendo que está
temporariamente indisponível. O cliente nunca vê um link quebrado.

---

## 4. Gravar o chip

Abra o **NFC Tools**:

1. Aba **Escrever** (*Write*)
2. **Adicionar um registro** (*Add a record*)
3. Escolha **URL / URI**
4. Cole a URL copiada
5. **OK** → **Escrever** (*Write*)
6. Encoste a tag na parte de trás do celular e segure até aparecer "Escrita
   concluída"

A antena NFC costuma ficar na parte de cima das costas do aparelho. Se não
pegar de primeira, deslize a tag devagar até achar o ponto.

---

## 5. Testar

Tire a tag, espere um segundo e encoste de novo com o celular desbloqueado.
A página deve abrir sozinha, sem precisar de app.

Teste em dois celulares diferentes se puder.

Depois, no painel, abra **Estatísticas**: a visita que você acabou de fazer
já tem que estar lá. Se aparecer, o circuito está fechado — placa, chip,
página e medição.

---

## 6. Travar o chip (NÃO faça agora)

O NFC Tools tem uma opção de **bloquear a tag** (*Lock tag*), que impede
regravação.

**Isso não tem volta.** Tag travada é tag travada para sempre.

Para placa de cliente final faz sentido: ninguém regrava a placa dele por
cima. Para a sua de teste, **não trave** — você vai querer reaproveitar
quando tiver o domínio definitivo.

---

## Se der errado

**A tag não grava.** Pode já estar travada, ou ser só de leitura. Teste com
outra. Verifique também se o NFC do celular está ligado.

**Encosto e não abre nada.** Celular bloqueado não lê NFC em alguns
aparelhos. Desbloqueie e tente de novo. Em iPhone antigo (anterior ao 7) não
funciona mesmo.

**Abre mas dá erro na página.** Confira a URL gravada — o NFC Tools mostra o
conteúdo na aba *Ler*. Letra trocada é a causa mais comum.

**Abre e diz "indisponível".** A placa está desativada no painel. Ative em
Minhas Placas.
