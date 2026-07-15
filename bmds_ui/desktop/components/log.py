from threading import Event, Thread

from textual.widgets import Log, Static

from ..log import stream


class AppLog(Static):
    def __init__(self, **kw):
        super().__init__(**kw)
        self.log_widget = Log()
        self._stop_logs = Event()
        self._thread: Thread | None = None

    def compose(self):
        yield self.log_widget

    def on_mount(self):
        self._stop_logs.clear()
        self._thread = Thread(
            target=read_thread_logs,
            args=(self.log_widget, self._stop_logs),
            daemon=True,
        )
        self._thread.start()

    def on_unmount(self):
        self._stop_logs.set()
        if self._thread and self._thread.is_alive():
            self._thread.join(timeout=2)


def read_thread_logs(widget: Log, stop_event: Event):
    while not stop_event.wait(1):
        try:
            if log_contents := stream.getvalue():
                stream.seek(0)
                stream.truncate()
                widget.app.call_from_thread(widget.write, log_contents)
        except LookupError:
            break
        except Exception:
            break
