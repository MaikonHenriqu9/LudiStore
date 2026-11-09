from django.urls import path

from usuarios.controllers import UsuarioController

urlpatterns = [
    path('', UsuarioController.as_view()),
]