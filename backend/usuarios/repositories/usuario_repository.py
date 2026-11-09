from usuarios.models import Usuario

class UsuarioRepository:
    def salvar(self, usuario):
        usuario.save()
        return usuario

    def buscar_por_id(self, usuario_id):
        return Usuario.objects.filter(id=usuario_id).first()

    def buscar_por_email(self, usuario_email):
        return Usuario.objects.filter(email=usuario_email).first()

    def listar_todos(self):
        return Usuario.objects.all()

    def listar_ativos(self):
        return Usuario.objects.filter(ativo=True)

    def existe_email(self, usuario_email):
        return Usuario.objects.filter(email=usuario_email).exists()

    def existe_cpf(self, usuario_cpf):
        return Usuario.objects.filter(cpf=usuario_cpf).exists()

    def listar_ativos(self):
        return Usuario.objects.filter(ativo=True)

    def existe_email_em_outro_usuario(self, usuario_email, usuario_id):
        return Usuario.objects.filter(email=usuario_email).exclude(id=usuario_id).exists()

    def existe_cpf_em_outro_usuario(self, usuario_cpf, usuario_id):
        return Usuario.objects.filter(cpf=usuario_cpf).exclude(id=usuario_id).exists()