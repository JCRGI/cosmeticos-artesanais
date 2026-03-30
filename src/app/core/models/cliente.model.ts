// Modelo de Cliente
// Clientes são identificados por CPF ou e-mail — sem login obrigatório
export interface Cliente {
  id: string;
  cpf?: string;
  email?: string;
  nome: string;
  telefone?: string;
  temSenha: boolean;
  createdAt: string;
}

// DTO para identificação ou criação de cliente no checkout
export interface ClienteForm {
  cpf?: string;
  email?: string;
  nome: string;
  telefone?: string;
}

// DTO para definição de senha opcional após compra
export interface DefinirSenhaForm {
  clienteId: string;
  senha: string;
  confirmacaoSenha: string;
}
