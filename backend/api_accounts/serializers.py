from rest_framework import serializers
from django.contrib.auth import get_user_model, authenticate
from django.core.exceptions import ValidationError

from .models import Player, PlayerManager

ModelUser = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelUser
        fields = '__all__'
    def create(self, validated_data):
        user_object = ModelUser.objects.create_user(email=validated_data['email'], password=validated_data['password'])
        user_object.username = validated_data['username']
        user_object.save()
        return user_object

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    
    def validate_user(self, validated_data):
        user = authenticate(username=validated_data['email'], password=validated_data['password'])
        if not user:
            raise ValidationError('Invalid credentials - User not found!')
        return user
    
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelUser
        fields = ('id', 'email', 'username', 'games_played', 'games_won', 'games_lost', 'games_tied', 'date_joined', 'custom_title', 'profile_avatar')

class AvatarUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelUser
        fields = ('profile_avatar',)
    
    def update(self, instance, validated_data):
        instance.profile_avatar = validated_data['profile_avatar']
        instance.save()
        return instance