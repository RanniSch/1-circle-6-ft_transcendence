from django.db import models

from api_accounts.models import Player

# Create your models here.

class Buddy(models.Model):
    user = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='user')
    is_buddy_with = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='is_buddy_with')

    def get_user_info(self):
        user_vars = vars(self.user)
        return {'id': user_vars['id'], 'username': user_vars['username']}

    def get_buddy_info(self):
        buddy_vars = vars(self.is_buddy_with)
        return {'id': buddy_vars['id'], 'username': buddy_vars['username']}
    
    def get_buddied(self, user):
        return Buddy.objects.filter(is_buddy_with=user)
    
    def get_buddies(self, user):
        return Buddy.objects.filter(user=user).exclude(is_buddy_with=user)
    
    def get_buddied_requests(self, user):
        return Buddy.objects.filter(is_buddy_with=user).count()
    
    def get_buddies_count(self, user):
        return Buddy.objects.filter(user=user).count()
    
    def __str__(self):
        return f"{self.user.id} is buddies with {self.is_buddy_with.id}"
    