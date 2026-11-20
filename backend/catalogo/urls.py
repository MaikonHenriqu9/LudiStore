from rest_framework.routers import SimpleRouter

from catalogo.controllers import BrinquedoController, CategoriaController, MarcaController

# O Router gera, para cada recurso, as rotas recurso/, recurso/<id>/ e recurso/<id>/reativar/.
router = SimpleRouter()
router.register('marcas', MarcaController, basename='marca')
router.register('categorias', CategoriaController, basename='categoria')
router.register('brinquedos', BrinquedoController, basename='brinquedo')

urlpatterns = router.urls
