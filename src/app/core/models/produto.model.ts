// Modelo de Produto
export type TipoProduto = 'estoque' | 'personalizado';

export interface Produto {
  id: string;
  nome: string;
  descricao: string;
  tipo: TipoProduto;
  preco: number;
  imagens: string[];
  ativo: boolean;
  estoqueQuantidade?: number;   // apenas para tipo 'estoque'
  slaPreparo_dias: number;
  pesoGramas: number;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
  createdAt: string;
  updatedAt: string;
}

// DTO para criação/edição de produto (sem campos gerados pelo banco)
export interface ProdutoForm {
  nome: string;
  descricao: string;
  tipo: TipoProduto;
  preco: number;
  imagens: string[];
  ativo: boolean;
  estoqueQuantidade?: number;
  slaPreparoDias: number;
  pesoGramas: number;
  alturaCm: number;
  larguraCm: number;
  comprimentoCm: number;
}

// Item do carrinho de compras
export interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  personalizacao?: Record<string, string>;
}
