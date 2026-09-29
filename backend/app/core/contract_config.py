"""
Configuration assumptions for Contract Planning Engine.
No hardcoded rates in the core logic; everything pulls from here or DB.
"""

ASSUMPTIONS = {
    "bunker_price_per_mt": 650.0,    # USD/MT
    "port_cost_load_usd": 45000.0,
    "port_cost_discharge_usd": 55000.0,
    
    "daily_running_cost_usd": 7500.0,
    
    # Vessel type assumptions (draft_m, loa_m, beam_m, speed_knots, handling_mt_per_day)
    "vessels": {
        "Handysize": {
            "capacity": 35000,
            "draft_m": 10.0,
            "loa_m": 180.0,
            "beam_m": 28.0,
            "speed_knots": 13.5,
            "handling_mt_per_day": 8000
        },
        "Supramax": {
            "capacity": 55000,
            "draft_m": 11.5,
            "loa_m": 195.0,
            "beam_m": 32.0,
            "speed_knots": 14.0,
            "handling_mt_per_day": 10000
        },
        "Panamax": {
            "capacity": 75000,
            "draft_m": 13.5,
            "loa_m": 225.0,
            "beam_m": 32.2,
            "speed_knots": 14.5,
            "handling_mt_per_day": 12000
        },
        "Capesize": {
            "capacity": 150000,
            "draft_m": 16.0,
            "loa_m": 290.0,
            "beam_m": 45.0,
            "speed_knots": 15.0,
            "handling_mt_per_day": 20000
        }
    }
}
