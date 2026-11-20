from rest_framework.routers import SimpleRouter

from usuarios.controllers import AutenticacaoController, UsuarioController

# O Router lê os métodos de cada controller (list, create, retrieve... e as @action)
# e gera as rotas sozinho:
#   usuarios/, usuarios/<usuario_id>/, usuarios/<usuario_id>/reativar/
#   auth/login/, auth/eu/
router = SimpleRouter()
router.register('usuarios', UsuarioController, basename='usuario')
router.register('auth', AutenticacaoController, basename='auth')

urlpatterns = router.urls
