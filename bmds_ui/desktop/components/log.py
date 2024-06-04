from threading import Thread
from time import sleep

from textual.widgets import Log, Static

from ..log import stream


class AppLog(Static):
    def __init__(self, **kw):
        super().__init__(**kw)
        self.log_widget = Log()

    def compose(self):
        yield self.log_widget

    def on_mount(self):
        thread = Thread(target=read_thread_logs, args=(self.log_widget,), daemon=True)
        thread.start()


def read_thread_logs(widget: Log):
    while True:
        if log_contents := stream.getvalue():
            stream.seek(0)
            stream.truncate()
            widget.write(log_contents)
        sleep(1)
