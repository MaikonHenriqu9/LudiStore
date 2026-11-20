class RegraDeNegocioError(Exception):
    """Uma regra de negócio foi violada. A API responde 400 Bad Request."""


class NaoEncontradoError(Exception):
    """O registro não existe ou está desativado. A API responde 404 Not Found."""
