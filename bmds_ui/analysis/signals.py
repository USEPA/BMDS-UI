from django.db.backends.signals import connection_created
from django.dispatch import receiver


@receiver(connection_created)
def init_command(sender, connection, **kwargs) -> None:
    # https://code.djangoproject.com/ticket/24018
    command = connection.settings_dict.get("STARTUP_OPTIONS", {}).get("init_command")
    if connection.vendor == "sqlite" and command:
        cursor = connection.cursor()
        cursor.execute(command)
