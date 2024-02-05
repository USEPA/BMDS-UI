from django.conf import settings
from django.contrib import admin
from django.urls import include, path
from django.views.generic import TemplateView
from rest_framework import permissions
from rest_framework.routers import SimpleRouter
from rest_framework.schemas import get_schema_view

from ..analysis import schema, views
from ..analysis.api import AnalysisViewset, PolyKViewset
from ..common import views as common_views
from ..common.api import HealthcheckViewset
from .constants import AuthProvider

healthcheck_url = (
    "healthcheck" if settings.DEBUG else f"{settings.HEALTHCHECK_URL_PREFIX}/healthcheck"
)

router = SimpleRouter()
router.register("analysis", AnalysisViewset, basename="analysis")
if settings.INCLUDE_BETA_FEATURES:
    router.register("polyk", PolyKViewset, basename="polyk")
router.register(healthcheck_url, HealthcheckViewset, basename="healthcheck")

edit_pattern = "analysis/<uuid:pk>/<str:password>/"
api_paths = path("api/v1/", include((router.urls, "analysis"), namespace="api"))

urlpatterns = [
    # home
    path(
        "",
        views.DesktopHome.as_view() if settings.IS_DESKTOP else views.Home.as_view(),
        name="home",
    ),
    path("history/", views.AnalysisHistory.as_view(), name="analysis_history"),
    # api
    api_paths,
    # analysis
    path("analysis/create/", views.AnalysisCreate.as_view(), name="analysis_create"),
    path("analysis/<uuid:pk>/", views.AnalysisDetail.as_view(), name="analysis"),
    path(edit_pattern, views.AnalysisDetail.as_view(), name="analysis_edit"),
    path(f"{edit_pattern}renew/", views.AnalysisRenew.as_view(), name="analysis_renew"),
    path(f"{edit_pattern}delete/", views.AnalysisDelete.as_view(), name="analysis_delete"),
    # errors
    path("401/", common_views.Error401.as_view(), name="401"),
    path("403/", TemplateView.as_view(template_name="403.html"), name="403"),
    path("404/", TemplateView.as_view(template_name="404.html"), name="404"),
    path("500/", TemplateView.as_view(template_name="500.html"), name="500"),
    # auth
    path("user/login/", common_views.AppLoginView.as_view(), name="login"),
    path("user/logout/", common_views.AppLogoutView.as_view(), name="logout"),
]

if settings.IS_DESKTOP:
    urlpatterns += [
        path("collection/", views.CollectionList.as_view(), name="collection_list"),
        path("collection/create/", views.CollectionCreate.as_view(), name="collection_create"),
        path(
            "collection/<int:pk>/update/",
            views.CollectionUpdate.as_view(),
            name="collection_update",
        ),
        path(
            "collection/<int:pk>/delete/",
            views.CollectionDelete.as_view(),
            name="collection_delete",
        ),
    ]

if settings.INCLUDE_BETA_FEATURES:
    urlpatterns += [
        path("transforms/polyk/", views.PolyKAdjustment.as_view(), name="polyk"),
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
                generator_class=schema.ApiSchemaGenerator,
            ),
            name="openapi",
        ),
        path("api/v1/swagger/", common_views.Swagger.as_view(), name="swagger"),
        # admin and custom admin login
        path(f"{admin_url}login/", common_views.AdminLoginView.as_view(), name="admin_login"),
        path(f"{admin_url}analytics/", views.Analytics.as_view(), name="analytics"),
        path(admin_url, admin.site.urls),
    ]

if AuthProvider.external in settings.AUTH_PROVIDERS:
    urlpatterns += [
        path("user/login/wam/", common_views.ExternalAuth.as_view(), name="external_auth"),
    ]

if settings.DEBUG:
    import debug_toolbar

    urlpatterns += (
        path("__debug__/", include(debug_toolbar.urls)),
        path("__reload__/", include("django_browser_reload.urls")),
    )
