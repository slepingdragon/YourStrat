import pytest

from app.services import gemini


@pytest.mark.asyncio
async def test_scan_food_invalid_json_returns_empty(monkeypatch):
  class FakeResponse:
    text = "not json"

  class FakeModel:
    def generate_content(self, *args, **kwargs):
      return FakeResponse()

  monkeypatch.setattr(gemini.genai, "GenerativeModel", lambda *a, **k: FakeModel())
  result = await gemini.scan_food(b"fake")
  assert result == {"items": []}


def test_normalize_scan_result_fills_defaults():
  data = {
    "items": [
      {
        "name": "Salad",
        "portion": "1 bowl",
        "calories": 320,
        "protein_g": 12,
        "carbs_g": 40,
        "fat_g": 14,
        "confidence": 0.8,
      },
      "not-a-dict",
    ]
  }
  out = gemini._normalize_scan_result(data)
  assert len(out["items"]) == 1
  item = out["items"][0]
  assert item["name"] == "Salad"
  assert item["calories"] == 320
  assert item["protein_g"] == 12.0
  assert item["fiber_g"] == 0.0
  assert item["sodium_mg"] == 0
