from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Q

from .models import Notification
from api_buddy.models import Buddy

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
            raise AuthenticationFailed('Invalid credentials - User not found!')
        return user
    
class UserSerializer(serializers.ModelSerializer):
    isbuddy = serializers.SerializerMethodField()

    class Meta:
        model = ModelUser
        fields = ('id', 'email', 'username', 'games_played', 'games_won', 'games_lost', 'games_tied', 'date_joined', 'custom_title', 'profile_avatar', 'isbuddy')

    def get_isbuddy(self, obj):
        request = self.context.get('request')
        if request and hasattr(request, 'user') and request.user.is_authenticated:
            return Buddy.objects.filter(
                Q(user=request.user, is_buddy_with=obj) |
                Q(user=obj, is_buddy_with=request.user)
            ).exists()
        return False

class AvatarUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModelUser
        fields = ('profile_avatar',)
    
    def update(self, instance, validated_data):
        instance.profile_avatar = validated_data['profile_avatar']
        instance.save()
        return instance
    
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'sender', 'receiver', 'message', 'timestamp', 'is_read']

class DeleteAccountSerializer(serializers.Serializer):
    confirm = serializers.CharField(max_length=10)

    def validate_confirm(self, value):
        if value != 'DELETE':
            raise serializers.ValidationError('Confirmation word is incorrect!')
        return value