from django.db.models.signals import post_save
from django.dispatch import receiver

from ..common.utils import vacuum


@receiver(post_save)
def vacuum_database(**kwargs):
    vacuum()
