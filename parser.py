class ParserError(Exception):
    pass


class Parser:
    def __init__(self, tokens):
        self.tokens = tokens
        self.position = 0

    def current(self):
        if self.position < len(self.tokens):
            return self.tokens[self.position]

        return {"type": "EOF", "value": ""}

    def expect(self, expected_type):
        token = self.current()

        if token["type"] != expected_type:
            found = token["value"] or "end of input"
            raise ParserError(
                f"Expected {expected_type}, but found '{found}'"
            )

        self.position += 1
        return token

    # P -> D P | epsilon
    def parse_program(self):
        declarations = []

        while self.current()["type"] != "EOF":
            declarations.append(self.parse_declaration())

        return {
            "type": "Program",
            "declarations": declarations
        }

    # D -> T id [ num ] ;
    def parse_declaration(self):
        type_token = self.expect("KEYWORD")

        if type_token["value"] not in {"int", "float", "char"}:
            raise ParserError(
                f"Invalid data type '{type_token['value']}'"
            )

        name_token = self.expect("IDENTIFIER")
        self.expect("LBRACKET")
        size_token = self.expect("NUMBER")
        self.expect("RBRACKET")
        self.expect("SEMICOLON")

        return {
            "type": "ArrayDeclaration",
            "data_type": type_token["value"],
            "name": name_token["value"],
            "size": int(size_token["value"])
        }


def parse(tokens):
    if not tokens or tokens[-1]["type"] != "EOF":
        tokens = tokens + [{"type": "EOF", "value": ""}]

    parser = Parser(tokens)
    return parser.parse_program()
