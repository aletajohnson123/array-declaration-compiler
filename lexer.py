
code = """
int marks[10];
float prices[5];
char name[20];
int marks[0];
int 123[5];
"""

keywords = ["int", "float", "char"]
operators = "+-*/=%<>"
symbols = "(){}[],;"

i = 0

print("ARRAY DECLARATION COMPILER")
print("LEXICAL ANALYSIS OUTPUT")

while i < len(code):

    # Ignore spaces and newline
    if code[i].isspace():
        i += 1
        continue

    # Identify keywords and identifiers
    elif code[i].isalpha() or code[i] == '_':
        token = ""

        while i < len(code) and (
            code[i].isalnum() or code[i] == '_'
        ):
            token += code[i]
            i += 1

        if token in keywords:
            print(token, "-> KEYWORD")
        else:
            print(token, "-> IDENTIFIER")

    # Identify numbers
    elif code[i].isdigit():
        token = ""

        while i < len(code) and code[i].isdigit():
            token += code[i]
            i += 1

        print(token, "-> NUMBER")

    # Identify operators
    elif code[i] in operators:
        print(code[i], "-> OPERATOR")
        i += 1

    # Identify special symbols
    elif code[i] in symbols:
        print(code[i], "-> SPECIAL SYMBOL")
        i += 1

    # Identify invalid characters
    else:
        print(code[i], "-> INVALID CHARACTER")
        i += 1

