from django.urls import path

from catalogo.controllers import (
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
]