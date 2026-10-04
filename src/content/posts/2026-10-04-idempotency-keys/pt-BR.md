---
slug: idempotency-keys
translationKey: idempotency-keys
title: Chaves de idempotência: como evitar cobrar seu cliente duas vezes
kicker: ENGINEERING
date: 2026-10-04
readingTime: 7 MIN DE LEITURA
author: kawhan
excerpt: Entenda o que são chaves de idempotência, por que elas existem e como usá-las para que uma requisição repetida não vire uma cobrança duplicada.
cover: https://images.unsplash.com/photo-1556740720-776b84291f8e?auto=format&fit=crop&w=1200&q=80
coverAlt: Pessoa segurando uma maquininha de cartão durante um pagamento
published: true
locale: pt-BR
---

Imagine a cena: você está comprando um tênis pelo celular, toca em "Pagar" e a tela fica girando. O sinal do 4G oscila. Depois de alguns segundos aparece "Erro de conexão". Você toca em "Pagar" de novo. Dessa vez funciona.

No dia seguinte, a fatura mostra duas cobranças.

O que aconteceu? E, mais importante, como um sistema pode se proteger disso? É aqui que entram as chaves de idempotência (em inglês, idempotency keys).

## O problema: a rede mente

Quando o app envia o pagamento para o servidor, três coisas podem acontecer:

- A requisição não chega ao servidor. Nada foi cobrado.
- A requisição chega, o servidor cobra, mas a resposta se perde no caminho de volta.
- Tudo funciona normalmente.

O problema é que, do ponto de vista do app, os dois primeiros casos são idênticos: ele só vê um erro. Ele não tem como saber se a cobrança aconteceu ou não.

```text
App                       Servidor
 |  --- POST /pagamentos --->  |
 |                             |  cobra R$ 300 ✅
 |  <--- 201 Created ----  ✗   |  (resposta se perdeu)
 |                             |
 |  "Erro de conexão"          |
 |  --- POST /pagamentos --->  |
 |                             |  cobra R$ 300 de novo ❌
```

Tentar de novo (o famoso retry) é a coisa certa a fazer quando a rede falha. Mas, sem cuidado, a nova tentativa vira cobrança duplicada.

## Primeiro: o que é idempotência?

Uma operação é idempotente quando fazê-la uma vez ou várias vezes tem o mesmo efeito.

Pense no botão do elevador. Se você apertar uma vez, o elevador vem. Se apertar dez vezes, impaciente, o elevador vem do mesmo jeito. Só uma vez. Apertar de novo não chama um segundo elevador.

Agora pense numa máquina de refrigerante: cada vez que você aperta o botão (com crédito), cai uma lata. Isso não é idempotente.

No HTTP, alguns métodos já são idempotentes por definição:

- GET: sim, porque só lê dados.
- PUT: sim, porque diz "deixe o recurso exatamente assim".
- DELETE: sim, porque apagar algo já apagado não muda nada.
- POST: não, porque diz "crie algo novo", e cada chamada cria mais um.

Criar um pagamento é um POST. Então precisamos de uma ajuda extra para torná-lo seguro contra repetições.

## A solução: a chave de idempotência

A ideia é simples: o cliente gera um identificador único para cada intenção de pagamento e envia junto com a requisição. Se a mesma requisição chegar de novo com o mesmo identificador, o servidor reconhece ("esse eu já fiz") e devolve a resposta original em vez de cobrar outra vez.

Esse identificador é a chave de idempotência. Normalmente ela vai num header HTTP chamado Idempotency-Key:

```http
POST /pagamentos HTTP/1.1
Content-Type: application/json
Idempotency-Key: 8f14e45f-ceea-4c7a-9a1b-3e2d5c6f7a80

{
  "valor": 30000,
  "moeda": "BRL",
  "cartao": "tok_visa_123"
}
```

A chave costuma ser um UUID gerado no momento em que o usuário decide pagar. O ponto principal: se o app precisar tentar de novo, ele reutiliza a mesma chave.

Com isso, aquele diagrama de antes fica assim:

