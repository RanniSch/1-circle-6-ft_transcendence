from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Q

from .models import Notification, Player, GameSession, PlayerQueue, MatchHistory
from api_buddy.models import Buddy

import pyotp

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

class GameSessionSerializer(serializers.ModelSerializer):
    class Meta:
        model = GameSession
        fields = ['id', 'player1', 'player2', 'game_data', 'start_time', 'end_time', 'status']

    player1 = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all())
    player2 = serializers.PrimaryKeyRelatedField(queryset=Player.objects.all())
    game_data = serializers.JSONField()
    start_time = serializers.DateTimeField(read_only=True)
    end_time = serializers.DateTimeField(read_only=True)
    status = serializers.ChoiceField(choices=GameSession.STATUS_CHOICES, default='ongoing', read_only=True)
    
class UserSerializer(serializers.ModelSerializer):
    isbuddy = serializers.SerializerMethodField()
    is_two_factor_enabled = serializers.BooleanField(read_only=True)
    game_sessions = GameSessionSerializer(many=True, read_only=True, source='game_sessions_as_player1')

    class Meta:
        model = ModelUser
        fields = ('id', 'email', 'username', 'games_played', 'games_won', 'games_lost', 'games_tied', 'date_joined', 'custom_title', 'profile_avatar', 'isbuddy', 'is_two_factor_enabled', 'game_sessions')

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
    
class TwoFactorSetupSerializer(serializers.Serializer):
    enable_2fa = serializers.BooleanField()

    def update(self, instance, validated_data):
        instance.is_two_factor_enabled = validated_data.get('enable_2fa', instance.is_two_factor_enabled)
        if validated_data.get('enable_2fa') and not instance.totp_secret:
            instance.totp_secret = pyotp.random_base32()
        instance.save()
        return instance

class PlayerQueueSerializer(serializers.ModelSerializer):
    player = serializers.SlugRelatedField(slug_field='username', queryset=Player.objects.all())

    class Meta:
        model = PlayerQueue
        fields = ['id', 'player', 'timestamp']
    
    def create(self, validated_data):
        # Custon logic if needed
        return PlayerQueue.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Custom logic if needed
        instance.player = validated_data.get('player', instance.player)
        instance.save()
        return instance
    
class MatchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchHistory
        fields = ['id', 'player1', 'player2', 'winner', 'date_played', 'details']
    
    def validate_player1(self, value):
        if not ModelUser.objects.filter(username=value).exists():
            raise serializers.ValidationError('Player 1 username does not exist!')
        return value

    def validate_player2(self, value):
        if not ModelUser.objects.filter(username=value).exists():
            raise serializers.ValidationError('Player 2 username does not exist!')
        return value
    
    def validate_winner(self, value):
        if value and not ModelUser.objects.filter(username=value).exists():
            raise serializers.ValidationError('Winner username does not exist!')
        return value