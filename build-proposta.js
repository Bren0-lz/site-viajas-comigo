const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak
} = require("docx");

const GOLD = "8A6D2A";
const GOLD_LT = "F3ECD9";
const CHAR = "1A1A1A";
const GREY = "666660";
const LINE = "CFC6AD";

const PAGE_W = 11906, MARGIN = 1440;
const CONTENT = PAGE_W - 2 * MARGIN; // 9026

const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun(t)] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(t)] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun(t)] });
const R = (t, o = {}) => new TextRun({ text: t, ...o });
const P = (t, opts = {}) => new Paragraph({ spacing: { after: 130, line: 272 }, children: Array.isArray(t) ? t : [new TextRun({ text: t, ...opts })] });
const bullet = (runs) => new Paragraph({ numbering: { reference: "b", level: 0 }, spacing: { after: 60, line: 268 }, children: Array.isArray(runs) ? runs : [new TextRun(runs)] });

const border = { style: BorderStyle.SINGLE, size: 1, color: LINE };
const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };

function cell(content, { w, head = false, shade = null, align = AlignmentType.LEFT } = {}) {
  const runs = Array.isArray(content) ? content : [new TextRun({ text: content, bold: head, color: head ? "FFFFFF" : CHAR, size: 20 })];
  return new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: { fill: head ? GOLD : (shade || "FFFFFF"), type: ShadingType.CLEAR },
    margins: { top: 90, bottom: 90, left: 130, right: 130 },
    children: [new Paragraph({ alignment: align, children: runs })],
  });
}
function rule() {
  return new Paragraph({ spacing: { after: 150 }, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: GOLD, space: 1 } }, children: [new TextRun("")] });
}
function costTable(rows) {
  return new Table({
    width: { size: CONTENT, type: WidthType.DXA }, columnWidths: [3400, 5626], borders,
    rows: [
      new TableRow({ tableHeader: true, children: [cell("Item", { w: 3400, head: true }), cell("Quanto custa (aproximado)", { w: 5626, head: true })] }),
      ...rows.map(([a, b, bold]) => new TableRow({ children: [
        cell([R(a, { bold: !!bold })], { w: 3400, shade: GOLD_LT }),
        cell(Array.isArray(b) ? b : [R(b, { bold: !!bold })], { w: 5626 }),
      ]})),
    ],
  });
}

const kids = [];

// CAPA
kids.push(new Paragraph({ spacing: { before: 1800 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "✦", color: GOLD, size: 64 })] }));
kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 120 }, children: [new TextRun({ text: "VIAJAS COMIGO", bold: true, size: 56, color: CHAR })] }));
kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "VIAGENS EM GRUPO", color: GOLD, size: 22, characterSpacing: 60 })] }));
kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 700 }, children: [new TextRun({ text: "Proposta de Site", bold: true, size: 40, color: GOLD })] }));
kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 }, children: [new TextRun({ text: "Três opções — da mais simples à mais completa", italics: true, size: 26, color: GREY })] }));
kids.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 1100 }, children: [new TextRun({ text: "Preparado por Breno  ·  Junho de 2026", size: 22, color: GREY })] }));
kids.push(new Paragraph({ children: [new PageBreak()] }));

// VISÃO GERAL
kids.push(H1("A ideia"));
kids.push(rule());
kids.push(P("A Viajas Comigo já tem força no Instagram (@viajascomigo). O site não vem substituir isso — vem ser o lugar profissional para onde os seguidores vão quando querem ver as próximas viagens e entrar em contato."));
kids.push(P([R("São ", {}), R("três versões do mesmo site", { bold: true }), R(", da mais barata à mais completa. O detalhe importante: as três foram pensadas como ", {}), R("um único projeto que cresce com o tempo.", { bold: true, color: GOLD }), R(" Começando pela versão simples, tudo já funciona — e, quando fizer sentido, dá pra subir de nível aproveitando o mesmo trabalho, sem começar do zero.", {})]));
kids.push(P([R("Na prática: a aparência e as seções do site continuam as mesmas em todos os níveis. O que muda é o que ele consegue fazer por trás. Por isso a opção escolhida hoje nunca é dinheiro perdido — é a base da próxima.", {}), ], { }));

