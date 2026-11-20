from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from usuarios.dtos import UsuarioCreateDTO, UsuarioResponseDTO, UsuarioUpdateDTO
from usuarios.services import UsuarioService


class UsuarioController(ViewSet):
    """Todos os endpoints de usuários num lugar só, como um @RestController do Spring.

    As URLs são montadas pelo Router (usuarios/urls.py) a partir do nome de cada método.
    Os erros do negócio (400 e 404) são convertidos em core/tratador_excecoes.py,
    por isso não há try/except aqui.
    """

    lookup_field = 'usuario_id'     # nome do parâmetro da URL, como o @PathVariable
    lookup_value_regex = '[0-9]+'   # só aceita números: /usuarios/abc/ responde 404

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
        usuario = UsuarioService().buscar(usuario_id, incluir_inativos=True)
        return Response(UsuarioResponseDTO(usuario).data)

    # PATCH /api/usuarios/5/
    def partial_update(self, request, usuario_id=None):
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
