# Cenário
Uma empresa financeira que realiza operações de empréstimo enfrenta grandes dificuldades em seus processos, pois, antes de efetivar a operação, é necessário realizar uma série de validações para garantir que o cliente esteja apto a operar.

## Etapa 1 - Pré análise
É necessário validar as seguintes informações:

- **Birô de Crédito:** verificar o score de crédito do cliente.
- **FATURAMENTO_MENSAL:** consultar o faturamento mensal da empresa em formato gráfico.
- **BOM_PAGADOR:** verificar se o cliente é um bom pagador, analisando um gráfico que mostra o total de dívidas e o valor efetivamente pago no mês.

Os sistemas **Birô de Crédito** e **BOM_PAGADOR** possuem APIs para consulta dos dados.  
Já o sistema **FATURAMENTO_MENSAL** **não** possui API, mas é necessário obter seus dados de alguma forma alternativa.

### Faixas de Empréstimos
Existem três faixas de empréstimos: **P**, **M** e **G**, com os seguintes critérios:

- **P:** score acima de **400** e faturamento mensal acima de **R$ 10.000**
- **M:** score acima de **600** e faturamento mensal acima de **R$ 100.000**
- **G:** score acima de **800** e faturamento mensal acima de **R$ 1.000.000**

Além disso, o resultado do sistema **BOM_PAGADOR** deve ser considerado:

- Se o percentual de dívidas pagas for **inferior a 50%**, o cliente é **recusado** em qualquer operação.
- Se o percentual for **igual ou superior a 70%**, o cliente é **aprovado**.
- Se o percentual for **igual ou superior a 90%**, ele é **elegível para empréstimos de nível superior**.

## Etapa 2 - **Durante o Empréstimo**
Após a aprovação na **Etapa 1**, o cliente deve enviar um dos seguintes arquivos:

- **XML:** arquivo .xml contendo a tag \<chave\>, que representa a chave da nota fiscal (NF).
- **CNAB:** arquivo .REM, onde cada linha representa uma nota diferente. A chave da nota está localizada entre os caracteres **20** e **64**.

Ao receber o arquivo, é necessário validar todas as notas por meio da chave, verificando se existe alguma com as tags **“RECUSADO”** ou **“NÃO RECONHECIDO”**.  
Caso uma nota contenha essas tags, ela deve ser **invalidada**.

A consulta das tags é feita via **API**, que retorna um **JSON** com as informações da nota e suas respectivas tags.

É possível que algumas notas sejam inválidas (por exemplo, 1 entre 100), mas o valor total das notas válidas deve estar dentro de uma **tolerância de 15%** em relação ao valor total do empréstimo solicitado.

### Objetivo do Sistema

Criar um sistema onde o funcionário responsável pelas operações de empréstimo consiga visualizar, de forma **fácil e prática**, se o cliente está apto a operar.  
O sistema deve:

- Exibir todas as informações relevantes dos três sistemas (Birô, FATURAMENTO_MENSAL e BOM_PAGADOR).
- Indicar se o cliente pode ou não solicitar o empréstimo.
- Recomendar o **nível de empréstimo adequado (P, M ou G)**.
- Exibir os dados do birô de crédito e do BOM_PAGADOR para que o funcionário possa tomar decisões com base nas informações apresentadas.

Além disso, o sistema deve considerar **escalabilidade, disponibilidade, segurança e performance**.

## Objetivo
Desenvolver uma **documentação técnica** contendo:

- **Levantamento de requisitos**: detalhar as necessidades do sistema e suas dependências.
- **Metodologia aplicada**: descrever a abordagem adotada para o desenvolvimento (ex.: ágil, incremental etc.).
- **Resumo executivo**: um breve resumo da solução proposta, destacando os principais pontos técnicos e decisões de arquitetura.

Além disso, deve ser desenvolvido um **protótipo funcional da aplicação**, com o código disponível em um repositório público no **GitHub**, para fins de análise técnica.  
Você pode simular os dados dos sistemas dos Birôs, mas deve demonstrar a lógica de como você pegaria os dados dos sistemas com API e sem API se fosse na vida real

Será considerado **bônus** se o candidato disponibilizar o sistema **hospedado em ambiente de cloud**, preferencialmente **AWS**, embora **não seja obrigatório**.

Por fim, o candidato deve gravar um **vídeo explicativo** apresentando o funcionamento do protótipo, incluindo:

- O **link do sistema online** (caso tenha hospedado em cloud); **ou**,
- As **instruções claras para execução local**, considerando que os avaliadores são desenvolvedores com conhecimento básico.

Ao Finalizar o link do github, vídeo deve ser passado diretamente para o recrutador que nos enviará
