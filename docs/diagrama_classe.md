# LudiStore: Diagrama de Classes de Domínio

```mermaid
classDiagram
    class Usuario {
        +int usuario_id
        +str nome
        +str email
        +str senha
        +Perfil perfil
        +TipoPessoa tipo_pessoa
        +str cpf
        +str cnpj
        +str telefone
        +date data_nascimento
        +Sexo sexo
        +str cep
        +str logradouro
        +str numero
        +str complemento
        +str bairro
        +str cidade
        +str uf
        +bool ativo
        +datetime criado_em
        +datetime atualizado_em
    }
    class Perfil {
        <<enumeration>>
        ADMIN
        VENDEDOR
        CLIENTE
    }
    class TipoPessoa {
        <<enumeration>>
        PF
        PJ
    }
    class Sexo {
        <<enumeration>>
        M
        F
        O
        N/I
    }
    class Marca {
        +int marca_id
        +str nome
        +bool ativo
    }
    class Categoria {
        +int categoria_id
        +str nome
        +bool ativo
    }
    class Brinquedo {
        +int brinquedo_id
        +str sku
        +str nome
        +str descricao
        +Decimal preco
        +int estoque
        +int idade_minima
        +str imagem_url
        +bool ativo
        +datetime criado_em
        +datetime atualizado_em
    }
    class Pedido {
        +int pedido_id
        +StatusPedido status
        +Decimal total
        +datetime criado_em
    }
    class StatusPedido {
        <<enumeration>>
        CONFIRMADO
    }
    class ItemPedido {
        +int item_pedido_id
        +int quantidade
        +Decimal preco_unitario
        +subtotal() Decimal
    }

    Usuario --> Perfil
    Usuario --> TipoPessoa
    Usuario --> Sexo
    Pedido --> StatusPedido
    Usuario "1" --> "0..*" Brinquedo : vende
    Usuario "1" --> "0..*" Pedido : compra
    Marca "1" --> "0..*" Brinquedo
    Brinquedo "0..*" -- "1..*" Categoria
    Pedido "1" *-- "1..*" ItemPedido
    ItemPedido "0..*" --> "1" Brinquedo
```
