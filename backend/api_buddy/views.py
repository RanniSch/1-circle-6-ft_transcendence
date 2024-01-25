from django.shortcuts import redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse, HttpResponseNotAllowed
from django.db.models import Q
from rest_framework import permissions, generics
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view, permission_classes

from api_accounts.models import Player, Notification
from .models import Buddy
from .serializers import BuddySerializer

# Create your views here.

@api_view(['POST', 'DELETE'])
@permission_classes([permissions.IsAuthenticated])
def add_buddy(request, pk):
    if request.method == 'POST':
        user = get_object_or_404(Player, pk=pk)
        if not Buddy.objects.filter(user=user, is_buddy_with=request.user).exists():
            Buddy.objects.create(user=user, is_buddy_with=request.user)

            Notification.objects.create(
                sender=request.user,
                receiver=user,
                message=f'{request.user.username} added you as a buddy!',
            )

            return JsonResponse({'message': 'Buddy added successfully!'}, status=201)
        else:
            return JsonResponse({'message': 'You are already buddies!'}, status=400)
    
    elif request.method == 'DELETE':
        buddy_relation = Buddy.objects.filter(
            Q(user=request.user, is_buddy_with__pk=pk) |
            Q(user__pk=pk, is_buddy_with=request.user)
        ).first()
        if buddy_relation:
            buddy_relation.delete()
            other_user = buddy_relation.user if buddy_relation.user != request.user else buddy_relation.is_buddy_with

            Notification.objects.create(
                sender=request.user,
                receiver=other_user,
                message=f'{request.user.username} no longer wants to be your buddy!',
            )

            return JsonResponse({'message': 'Buddy removed successfully!'}, status=200)
        else:
            return JsonResponse({'message': 'You are not buddies!'}, status=400)
    
    else:
        return HttpResponseNotAllowed(['POST', 'DELETE'])

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

