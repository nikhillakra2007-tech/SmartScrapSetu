"""
Kabadiwala Connect (ScrapSetu) — Centralized Scrap Taxonomy and Benchmark Rates
Aligned with Delhi Pilot (Okhla, Mandoli, Patparganj, Peeragarhi, Mohan Cooperative)
and India's E-Waste (Management) Rules 2022 Schedule I.

Supports the 8 Primary Top-Level Scrap Groups:
1. E_WASTE
2. PAPER
3. PLASTIC
4. METAL_FERROUS
5. METAL_NONFERROUS
6. GLASS
7. TEXTILE
8. RUBBER_OTHER

And the 8 E-Waste Parent Subfamilies:
- LARGE_APPLIANCE
- DISPLAY
- COMPUTING
- MOBILE
- PCB
- CABLE
- BATTERY
- SMALL_APPLIANCE
"""

from typing import Dict, Any, List

MATERIAL_GROUPS: Dict[str, str] = {
    "E_WASTE": "E-Waste",
    "PAPER": "Paper & Cardboard",
    "PLASTIC": "Plastic",
    "METAL_FERROUS": "Metal — Ferrous",
    "METAL_NONFERROUS": "Metal — Non-Ferrous",
    "GLASS": "Glass",
    "TEXTILE": "Textile / Cloth",
    "RUBBER_OTHER": "Rubber & Other",
}

