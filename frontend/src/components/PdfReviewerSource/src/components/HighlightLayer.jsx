import { viewportToScaled } from "../lib/coordinates"
import React from "react"

export function HighlightLayer({
  highlightsByPage,
  scaledPositionToViewport,
  pageNumber,
  scrolledToHighlightId,
  highlightTransform,
  tip,
  hideTipAndSelection,
  viewer,
  screenshot,
  showTip,
  setState
}) {
  const currentHighlights = highlightsByPage[String(pageNumber)] || []
  return (
    <div>
      {currentHighlights.map(({ position, id, ...highlight }, index) => {
        // @ts-ignore
        const viewportHighlight = {
          id,
          position: scaledPositionToViewport(position),
          ...highlight
        }

        if (tip && tip.highlight.id === String(id)) {
          showTip(tip.highlight, tip.callback(viewportHighlight))
        }

        const isScrolledTo = Boolean(scrolledToHighlightId === id)

        return highlightTransform(
          viewportHighlight,
          index,
          (highlight, callback) => {
            setState({
              tip: { highlight, callback }
            })

            showTip(highlight, callback(highlight))
          },
          hideTipAndSelection,
          rect => {
            const viewport = viewer.getPageView(
              (rect.pageNumber || parseInt(pageNumber)) - 1
            ).viewport

            return viewportToScaled(rect, viewport)
          },
          boundingRect => screenshot(boundingRect, parseInt(pageNumber)),
          isScrolledTo
        )
      })}
    </div>
  )
}
