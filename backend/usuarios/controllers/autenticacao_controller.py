from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from usuarios.dtos import LoginDTO, UsuarioResponseDTO
from usuarios.seguranca import VALIDADE_SEGUNDOS, Autenticado, PermissoesPorAcaoMixin, Publico
from usuarios.services import AutenticacaoService


class AutenticacaoController(PermissoesPorAcaoMixin, ViewSet):
    permissoes_por_acao = {
        'login': [Publico],
        'eu': [Autenticado],
    }

    # POST /api/auth/login/   { "email": "...", "senha": "..." }
    @action(detail=False, methods=['post'])
    def login(self, request):
        dto = LoginDTO(data=request.data)
        dto.is_valid(raise_exception=True)

        usuario, token = AutenticacaoService().login(dto.validated_data['email'], dto.validated_data['senha'])

        return Response({
            'token': token,
            'tipo': 'Bearer',
            'expira_em_segundos': VALIDADE_SEGUNDOS,
            'usuario': UsuarioResponseDTO(usuario).data,
        })

    # GET /api/auth/eu/   devolve o usuário dono do token
    @action(detail=False, methods=['get'])
    def eu(self, request):
        return Response(UsuarioResponseDTO(request.user).data)
