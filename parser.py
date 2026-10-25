
import re

def check_array_declaration(s):
    pattern = r'^\s*(int|float|char)\s+[a-zA-Z_]\w*\s*\[\s*\d+\s*\]\s*;\s*$'

    if re.match(pattern, s):
        print("Valid Array Declaration")
    else:
        print("Invalid Array Declaration")

declaration = input("Enter array declaration: ")
check_array_declaration(declaration)

