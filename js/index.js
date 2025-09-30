// Elementos
const notesContainer = document.querySelector("#notes-container");
const noteInput = document.querySelector("#note-content");
const addNoteBtn = document.querySelector(".add-note");
const searchInput = document.querySelector("#search-input");
const exportBtn = document.querySelector("#export-notes")

// Helpers de storage
function getRawNotes(){
  return JSON.parse(localStorage.getItem("notes") || "[]");
}
function saveNotes(notes){
  localStorage.setItem("notes", JSON.stringify(notes));
}
function getNotes(){
  const notes = getRawNotes();
  // retorna cópia ordenada (fixadas primeiro)
  return notes.slice().sort((a,b) => {
    if (a.fixed === b.fixed) return 0;
    return a.fixed ? -1 : 1;
  });
}

// IDs melhores
function generateId(){
  return Date.now().toString(36) + Math.floor(Math.random()*1000).toString(36);
}

// Render
function cleanNotes(){ notesContainer.replaceChildren(); }
function showNotes(){
  cleanNotes();
  getNotes().forEach(note => {
    notesContainer.appendChild(createNote(note.id, note.content, note.fixed));
  });
}

// Cria elemento de nota
function createNote(id, content, fixed){
  const element = document.createElement("div");
  element.className = "note";
  element.dataset.id = id;
  if (fixed) element.classList.add("fixed");

  const textarea = document.createElement("textarea");
  textarea.value = content;
  textarea.placeholder = "Adicione algum texto";
  element.appendChild(textarea);

  const pinIcon = document.createElement("i");
  pinIcon.classList.add("bi", fixed ? "bi-pin-fill" : "bi-pin");
  element.appendChild(pinIcon);

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("bi", "bi-x-lg");
  element.appendChild(deleteIcon);

  const duplicateIcon = document.createElement("i");
  duplicateIcon.classList.add("bi", "bi-file-earmark-plus");
  element.appendChild(duplicateIcon);

  // Eventos
  textarea.addEventListener("input", (e) => updateNote(id, e.target.value));
  pinIcon.addEventListener("click", () => toggleFixNote(id));
  deleteIcon.addEventListener("click", () => deleteNote(id));
  duplicateIcon.addEventListener("click", () => copyNote(id));

  return element;
}

// CRUD
function addNote(){
  const content = noteInput.value.trim();
  if (!content) return; // não cria nota vazia
  const notes = getRawNotes();
  notes.push({ id: generateId(), content, fixed: false });
  saveNotes(notes);
  noteInput.value = "";
  showNotes();
}

function updateNote(id, newContent){
  const notes = getRawNotes();
  const target = notes.find(n => n.id === id);
  if (!target) return;
  target.content = newContent;
  saveNotes(notes);
}

function toggleFixNote(id){
  const notes = getRawNotes();
  const target = notes.find(n => n.id === id);
  if (!target) return;
  target.fixed = !target.fixed;
  saveNotes(notes);
  showNotes();
}

function deleteNote(id){
  const notes = getRawNotes().filter(n => n.id !== id);
  saveNotes(notes);
  showNotes();
}

function copyNote(id){
  const notes = getRawNotes();
  const target = notes.find(n => n.id === id);
  if (!target) return;
  notes.push({ id: generateId(), content: target.content, fixed: false });
  saveNotes(notes);
  showNotes();
}

// Busca
function searchNotes(search){
  const q = search.trim().toLowerCase();
  if (!q) {
    showNotes();
    return;
  }
  const results = getNotes().filter(note => note.content.toLowerCase().includes(q));
  cleanNotes();
  results.forEach(note => notesContainer.appendChild(createNote(note.id, note.content, note.fixed)));
}

function exportData(){
    const notes = getNotes();

    const escapeCSV = (value) => `"${String(value).replace(/"/g, '""')}"`;

    const csvString = [
        ["ID", "Conteúdo", "Fixado?"],
        ...notes.map(note => [note.id, note.content, note.fixed])
    ].map(row => row.map(escapeCSV).join(",")).join("\n");

    const element = document.createElement("a");
    element.href = "data:text/csv;charset=utf-8," + encodeURIComponent(csvString);
    element.download = "notes.csv";
    element.click();
}


// Eventos
addNoteBtn.addEventListener("click", addNote);
searchInput.addEventListener("input", (e) => searchNotes(e.target.value));
exportBtn.addEventListener("click", () => {
    exportData()
})

// Inicialização
showNotes();
