import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CalcularFreteRequest, OpcaoFrete } from '../models/frete.model';

@Injectable({ providedIn: 'root' })
export class MelhorEnvioService {
  // Edge Function do Supabase — mantém o token Melhor Envio no backend
  private readonly edgeFnUrl = '/api/melhorenvio';

  constructor(private readonly http: HttpClient) {}

  /**
   * Calcula as opções de frete disponíveis.
   * O CEP de origem é lido da tabela configuracoes na Edge Function.
   *
   * @param request - CEP destino + dimensões dos produtos
   * @returns Array de opções de frete ordenadas por preço
   */
  async calcularFrete(request: CalcularFreteRequest): Promise<OpcaoFrete[]> {
    const opcoes = await firstValueFrom(
      this.http.post<OpcaoFrete[]>(`${this.edgeFnUrl}/calcular`, {
        cep_destino: request.cepDestino,
        produtos: request.produtos.map(p => ({
          peso: p.pesoGramas / 1000,      // converte gramas → kg
          altura: p.alturaCm,
          largura: p.larguraCm,
          comprimento: p.comprimentoCm,
          quantidade: p.quantidade,
        })),
      })
    );

    // Ordena por preço crescente
    return opcoes.sort((a, b) => a.valor - b.valor);
  }
}
