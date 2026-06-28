/**
 * META GESTÃO — PATCH AUTOMÁTICO v2
 * Adiciona: NUL no relatório + Seleção de vendedor na edição
 * Coloque este arquivo na mesma pasta do painel.html no GitHub
 * A linha <script src="meta-patch.js"></script> já está no painel.html ✅
 */

(function() {
  'use strict';

  const VENDEDORES = ['Alexandre','Arthur','Joziel','Julio','Lucas','Maicon','Paulo','Vagner'];

  // Roda quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    // Observa o DOM para detectar quando modais abrem
    const observer = new MutationObserver(function() {
      tentarInjetarNUL();
      tentarInjetarVendedor();
    });
    observer.observe(document.body, { childList: true, subtree: true });

    // Tenta já na inicialização
    tentarInjetarNUL();
    tentarInjetarVendedor();

    // Intercepta o Firebase para salvar NUL e vendedor junto
    aguardarFirebaseEInterceptar();
  }

  // ══════════════════════════════════════════
  // INJEÇÃO 1: Campo NUL após CBT no relatório
  // ══════════════════════════════════════════
  function tentarInjetarNUL() {
    if (document.getElementById('rel_nul')) return; // já existe

    const campoCBT = document.getElementById('rel_cbt');
    if (!campoCBT) return;

    // Sobe na hierarquia até encontrar o wrapper do campo CBT
    let wrapper = campoCBT.parentElement;
    while (wrapper && !wrapper.querySelector('label')) {
      wrapper = wrapper.parentElement;
    }
    if (!wrapper) wrapper = campoCBT.parentElement;

    // Clona o estilo do wrapper do CBT
    const divNUL = document.createElement('div');
    divNUL.className = wrapper.className || '';
    divNUL.style.marginTop = '8px';

    // Pega o estilo do input CBT para copiar
    const estiloInput = window.getComputedStyle(campoCBT);

    divNUL.innerHTML = `
      <label style="font-size:13px;font-weight:600;color:#555;display:block;margin-bottom:4px;">
        NUL — Nitrogênio Ureico do Leite (mg/dL)
      </label>
      <input
        type="number"
        id="rel_nul"
        step="0.1" min="0" max="50"
        placeholder="Ref: 10–16"
        style="width:100%;padding:7px 10px;border:1px solid #ccc;border-radius:5px;
               font-size:13px;box-sizing:border-box;"
      >
      <span style="font-size:11px;color:#999;">
        Ref: 10–16 mg/dL &nbsp;|&nbsp; &lt;10 = defic. proteica &nbsp;|&nbsp; &gt;16 = excesso PDR
      </span>
    `;

    // Insere logo depois do wrapper do CBT
    wrapper.parentNode.insertBefore(divNUL, wrapper.nextSibling);
    console.log('[META PATCH] ✅ Campo NUL injetado após CBT');
  }

  // ══════════════════════════════════════════
  // INJEÇÃO 2: Select de vendedor na aba Editar
  // ══════════════════════════════════════════
  function tentarInjetarVendedor() {
    if (document.getElementById('select_vendedor_patch')) return;

    // Procura o campo de vendedor existente (input ou qualquer coisa com "vendedor")
    let campoVendedor = document.getElementById('edit_vendedor') ||
                        document.querySelector('[id*="vendedor"]') ||
                        document.querySelector('[name*="vendedor"]');

    // Tenta achar pelo placeholder ou label
    if (!campoVendedor) {
      const inputs = document.querySelectorAll('input,select');
      for (const inp of inputs) {
        const label = inp.previousElementSibling || inp.closest('div')?.querySelector('label');
        if (label && label.textContent.toLowerCase().includes('vendedor')) {
          campoVendedor = inp;
          break;
        }
      }
    }

    // Se não achou campo de vendedor, procura local para inserir
    // (após o campo de status ou rebanho na aba de edição)
    const campoAncora = document.getElementById('edit_status') ||
                        document.getElementById('edit_rebanho') ||
                        document.getElementById('edit_vacas') ||
                        document.getElementById('edit_litros') ||
                        document.getElementById('edit_municipio');

    if (!campoAncora && !campoVendedor) return;

    const ancora = campoVendedor || campoAncora;
    let wrapper = ancora.parentElement;
    while (wrapper && !wrapper.querySelector('label') && wrapper !== document.body) {
      wrapper = wrapper.parentElement;
    }
    if (!wrapper || wrapper === document.body) wrapper = ancora.parentElement;

    // Monta as options
    const options = VENDEDORES.map(v =>
      `<option value="${v}">${v}</option>`
    ).join('');

    const divSelect = document.createElement('div');
    divSelect.className = wrapper.className || '';
    divSelect.style.marginTop = '10px';
    divSelect.innerHTML = `
      <label style="font-size:13px;font-weight:600;color:#555;display:block;margin-bottom:4px;">
        👤 Vendedor Responsável
      </label>
      <select id="select_vendedor_patch"
        style="width:100%;padding:8px 10px;border:1px solid #ccc;border-radius:5px;
               font-size:13px;background:#fff;box-sizing:border-box;cursor:pointer;">
        <option value="">— Selecionar Vendedor —</option>
        ${options}
      </select>
    `;

    // Se já existia um campo de vendedor original, sincroniza
    if (campoVendedor) {
      // Pré-carrega o valor atual
      setTimeout(function() {
        const sel = document.getElementById('select_vendedor_patch');
        if (sel) sel.value = campoVendedor.value || '';
      }, 100);

      // Ao mudar o patch, atualiza o original
      divSelect.addEventListener('change', function(e) {
        if (e.target.id === 'select_vendedor_patch') {
          campoVendedor.value = e.target.value;
          campoVendedor.dispatchEvent(new Event('input', { bubbles: true }));
          campoVendedor.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });

      // Esconde o campo original (mantém para o código existente funcionar)
      campoVendedor.style.display = 'none';
      if (wrapper.querySelector('label')) {
        wrapper.querySelector('label').style.display = 'none';
      }
      wrapper.appendChild(divSelect);
    } else {
      // Insere depois do wrapper âncora
      wrapper.parentNode.insertBefore(divSelect, wrapper.nextSibling);
    }

    console.log('[META PATCH] ✅ Select de vendedor injetado');
  }

  // ══════════════════════════════════════════
  // INTERCEPTAÇÃO DO FIREBASE
  // Garante que NUL e vendedor sejam salvos
  // ══════════════════════════════════════════
  function aguardarFirebaseEInterceptar() {
    let tentativas = 0;
    const intervalo = setInterval(function() {
      tentativas++;
      if (tentativas > 30) { clearInterval(intervalo); return; }

      // Tenta encontrar a função global de salvar relatório
      if (typeof window.salvarRelatorioVisita === 'function') {
        const original = window.salvarRelatorioVisita;
        window.salvarRelatorioVisita = function() {
          injetarNULnosArgumentos();
          return original.apply(this, arguments);
        };
        console.log('[META PATCH] ✅ salvarRelatorioVisita interceptada');
        clearInterval(intervalo);
      }
    }, 500);

    // Intercepta a função de salvar edição separadamente
    let tentativas2 = 0;
    const intervalo2 = setInterval(function() {
      tentativas2++;
      if (tentativas2 > 30) { clearInterval(intervalo2); return; }

      if (typeof window.salvarEdicaoAdmin === 'function') {
        const originalEdicao = window.salvarEdicaoAdmin;
        window.salvarEdicaoAdmin = function() {
          sincronizarVendedorAntesDeSalvar();
          return originalEdicao.apply(this, arguments);
        };
        console.log('[META PATCH] ✅ salvarEdicaoAdmin interceptada');
        clearInterval(intervalo2);
      }
    }, 500);

    // Fallback: intercepta cliques em botões de salvar
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('button');
      if (!btn) return;
      const txt = (btn.textContent || '').toLowerCase();
      const id  = (btn.id || '').toLowerCase();
      const oc  = (btn.getAttribute('onclick') || '').toLowerCase();

      if (txt.includes('salvar') || id.includes('salvar') || oc.includes('salvar')) {
        injetarNULnosArgumentos();
        sincronizarVendedorAntesDeSalvar();
      }
    }, true);
  }

  function injetarNULnosArgumentos() {
    const campo = document.getElementById('rel_nul');
    if (!campo) return;
    // Garante que o valor seja acessível globalmente
    window._metaPatchNUL = campo.value;

    // Tenta também preencher qualquer campo hidden com nome rel_nul
    let hidden = document.getElementById('rel_nul_hidden');
    if (!hidden) {
      hidden = document.createElement('input');
      hidden.type = 'hidden';
      hidden.id   = 'rel_nul_hidden';
      hidden.name = 'rel_nul';
      document.body.appendChild(hidden);
    }
    hidden.value = campo.value;
  }

  function sincronizarVendedorAntesDeSalvar() {
    const patch = document.getElementById('select_vendedor_patch');
    if (!patch || !patch.value) return;

    // Tenta sincronizar com o campo original
    const original = document.getElementById('edit_vendedor') ||
                     document.querySelector('[id*="vendedor"]');
    if (original) {
      original.value = patch.value;
      original.dispatchEvent(new Event('change', { bubbles: true }));
    }
    window._metaPatchVendedor = patch.value;
  }

  // ══════════════════════════════════════════
  // API PÚBLICA — para uso pelo código existente
  // ══════════════════════════════════════════
  // Chame window.patchGetNUL() na função de salvar relatório
  window.patchGetNUL = function() {
    const c = document.getElementById('rel_nul');
    return c ? (parseFloat(c.value) || null) : null;
  };

  // Chame window.patchGetVendedor() na função de salvar edição
  window.patchGetVendedor = function() {
    const s = document.getElementById('select_vendedor_patch');
    return s ? s.value : '';
  };

  // Chame window.patchSetNUL(valor) ao abrir um relatório existente
  window.patchSetNUL = function(valor) {
    const c = document.getElementById('rel_nul');
    if (c) c.value = valor || '';
  };

  // Chame window.patchSetVendedor(nome) ao abrir a edição
  window.patchSetVendedor = function(nome) {
    const s = document.getElementById('select_vendedor_patch');
    const o = document.getElementById('edit_vendedor');
    if (s) s.value = nome || '';
    if (o) o.value = nome || '';
  };

  console.log('[META PATCH v2] 🚀 Script carregado — aguardando abertura dos formulários...');

})();
