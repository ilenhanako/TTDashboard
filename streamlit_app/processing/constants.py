"""
Shared constants for DALY data processing.
Extracted from categorise_daly_country.py and categorise_daly_global.py
"""

# Target countries for analysis
TARGET_COUNTRIES = [
    "Bangladesh", "Brunei Darussalam", "Cambodia", "China", "India",
    "Indonesia", "Japan", "Lao People's Democratic Republic", "Malaysia",
    "Myanmar", "Philippines", "Republic of Korea", "Singapore", "Thailand", "Viet Nam",
]

# Short display names for countries
COUNTRY_SHORT_NAMES = {
    "Lao People's Democratic Republic": "Lao PDR",
    "Republic of Korea": "South Korea",
    "Brunei Darussalam": "Brunei",
    "Thailand": "Thailand",
    "Viet Nam": "Vietnam",
}

# Disease categories for dashboard (no Unclassified - all data should be categorized)
DISEASE_CATEGORIES = [
    "Infectious & Parasitic",
    "Maternal, Perinatal & Nutritional",
    "Noncommunicable Diseases",
    "Injuries",
    "Mental & Substance Disorders",
    "Substance Abuse",
    "Others",
]

# Short names for categories
CATEGORY_SHORT_NAMES = {
    "Infectious & Parasitic": "Infectious",
    "Maternal, Perinatal & Nutritional": "MPNc",
    "Noncommunicable Diseases": "NCDs",
    "Injuries": "Injuries",
    "Mental & Substance Disorders": "Mental",
    "Substance Abuse": "Substance",
    "Others": "Others",
}

# Color scheme matching the HTML dashboard
COLORS = {
    "Infectious & Parasitic": "#4472C4",
    "Maternal, Perinatal & Nutritional": "#C00000",
    "Noncommunicable Diseases": "#70AD47",
    "Injuries": "#FFC000",
    "Mental & Substance Disorders": "#7030A0",
    "Substance Abuse": "#9B59B6",
    "Others": "#546E7A",
}

# Age group colors
AGE_COLORS = [
    "#ef4444",  # 0-4 (red)
    "#f97316",  # 5-14 (orange)
    "#eab308",  # 15-29 (yellow)
    "#22c55e",  # 30-49 (green)
    "#06b6d4",  # 50-59 (cyan)
    "#3b82f6",  # 60-69 (blue)
    "#8b5cf6",  # 70+ (purple)
]

# Age groups
AGE_GROUPS = ["0-4", "5-14", "15-29", "30-49", "50-59", "60-69", "70+"]

# World average DALY rate per 1,000 population (approximate)
WORLD_DALY_RATE = 380.0

# MPNc focused countries
MPNC_FOCUSED_COUNTRIES = [
    "Cambodia", "China", "India", "Indonesia",
    "Lao People's Democratic Republic", "Philippines", "Viet Nam",
]

# MPNc GHE codes and labels
MPNC_GHE_LABELS = {
    420:  "Maternal conditions",
    490:  "Neonatal conditions",
    500:  "Preterm birth complications",
    510:  "Birth asphyxia and birth trauma",
    520:  "Neonatal sepsis and infections",
    530:  "Other neonatal conditions",
    540:  "Nutritional deficiencies",
    550:  "Protein-energy malnutrition",
    560:  "Iodine deficiency",
    570:  "Vitamin A deficiency",
    580:  "Iron-deficiency anaemia",
    590:  "Other nutritional deficiencies",
    1505: "Sudden infant death syndrome",
}

MPNC_DISPLAY_ORDER = [420, 490, 500, 510, 520, 530, 540, 550, 560, 570, 580, 590, 1505]

