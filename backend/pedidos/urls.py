from rest_framework.routers import SimpleRouter

from pedidos.controllers import PedidoController

# Gera pedidos/, pedidos/<pedido_id>/ e pedidos/vendas/
router = SimpleRouter()
router.register('pedidos', PedidoController, basename='pedido')

urlpatterns = router.urls
