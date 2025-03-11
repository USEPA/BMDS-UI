from django.core.management.base import BaseCommand

from ...vacuum import vacuum


class Command(BaseCommand):
    help = """Vacuum database."""

    def handle(self, *args, **options):
        vacuum()
