// Labels for English and Spanish
const labels = {
  en: {
    title: "🛠️ Tucson Field Assistant",
    chooseTask: "Choose Task:",
    export: "Export PDF Report",
    permit: "Permit Guidance",
    notes: "📝 Notes:",
    photo: "📸 Add Photo:",
    locationBtn: "📍 Get Location",
    locationLabel: "Location:",
    locationError: "Could not get location.",
    helpToggle: "❓ Help / FAQ",
    customizeTitle: "Customize Task Steps",
    checklistTitle: "Checklist",
    startVoice: "🎙️ Start Voice Input",
    stopVoice: "🛑 Stop Voice Input",
    addStep: "Add Step",
    resetTask: "Reset to Default",
  },
  es: {
    title: "🛠️ Asistente de Campo de Tucson",
    chooseTask: "Elegir tarea:",
    export: "Exportar informe PDF",
    permit: "Guía de permisos",
    notes: "📝 Notas:",
    photo: "📸 Agregar foto:",
    locationBtn: "📍 Obtener ubicación",
    locationLabel: "Ubicación:",
    locationError: "No se pudo obtener la ubicación.",
    helpToggle: "❓ Ayuda / FAQ",
    customizeTitle: "Personalizar pasos de tarea",
    checklistTitle: "Lista de tareas",
    startVoice: "🎙️ Iniciar voz",
    stopVoice: "🛑 Detener voz",
    addStep: "Agregar paso",
    resetTask: "Restablecer por defecto",
  }
};

// Default tasks with steps and permit info
const defaultTasks = {
  waterHeater: {
    en: {
      steps: [
        "Turn off water & power",
        "Disconnect old heater",
        "Install new heater",
        "Check T&P valve",
        "Test system"
      ],
      permit: "Permit required for plumbing. Submit online or visit Tucson Development Services."
    },
    es: {
      steps: [
        "Cierra el agua y la electricidad",
        "Desconecta el calentador viejo",
        "Instala el nuevo calentador",
        "Verifica válvula T&P",
        "Prueba el sistema"
      ],
      permit: "Se requiere permiso de plomería. Solicítalo en línea o en el Ayuntamiento de Tucson."
    }
  },
  evCharger: {
    en: {
      steps: [
        "Inspect panel capacity",
        "Install 240V circuit",
        "Mount EV charger",
        "Connect wiring",
        "Test charging"
      ],
      permit: "Electrical permit required. Consult Tucson Development Services."
    },
    es: {
      steps: [
        "Inspecciona capacidad del panel",
        "Instala circuito de 240V",
        "Monta cargador EV",
        "Conecta cableado",
        "Prueba carga"
      ],
      permit: "Se requiere permiso eléctrico. Consulta al Ayuntamiento de Tucson."
    }
  },
  kitchenRemodel: {
    en: {
      steps: [
        "Demolish existing fixtures",
        "Rough plumbing & electrical",
        "Install cabinets & counters",
        "Install appliances",
        "Final inspection"
      ],
      permit: "Building permit required. Apply with Tucson Development Services."
    },
    es: {
      steps: [
        "Demoler accesorios existentes",
        "Instalación eléctrica y plomería",
        "Instalar gabinetes y encimeras",
        "Instalar electrodomésticos",
        "Inspección final"
      ],
      permit: "Se requiere permiso de construcción. Solicítalo en el Ayuntamiento de Tucson."
    }
  }
};

// Global variables
let currentTasks = JSON.parse(JSON.stringify(defaultTasks)); // clone for customization
let currentTask = null;
let currentLang = "en";
let currentPhotoData = null;
let currentLocation = null;
let recognition = null;

// Initialize app
function initApp() {
  populateTaskSelect();
  setLanguage("auto");
  setupEventListeners();
  loadFormState();
}

// Populate task dropdown
function populateTaskSelect() {
  const select = document.getElementById("taskSelect");
  select.innerHTML = '<option value="">-- Select --</option>';
  for (const key in currentTasks) {
    const display = keyToDisplayName(key);
    const option = document.createElement("option");
    option.value = key;
    option.textContent = display;
    select.appendChild(option);
  }
}

// Convert task key to readable name
function keyToDisplayName(key) {
  switch (key) {
    case "waterHeater": return currentLang === "es" ? "Calentador de Agua" : "Water Heater Installation";
    case "evCharger": return currentLang === "es" ? "Cargador EV" : "EV Charger Installation";
    case "kitchenRemodel": return currentLang === "es" ? "Remodelación de Cocina" : "Kitchen Remodel";
    default: return key;
  }
}

