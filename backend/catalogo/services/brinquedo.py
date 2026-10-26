from catalogo.models import Brinquedo

from .eventos import BrinquedoEventos, eventos
from .permissoes.servico import PermissaoService


class BrinquedoService:
    """Casos de uso do catálogo. Junta Strategy (permissões) e Observer (eventos)."""

    CAMPOS_PROTEGIDOS = {"id", "criado_por", "criado_por_id", "criado_em", "atualizado_em"}

    def __init__(self, usuario):
        self.usuario = usuario
        self.permissao = PermissaoService(usuario)

    def listar_catalogo(self):
        consulta = Brinquedo.objects.select_related("categoria", "criado_por")
        return self.permissao.brinquedos_visiveis(consulta)

    def listar_gerenciaveis(self):
        consulta = Brinquedo.objects.select_related("categoria", "criado_por")
        return self.permissao.brinquedos_gerenciaveis(consulta)

    def obter(self, brinquedo_id):
        brinquedo = Brinquedo.objects.get(pk=brinquedo_id)
        if not self.permissao.pode_visualizar(brinquedo):
            raise PermissionError("Sem permissão para visualizar este brinquedo.")
        return brinquedo

    def criar(self, dados):
        if not self.permissao.pode_criar():
            raise PermissionError("Sem permissão para cadastrar brinquedos.")
        brinquedo = Brinquedo.objects.create(criado_por=self.usuario, **dados)
        eventos.notificar(
            BrinquedoEventos.BRINQUEDO_CADASTRADO,
            {"brinquedo": brinquedo, "usuario": self.usuario},
        )
        return brinquedo

    def editar(self, brinquedo_id, dados):
        brinquedo = Brinquedo.objects.get(pk=brinquedo_id)
        if not self.permissao.pode_editar(brinquedo):
            raise PermissionError("Sem permissão para editar este brinquedo.")
        for campo, valor in dados.items():
            if campo not in self.CAMPOS_PROTEGIDOS:
                setattr(brinquedo, campo, valor)
        brinquedo.save()
        return brinquedo

    def excluir(self, brinquedo_id):
        brinquedo = Brinquedo.objects.get(pk=brinquedo_id)
        if not self.permissao.pode_excluir(brinquedo):
            raise PermissionError("Sem permissão para excluir este brinquedo.")
        brinquedo.delete()