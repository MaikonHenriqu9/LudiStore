from abc import ABC, abstractmethod

from django.contrib.auth.hashers import make_password

from usuarios.models import Usuario


class UsuarioFactory(ABC):
    """Roteiro fixo de criação. As filhas só definem o que muda por perfil."""

    def criar(self, dados, quem_cria=None):
        if not self.pode_ser_criado_por(quem_cria):
            raise PermissionError("Sem permissão para criar este perfil.")
        self.validar(dados)
        return Usuario.objects.create(
            nome=dados["nome"],
            email=dados["email"],
            senha=make_password(dados["senha"]),
            perfil=self.perfil(),
            foto_url=dados.get("foto_url", ""),
            telefone=dados.get("telefone", ""),
        )

    def validar(self, dados):
        for campo in self.campos_obrigatorios():
            if not dados.get(campo):
                raise ValueError(f"O campo '{campo}' é obrigatório.")
        if Usuario.objects.filter(email=dados["email"]).exists():
            raise ValueError("Já existe um usuário com este e-mail.")

    @abstractmethod
    def perfil(self):
        """Qual perfil esta fábrica cria."""

    @abstractmethod
    def campos_obrigatorios(self):
        """Quais campos o cadastro deste perfil exige."""

    @abstractmethod
    def pode_ser_criado_por(self, quem_cria):
        """Quem tem permissão para criar este perfil."""