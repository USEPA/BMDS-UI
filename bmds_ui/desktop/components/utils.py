from pydantic import ValidationError
from textual.app import App


def refresh(refresh: bool, app: App):
    if refresh:
        app.query_one("DatabaseList").refresh(layout=True, recompose=True)


def get_error_string(err: Exception) -> str:
    if isinstance(err, ValidationError):
        return "\n".join(f"{e['loc'][0]}: {e['msg']}" for e in err.errors())
    return str(err)
