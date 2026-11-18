# Artes dos templates

Um PNG por template, com o nome exato da `key` dele em `lib/templates.ts`:

```
corporate-blue.png   executive.png      gourmet-dark.png   bistro.png
professional.png     consultant.png     power-gym.png      barber-classic.png
beauty-soft.png      realty.png         shop.png           care-clinic.png
concessionaria.png   minimal.png        midnight.png
```

Proporção **3:4** (ex.: 1080 x 1440). O prompt para gerar está em
`docs/prompt-mockups-templates.md`; as referências visuais, em
`docs/referencias/`.

Depois de soltar o arquivo aqui, marque `art: true` no template correspondente
em `lib/templates.ts`. Sem essa marca a vitrine continua usando a miniatura
renderizada ao vivo — que já reproduz o mesmo visual, só sem as fotos.
