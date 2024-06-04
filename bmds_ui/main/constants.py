from enum import IntEnum, StrEnum


class AuthProvider(StrEnum):
    django = "django"
    external = "external"


class SkinStyle(IntEnum):
    Base = 0
    EPA = 1