// Change language manually or auto detect
function changeLanguage() {
  let lang = document.getElementById("language").value;
  if (lang === "auto") {
    lang = navigator.language.startsWith("es") ? "es" : "en";
  }
  setLanguage(lang);
  saveFormState();
}

function setLanguage(lang) {
  currentLang = lang;
  // Update UI text
  document.getElementById("title").textContent = labels[lang].title;
  document.querySelector("label[for='taskSelect']").textContent = labels[lang].chooseTask;
  document.getElementById("downloadBtn").textContent = labels[lang].export;
  document.querySelector("label[for='notes']").textContent = labels[lang].notes;
  document.querySelector("label[for='photoInput']").textContent = labels[lang].photo;
  document.getElementById("locationBtn").textContent = labels[lang].locationBtn;
  document.getElementById("addStepBtn").textContent = labels[lang].addStep;
  document.getElementById("resetTaskBtn").textContent = labels[lang].resetTask;
  document.getElementById("toggleHelpBtn").textContent = labels[lang].helpToggle;
  document.getElementById("startVoiceBtn").textContent = labels[lang].startVoice;
  document.getElementById("stopVoiceBtn").textContent = labels[lang].stopVoice;

  // Update task dropdown names
  const select = document.getElementById("taskSelect");
  for (let i = 1; i < select.options.length; i++) {
    select.options[i].textContent = keyToDisplayName(select.options[i].value);
  }

  if (currentTask) loadChecklist();
}

// Load checklist and permit info for selected task
function loadChecklist() {
  const taskKey = document.getElementById("taskSelect").value;
  currentTask = taskKey;
  const checklistDiv = document.getElementById("checklist");
  const permitDiv = document.getElementById("permitSection");
  const customizeSection = document.getElementById("customizeSection");
  checklistDiv.innerHTML = "";
  permitDiv.innerHTML = "";
  customizeSection.hidden = true;
  currentPhotoData = currentPhotoData || null;
  currentLocation = currentLocation || null;

  if (!taskKey || !currentTasks[taskKey]) {
    document.getElementById("downloadBtn").disabled = true;
    document.getElementById("downloadBtn").setAttribute("aria-disabled", "true");
    return;
  }
  document.getElementById("downloadBtn").disabled = false;
  document.getElementById("downloadBtn").removeAttribute("aria-disabled");

  let steps = currentTasks[taskKey][currentLang]?.steps;
  if (!steps) {
    steps = currentTasks[taskKey]["en"].steps;
  }

  steps.forEach((step, i) => {
    const div = document.createElement("div");
    div.className = "task-item";
    div.innerHTML = `
      <input type="checkbox" id="step${i}" aria-label="${step}" />
      <label for="step${i}">${step}</label>
    `;
    checklistDiv.appendChild(div);
  });

  // Show permit info
  let permit = currentTasks[taskKey][currentLang]?.permit || currentTasks[taskKey]["en"].permit;
  permitDiv.innerText = `📋 ${labels[currentLang].permit}:\n${permit}\n\nTucson Development Services:\nhttps://www.tucsonaz.gov/pds\nPhone: (520) 791-5550`;

  // Show customize task steps UI
  customizeSection.hidden = false;
  renderCustomStepsList();
}

// Render customizable steps list UI
function renderCustomStepsList() {
  const ul = document.getElementById("customStepsList");
  ul.innerHTML = "";
  if (!currentTask || !currentTasks[currentTask]) return;

  const steps = currentTasks[currentTask][currentLang]?.steps || currentTasks[currentTask]["en"].steps;
  steps.forEach((step, i) => {
    const li = document.createElement("li");
    li.textContent = step;
    const btn = document.createElement("button");
    btn.setAttribute("aria-label", `Remove step: ${step}`);
    btn.textContent = "×";
    btn.onclick = () => {
      steps.splice(i, 1);
      currentTasks[currentTask][currentLang].steps = steps;
      saveTasksToStorage();
      loadChecklist();
      saveFormState();
    };
    li.appendChild(btn);
    ul.appendChild(li);
  });
}

// Add a custom step from input box
function addCustomStep() {
  const input = document.getElementById("newStepInput");
  const val = input.value.trim();
  if (!val) return;
  if (!currentTask) return alert(currentLang === "es" ? "Seleccione una tarea primero." : "Select a task first.");
  if (!currentTasks[currentTask][currentLang].steps) currentTasks[currentTask][currentLang].steps = [];

  currentTasks[currentTask][currentLang].steps.push(val);
  saveTasksToStorage();
  input.value = "";
  loadChecklist();
  saveFormState();
}

// Reset task steps to default
function resetTaskSteps() {
  if (!currentTask) return alert(currentLang === "es" ? "Seleccione una tarea primero." : "Select a task first.");
  currentTasks[currentTask][currentLang].steps = [...defaultTasks[currentTask][currentLang].steps];
  saveTasksToStorage();
  loadChecklist();
  saveFormState();
}