```text
App                                Servidor
 |  --- POST (chave: 8f14...) --->  |
 |                                  |  cobra R$ 300 ✅, guarda resposta
 |  <--- 201 Created --------  ✗    |  (resposta se perdeu)
 |                                  |
 |  --- POST (chave: 8f14...) --->  |
 |                                  |  "já vi essa chave!"
 |  <--- 201 Created (a mesma) ---  |  não cobra de novo ✅
```

O usuário é cobrado uma vez só, e o app recebe a resposta que tinha perdido.

## Como o servidor faz isso por dentro

A lógica do servidor, em pseudo-código, é mais ou menos esta:

```text
função criarPagamento(requisição):
    chave = requisição.headers["Idempotency-Key"]

    se chave não existe:
        retornar erro 400 "Idempotency-Key é obrigatória"

    registro = banco.buscar(chave)

    se registro existe:
        se registro.corpo != requisição.corpo:
            retornar erro 422 "Chave reutilizada com dados diferentes"
        se registro.status == "processando":
            retornar erro 409 "Requisição ainda em andamento"
        retornar registro.respostaSalva      // não cobra de novo!

    banco.salvar(chave, status = "processando", corpo = requisição.corpo)

    resposta = cobrarCartao(requisição.corpo)

    banco.atualizar(chave, status = "concluído", respostaSalva = resposta)
    retornar resposta
```

Em resumo: antes de fazer qualquer coisa, o servidor anota a chave. Se ela aparecer de novo, ele não repete o trabalho, só devolve o que já tinha respondido.

## Os cuidados que fazem diferença

A ideia é simples, mas alguns detalhes separam uma implementação boa de uma que só parece funcionar.

Quem gera a chave é o cliente. A chave precisa existir antes da primeira tentativa, para que todas as tentativas usem a mesma. Por isso quem gera é o cliente (o app, o frontend, o outro serviço), não o servidor. E atenção: a chave representa uma intenção. Uma nova compra recebe uma nova chave; a nova tentativa da mesma compra usa a mesma chave.

Mesma chave com dados diferentes é erro. Se chegar a mesma chave com um corpo diferente (por exemplo, R$ 300 na primeira vez e R$ 500 na segunda), algo está errado no cliente. O servidor não deve adivinhar qual vale: ele recusa a requisição.

Cuidado com duas requisições ao mesmo tempo. Se o usuário clicar duas vezes tão rápido que as duas requisições chegam juntas, as duas podem buscar a chave no banco no mesmo instante, achar que ela não existe e cobrar. Por isso salvar a chave precisa ser uma operação atômica. No banco de dados, isso costuma ser uma restrição UNIQUE na coluna da chave: só uma das requisições consegue gravar, e a outra recebe um erro e responde "em andamento".

A chave não vale para sempre. Guardar todas as chaves para sempre ocupa espaço sem necessidade. O comum é definir um prazo de validade, por exemplo 24 horas. Depois disso, a chave pode ser apagada: ninguém vai tentar de novo um pagamento de ontem.

Não é só para pagamentos. Pagamento é o exemplo mais claro, mas a mesma ideia vale para qualquer operação que não pode acontecer duas vezes: criar um pedido, enviar um e-mail, transferir dinheiro, emitir uma nota fiscal.

## Resumo

- A rede falha, e o cliente não sabe se a operação aconteceu. Por isso ele tenta de novo.
- Uma operação idempotente tem o mesmo efeito se feita uma ou várias vezes.
- POST não é idempotente por natureza; a chave de idempotência resolve isso.
- O cliente gera uma chave única por intenção e reutiliza a mesma chave nas novas tentativas.
- O servidor anota a chave antes de agir e, se ela se repetir, devolve a resposta salva em vez de executar de novo.
- Cuidados: chave gerada pelo cliente, recusar dados diferentes, proteger contra requisições simultâneas e definir validade.

Da próxima vez que a tela de pagamento girar e você tocar em "Pagar" de novo, já sabe: se o sistema foi bem feito, uma chave de idempotência está garantindo que você só vai pagar uma vez.

Foto de capa: Blake Wisz, no Unsplash (unsplash.com/@blakewisz).
