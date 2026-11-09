from catalogo.models import Categoria


class CategoriaRepository:
    def salvar(self, categoria):
        categoria.save()
        return categoria

    def buscar_por_id(self, categoria_id):
        return Categoria.objects.filter(id=categoria_id).first()

    def listar_ativas(self):
        return Categoria.objects.filter(ativo=True)

    def existe_nome(self, nome, ignorar_id=None):
        consulta = Categoria.objects.filter(nome__iexact=nome)

        if ignorar_id:
            consulta = consulta.exclude(id=ignorar_id)

        return consulta.exists()

    def buscar_ativas_por_ids(self, categorias_ids):
        return list(Categoria.objects.filter(id__in=categorias_ids, ativo=True))
