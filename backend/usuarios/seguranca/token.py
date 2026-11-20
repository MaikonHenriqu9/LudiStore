from django.core import signing

from core import NaoAutenticadoError

# O token é assinado com a SECRET_KEY do Django (mesma ideia do JWT):
# qualquer alteração no texto do token invalida a assinatura.
SALT = 'ludistore.autenticacao'
VALIDADE_SEGUNDOS = 60 * 60 * 8  # 8 horas


def gerar_token(usuario):
    return signing.dumps({'usuario_id': usuario.pk}, salt=SALT)


def ler_token(token):
    """Devolve o id do usuário dono do token, ou lança NaoAutenticadoError."""
    try:
        dados = signing.loads(token, salt=SALT, max_age=VALIDADE_SEGUNDOS)
    except signing.SignatureExpired:
        raise NaoAutenticadoError('Sessão expirada. Faça login novamente.')
    except signing.BadSignature:
        raise NaoAutenticadoError('Token inválido.')

    return dados['usuario_id']
