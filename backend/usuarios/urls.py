from django.urls import path

from usuarios.controllers import UsuarioController, UsuarioDetalheController

urlpatterns = [
    path('', UsuarioController.as_view()),
    path('<int:usuario_id>/', UsuarioDetalheController.as_view()),
]