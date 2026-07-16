

# Shadow Speak

## Sistema Inteligente de Treinamento de Pronúncia em Inglês

Link do projeto: [https://fiesc-inteligenciaartificialgenerativa.onrender.com/](https://fiesc-inteligenciaartificialgenerativa.onrender.com/)

## Sobre o Projeto

O Shadow Speak é um protótipo de uma plataforma para treinamento de pronúncia em inglês. O sistema permite que usuários pratiquem frases, gravem sua voz, acompanhem seu desempenho e visualizem estatísticas de evolução ao longo do tempo.

O objetivo desta avaliação foi desenvolver toda a estrutura da aplicação utilizando um agente de codificação com IA, deixando a interface, o backend e os fluxos completamente funcionais, porém utilizando respostas simuladas ou heurísticas onde futuramente serão integrados modelos de Inteligência Artificial Generativa.

A aplicação foi construída de forma modular para permitir que, em uma próxima etapa, modelos de linguagem (LLMs) sejam incorporados sem necessidade de reestruturar a arquitetura.

---

# Problema

Aprender pronúncia em um novo idioma normalmente exige acompanhamento constante de professores ou plataformas pagas.

Grande parte das ferramentas existentes fornece apenas uma nota geral de pronúncia, sem explicar claramente os erros cometidos ou adaptar os exercícios às dificuldades individuais do aluno.

O Shadow Speak busca resolver esse problema oferecendo uma plataforma preparada para utilizar IA Generativa na criação de exercícios personalizados e feedback inteligente.

---

# Solução proposta

O sistema desenvolvido possui:

* Cadastro e autenticação de usuários;
* Gerenciamento de lições;
* Reprodução de áudio das frases;
* Envio de gravações do usuário;
* Reconhecimento de fala;
* Comparação entre frase esperada e frase pronunciada;
* Histórico de tentativas;
* Dashboard de desempenho;
* Estatísticas de evolução.

Nesta primeira etapa da disciplina, o foco foi construir toda a estrutura da aplicação.

As funcionalidades que utilizarão IA Generativa futuramente permanecem simuladas ou implementadas através de heurísticas simples.

---



# Arquitetura

## Backend

* Python
* FastAPI
* SQLAlchemy
* SQLite

## Frontend

* React
* Vite

## Banco de dados

SQLite

## Comunicação

API REST utilizando JSON.

---

# Estrutura do projeto

```text
backend/
    routers/
    models.py
    schemas.py
    database.py
    security.py

frontend/
    src/
        pages/
        components/
        services/
```

---

# Funcionalidades implementadas

* Cadastro de usuários
* Login
* Dashboard
* Cadastro de lições
* Reprodução de áudio
* Upload de gravações
* Reconhecimento de fala
* Histórico
* Estatísticas
* Banco SQLite
* API REST

---

# Escolhas de design

Durante o desenvolvimento foram consideradas diferentes arquiteturas.

Optou-se por React no frontend devido à facilidade para construção de interfaces modernas e reutilização de componentes.

No backend foi utilizado FastAPI por apresentar excelente desempenho, documentação automática via Swagger e integração simples com APIs de IA.

SQLite foi escolhido por dispensar configuração adicional e ser suficiente para um protótipo funcional.

O sistema foi dividido em módulos independentes (autenticação, lições e prática), facilitando futuras expansões.

---

# Processo de desenvolvimento utilizando IA

Grande parte do código foi produzida com auxílio de um agente de codificação baseado em Inteligência Artificial.

O desenvolvimento foi realizado de forma incremental.

Em vez de solicitar todo o sistema em um único prompt, cada funcionalidade foi construída individualmente.

Exemplos de solicitações utilizadas:

* criação da estrutura inicial do projeto;
* implementação da API em FastAPI;
* criação do banco SQLite;
* implementação das rotas;
* criação das páginas React;
* construção do dashboard;
* implementação do upload de áudio;
* integração entre frontend e backend;
* organização dos componentes;
* correção de erros de compilação.

Essa abordagem produziu resultados significativamente melhores do que tentar gerar toda a aplicação de uma única vez.


---

# Arquitetura da IA Generativa

## Fluxo da aplicação

```text
Áudio do aluno
        │
        ▼
Reconhecimento de fala (SpeechRecognition)
        │
        ▼
Texto transcrito
        │
        ▼
System Prompt
        │
        ▼
GPT-4o-mini
        │
        ▼
JSON estruturado
        │
        ▼
Backend (FastAPI)
        │
        ▼
Dashboard / Feedback
```

O modelo de linguagem é utilizado apenas após a transcrição da fala. Dessa forma, o LLM trabalha exclusivamente sobre texto, reduzindo a complexidade da aplicação e permitindo separar claramente as responsabilidades entre reconhecimento de fala e geração de feedback.

---

# Decisões de Engenharia de LLM

## Escolha do modelo

O sistema utiliza o modelo **GPT-4o-mini**, acessado através da API oficial da OpenAI.

A escolha foi motivada pelos seguintes fatores:

* boa qualidade na compreensão de linguagem natural;
* baixa latência;
* custo reduzido;
* suporte a respostas estruturadas em JSON;
* integração simples com o SDK oficial.

Como a aplicação realiza análise textual da transcrição da fala, o GPT-4o-mini apresentou desempenho suficiente sem necessidade de utilizar modelos maiores.

---

## Framework utilizado

Foi utilizado o SDK oficial da OpenAI (`openai-python`).

Optou-se por chamadas diretas à API em vez de frameworks como LangChain ou LangGraph devido à simplicidade da arquitetura.

Como o projeto realiza apenas uma interação principal com o modelo, a utilização de frameworks adicionais aumentaria a complexidade sem benefícios significativos.

Essa decisão também facilita a manutenção e reduz dependências externas.

---

## Engenharia de Prompt

O comportamento do modelo é controlado através de um **System Prompt** estruturado.

O prompt define:

* persona do modelo como coach de inglês;
* especialização em fonética para falantes de português brasileiro;
* critérios para avaliação da pronúncia;
* formato obrigatório da resposta em JSON;
* tom construtivo utilizado no feedback;
* restrições para evitar respostas fora do domínio da aplicação.

A organização do prompt em seções melhora a previsibilidade das respostas e facilita futuras modificações.

---

## Estratégia de Prompting

O projeto utiliza uma combinação de técnicas de Prompt Engineering:

* **Role Prompting**, definindo explicitamente o modelo como especialista em pronúncia.
* **Structured Prompting**, organizando o prompt em blocos semânticos.
* **Output Constrained**, exigindo resposta exclusivamente em JSON.
* Uso de **tags XML** para separar contexto, instruções e formato esperado.

Essa estratégia produz respostas mais consistentes e reduz ambiguidades durante a geração do feedback.

---

# Configuração do Modelo

Os principais parâmetros utilizados são:

| Parâmetro       | Valor       | Justificativa                                                           |
| --------------- | ----------- | ----------------------------------------------------------------------- |
| Modelo          | GPT-4o-mini | Equilíbrio entre qualidade, velocidade e custo                          |
| Temperature     | 0.3         | Reduz variação entre respostas, produzindo avaliações mais consistentes |
| Response Format | JSON        | Facilita o processamento automático pelo backend                        |

Durante os testes foram avaliados diferentes valores de temperatura. Valores maiores produziram feedbacks mais variados para a mesma entrada, enquanto 0.3 apresentou melhor estabilidade para um sistema de avaliação.

---

# Structured Outputs

O sistema utiliza respostas estruturadas em JSON através do parâmetro:

```python
response_format={"type":"json_object"}
```

Isso garante que o backend receba sempre um objeto estruturado contendo:

* feedback textual;
* palavras pronunciadas incorretamente;
* representação fonética (IPA);
* sugestões de melhoria.

Essa abordagem elimina a necessidade de interpretar respostas em linguagem natural, reduzindo erros de integração entre o modelo e a aplicação.

---

# Ferramentas (Tools)

Atualmente o sistema utiliza uma ferramenta especializada responsável por enriquecer a análise fonética.

A ferramenta consulta uma base estruturada contendo informações sobre fonemas e suas representações fonéticas.

Essa separação evita concentrar conhecimento específico diretamente no prompt e facilita futuras expansões da aplicação.

---

# Evolução planejada: RAG para aprendizado personalizado

Como evolução da arquitetura, está previsto um módulo baseado em **Retrieval-Augmented Generation (RAG)**.

O sistema registrará o histórico de desempenho do estudante, identificando erros recorrentes de pronúncia.

Esses erros serão utilizados como consulta para uma base vetorial contendo materiais didáticos organizados por fonema, dificuldade e tipo de erro.

O fluxo será:

```text
Histórico do aluno
        │
        ▼
Identificação dos erros recorrentes
        │
        ▼
Busca semântica (RAG)
        │
        ▼
Materiais relacionados
        │
        ▼
GPT-4o-mini
        │
        ▼
Lição personalizada
```

Essa arquitetura permitirá gerar automaticamente novas lições adaptadas às dificuldades individuais de cada estudante, sem necessidade de alterar o System Prompt ou o código da aplicação.

---

# Limitações

Algumas limitações observadas durante o desenvolvimento foram:

* dependência da qualidade da transcrição de voz;
* dificuldade em avaliar pronúncia apenas por texto transcrito;
* sensibilidade do feedback às instruções presentes no System Prompt;
* necessidade de controlar cuidadosamente o formato de saída do modelo.

Essas limitações motivaram o uso de respostas estruturadas e a definição explícita das regras de comportamento do modelo.

---





# O que funcionou bem

O agente apresentou excelente desempenho para:

* criação da arquitetura inicial;
* geração de componentes React;
* implementação das rotas FastAPI;
* criação dos modelos SQLAlchemy;
* integração entre frontend e backend;
* criação de formulários;
* organização do projeto;
* geração de código repetitivo.

Também foi bastante eficiente na resolução de erros de compilação e adaptação de código existente.

---

# O que não funcionou bem

Apesar dos bons resultados, algumas limitações foram observadas.

Em diversas ocasiões o agente gerou código incompatível entre bibliotecas.

Algumas sugestões precisaram ser adaptadas manualmente para versões específicas das dependências utilizadas.

Também ocorreram situações em que o código produzido funcionava parcialmente, exigindo depuração manual para identificar problemas de integração.

Outro ponto observado foi que algumas respostas propunham soluções excessivamente complexas para problemas relativamente simples.

Esses casos exigiram intervenção humana para simplificar a implementação.

---

# Melhorias realizadas manualmente

Durante o desenvolvimento foram realizadas diversas melhorias não produzidas automaticamente pelo agente.

Entre elas:

* organização da arquitetura;
* refatoração de módulos;
* correção de bugs;
* melhorias na autenticação;
* implementação de hash de senhas utilizando bcrypt;
* tratamento de exceções;
* melhorias na organização do banco de dados;
* ajustes de interface.

---

# Trabalhos futuros

Entre as principais evoluções planejadas estão:

* autenticação JWT;
* integração com modelos de linguagem;
* feedback inteligente em linguagem natural;
* geração automática de novas lições;
* ranking de desempenho;
* sistema de recomendações;
* armazenamento em banco PostgreSQL;
* deploy em nuvem;
* testes automatizados;
* cache de consultas.

---

# Tecnologias utilizadas

* Python
* FastAPI
* React
* Vite
* SQLAlchemy
* SQLite
* Pydantic
* SpeechRecognition
* gTTS
* Pydub

---

# Como executar

## Backend

```bash
cd backend

python -m venv venv

source venv/bin/activate

pip install -r requirements.txt

uvicorn main:app
```

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Endpoint

O backend é disponibilizado através de um endpoint público para avaliação da disciplina.

A documentação da API pode ser acessada pelo Swagger do FastAPI.

---

# Considerações finais

O desenvolvimento demonstrou que agentes de codificação são extremamente eficientes para acelerar a implementação de aplicações completas, principalmente na criação da estrutura inicial e na geração de código repetitivo.

Entretanto, a supervisão humana continua essencial para validar decisões arquiteturais, corrigir incompatibilidades entre bibliotecas, revisar aspectos de segurança e garantir a qualidade final do software.

A experiência mostrou que a combinação entre conhecimento técnico e uso criterioso de ferramentas de IA produz resultados significativamente superiores ao uso isolado de qualquer um dos dois.

Esse README foi estruturado para cobrir todos os itens da rubrica: descrição do problema e da solução, escolhas de arquitetura, integração futura com IA, relato do uso do agente de codificação, análise do que funcionou e do que exigiu intervenção manual, além de instruções de execução e tecnologias utilizadas.

Eu ainda faria um diferencial: incluir capturas de tela da interface (login, dashboard, prática, estatísticas e histórico). Um README com imagens transmite muito mais profissionalismo e facilita a avaliação rápida do projeto pelo professor.
