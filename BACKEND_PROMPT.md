# Especificação de Ferramentas de Medição - ViaPlan

Este documento descreve as especificações técnicas completas para implementação no backend das ferramentas de medição do ViaPlan.

## Visão Geral

O sistema possui 8 ferramentas principais organizadas em categorias:

- **Ferramentas de Trajetória**: Trincheira, Perfuração Direcional, Conduto
- **Ferramentas Pontuais**: Câmara/Buraco de Mão, Nota
- **Ferramentas de Área**: Área
- **Ferramentas de Manipulação**: Selecionar

---

## 1. Selecionar

**Função**: Base para manipulação de objetos já medidos. **NÃO mede, apenas edita**.

### Funcionalidades Obrigatórias:

1. **Mover medições**: Alterar posição de objetos medidos no plano
2. **Redimensionar medições**: Ajustar dimensões de objetos (largura, profundidade, etc.)
3. **Apagar medições**: Remover objetos do projeto
4. **Agrupar/Selecionar múltiplos objetos**: Seleção em lote para operações em grupo
5. **Filtrar por tipo**: Filtrar medições por tipo (trincheira, conduto, área, etc.)
6. **Propriedades do objeto selecionado**: Exibir e editar propriedades como:
   - Comprimento
   - Material
   - Profundidade
   - Largura
   - Volume
   - Outras propriedades específicas do tipo

### Endpoints Sugeridos:

```
GET    /api/v1/measurements?type={type}&project_id={id}
GET    /api/v1/measurements/{id}
PUT    /api/v1/measurements/{id}
DELETE /api/v1/measurements/{id}
POST   /api/v1/measurements/batch-update
DELETE /api/v1/measurements/batch-delete
```

### Estrutura de Dados:

```json
{
  "id": "string",
  "type": "select",
  "selected_measurements": ["measurement_id_1", "measurement_id_2"],
  "filters": {
    "type": "trench|conduit|vault|area|note|bore-shot|hydro-excavation",
    "date_range": {"start": "ISO8601", "end": "ISO8601"}
  }
}
```

---

## 2. Trincheira Aberta

**Função**: Medição da via tradicional para instalação de condutos.

### Propriedades Obrigatórias:

1. **Traçado**: Polilinha (array de coordenadas {x, y})
2. **Largura**: Média ou variável (array de valores por segmento)
3. **Profundidade**: Média ou variável (array de valores por segmento)
4. **Tipo de solo**: Opcional (enum: "argila" | "areia" | "rocha" | "misturado")
5. **Cálculo de volume**: L × W × D (comprimento × largura × profundidade)
6. **Seções transversais opcionais**: Array de perfis técnicos quando necessário

### Resultado Principal:

- **Comprimento total** (em metros)
- **Volume de escavação** (em m³)

### Validações:

- Traçado deve ter pelo menos 2 pontos
- Largura e profundidade devem ser > 0 (em metros)
- Se largura/profundidade variável, array deve ter mesmo tamanho do traçado

### Endpoints Sugeridos:

```
POST   /api/v1/measurements/trench
GET    /api/v1/measurements/trench/{id}
PUT    /api/v1/measurements/trench/{id}
POST   /api/v1/measurements/trench/{id}/calculate-volume
POST   /api/v1/measurements/trench/{id}/cross-sections
```

### Estrutura de Dados:

