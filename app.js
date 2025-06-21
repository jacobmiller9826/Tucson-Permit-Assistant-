// ======= Permit Logic and Data =======
const permitRules = {
  Electrical: {
    en: `⚡ Electrical work almost always requires a permit — especially for panel changes, rewiring, EV chargers.
Permit info: https://bit.ly/tucson-electrical`,
    es: `⚡ El trabajo eléctrico casi siempre requiere un permiso — como cambios de panel, cableado o cargadores EV.
Permiso: https://bit.ly/tucson-electrical`
  },
  Plumbing: {
    en: `🚰 Plumbing permits are needed for water heaters, piping changes, or new fixtures.
Permit info: https://bit.ly/tucson-plumbing`,
    es: `🚰 Se requieren permisos para plomería: calentadores, tuberías o accesorios nuevos.
Permiso: https://bit.ly/tucson-plumbing`
  },
  Remodeling: {
    en: `🛠️ Remodeling involving walls, electrical, plumbing, or structure needs permits.
Info: https://bit.ly/tucson-remodel`,
    es: `🛠️ Remodelaciones con paredes, electricidad o plomería requieren permisos.
Más info: https://bit.ly/tucson-remodel`
  },
  HVAC: {
    en: `❄️ New AC units, duct changes, or swamp cooler installs need permits.
Details: https://bit.ly/tucson-hvac`,
    es: `❄️ Unidades nuevas de A/C, ductos o coolers requieren permiso.
Detalles: https://bit.ly/tucson-hvac`
  },
  Roofing: {
    en: `🏠 Roof replacements or major repairs require permits.
See: https://bit.ly/tucson-roof`,
    es: `🏠 Reemplazo de techos o reparaciones requieren permisos.
Ver: https://bit.ly/tucson-roof`
  },
  Landscaping: {
    en: `🌿 Landscaping usually doesn’t need permits unless grading or structural irrigation.
Tip: Call Tucson DSD if unsure.`,
    es: `🌿 El paisajismo no necesita permiso salvo cambio estructural.
Llame a DSD si tiene dudas.`
  },
  Painting: {
    en: `🎨 Painting doesn’t need a permit unless it's part of major remodeling.`,
    es: `🎨 Pintar no requiere permiso salvo que sea parte de una remodelación.`
  },
  Other: {
    en: `ℹ️ Unsure? Call Tucson DSD at (520) 791-5550 or visit:
https://www.tucsonaz.gov/Departments/Planning-Development-Services`,
    es: `ℹ️ ¿No está seguro? Llame al DSD al (520) 791-5550 o visite:
https://www.tucsonaz.gov/Departments/Planning-Development-Services`
  }
};

// Keywords that boost/add info to answers based on description
const keywords = {
  solar: {
    en: "☀️ Solar panel installations require specific permits. See: https://bit.ly/tucson-solar",
    es: "☀️ La instalación de paneles solares requiere permisos específicos. Ver: https://bit.ly/tucson-solar"
  },
  "water heater": {
    en: "🚰 Replacing a water heater requires a plumbing permit in most cases.",
    es: "🚰 Reemplazar un calentador de agua requiere un permiso de plomería en la mayoría de los casos."
  },
  fence: {
    en: "🚧 Fence installation may require zoning approval if over 6 feet tall.",
    es: "🚧 La instalación de cercas puede requerir aprobación de zonificación si supera 6 pies."
  },
  shed: {
    en: "🏠 Sheds over 200 sq ft typically require a permit.",
    es: "🏠 Los cobertizos de más de 200 pies cuadrados generalmente requieren permiso."
  },
  grading: {
    en: "🌄 Grading or drainage changes require permits and inspections.",
    es: "🌄 Cambios en drenaje o nivelación requieren permisos e inspecciones."
  }
};

