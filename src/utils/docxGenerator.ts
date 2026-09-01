import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  AlignmentType,
  HeadingLevel,
  ShadingType,
} from 'docx';
import { Project, BusinessSettings } from '../types';

function saveBlob(blob: Blob, filename: string) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

const PRIMARY_COLOR = '1E293B'; // Slate-800
const ACCENT_COLOR = '0F766E';  // Teal-700
const BORDER_COLOR = 'CBD5E1';  // Slate-300
const BG_HEADER = 'F1F5F9';      // Slate-100
const BG_ZEBRA = 'F8FAFC';       // Slate-50

const thinBorder = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: BORDER_COLOR,
};

const cellBorders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
};

/**
 * Generate Quotation Word Document (.docx)
 */
export async function generateQuotationDocx(
  project: Project,
  settings: BusinessSettings,
  lang: 'ar' | 'en' = 'ar'
): Promise<void> {
  const isAr = lang === 'ar';
  const currency = project.currency || settings.currency || 'USD';
  const clientName = project.client?.name || 'Client';
  const clientCompany = project.client?.company || '';
  const dateStr = new Date().toISOString().split('T')[0];

  // Financial sums
  const servicesTotal = project.scopeItems.reduce(
    (sum, item) => sum + (Number(item.price) || 0) * (Number(item.quantity) || 1),
    0
  );
  const setupFee = Number(project.setupFee) || 0;
  const additionalFee = Number(project.additionalFee) || 0;
  const discount = Number(project.discount) || 0;
  const finalTotal = servicesTotal + setupFee + additionalFee - discount;

  // Custom fields included in quotation
  const quotationCustomFields = (project.customFields || []).filter(
    (f) => f.includeInQuotation && f.value !== undefined && f.value !== ''
  );

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header / Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: isAr ? 'عرض سعر وخطة تنفيذ مشروع' : 'PROJECT PROPOSAL & QUOTATION',
                bold: true,
                size: 32,
                color: PRIMARY_COLOR,
                font: isAr ? 'Arial' : 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 },
            children: [
              new TextRun({
                text: `${isAr ? 'رقم العرض' : 'Quotation No'}: ${project.quotationNumber || 'QT-2026-001'} | ${isAr ? 'التاريخ' : 'Date'}: ${dateStr}`,
                size: 20,
                color: '64748B',
                font: isAr ? 'Arial' : 'Calibri',
              }),
            ],
          }),

          // Provider & Client Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: cellBorders,
                    shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: isAr ? 'بيانات مقدم الخدمة:' : 'Service Provider:',
                            bold: true,
                            size: 20,
                            color: PRIMARY_COLOR,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${settings.companyName || settings.providerName || 'Development Studio'}\n${settings.phone || ''}\n${settings.email || ''}\n${settings.website || ''}`,
                            size: 18,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: cellBorders,
                    shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: isAr ? 'بيانات العميل:' : 'Client Details:',
                            bold: true,
                            size: 20,
                            color: PRIMARY_COLOR,
                          }),
                        ],
                      }),
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${clientName}${clientCompany ? ` - ${clientCompany}` : ''}\n${project.client?.phone || ''}\n${project.client?.email || ''}\n${project.client?.country || ''}`,
                            size: 18,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          new Paragraph({ spacing: { before: 200, after: 100 } }),

          // Project Overview
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: isAr ? '1. نبذة عن المشروع وأهدافه' : '1. Project Overview & Objectives',
                bold: true,
                size: 24,
                color: PRIMARY_COLOR,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: `${isAr ? 'اسم المشروع' : 'Project Name'}: `,
                bold: true,
                size: 20,
              }),
              new TextRun({ text: project.name, size: 20 }),
            ],
          }),
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: `${isAr ? 'نوع المشروع' : 'Project Type'}: `,
                bold: true,
                size: 20,
              }),
              new TextRun({ text: project.customType || project.type, size: 20 }),
            ],
          }),
          ...(project.description
            ? [
                new Paragraph({
                  spacing: { after: 100 },
                  children: [
                    new TextRun({
                      text: `${isAr ? 'الوصف العام' : 'Description'}: `,
                      bold: true,
                      size: 20,
                    }),
                    new TextRun({ text: project.description, size: 20 }),
                  ],
                }),
              ]
            : []),
          ...(project.idea
            ? [
                new Paragraph({
                  spacing: { after: 100 },
                  children: [
                    new TextRun({
                      text: `${isAr ? 'فكرة المشروع' : 'Project Concept'}: `,
                      bold: true,
                      size: 20,
                    }),
                    new TextRun({ text: project.idea, size: 20 }),
                  ],
                }),
              ]
            : []),
          ...(project.goals
            ? [
                new Paragraph({
                  spacing: { after: 100 },
                  children: [
                    new TextRun({
                      text: `${isAr ? 'الأهداف' : 'Goals'}: `,
                      bold: true,
                      size: 20,
                    }),
                    new TextRun({ text: project.goals, size: 20 }),
                  ],
                }),
              ]
            : []),
          ...(project.techStack
            ? [
                new Paragraph({
                  spacing: { after: 100 },
                  children: [
                    new TextRun({
                      text: `${isAr ? 'التقنيات المستخدمة' : 'Technologies'}: `,
                      bold: true,
                      size: 20,
                    }),
                    new TextRun({ text: project.techStack, size: 20 }),
                  ],
                }),
              ]
            : []),

          // Custom Fields in Quotation if any
          ...(quotationCustomFields.length > 0
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_3,
                  spacing: { before: 150, after: 100 },
                  children: [
                    new TextRun({
                      text: isAr ? 'محددات ومتطلبات إضافية:' : 'Additional Specifications:',
                      bold: true,
                      size: 22,
                    }),
                  ],
                }),
                ...quotationCustomFields.map(
                  (field) =>
                    new Paragraph({
                      spacing: { after: 60 },
                      children: [
                        new TextRun({ text: `• ${field.name}: `, bold: true, size: 19 }),
                        new TextRun({ text: String(field.value), size: 19 }),
                      ],
                    })
                ),
              ]
            : []),

          // Scope of Work Table
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: isAr ? '2. نطاق العمل والخدمات (Scope of Work)' : '2. Scope of Work & Deliverables',
                bold: true,
                size: 24,
                color: PRIMARY_COLOR,
              }),
            ],
          }),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              // Header row
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    borders: cellBorders,
                    shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: isAr ? 'البند / الخدمة' : 'Service / Deliverable',
                            bold: true,
                            size: 19,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    borders: cellBorders,
                    shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: isAr ? 'المدة' : 'Duration',
                            bold: true,
                            size: 19,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 15, type: WidthType.PERCENTAGE },
                    borders: cellBorders,
                    shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [
                          new TextRun({
                            text: isAr ? 'الكمية' : 'Qty',
                            bold: true,
                            size: 19,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    borders: cellBorders,
                    shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: isAr ? `السعر (${currency})` : `Price (${currency})`,
                            bold: true,
                            size: 19,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              // Data rows
              ...project.scopeItems.map((item, idx) => {
                const totalItemPrice = (Number(item.price) || 0) * (Number(item.quantity) || 1);
                return new TableRow({
                  children: [
                    new TableCell({
                      borders: cellBorders,
                      shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: BG_ZEBRA } : undefined,
                      children: [
                        new Paragraph({
                          children: [
                            new TextRun({ text: item.title, bold: true, size: 19 }),
                          ],
                        }),
                        ...(item.description
                          ? [
                              new Paragraph({
                                children: [
                                  new TextRun({
                                    text: item.description,
                                    size: 17,
                                    color: '475569',
                                  }),
                                ],
                              }),
                            ]
                          : []),
                      ],
                    }),
                    new TableCell({
                      borders: cellBorders,
                      shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: BG_ZEBRA } : undefined,
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: item.duration || '-', size: 18 })],
                        }),
                      ],
                    }),
                    new TableCell({
                      borders: cellBorders,
                      shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: BG_ZEBRA } : undefined,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          children: [
                            new TextRun({
                              text: String(item.quantity || 1),
                              size: 18,
                            }),
                          ],
                        }),
                      ],
                    }),
                    new TableCell({
                      borders: cellBorders,
                      shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: BG_ZEBRA } : undefined,
                      children: [
                        new Paragraph({
                          alignment: AlignmentType.RIGHT,
                          children: [
                            new TextRun({
                              text: `${totalItemPrice.toLocaleString()} ${currency}`,
                              bold: true,
                              size: 18,
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                });
              }),
            ],
          }),

          // Project Phases
          ...(project.phases && project.phases.length > 0
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 240, after: 120 },
                  children: [
                    new TextRun({
                      text: isAr ? '3. مراحل التنفيذ والجدول الزمني' : '3. Execution Phases & Timeline',
                      bold: true,
                      size: 24,
                      color: PRIMARY_COLOR,
                    }),
                  ],
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          width: { size: 30, type: WidthType.PERCENTAGE },
                          borders: cellBorders,
                          shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: isAr ? 'المرحلة' : 'Phase',
                                  bold: true,
                                  size: 19,
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          width: { size: 40, type: WidthType.PERCENTAGE },
                          borders: cellBorders,
                          shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: isAr ? 'الوصف والمدة' : 'Description & Duration',
                                  bold: true,
                                  size: 19,
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          width: { size: 30, type: WidthType.PERCENTAGE },
                          borders: cellBorders,
                          shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.RIGHT,
                              children: [
                                new TextRun({
                                  text: isAr ? 'الاستحقاق المالي' : 'Milestone Due',
                                  bold: true,
                                  size: 19,
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                    ...project.phases.map(
                      (phase, idx) =>
                        new TableRow({
                          children: [
                            new TableCell({
                              borders: cellBorders,
                              shading:
                                idx % 2 === 1
                                  ? { type: ShadingType.CLEAR, fill: BG_ZEBRA }
                                  : undefined,
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({ text: phase.name, bold: true, size: 18 }),
                                  ],
                                }),
                              ],
                            }),
                            new TableCell({
                              borders: cellBorders,
                              shading:
                                idx % 2 === 1
                                  ? { type: ShadingType.CLEAR, fill: BG_ZEBRA }
                                  : undefined,
                              children: [
                                new Paragraph({
                                  children: [
                                    new TextRun({
                                      text: `${phase.description || ''} ${phase.duration ? `(${phase.duration})` : ''}`,
                                      size: 17,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                            new TableCell({
                              borders: cellBorders,
                              shading:
                                idx % 2 === 1
                                  ? { type: ShadingType.CLEAR, fill: BG_ZEBRA }
                                  : undefined,
                              children: [
                                new Paragraph({
                                  alignment: AlignmentType.RIGHT,
                                  children: [
                                    new TextRun({
                                      text: phase.amountOrPercentage || '-',
                                      bold: true,
                                      size: 18,
                                    }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        })
                    ),
                  ],
                }),
              ]
            : []),

          // Financial Summary
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: isAr ? '4. التكلفة المالية والدفع' : '4. Financials & Payment Terms',
                bold: true,
                size: 24,
                color: PRIMARY_COLOR,
              }),
            ],
          }),

          new Table({
            width: { size: 60, type: WidthType.PERCENTAGE },
            alignment: isAr ? AlignmentType.RIGHT : AlignmentType.LEFT,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    borders: cellBorders,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: isAr ? 'سعر الخدمات الإجمالي:' : 'Services Subtotal:',
                            size: 18,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: cellBorders,
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: `${servicesTotal.toLocaleString()} ${currency}`,
                            size: 18,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              ...(setupFee > 0
                ? [
                    new TableRow({
                      children: [
                        new TableCell({
                          borders: cellBorders,
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: isAr ? 'رسوم التشغيل / الإعداد:' : 'Setup / Onboarding Fee:',
                                  size: 18,
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          borders: cellBorders,
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.RIGHT,
                              children: [
                                new TextRun({
                                  text: `${setupFee.toLocaleString()} ${currency}`,
                                  size: 18,
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ]
                : []),
              ...(discount > 0
                ? [
                    new TableRow({
                      children: [
                        new TableCell({
                          borders: cellBorders,
                          children: [
                            new Paragraph({
                              children: [
                                new TextRun({
                                  text: isAr ? 'الخصم الممنوح:' : 'Discount:',
                                  color: 'DC2626',
                                  size: 18,
                                }),
                              ],
                            }),
                          ],
                        }),
                        new TableCell({
                          borders: cellBorders,
                          children: [
                            new Paragraph({
                              alignment: AlignmentType.RIGHT,
                              children: [
                                new TextRun({
                                  text: `-${discount.toLocaleString()} ${currency}`,
                                  color: 'DC2626',
                                  size: 18,
                                }),
                              ],
                            }),
                          ],
                        }),
                      ],
                    }),
                  ]
                : []),
              new TableRow({
                children: [
                  new TableCell({
                    borders: cellBorders,
                    shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: isAr ? 'الإجمالي النهائي المطلوب:' : 'Total Payable Amount:',
                            bold: true,
                            size: 20,
                            color: PRIMARY_COLOR,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    borders: cellBorders,
                    shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
                    children: [
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                          new TextRun({
                            text: `${finalTotal.toLocaleString()} ${currency}`,
                            bold: true,
                            size: 22,
                            color: ACCENT_COLOR,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),

          // Payment Terms & Validity
          new Paragraph({
            spacing: { before: 180, after: 80 },
            children: [
              new TextRun({
                text: `${isAr ? 'طريقة وشروط الدفع' : 'Payment Terms'}: `,
                bold: true,
                size: 20,
              }),
              new TextRun({
                text:
                  project.paymentMethod.type === '50_50'
                    ? isAr
                      ? '50% مقدم عند الاعتماد و 50% عند اكتمال وتسليم المشروع.'
                      : '50% upfront deposit upon approval and 50% upon completion & handover.'
                    : project.paymentMethod.type === 'milestones'
                    ? isAr
                      ? 'دفعات مقسمة على مراحل التنفيذ وفق الجدول أعلاه.'
                      : 'Installment payments tied to the milestone phases table above.'
                    : project.paymentMethod.type === 'full_upfront'
                    ? isAr
                      ? 'دفع كامل المبلغ مقدمًا 100% قبل بدء العمل.'
                      : '100% full upfront payment prior to kickoff.'
                    : project.paymentMethod.customText ||
                      settings.defaultPaymentTerms ||
                      'Standard Terms',
                size: 19,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: `${isAr ? 'مدة صلاحية هذا العرض' : 'Quotation Validity'}: `,
                bold: true,
                size: 19,
              }),
              new TextRun({
                text: `${settings.quotationValidityDays || 15} ${isAr ? 'يومًا من تاريخ إصداره.' : 'days from the date of issue.'}`,
                size: 19,
              }),
            ],
          }),

          // Terms & Conditions
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: isAr ? '5. الشروط والأحكام العامة' : '5. Terms & Conditions',
                bold: true,
                size: 22,
                color: PRIMARY_COLOR,
              }),
            ],
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({
                text:
                  settings.defaultTermsAndConditions ||
                  (isAr
                    ? '1. يبدأ احتساب مدة العمل من تاريخ استلام الدفعة المقدمة وتوفير العميل لكافة البيانات والمحتوى المطلوب.\n2. التعديلات الإضافية غير المشمولة في نطاق العمل أعلاه يتم احتسابها بشكل منفصل بموافقة الطرفين.\n3. يتم تسليم كافة الشفرات البرمجية وحسابات الاستضافة والتحكم كاملة للعميل فور سداد الدفعة النهائية.'
                    : '1. Project timeline commences upon receipt of the deposit and required client assets/credentials.\n2. Out-of-scope modifications will be quoted separately upon mutual agreement.\n3. Full access, credentials, and code repositories are handed over upon settlement of the final balance.'),
                size: 17,
                color: '475569',
              }),
            ],
          }),

          // Client Approval / Signature Box
          new Paragraph({
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: isAr ? 'اعتماد وموافقة العميل (Client Approval & Signature):' : 'Client Acceptance & Signature:',
                bold: true,
                size: 20,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: cellBorders,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${isAr ? 'اسم المفوض بالتوقيع' : 'Authorized Signatory'}:\n____________________________\n\n${isAr ? 'التاريخ' : 'Date'}: ____ / ____ / 2026`,
                            size: 18,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: cellBorders,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${isAr ? 'التوقيع والختم الرسمي' : 'Signature & Official Stamp'}:\n\n\n____________________________`,
                            size: 18,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanClient = clientName.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_');
  const cleanProject = project.name.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_');
  const filename = `Quotation-${cleanClient}-${cleanProject}-${dateStr}.docx`;
  saveBlob(blob, filename);
}

/**
 * Generate Handover Word Document (.docx)
 */
export async function generateHandoverDocx(
  project: Project,
  settings: BusinessSettings,
  lang: 'ar' | 'en' = 'ar'
): Promise<void> {
  const isAr = lang === 'ar';
  const clientName = project.client?.name || 'Client';
  const dateStr = new Date().toISOString().split('T')[0];
  const h = project.handoverData || {
    server: { serverIp: '', serverProvider: '', serverPlan: '', serverUsername: '', serverPassword: '', sshPort: '', serverNotes: '' },
    domain: { domainName: '', domainProvider: '', domainUsername: '', domainPassword: '', domainExpiryDate: '', domainNotes: '' },
    webApp: { productionUrl: '', adminUrl: '', adminUsername: '', adminPassword: '', dbName: '', dbUsername: '', dbPassword: '', repoUrl: '', branch: '', deploymentNotes: '' },
    additional: { apiKeys: '', thirdPartyServices: '', emailConfig: '', importantLinks: '', maintenanceInfo: '', backupInfo: '', otherNotes: '' },
    customFields: [],
  };

  // Combine project custom fields flagged for handover + handover custom fields
  const handoverCustoms = [
    ...(project.customFields || []).filter((f) => f.includeInHandover && f.value !== undefined && f.value !== ''),
    ...(h.customFields || []).filter((f) => f.value !== undefined && f.value !== ''),
  ];

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Handover Header
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 100 },
            children: [
              new TextRun({
                text: isAr ? 'وثيقة تسليم المشروع والبيانات التقنية' : 'PROJECT HANDOVER & CREDENTIALS DOCUMENT',
                bold: true,
                size: 32,
                color: PRIMARY_COLOR,
                font: isAr ? 'Arial' : 'Calibri',
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 240 },
            children: [
              new TextRun({
                text: `${isAr ? 'المشروع' : 'Project'}: ${project.name} | ${isAr ? 'العميل' : 'Client'}: ${clientName} | ${isAr ? 'تاريخ التسليم' : 'Date'}: ${dateStr}`,
                size: 20,
                color: '64748B',
                font: isAr ? 'Arial' : 'Calibri',
              }),
            ],
          }),

          // Confidentiality Notice
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: isAr
                  ? '⚠️ تنبيه سرية: يحتوي هذا المستند على كلمات مرور وبيانات وصول حساسة للسيرفر والتطبيق. يرجى حفظه بأمان وتغيير كلمات المرور دورياً.'
                  : '⚠️ CONFIDENTIAL: This document contains sensitive administrative credentials and server keys. Store securely and rotate passwords periodically.',
                bold: true,
                size: 18,
                color: 'B45309', // Amber-700
              }),
            ],
          }),

          // Section: General Web & Application Credentials
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: isAr ? '1. بيانات الموقع والتطبيق ولوحة الإدارة' : '1. Application & Admin Credentials',
                bold: true,
                size: 24,
                color: PRIMARY_COLOR,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createKVRow(isAr ? 'رابط الموقع المباشر (Production URL)' : 'Production URL', h.webApp?.productionUrl || '-'),
              createKVRow(isAr ? 'رابط لوحة التحكم (Admin Panel)' : 'Admin Panel URL', h.webApp?.adminUrl || '-'),
              createKVRow(isAr ? 'اسم مستخدم لوحة الإدارة' : 'Admin Username', h.webApp?.adminUsername || '-'),
              createKVRow(isAr ? 'كلمة مرور لوحة الإدارة' : 'Admin Password', h.webApp?.adminPassword || '-'),
              createKVRow(isAr ? 'اسم قاعدة البيانات' : 'Database Name', h.webApp?.dbName || '-'),
              createKVRow(isAr ? 'مستخدم قاعدة البيانات' : 'Database User', h.webApp?.dbUsername || '-'),
              createKVRow(isAr ? 'كلمة مرور قاعدة البيانات' : 'Database Password', h.webApp?.dbPassword || '-'),
              createKVRow(isAr ? 'رابط المستودع البرمجي (Repository)' : 'Repository URL', h.webApp?.repoUrl || '-'),
              createKVRow(isAr ? 'الفرع الرئيسي (Branch)' : 'Main Branch', h.webApp?.branch || '-'),
              ...(h.webApp?.deploymentNotes ? [createKVRow(isAr ? 'ملاحظات النشر والتشغيل' : 'Deployment Notes', h.webApp.deploymentNotes)] : []),
            ],
          }),

          // Section: Server & Hosting
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: isAr ? '2. بيانات السيرفر والاستضافة (Server & Hosting)' : '2. Server & Hosting Details',
                bold: true,
                size: 24,
                color: PRIMARY_COLOR,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createKVRow(isAr ? 'عنوان IP السيرفر' : 'Server IP Address', h.server?.serverIp || '-'),
              createKVRow(isAr ? 'مزود السيرفر / الاستضافة' : 'Hosting Provider', h.server?.serverProvider || '-'),
              createKVRow(isAr ? 'خطة ومواصفات السيرفر' : 'Server Plan/Specs', h.server?.serverPlan || '-'),
              createKVRow(isAr ? 'اسم المستخدم (SSH/Root)' : 'Server Username', h.server?.serverUsername || '-'),
              createKVRow(isAr ? 'كلمة المرور / SSH Key' : 'Server Password/Key', h.server?.serverPassword || '-'),
              createKVRow(isAr ? 'منفذ SSH (Port)' : 'SSH Port', h.server?.sshPort || '22'),
              ...(h.server?.serverNotes ? [createKVRow(isAr ? 'ملاحظات السيرفر' : 'Server Notes', h.server.serverNotes)] : []),
            ],
          }),

          // Section: Domain & DNS
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: isAr ? '3. بيانات النطاق وإدارة DNS (Domain & DNS)' : '3. Domain & DNS Details',
                bold: true,
                size: 24,
                color: PRIMARY_COLOR,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              createKVRow(isAr ? 'اسم النطاق (Domain Name)' : 'Domain Name', h.domain?.domainName || '-'),
              createKVRow(isAr ? 'مسجل النطاق (Registrar)' : 'Domain Registrar', h.domain?.domainProvider || '-'),
              createKVRow(isAr ? 'اسم مستخدم لوحة النطاق' : 'Registrar Username', h.domain?.domainUsername || '-'),
              createKVRow(isAr ? 'كلمة مرور لوحة النطاق' : 'Registrar Password', h.domain?.domainPassword || '-'),
              createKVRow(isAr ? 'تاريخ انتهاء النطاق' : 'Domain Expiry Date', h.domain?.domainExpiryDate || '-'),
              ...(h.domain?.domainNotes ? [createKVRow(isAr ? 'ملاحظات النطاق / DNS' : 'Domain / DNS Notes', h.domain.domainNotes)] : []),
            ],
          }),

          // Section: Custom Handover Fields (Dynamic fields like Cloudflare, Firebase, Apple Dev, etc.)
          ...(handoverCustoms.length > 0
            ? [
                new Paragraph({
                  heading: HeadingLevel.HEADING_2,
                  spacing: { before: 240, after: 100 },
                  children: [
                    new TextRun({
                      text: isAr ? '4. حسابات وخدمات مخصصة (Custom Services)' : '4. Custom Services & Credentials',
                      bold: true,
                      size: 24,
                      color: PRIMARY_COLOR,
                    }),
                  ],
                }),
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: handoverCustoms.map((field) =>
                    createKVRow(field.name, String(field.value || '-'))
                  ),
                }),
              ]
            : []),

          // Section: Additional Technical Information
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 240, after: 100 },
            children: [
              new TextRun({
                text: isAr ? '5. الخدمات الخارجية والنسخ الاحتياطي والصيانة' : '5. Third-party, Backups & Maintenance',
                bold: true,
                size: 24,
                color: PRIMARY_COLOR,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              ...(h.additional?.apiKeys ? [createKVRow(isAr ? 'مفاتيح الربط (API Keys)' : 'API Keys', h.additional.apiKeys)] : []),
              ...(h.additional?.thirdPartyServices ? [createKVRow(isAr ? 'خدمات خارجية مرتبطة' : 'Third-Party Services', h.additional.thirdPartyServices)] : []),
              ...(h.additional?.emailConfig ? [createKVRow(isAr ? 'إعدادات البريد (Mail/SMTP)' : 'Email / SMTP Config', h.additional.emailConfig)] : []),
              ...(h.additional?.importantLinks ? [createKVRow(isAr ? 'روابط هامة للمشروع' : 'Important Links', h.additional.importantLinks)] : []),
              ...(h.additional?.backupInfo ? [createKVRow(isAr ? 'إجراءات النسخ الاحتياطي' : 'Backup Procedures', h.additional.backupInfo)] : []),
              ...(h.additional?.maintenanceInfo ? [createKVRow(isAr ? 'الصيانة والدعم الفني' : 'Maintenance & Support', h.additional.maintenanceInfo)] : []),
              ...(h.additional?.otherNotes ? [createKVRow(isAr ? 'ملاحظات إضافية للتسليم' : 'Additional Notes', h.additional.otherNotes)] : []),
            ],
          }),

          // Sign-off / Handover Confirmation
          new Paragraph({
            spacing: { before: 280, after: 100 },
            children: [
              new TextRun({
                text: isAr ? 'إقرار استلام المشروع كاملاً (Handover Acceptance):' : 'Project Handover Acceptance:',
                bold: true,
                size: 20,
              }),
            ],
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: cellBorders,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${isAr ? 'المطور / مسلّم المشروع' : 'Delivered by (Provider)'}:\n${settings.providerName || settings.companyName || 'Lead Developer'}\n\n${isAr ? 'التوقيع' : 'Signature'}: ________________\n${isAr ? 'التاريخ' : 'Date'}: ${dateStr}`,
                            size: 18,
                          }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    borders: cellBorders,
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: `${isAr ? 'العميل / مستلم المشروع' : 'Received by (Client)'}:\n${clientName}\n\n${isAr ? 'التوقيع' : 'Signature'}: ________________\n${isAr ? 'التاريخ' : 'Date'}: ____ / ____ / 2026`,
                            size: 18,
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const cleanClient = clientName.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_');
  const cleanProject = project.name.replace(/[^a-zA-Z0-9\u0600-\u06FF_-]/g, '_');
  const filename = `Handover-${cleanClient}-${cleanProject}-${dateStr}.docx`;
  saveBlob(blob, filename);
}

function createKVRow(key: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 35, type: WidthType.PERCENTAGE },
        borders: cellBorders,
        shading: { type: ShadingType.CLEAR, fill: BG_HEADER },
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: key,
                bold: true,
                size: 18,
                color: PRIMARY_COLOR,
              }),
            ],
          }),
        ],
      }),
      new TableCell({
        width: { size: 65, type: WidthType.PERCENTAGE },
        borders: cellBorders,
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: value || '-',
                size: 18,
                color: '334155',
              }),
            ],
          }),
        ],
      }),
    ],
  });
}
