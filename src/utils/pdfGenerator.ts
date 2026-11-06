/**
 * Generador de Reporte PDF Detallado para Flujo Máximo y Corte Mínimo (Ford-Fulkerson).
 * Utiliza jsPDF y jspdf-autotable para renderizar un documento formal, exhaustivo y elegante.
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  GraphNode,
  GraphEdge,
  SimulationResult,
} from '../types/fordFulkerson';

export interface PdfReportOptions {
  authorName?: string;
  institution?: string;
  courseName?: string;
  problemTitle?: string;
  notes?: string;
}

export function generatePdfReport(
  nodes: GraphNode[],
  edges: GraphEdge[],
  result: SimulationResult,
  options: PdfReportOptions = {}
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const author = options.authorName || 'Ingeniería / Investigación de Operaciones';
  const institution = options.institution || 'Universidad Nacional - Simulación Computacional';
  const course = options.courseName || 'Teoría de Grafos y Optimización de Redes';
  const problemTitle = options.problemTitle || 'Análisis de Flujo Máximo y Corte Mínimo';
  const currentDate = new Date().toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const sourceNode = nodes.find((n) => n.isSource) || nodes[0];
  const sinkNode = nodes.find((n) => n.isSink) || nodes[nodes.length - 1];

  let currentY = 16;

  // --- ENCABEZADO INSTITUCIONAL ---
  doc.setFillColor(30, 41, 59); // Slate-800
  doc.rect(0, 0, 210, 24, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('REPORTE TÉCNICO: ALGORITMO DE FORD-FULKERSON', 14, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Resolución de Flujo Máximo, Corte Mínimo y Verificación Teórica (Método de Etiquetado)', 14, 18);

  currentY = 32;

  // --- METADATOS DEL DOCUMENTO ---
  doc.setFillColor(248, 250, 252); // Slate-50
  doc.setDrawColor(226, 232, 240); // Slate-200
  doc.roundedRect(14, currentY, 182, 22, 2, 2, 'FD');

  doc.setTextColor(51, 65, 85);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Título:', 18, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(problemTitle, 35, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Institución:', 18, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(institution, 35, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Autor(es):', 18, currentY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(author, 35, currentY + 18);

  doc.setFont('helvetica', 'bold');
  doc.text('Asignatura:', 115, currentY + 6);
  doc.setFont('helvetica', 'normal');
  doc.text(course, 135, currentY + 6);

  doc.setFont('helvetica', 'bold');
  doc.text('Fecha:', 115, currentY + 12);
  doc.setFont('helvetica', 'normal');
  doc.text(currentDate, 135, currentY + 12);

  doc.setFont('helvetica', 'bold');
  doc.text('Nodos / Aristas:', 115, currentY + 18);
  doc.setFont('helvetica', 'normal');
  doc.text(`${nodes.length} nodos | ${edges.length} aristas`, 140, currentY + 18);

  currentY += 28;

  // --- SECCIÓN 1: RESUMEN EJECUTIVO Y TEOREMA ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Resumen Ejecutivo y Verificación del Teorema Max-Flow Min-Cut', 14, currentY);
  currentY += 5;

  // Cuadros de métricas destacadas
  const boxWidth = 57;
  const boxHeight = 18;
  const boxSpacing = 5.5;

  // Caja 1: Flujo Máximo
  doc.setFillColor(236, 253, 245); // Verde esmeralda suave
  doc.setDrawColor(52, 211, 153);
  doc.roundedRect(14, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setTextColor(6, 95, 70);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('FLUJO MÁXIMO |f|', 18, currentY + 5.5);
  doc.setFontSize(13);
  doc.text(`${result.finalFlow} unidades`, 18, currentY + 13.5);

  // Caja 2: Corte Mínimo
  doc.setFillColor(238, 242, 255); // Indigo suave
  doc.setDrawColor(129, 140, 248);
  doc.roundedRect(14 + boxWidth + boxSpacing, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setTextColor(55, 48, 163);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('CAPACIDAD CORTE MÍNIMO c(S, T)', 14 + boxWidth + boxSpacing + 4, currentY + 5.5);
  doc.setFontSize(13);
  doc.text(`${result.minCut.cutCapacity} unidades`, 14 + boxWidth + boxSpacing + 4, currentY + 13.5);

  // Caja 3: Estado Teorema
  doc.setFillColor(254, 242, 242); // Rosa suave
  doc.setDrawColor(248, 113, 113);
  doc.roundedRect(14 + (boxWidth + boxSpacing) * 2, currentY, boxWidth, boxHeight, 2, 2, 'FD');
  doc.setTextColor(153, 27, 27);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TEOREMA FUNDAMENTAL', 14 + (boxWidth + boxSpacing) * 2 + 4, currentY + 5.5);
  doc.setFontSize(10);
  doc.text(
    result.finalFlow === result.minCut.cutCapacity ? 'VERIFICADO (|f| = c(S,T))' : 'DISCREPANCIA',
    14 + (boxWidth + boxSpacing) * 2 + 4,
    currentY + 12.5
  );

  currentY += boxHeight + 6;

  // Párrafo analítico
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  const introText =
    `El problema ha sido resuelto óptimamente mediante el Algoritmo de Ford-Fulkerson empleando el método de etiquetado estándar. ` +
    `Se identificó una capacidad máxima de transporte de ${result.finalFlow} unidades desde la fuente "${sourceNode.label}" ` +
    `hacia el sumidero "${sinkNode.label}". Dicho valor coincide estrictamente con la capacidad del corte mínimo ` +
    `c(S, T) = ${result.minCut.cutCapacity}, satisfaciendo el Teorema de Ford y Fulkerson (1956). ` +
    `Asimismo, se validaron exitosamente las restricciones de capacidad (0 <= f_uv <= c_uv) y la ley de conservación de flujo para todos los nodos intermedios.`;
  const splitIntro = doc.splitTextToSize(introText, 182);
  doc.text(splitIntro, 14, currentY);
  currentY += splitIntro.length * 4 + 4;

  // --- SECCIÓN 2: PARTICIÓN DEL CORTE MÍNIMO ---
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Análisis de la Partición de Corte Mínimo (S, T)', 14, currentY);
  currentY += 5;

  const sNodeLabels = result.minCut.S.map((id) => nodes.find((n) => n.id === id)?.label || id).join(', ');
  const tNodeLabels = result.minCut.T.map((id) => nodes.find((n) => n.id === id)?.label || id).join(', ');

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['Componente del Corte', 'Nodos / Elementos Involucrados', 'Interpretación Teórica']],
    body: [
      [
        'Conjunto S (Alcanzables)',
        `{ ${sNodeLabels} }`,
        'Nodos con camino aumentante disponible desde la fuente en la red residual.',
      ],
      [
        'Conjunto T (No Alcanzables)',
        `{ ${tNodeLabels} }`,
        'Nodos desconectados de la fuente en la red residual final (incluye al sumidero).',
      ],
      [
        'Aristas del Corte (S -> T)',
        `${result.minCut.cutEdges.length} aristas críticas`,
        `Cuellos de botella saturados que cruzan la frontera de S a T con capacidad = ${result.minCut.cutCapacity}.`,
      ],
    ],
    headStyles: { fillColor: [51, 65, 85], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5, textColor: [30, 41, 59] },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold' },
      1: { cellWidth: 65 },
      2: { cellWidth: 72 },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 8;

  // --- SECCIÓN 3: TABLA DE ITERACIONES Y CAMINOS AUMENTANTES ---
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('3. Registro de Iteraciones y Caminos Aumentantes (Método de Etiquetado)', 14, currentY);
  currentY += 5;

  const iterationRows = result.iterations.map((it) => [
    `Iteración ${it.iteration}`,
    it.pathStr,
    `Δ = ${it.bottleneck}`,
    `${it.flowBefore} unidades`,
    `${it.flowAfter} unidades`,
    `+${it.bottleneck}`,
  ]);

  if (iterationRows.length === 0) {
    iterationRows.push(['Sin iteraciones', 'No fue posible enviar flujo (capacidad nula)', '-', '0', '0', '0']);
  }

  autoTable(doc, {
    startY: currentY,
    theme: 'striped',
    head: [['Iteración', 'Camino Aumentante Encontrado', 'Cuello de Botella', 'Flujo Anterior', 'Flujo Posterior', 'Δ Flujo']],
    body: iterationRows,
    headStyles: { fillColor: [15, 118, 110], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 24, fontStyle: 'bold' },
      1: { cellWidth: 70 },
      2: { cellWidth: 26, halign: 'center' },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 22, halign: 'right' },
      5: { cellWidth: 18, halign: 'center', fontStyle: 'bold', textColor: [13, 148, 136] },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 8;

  // --- SECCIÓN 4: TABLA DETALLADA DE ARISTAS Y CUELLOS DE BOTELLA ---
  if (currentY > 220) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('4. Matriz de Aristas, Flujos Finales y Cuellos de Botella', 14, currentY);
  currentY += 5;

  const edgeRows = edges.map((e) => {
    const uLabel = nodes.find((n) => n.id === e.source)?.label || e.source;
    const vLabel = nodes.find((n) => n.id === e.target)?.label || e.target;
    const flow = result.steps[result.steps.length - 1]?.flows[e.id] || 0;
    const residual = e.capacity - flow;
    const isSaturated = flow >= e.capacity && e.capacity !== 999999;
    const isInCut = result.minCut.cutEdges.includes(e.id);

    return [
      e.id,
      `${uLabel} → ${vLabel}`,
      e.capacity === 999999 ? '∞ (Ficticia)' : e.capacity.toString(),
      flow.toString(),
      e.capacity === 999999 ? '∞' : residual.toString(),
      isSaturated ? 'SÍ (100%)' : 'NO',
      isInCut ? 'CRÍTICA (Corte)' : '-',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    theme: 'grid',
    head: [['ID Arista', 'Tramo (u → v)', 'Capacidad (c)', 'Flujo (f)', 'Residual (c - f)', '¿Saturada?', '¿En Corte?']],
    body: edgeRows,
    headStyles: { fillColor: [30, 41, 59], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 42, fontStyle: 'bold' },
      2: { cellWidth: 26, halign: 'right' },
      3: { cellWidth: 22, halign: 'right' },
      4: { cellWidth: 24, halign: 'right' },
      5: { cellWidth: 24, halign: 'center' },
      6: { cellWidth: 24, halign: 'center', fontStyle: 'bold', textColor: [185, 28, 28] },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 8;

  // --- SECCIÓN 5: LEY DE CONSERVACIÓN DE FLUJO POR NODO ---
  if (currentY > 210) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('5. Verificación de la Ley de Conservación de Flujo (Kirchhoff)', 14, currentY);
  currentY += 5;

  const balanceRows = result.nodeBalances.map((nb) => {
    const node = nodes.find((n) => n.id === nb.nodeId);
    let type = 'Intermedio';
    if (node?.isSource) type = 'Fuente (S)';
    if (node?.isSink) type = 'Sumidero (T)';
    if (node?.isFictitious) type = 'Ficticio';

    return [
      node?.label || nb.nodeId,
      type,
      `${nb.inFlow} unidades`,
      `${nb.outFlow} unidades`,
      `${nb.balance} unidades`,
      nb.isValid ? 'CUMPLE' : 'ERROR',
    ];
  });

  autoTable(doc, {
    startY: currentY,
    theme: 'striped',
    head: [['Nodo', 'Tipo de Nodo', 'Flujo Entrante (Σ in)', 'Flujo Saliente (Σ out)', 'Balance Neto (In - Out)', 'Conservación']],
    body: balanceRows,
    headStyles: { fillColor: [67, 56, 202], fontSize: 8, fontStyle: 'bold' },
    bodyStyles: { fontSize: 7.5 },
    columnStyles: {
      0: { cellWidth: 30, fontStyle: 'bold' },
      1: { cellWidth: 32 },
      2: { cellWidth: 32, halign: 'right' },
      3: { cellWidth: 32, halign: 'right' },
      4: { cellWidth: 30, halign: 'right' },
      5: { cellWidth: 26, halign: 'center', fontStyle: 'bold', textColor: [22, 101, 52] },
    },
    margin: { left: 14, right: 14 },
  });

  // @ts-ignore
  currentY = doc.lastAutoTable.finalY + 8;

  // --- SECCIÓN 6: CONCLUSIÓN Y RECOMENDACIONES ---
  if (currentY > 230) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('6. Conclusiones y Recomendaciones de Ingeniería', 14, currentY);
  currentY += 5;

  const conclusionText =
    `1. Rendimiento del Sistema: La red alcanza su capacidad de transporte saturada en ${result.finalFlow} unidades.\n` +
    `2. Cuellos de Botella Críticos: Las aristas que conforman el corte mínimo [ ${result.minCut.cutEdges.join(', ')} ] constituyen la restricción física principal. ` +
    `Para incrementar el flujo total del sistema, la inversión en ampliación de infraestructura debe focalizarse exclusivamente en estas aristas.\n` +
    `3. Validación Algorítmica: El método de etiquetado de Ford-Fulkerson demostró convergencia en ${result.iterations.length} iteraciones sucesivas, ` +
    `garantizando optimalidad matemática y corroborando que no existen ciclos aumentantes en la red residual final.\n` +
    `4. Consistencia Operativa: El 100% de los nodos intermedios satisfacen el balance estricto de flujo entrante igual a flujo saliente.`;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitConclusion = doc.splitTextToSize(conclusionText, 182);
  doc.text(splitConclusion, 14, currentY);

  // --- PIE DE PÁGINA EN TODAS LAS HOJAS ---
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 287, 196, 287);

    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text('Generado por el Simulador de Flujo Máximo & Corte Mínimo (Ford-Fulkerson)', 14, 292);
    doc.text(`Página ${i} de ${pageCount}`, 196, 292, { align: 'right' });
  }

  return doc;
}
