from catalogo.models import Marca


class MarcaRepository:
    def salvar(self, marca):
        marca.save()
        return marca

    def buscar_por_id(self, marca_id):
        return Marca.objects.filter(id=marca_id).first()

    def listar_ativas(self):
        return Marca.objects.filter(ativo=True)

    def existe_nome(self, nome, ignorar_id=None):
        consulta = Marca.objects.filter(nome__iexact=nome)

        if ignorar_id:
            consulta = consulta.exclude(id=ignorar_id)

        return consulta.exists()