MATERIAL_TAXONOMY: Dict[str, Dict[str, Any]] = {
    # ------------------ 8 E-WASTE FAMILIES ------------------
    "LARGE_APPLIANCE": {
        "group_code": "E_WASTE",
        "parent_name": "Large Appliances",
        "is_hazardous": False,
        "default_hazard": "none",
        "safety_note": "Recover refrigerants (CFCs/HFCs) safely prior to dismantling. Contains sealed compressor motors and scrap steel/copper.",
        "sub_categories": {
            "refrigerator": {"sub_name": "Refrigerator", "avg_rate": 65.0, "min_rate": 55.0, "max_rate": 80.0},
            "air_conditioner": {"sub_name": "Air Conditioner", "avg_rate": 85.0, "min_rate": 70.0, "max_rate": 105.0},
            "washing_machine": {"sub_name": "Washing Machine", "avg_rate": 45.0, "min_rate": 35.0, "max_rate": 55.0},
            "dishwasher": {"sub_name": "Dishwasher", "avg_rate": 40.0, "min_rate": 30.0, "max_rate": 50.0},
            "water_cooler": {"sub_name": "Water Cooler", "avg_rate": 50.0, "min_rate": 40.0, "max_rate": 65.0},
        },
        "epr_hint": "Schedule I (CEEW2, CEEW3, CEEW4)",
    },
    "DISPLAY": {
        "group_code": "E_WASTE",
        "parent_name": "Display & Screens",
        "is_hazardous": True,
        "default_hazard": "leaded_glass",
        "safety_note": "CAUTION: Leaded CRT funnel glass and older CCFL backlights with mercury. Never shatter tubes or screens in open air.",
        "sub_categories": {
            "television": {"sub_name": "Television (LED/LCD/OLED)", "avg_rate": 40.0, "min_rate": 30.0, "max_rate": 55.0},
            "monitor": {"sub_name": "Monitor", "avg_rate": 45.0, "min_rate": 35.0, "max_rate": 60.0},
            "crt": {"sub_name": "CRT (Cathode Ray Tube)", "avg_rate": 12.0, "min_rate": 8.0, "max_rate": 16.0},
        },
        "epr_hint": "Schedule I (CEEW1, ITEW2)",
    },
    "COMPUTING": {
        "group_code": "E_WASTE",
        "parent_name": "Computing & IT",
        "is_hazardous": False,
        "default_hazard": "none",
        "safety_note": "High value in RAM, processor chipsets, and motherboard connectors. Keep motherboards intact.",
        "sub_categories": {
            "laptop": {"sub_name": "Laptop", "avg_rate": 280.0, "min_rate": 220.0, "max_rate": 350.0},
            "desktop": {"sub_name": "Desktop / CPU Unit", "avg_rate": 120.0, "min_rate": 90.0, "max_rate": 150.0},
            "keyboard": {"sub_name": "Keyboard", "avg_rate": 20.0, "min_rate": 15.0, "max_rate": 28.0},
            "mouse": {"sub_name": "Mouse", "avg_rate": 20.0, "min_rate": 15.0, "max_rate": 28.0},
        },
        "epr_hint": "Schedule I (ITEW2, ITEW3)",
    },
    "MOBILE": {
        "group_code": "E_WASTE",
        "parent_name": "Mobile Devices",
        "is_hazardous": False,
        "default_hazard": "none",
        "safety_note": "Remove lithium batteries before bulk compaction. High concentration of precious metals in boards.",
        "sub_categories": {
            "smartphone": {"sub_name": "Smartphone", "avg_rate": 350.0, "min_rate": 280.0, "max_rate": 450.0},
            "tablet": {"sub_name": "Tablet", "avg_rate": 200.0, "min_rate": 150.0, "max_rate": 260.0},
            "feature_phone": {"sub_name": "Feature Phone", "avg_rate": 180.0, "min_rate": 140.0, "max_rate": 220.0},
        },
        "epr_hint": "Schedule I (ITEW1)",
    },
    "PCB": {
        "group_code": "E_WASTE",
        "parent_name": "Printed Circuit Boards",
        "is_hazardous": True,
        "default_hazard": "acid_leaching_risk",
        "safety_note": "Do not burn or acid-wash. Route exclusively to authorized hydrometallurgical recyclers.",
        "sub_categories": {
            "motherboard": {"sub_name": "Motherboard", "avg_rate": 380.0, "min_rate": 330.0, "max_rate": 440.0},
            "appliance_pcb": {"sub_name": "Appliance PCB", "avg_rate": 160.0, "min_rate": 130.0, "max_rate": 190.0},
            "other_pcb": {"sub_name": "Other PCB (Telecom/Power/Mixed)", "avg_rate": 250.0, "min_rate": 200.0, "max_rate": 300.0},
        },
        "epr_hint": "Schedule I (ITEW2 to ITEW16)",
    },
    "CABLE": {
        "group_code": "E_WASTE",
        "parent_name": "Cables & Wires",
        "is_hazardous": False,
        "default_hazard": "none",
        "safety_note": "DO NOT BURN! Open cable burning produces toxic dioxins. Strip mechanically.",
        "sub_categories": {
            "copper_cable": {"sub_name": "Copper Cable", "avg_rate": 450.0, "min_rate": 400.0, "max_rate": 510.0},
            "power_cable": {"sub_name": "Power Cable", "avg_rate": 240.0, "min_rate": 200.0, "max_rate": 280.0},
            "data_cable": {"sub_name": "Data Cable", "avg_rate": 160.0, "min_rate": 130.0, "max_rate": 190.0},
        },
        "epr_hint": "Schedule I / Secondary Material",
    },
    "BATTERY": {
        "group_code": "E_WASTE",
        "parent_name": "Batteries & Cells",
        "is_hazardous": True,
        "default_hazard": "lithium_swelling",
        "safety_note": "Keep dry and cool. Never crush or short terminals. High risk of fire.",
        "sub_categories": {
            "lead_acid": {"sub_name": "Lead Acid Battery", "avg_rate": 95.0, "min_rate": 85.0, "max_rate": 110.0},
            "lithium_ion": {"sub_name": "Lithium Ion Battery", "avg_rate": 180.0, "min_rate": 150.0, "max_rate": 220.0},
            "other_battery": {"sub_name": "Other Battery (NiCd/NiMH/Alkaline)", "avg_rate": 35.0, "min_rate": 20.0, "max_rate": 50.0},
        },
        "epr_hint": "Battery Waste Management Rules 2022",
    },
    "SMALL_APPLIANCE": {
        "group_code": "E_WASTE",
        "parent_name": "Small Appliances",
        "is_hazardous": False,
        "default_hazard": "none",
        "safety_note": "Contains copper motor windings, switches, and plastic housings.",
        "sub_categories": {
            "mixer": {"sub_name": "Mixer / Grinder", "avg_rate": 45.0, "min_rate": 35.0, "max_rate": 55.0},
            "iron": {"sub_name": "Iron Box", "avg_rate": 35.0, "min_rate": 25.0, "max_rate": 45.0},
            "vacuum_cleaner": {"sub_name": "Vacuum Cleaner", "avg_rate": 40.0, "min_rate": 30.0, "max_rate": 50.0},
            "electric_kettle": {"sub_name": "Electric Kettle", "avg_rate": 35.0, "min_rate": 25.0, "max_rate": 45.0},
            "fan": {"sub_name": "Fan (Ceiling/Table)", "avg_rate": 50.0, "min_rate": 40.0, "max_rate": 60.0},
        },
        "epr_hint": "Schedule I (CEEW5)",
    },

    # ------------------ 7 GENERAL SCRAP FAMILIES ------------------
    "PAPER": {
        "group_code": "PAPER",
        "parent_name": "Paper & Cardboard",
        "is_hazardous": False,
        "default_hazard": "none",
        "safety_note": "Keep dry. Segregate kraft cardboard from white raddi for optimal recycling rate.",
        "sub_categories": {
            "newspaper": {"sub_name": "Newspaper", "avg_rate": 16.0, "min_rate": 14.0, "max_rate": 18.0},
            "cardboard_carton": {"sub_name": "Cardboard Carton", "avg_rate": 12.0, "min_rate": 10.0, "max_rate": 14.0},
            "books_magazines": {"sub_name": "Books & Magazines", "avg_rate": 14.0, "min_rate": 12.0, "max_rate": 16.0},
            "mixed_waste_paper": {"sub_name": "Mixed Waste Paper", "avg_rate": 10.0, "min_rate": 8.0, "max_rate": 12.0},
        },
        "epr_hint": None,
    },
    "PLASTIC": {
        "group_code": "PLASTIC",
        "parent_name": "Plastic",
        "is_hazardous": False,
        "default_hazard": "none",
        "safety_note": "Clean bottles and dry film fetch higher prices. Crush PET bottles before bundling.",
        "sub_categories": {
            "pet_bottle": {"sub_name": "PET Bottle", "avg_rate": 28.0, "min_rate": 24.0, "max_rate": 32.0},
            "mixed_plastic": {"sub_name": "Mixed Plastic", "avg_rate": 18.0, "min_rate": 15.0, "max_rate": 22.0},
            "hard_plastic": {"sub_name": "Hard Plastic", "avg_rate": 22.0, "min_rate": 18.0, "max_rate": 26.0},
            "soft_plastic_film": {"sub_name": "Soft Plastic Film", "avg_rate": 14.0, "min_rate": 10.0, "max_rate": 18.0},
        },
        "epr_hint": "Plastic Waste Management Rules",
    },
    "METAL_FERROUS": {
        "group_code": "METAL_FERROUS",
        "parent_name": "Metal — Ferrous",
        "is_hazardous": False,
        "default_hazard": "none",
        "safety_note": "Handle sharp metal edges with protective work gloves.",
        "sub_categories": {
            "iron": {"sub_name": "Iron / Cast Iron", "avg_rate": 32.0, "min_rate": 28.0, "max_rate": 36.0},
            "steel": {"sub_name": "Steel / Structural Steel", "avg_rate": 38.0, "min_rate": 34.0, "max_rate": 44.0},
            "tin": {"sub_name": "Tin Containers / Dabba", "avg_rate": 24.0, "min_rate": 20.0, "max_rate": 28.0},
        },
        "epr_hint": None,
    },
    "METAL_NONFERROUS": {
        "group_code": "METAL_NONFERROUS",
        "parent_name": "Metal — Non-Ferrous",
        "is_hazardous": False,
        "default_hazard": "none",
        "safety_note": "High market value secondary raw materials. Test with magnet to verify non-magnetic composition.",
        "sub_categories": {
            "aluminium": {"sub_name": "Aluminium", "avg_rate": 160.0, "min_rate": 140.0, "max_rate": 180.0},
            "copper": {"sub_name": "Copper (Pure Heavy)", "avg_rate": 680.0, "min_rate": 630.0, "max_rate": 740.0},
            "copper_wire_insulated": {"sub_name": "Copper Wire Insulated", "avg_rate": 420.0, "min_rate": 380.0, "max_rate": 470.0},
            "brass": {"sub_name": "Brass / Peetal", "avg_rate": 440.0, "min_rate": 400.0, "max_rate": 480.0},
        },
        "epr_hint": None,
    },
    "GLASS": {
        "group_code": "GLASS",
        "parent_name": "Glass",
        "is_hazardous": False,
        "default_hazard": "none",
        "safety_note": "Handle in cartons or crates to prevent puncture wounds.",
        "sub_categories": {
            "glass_bottle": {"sub_name": "Glass Bottle", "avg_rate": 4.0, "min_rate": 2.5, "max_rate": 6.0},
            "broken_mixed_glass": {"sub_name": "Broken Mixed Glass", "avg_rate": 2.0, "min_rate": 1.0, "max_rate": 3.0},
        },
        "epr_hint": None,
    },
    "TEXTILE": {
        "group_code": "TEXTILE",
        "parent_name": "Textile / Cloth",
        "is_hazardous": False,
        "default_hazard": "none",
        "safety_note": "Sort pure cotton from synthetic fibers for yarn and wiping rag production.",
        "sub_categories": {
            "cotton_cloth": {"sub_name": "Cotton Cloth", "avg_rate": 12.0, "min_rate": 8.0, "max_rate": 16.0},
            "mixed_fabric_rags": {"sub_name": "Mixed Fabric Rags", "avg_rate": 6.0, "min_rate": 4.0, "max_rate": 9.0},
        },
        "epr_hint": None,
    },
    "RUBBER_OTHER": {
        "group_code": "RUBBER_OTHER",
        "parent_name": "Rubber & Other",
        "is_hazardous": False,
        "default_hazard": "none",
        "safety_note": "Route tyres to authorized pyrolysis or crumb rubber facilities.",
        "sub_categories": {
            "tyre": {"sub_name": "Tyre (Two/Four Wheeler)", "avg_rate": 8.0, "min_rate": 5.0, "max_rate": 12.0},
            "misc_other": {"sub_name": "Misc Other Scrap", "avg_rate": 5.0, "min_rate": 3.0, "max_rate": 8.0},
        },
        "epr_hint": None,
    },
}