# GHE code to label mapping
GHE_LABEL_MAP = {
    0:    (None,  'All Causes',   None, None),
    10:   (None,  'Communicable, maternal, perinatal and nutritional conditions', None, None),
    20:   (None,  'A.',  'Infectious and parasitic diseases', None),
    30:   (None,  None,  None,   'Tuberculosis'),
    40:   (None,  None,  None,   'STDs excluding HIV'),
    100:  (None,  None,  None,   'HIV/AIDS'),
    110:  (None,  None,  None,   'Diarrhoeal diseases'),
    120:  (None,  None,  None,   'Childhood-cluster diseases'),
    170:  (None,  None,  None,   'Meningitis'),
    180:  (None,  None,  None,   'Encephalitis'),
    185:  (None,  None,  None,   'Hepatitis'),
    210:  (None,  None,  None,   'Parasitic and vector diseases'),
    220:  (None,  None,  None,   'Malaria'),
    300:  (None,  None,  None,   'Dengue'),
    330:  (None,  None,  None,   'Intestinal nematode infections'),
    365:  (None,  None,  None,   'Leprosy'),
    370:  (None,  None,  None,   'Other infectious diseases'),
    380:  (None,  None,  None,   'Respiratory Infectious'),
    420:  (None,  None,  None,   'Maternal Conditions'),
    500:  (None,  None,  None,   'Preterm birth complications'),
    510:  (None,  None,  None,   'Birth asphyxia and birth trauma'),
    520:  (None,  None,  None,   'Neonatal sepsis and infections'),
    530:  (None,  None,  None,   'Other neonatal conditions'),
    550:  (None,  None,  None,   'Protein-energy malnutrition'),
    560:  (None,  None,  None,   'Iodine deficiency'),
    570:  (None,  None,  None,   'Vitamin A deficiency'),
    580:  (None,  None,  None,   'Iron-deficiency anaemia'),
    590:  (None,  None,  None,   'Other nutritional deficiencies'),
    600:  (None,  'C.',  'Noncommunicable diseases', None),
    610:  (None,  None,  None,   'Malignant neoplasms'),
    790:  (None,  None,  None,   'Other neoplasms'),
    800:  (None,  None,  None,   'Diabetes mellitus'),
    810:  (None,  None,  None,   'Endocrine, blood, immune disorders'),
    830:  (None,  None,  None,   'Depressive Disorders'),
    860:  (None,  None,  None,   'Alcohol use disorders'),
    870:  (None,  None,  None,   'Drug use disorders'),
    880:  (None,  None,  None,   'Anxiety disorders'),
    890:  (None,  None,  None,   'Eating disorders'),
    911:  (None,  None,  None,   'Attention deficit/hyperactivity syndrome'),
    912:  (None,  None,  None,   'Conduct disorder'),
    940:  (None,  None,  None,   'Neurological conditions'),
    1020: (None,  None,  None,   'Sense organ diseases'),
    1100: (None,  None,  None,   'Cardiovascular diseases'),
    1140: (None,  None,  None,   'Stroke'),
    1180: (None,  None,  None,   'Chronic obstructive pulmonary disease'),
    1190: (None,  None,  None,   'Asthma'),
    1200: (None,  None,  None,   'Other respiratory diseases'),
    1210: (None,  None,  None,   'Digestive diseases'),
    1260: (None,  None,  None,   'Genitourinary diseases'),
    1330: (None,  None,  None,   'Skin diseases'),
    1340: (None,  None,  None,   'Musculoskeletal diseases'),
    1470: (None,  None,  None,   'Oral conditions'),
    1505: (None,  None,  None,   'Sudden infant death syndrome'),
    1510: (None,  'D.',  'Injuries incl War', None),
    1520: (None,  None,  None,   'Unintentional injuries'),
    1610: (None,  None,  None,   'Self-harm'),
    1620: (None,  None,  None,   'Interpersonal violence'),
    1630: (None,  None,  None,   'Collective violence and legal intervention'),
    1700: (None,  None,  None,   'Other COVID-19 pandemic-related outcomes'),
}

# Categories with a single parent GHE code (use directly, don't sum children)
CATEGORY_PARENT_CODES = {
    "Infectious & Parasitic": 20,
    "Injuries": 1510,
}

# Categories without a parent code (need to sum leaf codes)
CATEGORY_LEAF_CODES = {
    "Maternal, Perinatal & Nutritional": [420, 500, 510, 520, 530, 550, 560, 570, 580, 590, 1505],
    "Mental & Substance Disorders": [830, 880, 890, 910, 1610],  # 910 = childhood behavioural (911+912)
    "Substance Abuse": [860, 870],
    "Others": [40, 100, 365, 810, 940, 1020, 1210, 1260, 1330, 1340, 1470],
}

