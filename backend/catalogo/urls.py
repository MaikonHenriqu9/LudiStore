from django.urls import path

from catalogo.controllers import (
    BrinquedoController,
    BrinquedoDetalheController,
    CategoriaController,
    CategoriaDetalheController,
    MarcaController,
    MarcaDetalheController,
)

urlpatterns = [
    path('marcas/', MarcaController.as_view()),
    path('marcas/<int:marca_id>/', MarcaDetalheController.as_view()),
    path('categorias/', CategoriaController.as_view()),
    path('categorias/<int:categoria_id>/', CategoriaDetalheController.as_view()),
    path('brinquedos/', BrinquedoController.as_view()),
    path('brinquedos/<int:brinquedo_id>/', BrinquedoDetalheController.as_view()),
]