# Backward compatibility lookup map for legacy category codes
LEGACY_CATEGORY_MAP = {
    ("WHOLE_DEVICE", "refrigerator"): ("LARGE_APPLIANCE", "refrigerator"),
    ("WHOLE_DEVICE", "ac_unit"): ("LARGE_APPLIANCE", "air_conditioner"),
    ("WHOLE_DEVICE", "washing_machine"): ("LARGE_APPLIANCE", "washing_machine"),
    ("WHOLE_DEVICE", "laptop"): ("COMPUTING", "laptop"),
    ("WHOLE_DEVICE", "mobile_phone"): ("MOBILE", "smartphone"),
    ("WHOLE_DEVICE", "crt_tv"): ("DISPLAY", "crt"),
    ("WHOLE_DEVICE", "led_tv"): ("DISPLAY", "television"),
    ("WHOLE_DEVICE", "small_kitchen_appliance"): ("SMALL_APPLIANCE", "mixer"),
    ("CRT", "tv_crt"): ("DISPLAY", "crt"),
    ("CRT", "monitor_crt"): ("DISPLAY", "monitor"),
    ("CRT", "crt_glass_only"): ("DISPLAY", "crt"),
    ("LCD_LED_PANEL", "tv_panel"): ("DISPLAY", "television"),
    ("LCD_LED_PANEL", "monitor_panel"): ("DISPLAY", "monitor"),
    ("LCD_LED_PANEL", "laptop_panel"): ("DISPLAY", "monitor"),
    ("CABLE_WIRE", "copper_wire"): ("CABLE", "copper_cable"),
    ("CABLE_WIRE", "usb_data_cable"): ("CABLE", "data_cable"),
    ("CABLE_WIRE", "mixed_wire"): ("CABLE", "power_cable"),
    ("CABLE_WIRE", "aluminium_wire"): ("CABLE", "power_cable"),
    ("MOTOR_MAGNET", "small_appliance_motor"): ("SMALL_APPLIANCE", "fan"),
    ("MOTOR_MAGNET", "compressor_motor"): ("LARGE_APPLIANCE", "refrigerator"),
    ("MOTOR_MAGNET", "hdd_speaker_magnet"): ("COMPUTING", "mouse"),
    ("METAL_SCRAP", "copper_scrap"): ("METAL_NONFERROUS", "copper"),
    ("METAL_SCRAP", "aluminium_scrap"): ("METAL_NONFERROUS", "aluminium"),
    ("METAL_SCRAP", "iron_steel_scrap"): ("METAL_FERROUS", "iron"),
    ("BATTERY", "li_ion_mobile_laptop"): ("BATTERY", "lithium_ion"),
    ("BATTERY", "lead_acid_ups_inverter_auto"): ("BATTERY", "lead_acid"),
    ("PCB", "computer_motherboard"): ("PCB", "motherboard"),
    ("PCB", "mobile_pcb"): ("PCB", "other_pcb"),
}

def get_benchmark_pricing(parent_code: str, sub_code: str) -> Dict[str, float]:
    if (parent_code, sub_code) in LEGACY_CATEGORY_MAP:
        parent_code, sub_code = LEGACY_CATEGORY_MAP[(parent_code, sub_code)]
    cat = MATERIAL_TAXONOMY.get(parent_code, {})
    sub = cat.get("sub_categories", {}).get(sub_code)
    if sub:
        return {
            "min_rate": sub["min_rate"],
            "avg_rate": sub["avg_rate"],
            "max_rate": sub["max_rate"],
        }
    return {"min_rate": 20.0, "avg_rate": 35.0, "max_rate": 50.0}