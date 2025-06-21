let currentLang = "en";
let recognition = null;

function initApp() {
  populateTaskSelect();
  setLanguage("auto");
  setupEventListeners();
  loadFormState();
  const isDark = document.body.classList.contains("dark");
  const toggleBtn = document.getElementById("darkModeToggle");
  toggleBtn.setAttribute("aria-pressed", isDark.toString());
  toggleBtn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
}

function toggleDarkMode() {
  const btn = document.getElementById("darkModeToggle");
  const isDark = document.body.classList.toggle("dark");
  btn.setAttribute("aria-pressed", isDark.toString());
  btn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  saveFormState();
}

function setLanguage(lang) {
  const select = document.getElementById("language");
  currentLang = (lang === "auto") ? navigator.language.startsWith("es") ? "es" : "en" : lang;
  select.value = lang === "auto" ? "auto" : currentLang;
}

function changeLanguage() {
  const selected = document.getElementById("language").value;
  setLanguage(selected);
  populateTaskSelect();
  updateStepsAndPermit();
}

function setupEventListeners() {
  document.getElementById("darkModeToggle").addEventListener("click", toggleDarkMode);
  document.getElementById("startVoiceBtn").addEventListener("click", startVoiceInput);
  document.getElementById("stopVoiceBtn").addEventListener("click", stopVoiceInput);
  document.getElementById("taskSelect").addEventListener("change", updateStepsAndPermit);
}

function loadFormState() {
  const notes = localStorage.getItem("notes");
  if (notes) document.getElementById("notes").value = notes;
}

function saveFormState() {
  localStorage.setItem("notes", document.getElementById("notes").value);
}

function populateTaskSelect() {
  const select = document.getElementById("taskSelect");
  select.innerHTML = "";
  Object.keys(defaultTasks).forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = capitalize(key.replace(/([A-Z])/g, " $1"));
    select.appendChild(option);
  });
}

function updateStepsAndPermit() {
  const task = document.getElementById("taskSelect").value;
  const stepsList = document.getElementById("stepList");
  const permitInfo = document.getElementById("permitInfo");
  if (!defaultTasks[task]) return;
  const data = defaultTasks[task][currentLang];
  stepsList.innerHTML = "";
  data.steps.forEach(step => {
    const li = document.createElement("li");
    li.textContent = step;
    stepsList.appendChild(li);
  });
  permitInfo.textContent = data.permit;
}

function checkPermit() {
  updateStepsAndPermit();
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/([A-Z])/g, ' $1');
}

function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert(currentLang === "es" ? "Reconocimiento de voz no soportado." : "Speech recognition not supported.");
    return;
  }
  recognition = new SpeechRecognition();
  recognition.lang = currentLang === "es" ? "es-ES" : "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.onresult = e => {
    const transcript = e.results[0][0].transcript;
    document.getElementById("notes").value += transcript + "\\n";
    saveFormState();
  };

  recognition.onerror = e => {
    console.error("Speech recognition error:", e.error);
    stopVoiceInput();
  };

  recognition.onend = () => {
    document.getElementById("startVoiceBtn").disabled = false;
    document.getElementById("stopVoiceBtn").disabled = true;
  };
}

function startVoiceInput() {
  if (!recognition) initSpeechRecognition();
  if (recognition) {
    recognition.start();
    document.getElementById("startVoiceBtn").disabled = true;
    document.getElementById("stopVoiceBtn").disabled = false;
  }
}

function stopVoiceInput() {
  if (recognition) {
    recognition.stop();
    document.getElementById("startVoiceBtn").disabled = false;
    document.getElementById("stopVoiceBtn").disabled = true;
  }
}

// ✅ TASKS: Each job type in both English & Spanish
const defaultTasks = {
  drywallRepair: {
    en: { steps: ["Clean area", "Cut patch", "Attach patch", "Apply mud", "Sand and paint"], permit: "No permit required for patching drywall." },
    es: { steps: ["Limpiar área", "Cortar parche", "Colocar parche", "Aplicar masilla", "Lijar y pintar"], permit: "No se necesita permiso para reparar paneles." }
  },
  toiletReplacement: {
    en: { steps: ["Shut off water", "Disconnect and remove old toilet", "Set new wax ring", "Install and level new toilet", "Reconnect water"], permit: "No permit required for 1-to-1 toilet replacement." },
    es: { steps: ["Cerrar el agua", "Quitar el inodoro viejo", "Colocar anillo de cera", "Instalar nuevo inodoro", "Reconectar el agua"], permit: "No se necesita permiso si no se cambia plomería." }
  },
  ceilingFan: {
    en: { steps: ["Turn off power", "Install rated box", "Assemble fan", "Connect wires", "Mount and test"], permit: "Permit may be needed if adding wiring." },
    es: { steps: ["Cortar energía", "Instalar caja especial", "Armar ventilador", "Conectar cables", "Probar funcionamiento"], permit: "Puede necesitar permiso si se agrega cableado." }
  },
  fenceInstall: {
    en: { steps: ["Mark and dig holes", "Set posts in concrete", "Attach panels", "Stain or seal"], permit: "Permit may be required depending on height and location." },
    es: { steps: ["Marcar y cavar hoyos", "Colocar postes en concreto", "Fijar paneles", "Aplicar protector"], permit: "Puede requerir permiso según altura o zona." }
  },
  garbageDisposal: {
    en: { steps: ["Unplug and disconnect plumbing", "Remove old unit", "Install new mounting", "Attach disposal", "Reconnect and test"], permit: "No permit required unless electrical work is added." },
    es: { steps: ["Desconectar energía y plomería", "Retirar triturador viejo", "Instalar montaje nuevo", "Fijar triturador", "Probar funcionamiento"], permit: "No requiere permiso a menos que haya trabajo eléctrico." }
  },
  gravelLandscaping: {
    en: { steps: ["Clear area", "Lay fabric", "Spread gravel", "Compact", "Trim edges"], permit: "No permit required for gravel landscaping." },
    es: { steps: ["Limpiar terreno", "Colocar manta", "Esparcir grava", "Compactar", "Recortar bordes"], permit: "No se necesita permiso para grava." }
  },
  monsoonPrep: {
    en: { steps: ["Clear gutters", "Trim branches", "Check drainage", "Secure objects", "Stock supplies"], permit: "No permit required." },
    es: { steps: ["Limpiar canaletas", "Cortar ramas", "Revisar drenaje", "Asegurar objetos", "Tener suministros"], permit: "No se necesita permiso." }
  },
  bathroomRemodel: {
    en: { steps: ["Demo", "Rough plumbing & electrical", "Tile & walls", "Fixtures", "Paint & finish"], permit: "Full permits usually required for remodels." },
    es: { steps: ["Demolición", "Plomería y electricidad", "Azulejos y muros", "Instalación", "Pintar y acabar"], permit: "Se requieren permisos completos." }
  },
  evCharger: {
    en: { steps: ["Choose location", "Install breaker", "Run wiring", "Mount charger", "Test"], permit: "Permit required for new 240V circuit." },
    es: { steps: ["Elegir ubicación", "Instalar interruptor", "Cableado", "Montar cargador", "Probar"], permit: "Se requiere permiso para circuito 240V." }
  }
};
