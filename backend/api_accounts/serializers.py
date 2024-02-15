from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from django.contrib.auth import get_user_model, authenticate
from django.db.models import Q

from .models import Notification, Player, MatchHistory, Tournament, TournamentMatch
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
    
class UserSerializer(serializers.ModelSerializer):
    isbuddy = serializers.SerializerMethodField()
    is_two_factor_enabled = serializers.BooleanField(read_only=True)

    class Meta:
        model = ModelUser
        fields = ('id', 'email', 'username', 'games_played', 'games_won', 'games_lost', 'games_tied', 'date_joined', 'custom_title', 'profile_avatar', 'isbuddy', 'is_two_factor_enabled', 'is_logged_in')

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
    
class MatchHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = MatchHistory
        fields = ['id', 'player1', 'player2', 'winner', 'date_played', 'details']
    
    def validate_player1(self, value):
        if value == self.initial_data['player1']:
            return value
        if not ModelUser.objects.filter(username=value).exists():
            raise serializers.ValidationError('Player1 username does not exist!')
        return value

    def validate_player2(self, value):
        if value == self.initial_data['player2']:
            return value
        if not ModelUser.objects.filter(username=value).exists():
            raise serializers.ValidationError('Player2 username does not exist!')
        return value
    
    def validate_winner(self, value):
        if value == self.initial_data['winner']:
            return value
        if not ModelUser.objects.filter(username=value).exists():
            raise serializers.ValidationError('Winner username does not exist!')
        return value
    
class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

class TournamentMatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentMatch
        fields = '__all__'

    def validate(self, data):
        # check that both players are registered on the website
        player1 = data.get('player1')
        player2 = data.get('player2')

        if not player1 or not Player.objects.filter(id=player1.id).exists():
            raise serializers.ValidationError('Player1 is not registered on the website!')

        if not player2 or not Player.objects.filter(id=player2.id).exists():
            raise serializers.ValidationError('Player2 is not registered on the website!')
        
        # check if its different players
        if player1 == player2:
            raise serializers.ValidationError('Player1 and Player2 cannot be the same!')
        
        # check that there are 2 different usernames
        if player1.username == player2.username:
            raise serializers.ValidationError('Players must have different usernames!')

        return data
    
    def create(self, validated_data):
        match = TournamentMatch.objects.create(**validated_data)
        return match
    
    def update(self, instance, validated_data):
        instance.winner = validated_data.get('winner', instance.winner)
        instance.save()
        return instance