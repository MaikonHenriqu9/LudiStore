from rest_framework import serializers


class LoginDTO(serializers.Serializer):
    email = serializers.EmailField()
    senha = serializers.CharField()
