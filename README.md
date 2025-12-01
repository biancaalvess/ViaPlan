# ViaPlan

 Módulo de Takeoff Digital (Levantamento de Quantitativos)
O módulo de Takeoff é uma solução completa de engenharia assistida por computador (CAE) integrada à plataforma, projetada para permitir que orçamentistas e engenheiros realizem levantamentos de materiais e quantitativos diretamente sobre plantas digitais (PDF).

O sistema combina um Canvas Interativo de alta performance com ferramentas de desenho vetorial, permitindo cálculos automáticos de área, volume e distância com base na escala do projeto.

 Funcionalidades Principais
1. Visualização e Manipulação de Plantas
Visualizador de PDF Integrado: Renderização de plantas de alta resolução com suporte a navegação fluida.

Controle de Viewport: Funcionalidades de Zoom (0.5x a 3x), Pan (arrastar) e navegação entre páginas do documento.

Calibração de Escala: Sistema flexível para definir a escala do desenho (ex: 1" = 100'), garantindo precisão milimétrica nas medições.

2. Ferramentas de Medição (Tools)
O sistema oferece um conjunto de ferramentas especializadas acessíveis via barra lateral ou atalhos:

 Medição Linear (Measure/Conduit): Para medir distâncias simples ou tubulações.

 Vala (Trench): Ferramenta de área que calcula automaticamente o volume de escavação baseada em parâmetros configuráveis de largura e profundidade.

 Pontos e Contagens (Vault/Box): Para contagem de itens pontuais como caixas de passagem, poços ou equipamentos.

 Perfuração (Bore Shot): Ferramenta específica para traçados de perfuração direcional.

 Anotações (Notes): Camada de texto para observações sobre o projeto.

 Seleção e Edição: Permite selecionar, mover ou deletar medições existentes.

3. Configuração Paramétrica
Cada ferramenta possui modais de configuração avançada, permitindo definir propriedades físicas antes do desenho:

Configuração de largura e profundidade para valas.

Definição de diâmetros para tubulações.

Especificações de material para caixas/vaults.

4. Gestão de Dados e Workflow
Cálculos Automáticos: O sistema gera um resumo em tempo real (Summary) contendo:

Comprimento total (m/ft).

Área total.

Volume total (para escavações).

Histórico de Ações: Sistema robusto de Undo/Redo (Desfazer/Refazer) para ações de medição, zoom e configuração.

Ciclo de Vida: Controle de status do levantamento: Rascunho (Draft) → Em Progresso → Concluído → Aprovado.

Auditoria: Registro automático de quem criou, editou e aprovou o levantamento.

🛠️ Arquitetura Técnica
Gerenciamento de Estado (Store)
Utiliza Zustand para gerenciamento de estado global otimizado, evitando re-renderizações desnecessárias. O useTakeoffStore centraliza a lógica de:

Lista de medições e filtros.

Seleção de itens.

Cálculo de totais em tempo real.

Persistência de filtros e paginação.

Camada de Serviço (Service)
O TakeoffService abstrai a comunicação com a API REST, implementando:

Cache Inteligente: Armazenamento local (localStorage) para otimização de listagens e redução de requisições.

Mapeamento de Entidades: Conversão bidirecional robusta entre o formato do backend e o formato exigido pelos componentes visuais.

Validação: Verificação de dados client-side antes do envio para o servidor.

Canvas Engine
Baseado em HTML5 Canvas, o componente TakeoffCanvasBase gerencia o ciclo de vida do desenho (mousedown, mousemove, mouseup), convertendo coordenadas de tela em coordenadas reais do projeto baseadas na calibração de escala.

 Exportação e Integração
Exportação de Dados: Capacidade de exportar o levantamento completo para CSV, Excel ou PDF.

Importação: Suporte para importar medições externas ou restaurar backups.