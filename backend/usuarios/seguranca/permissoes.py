from rest_framework.permissions import BasePermission

from core import SemPermissaoError
from usuarios.models import Usuario


def eh_admin(usuario):
    return usuario is not None and usuario.perfil == Usuario.Perfil.ADMIN


def exigir_dono_ou_admin(usuario, dono_id, mensagem):
    """Regra de posse: só o próprio dono do registro (ou o admin) pode continuar."""
    if not eh_admin(usuario) and str(usuario.pk) != str(dono_id):
        raise SemPermissaoError(mensagem)


class Publico(BasePermission):
    """Qualquer um, com ou sem login."""

    def has_permission(self, request, view):
        return True


class Autenticado(BasePermission):
    message = 'Faça login para continuar.'

    def has_permission(self, request, view):
        return request.user is not None


class SomenteAdmin(BasePermission):
    message = 'Somente o administrador pode fazer isso.'

    def has_permission(self, request, view):
        return eh_admin(request.user)


class VendedorOuAdmin(BasePermission):
    message = 'Somente vendedores podem fazer isso.'

    def has_permission(self, request, view):
        return request.user is not None and request.user.perfil in (Usuario.Perfil.VENDEDOR, Usuario.Perfil.ADMIN)


class PermissoesPorAcaoMixin:
    """Deixa cada controller dizer a permissão de cada método num dicionário.

    Exemplo:  permissoes_por_acao = {'list': [Publico], 'create': [SomenteAdmin]}

    Um método que não está no dicionário exige login (seguro por padrão).
    """

    permissoes_por_acao = {}

    def get_permissions(self):
        classes = self.permissoes_por_acao.get(self.action, [Autenticado])
        return [classe() for classe in classes]
