# Dever de Casa – Quiz modular

Aplicativo web leve para estudar conteúdos escolares no formato de quiz estilo Duolingo. Agora a aplicação é modular: a tela inicial lista todos os deveres configurados e cada conjunto de questões fica em um arquivo JSON separado.

## Como executar

1. Instale uma forma simples de servir arquivos estáticos (por exemplo, a extensão **Live Server** do VS Code ou `npx serve`).
2. Rode o servidor apontando para a raiz do projeto e acesse `http://localhost:3000` (ou a porta configurada).

> ⚠️ Os navegadores bloqueiam `fetch` quando os arquivos são abertos diretamente via `file://`. Utilize um servidor local para carregar os JSON de questões.

## Estrutura do projeto

```
├── data/
│   ├── assignments.json        # Lista de deveres disponíveis
│   └── historia-4ano.json      # Exemplo de banco de questões
├── js/
│   └── main.js                 # Lógica da aplicação
├── styles.css                  # Estilos globais
└── index.html                  # Layout base
```

## Cadastro de novos deveres

1. Crie um arquivo JSON em `data/` seguindo o modelo abaixo (ex.: `matematica-proporcoes.json`).
2. Adicione uma entrada ao arquivo `data/assignments.json` apontando para o JSON criado.
3. Recarregue a página: o novo dever aparecerá automaticamente na tela inicial.

### Modelo de arquivo de questões

```json
{
  "id": "historia-brasil-4ano",
  "title": "História do Brasil – Quiz estilo Duolingo",
  "badge": "4º ano",
  "topics": "Conteúdo: engenhos, Brasil Holandês, bandeirantes, gado, ciclo do ouro, Conjuração, Revolução Francesa e Napoleão.",
  "questions": [
    {
      "question": "A cana-de-açúcar tem origem em qual região do mundo?",
      "options": [
        "Nova Guiné (Oceania)",
        "Península Ibérica",
        "África do Norte",
        "América Central"
      ],
      "answerIndex": 0,
      "explanation": "A cana surgiu na Nova Guiné e foi difundida para Índia, China, Pérsia e Síria antes de chegar à Europa."
    }
  ]
}
```

#### Campos obrigatórios

- `title`: nome apresentado no cabeçalho do quiz.
- `badge`: selo exibido ao lado do título (ex.: série, turma, nível de dificuldade).
- `topics`: resumo do conteúdo, mostrado no rodapé durante o quiz.
- `questions`: array com as questões.
  - `question`: enunciado.
  - `options`: alternativas (ordem importa).
  - `answerIndex`: índice (base 0) da alternativa correta.
  - `explanation`: feedback apresentado após responder.

#### Campos opcionais

- `id`: usado apenas para organização interna ou integração com outros sistemas.

### Exemplo de entrada em `assignments.json`

```json
[
  {
    "id": "historia-brasil-4ano",
    "title": "História do Brasil",
    "subtitle": "Brasil colonial e transformações do século XVIII",
    "badge": "4º ano",
    "summary": "Engenhos, Brasil Holandês, bandeirantes, ciclo do ouro, Conjuração Mineira, Revolução Francesa e Napoleão.",
    "questionsFile": "data/historia-4ano.json"
  }
]
```

- `subtitle`: linha complementar exibida no cartão do dever.
- `summary`: descrição curta utilizada na tela inicial e no rodapé se o JSON não tiver `topics`.
- `questionsFile`: caminho relativo até o arquivo de questões.

### Dicas

- Reutilize o mesmo layout e apenas crie novos arquivos JSON para cada prova/lista.
- Mantenha os índices das respostas consistentes com a ordem das opções.
- Utilize acentuação correta; os arquivos estão salvos em UTF-8.
- Se quiser dividir por pastas, lembre-se de atualizar os caminhos em `assignments.json`.

## Melhorias implementadas

- Tela inicial modular com cartões de deveres.
- Separação do layout (HTML), estilos (CSS), lógica (JS) e banco de questões (JSON).
- Feedback acessível e compartilhamento simplificado dos resultados.
- Interface preparada para múltiplos deveres e fácil manutenção.
