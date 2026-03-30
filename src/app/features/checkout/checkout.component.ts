import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { CarrinhoService } from '../../core/services/carrinho.service';
import { PedidoService } from '../../core/services/pedido.service';
import { MelhorEnvioService } from '../../core/services/melhorenvio.service';
import { MercadoPagoService } from '../../core/services/mercadopago.service';
import { ToastService } from '../../shared/components/toast/toast.service';
import { LoadingComponent } from '../../shared/components/loading/loading.component';
import { OpcaoFrete } from '../../core/models/frete.model';
import { ViaCepResponse } from '../../core/models/endereco.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, CurrencyPipe, ReactiveFormsModule, LoadingComponent],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly carrinho = inject(CarrinhoService);
  private readonly pedidoService = inject(PedidoService);
  private readonly melhorEnvio = inject(MelhorEnvioService);
  private readonly mercadoPago = inject(MercadoPagoService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly http = inject(HttpClient);

  readonly itens = this.carrinho.itens;
  readonly valorProdutos = this.carrinho.valorTotal;

  readonly opcoesFreteDisp = signal<OpcaoFrete[]>([]);
  readonly freteEscolhido = signal<OpcaoFrete | null>(null);
  readonly previsaoEntrega = signal<string | null>(null);
  readonly carregandoCep = signal(false);
  readonly carregandoFrete = signal(false);
  readonly processandoPedido = signal(false);

  form!: FormGroup;

  ngOnInit(): void {
    // Redireciona se carrinho vazio
    if (this.carrinho.estaVazio()) {
      this.router.navigate(['/catalogo']);
      return;
    }

    this.form = this.fb.group({
      // Identificação do cliente
      cpf: [''],
      email: ['', [Validators.email]],
      nome: ['', [Validators.required, Validators.minLength(3)]],
      telefone: [''],
      // Endereço
      cep: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
      logradouro: ['', Validators.required],
      numero: ['', Validators.required],
      complemento: [''],
      bairro: ['', Validators.required],
      cidade: ['', Validators.required],
      estado: ['', [Validators.required, Validators.maxLength(2)]],
    });
  }

  /** Busca endereço pelo CEP via ViaCEP */
  async buscarCep(): Promise<void> {
    const cep = this.form.get('cep')?.value?.replace(/\D/g, '');
    if (!cep || cep.length !== 8) return;

    this.carregandoCep.set(true);
    try {
      const resp = await firstValueFrom(
        this.http.get<ViaCepResponse>(`https://viacep.com.br/ws/${cep}/json/`)
      );
      if (resp.erro) {
        this.toast.aviso('CEP não encontrado.');
        return;
      }
      this.form.patchValue({
        logradouro: resp.logradouro,
        bairro: resp.bairro,
        cidade: resp.localidade,
        estado: resp.uf,
        complemento: resp.complemento,
      });

      // Após preencher endereço, calcula frete automaticamente
      await this.calcularFrete(cep);
    } catch {
      this.toast.erro('Erro ao buscar CEP.');
    } finally {
      this.carregandoCep.set(false);
    }
  }

  /** Calcula opções de frete com a Melhor Envio */
  async calcularFrete(cep?: string): Promise<void> {
    const cepDestino = cep ?? this.form.get('cep')?.value?.replace(/\D/g, '');
    if (!cepDestino || cepDestino.length !== 8) return;

    this.carregandoFrete.set(true);
    this.opcoesFreteDisp.set([]);
    this.freteEscolhido.set(null);

    try {
      const produtos = this.itens().map(item => ({
        pesoGramas: item.produto.pesoGramas * item.quantidade,
        alturaCm: item.produto.alturaCm,
        larguraCm: item.produto.larguraCm,
        comprimentoCm: item.produto.comprimentoCm,
        quantidade: item.quantidade,
      }));

      const opcoes = await this.melhorEnvio.calcularFrete({ cepDestino, produtos });
      this.opcoesFreteDisp.set(opcoes);
    } catch {
      this.toast.erro('Não foi possível calcular o frete. Verifique o CEP.');
    } finally {
      this.carregandoFrete.set(false);
    }
  }

  selecionarFrete(opcao: OpcaoFrete): void {
    this.freteEscolhido.set(opcao);
    this.calcularPrevisao(opcao.prazoDias);
  }

  private calcularPrevisao(prazoFrete: number): void {
    // SLA máximo dos itens do carrinho
    const maxSla = this.itens().reduce(
      (max, item) => Math.max(max, item.produto.slaPreparo_dias),
      0
    );
    const data = new Date();
    let diasUteis = 0;
    while (diasUteis < maxSla) {
      data.setDate(data.getDate() + 1);
      const dia = data.getDay();
      if (dia !== 0 && dia !== 6) diasUteis++;
    }
    data.setDate(data.getDate() + prazoFrete);
    this.previsaoEntrega.set(
      data.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })
    );
  }

  get valorTotal(): number {
    return this.valorProdutos() + (this.freteEscolhido()?.valor ?? 0);
  }

  get formularioValido(): boolean {
    const temIdentificacao =
      !!this.form.get('cpf')?.value || !!this.form.get('email')?.value;
    return this.form.valid && temIdentificacao && !!this.freteEscolhido();
  }

  async finalizarCompra(): Promise<void> {
    if (!this.formularioValido) {
      this.toast.aviso('Preencha todos os campos obrigatórios e selecione o frete.');
      return;
    }

    this.processandoPedido.set(true);
    try {
      const f = this.form.value;
      const frete = this.freteEscolhido()!;

      // Identifica ou cria cliente
      const cliente = await this.pedidoService.identificarOuCriarCliente({
        cpf: f.cpf || undefined,
        email: f.email || undefined,
        nome: f.nome,
        telefone: f.telefone || undefined,
      });

      // Cria pedido
      const pedido = await this.pedidoService.criarPedido({
        clienteId: cliente.id,
        enderecoEntrega: {
          cep: f.cep,
          logradouro: f.logradouro,
          numero: f.numero,
          complemento: f.complemento || undefined,
          bairro: f.bairro,
          cidade: f.cidade,
          estado: f.estado,
          principal: false,
        },
        metodoFrete: frete.nome,
        valorFrete: frete.valor,
        prazoFreteDias: frete.prazoDias,
        itens: this.itens().map(item => ({
          produtoId: item.produto.id,
          quantidade: item.quantidade,
          precoUnitario: item.produto.preco,
          personalizacao: item.personalizacao,
        })),
      });

      // Obtém URL de pagamento do Mercado Pago
      const urlPagamento = await this.mercadoPago.criarPreferencia(pedido.id);

      // Limpa carrinho antes de redirecionar
      this.carrinho.limpar();

      // Redireciona para o Checkout Pro do MP
      window.location.href = urlPagamento;
    } catch (err) {
      console.error(err);
      this.toast.erro('Erro ao processar pedido. Tente novamente.');
    } finally {
      this.processandoPedido.set(false);
    }
  }
}
