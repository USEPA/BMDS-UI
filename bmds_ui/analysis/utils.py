import re
import json
import math
from decimal import Decimal
from django.core.serializers.json import DjangoJSONEncoder

import logging
import io
import base64
from docx.shared import Inches

from django.conf import settings
from django.utils.timezone import now

from pybmds.utils import get_version

from .. import __version__

logger = logging.getLogger(__name__)

def get_citation() -> str:
    """
    Return a citation for the software.
    """
    year = "20" + __version__[:2]
    accessed = now().strftime("%B %d, %Y")
    version = get_version()
    application = "BMDS Desktop" if settings.IS_DESKTOP else "BMDS Online"
    uri = "https://pypi.org/project/bmds-ui/" if settings.IS_DESKTOP else settings.WEBSITE_URI
    return f"U.S. Environmental Protection Agency. ({year}). {application} ({__version__}; pybmds {version.python}; bmdscore {version.dll}) [Software]. Available from {uri}. Accessed {accessed}."


re_hex_color = re.compile("^#(?:[0-9a-fA-F]{3}){1,2}$")

def fig_to_png_b64(fig, dpi: int = 150) -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=dpi, bbox_inches="tight")
    buf.seek(0)
    return base64.b64encode(buf.getvalue()).decode("utf-8")

def add_png_b64_to_docx(document, b64_png: str, width_in: float | None = 6.0, height_in: float | None = None):
    """
    Add a base64-encoded PNG to a python-docx Document.
    If width_in or height_in is provided, python-docx will scale proportionally.
    """
    # Handle possible data URL prefix
    if b64_png.startswith("data:image"):
        b64_png = b64_png.split(",", 1)[-1]

    img_bytes = base64.b64decode(b64_png)
    stream = io.BytesIO(img_bytes)

    if width_in is not None and height_in is not None:
        document.add_picture(stream, width=Inches(width_in), height=Inches(height_in))
    elif width_in is not None:
        document.add_picture(stream, width=Inches(width_in))
    elif height_in is not None:
        document.add_picture(stream, height=Inches(height_in))
    else:
        document.add_picture(stream)  # native size

# ==================================================================================================================
# ---------- Helpers: concise non-finite summarization ----------
_INDEX_RE = re.compile(r"\[\d+\]")

def _normalize_path(path: str) -> str:
    # Collapse numeric indices to wildcards: [123] -> [*]
    return _INDEX_RE.sub("[*]", path)

def _summarize_array(path, arr):
    """
    Return a dict summary for a numeric array-like at a given path.
    Counts NaN/+Inf/-Inf without logging per-element noise.
    """
    norm_path = _normalize_path(path)
    shape = None
    nan = posinf = neginf = 0

    def walk_iter(x):
        if isinstance(x, (list, tuple)):
            for y in x:
                yield from walk_iter(y)
        else:
            yield x

    for v in walk_iter(arr):
        if isinstance(v, (float, int)):
            fv = float(v)
            if math.isnan(fv):
                nan += 1
            elif math.isinf(fv):
                if fv > 0:
                    posinf += 1
                else:
                    neginf += 1

        total = nan + posinf + neginf
        if total == 0:
            return None
        return {
            "path": norm_path,
            "shape": shape,
            "nan": nan,
            "posinf": posinf,
            "neginf": neginf,
            "total": total,
        }

def summarize_non_finite(value, path="$"):
    """
    Walk the payload and return aggregated summaries of non-finite values.
    - For numpy arrays or numeric lists/tuples, summarize at the container level.
    - For dicts and mixed lists, recurse.
    """
    summaries = []

    if isinstance(value, dict):
        for k, v in value.items():
            summaries.extend(summarize_non_finite(v, f"{path}.{k}"))
        return summaries

    if isinstance(value, (list, tuple)):
        # If likely numeric, try one-shot summarize
        s = _summarize_array(path, value)
        if s:
            summaries.append(s)
            return summaries
        # Otherwise recurse into elements
        for i, v in enumerate(value):
            summaries.extend(summarize_non_finite(v, f"{path}[{i}]"))
        return summaries

    if isinstance(value, (float, int, Decimal)):
        fv = float(value)
        if math.isnan(fv) or math.isinf(fv):
            s = _summarize_array(path, [fv])
            if s:
                summaries.append(s)

    return summaries

