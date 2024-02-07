from django.urls import path

from . import views

urlpatterns = [
    path('', views.frontend, name='index'),
    path('legal/', views.legal, name='legal')
]
