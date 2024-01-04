from rest_framework import serializers

from .models import Player, Game, Tournament, TournamentGame

class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        #fields = ('id', 'alias', 'registration_date') #custom fields that will be saved in db
        fields = '__all__'
    
    def validate_alias(self, value):
        if Player.objects.filter(alias=value).exists():
            raise serializers.ValidationError("Nickname must be unique!")
        return value

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = '__all__'
    
    def get_duration(self, obj):
        return obj.end_time - obj.start_time

class TournamentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tournament
        fields = '__all__'

class TournamentGameSerializer(serializers.ModelSerializer):
    class Meta:
        model = TournamentGame
        fields = '__all__'