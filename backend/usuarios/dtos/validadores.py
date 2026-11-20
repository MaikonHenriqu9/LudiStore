from django.core.validators import RegexValidator

# Validação de FORMATO (por isso fica no DTO): só números, sem pontos, traços ou barras.
# Exemplo: "12345678900" passa; "123.456.789-00" é recusado.
apenas_digitos = RegexValidator(r'^\d+$', 'Informe apenas números, sem pontos, traços ou barras.')
