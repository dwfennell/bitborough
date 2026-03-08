import { describe, test, expect } from 'vitest'
import { Camera } from '../render/Camera.js'

describe('Camera', () => {
  test('screenToTile converts at zoom 1', () => {
    const cam = new Camera(100, 100, 16)
    cam.x = 0
    cam.y = 0
    const tile = cam.screenToTile(0, 0)
    expect(tile.x).toBe(0)
    expect(tile.y).toBe(0)
  })

  test('screenToTile accounts for camera offset', () => {
    const cam = new Camera(100, 100, 16)
    cam.x = 5
    cam.y = 3
    const tile = cam.screenToTile(0, 0)
    expect(tile.x).toBe(5)
    expect(tile.y).toBe(3)
  })

  test('screenToTile accounts for zoom', () => {
    const cam = new Camera(100, 100, 16)
    cam.x = 0
    cam.y = 0
    cam.zoom = 2
    const tile = cam.screenToTile(32, 0)
    expect(tile.x).toBe(1)
    expect(tile.y).toBe(0)
  })

  test('tileToScreen converts at zoom 1', () => {
    const cam = new Camera(100, 100, 16)
    cam.x = 0
    cam.y = 0
    const screen = cam.tileToScreen(2, 3)
    expect(screen.x).toBe(32)
    expect(screen.y).toBe(48)
  })

  test('tileToScreen accounts for camera offset', () => {
    const cam = new Camera(100, 100, 16)
    cam.x = 2
    cam.y = 3
    const screen = cam.tileToScreen(2, 3)
    expect(screen.x).toBe(0)
    expect(screen.y).toBe(0)
  })

  test('getVisibleBounds returns tile range', () => {
    const cam = new Camera(160, 160, 16)
    cam.x = 0
    cam.y = 0
    const bounds = cam.getVisibleBounds()
    expect(bounds.minX).toBe(0)
    expect(bounds.minY).toBe(0)
    expect(bounds.maxX).toBe(10)
    expect(bounds.maxY).toBe(10)
  })

  test('pan moves camera position', () => {
    const cam = new Camera(100, 100, 16)
    cam.x = 5
    cam.y = 5
    cam.pan(3, -2)
    expect(cam.x).toBe(8)
    expect(cam.y).toBe(3)
  })

  test('clamp restricts to map bounds', () => {
    const cam = new Camera(160, 160, 16)
    cam.setMapSize(20, 20)
    cam.x = -5
    cam.y = -5
    cam.clamp()
    expect(cam.x).toBe(0)
    expect(cam.y).toBe(0)
  })

  test('zoom is clamped between 0.5 and 4', () => {
    const cam = new Camera(100, 100, 16)
    cam.zoom = 0.1
    cam.clampZoom()
    expect(cam.zoom).toBe(0.5)
    cam.zoom = 10
    cam.clampZoom()
    expect(cam.zoom).toBe(4)
  })
})
