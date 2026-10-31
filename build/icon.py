#!/usr/bin/env python3
"""Draws the app's icon: one node fanning out to two, in the app's own colours.

    python3 build/icon.py

Electron builder reads build/icon.png and makes every size it needs from it.
Drawn at four times the size and scaled down, since the drawing has no
antialiasing of its own.
"""

from PIL import Image, ImageDraw

SIZE = 1024
SCALE = 4

# The panel from resources/sdk/mstu.css, and the three role colours from the
# renderer's index.css: the one thing colour says across the app.
PANEL = (0x20, 0x20, 0x26, 0xFF)
SOURCE = (0x2D, 0xD4, 0xBF, 0xFF)
TRANSFORM = (0xA9, 0x70, 0xFF, 0xFF)
SINK = (0x4A, 0x9E, 0xFF, 0xFF)

# A link at rest, as the canvas draws one: plumbing until something runs
# through it, and the same colour a node is outlined in.
LINK = (0x3A, 0x3A, 0x44, 0xFF)

# One node fanning out to two. Spread to the edges and drawn thick, because at
# a few pixels a thin mark is a smudge.
FROM = (0.21, 0.50)
UPPER = (0.79, 0.23)
LOWER = (0.79, 0.77)

WIRE = 0.105
NODE = 0.112
OUT = 0.160

# Rounded squares rather than circles: that is how the app marks a role, and a
# square keeps more of itself when it is sixteen pixels wide.
CORNER = 0.18


def main() -> None:
    side = SIZE * SCALE
    image = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)

    at = lambda point: (point[0] * side, point[1] * side)
    px = lambda part: int(part * side)

    draw.rounded_rectangle([0, 0, side - 1, side - 1], radius=px(CORNER), fill=PANEL)

    for end in (UPPER, LOWER):
        draw.line([at(FROM), at(end)], fill=LINK, width=px(WIRE), joint="curve")

    # The source last and largest: everything comes from it.
    for node, half, colour in (
        (UPPER, NODE, TRANSFORM),
        (LOWER, NODE, SINK),
        (FROM, OUT, SOURCE),
    ):
        x, y = at(node)

        draw.rounded_rectangle(
            [x - px(half), y - px(half), x + px(half), y + px(half)],
            radius=px(half) // 3,
            fill=colour,
        )

    image.resize((SIZE, SIZE), Image.LANCZOS).save("build/icon.png")

    print(f"build/icon.png, {SIZE} by {SIZE}")


if __name__ == "__main__":
    main()
