from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

urlpatterns = [
    path('add-buddy/<int:pk>/', views.add_buddy, name='add-buddy'),
    path('buddied/<int:pk>/', views.Buddied.as_view(), name='buddied'),
    path('buddies/<int:pk>/', views.Buddies.as_view(), name='buddies'),
]