// Save tasks to localStorage
function saveTasksToStorage() {
  localStorage.setItem("tasks", JSON.stringify(currentTasks));
}

// Handle photo input and preview
function handlePhoto(input) {
  const preview = document.getElementById("photoPreview");
  preview.innerHTML = "";
  const file = input.files[0];
  if (!file) {
    currentPhotoData = null;
    saveFormState();
    return;
  }
  const reader = new FileReader();
  reader.onload = function (e) {
    currentPhotoData = e.target.result;
    const img = document.createElement("img");
    img.src = currentPhotoData;
    img.alt = currentLang === "es" ? "Vista previa de foto cargada" : "Uploaded photo preview";
    preview.appendChild(img);
    saveFormState();
  };
  reader.readAsDataURL(file);
}

// Get current geolocation
function getLocation() {
  const display = document.getElementById("locationDisplay");
  display.innerText = "...";
  if (!navigator.geolocation) {
    display.innerText = labels[currentLang].locationError;
    currentLocation = null;
    saveFormState();
    return;
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const lat = pos.coords.latitude.toFixed(5);
      const lon = pos.coords.longitude.toFixed(5);
      currentLocation = { lat, lon };
      display.innerText = `${labels[currentLang].locationLabel} ${lat}, ${lon}`;
      saveFormState();
    },
    () => {
      display.innerText = labels[currentLang].locationError;
      currentLocation = null;
      saveFormState();
    }
  );
}

// Save entire form state to localStorage
function saveFormState() {
  const checklistChecks = [];
  const checklistDiv = document.getElementById("checklist");
  checklistDiv.querySelectorAll("input[type=checkbox]").forEach(cb => {
    checklistChecks.push(cb.checked);
  });
  const notes = document.getElementById("notes").value;
  const taskSelect = document.getElementById("taskSelect").value;

  const state = {
    task: taskSelect,
    checklist: checklistChecks,
    notes,
    photo: currentPhotoData,
    location: currentLocation,
    lang: currentLang,
    darkMode: document.body.classList.contains("dark"),
  };
  localStorage.setItem("fieldAssistantState", JSON.stringify(state));
}

// Load form state from localStorage
function loadFormState() {
  const saved = localStorage.getItem("fieldAssistantState");
  if (!saved) return;
  const state = JSON.parse(saved);

  if (state.lang) {
    if (state.lang !== "auto") {
      document.getElementById("language").value = state.lang;
    }
    setLanguage(state.lang);
  }

  if (state.task) {
    document.getElementById("taskSelect").value = state.task;
    loadChecklist();
    // Restore checklist checkbox states
    const checklistDiv = document.getElementById("checklist");
    checklistDiv.querySelectorAll("input[type=checkbox]").forEach((cb, i) => {
      cb.checked = state.checklist && state.checklist[i];
    });
  }

  if (state.notes) document.getElementById("notes").value = state.notes;
  if (state.photo) {
    currentPhotoData = state.photo;
    const preview = document.getElementById("photoPreview");
    preview.innerHTML = `<img src="${currentPhotoData}" alt="Uploaded photo preview" />`;
  }
  if (state.location) {
    currentLocation = state.location;
    document.getElementById("locationDisplay").innerText = `${labels[currentLang].locationLabel} ${currentLocation.lat}, ${currentLocation.lon}`;
  }
  if (state.darkMode) {
    document.body.classList.add("dark");
    document.getElementById("darkModeToggle").setAttribute("aria-pressed", "true");
    document.getElementById("darkModeToggle").textContent = "☀️ Light Mode";
  }
  updateDownloadBtnState();
}

// Enable or disable export button based on task selected
function updateDownloadBtnState() {
  const btn = document.getElementById("downloadBtn");
  if (!currentTask) {
    btn.disabled = true;
    btn.setAttribute("aria-disabled", "true");
  } else {
    btn.disabled = false;
    btn.removeAttribute("aria-disabled");
  }
}

