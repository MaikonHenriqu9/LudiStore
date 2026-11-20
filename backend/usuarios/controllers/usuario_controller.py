from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from usuarios.dtos import UsuarioCreateDTO, UsuarioResponseDTO, UsuarioUpdateDTO
from usuarios.seguranca import (
    Autenticado,
    PermissoesPorAcaoMixin,
    Publico,
    SomenteAdmin,
    eh_admin,
    exigir_dono_ou_admin,
)
from usuarios.services import UsuarioService


class UsuarioController(PermissoesPorAcaoMixin, ViewSet):
    """Todos os endpoints de usuários num lugar só, como um @RestController do Spring.

    As URLs são montadas pelo Router (usuarios/urls.py) a partir do nome de cada método.
    Os erros (400, 401, 403 e 404) são convertidos em core/tratador_excecoes.py,
    por isso não há try/except aqui.
    """

    lookup_field = 'usuario_id'     # nome do parâmetro da URL, como o @PathVariable
    lookup_value_regex = '[0-9]+'   # só aceita números: /usuarios/abc/ responde 404

    # Quem pode chamar cada método (RN02: só o admin gerencia usuários)
    permissoes_por_acao = {
        'create': [Publico],            # cadastro público
        'list': [SomenteAdmin],
        'retrieve': [Autenticado],      # o próprio usuário ou o admin
        'partial_update': [Autenticado],  # o próprio usuário ou o admin
        'destroy': [SomenteAdmin],
        'reativar': [SomenteAdmin],
    }

    # GET /api/usuarios/   e   GET /api/usuarios/?busca=ana
    def list(self, request):
        busca = request.query_params.get('busca', '').strip()

        if busca:
            usuarios = UsuarioService().busca_completa(busca)
        else:
            usuarios = UsuarioService().listar()

        return Response(UsuarioResponseDTO(usuarios, many=True).data)

    # POST /api/usuarios/
    def create(self, request):
        dto = UsuarioCreateDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        usuario = UsuarioService().cadastrar(dto.validated_data)
        return Response(UsuarioResponseDTO(usuario).data, status=status.HTTP_201_CREATED)

    # GET /api/usuarios/5/   (o admin também vê os desativados)
    def retrieve(self, request, usuario_id=None):
        exigir_dono_ou_admin(request.user, usuario_id, 'Você só pode ver o próprio cadastro.')

        usuario = UsuarioService().buscar(usuario_id, incluir_inativos=eh_admin(request.user))
        return Response(UsuarioResponseDTO(usuario).data)

    # PATCH /api/usuarios/5/
    def partial_update(self, request, usuario_id=None):
        exigir_dono_ou_admin(request.user, usuario_id, 'Você só pode alterar o próprio cadastro.')

        dto = UsuarioUpdateDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        usuario = UsuarioService().atualizar(usuario_id, dto.validated_data)
        return Response(UsuarioResponseDTO(usuario).data)

    # DELETE /api/usuarios/5/   (exclusão lógica)
    def destroy(self, request, usuario_id=None):
        UsuarioService().desativar(usuario_id)
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PATCH /api/usuarios/5/reativar/
    @action(detail=True, methods=['patch'])
    def reativar(self, request, usuario_id=None):
        usuario = UsuarioService().reativar(usuario_id)
        return Response(UsuarioResponseDTO(usuario).data)
