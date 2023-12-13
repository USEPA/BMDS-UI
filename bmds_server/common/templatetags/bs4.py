"""
Twitter Bootstrap 4 - helper methods
"""
from datetime import datetime
from textwrap import dedent
from uuid import uuid4

from django import template
from django.utils import timezone
from django.utils.html import escapejs
from django.utils.safestring import mark_safe
from plotly.graph_objs._figure import Figure

register = template.Library()


@register.tag(name="card")
def bs4_card(parser, token):
    args = token.contents.split()
    div_class = args[1] if len(args) > 1 else ""
    nodelist = parser.parse(("endcard",))
    parser.delete_first_token()
    return CardWrapperNode(nodelist, div_class)


class CardWrapperNode(template.Node):
    def __init__(self, nodelist, div_class: str):
        self.nodelist = nodelist
        self.div_class = div_class

    def render(self, context):
        output = self.nodelist.render(context)
        output = f'<div class="card shadow mb-4"><div class="card-body">{output}</div></div>'
        if self.div_class:
            output = f'<div class="{self.div_class}">{output}</div>'
        return output


@register.simple_tag
def icon(name: str):
    return mark_safe(f'<span class="bi bi-{name}" aria-hidden="true"></span>')


@register.simple_tag()
def plotly(fig: Figure) -> str | None:
    """Generate a plotly figure"""
    if fig is None:
        return ""
    id = uuid4()
    return mark_safe(
        dedent(
            f"""
    <div id="{id}"><span class="text-muted">Loading...</span></div>
    <script>
        document.addEventListener("DOMContentLoaded", startup, false);
        function startup () {{
            const data = JSON.parse("{escapejs(fig.to_json())}")
            window.app.renderPlotlyFigure(document.getElementById("{id}"), data);
        }};
    </script>"""
        )
    )


@register.simple_tag()
def table_time(now: datetime, timestamp: datetime):
    if timestamp.date() == now.date():
        return timezone.localtime(timestamp).strftime("%I:%M %p")
    elif timestamp.year == now.year:
        return timezone.localtime(timestamp).strftime("%b %d")
    else:
        return timezone.localtime(timestamp).strftime("%m/%d/%y")
