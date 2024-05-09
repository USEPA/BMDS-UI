from textual.app import App


def refresh(refresh: bool, app: App):
    if refresh:
        app.query_one("DatabaseList").refresh(layout=True, recompose=True)
