from app.services.met import calories_burned, met_for_type


def test_calories_burned_happy():
    # MET 5, 70kg, 30 min => 5 * 70 * 0.5 = 175
    assert calories_burned(5.0, 70.0, 30 * 60) == 175


def test_calories_burned_zero_duration():
    assert calories_burned(8.0, 80.0, 0) == 0


def test_met_for_type_defaults():
    assert met_for_type("cardio") == 8.0
    assert met_for_type("mobility") == 2.5
    assert met_for_type("strength", override=6.5) == 6.5
