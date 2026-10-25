

def analyze(ast):
    symbol_table = {}
    errors = []

    declarations = ast.get("declarations", [])

    for declaration in declarations:
        data_type = declaration["data_type"]
        name = declaration["name"]
        size = declaration["size"]

        # Rule 1: Array size must be positive
        if size <= 0:
            errors.append(
                f"Semantic Error: Array '{name}' "
                "must have a size greater than zero."
            )
            continue

        # Rule 2: Duplicate array names are not allowed
        if name in symbol_table:
            errors.append(
                f"Semantic Error: Array '{name}' "
                "is declared more than once."
            )
            continue

        # Store valid declarations
        symbol_table[name] = {
            "data_type": data_type,
            "size": size
        }

    return symbol_table, errors
