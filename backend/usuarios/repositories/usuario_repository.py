from usuarios.models import Usuario
from django.db.models import Q

class UsuarioRepository:
    def salvar(self, usuario):
        usuario.save()
        return usuario

    def buscar_por_id(self, usuario_id):
        return Usuario.objects.filter(pk=usuario_id).first()

    def buscar_por_email(self, usuario_email):
        return Usuario.objects.filter(email=usuario_email).first()

    def listar_todos(self):
        return Usuario.objects.all().order_by("nome")

    def existe_email(self, usuario_email):
        return Usuario.objects.filter(email=usuario_email).exists()

    def existe_cpf(self, usuario_cpf):
        return Usuario.objects.filter(cpf=usuario_cpf).exists()

    def existe_cnpj(self, usuario_cnpj):
        return Usuario.objects.filter(cnpj=usuario_cnpj).exists()

    def existe_email_em_outro_usuario(self, usuario_email, usuario_id):
        return Usuario.objects.filter(email=usuario_email).exclude(pk=usuario_id).exists()

    def existe_cpf_em_outro_usuario(self, usuario_cpf, usuario_id):
        return Usuario.objects.filter(cpf=usuario_cpf).exclude(pk=usuario_id).exists()
    
    def existe_cnpj_em_outro_usuario(self, usuario_cnpj, usuario_id):
        return Usuario.objects.filter(cnpj=usuario_cnpj).exclude(pk=usuario_id).exists()

    def pesquisar_usuario(self, termo):
        filtro = (
            Q(nome__icontains=termo)
            | Q(email__icontains=termo)
            | Q(cpf=termo)
            | Q(cnpj=termo)
            | Q(telefone=termo)
        )

        if termo.isdigit():
            filtro |= Q(usuario_id=termo)

        return Usuario.objects.filter(filtro).order_by('nome')


