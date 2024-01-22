from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from rest_framework import permissions, generics
from rest_framework_simplejwt.authentication import JWTAuthentication

from api_accounts.models import Player
from .models import Buddy
from .serializers import BuddySerializer

# Create your views here.

@login_required
def add_buddy(request, pk):
    authentication_classes = [JWTAuthentication]
    user = get_object_or_404(Player, pk=pk)
    already_buddies = Buddy.objects.filter(user=user, is_buddy_with=request.user).first()
    if not already_buddies:
        new_buddy = Buddy(user=user, is_buddy_with=request.user)
        new_buddy.save()
        buddy_count = Buddy.objects.filter(user=request.user).count()
        return JsonResponse({'buddy message': 'Buddy added!', 'buddy count': buddy_count})
    else:
        already_buddies.delete()
        buddy_count = Buddy.objects.filter(user=user).count()
        return JsonResponse({'buddy message': 'Buddy removed!', 'buddy count': buddy_count})
    return redirect('/')

class Buddied(generics.ListCreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = BuddySerializer
    
    def get_queryset(self):
        user = get_object_or_404(Player, pk=self.kwargs['pk'])
        return Buddy.objects.filter(is_buddy_with=user)

class Buddies(generics.ListCreateAPIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [permissions.IsAuthenticated]
    queryset = Buddy.objects.all()
    serializer_class = BuddySerializer
    
    def get_queryset(self):
        user = get_object_or_404(Player, pk=self.kwargs['pk'])
        return Buddy.objects.filter(user=user).exclude(is_buddy_with=user)
