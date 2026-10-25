KEYWORDS = {"int", "float", "char"}

SINGLE_CHAR_TOKENS = {
    "[": "LBRACKET",
    "]": "RBRACKET",
    ";": "SEMICOLON",
}


def tokenize(source):
    tokens = []
    errors = []
    i = 0

    while i < len(source):
        ch = source[i]

        # Ignore spaces, tabs, and newlines
        if ch.isspace():
            i += 1
            continue

        # Recognize keywords and identifiers
        if ch.isalpha() or ch == "_":
            start = i
            i += 1

            while i < len(source) and (
                source[i].isalnum() or source[i] == "_"
            ):
                i += 1

            value = source[start:i]

            if value in KEYWORDS:
                token_type = "KEYWORD"
            else:
                token_type = "IDENTIFIER"

            tokens.append({
                "type": token_type,
                "value": value
            })
            continue

        # Recognize integer numbers
        if ch.isdigit():
            start = i
            i += 1

            while i < len(source) and source[i].isdigit():
                i += 1

            tokens.append({
                "type": "NUMBER",
                "value": source[start:i]
            })
            continue

        # Recognize brackets and semicolon
        if ch in SINGLE_CHAR_TOKENS:
            tokens.append({
                "type": SINGLE_CHAR_TOKENS[ch],
                "value": ch
            })
            i += 1
            continue

        # Report any unrecognized character
        errors.append(
            f"Invalid character '{ch}' at position {i}"
        )
        i += 1

    tokens.append({"type": "EOF", "value": ""})

    return tokens, errors

