# Desafio: assistente de roteirização de viagem

## O pedido

> O CEO da Aqua vai a Paris para o **SIAL Paris 2026**, a feira internacional
> de alimentos (17 a 21 de outubro, Paris Nord Villepinte). Ele sai de
> Guarulhos.
>
> Preciso que alguém organize essa viagem inteira: como ele chega, onde fica,
> como se desloca, o que ele consegue de fato participar na feira, quem vale a
> pena encontrar por lá e onde ele come. A agenda dele já tem coisa marcada e
> nem tudo se encaixa.
>
> Monte isso para mim.

É esse o pedido. **Não existe lista de requisitos.** Decidir o que precisa ser
resolvido é parte do desafio.

## O que você recebe

- `dados/` traz o que a Aqua tem sobre o CEO, a agenda, a política de viagem, os
  contatos e o evento. É material cru, do jeito que existe na empresa: em
  arquivos diferentes, escrito por pessoas diferentes, em momentos diferentes.
- `web/` traz um recorte de páginas de referência (voos, hotéis, restaurantes,
  transporte), com data de captura.

## Regras do cenário

1. **Preço, disponibilidade e condições vêm do `web/` e do `dados/`.** Os
   locais são reais e os endereços são reais, mas os valores e a
   disponibilidade são do cenário deste desafio. Para efeito de avaliação, o
   corpus manda nesses campos.
2. **Distância, rota e tempo de deslocamento você busca no mundo real.** Use o
   mapa que preferir. Registre a fonte, o horário da consulta, o modal e o
   horário de partida considerado.
3. **Você pode pesquisar na internet.** Algumas informações necessárias não
   estão no corpus de propósito.
4. **Se a web atual contradisser o corpus, registre a divergência.** Diga o que
   o corpus afirma, o que você encontrou e qual usou. Trocar a fonte em
   silêncio é erro; apontar o conflito conta a favor.
5. **Nada é comprado ou reservado de verdade.** A entrega é recomendação com
   justificativa.

## O que entregar

Três coisas, detalhadas em `entrega/README.md`:

1. **Uma solução que funciona**, num repositório que qualquer agente abre e
   consegue rodar seguindo o que está escrito nele, sem você por perto.
2. **Uma interface para acompanhar a viagem**: webapp pequeno, página gerada
   ou artifact, mostrando itinerário, custos e o planejamento dia a dia.
3. **Uma demonstração ao vivo** das duas rodando, com a defesa das suas
   decisões.

Vamos abrir o seu repositório e olhar o que você construiu e com o quê, mas
essa leitura é secundária e não tem gabarito. Não existe stack certa nem
arquitetura esperada aqui. O que **decide** é a solução funcionando, o roteiro
que ela produz e a sua defesa dele. Use a IA que quiser. Esperamos que use.

## Prazo

Quatro dias corridos a partir do recebimento para entregar o repositório; a
demonstração é agendada depois. O esforço previsto é de um a dois
dias de trabalho.
