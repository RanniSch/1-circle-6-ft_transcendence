from django.shortcuts import render

# Create your views here.

def frontend(request):
    host = request.get_host()
    return render(request, 'frontend/index.html', {'host': host})

def legal(request):
    host = request.get_host()
    return render(request, 'frontend/termsofuse.html', {'host': host})