// TIER 1
kids.push(H1("Opção 1 — Simples e econômica"));
kids.push(rule());
kids.push(P([R("Uma página única, bonita e rápida, feita pra ", {}), R("mostrar as viagens e levar a pessoa direto pro WhatsApp e Instagram", { bold: true }), R(". É a versão que já está pronta junto desta proposta.", {})]));
kids.push(H3("O que ela tem"));
kids.push(bullet("Página com abertura de impacto, “como funciona”, vitrine das próximas viagens, vantagens de viajar em grupo, depoimentos e chamada final."));
kids.push(bullet("Cada viagem aparece como um cartão com foto, datas, preço, vagas e um botão que já abre o WhatsApp com a mensagem pronta."));
kids.push(bullet("Botão de WhatsApp sempre à mão e link direto pro Instagram."));
kids.push(bullet("Fica perfeita no celular, que é de onde vem o público dela."));
kids.push(bullet([R("A tia gerencia as viagens sozinha, ", { bold: true }), R("por um painel simples — adiciona, edita e remove sem mexer em nada técnico e sem depender de ninguém.", {})]));
kids.push(H3("Quanto custa"));
kids.push(costTable([
  ["Criação do site (seu trabalho)", [R("R$ 400 a R$ 700", { bold: true }), R(" — pagamento único", { color: GREY })]],
  ["Colocar no ar", "Gratuito"],
  ["Endereço na internet", "viajascomigo.com.br — R$ 40 por ano"],
  ["Gerenciar as viagens", "Já incluso — R$ 0"],
  ["Manutenção (opcional)", "R$ 30 a R$ 80 por mês, só se ela quiser ter você por perto pra ajustes"],
  ["Total pra começar", [R("R$ 400 a R$ 700 uma vez + R$ 40 por ano", { bold: true })], true],
]));
kids.push(P(""));
kids.push(P("Resumindo: é quase de graça pra manter e cobre praticamente tudo que a Viajas Comigo precisa hoje. O contato continua pelo WhatsApp e Instagram, do jeito que ela já trabalha.", { italics: true, color: GREY }));
kids.push(new Paragraph({ children: [new PageBreak()] }));

// TIER 2
kids.push(H1("Opção 2 — Mais recursos"));
kids.push(rule());
kids.push(P([R("O mesmo site, agora com um ", {}), R("painel online de verdade", { bold: true }), R(": a tia gerencia as viagens pelo próprio celular, de qualquer lugar, e a mudança vai pro ar na hora. Bom para quando o número de viagens cresce.", {})]));
kids.push(H3("O que ganha além da Opção 1"));
kids.push(bullet([R("Painel online com senha: ", { bold: true }), R("edita viagens e fotos pelo celular, sem precisar de computador.")]));
kids.push(bullet([R("Página própria para cada viagem: ", { bold: true }), R("roteiro completo, galeria de fotos, o que está incluso e contador de vagas.")]));
kids.push(bullet([R("Formulário de interesse: ", { bold: true }), R("a pessoa preenche e a tia recebe o contato organizado, sem perder ninguém.")]));
kids.push(bullet([R("Espaço de viagens passadas e dicas: ", { bold: true }), R("ajuda o site a aparecer melhor no Google e dá conteúdo pra repostar no Instagram.")]));
kids.push(H3("Quanto custa"));
kids.push(costTable([
  ["Criação do site (seu trabalho)", [R("R$ 1.200 a R$ 2.500", { bold: true }), R(" — pagamento único", { color: GREY })]],
  ["Colocar no ar + painel", "Gratuito no começo; pode ter custo se o movimento ficar grande"],
  ["Endereço na internet", "R$ 40 por ano"],
  ["Manutenção (opcional)", "R$ 30 a R$ 80 por mês"],
  ["Total pra começar", [R("R$ 1.200 a R$ 2.500 uma vez + ~R$ 40 por ano", { bold: true })], true],
]));
kids.push(P(""));
kids.push(P([R("Aproveita 100% do visual e das seções da Opção 1. ", { bold: true, color: GOLD }), R("O trabalho extra é ligar o site ao painel online e criar as páginas de viagem — o mesmo projeto, melhorado.", {})]));
kids.push(new Paragraph({ children: [new PageBreak()] }));

// TIER 3
kids.push(H1("Opção 3 — Completa, com reservas e pagamento"));
kids.push(rule());
kids.push(P([R("A versão mais robusta: a pessoa ", {}), R("escolhe a viagem, reserva a vaga e paga o sinal pelo site", { bold: true }), R(" (Pix ou cartão). A tia acompanha tudo por um painel de controle. Indicada quando atender tudo no WhatsApp começa a dar trabalho demais.", {})]));
kids.push(H3("O que ganha além da Opção 2"));
kids.push(bullet([R("Reserva de vaga pelo site: ", { bold: true }), R("o contador de vagas se atualiza sozinho e fecha quando esgota.")]));
kids.push(bullet([R("Pagamento online: ", { bold: true }), R("sinal ou parcela por Pix e cartão, com confirmação automática.")]));
kids.push(bullet([R("Área do cliente: ", { bold: true }), R("cada viajante vê suas viagens, comprovantes e parcelas.")]));
kids.push(bullet([R("Painel completo pra tia: ", { bold: true }), R("lista de inscritos por viagem, controle de pagamentos e relatórios.")]));
kids.push(bullet([R("Avisos automáticos: ", { bold: true }), R("confirmação, lembrete de parcela e contagem regressiva da viagem.")]));
kids.push(H3("Quanto custa"));
kids.push(costTable([
  ["Criação do site (seu trabalho)", [R("R$ 3.500 a R$ 6.000", { bold: true }), R(" — pagamento único", { color: GREY })]],
  ["Funcionamento do sistema", "R$ 50 a R$ 250 por mês, conforme o uso"],
  ["Receber pagamentos", "Sem mensalidade; cobra um percentual por venda (Pix em torno de 1%, cartão em torno de 4–5%)"],
  ["Endereço na internet", "R$ 40 por ano"],
  ["Manutenção (opcional)", "R$ 30 a R$ 80 por mês"],
  ["Total pra começar", [R("R$ 3.500 a R$ 6.000 uma vez + custos mensais", { bold: true })], true],
]));
kids.push(P(""));
kids.push(P([R("Parte do que já existe na Opção 2 ", { bold: true, color: GOLD }), R("e acrescenta reserva e pagamento. De novo: evolução, não recomeço.", {})]));
kids.push(new Paragraph({ children: [new PageBreak()] }));

