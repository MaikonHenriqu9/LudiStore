class RegraDeNegocioError(Exception):
    """Uma regra de negócio foi violada. A API responde 400 Bad Request."""


class NaoAutenticadoError(Exception):
    """Login inválido ou ausente. A API responde 401 Unauthorized."""


class SemPermissaoError(Exception):
    """O usuário está logado, mas não pode fazer isso. A API responde 403 Forbidden."""


class NaoEncontradoError(Exception):
    """O registro não existe ou está desativado. A API responde 404 Not Found."""