# NCD needs special handling: code 600 minus Mental, SA, and Others that are under NCD
NCD_PARENT_CODE = 600
NCD_EXCLUDED_CODES = [
    # Mental codes (shown separately)
    830, 880, 890, 910, 1610,
    # Substance Abuse codes (shown separately)
    860, 870,
    # Others codes that are under NCD (shown in Others category)
    810, 940, 1020, 1210, 1260, 1330, 1340, 1470,
]

# GHE codes that were intentionally removed from the categorized data
# These must be subtracted from Total DALYs (code 0) for correct percentages
EXCLUDED_FROM_TOTAL_CODES = [
    840,   # Bipolar Disorder
    850,   # Schizophrenia
    900,   # Autism and Asperger Syndrome
    920,   # Idiopathic intellectual disability
    930,   # Other mental and behavioural disorders
    1400,  # Congenital anomalies
]

# Map GHE codes to disease categories (for sub-disease lookups)
GHE_TO_CATEGORY = {
    # Infectious & Parasitic (children of code 20)
    30: "Infectious & Parasitic",  # Tuberculosis
    110: "Infectious & Parasitic",  # Diarrhoeal
    120: "Infectious & Parasitic",  # Childhood-cluster
    170: "Infectious & Parasitic",  # Meningitis
    180: "Infectious & Parasitic",  # Encephalitis
    185: "Infectious & Parasitic",  # Hepatitis
    210: "Infectious & Parasitic",  # Parasitic
    220: "Infectious & Parasitic",  # Malaria
    300: "Infectious & Parasitic",  # Dengue
    330: "Infectious & Parasitic",  # Intestinal nematode
    370: "Infectious & Parasitic",  # Other infectious
    380: "Infectious & Parasitic",  # Respiratory Infectious
    1700: "Infectious & Parasitic",  # COVID-19

    # Maternal, Perinatal & Nutritional (leaf codes, summed for total)
    420: "Maternal, Perinatal & Nutritional",  # Maternal
    500: "Maternal, Perinatal & Nutritional",  # Preterm
    510: "Maternal, Perinatal & Nutritional",  # Birth asphyxia
    520: "Maternal, Perinatal & Nutritional",  # Neonatal sepsis
    530: "Maternal, Perinatal & Nutritional",  # Other neonatal
    550: "Maternal, Perinatal & Nutritional",  # Protein-energy malnutrition
    560: "Maternal, Perinatal & Nutritional",  # Iodine deficiency
    570: "Maternal, Perinatal & Nutritional",  # Vitamin A
    580: "Maternal, Perinatal & Nutritional",  # Iron-deficiency
    590: "Maternal, Perinatal & Nutritional",  # Other nutritional
    1505: "Maternal, Perinatal & Nutritional",  # SIDS

    # Noncommunicable Diseases (children of code 600)
    610: "Noncommunicable Diseases",  # Malignant neoplasms
    790: "Noncommunicable Diseases",  # Other neoplasms
    800: "Noncommunicable Diseases",  # Diabetes
    1100: "Noncommunicable Diseases",  # Cardiovascular
    1140: "Noncommunicable Diseases",  # Stroke
    1180: "Noncommunicable Diseases",  # COPD
    1190: "Noncommunicable Diseases",  # Asthma
    1200: "Noncommunicable Diseases",  # Other respiratory

    # Injuries (children of code 1510)
    1520: "Injuries",  # Unintentional
    1620: "Injuries",  # Interpersonal violence
    1630: "Injuries",  # Collective violence

    # Mental & Substance Disorders (leaf codes, summed for total)
    830: "Mental & Substance Disorders",  # Depressive
    880: "Mental & Substance Disorders",  # Anxiety
    890: "Mental & Substance Disorders",  # Eating disorders
    911: "Mental & Substance Disorders",  # ADHD
    912: "Mental & Substance Disorders",  # Conduct
    1610: "Mental & Substance Disorders",  # Self-harm

    # Substance Abuse (leaf codes, summed for total)
    860: "Substance Abuse",  # Alcohol
    870: "Substance Abuse",  # Drug use

    # Others (leaf codes, summed for total)
    40: "Others",  # STDs
    100: "Others",  # HIV/AIDS
    365: "Others",  # Leprosy
    810: "Others",  # Endocrine
    940: "Others",  # Neurological
    1020: "Others",  # Sense organ
    1210: "Others",  # Digestive
    1260: "Others",  # Genitourinary
    1330: "Others",  # Skin
    1340: "Others",  # Musculoskeletal
    1470: "Others",  # Oral
}

