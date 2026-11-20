from abc import ABC, abstractmethod
from django.contrib.auth.hashers import make_password
from usuarios.models import Usuario


class UsuarioFactory(ABC):
    def criar(self, dados):
        self.validar(dados)

        usuario = Usuario(**dados)
        usuario.senha = make_password(dados['senha'])
        usuario.perfil = self.perfil()

        return usuario

    @abstractmethod
    def perfil(self):
        pass

    def validar(self, dados):
        tipo_pessoa = dados.get('tipo_pessoa', Usuario.TipoPessoa.FISICA)

        if tipo_pessoa == Usuario.TipoPessoa.FISICA and not dados.get('cpf'):
            raise ValueError('CPF é obrigatório para pessoa física.')

        if tipo_pessoa == Usuario.TipoPessoa.JURIDICA and not dados.get('cnpj'):
            raise ValueError('CNPJ é obrigatório para pessoa jurídica.')