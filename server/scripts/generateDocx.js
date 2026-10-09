import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle
} from 'docx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper for consistent styling
const primaryColor = '0F172A'; // Deep Navy
const secondaryColor = '1E3A8A'; // Corporate Blue
const textColor = '334155'; // Slate Body Text
const lightBg = 'F1F5F9'; // Slate 100 for table headers

function createHeading1(text) {
  return new Paragraph({
    spacing: { before: 360, after: 140 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 32, // 16pt
        font: 'Calibri',
        color: primaryColor
      })
    ]
  });
}

function createHeading2(text) {
  return new Paragraph({
    spacing: { before: 240, after: 100 },
    children: [
      new TextRun({
        text: text,
        bold: true,
        size: 26, // 13pt
        font: 'Calibri',
        color: secondaryColor
      })
    ]
  });
}

function createBodyParagraph(text, isBold = false) {
  return new Paragraph({
    spacing: { before: 80, after: 120 },
    children: [
      new TextRun({
        text: text,
        bold: isBold,
        size: 22, // 11pt
        font: 'Calibri',
        color: textColor
      })
    ]
  });
}

function createBulletItem(title, description) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 60, after: 80 },
    children: [
      new TextRun({
        text: title + ': ',
        bold: true,
        size: 22,
        font: 'Calibri',
        color: primaryColor
      }),
      new TextRun({
        text: description,
        size: 22,
        font: 'Calibri',
        color: textColor
      })
    ]
  });
}

function createNumberedStep(stepNum, title, description) {
  return new Paragraph({
    spacing: { before: 100, after: 80 },
    children: [
      new TextRun({
        text: `Step ${stepNum}: ${title} - `,
        bold: true,
        size: 22,
        font: 'Calibri',
        color: secondaryColor
      }),
      new TextRun({
        text: description,
        size: 22,
        font: 'Calibri',
        color: textColor
      })
    ]
  });
}

