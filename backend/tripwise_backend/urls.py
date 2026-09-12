import os
from pathlib import Path
from django.contrib import admin
from django.urls import path, re_path, include
from django.views.static import serve
from django.conf import settings
from django.http import Http404, FileResponse

def serve_page(request, page="index.html"):
    file_path = settings.FRONTEND_DIR / page
    if file_path.exists() and file_path.is_file():
        return FileResponse(open(file_path, 'rb'), content_type='text/html; charset=utf-8')
    raise Http404(f"Page {page} not found")

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
    path('', lambda req: serve_page(req, "index.html")),
    re_path(r'^(?P<page>[a-zA-Z0-9_\-]+\.html)$', serve_page),
    re_path(r'^css/(?P<path>.*)$', serve, {'document_root': settings.FRONTEND_DIR / 'css'}),
    re_path(r'^js/(?P<path>.*)$', serve, {'document_root': settings.FRONTEND_DIR / 'js'}),
    re_path(r'^image/(?P<path>.*)$', serve, {'document_root': settings.FRONTEND_DIR / 'image'}),
]
