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
    
class TournamentMatchSerializer(serializers.ModelSerializer):
    player1_username = serializers.CharField(source='player1.username', read_only=True)
    player2_username = serializers.CharField(source='player2.username', read_only=True)
    winner_username = serializers.CharField(source='winner.username', read_only=True, allow_null=True)

    class Meta:
        model = TournamentMatch
        fields = '__all__'
        read_only_fields = ['scheduled_time', 'match_round', 'tournament', 'player1', 'player2', 'status']

    def validate(self, data):
        # skip player registration if PUT request
        if not self.instance:
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
        winner_username = validated_data.get('winner', None)
        #winner_id = validated_data.get('winner', None)
        if winner_username:
            try:
                winner = Player.objects.get(username=winner_username)
                instance.winner = winner
                instance.status = 'Completed'
                instance.save()
                return instance
            except Player.DoesNotExist:
                raise serializers.ValidationError({'winner_username': 'Winner username does not exist!'})
        else:
            raise serializers.ValidationError({'winner': 'Winner id is required to update the match!'})

class TournamentSerializer(serializers.ModelSerializer):
    participants = serializers.SlugRelatedField(
        many=True,
        queryset=Player.objects.all(),
        slug_field='username',
        required=False # Participants not required for creating a tournament
    )

    matches = TournamentMatchSerializer(many=True, read_only=True)

    class Meta:
        model = Tournament
        fields = '__all__'

    def create(self, validated_data):
        # when creating tournament, participants are not required
        participants_data = validated_data.pop('participants', None)
        tournament = Tournament.objects.create(**validated_data)

        # if participants are provided, add them to the tournament
        if participants_data:
            tournament.participants.set(participants_data)
        return tournament
    
    def update(self, instance, validated_data):
        # perform standard update
        instance = super().update(instance, validated_data)

        # check if first round matches are completed
        first_round_matches = instance.matches.filter(match_round=1)
        if first_round_matches.count() == 2 and all(match.status == 'Completed' for match in first_round_matches):
            instance.status = 'Finals'
            instance.save()

        # check if final match is completed
        final_matches = instance.matches.filter(match_round=2)
        if final_matches.count() == 1 and all(match.status == 'Completed' for match in final_matches):
            instance.status = 'Completed'
            instance.save()
        return instance