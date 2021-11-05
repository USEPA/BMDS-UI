from django.conf import settings
from django.conf.urls import include
from django.contrib import admin
from django.urls import path
from django.views.generic import TemplateView
from rest_framework import permissions
from rest_framework.routers import DefaultRouter
from rest_framework.schemas import get_schema_view

from ..analysis import api, views
from ..common import views as common_views
from .constants import AuthProvider

router = DefaultRouter()
router.register("analysis", api.AnalysisViewset, basename="analysis")
router.register("healthcheck", api.HealthcheckViewset, basename="healthcheck")

edit_pattern = "analysis/<uuid:pk>/<str:password>/"
api_paths = path("api/v1/", include((router.urls, "analysis"), namespace="api"))

urlpatterns = [
    # home
    path("", views.Home.as_view(), name="home"),
    # api
    api_paths,
    # analysis
    path("analysis/<uuid:pk>/", views.AnalysisDetail.as_view(), name="analysis"),
    path(edit_pattern, views.AnalysisDetail.as_view(), name="analysis_edit"),
    path(f"{edit_pattern}renew/", views.AnalysisRenew.as_view(), name="analysis_renew",),
    path(f"{edit_pattern}delete/", views.AnalysisDelete.as_view(), name="analysis_delete",),
    # errors
    path("401/", common_views.Error401.as_view(), name="401"),
    path("403/", TemplateView.as_view(template_name="403.html"), name="403"),
    path("404/", TemplateView.as_view(template_name="404.html"), name="404"),
    path("500/", TemplateView.as_view(template_name="500.html"), name="500"),
]

if settings.INCLUDE_ADMIN:
    admin_url = f"admin/{settings.ADMIN_URL_PREFIX}/" if not settings.DEBUG else "admin/"
    urlpatterns += [
        # api schema
        path(
            "api/v1/openapi/",
            get_schema_view(
                title="BMDS Server",
                version="v1",
                patterns=(api_paths,),
                permission_classes=(permissions.IsAdminUser,),
            ),
            name="openapi",
        ),
        path("api/v1/swagger/", common_views.Swagger.as_view(), name="swagger"),
        # admin and custom admin login
        path(f"{admin_url}login/", common_views.AdminLoginView.as_view(), name="admin_login"),
        path(admin_url, admin.site.urls),
    ]

if AuthProvider.external in settings.AUTH_PROVIDERS:
    urlpatterns += [
        path("user/login/wam/", common_views.ExternalAuth.as_view(), name="external_auth"),
    ]

if settings.DEBUG:
    import debug_toolbar

    urlpatterns += (path("__debug__/", include(debug_toolbar.urls)),)