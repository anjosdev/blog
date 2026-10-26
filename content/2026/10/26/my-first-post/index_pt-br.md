---
title: "Meu primeiro post"
description: "Um pequeno espaço para anotações sobre dados, código e aprendizados pelo caminho."
---

De vez em quando, um pequeno problema leva a algo que vale a pena anotar. Uma consulta que finalmente faz sentido. Uma forma melhor de mover dados. Uma pergunta que continua interessante depois que o trabalho termina.

Este é um espaço para essas anotações.

## Comece pequeno

As melhores anotações não precisam ser guias completos. Às vezes, algumas linhas de código e uma explicação bastam para tornar uma ideia útil para outra pessoa — ou para você no futuro.

```python
from pathlib import Path

anotacoes = sorted(Path("content").rglob("index.md"))
for anotacao in anotacoes:
    print(anotacao.parent.name)
```

## Algumas coisas sobre as quais escrever

- **Engenharia de dados:** transformar dados brutos em algo que as pessoas possam usar.
- **Pequenas ferramentas:** scripts que tornam o trabalho do dia a dia um pouco mais fácil.
- **Aprender em público:** perguntas, experimentos e aprendizados pelo caminho.

> Escreva a anotação que você gostaria de ter encontrado quando começou.

Não há um calendário de publicações por aqui. Só espaço para pensar, construir e compartilhar.

Você pode saber um pouco mais sobre mim no meu [perfil](https://anjos.dev).
