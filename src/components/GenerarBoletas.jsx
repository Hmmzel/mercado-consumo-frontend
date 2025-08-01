import React from "react";
import {
  Document,
  Packer,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  TextRun,
  WidthType,
  SectionType,
  ImageRun,
  AlignmentType,
} from "docx";
import { saveAs } from "file-saver";
import sanMartinLogo from "../assets/san martin.png";


function GenerarBoletasWord({ consumos }) {
  // Crear celda con la boleta para un consumo
  const colorTexto = "#0E2841"

  const toBase64 = (url) =>
    fetch(url)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          })
      );

  const crearCelda = (item, index, imageBuffer, nombreArchivo) => {
    const colorBordes = nombreArchivo === "boletas_consumo_Copia.docx" ? "#FFFFFF" : "#FFFFFF";
    const hoy = new Date();
    const mes = hoy.toLocaleString("default", { month: "long" }).toUpperCase();
    const anio = hoy.getFullYear();
    const mesNumero = hoy.getMonth(); // 0-indexed
    const fechaVencimiento = new Date(anio, mesNumero, 9);
    const fechaCorte = new Date(anio, mesNumero, 10);
    const formatearFecha = (fecha) =>
      `${String(fecha.getDate()).padStart(2, "0")}/${String(
        fecha.getMonth() + 1
      ).padStart(2, "0")}/${fecha.getFullYear()}`;
    const nroRecibo = String(index + 1).padStart(7, "0");

    const encabezado = [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                width: { size: 20, type: WidthType.PERCENTAGE },
                borders: {
                  top: { size: 4, color: colorBordes, style: "single" }, // Borde rojo
                  bottom: { size: 4, color: colorBordes, style: "single" },
                  left: { size: 4, color: colorBordes, style: "single" },
                  right: { size: 4, color: colorBordes, style: "single" },
                  insideHorizontal: { size: 4, color: "00FF00", style: "single" }, // Borde verde interno
                  insideVertical: { size: 4, color: "00FF00", style: "single" },
                },
                children: [
                  new Paragraph({
                    children: [
                      new ImageRun({
                        data: imageBuffer,
                        transformation: {
                          width: 100,
                          height: 110,
                        },
                      }),
                    ],
                  }),
                ],
              }),
              new TableCell({
                width: { size: 80, type: WidthType.PERCENTAGE },
                borders: {
                  top: { size: 4, color: colorBordes, style: "single" }, // Borde azul
                  bottom: { size: 4, color: colorBordes, style: "single" },
                  left: { size: 4, color: colorBordes, style: "single" },
                  right: { size: 4, color: colorBordes, style: "single" },
                },
                children: [
                  new Paragraph({
                    alignment: "center",
                    children: [
                      new TextRun({ color: colorTexto, text: "ASOCIACIÓN DE PROPIETARIOS DEL", bold: true, size: 20 }),
                    ],
                  }),
                  new Paragraph({
                    alignment: "center",
                    children: [
                      new TextRun({ color: colorTexto, text: 'MERCADO "SAN MARTÍN" DE PARCONA', bold: true, size: 20 }),
                    ],
                  }),
                  new Paragraph({
                    alignment: "center",
                    children: [
                      new TextRun({ color: colorTexto, text: `"APROSMARP"`, bold: true, size: 24 }),
                    ],
                    spacing: { after: 100 },
                  }),
                ],
                verticalAlign: "center",
              }),
            ],
          }),
        ],
      }),

      new Paragraph({
        alignment: "right",
        children: [
          new TextRun({ color: colorTexto, text: `N° ${nroRecibo}`, bold: true }),
        ],
        spacing: { after: 100 },
        indent: {
          right: 1000, // Esto agrega espacio del borde derecho (medido en TWIPs: 1 TWIP = 1/20 punto)
        },
      }),
      new Paragraph({
        alignment: "center",
        children: [
          new TextRun({ color: colorTexto, text: `RECIBO N° _________ENERGÍA ELÉCTRICA`, bold: true }),
        ],
        spacing: { after: 100 },
      }),
    ];

    const datosLectura = [new Table({
      width: {
        size: 100,
        type: WidthType.PERCENTAGE,
      },
      rows: [
        ["MES:", mes],
        ["USUARIO:", item.nombre],
        ["PUESTO:", item.puesto],
        ["CANTIDAD PUESTOS:", item.cantidad_puestos.toFixed(0)],
        // Fila personalizada con MEDIDOR a la izquierda y MARCA a la derecha
        new TableRow({
          children: [
            new TableCell({
              columnSpan: 2,
              children: [
                new Paragraph({
                  tabStops: [{ type: "right", position: 9000 }],
                  children: [
                    new TextRun({ text: "MEDIDOR: ____________________        MARCA: ________", color: colorTexto, font: "Arial" }),
                    /* new TextRun({ text: "MARCA: ________", color: colorTexto, font: "Arial" }), */
                  ],
                }),
              ],
              borders: {
                top: { size: 4, color: colorBordes, style: "single" },
                bottom: { size: 4, color: colorBordes, style: "single" },
                left: { size: 4, color: colorBordes, style: "single" },
                right: { size: 4, color: colorBordes, style: "single" },
              },
            }),
          ],
        }),
        ["LECTURA ACTUAL:", item.lectura_actual],
        ["LECTURA ANTERIOR:", item.lectura_anterior],
        ["DIF. ENTRE LECTURAS:", item.diferencia],
      ].map((row) => {
        if (row instanceof TableRow) return row;

        const [label, value] = row;
        return new TableRow({
          children: [
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: label, color: colorTexto, font: "Arial" })],
                  alignment: AlignmentType.LEFT,
                }),
              ],
              borders: {
                top: { size: 4, color: colorBordes, style: "single" },
                bottom: { size: 4, color: colorBordes, style: "single" },
                left: { size: 4, color: colorBordes, style: "single" },
                right: { size: 4, color: colorBordes, style: "single" },
              },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  children: [
                    new TextRun({
                      text: value.toFixed ? value.toFixed(2) : value,
                      color: colorTexto,
                      font: "Arial",
                    }),
                  ],
                  alignment: AlignmentType.LEFT,
                }),
              ],
              borders: {
                top: { size: 4, color: colorBordes, style: "single" },
                bottom: { size: 4, color: colorBordes, style: "single" },
                left: { size: 4, color: colorBordes, style: "single" },
                right: { size: 4, color: colorBordes, style: "single" },
              },
            }),
          ],
        });
      }),
    })];



    const cargoAPagar = [
      new Paragraph({
        alignment: "center",
        spacing: { before: 200, after: 100 },
        children: [new TextRun({ color: colorTexto, text: "CARGO A PAGAR", bold: true })],
      }),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { size: 0, color: colorBordes },
          bottom: { size: 0, color: colorBordes },
          left: { size: 0, color: colorBordes },
          right: { size: 0, color: colorBordes },
          insideHorizontal: { size: 0, color: colorBordes },
          insideVertical: { size: 0, color: colorBordes },
        },
        rows: [
          ["ENERGÍA:", item.energia],
          ["ILUMINACIÓN DE LOS PASADIZOS:", item.iluminacion],
          ["GASTOS ADMINISTRATIVOS:", item.gastos_adm],
          ["I.G.V.:", item.igv],
          ["T. LECTURA:", item.toma_lectura],
          ["OTROS:", item.otros],
          ["TOTAL DEL MES:", `S/ ${item.total_mes.toFixed(2)}`],
        ].map(([label, value]) =>
          new TableRow({
            children: [
              new TableCell({
                children: [new Paragraph({ children: [new TextRun({ text: label, color: colorTexto })] })],
                borders: {
                  top: { size: 4, color: colorBordes, style: "single" }, // Borde rojo
                  bottom: { size: 4, color: colorBordes, style: "single" },
                  left: { size: 4, color: colorBordes, style: "single" },
                  right: { size: 4, color: colorBordes, style: "single" },
                  insideHorizontal: { size: 4, color: "00FF00", style: "single" }, // Borde verde interno
                  insideVertical: { size: 4, color: "00FF00", style: "single" },
                },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    alignment: "left",
                    children: [new TextRun({ text: value.toFixed ? value.toFixed(2) : value, color: colorTexto })],
                  }),
                ],
                margin: {
                  left: 100,
                  right: 100,
                },
                borders: {
                  top: { size: 4, color: colorBordes, style: "single" }, // Borde rojo
                  bottom: { size: 4, color: colorBordes, style: "single" },
                  left: { size: 4, color: colorBordes, style: "single" },
                  right: { size: 4, color: colorBordes, style: "single" },
                  insideHorizontal: { size: 4, color: "00FF00", style: "single" }, // Borde verde interno
                  insideVertical: { size: 4, color: "00FF00", style: "single" },
                },
              }),
            ],
          })
        ),
      }),
    ];


    const fechas = [
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { size: 4, color: colorBordes, style: "single" },
          bottom: { size: 4, color: colorBordes, style: "single" },
          left: { size: 4, color: colorBordes, style: "single" },
          right: { size: 4, color: colorBordes, style: "single" },
          insideHorizontal: { size: 4, color: colorBordes, style: "single" },
          insideVertical: { size: 4, color: colorBordes, style: "single" },
        },
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "FECHA DE VENCIMIENTO:", color: colorTexto })],
                  }),
                ],
                borders: {},
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: formatearFecha(fechaVencimiento), color: colorTexto })],
                  }),
                ],
                borders: {},
              }),
            ],
          }),
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: "CORTE:", color: colorTexto })],
                  }),
                ],
                borders: {},
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    children: [new TextRun({ text: formatearFecha(fechaCorte), color: colorTexto })],
                  }),
                ],
                borders: {},
              }),
            ],
          }),
        ],
      }),
    ];


    return new TableCell({
      width: { size: 33, type: WidthType.PERCENTAGE },
      children: [...encabezado, ...datosLectura, ...cargoAPagar, ...fechas],
      margins: { top: 200, bottom: 200, left: 200, right: 200 },
      shading: nombreArchivo === "boletas_consumo_Copia.docx" ? {
        type: "clear",
        color: "auto",
        fill: "FFFFFF", // Copia
      } : undefined,
    });

  };

  // Celda vacía para mantener la estructura de la tabla
  const crearCeldaVacia = (colorBordes) => {
    return new TableCell({
      children: [new Paragraph("")],
      borders: {
        top: { size: 0, color: colorBordes },
        bottom: { size: 0, color: colorBordes },
        left: { size: 0, color: colorBordes },
        right: { size: 0, color: colorBordes },
      },
      width: { size: 33, type: WidthType.PERCENTAGE },
      margins: { top: 200, bottom: 200, left: 200, right: 200 },
    });
  };

  // Agrupar consumos de 2 en 2 (2 columnas por fila)
  const grupos = [];
  for (let i = 0; i < consumos.length; i += 2) {
    grupos.push(consumos.slice(i, i + 2));
  }

  // Crear secciones con índice correcto para cada item
  //let contadorRecibo = 0;

  // Crear documento Word


  // Descargar el documento
  const generarDocumento = async () => {
    const base64Logo = await toBase64(sanMartinLogo);
    const imageBuffer = Uint8Array.from(
      atob(base64Logo.split(",")[1]),
      (c) => c.charCodeAt(0)
    );

    const crearDocumento = (conFondoCopia) => {
      let contadorRecibo = 0; // ✅ Esto reinicia el contador cada vez que se llama a crearDocumento
      return new Document({
        sections: grupos.map((grupo) => {
          const celdas = [];

          grupo.forEach((item, i) => {
            const nombreArchivo = conFondoCopia ? "boletas_consumo_Copia.docx" : "boletas_consumo.docx";
            const celda = crearCelda(item, contadorRecibo, imageBuffer, nombreArchivo);

            if (conFondoCopia) {
              celda.shading = {
                type: "clear",
                color: "auto",
                fill: "FFFFFF", // Copia
              };
            }

            celdas.push(celda);
            contadorRecibo++;
          });

          while (celdas.length < 2) {
            const vacia = crearCeldaVacia();
            if (conFondoCopia) {
              vacia.shading = {
                type: "clear",
                color: "auto",
                fill: "FFFFFF",
              };
            }
            celdas.push(vacia);
          }

          return {
            properties: {
              type: SectionType.NEXT_PAGE,
              page: {
                size: {
                  width: 16838,
                  height: 11906,
                },
                margin: {
                  top: 720,
                  bottom: 720,
                  left: 720,
                  right: 720,
                },
              },
            },
            children: [
              new Table({
                rows: [new TableRow({ children: celdas })],
                width: { size: 100, type: WidthType.PERCENTAGE },
              }),
            ],
          };
        }),
      });
    };

    const docNormal = await Packer.toBlob(crearDocumento(false));
    saveAs(docNormal, "boletas_consumo.docx");

    const docCopia = await Packer.toBlob(crearDocumento(true));
    saveAs(docCopia, "boletas_consumo_Copia.docx");
  };


  return (
    <div>
      <button onClick={generarDocumento}>Generar Boletas en Word</button>
    </div>
  );
}

export default GenerarBoletasWord;
