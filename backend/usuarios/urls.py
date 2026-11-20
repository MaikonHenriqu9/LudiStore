from rest_framework.routers import SimpleRouter

from usuarios.controllers import UsuarioController

# O Router lê os métodos do UsuarioController (list, create, retrieve...)
# e gera sozinho as rotas usuarios/ e usuarios/<usuario_id>/.
router = SimpleRouter()
router.register('usuarios', UsuarioController, basename='usuario')

urlpatterns = router.urls
