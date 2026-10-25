// JavaScript for the Array Declaration Compiler
const input = document.getElementById("sourceCode");
const messagesBox = document.getElementById("messages");
const symbolsBox = document.getElementById("symbols");

document.getElementById("analyzeBtn").addEventListener("click", analyze);
document.getElementById("exampleBtn").addEventListener("click", () => {
  input.value = "int marks[10];\nfloat prices[5];\nchar name[20];";
  analyze();
});
document.getElementById("clearBtn").addEventListener("click", () => {
  input.value = "";
  messagesBox.innerHTML = '<p class="empty">Click Analyze Code to see results.</p>';
  symbolsBox.innerHTML = '<tr><td colspan="3" class="empty">No symbols yet</td></tr>';
  setCounts(0, 0, 0);
  setStatus("Not analyzed", "");
});

function analyze() {
  const lines = input.value.split(/\r?\n/);
  const table = new Map();
  const messages = [];
  let total = 0, valid = 0, errors = 0;

  lines.forEach((raw, i) => {
    const line = raw.trim();
    const n = i + 1;
    if (!line || line.startsWith("//")) return;
    total++;

    const match = /^(int|float|char)\s+([A-Za-z_][A-Za-z0-9_]*)\s*\[\s*(\d+)\s*\]\s*;$/.exec(line);
    if (!match) {
      let reason = "Expected format: int marks[10];";
      if (/^(int|float|char)\s+[A-Za-z_]\w*\s*\[\s*\d+\s*\]\s*$/.test(line)) {
        reason = "Missing semicolon at the end.";
      } else if (/^(int|float|char)\s+[A-Za-z_]\w*\s+\d+\s*\];?$/.test(line)) {
        reason = "Missing opening square bracket '['.";
      } else if (/^(int|float|char)\s+\d+\s*\[/.test(line)) {
        reason = "Invalid variable name. Names cannot start with a digit.";
      } else if (/^(int|float|char)\s+[A-Za-z_]\w*\s*\[\s*0+\s*\]\s*;$/.test(line)) {
        reason = "Array size must be greater than zero.";
      } else if (/^(?!int\b|float\b|char\b)[A-Za-z]+\s+/.test(line)) {
        reason = "Unsupported type. Use int, float, or char.";
      }
      messages.push({ok: false, title: `Line ${n}: Invalid declaration`, text: reason});
      errors++;
      return;
    }

    const type = match[1], name = match[2], size = Number(match[3]);
    if (size <= 0) {
      messages.push({ok: false, title: `Line ${n}: Invalid size`, text: "Array size must be a positive integer."});
      errors++;
    } else if (table.has(name)) {
      messages.push({ok: false, title: `Line ${n}: Duplicate name`, text: `"${name}" is already declared in this scope.`});
      errors++;
    } else {
      table.set(name, {type, size});
      messages.push({ok: true, title: `Line ${n}: Valid declaration`, text: `${type} ${name}[${size}];`});
      valid++;
    }
  });

  setCounts(total, valid, errors);
  setStatus(errors ? "Errors found" : "Analysis passed", errors ? "error" : "success");
  messagesBox.innerHTML = messages.length
    ? messages.map(m => `<div class="message ${m.ok ? "ok" : "bad"}"><b>${escapeHtml(m.title)}</b>${escapeHtml(m.text)}</div>`).join("")
    : '<p class="empty">No declarations entered.</p>';
  symbolsBox.innerHTML = table.size
    ? Array.from(table, ([name, data]) => `<tr><td>${escapeHtml(name)}</td><td>${data.type}</td><td>${data.size}</td></tr>`).join("")
    : '<tr><td colspan="3" class="empty">No valid declarations</td></tr>';
}

function setCounts(total, valid, errors) {
  document.getElementById("total").textContent = total;
  document.getElementById("valid").textContent = valid;
  document.getElementById("errors").textContent = errors;
}
function setStatus(text, kind) {
  const status = document.getElementById("status");
  status.textContent = text;
  status.className = "status" + (kind ? " " + kind : "");
}
function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[c]);
}
