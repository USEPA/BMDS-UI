import subprocess
from datetime import datetime
from typing import Self

from pydantic import BaseModel


class Commit(BaseModel):
    sha: str
    dt: datetime

    @classmethod
    def current(cls, cwd: str = ".") -> Self:
        """Return information on the last commit at the repository path desired.

        Returns:
            A Commit instance
        """
        cmd = "git log -1 --format=%H"
        sha = subprocess.check_output(cmd.split(), cwd=cwd).decode().strip()[:8]  # noqa: S603
        cmd = "git show -s --format=%ct"
        dt = datetime.fromtimestamp(
            int(subprocess.check_output(cmd.split(), cwd=cwd).decode().strip())  # noqa: S603
        )
        return cls(sha=sha, dt=dt)

    def __str__(self):
        return f"{self.sha} ({self.dt.strftime('%Y-%m-%d')})"
