# LudiStore: Regras de Negócio

| Código | Regra |
|---|---|
| RN01 | No cadastro público, o usuário só pode escolher o perfil Cliente ou Vendedor |
| RN02 | Somente o Admin gerencia usuários, marcas e categorias |
| RN03 | O vendedor só vê, edita e exclui os próprios brinquedos |
| RN04 | O vendedor escolhe marca e categorias já cadastradas pelo admin |
| RN05 | Todo brinquedo tem ao menos uma categoria |
| RN06 | Não é permitido cadastrar brinquedo com preço negativo ou zero |
| RN07 | O estoque não pode ser negativo |
| RN08 | Excluir brinquedo é exclusão lógica (fica inativo e preserva o histórico) |
| RN09 | O catálogo mostra apenas brinquedos ativos |
| RN10 | O vendedor não pode comprar o próprio produto |
| RN11 | Não é possível comprar mais do que o estoque disponível |
| RN12 | O pedido é transacional: se um item falhar, nada é gravado |
| RN13 | O item guarda o preço do momento da compra |
| RN14 | O vendedor vê as vendas dos seus produtos (data, comprador, quantidade e valor) |
| RN15 | Todo usuário vê o próprio histórico de compras |