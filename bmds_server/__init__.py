import os
import sys

__version__ = "2024.1a"


def manage():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "bmds_server.main.settings.dev")
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)
