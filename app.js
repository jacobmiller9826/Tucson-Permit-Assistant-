const permitRules = {
  Electrical: {
    en: "⚡ Electrical work almost always requires a permit — especially for panel changes, rewiring, or EV chargers.",
    es: "⚡ El trabajo eléctrico casi siempre requiere un permiso — especialmente para cambios de panel, cableado o cargadores EV."
  },
  Plumbing: {
    en: "🚰 Plumbing permits are needed for water heaters, piping changes, or new fixtures.",
    es: "🚰 Se necesitan permisos para calentadores, cambios de tuberías o accesorios nuevos."
  },
  Remodeling: {
    en: "🛠️ Remodeling involving structure, walls, plumbing or electrical needs permits.",
    es: "🛠️ Las remodelaciones con estructura, paredes, plomería o electricidad necesitan permisos."
  },
  HVAC: {
    en: "❄️ New AC units, ductwork, or swamp coolers require permits.",
    es: "❄️ Nuevas unidades de A/C, ductos o enfriadores requieren permiso."
  },
  Roofing: {
    en: "🏠 Roof replacements or major repairs require permits.",
    es: "🏠 Los reemplazos o reparaciones mayores del techo requieren permiso."
  },
  Landscaping: {
    en: "🌿 Landscaping usually doesn’t need permits unless grading or walls are added.",
    es: "🌿 El paisajismo no requiere permiso salvo que agregue nivelación o muros."
  },
  Painting: {
    en: "🎨 Painting doesn't need a permit unless part of major remodeling.",
    es: "🎨 Pintar no requiere permiso salvo que sea parte de una remodelación mayor."
  },
  Other: {
    en: "ℹ️ Unsure? Contact Tucson Development Services at (520) 791-5550.",
    es: "ℹ️ ¿No está seguro? Llame a Desarrollo Urbano de Tucson: (520) 791-5550."
  }
};

const keywords = {
  "tesla": {
    en: "🔋 Tesla/EV charger installation needs a permit. Check Tucson’s EV guidelines.",
    es: "🔋 La instalación de cargadores Tesla/EV necesita permiso. Consulte las guías locales."
  },
  "water heater": {
    en: "🔥 Water heater installations always require a plumbing permit.",
    es: "🔥 Los calentadores de agua requieren permiso de plomería."
  },
  "solar": {
    en: "☀️ Solar installations need specific electrical permits. Use Tucson Solar App.",
    es: "☀️ Las instalaciones solares requieren permisos eléctricos. Use Tucson Solar App."
  },
  "shed": {
    en: "🏚️ Sheds over 200 sq ft need a permit and zoning clearance.",
    es: "🏚️ Cobertizos de más de 200 pies cuadrados requieren permiso y verificación de zonificación."
  }
};

const labels = {
  en: {
    title: "🛠️ Tucson Permit Assistant",
    job: "Job Type",
    desc: "Job Description",
    check: "Check Permit",
    pdf: "Download PDF",
    share: "Copy Share Link",
    chatToggle: "FAQs Chat",
    chatPlaceholder: "Ask a question..."
  },
  es: {
    title: "🛠️ Asistente de Permisos de Tucson",
    job: "Tipo de trabajo",
    desc: "Descripción del trabajo",
    check: "Verificar Permiso",
    pdf: "Descargar PDF",
    share: "Copiar Enlace",
    chatToggle: "Chat de Preguntas",
    chatPlaceholder: "Haz una pregunta..."
  }
};

const faqAnswers = {
  "how long": {
    en: "⏱️ Most permits take 2–5 business days in Tucson.",
    es: "⏱️ La mayoría de permisos tardan 2–5 días hábiles en Tucson."
  },
  "apply": {
    en: "📝 Apply online via: https://tdc-online.tucsonaz.gov/",
    es: "📝 Solicite en línea: https://tdc-online.tucsonaz.gov/"
  },
  "cost": {
    en: "💵 Costs vary by job. Use Tucson’s permit calculator.",
    es: "💵 Los costos varían. Use la calculadora de permisos de Tucson."
  }
};

function translateUI() {
  const lang = document.getElementById("language").value;
  const l = labels[lang];
  document.getElementById("title").innerText = l.title;
  document.getElementById("label-jobType").innerText = l.job;
  document.getElementById("label-description").innerText = l.desc;
  document.getElementById("checkBtn").innerText = l.check;
  document.getElementById("pdfBtn").innerText = l.pdf;
  document.getElementById("shareBtn").innerText = l.share;
  document.getElementById("toggleChatBtn").innerText = l.chatToggle;
  document.getElementById("chatInput").placeholder = l.chatPlaceholder;
}

function checkPermit() {
  const jobType = document.getElementById("jobType").value;
  const desc = document.getElementById("description").value.toLowerCase();
  const lang = document.getElementById("language").value;

  let output = permitRules[jobType]?.[lang] || permitRules.Other[lang];

  for (const key in keywords) {
    if (desc.includes(key)) {
      output += "\n\n" + keywords[key][lang];
    }
  }

  const result = `${labels[lang].job}: ${jobType}
${labels[lang].desc}: ${desc}

${output}`;

  document.getElementById("result").innerText = result;
  document.getElementById("result").style.display = "block";
  document.getElementById("pdfBtn").disabled = false;
  document.getElementById("shareBtn").disabled = false;
  history.replaceState(null, "", `?job=${encodeURIComponent(jobType)}&desc=${encodeURIComponent(desc)}&lang=${lang}`);
}

function downloadPDF() {
  const text = document.getElementById("result").innerText;
  const blob = new Blob([text], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "permit-summary.pdf";
  link.click();
  URL.revokeObjectURL(url);
}

function copyShareLink() {
  navigator.clipboard.writeText(window.location.href);
  alert("Link copied to clipboard!");
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const job = params.get("job");
  const desc = params.get("desc");
  const lang = params.get("lang");
  if (job && desc && lang) {
    document.getElementById("jobType").value = job;
    document.getElementById("description").value = desc;
    document.getElementById("language").value = lang;
    translateUI();
    checkPermit();
  }
}

function toggleChat() {
  const chat = document.getElementById("chatContainer");
  chat.style.display = chat.style.display === "none" ? "block" : "none";
}

function chatSend() {
  const input = document.getElementById("chatInput").value.toLowerCase();
  const output = document.getElementById("chatOutput");
  const lang = document.getElementById("language").value;

  const userMsg = `<div class="user">${input}</div>`;
  output.innerHTML += userMsg;

  let found = false;
  for (const key in faqAnswers) {
    if (input.includes(key)) {
      const botMsg = `<div class="bot">${faqAnswers[key][lang]}</div>`;
      output.innerHTML += botMsg;
      found = true;
      break;
    }
  }

  if (!found) {
    output.innerHTML += `<div class="bot">🤖 Sorry, I don’t have an answer for that yet.</div>`;
  }

  document.getElementById("chatInput").value = "";
  output.scrollTop = output.scrollHeight;
}
