#!/bin/bash
# Generate a family of tiles where each tile references the previous one
# Usage: ./generate-tile-family.sh <family-name> <base-reference> <tile1> <tile2> ...
# Each tile argument format: "name:prompt"

set -e

FAMILY_NAME=$1
BASE_REF=$2
shift 2

ASSETS_DIR="/Users/dustin/Documents/src/rcity/packages/game-manager/data/assets"
API_URL="http://localhost:8080/api"
STRENGTH=0.4
STEPS=20
SIZE=128

echo "Generating tile family: $FAMILY_NAME"
echo "Base reference: $BASE_REF"
echo ""

PREV_TILE="$BASE_REF"

for TILE_SPEC in "$@"; do
    NAME="${TILE_SPEC%%:*}"
    PROMPT="${TILE_SPEC#*:}"

    FILENAME="${FAMILY_NAME}_${NAME}_${SIZE}.png"
    OUTPUT_PATH="${ASSETS_DIR}/generated/${FILENAME}"

    echo "Generating: $NAME"
    echo "  Prompt: $PROMPT"
    echo "  Reference: $PREV_TILE (strength: $STRENGTH)"

    img "$PROMPT" \
        --output "$OUTPUT_PATH" \
        --width $SIZE \
        --height $SIZE \
        --steps $STEPS \
        --image "$PREV_TILE" \
        --strength $STRENGTH

    echo "  Saved: $FILENAME"

    # Add to database
    curl -s -X POST "${API_URL}/assets" \
        -H "Content-Type: application/json" \
        -d "{
            \"name\": \"${NAME}\",
            \"category\": \"building\",
            \"filename\": \"generated/${FILENAME}\",
            \"width\": ${SIZE},
            \"height\": ${SIZE},
            \"tags\": [\"${FAMILY_NAME}\", \"chain-ref\", \"pixel-art\"],
            \"prompt\": \"${PROMPT} (ref: $(basename $PREV_TILE) @ ${STRENGTH})\"
        }" | jq -r '.id'

    echo "  Added to database"
    echo ""

    # Use this tile as reference for next one
    PREV_TILE="$OUTPUT_PATH"
done

echo "Family '$FAMILY_NAME' complete!"
