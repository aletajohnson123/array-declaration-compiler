
from flask import Flask, render_template, request, jsonify

from lexer import tokenize
from parser import parse, ParserError
from semantic import analyze

app = Flask(__name__)


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/compile", methods=["POST"])
def compile_code():
    data = request.get_json(silent=True) or {}
    source = data.get("code", "")

    if not isinstance(source, str):
        return jsonify({
            "status": "error",
            "stage": "input",
            "errors": ["Source code must be text."]
        }), 400

    if not source.strip():
        return jsonify({
            "status": "error",
            "stage": "input",
            "errors": ["Please enter an array declaration."]
        }), 400

    # Stage 1: Lexical analysis
    tokens, lexical_errors = tokenize(source)

    if lexical_errors:
        return jsonify({
            "status": "error",
            "stage": "lexical",
            "errors": lexical_errors
        })

    # Stage 2: Syntax analysis
    try:
        ast = parse(tokens)
    except ParserError as error:
        return jsonify({
            "status": "error",
            "stage": "syntax",
            "errors": [str(error)]
        })

    # Stage 3: Semantic analysis
    symbol_table, semantic_errors = analyze(ast)

    if semantic_errors:
        return jsonify({
            "status": "error",
            "stage": "semantic",
            "errors": semantic_errors,
            "symbol_table": symbol_table
        })

    return jsonify({
        "status": "success",
        "message": "Compilation successful!",
        "tokens": tokens,
        "ast": ast,
        "symbol_table": symbol_table,
        "errors": []
    })


if __name__ == "__main__":
    app.run(debug=True)

