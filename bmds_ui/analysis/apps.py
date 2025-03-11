from django.apps import AppConfig


class Config(AppConfig):
    name = "bmds_ui.analysis"

    def ready(self):
        from . import signals  # noqa