// Download formatted PDF report using jsPDF
async function downloadReport() {
  if (!currentTask) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  const title = labels[currentLang].title;
  doc.setFontSize(18);
  doc.text(title, 10, 20);

  const taskName = keyToDisplayName(currentTask);
  doc.setFontSize(14);
  doc.text(`${labels[currentLang].chooseTask} ${taskName}`, 10, 30);

  doc.setFontSize(12);
  doc.text(labels[currentLang].checklistTitle + ":", 10, 40);

  const checklistDiv = document.getElementById("checklist");
  let y = 50;
  checklistDiv.querySelectorAll("input[type=checkbox]").forEach((cb, i) => {
    const stepLabel = cb.nextElementSibling.textContent;
    const box = cb.checked ? "☑" : "☐";
    doc.text(`${box} ${stepLabel}`, 10, y);
    y += 8;
  });

  y += 6;
  let permit = currentTasks[currentTask][currentLang]?.permit || currentTasks[currentTask]["en"].permit;
  doc.text(`${labels[currentLang].permit}:`, 10, y);
  y += 8;
  const permitLines = doc.splitTextToSize(permit + "\n\nTucson Development Services:\nhttps://www.tucsonaz.gov/pds\nPhone: (520) 791-5550", 180);
  doc.text(permitLines, 10, y);
  y += permitLines.length * 8 + 10;

  // Notes
  const notes = document.getElementById("notes").value;
  if (notes.trim()) {
    doc.text(labels[currentLang].notes + ":", 10, y);
    y += 8;
    const notesLines = doc.splitTextToSize(notes, 180);
    doc.text(notesLines, 10, y);
    y += notesLines.length * 8 + 10;
  }

  // Location
  if (currentLocation) {
    doc.text(`${labels[currentLang].locationLabel}: ${currentLocation.lat}, ${currentLocation.lon}`, 10, y);
    y += 10;
  }

  // Photo embed (if space allows)
  if (currentPhotoData) {
    try {
      const imgProps = doc.getImageProperties(currentPhotoData);
      const pdfWidth = doc.internal.pageSize.getWidth() - 20;
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      if (y + pdfHeight < doc.internal.pageSize.getHeight() - 20) {
        doc.addImage(currentPhotoData, 'JPEG', 10, y, pdfWidth, pdfHeight);
      }
    } catch (e) {
      console.warn("Error adding photo to PDF:", e);
    }
  }

  doc.save(`${currentTask}-report.pdf`);
}

// Dark mode toggle
function toggleDarkMode() {
  const btn = document.getElementById("darkModeToggle");
  const isDark = document.body.classList.toggle("dark");
  btn.setAttribute("aria-pressed", isDark.toString());
  btn.textContent = isDark ? "☀️ Light Mode" : "🌙 Dark Mode";
  saveFormState();
}

// Help section toggle
function toggleHelp() {
  const help = document.getElementById("helpSection");
  const btn = document.getElementById("toggleHelpBtn");
  const expanded = help.hasAttribute("hidden") ? false : true;
  if (expanded) {
    help.hidden = true;
    btn.setAttribute("aria-expanded", "false");
  } else {
    help.hidden = false;
    btn.setAttribute("aria-expanded", "true");
    help.focus();
  }
}

// Voice input for notes
function initSpeechRecognition() {
  if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
    alert(currentLang === "es" ? "Reconocimiento de voz no soportado." : "Speech recognition not supported in this browser.");
    return null;
  }
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = currentLang === "es" ? "es-ES" : "en-US";
  recognition.interimResults = true;
  recognition.continuous = true;

  recognition.onresult = e => {
    let transcript = '';
    for (let i = e.resultIndex; i < e.results.length; i++) {
      transcript += e.results[i][0].transcript;
    }
    const notesElem = document.getElementById("notes");
    notesElem.value = transcript;
    saveFormState();
  };
  recognition.onerror = e => {
    console.error("Speech recognition error:", e.error);
  };
  return recognition;
}

function startVoiceInput() {
  if (!recognition) recognition = initSpeechRecognition();
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

// Attach event listeners
function setupEventListeners() {
  document.getElementById("addStepBtn").addEventListener("click", addCustomStep);
  document.getElementById("resetTaskBtn").addEventListener("click", resetTaskSteps);
  document.getElementById("photoInput").addEventListener("change", e => handlePhoto(e.target));
  document.getElementById("downloadBtn").addEventListener("click", downloadReport);
  document.getElementById("darkModeToggle").addEventListener("click", toggleDarkMode);
  document.getElementById("toggleHelpBtn").addEventListener("click", toggleHelp);
  document.getElementById("language").addEventListener("change", changeLanguage);
  document.getElementById("startVoiceBtn").addEventListener("click", startVoiceInput);
  document.getElementById("stopVoiceBtn").addEventListener("click", stopVoiceInput);
}

window.initApp = initApp;
window.loadChecklist = loadChecklist;
window.handlePhoto = handlePhoto;
window.getLocation = getLocation;
window.downloadReport = downloadReport;
window.changeLanguage = changeLanguage;
window.toggleDarkMode = toggleDarkMode;
window.addCustomStep = addCustomStep;
window.resetTaskSteps = resetTaskSteps;
window.toggleHelp = toggleHelp;
