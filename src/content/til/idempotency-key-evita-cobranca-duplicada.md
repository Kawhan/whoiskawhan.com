---
slug: idempotency-key-evita-cobranca-duplicada
title: Chave de idempotência evita cobrança duplicada
kicker: ENGINEERING
date: 2026-10-04
excerpt: Quando a resposta se perde na rede, uma nova tentativa pode cobrar duas vezes. Uma chave única por intenção resolve isso.
published: true
locale: pt-BR
---

Aprendi que, quando um pagamento dá "erro de conexão", o cliente não tem como saber se a cobrança aconteceu ou se só a resposta se perdeu. Tentar de novo é o certo, mas sem proteção vira cobrança duplicada.

A solução é o cliente gerar uma chave de idempotência para cada intenção de pagamento e reenviar a mesma chave em todas as tentativas:

```http
POST /pagamentos HTTP/1.1
Idempotency-Key: 8f14e45f-ceea-4c7a-9a1b-3e2d5c6f7a80
```

O servidor anota a chave antes de cobrar. Se ela aparecer de novo, ele devolve a resposta salva em vez de cobrar outra vez. O detalhe importante é gravar a chave de forma atômica (uma restrição UNIQUE no banco), senão dois cliques simultâneos ainda passam juntos.