# Sub-disease mappings for each category
CATEGORY_SUB_DISEASES = {
    "Infectious & Parasitic": {
        "Tuberculosis": 30,
        "Diarrhoeal Diseases": 110,
        "Malaria": 220,
        "Dengue": 300,
        "Hepatitis": 185,
        "Respiratory Infections": 380,
        "Meningitis": 170,
        "Encephalitis": 180,
        "Other Infectious": 370,
        "COVID-19": 1700,
    },
    "Maternal, Perinatal & Nutritional": {
        "Maternal Conditions": 420,
        "Preterm Birth": 500,
        "Birth Asphyxia": 510,
        "Neonatal Sepsis": 520,
        "Other Neonatal": 530,
        "Protein-Energy Malnutrition": 550,
        "Iron Deficiency Anaemia": 580,
        "Other Nutritional": 590,
    },
    "Noncommunicable Diseases": {
        "Diabetes": 800,
        "Cardiovascular (excl Stroke)": 1100,
        "Stroke": 1140,
        "COPD": 1180,
        "Asthma": 1190,
        "Neoplasms": 610,
    },
    "Injuries": {
        "Unintentional Injuries": 1520,
        "Interpersonal Violence": 1620,
        "Collective Violence": 1630,
    },
    "Mental & Substance Disorders": {
        "Self-Harm": 1610,
        "Depressive Disorders": 830,
        "Anxiety Disorders": 880,
        "Eating Disorders": 890,
        "ADHD": 911,
        "Conduct Disorder": 912,
    },
    "Substance Abuse": {
        "Alcohol Use": 860,
        "Drug Use": 870,
    },
    "Others": {
        "HIV/AIDS": 100,
        "STDs": 40,
        "Leprosy": 365,
        "Neurological": 940,
        "Digestive Diseases": 1210,
        "Genitourinary": 1260,
        "Skin Diseases": 1330,
        "Musculoskeletal": 1340,
        "Sense Organ Diseases": 1020,
        "Oral Conditions": 1470,
    },
}

# Years available in the data
AVAILABLE_YEARS = ["2000", "2010", "2015", "2019", "2020", "2021"]

# Global columns in the raw global file
GLOBAL_COLUMNS = [
    ("Both sexes", "Total"),
    ("Male",       "Total"),
    ("Female",     "Total"),
    ("Male",       "0-28 days"),
    ("Male",       "1-59 months"),
    ("Male",       "5-14"),
    ("Male",       "15-29"),
    ("Male",       "30-49"),
    ("Male",       "50-59"),
    ("Male",       "60-69"),
    ("Male",       "70+"),
    ("Female",     "0-28 days"),
    ("Female",     "1-59 months"),
    ("Female",     "5-14"),
    ("Female",     "15-29"),
    ("Female",     "30-49"),
    ("Female",     "50-59"),
    ("Female",     "60-69"),
    ("Female",     "70+"),
]

# Country income groups
COUNTRY_INCOME_GROUPS = {
    "Bangladesh":                         4,
    "Brunei Darussalam":                  1,
    "Cambodia":                           4,
    "China":                              4,
    "India":                              4,
    "Indonesia":                          4,
    "Japan":                              1,
    "Lao People's Democratic Republic":   4,
    "Malaysia":                           3,
    "Myanmar":                            4,
    "Philippines":                        2,
    "Republic of Korea":                  1,
    "Singapore":                          1,
    "Thailand":                           3,
    "Viet Nam":                           4,
}