// FAQ Chat answers (basic offline)
const faqAnswers = {
  en: {
    "do i need a permit to paint?": "🎨 Painting usually doesn't need a permit unless it's part of major remodeling.",
    "how do i apply for a permit?": "You can apply online at https://www.tucsonaz.gov/pdsd/online-services or visit the Planning & Development office.",
    "what is the fee for permits?": "Permit fees vary by project. See the fee schedule here: https://bit.ly/tucson-fees",
    "how long does a permit take?": "Typical permit processing takes 5-10 business days, but can vary based on workload.",
    "can i do electrical work myself?": "Homeowners can often do their own electrical work but still need a permit and inspection.",
    "who do i contact for questions?": "Contact Tucson Development Services at (520) 791-5550 or visit https://www.tucsonaz.gov/Departments/Planning-Development-Services"
  },
  es: {
    "¿necesito permiso para pintar?": "🎨 Pintar generalmente no requiere permiso a menos que sea parte de una remodelación mayor.",
    "¿cómo solicito un permiso?": "Puede solicitar en línea en https://www.tucsonaz.gov/pdsd/online-services o en la oficina de Planeación y Desarrollo.",
    "¿cuánto cuestan los permisos?": "Las tarifas varían según el proyecto. Consulte el calendario de tarifas aquí: https://bit.ly/tucson-fees",
    "¿cuánto tarda un permiso?": "El trámite típico toma 5-10 días hábiles, pero varía según la carga de trabajo.",
    "¿puedo hacer trabajo eléctrico yo mismo?": "Los propietarios pueden hacer trabajo eléctrico pero necesitan permiso e inspección.",
    "¿a quién contacto para preguntas?": "Contacte Servicios de Desarrollo de Tucson al (520) 791-5550 o visite https://www.tucsonaz.gov/Departments/Planning-Development-Services"
  }
};

// Translate UI labels/texts
const labels = {
  en: {
    title: "🛠️ Tucson Permit Assistant",
    job: "Job Type",
    desc: "Job Description",
    check: "Check Permit",
    pdf: "📄 Download PDF",
    share: "🔗 Copy Share Link",
    chatToggle: "💬 FAQs Chat",
    chatPlaceholder: "Ask a question...",
    copySuccess: "Share link copied to clipboard!"
  },
  es: {
    title: "🛠️ Asistente de Permisos de Tucson",
    job: "Tipo de trabajo",
    desc: "Descripción del trabajo",
    check: "Verificar Permiso",
    pdf: "📄 Descargar PDF",
    share: "🔗 Copiar enlace para compartir",
    chatToggle: "💬 Chat de Preguntas",
    chatPlaceholder: "Haz una pregunta...",
    copySuccess: "¡Enlace copiado al portapapeles!"
  }
};

// ======= DOM Elements =======
const resultDiv = document.getElementById("result");
const descriptionInput = document.getElementById("description");
const jobTypeSelect = document.getElementById("jobType");
const langSelect = document.getElementById("language");
const pdfBtn = document.getElementById("pdfBtn");
const shareBtn = document.getElementById("shareBtn");
const chatSection = document.getElementById("chat-section");
const chatContainer = document.getElementById("chatContainer");
const chatOutput = document.getElementById("chatOutput");
const chatInput = document.getElementById("chatInput");
const toggleChatBtn = document.getElementById("toggleChatBtn");

// ======= Core Functions =======

// Generate result text based on job type, description, and language
function checkPermit() {
  const jobType = jobTypeSelect.value;
  const lang = langSelect.value;
  let baseMessage = permitRules[jobType] ? permitRules[jobType][lang] : permitRules.Other[lang];
  const description = descriptionInput.value.toLowerCase();

  // Add keyword-based info if detected
  for (const key in keywords) {
    if (description.includes(key)) {
      baseMessage += "\n\n" + keywords[key][lang];
    }
  }

  // Compose full permit summary for auto-fill & PDF
  const permitSummary = `
${labels[lang].job}: ${jobType}
${labels[lang].desc}: ${descriptionInput.value.trim() || "—"}

${baseMessage}
`;

  resultDiv.innerText = permitSummary.trim();
  resultDiv.style.display = "block";

  // Enable PDF and Share buttons
  pdfBtn.disabled = false;
  shareBtn.disabled = false;

  // Update share link with current state
  updateShareLink();
}

// Translate UI text
function translateUI() {
  const lang = langSelect.value;
  const l = labels[lang];
  document.getElementById("title").innerText = l.title;
  document.getElementById("label-jobType").innerText = l.job;
  document.getElementById("label-description").innerText = l.desc;
  document.getElementById("checkBtn").innerText = l.check;
  pdfBtn.innerText = l.pdf;
  shareBtn.innerText = l.share;
  toggleChatBtn.innerText = l.chatToggle;
  chatInput.placeholder = l.chatPlaceholder;

  // Also update result if visible
  if (resultDiv.style.display !== "none") {
    checkPermit();
  }
}

// Download permit summary as PDF using jsPDF (or fallback to text file)
function downloadPDF() {
  const text = resultDiv.innerText;
  if (!text) return alert("Please check permit first.");

  if (window.jspdf) {
    const doc = new jspdf.jsPDF();
    const splitText = doc.splitTextToSize(text, 180);
    doc.text(splitText, 10, 10);
    doc.save("tucson-permit-summary.pdf");
  } else {
    // Fallback: download as plain text file
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "tucson-permit-summary.txt";
    a.click();
    URL.revokeObjectURL(url);