```json
{
  "id": "string",
  "type": "trench",
  "project_id": "string",
  "label": "string",
  "coordinates": [
    {"x": 0.0, "y": 0.0},
    {"x": 10.0, "y": 5.0}
  ],
  "width": {
    "type": "constant|variable",
    "value": 0.6,
    "values": [0.6, 0.75, 0.9],
    "unit": "m"
  },
  "depth": {
    "type": "constant|variable",
    "value": 0.9,
    "values": [0.9, 1.05, 1.2],
    "unit": "m"
  },
  "soil_type": "argila|areia|rocha|misturado",
  "length": 4.72,
  "volume_m3": 9.4,
  "asphalt_removal": {
    "width": 0.6,
    "thickness": 0.15,
    "volume_m3": 0.92,
    "unit": "m"
  },
  "concrete_removal": {
    "width": 0.6,
    "thickness": 0.20,
    "volume_m3": 1.15,
    "unit": "m"
  },
  "backfill": {
    "type": "solo_nativo|reaterro_fluido|areia|cascalho|pedra_britada|personalizado",
    "custom_type": "string",
    "width": 0.6,
    "depth": 0.9,
    "volume_m3": 7.65,
    "unit": "m"
  },
  "cross_sections": [
    {
      "position": 0.5,
      "width": 2.0,
      "depth": 3.0,
      "profile": [{"x": 0, "y": 0}, {"x": 2, "y": -3}]
    }
  ],
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

---

## 3. Perfuração Direcional (HDD)

**Função**: Perfuração horizontal dirigida. Tratada como trajetória com limites técnicos.

### Propriedades Obrigatórias:

1. **Traçado**: Polilinha ou spline (array de coordenadas {x, y, z})
2. **Raio mínimo de curvatura**: Fornecido pelo material/SDR (em pés ou metros)
3. **Ângulo de entrada**: Em graus (0-90°)
4. **Ângulo de saída**: Em graus (0-90°)
5. **Profundidade mínima garantida**: Em pés ou metros
6. **Diâmetro externo do conduto**: Em polegadas ou mm
7. **Diâmetro de perfuração (backreamer)**: Normalmente 1,2-1,5× o tubo
8. **Comprimento final perfurado**: Calculado automaticamente

### Validações Automáticas Obrigatórias:

1. **Raio de curvatura real ≥ raio mínimo recomendado**
   - Calcular raio de curvatura em cada ponto da trajetória
   - Validar que nenhum segmento viola o raio mínimo
   - Retornar erro se violação detectada

2. **Trajetória não viola a profundidade mínima**
   - Validar que todos os pontos Z ≥ profundidade mínima
   - Retornar erro se violação detectada

### Resultado Principal:

- **Comprimento perfurado** (em metros)
- **Raio mínimo atendido** (boolean + detalhes de validação)
- **Diâmetro do furo** (em milímetros)

### Endpoints Sugeridos:

```
POST   /api/v1/measurements/bore-shot
GET    /api/v1/measurements/bore-shot/{id}
PUT    /api/v1/measurements/bore-shot/{id}
POST   /api/v1/measurements/bore-shot/{id}/validate
POST   /api/v1/measurements/bore-shot/{id}/calculate-radius
GET    /api/v1/materials/{material_id}/min-radius
```

### Estrutura de Dados:

```json
{
  "id": "string",
  "type": "bore-shot",
  "project_id": "string",
  "label": "string",
  "coordinates": [
    {"x": 0.0, "y": 0.0, "z": 10.0},
    {"x": 50.0, "y": 5.0, "z": 12.0},
    {"x": 100.0, "y": 0.0, "z": 10.0}
  ],
  "conduits": [
    {
      "size_in": "4",
      "count": 2,
      "material": "HDPE",
      "sdr": "11",
      "outer_diameter_in": 4.5,
      "min_curvature_radius_m": 45.72
    }
  ],
  "entry_angle_degrees": 15.0,
  "exit_angle_degrees": 15.0,
  "min_depth_guaranteed_m": 2.44,
  "drill_diameter_mm": 152.4,
  "backreamer_diameter_mm": 182.88,
  "length_m": 32.0,
  "validation": {
    "radius_check": {
      "passed": true,
      "min_radius_required_m": 45.72,
      "min_radius_actual_m": 54.86,
      "violations": []
    },
    "depth_check": {
      "passed": true,
      "min_depth_required_m": 2.44,
      "min_depth_actual_m": 3.05,
      "violations": []
    }
  },
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

---

## 4. Hidroescavação

**Função**: Escavação com jato d'água e vácuo. Usada para travessias sensíveis.

### Propriedades Obrigatórias:

1. **Traçado**: Reta ou polilinha (array de coordenadas {x, y})
2. **Seção nominal**: Geralmente circular (diâmetro em metros)
3. **Profundidade**: Em metros
4. **Volume removido**: Calculado automaticamente (em m³)
5. **Relação de eficiência**: Opcional (perda por colapso ou material aspirado extra, 0-1)

### Tipos de Hidroescavação:

- **Trincheira**: Traçado linear com seção retangular
- **Buraco**: Ponto único com seção circular ou retangular
- **Potholing**: Múltiplos pontos com profundidade média

### Resultado Principal:

- **Comprimento** (em metros) - para trincheira
- **Volume de remoção** (em m³)

### Endpoints Sugeridos:

```
POST   /api/v1/measurements/hydro-excavation
GET    /api/v1/measurements/hydro-excavation/{id}
PUT    /api/v1/measurements/hydro-excavation/{id}
POST   /api/v1/measurements/hydro-excavation/{id}/calculate-volume
```

### Estrutura de Dados:

```json
{
  "id": "string",
  "type": "hydro-excavation",
  "subtype": "trench|hole|potholing",
  "project_id": "string",
  "label": "string",
  "coordinates": [
    {"x": 0.0, "y": 0.0},
    {"x": 20.0, "y": 5.0}
  ],
  "section": {
    "shape": "circular|rectangular",
    "diameter_m": 0.6,
    "width_m": 0.6,
    "length_m": 0.6,
    "unit": "m"
  },
  "depth_m": 0.9,
  "volume_removed_m3": 3.98,
  "efficiency_ratio": 0.85,
  "surface_type": "asphalt|concrete|dirt",
  "include_restoration": true,
  "conduits": [
    {
      "size_in": "2",
      "count": 1,
      "material": "PVC"
    }
  ],
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

---

## 5. Conduto

**Função**: Medição sobre o conduto instalado no subsolo.

### Propriedades Obrigatórias:

1. **Trajeto**: Polilinha (array de coordenadas {x, y, z})
2. **Material**: Enum ("PVC" | "HDPE" | "Steel" | "Aluminum" | "Fiber Optic" | "Copper" | "Other")
3. **Classe/SDR**: String (ex: "SDR11", "SDR17", "Class 200")
4. **Diâmetro nominal (NPS/DN)**: Em polegadas ou mm
5. **Espessura**: Em polegadas ou mm
6. **Comprimento total**: Calculado automaticamente
7. **Conexões**: Opcional (array de peças de transição, válvulas, juntas)

### Extras Úteis:

- **Cálculo de volume interno**: π × r² × comprimento
- **Peso estimado por metro**: Baseado em material e dimensões
- **Verificação de compatibilidade com método de instalação**: Valas, HDD, etc.

### Resultado Principal:

- **Comprimento total** (em metros)
- **Volume interno** (opcional, em litros)
- **Peso estimado** (opcional, em quilogramas)

### Endpoints Sugeridos:

```
POST   /api/v1/measurements/conduit
GET    /api/v1/measurements/conduit/{id}
PUT    /api/v1/measurements/conduit/{id}
POST   /api/v1/measurements/conduit/{id}/calculate-volume
POST   /api/v1/measurements/conduit/{id}/calculate-weight
POST   /api/v1/measurements/conduit/{id}/check-compatibility
```

### Estrutura de Dados:

```json
{
  "id": "string",
  "type": "conduit",
  "project_id": "string",
  "label": "string",
  "coordinates": [
    {"x": 0.0, "y": 0.0, "z": 8.0},
    {"x": 50.0, "y": 5.0, "z": 8.0}
  ],
  "conduits": [
    {
      "size_in": "4",
      "count": 2,
      "material": "HDPE",
      "sdr": "11",
      "nominal_diameter_mm": 101.6,
      "outer_diameter_mm": 114.3,
      "wall_thickness_mm": 6.35,
      "length_m": 16.76,
      "unit": "m"
    }
  ],
  "connections": [
    {
      "type": "elbow|tee|reducer|valve|joint",
      "position_m": 7.62,
      "specifications": {}
    }
  ],
  "total_length_m": 16.76,
  "internal_volume_l": 456.2,
  "estimated_weight_kg": 204.1,
  "installation_method": "trench|hdd|direct_bury",
  "compatibility_check": {
    "trench": true,
    "hdd": true,
    "direct_bury": true
  },
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

---

## 6. Câmara / Buraco de Mão

**Função**: Infraestrutura pontual para acesso/inspeção.

### Propriedades Obrigatórias:

1. **Tipo**: Enum ("poço_visita" | "caixa_passagem" | "buraco_mao" | "câmara")
2. **Dimensões**: Retangular ou circular
   - Retangular: comprimento × largura × profundidade
   - Circular: diâmetro × profundidade
3. **Profundidade**: Em metros
4. **Material/Classe**: String (ex: "Concreto Classe A", "Plástico HDPE")
5. **Quantidade**: Integer (para múltiplas unidades idênticas)

### Volumes Opcionais:

- Volume de escavação (m³)
- Remoção de asfalto (m³)
- Remoção de concreto (m³)
- Restauração de asfalto (m³)
- Restauração de concreto (m³)
- Reaterro (m³)

### Resultado Principal:

- **Contagem** (quantidade de unidades)
- **Volume da estrutura** (opcional, em m³)

### Endpoints Sugeridos:

```
POST   /api/v1/measurements/vault
GET    /api/v1/measurements/vault/{id}
PUT    /api/v1/measurements/vault/{id}
POST   /api/v1/measurements/vault/{id}/calculate-volumes
```

### Estrutura de Dados:

```json
{
  "id": "string",
  "type": "vault",
  "project_id": "string",
  "label": "string",
  "coordinates": [
    {"x": 25.0, "y": 15.0}
  ],
  "vault_type": "poço_visita|caixa_passagem|buraco_mao|câmara",
  "shape": "rectangular|circular",
  "dimensions": {
    "length_m": 1.22,
    "width_m": 1.22,
    "diameter_m": 1.22,
    "depth_m": 1.83,
    "unit": "m"
  },
  "material": "Concreto Classe A",
  "class": "H-20",
  "quantity": 1,
  "volumes": {
    "excavation_m3": 2.68,
    "asphalt_removal_m3": 0.38,
    "concrete_removal_m3": 0.0,
    "asphalt_restoration_m3": 0.38,
    "concrete_restoration_m3": 0.0,
    "backfill_m3": 1.91,
    "backfill_type": "solo_nativo|reaterro_fluido|areia|cascalho|pedra_britada|personalizado"
  },
  "hole_size": {
    "length_m": 0.91,
    "width_m": 0.91,
    "depth_m": 1.83,
    "unit": "m"
  },
  "traffic_rated": true,
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

---

## 7. Área

**Função**: Medição superficial.

### Propriedades Obrigatórias:

1. **Polígono**: Array de coordenadas {x, y} formando um polígono fechado
2. **Área total**: Calculada automaticamente (em m²)
3. **Perímetro**: Calculado automaticamente (em metros)
4. **Altura/Profundidade opcional**: Para extrair volume (em metros)

### Resultado Principal:

- **Área em m²**
- **Perímetro** (em metros)
- **Volume** (opcional, se profundidade fornecida, em m³)

### Validações:

- Polígono deve ter pelo menos 3 pontos
- Polígono deve ser fechado (primeiro ponto = último ponto)
- Polígono não deve ter auto-intersecções

### Endpoints Sugeridos:

```
POST   /api/v1/measurements/area
GET    /api/v1/measurements/area/{id}
PUT    /api/v1/measurements/area/{id}
POST   /api/v1/measurements/area/{id}/calculate
POST   /api/v1/measurements/area/{id}/validate-polygon
```

### Estrutura de Dados:

```json
{
  "id": "string",
  "type": "area",
  "project_id": "string",
  "label": "string",
  "coordinates": [
    {"x": 0.0, "y": 0.0},
    {"x": 10.0, "y": 0.0},
    {"x": 10.0, "y": 10.0},
    {"x": 0.0, "y": 10.0},
    {"x": 0.0, "y": 0.0}
  ],
  "area_m2": 9.29,
  "perimeter_m": 12.19,
  "depth_m": 0.0,
  "volume_m3": 0.0,
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

---

## 8. Nota

**Função**: Informação de campo dentro do projeto.

### Propriedades Obrigatórias:

1. **Texto livre**: String (sem limite de caracteres)
2. **Nome/autor**: String
3. **Data**: ISO8601 timestamp
4. **Localização**: Coordenada {x, y}
5. **Vinculação a um objeto**: Opcional (ID de uma medição)

### Resultado Principal:

- **Metadado**: Não altera cálculo, apenas documentação

### Endpoints Sugeridos:

```
POST   /api/v1/measurements/note
GET    /api/v1/measurements/note/{id}
PUT    /api/v1/measurements/note/{id}
DELETE /api/v1/measurements/note/{id}
GET    /api/v1/measurements/{measurement_id}/notes
```

### Estrutura de Dados:

```json
{
  "id": "string",
  "type": "note",
  "project_id": "string",
  "text": "Observação sobre a condição do solo na região X",
  "author": "João Silva",
  "date": "2024-01-15T10:30:00Z",
  "coordinates": [
    {"x": 25.0, "y": 15.0}
  ],
  "linked_measurement_id": "measurement_id_123",
  "created_at": "ISO8601",
  "updated_at": "ISO8601"
}
```

---

## Endpoints Globais

### Listagem e Filtros:

```
GET    /api/v1/measurements?project_id={id}&type={type}&date_from={date}&date_to={date}
GET    /api/v1/measurements/{id}
POST   /api/v1/measurements
PUT    /api/v1/measurements/{id}
DELETE /api/v1/measurements/{id}
POST   /api/v1/measurements/batch
DELETE /api/v1/measurements/batch
GET    /api/v1/measurements/export?format=csv|json&project_id={id}
```

### Cálculos e Validações:

```
POST   /api/v1/measurements/{id}/calculate
POST   /api/v1/measurements/{id}/validate
GET    /api/v1/measurements/project/{project_id}/summary
GET    /api/v1/measurements/project/{project_id}/totals
```

---

## Validações Comuns

1. **Coordenadas**: Devem estar dentro dos limites do projeto/planta
2. **Unidades**: Padronizar para sistema métrico brasileiro (metros, m², m³)
3. **Datas**: Formato ISO8601
4. **IDs**: UUIDs ou strings únicas
5. **Projeto**: Todas as medições devem estar vinculadas a um projeto

---

## Notas de Implementação

1. **Sistema de Coordenadas**: Definir se será coordenadas absolutas ou relativas ao PDF/planta
2. **Escala**: Considerar escala do projeto (1" = 100', etc.) nos cálculos
3. **Precisão**: Decimais para comprimentos (2 casas), volumes (3 casas)
4. **Performance**: Indexar por project_id, type, created_at para queries rápidas
5. **Auditoria**: Manter histórico de alterações (created_at, updated_at, deleted_at)

---

## Exemplo de Resposta de Summary

```json
{
  "project_id": "string",
  "totals": {
    "trench": {
      "count": 15,
      "total_length_m": 381.35,
      "total_volume_m3": 344.0
    },
    "conduit": {
      "count": 8,
      "total_length_m": 298.55
    },
    "vault": {
      "count": 12,
      "total_volume_m3": 34.8
    },
    "area": {
      "count": 5,
      "total_area_m2": 232.26
    }
  },
  "generated_at": "ISO8601"
}
```

---

**Data de Criação**: 2024-01-15  
**Versão**: 1.0  
**Status**: Especificação Final

