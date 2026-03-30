// Modelo de Configuração do sistema
export interface Configuracao {
  chave: string;
  valor: string;
  descricao?: string;
}

// Chaves conhecidas do sistema
export type ChaveConfiguracao =
  | 'cep_origem'
  | 'mp_access_token'
  | 'melhorenvio_token'
  | 'sla_padrao_estoque'
  | 'sla_padrao_personalizado'
  | 'loja_nome'
  | 'loja_email';
