from django.contrib.auth import get_user_model, authenticate
from django.core.exceptions import ValidationError
from rest_framework import serializers

from api_buddy.models import Buddy

class BuddySerializer(serializers.ModelSerializer):
    user = serializers.DictField(child = serializers.CharField(), source = 'get_user_info', read_only = True)
    is_buddy_with = serializers.DictField(child = serializers.CharField(), source = 'get_buddy_info', read_only = True)

    class Meta:
        model = Buddy
        fields = ('user', 'is_buddy_with')
        read_only_fields = ('user', 'is_buddy_with')