// Generate the Document
async function generateWorkflowDocx() {
  console.log('📄 Generating Executive Client Word Document for Yene Kiray...');

  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 4,
    color: 'CBD5E1'
  };

  const tableBorders = {
    top: thinBorder,
    bottom: thinBorder,
    left: thinBorder,
    right: thinBorder,
    insideHorizontal: thinBorder,
    insideVertical: thinBorder
  };

  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: 'Calibri',
            size: 22,
            color: textColor
          }
        }
      }
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440
            }
          }
        },
        children: [
          // Document Header / Title
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 100, after: 120 },
            children: [
              new TextRun({
                text: 'YENE KIRAY RENTAL PLATFORM',
                bold: true,
                size: 44, // 22pt
                font: 'Calibri',
                color: primaryColor
              })
            ]
          }),

          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 300 },
            children: [
              new TextRun({
                text: 'Business Architecture, Operational Workflow, and Technical Specification',
                italics: true,
                size: 24, // 12pt
                font: 'Calibri',
                color: secondaryColor
              })
            ]
          }),

          // Metadata Info Box Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Target Audience', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 75, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Client Leadership & Project Stakeholders', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Document Purpose', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 75, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Operational Governance & Business Process Specification', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Release Version', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 75, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Version 1.0 (Production Architecture)', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Classification', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 75, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Confidential / Commercial Specification', size: 20 })] })]
                  })
                ]
              })
            ]
          }),

          // SECTION 1: EXECUTIVE OVERVIEW
          createHeading1('1. Executive Summary & Market Concept'),
          createBodyParagraph(
            'Yene Kiray is a unified, multi-category digital rental marketplace engineered specifically for Ethiopia. The platform establishes a direct, transparent connection between asset owners (individuals, real estate companies, equipment hire operators) and prospective renters.'
          ),
          createBodyParagraph(
            'By eliminating unnecessary brokerage markups, introducing real-time direct communication, and delivering flexible monetization controls, Yene Kiray simplifies access to residential homes, commercial properties, vehicles, heavy machinery, and event spaces across Addis Ababa and key regional hubs.'
          ),

          // SECTION 2: USER ROLES
          createHeading1('2. User Roles and Access Governance'),
          createBodyParagraph(
            'To maintain strict platform security and content integrity, access is segregated into two core operational tiers:'
          ),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'User Role', bold: true, size: 22 })] })]
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Account Provisioning', bold: true, size: 22 })] })]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Operational Permissions', bold: true, size: 22 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Super Administrator', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Provisioned strictly via secure Terminal / Command Line Interface. Public registration is locked.', size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Full executive console access: manage rental categories, toggle free vs. paid posting, configure fee amounts, review and audit payment receipts, moderate listings, and inspect financial analytics.', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 20, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Client / User', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Self-service registration via web application interface (Default role: User).', size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Create and submit rental listings, search and filter listings by category/location/price, direct real-time messaging with owners, bookmark favorite listings, and manage personal postings.', size: 20 })] })]
                  })
                ]
              })
            ]
          }),

          // SECTION 3: CORE WORKFLOWS
          createHeading1('3. Core Operational Business Workflows'),

          createHeading2('3.1 Client and Renter Journey'),
          createNumberedStep('1', 'Registration and Identity Setup', 'Clients create a verified account by providing their legal name, phone number, email, and optional avatar profile.'),
          createNumberedStep('2', 'Multi-Parametric Discovery', 'Visitors explore available inventory using real-time search, dynamic category pills, regional city filters, and price range brackets.'),
          createNumberedStep('3', 'Wishlist and Bookmarking', 'Interested renters can bookmark prospective items to their private Saved Items collection for rapid side-by-side comparison.'),
          createNumberedStep('4', 'Direct In-App Communication', 'Renters initiate real-time conversations directly with asset owners via integrated messaging, removing broker interference and speeding up negotiations.'),

          createHeading2('3.2 Listing Publication and Governance Workflow'),
          createBodyParagraph(
            'The platform features a dual-mode publishing architecture that adapts to administrative business strategy:'
          ),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Workflow Stage', bold: true, size: 22 })] })]
                  }),
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Free Mode (Fee = OFF)', bold: true, size: 22 })] })]
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Monetized Mode (Fee = ON)', bold: true, size: 22 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Submission', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'User fills asset details, uploads images, and clicks Submit.', size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'User fills asset details, receives bank/Telebirr instructions, and submits payment reference or receipt photo.', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Initial Status', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Status: Approved (Immediate Publication)', size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Status: Pending Audit (Hidden from Public)', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 25, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Marketplace Impact', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 35, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Drives rapid marketplace inventory growth and viral owner onboarding.', size: 20 })] })]
                  }),
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Generates consistent platform revenue. Listing goes live only upon administrative receipt confirmation.', size: 20 })] })]
                  })
                ]
              })
            ]
          }),

          createHeading2('3.3 Administrative Management & Control Center'),
          createBodyParagraph(
            'The Executive Administration Portal centralizes all governance controls into dedicated operational modules:'
          ),
          createBulletItem('Category Administration', 'Administrators dynamically create, rename, icon-tag, or disable rental categories. All changes propagate instantaneously to the public Home page navigation.'),
          createBulletItem('User Moderation Directory', 'Real-time visibility over registered users, with single-click capability to activate, suspend, or audit accounts for fraudulent behavior.'),
          createBulletItem('Monetization Controls', 'Administrative toggle to switch the entire platform between free and paid publishing, configure base posting fees (in ETB), and update payment transfer instructions (Telebirr, Commercial Bank of Ethiopia).'),
          createBulletItem('Financial Audit Queue', 'Complete log of financial transactions, incoming payment proofs, receipt lightbox viewer, and one-click approve/reject actions.'),

          // SECTION 4: TECHNICAL ARCHITECTURE
          createHeading1('4. Technical Architecture and Reliability Standards'),
          createBulletItem('Database Infrastructure', 'Serverless PostgreSQL hosted on Neon with automated connection pooling and SSL encryption, ensuring high concurrency and sub-millisecond query performance.'),
          createBulletItem('Media Asset Pipeline', 'Cloudinary integration providing automated image compression, CDN caching, and responsive thumbnail generation.'),
          createBulletItem('Real-Time Messaging', 'Bidirectional Socket.io architecture enabling live chat, instant read receipts, and notification dispatching with zero page reloads.'),
          createBulletItem('Design and Aesthetics', 'Senior-architected obsidian dark aesthetic featuring responsive layouts, pure-color accessibility, and optimized letter spacing for exceptional user engagement.'),

          // SECTION 5: EXECUTIVE SIGN-OFF
          createHeading1('5. Executive Verification and Delivery Acceptance'),
          createBodyParagraph(
            'This specification confirms that the software platform meets the operational, functional, and security objectives defined during project kickoff.'
          ),

          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: tableBorders,
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 40, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Deliverable Objective', bold: true, size: 22 })] })]
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Implementation Status', bold: true, size: 22 })] })]
                  }),
                  new TableCell({
                    width: { size: 30, type: WidthType.PERCENTAGE },
                    shading: { fill: lightBg },
                    children: [new Paragraph({ children: [new TextRun({ text: 'Verification Method', bold: true, size: 22 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Brand & Multi-Category Marketplace', size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Completed & Live', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: '5 Realistic Seeded Categories', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Security & Access Isolation', size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Verified', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Terminal-Seeded Super Admin', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Monetization & Posting Governance', size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Operational', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Dynamic Free/Paid Switch', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Interactive Search & Price Filtering', size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Operational', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Min/Max & Preset Price Filtering', size: 20 })] })]
                  })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Direct Owner Communication', size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Operational', bold: true, size: 20 })] })]
                  }),
                  new TableCell({
                    children: [new Paragraph({ children: [new TextRun({ text: 'Real-Time Messaging Engine', size: 20 })] })]
                  })
                ]
              })
            ]
          }),

          new Paragraph({
            spacing: { before: 400, after: 100 },
            children: [
              new TextRun({
                text: 'Authorization and Acceptance Signatures:',
                bold: true,
                size: 24,
                color: primaryColor
              })
            ]
          }),

          new Paragraph({
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({
                text: 'Client Representative Signature: _______________________      Date: _______________',
                size: 22,
                color: textColor
              })
            ]
          }),

          new Paragraph({
            spacing: { before: 150, after: 100 },
            children: [
              new TextRun({
                text: 'Project Lead Signature:           _______________________      Date: _______________',
                size: 22,
                color: textColor
              })
            ]
          })
        ]
      }
    ]
  });

  const outputPath = path.resolve(__dirname, '../../Yene_Kiray_Project_Workflow.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`✅ Professional Word document generated at: ${outputPath}`);
}

generateWorkflowDocx();
