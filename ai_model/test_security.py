from security_rules import security_check

message = input("Enter a message: ")

score, risk, patterns = security_check(message)

print("\nSecurity Score:", score)
print("Risk Level:", risk)
print("Detected Patterns:", patterns)