
const input = document.getElementById("sourceCode");
const messagesBox = document.getElementById("messages");
const symbolsBox = document.getElementById("symbols");

const analyzeBtn = document.getElementById("analyzeBtn");
const exampleBtn = document.getElementById("exampleBtn");
const clearBtn = document.getElementById("clearBtn");

analyzeBtn.addEventListener("click", analyze);

exampleBtn.addEventListener("click", () => {
    input.value =
        "int marks[10];\n" +
        "float prices[5];\n" +
        "char name[20];";

    analyze();
});

clearBtn.addEventListener("click", () => {
    input.value = "";

    messagesBox.innerHTML =
        '<p class="empty">Click Analyze Code to see results.</p>';

    symbolsBox.innerHTML =
        '<tr><td colspan="3" class="empty">No symbols yet</td></tr>';

    setCounts(0, 0, 0);
    setStatus("Not analyzed", "");
});

async function analyze() {
    const source = input.value;

    const total = source
        .split(/\r?\n/)
        .filter(line => {
            const trimmed = line.trim();
            return trimmed && !trimmed.startsWith("//");
        }).length;

    if (!source.trim()) {
        setCounts(0, 0, 1);
        setStatus("Input required", "error");

        messagesBox.innerHTML =
            '<div class="message bad">' +
            '<b>No input</b>' +
            'Please enter at least one array declaration.' +
            '</div>';

        symbolsBox.innerHTML =
            '<tr><td colspan="3" class="empty">' +
            'No valid declarations' +
            '</td></tr>';

        return;
    }

    analyzeBtn.disabled = true;
    setStatus("Analyzing...", "");

    messagesBox.innerHTML =
        '<p class="empty">Running compiler analysis...</p>';

    try {
        // Send source code to the Python Flask backend
        const response = await fetch("/compile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                code: source
            })
        });

        const result = await response.json();

        if (!response.ok && !result.errors) {
            throw new Error("The server returned an unexpected response.");
        }

        const errors = Array.isArray(result.errors)
            ? result.errors
            : [];

        const symbolTable = result.symbol_table || {};
        const valid = Object.keys(symbolTable).length;

        setCounts(total, valid, errors.length);

        // Display the result returned by Python
        if (result.status === "success") {
            setStatus("Analysis passed", "success");

            messagesBox.innerHTML =
                '<div class="message ok">' +
                '<b>Compilation successful!</b>' +
                'All declarations passed lexical, syntax, ' +
                'and semantic analysis.' +
                '</div>';
        } else {
            setStatus("Errors found", "error");

            const stageNames = {
                lexical: "Lexical Error",
                syntax: "Syntax Error",
                semantic: "Semantic Error",
                input: "Input Error"
            };

            const title =
                stageNames[result.stage] || "Compilation Error";

            messagesBox.innerHTML = errors.length
                ? errors.map(error =>
                    '<div class="message bad">' +
                    '<b>' + escapeHtml(title) + '</b>' +
                    escapeHtml(error) +
                    '</div>'
                ).join("")
                : '<p class="empty">No error details returned.</p>';
        }

        // Display the symbol table returned by semantic.py
        const entries = Object.entries(symbolTable);

        symbolsBox.innerHTML = entries.length
            ? entries.map(([name, data]) =>
                '<tr>' +
                '<td>' + escapeHtml(name) + '</td>' +
                '<td>' + escapeHtml(data.data_type) + '</td>' +
                '<td>' + escapeHtml(data.size) + '</td>' +
                '</tr>'
            ).join("")
            : '<tr><td colspan="3" class="empty">' +
              'No valid declarations' +
              '</td></tr>';

    } catch (error) {
        setStatus("Connection error", "error");
        setCounts(total, 0, 1);

        messagesBox.innerHTML =
            '<div class="message bad">' +
            '<b>Could not connect to the backend</b>' +
            'Make sure Member 6 has started the Flask application ' +
            'and that the /compile endpoint is available.' +
            '</div>';

        symbolsBox.innerHTML =
            '<tr><td colspan="3" class="empty">' +
            'No symbols available' +
            '</td></tr>';

        console.error("Compiler request failed:", error);

    } finally {
        analyzeBtn.disabled = false;
    }
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
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