def log_infinite_lines(value, path="$", limit=500):
    """
    Log the exact paths that contain +Inf/-Inf values.
    limit: maximum number of lines to log to avoid excessive noise.
    Returns the total count of infinite values found.
    """
    count = 0

    def emit(pth, sign):
        nonlocal count
        if limit is None or count < limit:
            logger.warning("Infinite value at %s (%s)", pth, sign)
        count += 1

    def walk(v, p):
        # Dicts
        if isinstance(v, dict):
            for k, vv in v.items():
                walk(vv, f"{p}.{k}")
            return

        # Lists / Tuples
        if isinstance(v, (list, tuple)):
            for i, vv in enumerate(v):
                walk(vv, f"{p}[{i}]")
            return

        # Scalar checks
        if isinstance(v, (float, int)):
            fv = float(v)
            if math.isinf(fv):
                emit(p, "+Inf" if fv > 0 else "-Inf")
            return

        if isinstance(v, Decimal):
            if v.is_infinite():
                emit(p, "+Inf" if v > 0 else "-Inf")
            return

    walk(value, path)

    if limit is not None and count > limit:
        logger.warning("... and %s more infinite values not shown", count - limit)

    return count

def log_non_finite_summary(payload, top=10):
    """
    Aggregate non-finite stats and log only the top offenders by count.
    """
    summaries = summarize_non_finite(payload, path="$")
    if not summaries:
        logger.info("JSON payload check: no NaN/Inf found.")
        return

    # Aggregate by normalized path
    agg = {}
    for s in summaries:
        key = s["path"]
        if key not in agg:
            agg[key] = {"path": key, "nan": 0, "posinf": 0, "neginf": 0, "total": 0, "shapes": set()}
        agg[key]["nan"] += s["nan"]
        agg[key]["posinf"] += s["posinf"]
        agg[key]["neginf"] += s["neginf"]
        agg[key]["total"] += s["total"]
        if s.get("shape"):
            agg[key]["shapes"].add(s["shape"])

    rows = sorted(agg.values(), key=lambda d: d["total"], reverse=True)
    grand_total = sum(r["total"] for r in rows)

    logger.warning("Invalid JSON candidates: %s non-finite values across %s paths.", grand_total, len(rows))

    for r in rows[:top]:
        shapes = ", ".join(map(str, sorted(r["shapes"]))) if r["shapes"] else "-"
        logger.warning(
            "Path: %s | total=%s (NaN=%s, +Inf=%s, -Inf=%s) | shapes: %s",
            r["path"], r["total"], r["nan"], r["posinf"], r["neginf"], shapes
        )

    if len(rows) > top:
        logger.warning("... and %s more paths with non-finite values.", len(rows) - top)

# ---------- Helpers: validation and sanitization ----------
def validate_json(value):
    # Raises TypeError/ValueError if not JSON-serializable or contains NaN/Inf
    json.dumps(value, cls=DjangoJSONEncoder, allow_nan=False)

def sanitize_json(value):
    # Convert to JSON-safe primitives; replace NaN/Inf with None
    if isinstance(value, float):
        return value if math.isfinite(value) else None
    if isinstance(value, Decimal):
        # Preserve finite decimals as float; else None
        if value.is_nan() or value.is_infinite():
            return None
        return float(value)
    if isinstance(value, dict):
        return {k: sanitize_json(v) for k, v in value.items()}
    if isinstance(value, (list, tuple, set)):
        return [sanitize_json(v) for v in value]
    # ints/str/bool/None and other DjangoJSONEncoder-safe types pass through
    return value

# ==================================================================================================================