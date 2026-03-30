// Modelos relacionados a cálculo de frete (Melhor Envio)

// Dimensões de um produto para cotação
export interface DimensoesProduto {
  pesoGramas: number;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  quantidade: number;
}

// Opção de frete retornada pela API
export interface OpcaoFrete {
  id: number;
  nome: string;            // ex: "PAC", "SEDEX"
  transportadora: string;  // ex: "Correios", "Jadlog"
  prazoDias: number;
  valor: number;
  logo?: string;
}

// Request para cálculo de frete
export interface CalcularFreteRequest {
  cepDestino: string;
  produtos: DimensoesProduto[];
}
