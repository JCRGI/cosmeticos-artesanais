import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProdutoService } from '../../core/services/produto.service';
import { CarrinhoService } from '../../core/services/carrinho.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { Produto } from '../../core/models/produto.model';

@Component({
  selector: 'app-produto-detalhe',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, RouterLink, FormsModule, LoadingComponent],
  templateUrl: './produto-detalhe.component.html',
})
export class ProdutoDetalheComponent implements OnInit {
  private readonly produtoService = inject(ProdutoService);
  private readonly carrinho = inject(CarrinhoService);
  private readonly toast = inject(ToastService);
  private readonly route = inject(ActivatedRoute);

  readonly produto = signal<Produto | null>(null);
  readonly carregando = signal(true);
  readonly imagemAtiva = signal(0);

  quantidade = 1;
  // Campos de personalização (para produtos personalizados)
  personalizacao: Record<string, string> = {};

  // Campos configuráveis de personalização
  readonly camposPersonalizacao = [
    { chave: 'tipo_pele', label: 'Tipo de Pele', opcoes: ['Normal', 'Seca', 'Oleosa', 'Mista', 'Sensível'] },
    { chave: 'fragrancia', label: 'Fragrância', opcoes: ['Sem fragrância', 'Lavanda', 'Rosa', 'Baunilha', 'Cítrico'] },
    { chave: 'concentracao', label: 'Concentração', opcoes: ['Suave', 'Moderada', 'Intensa'] },
    { chave: 'observacoes', label: 'Observações adicionais', opcoes: [] },
  ];

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    try {
      const produto = await this.produtoService.buscarPorId(id);
      this.produto.set(produto);
    } catch {
      this.toast.erro('Erro ao carregar produto.');
    } finally {
      this.carregando.set(false);
    }
  }

  selecionarImagem(indice: number): void {
    this.imagemAtiva.set(indice);
  }

  adicionarAoCarrinho(): void {
    const p = this.produto();
    if (!p) return;

    const personalizacaoFinal =
      p.tipo === 'personalizado' && Object.keys(this.personalizacao).length > 0
        ? { ...this.personalizacao }
        : undefined;

    this.carrinho.adicionar(p, this.quantidade, personalizacaoFinal);
    this.toast.sucesso(`"${p.nome}" adicionado ao carrinho!`);
  }

  podeAdicionarAoCarrinho(): boolean {
    const p = this.produto();
    if (!p) return false;
    if (p.tipo === 'estoque') return (p.estoqueQuantidade ?? 0) > 0;
    // Para personalizado, verifica se os campos obrigatórios foram preenchidos
    return this.camposPersonalizacao
      .filter(c => c.opcoes.length > 0) // campos com select são obrigatórios
      .every(c => !!this.personalizacao[c.chave]);
  }
}