// COMPARATIVO
kids.push(H1("Comparando as três"));
kids.push(rule());
const cmpW = [3026, 2000, 2000, 2000];
function cmpRow(label, a, b, c, head = false) {
  return new TableRow({ tableHeader: head, children: [
    cell(label, { w: cmpW[0], head, shade: head ? null : GOLD_LT }),
    cell(a, { w: cmpW[1], head, align: AlignmentType.CENTER }),
    cell(b, { w: cmpW[2], head, align: AlignmentType.CENTER }),
    cell(c, { w: cmpW[3], head, align: AlignmentType.CENTER }),
  ]});
}
kids.push(new Table({ width: { size: CONTENT, type: WidthType.DXA }, columnWidths: cmpW, borders, rows: [
  cmpRow("Recurso", "Opção 1", "Opção 2", "Opção 3", true),
  cmpRow("Vitrine de viagens", "Sim", "Sim", "Sim"),
  cmpRow("Visual preto e dourado", "Sim", "Sim", "Sim"),
  cmpRow("Contato por WhatsApp", "Sim", "Sim", "Sim"),
  cmpRow("Editar viagens sozinha", "Sim", "Sim (online)", "Sim (online)"),
  cmpRow("Página por viagem", "—", "Sim", "Sim"),
  cmpRow("Formulário de contato", "—", "Sim", "Sim"),
  cmpRow("Reserva pelo site", "—", "—", "Sim"),
  cmpRow("Pagamento online", "—", "—", "Sim"),
  cmpRow("Área do cliente", "—", "—", "Sim"),
  cmpRow("Criação (uma vez)", "R$400–700", "R$1.200–2.500", "R$3.500–6.000"),
  cmpRow("Custo pra manter", "~R$40/ano", "~R$40/ano", "R$50–250/mês +taxas"),
]}));
kids.push(P(""));
kids.push(P("Valores aproximados de junho/2026, em reais — servem como referência, não como orçamento fechado. A manutenção mensal é sempre opcional. O endereço .com.br é R$ 40/ano fixo no Registro.br.", { italics: true, color: GREY, size: 18 }));

// RECOMENDAÇÃO
kids.push(H1("Sugestão"));
kids.push(rule());
kids.push(P([R("Pra começar, a ", {}), R("Opção 1 é a escolha certa", { bold: true, color: GOLD }), R(": custo baixíssimo pra manter, fica pronta rápido e já deixa a Viajas Comigo com cara profissional. Dá pra ver na prática quanto o site gera contato antes de investir mais.", {})]));
kids.push(P("Quando a procura crescer — mais viagens, vontade de gerenciar tudo pelo celular ou de organizar os contatos — sobe pra Opção 2. E se virar um fluxo constante de inscrições e pagamentos, a Opção 3 automatiza o que hoje é feito na mão."));
kids.push(H3("Primeiros passos"));
kids.push(new Paragraph({ numbering: { reference: "n", level: 0 }, spacing: { after: 60 }, children: [R("Mostrar pra tia a página já pronta e ajustar textos, fotos e cores ao gosto dela.")] }));
kids.push(new Paragraph({ numbering: { reference: "n", level: 0 }, spacing: { after: 60 }, children: [R("Colocar o WhatsApp e o Instagram reais.")] }));
kids.push(new Paragraph({ numbering: { reference: "n", level: 0 }, spacing: { after: 60 }, children: [R("Registrar o endereço viajascomigo.com.br (R$ 40/ano) e publicar de graça.")] }));
kids.push(new Paragraph({ numbering: { reference: "n", level: 0 }, spacing: { after: 60 }, children: [R("Usar por algumas semanas e decidir, com calma, se vale subir pra Opção 2.")] }));

const doc = new Document({
  creator: "Breno",
  title: "Proposta de Site — Viajas Comigo",
  styles: {
    default: { document: { run: { font: "Calibri", size: 22, color: CHAR } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 34, bold: true, font: "Calibri", color: CHAR }, paragraph: { spacing: { before: 240, after: 60 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 26, bold: true, font: "Calibri", color: GOLD }, paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true, run: { size: 23, bold: true, font: "Calibri", color: CHAR }, paragraph: { spacing: { before: 150, after: 60 }, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [
    { reference: "b", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 260 } } } }] },
    { reference: "n", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 260 } } } }] },
  ]},
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: MARGIN, right: MARGIN, bottom: MARGIN, left: MARGIN } } },
    children: kids,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("/sessions/sharp-elegant-ritchie/mnt/outputs/viajas-comigo/Proposta-Viajas-Comigo.docx", buf);
  console.log("OK proposta atualizada");
});
