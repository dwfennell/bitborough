#!/bin/bash

# Register commercial family tiles to database
# Run this after starting the API server on localhost:8080

echo "Registering commercial tiles..."

curl -X POST http://localhost:8080/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Corner Store",
    "category": "building",
    "filename": "generated/commercial_cornerstore_128.png",
    "width": 128,
    "height": 128,
    "tags": ["commercial", "business", "pixel-art"],
    "prompt": "top-down corner store tile, pixel art, 16-bit SNES SimCity style, small retail shop, striped awning, brick facade, game asset (ref: concrete_base_128.png @ 0.35, neg: green, grass, vegetation)"
  }'

echo -e "\n"

curl -X POST http://localhost:8080/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Strip Mall",
    "category": "building",
    "filename": "generated/commercial_stripmall_128.png",
    "width": 128,
    "height": 128,
    "tags": ["commercial", "business", "pixel-art"],
    "prompt": "top-down strip mall tile, pixel art, 16-bit SNES SimCity style, row of retail stores, parking lot in front, colorful storefronts, game asset (ref: commercial_cornerstore_128.png @ 0.4, neg: green, grass, vegetation)"
  }'

echo -e "\n"

curl -X POST http://localhost:8080/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Shopping Mall",
    "category": "building",
    "filename": "generated/commercial_mall_128.png",
    "width": 128,
    "height": 128,
    "tags": ["commercial", "business", "pixel-art"],
    "prompt": "top-down shopping mall tile, pixel art, 16-bit SNES SimCity style, large indoor mall, anchor stores, massive parking structure, game asset (ref: commercial_stripmall_128.png @ 0.4, neg: green, grass, vegetation)"
  }'

echo -e "\n"

curl -X POST http://localhost:8080/api/assets \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Office Skyscraper",
    "category": "building",
    "filename": "generated/commercial_skyscraper_128.png",
    "width": 128,
    "height": 128,
    "tags": ["commercial", "business", "pixel-art"],
    "prompt": "top-down office skyscraper tile, pixel art, 16-bit SNES SimCity style, tall glass office tower, modern architecture, rooftop details, game asset (ref: commercial_mall_128.png @ 0.4, neg: green, grass, vegetation)"
  }'

echo -e "\n\nDone! All commercial tiles registered."
