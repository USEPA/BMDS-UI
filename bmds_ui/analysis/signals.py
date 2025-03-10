from django.db import transaction
from django.db.models.signals import post_save
from django.dispatch import receiver

from ..common.vacuum import maybe_vacuum
from .models import Analysis


@receiver(post_save, sender=Analysis)
def vacuum_database(**kwargs):
    transaction.on_commit(maybe_vacuum, robust=True)
